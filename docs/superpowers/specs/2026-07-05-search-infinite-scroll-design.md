# 搜索页无限滚动 — 设计文档

**日期：** 2026-07-05
**状态：** 已批准，进入实现阶段
**范围：** `src/views/Search/` + API + 新增通用包装组件

---

## Context

`src/views/Search/index.vue` 当前每个 tab（单曲 / 专辑 / 歌手 / 歌单 / 用户）只请求一次 100 条结果，从不追加加载。后端 API（NeteaseCloudMusicApi 风格）支持 `limit` / `offset` 分页，但 `src/api/search.ts` 把 `limit=100` 写死了，也完全没用 `offset`。

用户希望把 `SongList.vue` 里已经在用的无限滚动模式推广到全部 5 个 tab：用户滚到 loading spinner 时，自动请求下一页并追加。

## 需求（用户原话）

- **5 个 tab 全部支持**（单曲 / 专辑 / 歌手 / 歌单 / 用户）
- **每次请求 30 条**（`limit=30`，与 API 默认值一致）
- 用户滚到 spinner 出现时触发下一页
- 没有更多结果时显示**"没有更多了"**文字
- **不设上限** —— 一直加载到 API 返回空为止

## Non-Goals（明确不做）

- 综合（1018）tab —— `searchByKeyword` 是死代码，跳过
- 输入框 debounce —— 当前是 Enter 触发搜索，保持现状
- 把分页状态提到 Pinia —— 搜索是页面级临时状态，不进 store

---

## 设计

### §1 — 架构

```
┌─────────────────────────────────────────────────────────────┐
│ src/views/Search/index.vue                                  │
│                                                             │
│  state（每个 tab 一份 × 5）：                                │
│    searchSongData[]   songOffset   songHasMore   songLoading│
│    searchArtistData[] ...                                         │
│                                                             │
│  methods：                                                  │
│    handleSearch()         → 重置 5 个 tab                    │
│    loadMoreSongs()        → 拉下一页，追加                  │
│    loadMoreArtists() ...  → 每个 tab 一个                    │
└─────────────────────────────────────────────────────────────┘
                            │ props / events
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ <InfiniteScroll>                                            │
│   :loading    :has-more    @load-more                       │
│                                                             │
│   <slot>           ← 渲染父组件传入的列表                    │
│   <div ref="trigger"> ← IntersectionObserver 触发元素        │
│   <Loader2 v-if="loading" />                                │
│   <span v-else-if="!hasMore && !loading">没有更多了</span>  │
└─────────────────────────────────────────────────────────────┘
                            │ props
                            ▼
   SongList / ArtistGrid / AlbumGrid / PlaylistGrid / UserGrid
   （SongList 内部 observer 和 spinner 删掉，改成消费 <InfiniteScroll>）
```

### §2 — API 变更（`src/api/search.ts`）

5 个搜索函数都增加 `offset` 和 `limit` 参数。默认 `limit=30`、`offset=0`。

```typescript
// 改前
export const searchBySong = (keyword: string): Promise<any> =>
  http.get('/search', { searchParams: { keywords: keyword, type: 1, limit: 100 } })

// 改后
type SearchOptions = { limit?: number; offset?: number }
export const searchBySong = (keyword: string, opts: SearchOptions = {}): Promise<any> => {
  const { limit = 30, offset = 0 } = opts
  return http.get('/search', {
    searchParams: { keywords: keyword, type: 1, limit, offset }
  })
}
```

同样模式应用到 `searchByAlbum`（type 10）、`searchBySinger`（type 100）、`searchByPlaylist`（type 1000）、`searchByUser`（type 1002）。

`searchByKeyword`（type 1018）未被使用 —— **跳过**。

**`hasMore` 推导**：API 响应里的 `result.songCount` / `artistCount` / `albumCount` / `playlistCount` / `userprofileCount` 是总数（NeteaseCloudMusicApi 约定）。计算方式：

```typescript
const total = data.result?.songCount ?? 0
const hasMore = offset + fetched.length < total
```

如果 `total` 缺失或为 0，保守处理为 `hasMore = false`。

### §3 — 新组件：`<InfiniteScroll>`

**文件：** `src/components/common/InfiniteScroll.vue`

**Props：**
| Prop | 类型 | 默认 | 含义 |
|---|---|---|---|
| `loading` | `boolean` | `false` | 是否有请求在途 |
| `hasMore` | `boolean` | `true` | 是否还有下一页 |
| `rootMargin` | `string` | `'15%'` | IntersectionObserver rootMargin（跟 SongList 一致） |
| `threshold` | `number` | `1` | IntersectionObserver threshold |

**Emits：**
| 事件 | 触发时机 |
|---|---|
| `load-more` | Observer 看到 trigger 元素，且 `!loading && hasMore` |

**内部逻辑：**
```typescript
const trigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!trigger.value) return
  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0]
      if (entry?.isIntersecting && !props.loading && props.hasMore) {
        emit('load-more')
      }
    },
    { rootMargin: props.rootMargin, threshold: props.threshold }
  )
  observer.observe(trigger.value)
})

onBeforeUnmount(() => observer?.disconnect())
```

**模板：**
```vue
<template>
  <div>
    <slot />
    <div ref="trigger" class="infinite-scroll-trigger">
      <Loader2Icon v-if="loading" class="animate-spin" />
      <span v-else-if="!hasMore && !loading" class="text-secondary">没有更多了</span>
    </div>
  </div>
</template>
```

**Loader 图标**：用 `lucide-vue-next` 的 `Loader2`（跟 SongList 现有选择保持一致）。

**样式**：trigger `<div>` 是 flex 容器，`justify-content: center; padding: 1rem; min-height: 40px;`，永远存在（observer 需要挂载点）。当 `!loading && hasMore` 时是空 div（占位但不显示内容）。

### §4 — Search 视图状态管理（`src/views/Search/index.vue`）

**新增每 tab 状态**（5 tab × 4 字段 = 20 个 ref）：

```typescript
// 原有（行 20-24，不变）
const searchSongData = ref<Song[]>([])
const searchArtistData = ref<Artist[]>([])
const searchAlbumData = ref<Album[]>([])
const searchPlaylistData = ref<Playlist[]>([])
const searchUserData = ref<User[]>([])

// 新增
const songOffset = ref(0)
const songHasMore = ref(true)
const songLoading = ref(false)
// ... album / artist / playlist / user 同样 3 个
```

**重构 `handelSearchAllType`（当前行 107）**：
- 5 个 `data` 数组全部重置为 `[]`
- 5 个 `offset` 重置为 `0`
- 5 个 `hasMore` 重置为 `true`
- 5 个 `loading` 重置为 `false`
- 继续走 5 个并行请求（首屏）

**新增 5 个 `loadMore*` 方法**（每 tab 一个）：
```typescript
const loadMoreSongs = async () => {
  if (songLoading.value || !songHasMore.value) return
  songLoading.value = true
  try {
    const next = songOffset.value + 30
    const res = await searchBySong(currentKeyword, { limit: 30, offset: next })
    const newSongs = (res?.result?.songs ?? []).map(transformToSong)
    searchSongData.value.push(...newSongs)
    songOffset.value = next
    const total = res?.result?.songCount ?? 0
    songHasMore.value = newSongs.length > 0 && searchSongData.value.length < total
  } catch (e) {
    // toast + 保留 offset（用户可重试）
    emitter.emit(TOAST_ERROR, '加载失败')
  } finally {
    songLoading.value = false
  }
}
```

其他 4 个 tab 完全同形。差异只在：
- 操作的 data / offset / hasMore / loading 字段
- 调用的 `searchBy*` 函数
- `result.*` 里 items 字段名（`songs` / `artists` / `albums` / `playlists` / `userprofiles`）
- `result.*Count` 里 total 字段名（`songCount` / `artistCount` / `albumCount` / `playlistCount` / `userprofileCount`）

**模板改动**（行 261-279 区域）：
```vue
<template v-show="activeTab === 'songs'">
  <InfiniteScroll
    :loading="songLoading"
    :has-more="songHasMore"
    @load-more="loadMoreSongs"
  >
    <SongList :songs="searchSongData" />
  </InfiniteScroll>
</template>
<!-- 其他 4 个 tab 同样 -->
```

### §5 — 重构 `SongList.vue`

**删除** 行 ~46-50（`DISPLAY_BATCH_SIZE` + `displayCount` ref）、行 ~63-79（displayCount 切片 + loadMore）、行 ~82-97（IntersectionObserver setup）、行 ~99-113（生命周期）、行 ~208-214（trigger div + spinner）。

**保留**：
- 所有 props（特别是 `:songs`）
- 列表渲染（行的 `:key`、点击事件等）
- 其他所有功能（播放 loading 等）

**重构后** `SongList.vue` 变成纯列表渲染器 —— 没有 observer、没有分页。新的 `<InfiniteScroll>` 父组件提供这些。

### §6 — 错误处理

| 场景 | 行为 |
|---|---|
| 初次搜索网络错误 | toast 错误，5 个 data 数组仍是空（用户是新搜索，无旧数据可保留） |
| `loadMore*` 网络错误 | toast `加载失败`，**保留 offset**（用户再滚时可重试） |
| API 返回 0 条 | `hasMore = false`，显示「没有更多了」 |
| API 返回 items 但 `total` 为 0/缺失 | `hasMore = false`（保守） |
| 用户快速滚动多次触发 observer | `!loading` 守卫防止重复请求（沿用 SongList 的现有做法） |
| 加载中切 tab | 每 tab loading 独立，互不干扰 |
| 加载中改关键词 | `handelSearchAllType` 重置所有状态；在途请求仍可能完成并 push 到已被重置的数组 —— **接受这个竞态**（新搜索会覆盖），加 `AbortController` 是 YAGNI |

### §7 — 验证

项目无测试套件 —— 手工冒烟测试：

1. `pnpm dev`，打开 `/search`
2. 输入 "周杰伦" + Enter → 5 个 tab 各加载 30 条
3. 滚到歌曲 tab 底部 → spinner 出现，追加下一页，无控制台报错
4. 重复直到「没有更多了」出现
5. 切到专辑 tab，滚动，确认追加
6. 同样对歌手 / 歌单 / 用户 tab
7. 改成新关键词 → 5 个 tab 重置，没有残留
8. 停掉后端 → 滚动 → toast 出现，无崩溃

**类型检查：**
```bash
pnpm type-check
```

**构建：**
```bash
pnpm build
```

---

## 变更文件

| 文件 | 操作 |
|---|---|
| `src/api/search.ts` | 5 个函数加 `offset` / `limit` 参数 |
| `src/views/Search/index.vue` | 加每 tab 分页状态 + 5 个 `loadMore*` 方法 + 模板包装 |
| `src/components/common/musicComponents/SongList.vue` | 删除内部 observer，分页由父组件提供 |
| `src/components/common/InfiniteScroll.vue` | **新建** |

**不变的文件**：`SearchInput.vue`、所有 Grid 组件（`AlbumGrid` / `ArtistGrid` / `PlaylistGrid` / `UserGrid`）—— 它们不需要 observer，因为被 `<InfiniteScroll>` 包着。

---

## 迁移注意事项

- `SongList.vue` 里删掉的 `displayCount` ref + 切片，**当前代码无其他消费者**。
- `searchByKeyword`（1018）保持 `limit=100` 写死 —— 如果以后要用，再补一样的分页模式。
- API 函数签名变了（多了可选第二参数）。所有调用点都在 `Search/index.vue`，一起改完。

---

## 取舍

- **5 个 `loadMore*` 方法重复了 5 次**：可以抽成 `useSearchTabPaginator(tabKey, searchFn, resultKey, totalKey)` composable。**决定不抽** —— 5 个方法 × 20 行 = 100 行；composable ~40 行 + 泛型层，节省 60 行但加一层间接。如果加第 6 个 tab 或搜索功能膨胀，再重构。
- **关键词中途变更的竞态**：接受。仅当用户可见 bug 出现时才加 `AbortController`。
- **关键词变更后是否复用已加载结果**：不做（缓存是另一个 feature，超出范围）。