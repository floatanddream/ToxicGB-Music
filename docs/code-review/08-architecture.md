# 维度 8 — 架构与项目规范

> **结论**：项目对外有 CLAUDE.md 规范文档，但**代码本身不遵守**——CLAUDE.md 说"只 new MusicController 一次"实际上新了两次；说"storeToRefs 解构"但 Footer 不用；说"API 响应必须转换"但 user.ts 偶尔绕过。

---

## 🔴 P0 — 违反 CLAUDE.md 明确规范

### ARCH-1. 违反"播放器单例只 new 一次"

**位置**：
- `src/core/player/player.ts:2` — `new MusicController()`
- `src/stores/playerStore.ts:7` — `new MusicController()` ← 真正在用的

CLAUDE.md 原文：
> **播放器单例**: 只在 `core/player/player.ts` 中 `new MusicController()` 一次

**实际情况**：
- 实际单例是 `stores/playerStore.ts` 模块级实例。
- CLAUDE.md 描述**错误**——`player.ts` 反而是死代码。

---

### ARCH-2. 违反"Pinia 解构使用 storeToRefs"

**位置**：`src/components/layout/TheFooter.vue:14, 36`

CLAUDE.md 原文：
> 使用 `storeToRefs` 解构响应式数据

**实际情况**：
- `TheFooter.vue:14` 用了 `storeToRefs(playerStore)` 解构 `currentSong/currentTime/duration/playing`
- **但 `volume` 没在 storeToRefs 列表里**，而是用 `const volume = ref(70)` 单独声明
- 整个 Footer 完全没订阅 store.volume

---

### ARCH-3. 违反"API 响应必须转换"

**位置**：
- `src/stores/user.ts:144` — `userLikeListRes.ids.map((id: number | string) => id.toString())` 直接读原始字段
- `src/views/Playlist/index.vue:120` — `data.subscribers?.map(transformToUser)` 转换
- `src/views/Playlist/index.vue:154` — `data.subscribers?.map(transformToUser)` 转换
- `src/api/playlist.ts:54-58` — `modifyPlaylistTracks` 返回原始 response 直接 await

CLAUDE.md 原文：
> 所有 API 响应必须先转换再使用，见开发指南。

**实际情况**：不一致——多数场景转了，少数直接读原始字段。

---

## 🟡 P1 — CLAUDE.md 与代码不一致

### ARCH-4. CLAUDE.md 描述的 Player.vue 已声明为占位，但仍存在

**位置**：`src/views/Player.vue`（CLAUDE.md 已标注"可删除"）

CLAUDE.md 原文：
> ⚠️ **旧版占位文件**（emoji 按钮，未接入路由），可删除

实际存在并保留——给新成员误导。

---

### ARCH-5. CLAUDE.md 描述 `core/player/player.ts` 为单例实例化处

CLAUDE.md 原文：
> 由 `core/player/player.ts` 实例化并默认导出

实际：`player.ts` 是死代码，真实实例化在 `stores/playerStore.ts`。文档误导。

---

### ARCH-6. CLAUDE.md 说 UpNextQueue v-if=false 暂未启用

CLAUDE.md：
> `UpNextQueue` 当前 v-if=false 暂未启用

**实际**：组件整文件 + computed 都在，删除反而更简单。

---

### ARCH-7. CLAUDE.md 关于 `MusicService` 缓存

CLAUDE.md：
> `Map<number | string, CachedSong>` 缓存

**实际**：代码确实用 Map，但**无大小限制**——长会话内存增长。CLAUDE.md 应注明。

---

## 🟡 P1 — 模块边界

### ARCH-8. `dataTransformer` 实际是数据访问层

**位置**：`src/utils/dataTransformer.ts`

CLAUDE.md 把它描述为"数据转换层"——但实际：
- 11 个 transform 函数中，9 个接受 `raw: any` 后**承担了运行时校验的角色**
- 没有 schema 校验库（zod / yup）
- 字段映射散落在 `formatNumber` / `formatTimestampToDate` 里

**失败模式**：后端改字段名（`name` → `title`）不会触发 TS 错误，运行时模板里 `{{ playlist.title }}` 显示 undefined。

---

### ARCH-9. `utils/misc.ts` 是个"杂物间"

**位置**：`src/utils/misc.ts`

`shouldTruncate` / `getTruncatedDesc` / `formatTimestampToDate` / `extractLeagcyLyrics` / `extractTTMLLyrics` —— 5 个函数做 4 件不相关的事。

- 文件名 `misc` 暗示"杂项"
- `formatTimestampToDate` 与 `dataTransformer.ts` 重复
- 歌词解析应该在 `utils/lyric/` 独立目录

**修法**：拆 `utils/string.ts` / `utils/date.ts` / `utils/lyric/parser.ts`。

---

### ARCH-10. 组件命名规则自相矛盾

**位置**：CLAUDE.md 原文
> 组件文件 PascalCase 命名（**例外**：`artistDivider.vue`、`songsContainer.vue`、`collectSongToPlaylistDialog.vue`、`BouncingSlider.vue` 等沿用旧命名）

**实际情况**：例外数量已经超过正例。建议：
- 要么彻底统一 PascalCase
- 要么把"约定"改成"camelCase 也允许"

---

### ARCH-11. `auth/Auth` 路径大小写

CLAUDE.md：
> `Auth/` 认证组件（Login/Register/QRCode/ForgotPassword）

**实际目录**：`src/components/common/Auth/` —— 一致，但 `common` 子目录约定（musicComponents / pageComponents / Auth）本身比较混乱。

---

## 🟡 P1 — 抽象层级

### ARCH-12. `core/player/` 模块边界不清

`core/` 在 Vite 项目中通常表示"与框架无关的核心逻辑"，但本项目的 `core/player/MusicController.ts`：
- 直接 `new Audio()`（DOM 依赖）
- 直接 `navigator.mediaSession`（浏览器 API）
- 直接监听 audio 事件

也就是说这个"核心"**重度依赖浏览器**，测试性差。可考虑：
- 拆 `core/player/abstract.ts`（纯逻辑）
- `core/player/browser.ts`（DOM 封装）

---

### ARCH-13. `views/Home/components/` 等嵌套目录

每个视图都有自己的 `components/` 子目录，且子组件和 `components/common/` 下的组件**概念上重复**：

| 视图 | 子组件 | 公共组件 |
|------|--------|----------|
| Home | carousel / PlaylistSection / popularSinger | Carousel / PlaylistGrid / ArtistGrid (common/pageComponents) |
| Playlist | PlaylistHeader / PlaylistContent | CommentList / SongList (common/pageComponents) |
| Album | AlbumHeader / AlbumContent | 同上 |

很多 Header/Content 子组件封装了大量视图特定逻辑，但提取后可能成为 common 的通用组件。

---

## 🟢 P2 — 缺失的工程规范

### ARCH-14. 没有任何单元测试

项目没有 `tests/` / `__tests__/` / `*.test.ts` 目录，零测试覆盖。

`MusicController` / `dataTransformer` / 状态切换逻辑都很容易做单元测试，但项目完全没做。

---

### ARCH-15. 没有 ESLint / Prettier 配置可见

项目根有 `pnpm lint` 命令但未发现 `.eslintrc*` / `.prettierrc*`。CLAUDE.md 提到 `pnpm format` 和 `pnpm lint`，但配置在哪里？

**实际代价**：代码风格在 commit 间漂移，`const isDarkMode = ref(false)` 与 `const isDarkMode=ref(false)` 并存。

---

### ARCH-16. 没有 CI 配置

仓库根目录未见 `.github/workflows/` 或类似 CI 文件。

---

### ARCH-17. `.env` / 环境变量未纳入 CLAUDE.md

CLAUDE.md 提到 `VITE_GLOB_API_URL` 但没有 `.env.example`。

**实际代价**：新人 clone 后不知道该建什么 env 文件。

---

### ARCH-18. Git 提交信息是中文但缺少约定

CLAUDE.md 提交记录：
```
2908102 让footer实现媒介查询
51080d6 为搜索页面实现分页
e473dad 恢复开发
```

没有 commit message 规范（feat/fix/chore 等 prefix）。

---

## 总结

| # | 违反 CLAUDE.md | 严重度 |
|---|---------------|--------|
| ARCH-1 | 单例实例化处描述错 | P0 |
| ARCH-2 | storeToRefs 不全用 | P0 |
| ARCH-3 | API 响应转换不一致 | P0 |
| ARCH-4 | Player.vue 占位仍存在 | P1 |
| ARCH-5 | player.ts 描述错 | P1 |
| ARCH-6 | UpNextQueue v-if=false | P1 |
| ARCH-7 | 缓存限制未文档化 | P1 |
| ARCH-8 | dataTransformer 实为数据访问层 | P1 |
| ARCH-9 | utils/misc.ts 杂物间 | P1 |
| ARCH-10 | 命名规则例外过多 | P1 |
| ARCH-11 | components/common 目录约定不清 | P1 |
| ARCH-12 | core/player 抽象层级 | P1 |
| ARCH-13 | views/components 嵌套 | P1 |
| ARCH-14 | 无单元测试 | P2 |
| ARCH-15 | 无 lint/format 配置 | P2 |
| ARCH-16 | 无 CI | P2 |
| ARCH-17 | 无 .env.example | P2 |
| ARCH-18 | 无 commit 约定 | P2 |
