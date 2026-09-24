# ToxicGB-Music

网易云音乐第三方播放器，基于 Vue 3 + TypeScript，苹果音乐（Apple Music）风格 UI。

<!-- 截图位：建议放首页 + 全屏播放器各一张 -->

---

## ⚠️ 先读这条：本项目只有前端，必须自备后端

所有数据 —— 歌曲、歌词、MV、歌单、歌手、专辑、评论、登录 —— 都来自
[`NeteaseCloudMusicApi`](https://www.npmjs.com/package/NeteaseCloudMusicApi)（网易云音乐 NodeJS 版 API）。

**不把它跑起来，你会看到一堆加载失败的空白页面。** 本项目**不附带**任何后端，也不对其可用性负责。

```sh
# 起后端，默认监听 3000 端口
npx NeteaseCloudMusicApi
```

跑起来后打开 http://localhost:3000 ，能返回 JSON 就说明就绪。

> 后端不在本机（例如跑在局域网另一台机器、或换了端口）时，改 `.env.local` 里的
> `VITE_PROXY_TARGET` 指过去即可 —— 见「配置」一节。

---

## 功能

- **浏览** —— 首页（轮播 / 热门歌手 / 推荐歌单 / 榜单 / 最新音乐）、搜索（综合 · 歌曲 · 专辑 · 歌手 · 歌单 · 用户）、歌单页、歌手页、专辑页、用户主页
- **播放** —— 全屏播放器，苹果风格歌词（TTML 优先，回退 LRC）、动态 mesh 渐变背景、三种播放模式（列表循环 / 单曲循环 / 随机）
- **音效** —— 10 段均衡器（12 组预设）、变速、不改变速度的变调（±12 半音）
- **MV 背景** —— 歌曲存在 MV 时可把 MV 作为全局背景，与歌曲同步播放 / 暂停 / 进度
- **状态持久化** —— 刷新页面后恢复播放队列与「播到第几首」；音量 / 音效设置同样持久化
- **MediaSession** —— 锁屏与硬件媒体键控制
- **界面** —— 深色模式、毛玻璃、无限滚动、右键菜单

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3（`<script setup>` + Composition API）、TypeScript、Vite |
| 状态 | Pinia |
| 路由 | Vue Router（全懒加载） |
| 样式 | Tailwind CSS v4 |
| UI 基础 | reka-ui + shadcn-vue 风格栈（`class-variance-authority` / `tailwind-merge` / `clsx`） |
| HTTP | ky |
| 歌词与背景 | [@applemusic-like-lyrics / amll](https://github.com/amll-dev/applemusic-like-lyrics)（TTML 歌词 + mesh 渐变渲染器，**AGPL-3.0** —— 见 [致谢](#致谢)） |
| 变调 | @soundtouchjs/audio-worklet（WSOLA） |
| 其他 | mitt（事件总线）、vue-sonner（Toast）、motion-v、@vueuse/core |

## 快速开始

### 环境要求

- Node.js `^20.19.0 || >=22.12.0`
- pnpm

### 1. 起后端

```sh
npx NeteaseCloudMusicApi
```

### 2. 装依赖

```sh
pnpm install
```

### 3. 配置（可选）

`.env.development` 里已经是可以直接用的默认值（前端请求 `/api`，Vite 开发代理转发到
`http://localhost:3000`），**后端跑在本机的话什么都不用改**。

需要覆盖时，复制模板再改：

```sh
cp .env.example .env.local
```

| 变量 | 作用 | 默认 |
| --- | --- | --- |
| `VITE_GLOB_API_URL` | 浏览器侧请求的 API 前缀 | `/api` |
| `VITE_PROXY_TARGET` | Vite 开发代理的目标，即后端地址 | `http://localhost:3000` |

`.env.local` 已在 `.gitignore` 里，不会进版本库。

### 4. 跑起来

```sh
pnpm dev
```

### 常用命令

```sh
pnpm dev          # 开发
pnpm build-only   # 只打包，不做类型检查（见「已知问题」）
pnpm build        # 打包 + 类型检查
pnpm type-check   # 类型检查
pnpm preview      # 预览打包结果
pnpm format       # 格式化
```

## 已知问题

- **`pnpm build` 目前会失败** —— 仓库里有若干既存 TypeScript 错误（集中在首页轮播、
  二维码登录、全屏播放器等处），而 `build` 脚本是 `run-p type-check build-only`，
  类型检查非零退出就会让整条命令失败。**只想验证能否打包请用 `pnpm build-only`。**
  欢迎 PR 修这些错误。
- **没有测试** —— 仓库里没有测试框架，也没有任何测试用例。
- 歌曲 / MV 的 CDN 直链是 `http://`，本地开发无碍；但若把前端部署到 HTTPS 域名，
  浏览器会按混合内容策略拦掉音频与视频。

## 项目结构

```
src/
├── api/           各接口封装（album / artist / banner / lyric / mv / playlist / search / song / user）
├── components/
│   ├── common/    业务组件（音乐卡片、评论、音效设置、各页面级容器）
│   ├── layout/    布局（LayoutContainer / TheHeader / TheSidebar / TheFooter / FullPageBackground）
│   ├── misc/      杂项（动画滑块、右键菜单）
│   └── ui/        shadcn-vue 风格基础组件（21 个）
├── core/player/   播放器核心（MusicController 封装 audio + Web Audio；MusicService 解析并缓存地址）
├── stores/        Pinia（playerStore / user / settings）
├── styles/        全局样式（tokens / glass / buttons / animations）
├── types/         TypeScript 类型
├── utils/         工具（request / dataTransformer / eventBus / format）
└── views/         页面（Home / Search / Playlist / Artist / Album / User / FullscreenPlayer）
```

## 文档

- `CLAUDE.md` —— 面向 AI 助手与开发者的项目说明书，含架构说明、约束与踩过的坑
- `docs/superpowers/` —— 各功能的原始设计文档与实施计划
- `docs/code-review/` —— 一次代码评审的产物

## 致谢

本项目**受 [Apple Music Like Lyrics（amll）](https://github.com/amll-dev/applemusic-like-lyrics) 启发** ——
界面上最核心的那部分观感，逐字高亮的苹果风格歌词、跟随封面流动的 mesh 渐变背景，
直接来自它的三个包：

| 包 | 在本项目里负责 |
| --- | --- |
| `@applemusic-like-lyrics/core` | mesh 渐变背景渲染器（`MeshGradientRenderer`） |
| `@applemusic-like-lyrics/lyric` | TTML 歌词解析 |
| `@applemusic-like-lyrics/vue` | 上面两者的 Vue 封装（`BackgroundRender` / `LyricPlayer`） |

没有 amll，这个项目的界面会是另一副样子。歌词数据本身来自网易云。

> ⚠️ amll 以 **AGPL-3.0** 授权，本项目作为它的衍生作品也因此以 AGPL-3.0 发布。

## 免责声明

本项目为**非官方**第三方客户端，仅供学习与技术交流使用。所有音乐、歌词、MV 等内容的
版权归网易云音乐及其权利人所有。使用本软件产生的一切后果由使用者自行承担，作者不对
任何版权问题或服务条款问题负责。请勿用于商业用途。

## License

[GNU Affero General Public License v3.0](./LICENSE)（AGPL-3.0）

之所以是 AGPL-3.0 而不是更宽松的许可证：本项目运行时依赖 amll，而它是 AGPL-3.0，
具有传染性 —— 包含它的作品必须整体以同一许可证分发。没有别的选择，除非把这个项目的
歌词与背景渲染全部重写。

这条许可证比 GPL 多一项要求（第 13 条，即「网络服务条款」）：如果你把**修改过的**
版本部署成公开可访问的服务，需要向使用者提供你的源代码。自己本地跑、或者原样部署，
都没有额外义务。

