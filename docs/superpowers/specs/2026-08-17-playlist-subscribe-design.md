# 歌单收藏 / 取消收藏 — 设计文档

- 日期：2026-08-17
- 状态：已批准
- 分支：developing

## 背景与目标

`PlaylistCard.vue` 的卡片红心按钮目前是死代码：`@click.stop="$emit('like-playlist', playlist)"`，但 `PlaylistGrid.vue`（及其使用方）**没有任何监听者**，点击无效果。

目标：实现歌单「收藏 / 取消收藏」。点击红心 → 收藏，再次点击 → 取消收藏；若是用户自己创建的歌单则不显示红心；收藏 / 取消后侧边栏「收藏的歌单」同步更新。

后端接口（NeteaseCloudMusicApi 风格）：

```
GET /playlist/subscribe?t=1&id=<id>   # t=1 收藏
GET /playlist/subscribe?t=2&id=<id>   # t=2 取消收藏
```

## 已确认的需求决策

| 决策点 | 结论 |
| --- | --- |
| 逻辑归属 | 放 `userStore`（与歌曲红心 `toggleLikeMusic` / `userLikeListSet` 对称） |
| 收藏状态来源 | 新增 `subscribedPlaylistSet: Set<string>` |
| Set 存值类型 | 统一存**字符串**，类型收窄为 `Set<string>`，getter/action 内用 `String(id)` 归一化 |
| 触发方式 | PlaylistCard 直接调用 store（不经 emit / eventBus） |
| 登录守卫 | action 内检查 `isLogin`，未登录 emit「请先登录」Toast 并直接 return |
| 侧边栏同步 | 是。action 内同步维护 `_userSubPlaylist`，侧边栏响应式自动更新 |

## 现状分析

- 简化 `Playlist` 类型（`types/musicTypes.ts`）含 `isLiked: boolean`，由 `transformToPlaylist` 从 `rawPlaylist.subscribed` 映射而来。
- **所有**简化 `Playlist` 生产方（首页 `PlaylistSection`、搜索页、用户主页、userStore 的 `_userCreatePlaylist` / `_userSubPlaylist`）都走 `transformToPlaylist`，它执行 `id: String(rawPlaylist.id)`，故运行时 `playlist.id` **一定是字符串**。
- 已有歌曲红心模式：`userLikeListSet`（播种用 `id.toString()`，判读用 `song.id` 字符串）+ `isSongLiked` getter + `toggleLikeMusic` action。
- ⚠️ 已知问题（本次顺带修复）：`isUserCreatedPlaylist` getter 用 `state._userCreatePlaylist!.some(...)`，当 `_userCreatePlaylist` 为 `null`（未登录 / 加载中）时抛异常。
- ⚠️ 潜在坑（**不修，本次只规避**）：`SongList.vue` 用 `has(Number(songId))` 查字符串键 Set，永远 false。本设计用 `String(id)` 归一化规避同类问题。

## 设计

### 1. API — `src/api/playlist.ts`

新增：

```typescript
/**
 * 收藏 / 取消收藏歌单
 * t = 1: 收藏，t = 2: 取消收藏
 * 接口地址: /playlist/subscribe
 */
export async function subscribePlaylist(t: 1 | 2, id: string | number) {
  return await request.get(`/playlist/subscribe?t=${t}&id=${id}`, { sendCookie: true })
}
```

### 2. userStore — `src/stores/user.ts`

**state** 新增（`UserState` 接口 + `state()` 初始值）：

```typescript
subscribedPlaylistSet: Set<string> // 已收藏歌单 id 集合（统一存字符串）
```

**getter** 新增：

```typescript
isPlaylistSubscribed: (state) => (id: string | number): boolean =>
  state.subscribedPlaylistSet.has(String(id)),
```

**getter** 修复（空值安全）：

```typescript
isUserCreatedPlaylist: (state) => (playlist: Playlist | FullPlaylist): boolean =>
  state._userCreatePlaylist?.some((item) => item.id === playlist.id) ?? false,
```

**action** 新增：

```typescript
async toggleSubscribePlaylist(playlist: Playlist): Promise<boolean> {
  // 登录守卫：未登录直接拦截，不发请求
  if (!this.isLogin) {
    emitter.emit(MESSAGE_TYPE.TOAST_WARNING, '请先登录')
    return false
  }
  const id = String(playlist.id)
  const isSubscribed = this.subscribedPlaylistSet.has(id)
  const res = await subscribePlaylist(isSubscribed ? 2 : 1, playlist.id)
  if (res?.code === 200 || res?.code === '200') {
    // 更新 Set（新建实例触发响应式）
    const newSet = new Set(this.subscribedPlaylistSet)
    isSubscribed ? newSet.delete(id) : newSet.add(id)
    this.subscribedPlaylistSet = newSet

    // 同步侧边栏「收藏的歌单」（侧边栏响应式绑定 _userSubPlaylist，重新赋值新数组显式触发）
    if (isSubscribed) {
      this._userSubPlaylist = (this._userSubPlaylist || []).filter((p) => String(p.id) !== id)
    } else {
      const list = this._userSubPlaylist || []
      if (!list.some((p) => String(p.id) === id)) {
        this._userSubPlaylist = [...list, playlist]
      }
    }

    emitter.emit(MESSAGE_TYPE.TOAST_SUSSESS, isSubscribed ? '已取消收藏' : '已收藏')
    return true
  }
  emitter.emit(MESSAGE_TYPE.TOAST_ERROR, isSubscribed ? '取消收藏失败' : '收藏失败')
  return false
}
```

> 说明：与 `toggleLikeMusic` 风格一致 —— API 调用 + 成功才改状态 + Toast；失败返回 false。

**fetchUser** 播种（`fetchUser` 内已有 `userSub` 数组）：

```typescript
this.subscribedPlaylistSet = new Set(userSub.map((p) => String(p.id)))
```

**persist / init** 持久化（与 `userLikeListSet` 一致，刷新后红心立即恢复）：

```typescript
// persist() 写入
subscribedPlaylistSet: [...this.subscribedPlaylistSet],
// init() 恢复
this.subscribedPlaylistSet = new Set(data.subscribedPlaylistSet || [])
```

### 3. PlaylistCard — `src/components/common/musicComponents/PlaylistCard.vue`

**script** 补齐缺失符号：

```typescript
import { Loader2 } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const isUserCreated = computed(() => userStore.isUserCreatedPlaylist(props.playlist))
const isLiked = computed(() => userStore.isPlaylistSubscribed(props.playlist.id))
const subscribeLoading = ref(false)
const handleSubscribe = async () => {
  subscribeLoading.value = true
  await userStore.toggleSubscribePlaylist(props.playlist)
  subscribeLoading.value = false
}
```

**template** 红心按钮改为：

```vue
<Button
  v-if="!isUserCreated"
  size="icon"
  variant="secondary"
  class="w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white subscribe-btn"
  :disabled="subscribeLoading"
  @click.stop="handleSubscribe"
>
  <Loader2 v-if="subscribeLoading" class="w-3 h-3 animate-spin" />
  <Heart v-else class="w-3 h-3 transition-all duration-300"
    :class="{ 'fill-red-500 text-red-500': isLiked }" />
</Button>
```

并移除 `defineEmits` 中的 `like-playlist` 声明（无任何监听者，且被直接调用 store 取代）。`artist-click` 保持不变（非本次范围）。

### 4. PlaylistSection — `src/views/Home/components/PlaylistSection.vue`（追加需求）

首页「推荐歌单」区的红心原本是 stub（`toggleLike` 只做本地 `playlist.isLiked` 翻转，不调接口），且 `hoveredPlaylist` 声明为 `number | null` 导致 TS2322。改动：

- 修复类型错误：`hoveredPlaylist = ref<string | number | null>(null)`（`playlist.id` 为 `string | number`）。
- 红心接入 store：模板两处 `playlist.isLiked` 改为 `userStore.isPlaylistSubscribed(playlist.id)`；`toggleLike` 改为 `await userStore.toggleSubscribePlaylist(playlist)`，并用 `subscribingId` 做防重复守卫。登录守卫由 action 内 `isLogin` 检查覆盖。
- **不隐藏自建歌单红心**（用户明确要求，与 PlaylistCard 不同）。

## 侧边栏同步原理

`TheSidebar.vue` 的「我的歌单」「收藏的歌单」两组直接绑定 `userStore.userCreatePlaylist` / `userStore.userSubPlaylist` getter（读 `_` 前缀 state 数组）。Pinia state 响应式，action 内重新赋值 `_userSubPlaylist` 后 getter 重算、侧边栏自动重渲染。**无需改动 TheSidebar.vue**。

## 验证

1. `pnpm type-check` 通过。
2. 手动三场景：
   - 首页歌单卡片点红心 → Toast「已收藏」+ 红心变红；再点 → Toast「已取消收藏」+ 复原。
   - 未登录点红心 → Toast「请先登录」，不发请求。
   - 用户主页查看自己（`_userCreatePlaylist` 命中）的歌单卡片 → 不显示红心。
3. 收藏后侧边栏「收藏的歌单」出现该歌单；取消后消失。

## 影响面 / 风险

- 改动文件：`api/playlist.ts`、`stores/user.ts`、`PlaylistCard.vue`、`views/Home/components/PlaylistSection.vue`、`TheSidebar.vue`，共 5 个。
- 不触碰：SongList.vue、PlaylistGrid.vue、事件总线、路由。

### 已知遗留（用户选择不改）

- **刷新后订阅状态不持久**：`toggleSubscribePlaylist` 未调 `persist()`、`persist()` 不保存 `_userSubPlaylist`/`_userCreatePlaylist` 数组、`fetchUser` 10 分钟缓存跳过拉取 → 刷新后侧边栏仍可能不显示新收藏的歌单。用户明确选择本次只修 TheSidebar，此遗留问题待后续处理。
- 修复 `isUserCreatedPlaylist` 空值 bug 是本次 PlaylistCard 使用该 getter 的直接前置条件，属范围内最小修复。
- 已知不修：`SongList.vue` 的 `has(Number(songId))` 潜在 bug、`persist()` 不持久化 `_userCreatePlaylist` / `_userSubPlaylist`（均为存量问题，非本次需求）。
