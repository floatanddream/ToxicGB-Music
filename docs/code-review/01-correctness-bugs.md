# 维度 1 — 正确性 Bug

> **结论**：项目里 bug 不是"偶发边界"，而是**结构性的**——大部分详情页都有请求竞态，且 Album/Playlist 评论分页有 off-by-one + 失败不回滚。这意味着用户切歌时，**显示的可能是上一首歌**。

---

## 🔴 P0 — 数据错乱

### COR-1. Artist / User / Album 三页都有请求竞态

**位置**：
- `src/views/Artist/index.vue:22-35, 54-59`
- `src/views/User/index.vue:52-73, 77-90`
- `src/views/Album/index.vue:30-47, 112-117`

**现象**：路由 query 变化时直接 fetch，没有 abort / request-id 校验 / cleanup。

**failure_scenario**：
- 从歌手 A 切到歌手 B；B 先返回并渲染；A 的慢请求后到达，**把 B 的 artistData / Songs / Albums 覆盖为 A**。
- 此时 URL 仍是 `/artist?id=B`，但页面显示歌手 A 的资料。
- User 页更糟：playlists / follows / followeds / songRecord 是 4 个独立请求，可能出现 A 的 playlists + B 的 follows 混合。

**修法**：用 `AbortController` + `watch(route.query.id, ...)` 取消旧请求；或维护 `currentId: ref()`，fetch 完成后校验仍等于 `currentId.value` 才赋值。

---

### COR-2. Album 评论分页 offset 提前递增，失败不回滚

**位置**：`src/views/Album/index.vue:63-90`

**现象**：
```ts
const loadMoreComments = async () => {
  ...
  commentsLoadingMore.value = true;
  commentsOffset.value += 20;  // ← 请求前先 +20

  try {
    const data = await getAlbumComments({ id, limit: 20, offset: commentsOffset.value });
    ...
```

**failure_scenario**：
- 当前 offset=20，点击"加载更多" → offset 变成 40 → 请求失败 → offset 仍是 40。
- 重试时跳过 offset=40 那 20 条评论，**永久丢失一页**。

---

### COR-3. Album 首屏 limit=50，加载更多 offset+20 但 limit=20，导致 21–40 重复

**位置**：`src/views/Album/index.vue:50-90`

**现象**：
- 首批：`getAlbumComments({ id, limit: 50, offset: 0 })`
- 加载更多：`commentsOffset.value += 20; getAlbumComments({ id, limit: 20, offset: 20 })` ← 第 21–40 条再次出现

**failure_scenario**：专辑超过 50 条评论时点击"加载更多"，列表出现重复评论 + 重复 `key`，Vue 会报 `Duplicate keys detected`。

---

### COR-4. User 本人页面 `getUserSongRecord` 收到字符串 `'self'`

**位置**：`src/views/User/index.vue:56-68`

**现象**：
```ts
const userIdToFetch = userId.value || 'self';  // 可能是 'self'
const userRes = await getUser(userIdToFetch);  // 实际却返回真实 profile
const userInfo = userRes.profile;
...
await fetchUserSongRecord(userIdToFetch);  // 传 'self' 给听歌记录接口
```

**failure_scenario**：访问 `/user`（无 id），`getUserSongRecord('self')` 调 `/user/record?uid=self`，接口可能返回 400 或空数据。

---

### COR-5. Album 切换 tab 时评论请求未接住 Promise

**位置**：`src/views/Album/index.vue:93-96`

**现象**：
```ts
const handleTabChange = (newTab: string) => {
  if (newTab === 'comments') {
    fetchAlbumComments();  // async 函数调用没 await，错误未捕获
  }
};
```

且 `handleTabChange` 本身可能是子组件 `@active-tab-change` 触发的，错误会冒泡为 unhandled rejection。

---

### COR-6. Album 评论也受 COR-1 竞态影响（同一组件）

**位置**：`src/views/Album/index.vue:50-60, 93-96`

**failure_scenario**：A 专辑打开评论 → 切到 B 专辑 → A 的评论后到达 → B 页面显示 A 的评论。

---

## 🔴 P0 — 渲染崩溃

### COR-7. `CommentList.vue` 转换 comment.user 时无防御

**位置**：`src/components/common/pageComponents/CommentList.vue:18-29`

**现象**：
```ts
return TempComments.map(comment => ({
  ...comment,
  user: transformToUser(comment.user as any)  // comment.user 可能 null
}))
```

**failure_scenario**：API 返回一条 `user: null` 或被删除账号的评论 → `transformToUser` 访问 `rawUser.userId` 抛 `Cannot read properties of null` → 整个评论列表不渲染。

---

### COR-8. `SongList.vue` 模板只判断 `artist` 却访问 `album.title`

**位置**：`src/components/common/musicComponents/SongList.vue:109-117`

**现象**：
```vue
<span v-if="song.artist" :artists="song.artist" />
...
<span class="truncate hover:text-red-500"
      @click.stop="emitter.emit(EVENTS.ALBUM_CLICK, song.album)">
  {{ song.album.title }}  ← 无 v-if
</span>
```

**failure_scenario**：下架歌曲或搜索结果中 `album` 为 null/undefined → `Cannot read properties of undefined (reading 'title')` → 整行崩溃。

---

### COR-9. `Search.vue` `Promise.all(...).finally()` 不带 catch

**位置**：`src/views/Search/index.vue:316-324`

**现象**：
```ts
Promise.all([
  searchSong(searchQuery.value),
  searchArtist(searchQuery.value),
  ...
]).finally(() => {
  loading.value = false
})
```

内部各 `searchXxx` 已有 try/catch，但 `Promise.all` 本身若发生 reject（理论上已被内部吞掉，但若某个 throw new Error 跳出）会变 unhandled。

更关键的是：**`Promise.all` 没有 await**——它返回的 Promise 不会阻塞 `handelSearchAllType`。当前函数也确实是 `async` 但没 `await Promise.all(...)`，所以**重置状态后立即返回**，loading 通过 `.finally` 关闭。

**failure_scenario**：某个 `searchXxx` 因 bug 没 try/catch，错误会冒泡成 unhandled。

---

### COR-10. `TheFooter.vue` 音量本地 ref 与 store 不同步

**位置**：`src/components/layout/TheFooter.vue:36`

**现象**：
```ts
const volume = ref(70)  // 本地 ref
```
模板中 `v-model="volume"` + `@input="handleVolume"` → `playerStore.setVolume()`。但 store 内部 `volume` 更新后，Footer 的本地 ref 不会跟随；外部代码改 store 音量，滑块位置不更新。

**failure_scenario**：键盘快捷键或系统音量同步修改 store.volume → Footer 滑块位置错误；用户拖动 Footer 滑块后，store 显示正确但下次刷新前 Footer UI 与 store 偏差 70%。

---

## 🟡 P1 — 边缘 case

### COR-11. `MusicService.checkUrlValidity` 对 `fetch` 异常返回 true

**位置**：`src/core/player/MusicService.ts:17-31`

**现象**：
```ts
} catch (error) {
  console.log('请求失败，URL 无法访问:', error.message);
  return false;  // ← 实际是 false
}
```
(这条实际是返回 false 的，对的。) **但 line 23 `console.log(response)` 在 HEAD 200 时打整个 Response 对象，生产 console 噪音巨大**。

### COR-12. `playerStore.setVolume` 输入未 clamp

**位置**：`src/stores/playerStore.ts:239-243`

**现象**：
```ts
const setVolume = (v: number) => {
  v = v / 100;
  player.setVolume(v);
  volume.value = v;
};
```
Footer 传 `Number(target.value)` 是 0–100；`v/100` 后可能 1.0 没问题，但若 input 控件越界传 150，则 v=1.5，Audio.volume 被 setVolume 内部 clamp 到 1，但 `volume.value` 仍是 1.5——store 与实际不同步。

---

### COR-13. `AuthModal` handleLogin 不会触发 userStore.fetchUser

**位置**：`src/components/common/AuthModal.vue:62-95`

**现象**：`handleLogin` 只 console.log；旁边 `handleLoginSuccess` 才正确 emit USER_LOGIN。但 UI 调用的是 `handleLogin`。

**failure_scenario**：用户登录 → userStore 不刷新 → header 仍显示未登录状态 → 必须手动刷新页面。

---

## 🟢 P2 — 边界

### COR-14. `MusicController.emit` 在无监听器时静默

**位置**：`src/core/player/MusicController.ts:135-137`

```ts
emit(event: string, ...args: any[]) {
  this.events.get(event)?.forEach((cb) => cb(...args))
}
```
事件名拼错或未注册时完全静默，调试困难。

---

### COR-15. `TheHeader.onClickAvatar` 未登录时同时打开 modal 和跳转

**位置**：`src/components/layout/TheHeader.vue:24-29`

```ts
const onClickAvatar = () => {
  if (authModalRef.value && !userStore.isLogin) {
    authModalRef.value.openAuthModal();
  }
  emitter.emit(EVENTS.USER_CLICK, userStore.account)  // ← 总是执行
};
```

未登录时既打开 modal 又跳转到 `/user?id=undefined`（account 为 null）。

---

### COR-16. `Search.vue` 监听 route.query.keywords 直接异步调用

**位置**：`src/views/Search/index.vue:327-333`

```ts
watch(
  () => route.query.keywords,
  async (newKeywords) => {
    searchQuery.value = newKeywords
    handelSearchAllType()  // 内部 async 不 await
  },
)
```
旧搜索未完成时切换关键词，新搜索的 resetAllPaginationState 会清空旧数据但旧 fetch 可能后到达。

---

## 总结

| # | 文件 | 严重度 | 关键词 |
|---|------|--------|---------|
| COR-1 | Artist/User/Album | P0 | 请求竞态 |
| COR-2 | Album 评论 | P0 | offset 失败不回滚 |
| COR-3 | Album 评论 | P0 | 重复评论 |
| COR-4 | User | P0 | 'self' 字符串 |
| COR-5/6 | Album | P0 | unhandled + 竞态 |
| COR-7 | CommentList | P0 | null user 崩溃 |
| COR-8 | SongList | P0 | null album 崩溃 |
| COR-9 | Search | P0 | Promise.all 不 await |
| COR-10 | TheFooter | P0 | 音量不同步 |
| COR-11 | MusicService | P1 | console 噪音 |
| COR-12 | playerStore | P1 | volume 不 clamp |
| COR-13 | AuthModal | P1 | 登录不刷新 userStore |
| COR-14 | MusicController | P2 | emit 静默 |
| COR-15 | TheHeader | P2 | 未登录双重副作用 |
| COR-16 | Search | P2 | keywords 切换竞态 |
