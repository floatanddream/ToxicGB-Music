# 维度 5 — UI 与样式

> **结论**：玻璃态类泛滥（9 个变体）、CSS 巨型块（TheFooter 344 行）、响应式双向（min-width vs max-width）混用、emoji 当图标——这套样式体系不是"有规范但执行差"，而是**根本没有规范**。

---

## 🔴 P0 — 视觉故障

### UI-1. `AuthModal` 二维码模式 max-height=0，扫码内容被裁剪

**位置**：`src/components/common/AuthModal.vue:111-115, 195-208`

**现象**：容器默认 `max-height: 0; overflow: hidden`，切换到扫码登录后内容可能完全被裁剪。

**failure_scenario**：用户点击"扫码登录"tab → 表单内容在容器中不可见。

**修法**：改 `max-height` 为足够大值或改为 `opacity` + `pointer-events` 控制可见性。

---

### UI-2. `PlaylistPanel` 在移动端被裁剪（无响应式）

**位置**：`src/components/common/PlaylistPanel.vue:127-140`

**现象**：固定宽度 380px + 10px margin，没有移动端断点。

**failure_scenario**：375px 视口下播放列表面板总宽约 400px → 被裁剪或横向溢出整个屏幕。

---

## 🟡 P1 — 重复 / 不一致

### UI-3. `.fade-slide` / `.bg-blur-circle` / `@keyframes float` 在 4+ 页面重复

**位置**：
- `src/views/Album/index.vue:148-188`
- `src/views/Playlist/index.vue:197-243`
- `src/views/Artist/index.vue:82-128`
- `src/views/User/index.vue:113-153`

**现象**：4 份几乎相同的 scoped CSS 块（fade-slide enter/leave/from/to + bg-blur-circle + @keyframes float）。

**实际代价**：180-220 行重复 CSS；修改动画时长、位移或加 `prefers-reduced-motion` 时必须同步 4 处。

**修法**：抽到 `style.css` 或新建 `styles/animations.css`，全局 mixin。

---

### UI-4. TheFooter 单文件 344 行 scoped CSS

**位置**：`src/components/layout/TheFooter.vue:154-497`

**现象**：玻璃背景 + 控件 + 滑块 + 明暗主题 + 两个响应式断点 + 面板动画全部塞在一个组件。

**实际代价**：单组件样式块 > 模板 + 逻辑主体；任何播放器视觉调整都要在 340+ 行局部样式中排查，绕过全局设计令牌。

**修法**：拆成 `<PlayerProgress>` `<VolumeControl>` `<PlaylistButton>` 子组件各自管样式。

---

### UI-5. 9 个 glass\* 变体散落

**位置**：
- `src/style.css:19-106, 398-409` — `glass-container` `glass-card` `glass-effect` `glass-component`
- `src/styles/dark-mode.css` — `glass` `glass-light` `glass-dark`
- `src/views/Search/index.vue:582-603` — `glass-tab` `glass-tab-container`

**现象**：blur 从 8px 到 20px 不等，颜色规则各异。

**实际代价**：开发者无法判断该用哪个；主题切换要维护多份 dark 覆盖；多个 `backdrop-filter` 叠加严重影响低端机性能。

**修法**：统一定义 `--glass-blur-sm/md/lg` 等 token，所有 glass 类只引用 token。

---

### UI-6. 响应式双向：min-width 与 max-width 混用

**位置**：
- Tailwind `md:` `lg:` 移动优先（min-width）— Search.vue 等
- 手写 `@media (max-width: 768px)` 桌面优先 — Search.vue:622, TheFooter.vue:410, TheSidebar.vue:220, Playlist.vue:223
- 断点值还混用 480px / 640px / 768px

**failure_scenario**：在 768px 视口时，Tailwind `md:` (`min-width: 768px`) 与手写 `max-width: 768px` 同时生效，级联冲突。

**修法**：统一用 Tailwind v4 移动优先 + 抽出自定义断点。

---

### UI-7. 颜色系统分裂：Tailwind oklch + hex + rgba

**位置**：
- `src/style.css:110-151` — shadcn 调色板用 `oklch()`
- `src/styles/dark-mode.css` — 全 hex/rgba
- `src/views/Search/index.vue:546-603` — `#0ea5e9` `#0284c7` `#8b5cf6` `#ec4899` `#10b981` `#059669` 等 7+ hex
- `src/components/layout/TheFooter.vue:269, 328, 354` — `#fa233b` `#d91a2e` 等 5+ 红色变体
- `src/components/common/SearchBar.vue` / `NavigationMenu.vue` / `TheSidebar.vue` 各自硬编码蓝色或红色体系

**实际代价**：换主题 / 品牌色时要改几十个文件；亮暗模式对比度无法集中验证。

**修法**：抽 `tokens.css` 定义 `--color-primary` `--color-primary-hover` `--glass-blur` 等，所有组件引用。

---

## 🟡 P1 — 图标系统

### UI-8. emoji 字符串做图标，16 个 v-if 重复分支

**位置**：`src/components/common/NavigationMenu.vue:5-40, 54`

**现象**：
```ts
{ id: 'theme-toggle', label: '主题', icon: '🎨' }
{ id: 'home', label: '首页', icon: '🏠' }
```
模板内 4 处 `v-if="item.icon === '🎨'"` 重复匹配。

**实际代价**：
- 加菜单项要在 4 处加 v-if 分支。
- emoji 在不同操作系统渲染不一致（Apple/Google/Twemoji 差异大）。

---

### UI-9. lucide 图标导入命名不一致

**位置**：跨多文件

- `Play` vs `PlayIcon`
- `X` vs `XIcon`
- `Music` vs `ListMusic` （不同图标被当成可互换使用）

**现象**：`Search/index.vue` 用 `SearchIcon, Loader2`；`TheFooter.vue` 用 `Play, Pause`；`FullscreenPlayer.vue` 用 `X`。`collectSongToPlaylistDialog` 还 import 了 `Heart, Plus` 但从未使用。

**实际代价**：全局搜索图标用法不可靠；IDE 智能提示效率低；lint 报警。

---

## 🟢 P2 — 细节

### UI-10. `style.css` 自定义 `--primary-color: #e74c3c` 与 shadcn 调色板并存

**位置**：`src/style.css`

shadcn 默认 `--primary: oklch(...)`；自定义 CSS 又叠 `--primary-color: #e74c3c`。两个并存的"主题色"系统，导致 Tailwind 颜色和硬编码颜色完全不同步。

---

### UI-11. `Music2` 图标在多处使用但 prop 命名混乱

`Search/index.vue` 用 `Music2`，`TheSidebar.vue` 用 `Music`，`SongList` 用 `ListMusic` —— 三处都表示"歌曲"但图标视觉差异。

---

### UI-12. 滚动条样式重复定义

每个 `.scrollbar` / `::-webkit-scrollbar` 在不同文件单独写：
- `style.css`
- `TheSidebar.vue:359-374`
- 也许其他

没有统一的 `useScrollbarStyle()` 工具。

---

## 总结

| # | 问题 | 严重度 | 关键文件 |
|---|------|--------|----------|
| UI-1 | AuthModal 二维码被裁 | P0 | AuthModal.vue |
| UI-2 | PlaylistPanel 移动端溢出 | P0 | PlaylistPanel.vue |
| UI-3 | fade-slide 重复 4+ 次 | P1 | Album/Playlist/Artist/User |
| UI-4 | TheFooter 344 行样式 | P1 | TheFooter.vue |
| UI-5 | 9 个 glass* 变体 | P1 | style.css + dark-mode.css + Search |
| UI-6 | 响应式双向混用 | P1 | 全局 |
| UI-7 | 颜色系统分裂 | P1 | style.css + dark-mode.css + 各组件 |
| UI-8 | emoji 做图标 | P1 | NavigationMenu.vue |
| UI-9 | lucide 命名不一致 | P1 | 全局 |
| UI-10 | --primary-color 双系统 | P2 | style.css |
| UI-11 | Music 图标混用 | P2 | 多文件 |
| UI-12 | 滚动条样式重复 | P2 | 多文件 |
