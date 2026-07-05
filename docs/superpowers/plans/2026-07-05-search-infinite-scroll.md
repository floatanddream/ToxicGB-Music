# 搜索页无限滚动 — 实施计划

**日期：** 2026-07-05
**对应设计文档：** `docs/superpowers/specs/2026-07-05-search-infinite-scroll-design.md`

按以下顺序执行。每完成一步都跑 `pnpm type-check` 做类型守卫。

---

## Step 1 — API 层加 `offset` / `limit` 参数

**文件：** `src/api/search.ts`

把 5 个函数（`searchBySong` / `searchByAlbum` / `searchBySinger` / `searchByPlaylist` / `searchByUser`）从

```typescript
export const searchBySong = (keyword: string): Promise<any> =>
  http.get('/search', { searchParams: { keywords: keyword, type: 1, limit: 100 } })
```

改成

```typescript
type SearchOptions = { limit?: number; offset?: number }

export const searchBySong = (keyword: string, opts: SearchOptions = {}): Promise<any> => {
  const { limit = 30, offset = 0 } = opts
  return http.get('/search', { searchParams: { keywords: keyword, type: 1, limit, offset } })
}
```

**留 `searchByKeyword` 不动**（dead code）。

**验证：** `pnpm type-check` 通过；其他模块的 `import { searchBySong } from '@/api/search'` 不受影响（第二参数是可选的）。

---

## Step 2 — 新建 `<InfiniteScroll>` 组件

**文件：** `src/components/common/InfiniteScroll.vue`（新建）

完整代码：

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Loader2 } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  loading?: boolean
  hasMore?: boolean
  rootMargin?: string
  threshold?: number
}>(), {
  loading: false,
  hasMore: true,
  rootMargin: '15%',
  threshold: 1,
})

const emit = defineEmits<{
  (e: 'load-more'): void
}>()

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
    { rootMargin: props.rootMargin, threshold: props.threshold },
  )
  observer.observe(trigger.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})
</script>

<template>
  <div>
    <slot />
    <div ref="trigger" class="infinite-scroll-trigger">
      <Loader2 v-if="loading" class="animate-spin" :size="20" />
      <span v-else-if="!hasMore && !loading" class="no-more-text">没有更多了</span>
    </div>
  </div>
</template>

<style scoped>
.infinite-scroll-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 1rem 0;
}

.no-more-text {
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
}
</style>
```

**注意：**
- 没有用 `<script setup>` 的 destructure 改 props（在模板里直接 `props.loading` 不行），所以用 `withDefaults` + 闭包访问 `props.xxx`。
- 用 `<script setup>` 的话，`withDefaults` 后 `props` 是 reactive proxy，模板里写 `props.loading` 报错（不能放表达式但 prop 名引用 `props` 也不对）。**修正**：在模板里直接用 prop 名（Vue 编译时自动解析 props），不要写 `props.loading`。

**验证：** 单独渲染 `<InfiniteScroll><div>content</div></InfiniteScroll>` 不报错。

---

## Step 3 — 重构 `SongList.vue`

**文件：** `src/components/common/musicComponents/SongList.vue`

**删除**：
- 行 46 附近：`const DISPLAY_BATCH_SIZE = 20`
- 行 47 附近：`const displayCount = ref(DISPLAY_BATCH_SIZE)`
- 行 ~63 附近：`const displayedSongs = computed(...)` —— 改用 `props.songs` 直接渲染
- 行 ~68-79：`const loadMore = ...`
- 行 ~82-97：`IntersectionObserver` 的 setup + ref
- 行 ~99-113：`onMounted` / `onBeforeUnmount` 的 observer 生命周期
- 行 ~208-214：trigger `<div ref="loadMoreTrigger">` 区域（含 spinner）

**保留**：
- props 定义
- 模板里 `props.songs` 的列表渲染（删 `displayedSongs` 后改回 `props.songs`）
- 其他逻辑（点击事件、loading 等）

**重构后模板片段**：
```vue
<ul>
  <li v-for="song in songs" :key="song.id" @click="...">
    <!-- 单曲行 -->
  </li>
</ul>
```

不再有 observer / spinner / trigger —— 全部由外层 `<InfiniteScroll>` 提供。

**验证：** `pnpm type-check` 通过；`grep -n "DISPLAY_BATCH_SIZE\|displayCount\|loadMoreTrigger\|IntersectionObserver" src/components/common/musicComponents/SongList.vue` 应无结果。

---

## Step 4 — Search 视图加状态 + 方法 + 模板

**文件：** `src/views/Search/index.vue`

### 4a. 加 state（约 20 个 ref）

紧跟现有 5 个 `searchXxxData` ref 之后：

```typescript
// 分页状态
const songOffset = ref(0)
const songHasMore = ref(true)
const songLoading = ref(false)

const albumOffset = ref(0)
const albumHasMore = ref(true)
const albumLoading = ref(false)

const artistOffset = ref(0)
const artistHasMore = ref(true)
const artistLoading = ref(false)

const playlistOffset = ref(0)
const playlistHasMore = ref(true)
const playlistLoading = ref(false)

const userOffset = ref(0)
const userHasMore = ref(true)
const userLoading = ref(false)
```

### 4b. 重构 `handelSearchAllType`

在原方法开头插入重置逻辑：

```typescript
const handelSearchAllType = async (key: string) => {
  // 重置所有分页状态
  searchSongData.value = []
  searchAlbumData.value = []
  searchArtistData.value = []
  searchPlaylistData.value = []
  searchUserData.value = []

  songOffset.value = 0; songHasMore.value = true; songLoading.value = false
  albumOffset.value = 0; albumHasMore.value = true; albumLoading.value = false
  artistOffset.value = 0; artistHasMore.value = true; artistLoading.value = false
  playlistOffset.value = 0; playlistHasMore.value = true; playlistLoading.value = false
  userOffset.value = 0; userHasMore.value = true; userLoading.value = false

  // ... 原方法后续逻辑
}
```

### 4c. 加 5 个 `loadMore*` 方法

放在 `handelSearchAllType` 之后：

```typescript
const loadMoreSongs = async () => {
  if (songLoading.value || !songHasMore.value) return
  songLoading.value = true
  try {
    const next = songOffset.value + 30
    const data = await searchBySong(searchQuery, { limit: 30, offset: next })
    const items = (data?.result?.songs ?? []).map(transformToSong)
    searchSongData.value.push(...items)
    songOffset.value = next
    const total = data?.result?.songCount ?? 0
    songHasMore.value = items.length > 0 && searchSongData.value.length < total
  } catch (e) {
    emitter.emit(MESSAGE_TYPE.TOAST_ERROR, '加载失败')
  } finally {
    songLoading.value = false
  }
}

const loadMoreAlbums = async () => {
  if (albumLoading.value || !albumHasMore.value) return
  albumLoading.value = true
  try {
    const next = albumOffset.value + 30
    const data = await searchByAlbum(searchQuery, { limit: 30, offset: next })
    const items = (data?.result?.albums ?? []).map(transformAlbums)
    searchAlbumData.value.push(...items)
    albumOffset.value = next
    const total = data?.result?.albumCount ?? 0
    albumHasMore.value = items.length > 0 && searchAlbumData.value.length < total
  } catch (e) {
    emitter.emit(MESSAGE_TYPE.TOAST_ERROR, '加载失败')
  } finally {
    albumLoading.value = false
  }
}

const loadMoreArtists = async () => {
  if (artistLoading.value || !artistHasMore.value) return
  artistLoading.value = true
  try {
    const next = artistOffset.value + 30
    const data = await searchBySinger(searchQuery, { limit: 30, offset: next })
    const items = (data?.result?.artists ?? []).map(transformToArtist)
    searchArtistData.value.push(...items)
    artistOffset.value = next
    const total = data?.result?.artistCount ?? 0
    artistHasMore.value = items.length > 0 && searchArtistData.value.length < total
  } catch (e) {
    emitter.emit(MESSAGE_TYPE.TOAST_ERROR, '加载失败')
  } finally {
    artistLoading.value = false
  }
}

const loadMorePlaylists = async () => {
  if (playlistLoading.value || !playlistHasMore.value) return
  playlistLoading.value = true
  try {
    const next = playlistOffset.value + 30
    const data = await searchByPlaylist(searchQuery, { limit: 30, offset: next })
    const items = (data?.result?.playlists ?? []).map(transformToPlaylist)
    searchPlaylistData.value.push(...items)
    playlistOffset.value = next
    const total = data?.result?.playlistCount ?? 0
    playlistHasMore.value = items.length > 0 && searchPlaylistData.value.length < total
  } catch (e) {
    emitter.emit(MESSAGE_TYPE.TOAST_ERROR, '加载失败')
  } finally {
    playlistLoading.value = false
  }
}

const loadMoreUsers = async () => {
  if (userLoading.value || !userHasMore.value) return
  userLoading.value = true
  try {
    const next = userOffset.value + 30
    const data = await searchByUser(searchQuery, { limit: 30, offset: next })
    const items = (data?.result?.userprofiles ?? []).map(transformToUser)
    searchUserData.value.push(...items)
    userOffset.value = next
    const total = data?.result?.userprofileCount ?? 0
    userHasMore.value = items.length > 0 && searchUserData.value.length < total
  } catch (e) {
    emitter.emit(MESSAGE_TYPE.TOAST_ERROR, '加载失败')
  } finally {
    userLoading.value = false
  }
}
```

**注意 import**：确认 `searchByAlbum` / `searchBySinger` / `searchByPlaylist` / `searchByUser`、`transformToArtist` / `transformAlbums` / `transformToPlaylist` / `transformToUser`、`MESSAGE_TYPE`（来自 `@/constants/messages`）都已在 `<script setup>` 顶部 import；缺的补上。

### 4d. 模板改动

把行 261-279 区域的 5 个 `v-show` 块分别用 `<InfiniteScroll>` 包起来：

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

<template v-show="activeTab === 'albums'">
  <InfiniteScroll
    :loading="albumLoading"
    :has-more="albumHasMore"
    @load-more="loadMoreAlbums"
  >
    <AlbumGrid :albums="searchAlbumData" />
  </InfiniteScroll>
</template>

<template v-show="activeTab === 'artists'">
  <InfiniteScroll
    :loading="artistLoading"
    :has-more="artistHasMore"
    @load-more="loadMoreArtists"
  >
    <ArtistGrid :artists="searchArtistData" />
  </InfiniteScroll>
</template>

<template v-show="activeTab === 'playlists'">
  <InfiniteScroll
    :loading="playlistLoading"
    :has-more="playlistHasMore"
    @load-more="loadMorePlaylists"
  >
    <PlaylistGrid :playlists="searchPlaylistData" />
  </InfiniteScroll>
</template>

<template v-show="activeTab === 'users'">
  <InfiniteScroll
    :loading="userLoading"
    :has-more="userHasMore"
    @load-more="loadMoreUsers"
  >
    <UserGrid :users="searchUserData" />
  </InfiniteScroll>
</template>
```

**import `InfiniteScroll`** 在 `<script setup>` 顶部。

**注意：** Vue 3 不允许同一个模板里多个根 `<template>` 兄弟节点，如果当前结构是一个 `v-for` + `v-show` 模式，需要保持原有结构（很可能是一个 `<div>` 包了所有 tabs，每个 tab 用 `v-show`）。按原有 DOM 结构包裹 `InfiniteScroll`，**不要**把 `<template>` 直接替换 `<div>`。

---

## Step 5 — 类型检查 + 构建

```bash
pnpm type-check
pnpm build
```

如果类型错误，按报错位置回到对应 Step 修复。

---

## Step 6 — 手工验证

按 spec §7 的 8 步冒烟测试：
1. `pnpm dev` → `/search`
2. "周杰伦" + Enter → 5 tab 各 30 条
3. 滚到歌曲 tab 底部 → spinner → 追加
4. 滚到「没有更多了」
5. 切到专辑 tab，验证
6. 同样对歌手 / 歌单 / 用户
7. 改关键词 → 5 tab 重置
8. 停后端 → 滚动 → toast

---

## 回归检查

- 搜索框 Enter 仍能搜索（原有 `handleSearch` 不变）
- 5 个 tab 切换仍正常（`v-show` 不变）
- 列表点击仍能播放 / 跳转（Grid 组件 props 不变）

---

## 文件清单

| 文件 | 变更类型 |
|---|---|
| `src/api/search.ts` | 修改（5 函数加可选参数） |
| `src/components/common/InfiniteScroll.vue` | **新建** |
| `src/components/common/musicComponents/SongList.vue` | 重构（删 observer） |
| `src/views/Search/index.vue` | 加 state + 方法 + 模板包 InfiniteScroll |

总计：1 新建、3 修改、0 删除。

---

## 不在本次范围内

- 综合（1018）tab
- 搜索结果缓存
- `AbortController` 取消在途请求
- composable 抽取
- `searchByKeyword` 分页