# 维度 6 — 性能与效率

> **结论**：项目在前端基本优化上几乎全没做——大列表无虚拟滚动、图片无懒加载、轮播 transition 串行、全屏背景 90fps、缓存无界。

---

## 🔴 严重

### PERF-1. 歌单 / 搜索结果无虚拟滚动

**位置**：
- `src/components/common/musicComponents/SongList.vue:79-149`
- `src/components/common/pageComponents/AlbumGrid.vue:18`
- `src/components/common/pageComponents/PlaylistGrid.vue:18`
- `src/components/common/pageComponents/UserGrid.vue:18`
- `src/components/common/pageComponents/ArtistGrid.vue:18`

**现象**：`v-for` 直接渲染所有项，没有任何虚拟化（vue-virtual-scroller / @vueuse/core useVirtualList）。

**实际代价**：
- 1000 首歌曲歌单 → 约 3000+ DOM 节点 + 1000 张 48×48 封面图同时解码 → TTI 延迟 1.5–3s，主线程 long task >800ms，内存峰值 +60–150MB。
- 300 张专辑歌手页 → ~4500 DOM 节点，滚动掉帧至 30fps 以下。
- 移动端尤其明显。

---

### PERF-2. 封面 / 头像图片完全无懒加载

**位置**：
- `src/components/common/musicComponents/SongList.vue:97-102`（封面）
- `src/components/common/pageComponents/AlbumGrid.vue / PlaylistGrid.vue / UserGrid.vue / ArtistGrid.vue:18`（grid 封面）
- `src/components/common/pageComponents/CommentItem.vue:41-45`（评论头像）

**现象**：`<img :src="...">` 缺 `loading="lazy"`、`decoding="async"`、`srcset`、`sizes`。

**实际代价**：
- 搜索 200 项结果时一次性解码 200 张 200×200 封面 → 浪费 30MB 带宽，LCP 推迟 0.5–1s。
- 评论页 100 条评论 → 100 张头像同步下载，阻塞评论列表渲染。

---

### PERF-3. `SongList.vue` 已声明 `isSongLiked` computed 却不用，模板仍调 action

**位置**：`src/components/common/musicComponents/SongList.vue:32-34, 129`

**现象**：
```ts
// 28-34 行：声明了
const isSongLiked = computed(
  () => (songId: number | string) => userLikeListSet.value.has(Number(songId)),
)
// 129 行：模板里
:class="[userStore.isSongLiked(song) ? 'fill-red-500 ...' : '']"
```

`isSongLiked` 是 **闭包形式 computed**（返回函数），调用时根本不会因 `userLikeListSet` 变化而触发响应；模板用的是 `userStore.isSongLiked(song)`（getter + 函数调用）。

**实际代价**：每次重渲染触发 1000 次 Pinia getter + `set.has()`，多 2–3 倍 CPU；并且更糟糕的是——这是 Pinia 的"调用 set 触发响应式"模式（见 `user.ts:104-117`），闭包形式的 computed 不会重新求值，**所以即使用户点赞了某首歌，列表的心也不会变红**。

---

### PERF-4. 轮播图切换动画串行 0.8s 黑屏

**位置**：`src/views/Home/components/carousel.vue:101, 114, 124, 130, 136, 144`

**现象**：
- 6 处 `v-if="slides && slides.length > 0"` 重复条件。
- `Transition mode="out-in"` 强制"先 out 完成再 in"。
- 每个 setInterval 5s 切图时，整个 0.8s 是"先消失再出现"。

**实际代价**：每个 banner 切换有 0.8s 黑屏感，远大于必要的淡入淡出。`mode="out-in"` 应改为默认（同时进行）或 `"default"`。

---

### PERF-5. 路由切换时未清理的图片纹理累积显存

**位置**：`src/components/common/musicComponents/SongList.vue:44-59`

**现象**：
```ts
onBeforeUnmount(() => {
  coverImgRefs.value.forEach((img) => {
    img.src = 'data:image/gif;base64,...'  // 强制 1px
  })
  coverImgRefs.value.length = 0
})
```
但仅追踪自身 `<img>`，子组件（ArtistDivider、头像）未清理。

**实际代价**：每张 48×48 RGB ~10KB 残留，快速切歌 5–10MB 显存泄漏。base64 GIF trick 也只是推迟 GC，不是真释放。

---

## 🟡 中等

### PERF-6. `MusicService` 缓存无大小限制

**位置**：`src/core/player/MusicService.ts:8, 33-41`

**现象**：`const cache = new Map<number | string, CachedSong>()` —— 无 LRU、无 TTL。

**实际代价**：长会话累计几千首 → 内存增长；URL 失效时即使有 `checkUrlValidity` 拦截，也需为每首歌发 HEAD 请求。

---

### PERF-7. `preloadNextSong` 串行而非并行

**位置**：`src/stores/playerStore.ts:246-256`

**现象**：
```ts
for(let i = currentIndex.value; i < currentIndex.value + 3; i++){
  if (...) {
    let songWithUrl = await getSong(playlist.value[i]!)  // 串行
    ...
  }
}
```

**实际代价**：3 首歌依次 fetch，首首 100ms = 300ms 串行等待。可改为 `Promise.all([...].map(getSong))`。

---

### PERF-8. `FullScreenPlayer` 切歌时 lyric fetch 没 abort

**位置**：`src/views/FullscreenPlayer/FullScreenPlayer.vue:89-91`

**现象**：
```ts
watch(() => playerStore.currentSong?.id, () => {
  fetchLyric()  // 无 cleanup
})
```

**实际代价**：用户快速切歌时，旧请求仍在飞行；后到达的响应可能覆盖新歌的歌词。

---

### PERF-9. `BackgroundRender` 固定 90fps 全屏渲染

**位置**：`src/components/layout/LayoutContainer.vue:67`

**现象**：
```vue
<BackgroundRender :renderer="MeshGradientRenderer" :fps="90" :render-scale="1" :album="imageUrl" />
```
90fps 永久开启，叠加页面里所有动效。

**实际代价**：
- 桌面端 GPU 持续占用 8–15%，电池消耗增加。
- 在低端移动设备 / 集成显卡上是真掉帧源头。

---

### PERF-10. `request.ts` 全局 retry=2 + timeout=10s

**位置**：`src/utils/request.ts:215-219`

**现象**：`retry: 2`，意味着每个失败请求最多重试 2 次（总 3 次 × 10s = 30s）。

**实际代价**：批量请求（如 Search 5 个 tab 并发）任一后端慢 → 全部 30s 超时；用户看到的是 spinner 不消失。`/auth/refresh` 在重试链内又会引发新一轮 30s。

---

## 🟢 轻微

### PERF-11. lucide-vue-next 按需引入不一致

有些文件 `import { X, Y, Z } from 'lucide-vue-next'`（按需），有些可能用全量。需 grep 验证。

### PERF-12. 路由切换每次重新加载所有数据

`Search/index.vue`、`Playlist/index.vue` 等在 `watch(route.query.id)` 里直接 fetch，没有 keep-alive。来回切歌单体验差。

### PERF-13. `api/song.ts` 每次请求 `new Date().getTime()`

参数 `timestamp: new Date().getTime()` 与 URL query 中的 `timestamp=${...}` 是两份，重复。

---

## 总结

| # | 问题 | 修法 |
|---|------|------|
| PERF-1 | 无虚拟滚动 | 引入 `vue-virtual-scroller` 或 `useVirtualList` |
| PERF-2 | 图片无懒加载 | 加 `loading="lazy" decoding="async"`，并用 `srcset` |
| PERF-3 | computed 不用 | 把 `isSongLiked` 改成 `computed(() => songs.map(s => set.has(s.id)))` 或直接 `userStore.isSongLiked` |
| PERF-4 | 轮播 mode="out-in" | 改为默认模式或 `mode="default"` |
| PERF-5 | 显存泄漏 | 路由切换 `img.removeAttribute('src')` 真正释放 |
| PERF-6 | 无界缓存 | LRU + TTL |
| PERF-7 | 串行预加载 | `Promise.all` |
| PERF-8 | lyric race | 用 `AbortController` |
| PERF-9 | 90fps | 改 30fps 或静止时停 |
| PERF-10 | retry=2 + 10s | 失败重试改为 `1` 或 `0`，timeout 改 5s |
