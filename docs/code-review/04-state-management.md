# 维度 4 — 状态管理架构

> **结论**：状态管理是整个项目**最混乱的一层**——store 用了两种 API 风格并存、字段名用下划线前缀标记"私有"、单例出口是死代码、组件局部状态绕开 store、路由守卫与网络初始化耦合。

---

## 🔴 P0 — 失效的状态

### STATE-1. `app store` 完全不是响应式

**位置**：`src/stores/app.ts:6-18`

```ts
export const useAppStore = defineStore('app', () => {
  const isSidebarCollapsed = false        // ← 普通 const
  const isMobileMenuOpen = false           // ← 普通 const
  const user = null as UserInfo | null     // ← 普通 const
  const searchQuery = ''                   // ← 普通 const
  const theme = 'light' as 'light' | 'dark'
  return { isSidebarCollapsed, isMobileMenuOpen, user, searchQuery, theme }
})
```

**failure_scenario**：
- 任何组件用 `storeToRefs(useAppStore())` 都拿不到响应式（因为字段是普通值）。
- 任何组件直接 `useAppStore().theme = 'dark'` 都不生效（Pinia setup store 返回值是只读代理）。
- 侧边栏折叠、移动端菜单、主题状态全都无法通过此 store 驱动。

CLAUDE.md 已记录但未修。

---

### STATE-2. `user store` 持久化字段与恢复字段不对等

**位置**：`src/stores/user.ts:81-92, 183-191`

**init() 读取**：
```ts
this.user = data.user
this.account = data.account
this.lastFetchTime = data.lastFetchTime || 0
this.loaded = data.loaded                       // ← 读取但没存
this._userCreatePlaylist = data.userCreatePlaylist  // ← 读取但没存
this._userSubPlaylist = data.userSubPlaylist        // ← 读取但没存
this.userLikeListSet = new Set(...)
```

**persist() 写入**：
```ts
localStorage.setItem(STORAGE_KEY, JSON.stringify({
  user: this.user,
  account: this.account,
  lastFetchTime: this.lastFetchTime,
  userLikeListSet: [...this.userLikeListSet],
}))
// 没有 loaded / userCreatePlaylist / userSubPlaylist / userSubCount
```

**failure_scenario**：
- 刷新页面 → `loaded` 变 undefined → `router.beforeEach` 再次 fetchUser → 网络白跑。
- `_userCreatePlaylist` 变 null → `isUserCreatedPlaylist` getter 走 `null!.some(...)` 抛 `Cannot read properties of null`。

---

### STATE-3. `TheFooter` 维护独立音量状态，与 store 永久不同步

**位置**：`src/components/layout/TheFooter.vue:14, 36, 113-114`

```ts
const { currentSong, currentTime, duration, playing } = storeToRefs(playerStore)
// ...
const volume = ref(70)  // 局部 ref
```

- `playerStore.volume` 初始 0.5（Audio.volume = 0.5）
- `Footer` 初始显示 70%
- **Footer 拖动 → 调用 `setVolume()` → store.volume 更新，但 Footer 的本地 ref 仍按用户拖到的位置**
- 键盘快捷键 / 系统音量同步 / 用户在其他 tab 修改 store → Footer UI 不响应

更糟糕的是单位混乱：store 用 0–1，Footer 用 0–100。

---

### STATE-4. `core/player/player.ts` 是无效单例

**位置**：`src/core/player/player.ts:1-3`

```ts
import { MusicController } from "./musicController";
const player = new MusicController();
export default player;
```

- 真实单例：`stores/playerStore.ts:7` `const player = new MusicController()` —— 模块级 new。
- `player.ts` 整个文件在 `src/` 中无任何 import。
- 如果未来某天有人误用 `import player from '@/core/player/player'`，会得到第二个 MusicController，**事件不互通、Audio 冲突**。

CLAUDE.md 误描述"由 player.ts 实例化"。

---

## 🟡 P1 — 架构混乱

### STATE-5. `isFullScreen` 双写路径

**位置**：
- Store 路径：`playerStore.setFullPlayer(e)` → `isFullScreen.value = e`
- 事件总线路径：`emitter.emit(EVENTS.TOGGLE_FULLSCREEN, val)` → `LayoutContainer.vue:43-45` 直接 `isFullScreen.value = val`

**现象**：
- `TheFooter.vue:43` emit `TOGGLE_FULLSCREEN`
- `FullScreenPlayer.vue:36-38` handleClose emit `TOGGLE_FULLSCREEN`
- `playerStore.ts` 提供 `setFullPlayer` 方法
- `LayoutContainer` 既不调 store action，直接写 ref

**failure_scenario**：
- 哪天要在切换全屏时加副作用（如暂停背景动画、保存历史）—— 一边改 store 即可，但事件路径完全绕过 store。
- 想在切换前插权限校验，只能改一半。

**修法**：删 `EVENTS.TOGGLE_FULLSCREEN` 和 `LayoutContainer.vue:43-45`，所有调用走 `playerStore.setFullPlayer()`。

---

### STATE-6. Pinia 风格混乱：Composition + Options 混用

**位置**：
- `src/stores/playerStore.ts:9` —— `defineStore('player', () => { ... })` Composition
- `src/stores/user.ts:44` —— `defineStore('user', { state, getters, actions })` Options

**实际代价**：
- 两种 store 的写法完全不一样，新人 review 一个 store 后还要切换上下文看另一个。
- `_userCreatePlaylist` 下划线前缀是 Options API 时代"伪私有"约定，在 Composition API 中不需要。
- Options store 不能直接用 ref/reactive/composable，强行组合时代价大。

**修法**：统一用 Composition API（更符合 Vue 3 风格）。

---

### STATE-7. `router.beforeEach` 与 fetchUser 耦合，但失败不阻断

**位置**：`src/router/index.ts:42-47`

```ts
router.beforeEach(async () => {
  const userStore = useUserStore()
  if (!userStore.loaded) {
    await userStore.fetchUser()
  }
})
```

- `fetchUser()` 内部 try/catch → 失败时调 `resetUser()` → 正常返回。
- 守卫无法区分 "网络失败" vs "匿名用户"。
- 网络故障时仍然放行，页面以未登录状态渲染，**用户看不到登录入口，只看到空白状态**。

**修法**：fetchUser 返回 boolean 或 throw；守卫根据结果跳转 `/login` 或继续。

---

### STATE-8. `user.toggleLikeMusic` 通过重建 Set 触发响应式

**位置**：`src/stores/user.ts:98-125`

```ts
const newSet = new Set(this.userLikeListSet)
newSet.add(song.id)
this.userLikeListSet = newSet
```

这是 Pinia 中典型的"为了让响应式触发"hack。问题：
- 每次点赞都新建 Set（O(n) 复制）。
- 大 Set（几千首红心）下重复点击性能差。
- 与 `vue/reactivity` 的 `triggerRef` 比较——后者原地触发更新，零拷贝。

**修法**：用 `shallowRef + triggerRef` 或直接 `ref<Set<number>>(new Set())` 后调 `track`。

---

## 🟢 P2 — 残留 / 命名

### STATE-9. `stores/counter.ts` 脚手架残留

**位置**：`src/stores/counter.ts:1-12`

无任何 import。CLAUDE.md 已标记可删除。

---

### STATE-10. `_userCreatePlaylist` / `_userSubPlaylist` 临时前缀暴露公共 state

**位置**：`src/stores/user.ts:21-22`

```ts
_userCreatePlaylist: Playlist[] | null  // 改名前缀加 _
_userSubPlaylist: Playlist[] | null     // 改名前缀加 _
```

下划线前缀在 Options API 里通常表示"不要从外部访问"。但 Pinia 的 state 完全 public——组件可直接 `userStore._userCreatePlaylist` 改写，没有任何拦截。

"改名前缀加 _"的注释暴露这是命名遗留问题，应改为正式的 `private` getter 或重命名。

---

## 总结

| # | 文件 | 严重度 | 关键词 |
|---|------|--------|--------|
| STATE-1 | stores/app.ts | P0 | 非响应式 |
| STATE-2 | stores/user.ts | P0 | 持久化字段不对等 |
| STATE-3 | TheFooter.vue | P0 | 音量不同步 |
| STATE-4 | core/player/player.ts | P0 | 无效单例 |
| STATE-5 | isFullScreen 双路径 | P1 | store vs 事件总线 |
| STATE-6 | 风格混用 | P1 | Composition vs Options |
| STATE-7 | router 守卫 | P1 | 失败不阻断 |
| STATE-8 | toggleLikeMusic | P2 | 重建 Set hack |
| STATE-9 | counter.ts | P2 | 残留 |
| STATE-10 | `_` 前缀 state | P2 | 命名不规范 |
