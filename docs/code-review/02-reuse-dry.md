# 维度 2 — 代码复用 / DRY

> **结论**：项目里"看起来不同模块在做不同事情"的代码，**骨架层面高度雷同**。最大问题集中在主题切换、搜索分页、API 三个维度，重复 60–200 行不夸张，且已经在引入 bug。

---

## 🔴 严重

### DRY-1. 主题切换逻辑被复制 3 份，状态已不一致

**位置**：
- `src/components/layout/TheHeader.vue:13-22, 31-42`
- `src/components/layout/TheSidebar.vue:51-70`
- `src/components/layout/LayoutContainer.vue:41-55`

**现象**：
- 三个文件都定义了 `isDarkMode = ref(false)` + `toggleTheme()` + `initTheme()` + `document.documentElement.classList.toggle('dark', ...)` + `localStorage.setItem('theme', ...)`。
- LayoutContainer 没有 `isDarkMode` ref，只在 `onMounted` 里初始化 DOM。
- TheHeader 和 TheSidebar **各自持有独立的 ref**。

**实际代价**：
- 66 行重复（22+20+10+14）。
- 在 TheHeader 点月亮 → LayoutContainer 永远不会知道，TheSidebar 的图标也不会变。
- TheSidebar 的主题切换按钮（line 168）调用 `toggleTheme()` → 只改自己 + DOM，但 TheHeader 的 SunIcon/MoonIcon 不会响应（因为它是局部 ref）。

**修复**：抽 `useTheme()` composable 统一持有 `isDarkMode: Ref<boolean>` + 调 `document.documentElement.classList`。或直接迁入 `stores/app.ts`（目前是非响应式 dead store，正好可激活）。

---

### DRY-2. Search 视图 5 个 tab 共用同一套骨架

**位置**：`src/views/Search/index.vue:33-307`

**现象**：
- 5 套分页状态：`songOffset/songHasMore/songLoading` × 5（song/album/artist/playlist/user），共 15 个 ref。
- 5 个 `searchXxx()` 函数结构 100% 一致：调 fetcher → map transformer → set state → set `searchStatus[xxx]=true`。
- 5 个 `loadMoreXxx()` 函数结构 100% 一致：检查 `xxxLoading/xxxHasMore/!searchQuery` → push 到 data → set state。

**实际代价**：约 200 行可通过 `usePaginationList(fetcher, transformer)` 收敛到 ~30 行。新增第 6 个 tab（MV/电台）要粘贴 25 行模板；任何修改（cursor 分页 / abortController / 失败重试）都要改 10 处。

**修复**：
```ts
function usePaginationList<T>(fetcher: (offset:number)=>Promise<T[]>, key:string) { ... }
// 5 个 tab 都变成：
const songs = usePaginationList(s => searchBySong(q, { offset: s.offset }), 'song')
```

---

### DRY-3. 6 个搜索函数只是 type 不同

**位置**：`src/api/search.ts:7-29`

**现象**：
```ts
searchBySong(keyword, opts)      // type=1, /cloudsearch
searchByAlbum(keyword, opts)     // type=10
searchBySinger(keyword, opts)    // type=100
searchByPlaylist(keyword, opts)  // type=1000
searchByUser(keyword, opts)      // type=1002
searchByKeyword(keyword)         // type=1018, /search, limit=100
```

6 个函数中 5 个完全相同，只有 type 不同；`searchBySong` endpoint 还不一样（`/cloudsearch` vs `/search`）。

**实际代价**：
- `searchByKeyword` 硬编码 `limit=100`，与 `Search.vue` 的 `PAGE_SIZE = 30` 矛盾 —— **同一搜索词在不同入口返回不同数量**。
- 22 行可折叠为 `search({type, keyword, opts})` 或工厂函数。
- 加新搜索类型就要复制粘贴一份。

---

## 🟡 中等

### DRY-4. `formatTimestampToDate` 在两个文件完全相同

**位置**：
- `src/utils/dataTransformer.ts:16-23`
- `src/utils/misc.ts:11-18`

**现象**：函数体逐字符相同。

**实际代价**：约 16 行重复。改一处忘改另一处会导致 "发布于 2024-12-09" vs "2024-12-9" 这种诡异的不一致。

---

### DRY-5. 4 个 eventHandler 注册模式完全一致

**位置**：
- `src/utils/eventBusHandler/clickEventHandler.ts:7-50`
- `playEventHandler.ts:6-32`
- `toastEventHandler.ts:5-24`
- `userEventHandler.ts:6-19`

**现象**：4 个文件都以相同模板结束：
```ts
const handlerMap = { [EVENT.X]: (e) => { ... }, ... }
Object.entries(handlerMap).forEach(([e, h]) => emitter.on(e, h))
```

**实际代价**：6 行 × 4 = 24 行样板代码。可抽 `createRegister(handlers)` 高阶函数。

---

### DRY-6. `dataTransformer.ts` 中 `import` 语句位置不规范

**位置**：`src/utils/dataTransformer.ts:186-187`

**现象**：文件第 1 行起就定义导出函数（用 `formatNumber`），但 `import { formatNumber } from './format'` 写在第 187 行（中间还夹了 `transformPlaylistDetail` 等 export）。ESM 提升能跑，但**视觉上 235 行的文件有两次 import 块**，新人 review 会以为是循环依赖或忘记 import。

**实际代价**：将来切分模块时极易漏改一处。

---

### DRY-7. `getAlbumComments` 与 `getPlaylistComments` 结构相同

**位置**：
- `src/api/album.ts:16-23`
- `src/api/playlist.ts:14-21`

**现象**：解构 `limit/offset/before` → 字符串拼接 `?id=...&limit=...&offset=...` → 调 `request.get(url)`。

**实际代价**：约 16 行重复。给 `/comment/mv` 等共用接口要再粘贴。

---

### DRY-8. `HttpClient` 三个拦截器 hook 内部串行逻辑相同

**位置**：`src/utils/request.ts:42-46, 52-100, 106-114`

**现象**：
```ts
beforeRequest: [async (req) => { for (const i of requestInterceptors) req = await i(req) }]
afterResponse: [... for (const i of responseInterceptors) result = await i(result)]
beforeError: [... for (const i of errorInterceptors) error = await i(error)]
```

**实际代价**：三处近重复 18 行。可抽私有 `runChain(hookName, value)`。

---

## 🟢 轻微

### DRY-9. `{sendCookie: true}` 是死参数

**位置**：
- `src/api/user.ts:5, 8, 12, 16, 20, 24, 29, 34, 48` 共 9 处
- `src/api/song.ts:7` 1 处
- `src/api/playlist.ts:4, 57` 2 处

**现象**：12 处 API 函数手传 `sendCookie: true`，但 `utils/request.ts` 的 `get/post` 内部已经无条件从 localStorage 读 cookie 注入。**该参数在当前 HttpClient 实现里行为完全等于被忽略**。

**实际代价**：误导性参数 —— 读 API 时让人以为这里有特殊逻辑。重构 HttpClient 时这 12 处会被错误地当作"语义"删除。

---

### DRY-10. `AuthModal` 三个 handle 函数全是占位

**位置**：`src/components/common/AuthModal.vue:62-93`

**现象**：`handleLogin` / `handleRegister` / `handleForgotPassword` 结构 100% 相同：
```ts
try { await new Promise(r => setTimeout(r, 1000)); console.log(...) } 
finally {}
```

旁边又有 `handleLoginSuccess`（line 95）正确 `emit(USER_LOGIN)` → `userEventHandler` → `userStore.fetchUser()`。

**实际代价**：
- 32 行占位代码。
- **当前调用 `handleLogin` 不会触发 `userStore.fetchUser`**，所以登录后不会刷新用户态。
- `handleLogin` 与 `handleLoginSuccess` 命名相邻但语义完全不同 —— 这是新人很容易踩的坑。

---

## 总结

| 修复优先级 | 项目 | 节省行数 |
|------|------|----------|
| 🔴 P0 | DRY-1 主题 composable | 66 行 + 修 1 个 UI bug |
| 🔴 P0 | DRY-2 搜索分页 hook | 170 行 |
| 🔴 P0 | DRY-3 API 搜索工厂 | 12 行 + 修 1 个 limit 不一致 bug |
| 🟡 P1 | DRY-4 util 合并 | 8 行 |
| 🟡 P1 | DRY-5 handler 工厂 | 18 行 |
| 🟡 P1 | DRY-6 import 整理 | 易读性 |
| 🟡 P1 | DRY-7/8 工具抽取 | 30 行 |
| 🟢 P2 | DRY-9/10 死参数/占位 | 12 + 32 行 |
