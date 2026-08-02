# 维度 7 — 命名 / 死代码 / 占位实现

> **结论**：项目大量"半完成"功能——按钮存在但 handler 是空函数、`v-if="false"` 关闭的组件、死代码单例。`console.log` 调试残留遍布。命名拼写错误至少有 8 处。
>
> 这些问题看似"小"，但**严重误导新加入的开发者**——他们会以为功能已接好 API，或以为某些模块还需要扩展。

---

## 🔴 P0 — 功能未完成

### NAME-1. `Album/index.vue` toggleLike 是空函数

**位置**：`src/views/Album/index.vue:109-111`

```ts
const toggleLike = () => {
  
};
```

AlbumHeader 的 `收藏专辑` 按钮（`@toggle-like`）触发后**什么都不做**。

**用户感知**：点击"收藏专辑"无任何反馈。

**CLAUDE.md 未列出**。

---

### NAME-2. `Search/index.vue` 7 个处理器都是 console.log

**位置**：`src/views/Search/index.vue:344-371`

```ts
const handlePlaySong = (song) => {
  isPlaying.value = !isPlaying.value
  console.log('Playing song:', song.title)
}
const handleArtistClick = (artist) => {
  console.log('Artist clicked:', artist.name)
}
// ... 还有 handleAlbumClick / handleUserClick / handleFollowUser / handlePlaylistClick / handleLikePlaylist
```

全部 7 个都是 console.log 占位。注意 `clickEventHandler.ts` 已经把 `EVENTS.ARTIST_CLICK` / `PLAYLIST_CLICK` / `ALBUM_CLICK` / `USER_CLICK` 都接好了路由跳转，但 Search 页面**完全绕过事件总线直接 console.log**。

**用户感知**：从搜索结果点击歌手卡片 → console 有日志但 UI 不响应。

---

### NAME-3. `Artist/index.vue` handleSubscribe 注释掉的代码

**位置**：`src/views/Artist/index.vue:49-52`

```ts
const handleSubscribe = () => {
  // artist.value.isSubscribed = !artist.value.isSubscribed;
  // console.log('关注状态:', artist.value.isSubscribed);
};
```

关注歌手按钮无功能。且 `Artist` 类型中没有 `isSubscribed` 字段（见 `types/artist.ts:17-31`）—— 即使把注释去掉也跑不起来。

---

### NAME-4. `views/Player.vue` 是旧版占位文件 ✅ 已修复

**位置**：`src/views/Player.vue:1-70`（**已删除**）

CLAUDE.md 已标记 — 纯 emoji 按钮 + 静态进度条，未接入路由（`router/index.ts` 无 `/player` 路由）。真实全屏播放器是 `views/FullscreenPlayer/FullScreenPlayer.vue`。

**修法**：删除。

**验证**：`grep -r "Player\.vue\|from .*/Player['\"]" src/` 无引用后已删除。

---

### NAME-5. `FullscreenPlayer/FullScreenPlayer.vue` UpNextQueue 永远不渲染

**位置**：`src/views/FullscreenPlayer/FullScreenPlayer.vue:113`

```vue
<UpNextQueue :songs="upNextSongs" @switch-song="handleSwitchSong" v-if="false" />
```

整个 `UpNextQueue.vue` 组件 + `upNextSongs` computed 都准备好了，但 `v-if="false"` 关闭。**整文件是死代码**。

---

### NAME-6. `core/player/player.ts` 是死代码 ✅ 已修复

**位置**：`src/core/player/player.ts:1-3`（**已删除**）

```ts
import { MusicController } from "./musicController";
const player = new MusicController();
export default player;
```

- 真实单例实例化在 `stores/playerStore.ts:7` `const player = new MusicController()`。
- `player.ts` 整个文件在 `src/` 中**无任何引用**（除 CLAUDE.md 文档描述）。
- 路径 `./musicController`（小写）Windows 不报错，部署到 Linux 会炸。
- CLAUDE.md 错误描述："单例模式由 player.ts 实例化"——实际是 playerStore.ts。

**修法**：直接删除该文件。

**验证**：`grep -r "core/player/player" src/` 无引用后已删除；vue-tsc 中 `TS1149` 大小写不一致错误一并消除。

---

### NAME-7. `AuthModal` handleLogin / Register / ForgotPassword 全是占位

**位置**：`src/components/common/AuthModal.vue:62-93`

```ts
const handleLogin = async () => {
  try {
    await new Promise(r => setTimeout(r, 1000))
    console.log('登录', email.value, password.value)
  } catch {}
}
const handleRegister = async () => { /* 同上，console.log 注册信息 */ }
const handleForgotPassword = async () => { /* 同上，console.log 邮箱 */ }
```

旁边 `handleLoginSuccess`（line 95）才正确 `emit(USER_LOGIN)` 触发 `userEventHandler` → `userStore.fetchUser()`。

**用户感知**：登录 → spinner 1s → console → UI 没反应（userStore 未刷新，必须手动 F5）。

---

## 🟡 P1 — 死代码 / 残留

### NAME-8. `stores/counter.ts` 是脚手架残留 ✅ 已修复

**位置**：`src/stores/counter.ts:1-12`（**已删除**）

```ts
import { defineStore } from 'pinia'
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  ...
})
```

没有任何 import。CLAUDE.md 标记"可删除"。

**验证**：`grep -r "useCounterStore\|counterStore" src/` 无消费者后已删除。

---

### NAME-9. `events.ts` 中 USER_COLLECT_SONG / USER_DELETE_SONG 未注册

**位置**：
- 定义：`src/constants/events.ts:20-21`
- 触发：`src/components/common/musicComponents/SongList.vue:71-73`
- **未注册**：`src/utils/eventBusHandler/userEventHandler.ts` 只处理 `USER_LOGIN` / `USER_LIKE_MUSIC`

**failure_scenario**：用户点击"收藏到歌单"或"删除歌曲"按钮，emitter 触发 → 无监听器响应 → 按钮无效。

---

### NAME-10. `SongList.vue` 本地 `isSongLiked` computed 是死代码

**位置**：`src/components/common/musicComponents/SongList.vue:32-34`

```ts
const isSongLiked = computed(
  () => (songId: number | string) => userLikeListSet.value.has(Number(songId)),
)
```

模板 line 129 实际用的是 `userStore.isSongLiked(song)`，**computed 永远不被使用**。

---

### NAME-11. `collectSongToPlaylistDialog.vue` 调试日志残留

**位置**：`src/components/common/musicComponents/collectSongToPlaylistDialog.vue:45-71`

`addSongToPlaylist` 函数中 line 56 残留 `console.log('歌单名字', ..., '歌曲名字', ...)`。生产环境 console 暴露用户操作。

---

### NAME-12. `Artist/index.vue` 中 `Songs` 大写命名不规范

**位置**：`src/views/Artist/index.vue:19`

```ts
const Songs = ref<Song[]>([])
const Albums = ref<Album[]>([])
```

ref 命名应该是 `songs` / `albums`，JavaScript 约定变量名首字母小写。大写 `Songs` 容易和类型 `Song[]` 混淆。

---

### NAME-13. `Search.vue` 中 searchQuery 声明位置

**位置**：`src/views/Search/index.vue:335`

```ts
const searchQuery = ref()  // 初始值 undefined
```

虽然在第 335 行 `ref()` 声明，但因为前面 watch / handler 都引用 `searchQuery.value`，TS 推断仍是 `Ref<undefined>`。改 `ref('')` 更安全。

---

## 🟢 P2 — 拼写 / 注释错误

### NAME-14. `types/artist.ts` 4 处拼写错误（Identiy 应 Identity）

**位置**：`src/types/artist.ts:42-44, 65`

```ts
expertIdentiyId: number;       // → expertIdentityId
expertIdentiyName: string;     // → expertIdentityName
expertIdentiyCount: number;    // → expertIdentityCount
secondaryExpertIdentiy: ...    // → secondaryExpertIdentity
```

4 处 typo，污染 IDE 智能提示。

---

### NAME-15. `api/album.ts` 注释错误

**位置**：`src/api/album.ts:3`

```ts
//获取歌手详情        ← 错！
export const getAlbumDetail = async (id) => {
```

实际是"获取专辑详情"。

---

### NAME-16. `api/user.ts` getUserSimpleIInfo 双 I

**位置**：`src/api/user.ts:23`

```ts
export async function getUserSimpleIInfo() {  // SimpleII → SimpleI
```

---

### NAME-17. `stores/app.ts` 所有字段非响应式

**位置**：`src/stores/app.ts:6-18`

```ts
export const useAppStore = defineStore('app', () => {
  const isSidebarCollapsed = false  // 应 ref(false)
  const isMobileMenuOpen = false
  const user = null as UserInfo | null
  const searchQuery = ''
  const theme = 'light' as 'light' | 'dark'
  ...
})
```

**storeToRefs 完全失效**——任何组件订阅这个 store 都不会响应式更新。CLAUDE.md 已记录。

---

### NAME-18. `LayoutContainer.vue` 中文注释错误

**位置**：`src/components/layout/LayoutContainer.vue:30`

```ts
//滚到top        ← 应为 "// 滚动到顶部"
```

---

### NAME-19. `Home/userCard.vue` "关注歌手" UI 重复

**位置**：`src/views/Home/components/userCard.vue:38, 51-53`

UI 中两次显示"关注歌手"，缺少电台/MV 等其他项目。

---

### NAME-20. `Home/userCard.vue` user fallback 缺失

**位置**：`src/views/Home/components/userCard.vue:21`

`userStore.user?.avatarUrl` 在 user 为 undefined 时返回 undefined，但模板未提供 fallback 图。

---

## 已沿用的拼写错误（CLAUDE.md 已标注，不修）

| 文件 | 拼写错误 | 正确 |
|------|---------|------|
| `constants/events.ts:8` | `SCROOL_TOP` | `SCROLL_TOP` |
| `constants/messages.ts:2` | `TOAST_SUSSESS` | `TOAST_SUCCESS` |
| `utils/misc.ts:25` | `extractLeagcyLyrics` | `extractLegacyLyrics` |
| `types/artist.ts:42-44,65` | `Identiy` × 4 | `Identity` |
| `api/user.ts:23` | `getUserSimpleIInfo` | `getUserSimpleInfo` |

CLAUDE.md 明确说"已沿用，不建议改动"。**新增代码请按现有拼写**。

---

## 总结

| # | 类型 | 文件 |
|---|------|------|
| NAME-1 | 空函数 | Album/index.vue toggleLike |
| NAME-2 | console.log 占位 × 7 | Search/index.vue |
| NAME-3 | 注释掉实现 | Artist/index.vue handleSubscribe |
| NAME-4 | 占位文件 | views/Player.vue |
| NAME-5 | v-if="false" | FullScreenPlayer UpNextQueue |
| NAME-6 | 死代码 + 路径 bug | core/player/player.ts |
| NAME-7 | 占位实现 | AuthModal × 3 |
| NAME-8 | 脚手架 | stores/counter.ts |
| NAME-9 | 未注册事件 | USER_COLLECT_SONG/USER_DELETE_SONG |
| NAME-10 | 死代码 computed | SongList.vue isSongLiked |
| NAME-11 | 调试日志残留 | collectSongToPlaylistDialog.vue |
| NAME-12 | 命名不规范 | Artist/index.vue Songs/Albums |
| NAME-13 | ref 初值缺失 | Search.vue searchQuery |
| NAME-14 | 4 处 typo | types/artist.ts |
| NAME-15 | 注释错 | api/album.ts |
| NAME-16 | 双 I typo | api/user.ts |
| NAME-17 | 非响应式 | stores/app.ts |
| NAME-18 | 注释错 | LayoutContainer.vue |
| NAME-19 | UI 重复 | Home/userCard.vue |
| NAME-20 | fallback 缺失 | Home/userCard.vue |
