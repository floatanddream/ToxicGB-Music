# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## 项目概述

ToxicGB-Music 是一个基于 **Vue 3 + TypeScript** 的仿网易云音乐现代音乐播放器 Web 应用，采用苹果音乐风格的 UI 设计，支持深色模式、苹果风格歌词（含 TTML）、毛玻璃效果、全屏播放、MediaSession 锁屏控制。

**后端 API**: NeteaseCloudMusicApi 风格接口。开发环境下通过 Vite 代理 `/api` → `http://192.168.31.157:3000`（参见 `vite.config.ts`）。

**Node.js 版本要求**: `^20.19.0 || >=22.12.0`
**包管理器**: pnpm

---

## Agent参与项目须知

#### 行为规范

1. 不得以任何方式任何理由擅自启动服务实例,无论前端、后端、小程序,只能由人类完成重启或启动
2. 不得以任何Hack方式试图操作数据库,Agent和LLM无法为数据安全负责
3. 文件删除操作先过问用户,得到批准后进行删除

#### 项目理解

1. 理解`.harness`,`docs`下索引以及规则,大致了解项目已有功能和现状,其他文件无需立即阅读
2. 根据代码库,发现并指出实现计划可行性以及潜在风险点,告知用户并由用户选择
3. 制定计划后,需要用户表示同意或同等意思才可执行代码修改

#### 代码执行

1. 简单即是最好,遵守代码规范的前提下使用最简单的方式实现,直至用户要求采用更复杂的实现方式
2. 最小影响面,只修改本次需求有关代码,不要操作无关代码
3. 最小接触面,不要扩大需求范围,不要做与实现需求不相关的事情(比如无法通过测试则修改其他测试)

#### 编码哲学

1. 复杂度即成本,复杂度守恒与成本守恒一体两面,而成本不会消失只会转移,所以复杂度也是如此
2. 显式优于隐式,不省略能够辅助人类和LLM识别和判断逻辑的代码、变量、注释和类型
3. 保持无知,遇到模棱两可的问题及时询问用户,而不是替用户做出判断

## 工作流

#### 提出新需求或更改需求

1. 先查看可能与需求有关文档和记录,初步理解需求,快速定位代码位置
2. 查看代码库有关代码,根据相关代码进一步加深和验证理解
3. 与用户交互式的确认需求,生成计划,用户批准后开始执行代码编写
4. 编写完成后停止,不要扩大范围,等待用户下一步要求
5. 完成后在`docs`下编写文档或更新有关文档

#### 修复代码问题

1. 先查看可能与需求有关文档和记录,初步理解需求,快速定位代码位置
2. 查看代码库有关代码,根据相关代码进一步加深和验证理解
3. 判断用户所提出问题是否与代码潜在问题相符,若有疑问交互式的与用户逐一确认问题特征/症状
4. 无歧义后开始修改,完成后停止,根据用户要求进行测试
5. 用户表示完成后更新`docs`下有关文档

---

## 技术栈

| 类别        | 技术                        | 版本                                          | 说明                                                                                                          |
| ----------- | --------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 前端框架    | Vue 3 + TypeScript          | `^3.5.30`                                     | Composition API (`<script setup lang="ts">`)                                                                  |
| 构建工具    | Vite                        | `^7.3.1`                                      | 快速开发与热更新                                                                                              |
| 状态管理    | Pinia                       | `^3.0.4`                                      | `storeToRefs` 解构响应式数据                                                                                  |
| 路由        | Vue Router                  | `^5.0.3`                                      | 动态导入组件 (`() => import()`)                                                                               |
| 样式        | Tailwind CSS                | `^4.2.2`                                      | 通过 `@tailwindcss/vite` 插件接入                                                                             |
| UI 基础     | Reka UI + shadcn-vue 风格栈 | `reka-ui ^2.9.2`                              | 配套 `class-variance-authority`、`tailwind-merge`、`clsx`、`tw-animate-css`（**非直接依赖 `shadcn-vue` 包**） |
| HTTP 客户端 | ky                          | `^2.0.0`                                      | 现代 Fetch 封装，比 axios 更轻量                                                                              |
| 图标        | Lucide Vue Next             | `^1.0.0`                                      |                                                                                                               |
| 事件总线    | mitt                        | `^3.0.1`                                      | 全局事件通信                                                                                                  |
| Toast 通知  | vue-sonner                  | `^2.0.9`                                      |                                                                                                               |
| 歌词特效    | @applemusic-like-lyrics     | core `^0.2.0` / lyric `^0.3.0` / vue `^0.2.0` | 苹果风格歌词 + 动态 mesh 渐变背景 + TTML                                                                      |
| 工具库      | @vueuse/core                | `^14.2.1`                                     |                                                                                                               |
| 动画        | motion-v                    | `^2.2.1`                                      |                                                                                                               |

> ⚠️ **不要假设** `oklch` 是项目唯一颜色系统 —— `oklch()` 仅在 `src/style.css` 的 shadcn 调色板中；`src/styles/dark-mode.css` 全部使用 hex / `rgba()`。

---

## 项目结构

```
src/
├── api/                              # API 请求模块（统一封装，基于 ky）
│   ├── album.ts                     # 专辑详情、评论
│   ├── artist.ts                    # 歌手50首、详情、专辑、热门歌手
│   ├── banner.ts                    # 首页轮播图
│   ├── lyric.ts                     # 歌词（兼容 lrc/yrc + TTML 外部源）
│   ├── playlist.ts                  # 歌单详情、评论、订阅者、编辑、精选
│   ├── search.ts                    # 6种搜索类型（综合/歌曲/专辑/歌手/歌单/用户）
│   ├── song.ts                      # 歌曲URL获取（exhigh）+ URL HEAD 校验
│   └── user.ts                      # 用户账户、歌单、关注、听歌记录、红心
│
├── components/
│   ├── common/
│   │   ├── Auth/                    # 认证组件（Login/Register/QRCode/ForgotPassword）
│   │   ├── musicComponents/         # 音乐卡片组件
│   │   │   ├── AlbumCard.vue        # 专辑卡片
│   │   │   ├── ArtistCard.vue       # 歌手卡片
│   │   │   ├── PlaylistCard.vue     # 歌单卡片
│   │   │   ├── UserCard.vue         # 用户卡片
│   │   │   ├── SongList.vue         # 无限加载歌曲列表（IntersectionObserver）
│   │   │   ├── artistDivider.vue    # 艺人分隔
│   │   │   └── collectSongToPlaylistDialog.vue
│   │   ├── pageComponents/          # 页面级组件
│   │   │   ├── CommonTabs.vue       # 通用标签页
│   │   │   ├── CommentList.vue / CommentItem.vue
│   │   │   ├── songsContainer.vue
│   │   │   └── AlbumGrid / ArtistGrid / PlaylistGrid / UserGrid.vue
│   │   ├── AppLogo.vue / SearchBar.vue / NavigationMenu.vue
│   │   ├── UserAvatar.vue / AuthModal.vue / PlaylistPanel.vue
│   │
│   ├── layout/                      # 布局组件
│   │   ├── LayoutContainer.vue      # 根布局（Grid、歌词背景、全屏切换）
│   │   ├── TheHeader.vue            # 顶部导航
│   │   ├── TheSidebar.vue           # 侧边栏（菜单、用户歌单，可折叠）
│   │   └── TheFooter.vue            # 底部播放器
│   │
│   ├── misc/                        # 杂项
│   │   ├── BouncingSlider.vue       # 动画滑块（音量/进度）
│   │   └── Menu.vue                 # 右键 / 上下文菜单
│   │
│   └── ui/                          # shadcn-vue 风格基础组件（16 个）
│       ├── button, card, collapsible, context-menu, dialog,
│       ├── input, label, progress, scroll-area, separator,
│       └── sheet, sidebar, skeleton, sonner, tabs, tooltip
│
├── constants/
│   ├── events.ts                    # 14 个事件名常量（注意拼写错误：SCROOL_TOP 缺 L）
│   └── messages.ts                  # 4 个 Toast 消息类型（注意拼写错误：TOAST_SUSSESS）
│
├── core/player/                     # 播放器核心（单例）
│   ├── MusicController.ts           # HTML5 Audio + MediaSession 封装
│   ├── MusicService.ts              # 歌曲URL获取 + Map 缓存 + HEAD 校验
│   └── player.ts                    # 单例导出（import 路径大小写需注意，见下文 ⚠️）
│
├── lib/                             # 工具库（如 cn() = clsx + tailwind-merge）
│
├── router/
│   └── index.ts                     # 路由配置，动态导入，全局 beforeEach 拉用户
│
├── stores/                          # Pinia 状态管理
│   ├── playerStore.ts               # 播放器状态（Composition API）
│   ├── user.ts                      # 用户状态（Options API + localStorage）
│   ├── app.ts                       # 应用状态 ⚠️ 当前为非响应式 const（BUG）
│   └── counter.ts                   # ⚠️ 残留脚手架，建议删除
│
├── styles/
│   └── dark-mode.css                # 主题 CSS 变量 + .glass* 基础类
│
├── types/                           # TypeScript 类型定义
│   ├── album.ts, artist.ts, banner.ts, comment.ts, menu.ts, playlist.ts,
│   ├── musicTypes.ts                # 核心音乐类型
│   ├── player.ts                    # 播放器类型
│   ├── toast.ts, user.ts
│
├── utils/
│   ├── eventBus.ts                  # mitt 实例
│   ├── eventBusHandler/             # 4 个事件处理器
│   │   ├── clickEventHandler.ts     # 路由跳转（Artist/Playlist/Album/User）
│   │   ├── playEventHandler.ts      # 播放控制（replaceList/insertNext/...）
│   │   ├── toastEventHandler.ts     # Toast 通知
│   │   └── userEventHandler.ts      # 用户事件（USER_LOGIN / USER_LIKE_MUSIC）
│   ├── format.ts                    # 数字（亿/万）、时间格式化
│   ├── dataTransformer.ts           # API 数据转换（11 个函数）
│   ├── request.ts                   # ky 封装（拦截器、401 自动刷新）
│   └── misc.ts                      # 描述截断 + 歌词提取（legacy/TTML）
│
├── views/                           # 页面视图
│   ├── Home/                        # 首页（轮播、热门歌手、歌单、榜单、最新音乐）
│   ├── Search/                      # 搜索页
│   ├── Playlist/                    # 歌单页
│   ├── Artist/                      # 歌手页
│   ├── Album/                       # 专辑页
│   ├── User/                        # 用户主页（文档原版未列出）
│   ├── FullscreenPlayer/            # 全屏播放器（取代 Player.vue）
│   │   ├── FullScreenPlayer.vue     # 主体（4:6 grid，左封面+控制，右歌词）
│   │   └── components/
│   │       ├── AlbumCover.vue
│   │       ├── SongControl.vue
│   │       └── UpNextQueue.vue      # 当前 v-if=false 暂未启用
│   └── Player.vue                   # ⚠️ 旧版占位文件（emoji 按钮，未接入路由），可删除
│
├── App.vue                          # 根组件（LayoutContainer + RouterView + scale 过渡）
├── main.ts                          # 入口（Pinia / Router / 4 个 eventHandler / playerStore.init() / userStore.init()）
└── style.css                        # 全局样式（Tailwind + 毛玻璃 + 路由过渡 + 自定义滚动条）
```

---

## 核心类型定义

### 音乐类型 (`types/musicTypes.ts`)

```typescript
interface Song {
  id: string
  title: string
  aliasTitle: string // 歌曲别名
  artist: Artist[]
  album: Album
  duration: string // "04:32"
  cover: string | undefined
}

interface Artist {
  id: string
  name: string
  avatar: string
  fanCount: string // 已格式化
  songCount: string
  verified: boolean
}

interface Album {
  id: string
  title: string
  artist: Artist[]
  cover: string
  releaseDate: string
  songCount: string
}

// 另外还有 RawAlbum / RawUserProfile / Playlist（精简版）
```

### 播放器类型 (`types/player.ts`)

```typescript
type PlayMode = 'loop' | 'single' | 'random'

interface Song extends MusicType.Song {
  url?: string // 由 MusicService 注入
}

type SongLoader = (id: number | string) => Promise<Song>
```

### 其他类型要点

- `types/user.ts` — `UserInfo`、`User`（Netease 完整 profile）、`Account`、`userSimpleInfo`、`UserSongRecord { song, playCount, score }`
- `types/playlist.ts` — 完整 Netease schema（含 `subscribers` / `tracks` 数组）
- `types/album.ts` — 简化版 Album，含可选 `picUrl` / `blurPicUrl` / `publishTime` / `size` / `artists?` / `songs?`
- `types/artist.ts` — `Identify`、`Rank`、`Artist`、`SimpleUserIdentify`、`SecondaryExpertIdentity`、`AvatarDetail`、`ArtistData`
- `types/comment.ts` — `Comment`、`CommentListResponse`、`CommentUser`、`BeRepliedComment`、`IPLocation`、`VipRights`、`Decoration`、`LikeAnimationMap`
- `types/banner.ts` — `Banner { imageUrl, typeTitle, bigImageUrl }`
- `types/toast.ts` — `ToastApi` 包装 vue-sonner
- `types/menu.ts` — `MenuItem`（含递归 `children`）

---

## API 模块

### HTTP 客户端 (`utils/request.ts`)

基于 `ky` 的 `HttpClient` 封装：

- **Base URL**: `import.meta.env.VITE_GLOB_API_URL`
- **拦截器链**: `beforeRequest` / `afterResponse` / `beforeError`（通过 `hooks` 注册）
- **401 自动刷新**: 单次重试保护（`state.retryCount === 0`），调用 `/auth/refresh` 刷新后写回 `localStorage.authToken`
- **Cookie 注入**: 从 `localStorage.cookie` 读取，GET 加 `searchParams.cookie`，POST 加 body
- **超时**: 默认 10s，重试 2 次
- **方法**: `get / post / put / delete / head`

### API 列表

| 模块          | 关键方法                                                                                                                                                                                                          | 功能                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `song.ts`     | `getSongUrl(id)`、`checkUrl(url)`                                                                                                                                                                                 | `/song/url/v1`（level: `'exhigh'`，`sendCookie:true`）+ HEAD 校验 |
| `album.ts`    | `getAlbumDetail(id)`、`getAlbumComments({id,limit,offset,before})`                                                                                                                                                |                                                                   |
| `artist.ts`   | `getArtistTop50(id)`、`getArtistDetail(id)`、`getArtistAlbum(id)`、`getHotArtists(limit,offset)`                                                                                                                  |                                                                   |
| `playlist.ts` | `getPlaylistDetail` / `getPlaylistComments` / `getPlaylistSubscribers` / `getExquisitePlaylists` / `getPlaylistAllTracks` / `modifyPlaylistTracks`                                                                |                                                                   |
| `search.ts`   | `searchByKeyword`（type 1018 综合）/ `Song` / `Album` / `Singer` / `Playlist` / `User`                                                                                                                            | 6 种                                                              |
| `user.ts`     | `getUserFromCookie` / `getUser(uid)` / `fetchUserPlaylist(uid)` / `fetchUserFollows` / `fetchUserFolloweds` / `getUserSimpleIInfo` / `getLikeMusic(uid)` / `likeMusic(id,like)` / `getUserSongRecord(uid,type=1)` | 含「我创建」vs「我收藏」分离                                      |
| `banner.ts`   | `getBanner()`                                                                                                                                                                                                     | 首页轮播                                                          |
| `lyric.ts`    | `getSongLyric(id)`（`/lyric/new`，含 yrc/lrc）、`getTTMLLyric(id)`（外部 `amlldb.bikonoo.com`）                                                                                                                   |                                                                   |

---

## 数据转换层 (`utils/dataTransformer.ts`)

11 个转换函数：

```typescript
transformToArtist() // → Artist
formatTimestampToDate() // 时间戳 → 日期
transformAlbums() // → Album[]
transformToPlaylist() // → Playlist（精简）
transformToUser() // → User
transformToSong() // → Song
transformPlaylistDetail() // → Playlist（含 description 等完整字段）
transformAlbumDetail() // → Album（含 songs）
transformComment() // → Comment
transformCommentListResponse() // → CommentListResponse
```

> 约定：**所有 API 响应必须先转换再使用**，见开发指南。

`utils/misc.ts` 另有：

- `shouldTruncate(text)` / `getTruncatedDesc(text)` — 描述截断
- `extractLeagcyLyrics(data)` — 优先 yrc，回退 lrc（**注意拼写错误 Leagcy**）
- `extractTTMLLyrics(data)` — 提取 TTML

---

## 播放器架构

### MusicController (`core/player/MusicController.ts`)

**单例模式**（由 `core/player/player.ts` 实例化并默认导出）。

**HTML5 Audio 封装**（`new Audio()`）：

- `playSong(song)` / `play()` / `pause()` / `toggle()` / `seek(time)` / `setVolume(0-1)` / `getCurrentTime()` / `getDuration()` / `isPlaying()` / `setMediaSessionHandlers(handlers)`

**事件系统**（内部 `Map<string, EventCallback[]>`）：

- `on(event, cb)` / `off(event, cb)` / `emit(event, payload)`
- 事件名：`timeupdate`、`play`、`pause`、`ended`、`loaded`、`songchange`

**MediaSession API 集成**（锁屏 / 硬件按键控制）：

- 设置 metadata：`title`、`artist`（由 `song.artist[].name` 拼接）、`album`（`song.album.title`）、`artwork`（`{src: cover, sizes: '512x512', type: 'image/jpeg'}`，若有封面）
- 注册 action handlers：`play`、`pause`、`nexttrack`、`previoustrack`、`seekbackward`（默认 10s）、`seekforward`、`seekto`
- 在 `play` / `pause` 时同步 `playbackState`

⚠️ **大小写陷阱**：`player.ts` 中 `import MusicController from './musicController'` 使用的是小写路径，但实际文件名是 `MusicController.ts`。Windows 不会报错，**部署到 Linux / 参与开源时必须修复**（改为 `./MusicController`）。

### MusicService (`core/player/MusicService.ts`)

- `Map<number | string, CachedSong>` 缓存
- `getSong(song)` 流程：缓存查找 → `checkUrl` HEAD 校验 → 失败则调用 `getSongUrl(id)` 重新获取 → 缓存
- `/song/url/v1` 参数：`{id, level: 'exhigh', sendCookie: true, timestamp}`

### playerStore (`stores/playerStore.ts`)

**Composition API**。模块级直接 `new MusicController()`（**只在这里实例化一次**）。

**状态**：

```typescript
playlist: Song[]
currentSong: Song | null
currentIndex: number
isFullScreen: boolean              // 全屏播放器开关
mode: 'loop' | 'single' | 'random'  // 默认 loop
playing: boolean
currentTime: number
duration: number
loading: boolean
volume: number                    // 0-1（UI 显示时 ×100）
randomQueue: number[]             // Fisher-Yates 洗牌结果
randomIndex: number
```

**方法**：

| 方法                                                                 | 功能                                          |
| -------------------------------------------------------------------- | --------------------------------------------- |
| `init()`                                                             | 注册 MediaSession handlers + 监听 player 事件 |
| `replaceList(list, startIndex=0)`                                    | 替换播放列表                                  |
| `playSong(song)`                                                     | 播放单曲（先 reset 队列）                     |
| `insertNext(song)`                                                   | 插入下一首                                    |
| `insertNextAndPlay(song)`                                            | 插入并立即播放                                |
| `switchSong(song)`                                                   | 切换到指定歌曲                                |
| `playByIndex(index)`                                                 | 按索引播放                                    |
| `next()` / `prev()`                                                  | 切歌（处理 shuffle）                          |
| `setMode(mode)`                                                      | 切换播放模式                                  |
| `handleEnded()`                                                      | single 模式重播，否则 `next()`                |
| `play()` / `pause()` / `toggle()`                                    | 播放控制                                      |
| `seek(time)`                                                         | 跳转                                          |
| `setVolume(v)`                                                       | 设置音量（v 是 0-100，内部 /100）             |
| `setFullPlayer(e)`                                                   | 切换全屏                                      |
| `preloadNextSong()`                                                  | **预加载接下来 3 首**（跳过已有 url 的）      |
| `resetRandomQueue()` / `generateRandomQueue()` / `syncRandomIndex()` | 随机队列管理                                  |

**预加载**：`watch(currentIndex, () => preloadNextSong())` 在 store 内注册。

**Fisher-Yates** 在 `generateRandomQueue()` 中（lines 71-74），把当前歌曲放到第 0 位以保证它先播。

---

## 事件系统

### EVENTS 常量 (`constants/events.ts`) — 共 **14** 个

```typescript
// 点击导航
ARTIST_CLICK: 'artist-click'
PLAYLIST_CLICK: 'playlist-click'
ALBUM_CLICK: 'album-click'
USER_CLICK: 'user-click' // ⚠️ 原文档遗漏
SONG_CLICK: 'song-click'
SCROOL_TOP: 'scroll-top' // ⚠️ 拼写错误，缺 L
// 播放控制
PLAY_ALL: 'play-all'
INSERT_NEXT: 'insert-next'
INSERT_AND_PLAY: 'insert-and-play'
SWITCH_SONG: 'switch-song' // ⚠️ 原文档遗漏
TOGGLE_FULLSCREEN: 'toggle-fullscreen' // ⚠️ 原文档遗漏
// 用户事件
USER_LOGIN: 'user-login' // ⚠️ 原文档遗漏
USER_LIKE_MUSIC: 'user-like-music' // ⚠️ 原文档遗漏
USER_COLLECT_SONG: 'user-collect-song' // ⚠️ 原文档遗漏
USER_DELETE_SONG: 'user-delete-song' // ⚠️ 原文档遗漏
```

### Toast 消息 (`constants/messages.ts`)

```typescript
TOAST_SUSSESS // ⚠️ 拼写错误（双 S），常量化已沿用
TOAST_ERROR
TOAST_WARNING
TOAST_INFO
```

### 事件总线处理器 (`utils/eventBusHandler/`)

| Handler             | 订阅事件                                               | 行为             |
| ------------------- | ------------------------------------------------------ | ---------------- |
| `clickEventHandler` | ARTIST/PLAYLIST/ALBUM/USER/SONG_CLICK                  | 路由跳转或日志   |
| `playEventHandler`  | PLAY_ALL / INSERT_NEXT / INSERT_AND_PLAY / SWITCH_SONG | 调用 playerStore |
| `toastEventHandler` | TOAST\_\*                                              | 调用 vue-sonner  |
| `userEventHandler`  | USER_LOGIN / USER_LIKE_MUSIC                           | 调用 userStore   |

`main.ts` 在启动时依次注册上述 4 个 handler。

### 事件触发示例

```typescript
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'

emitter.emit(EVENTS.PLAY_ALL, songs)
emitter.emit(EVENTS.INSERT_NEXT, song)
emitter.emit('TOAST_SUSSESS', '操作成功') // 注意是 SUSSESS
```

---

## 用户状态 (`stores/user.ts`)

**Options API** 风格（与 playerStore 的 Composition API 不同）。

- **持久化 key**: `localStorage['user_store']`
- **缓存间隔**: `FETCH_INTERVAL = 10 * 60 * 1000`（10 分钟）
- **初始化**: `router.beforeEach` 钩子触发 `userStore.fetchUser()`，手动也可调 `userStore.ensureUser()`

**State**：

- `user: User | null`、`account: Account | null`
- `_userCreatePlaylist` / `_userSubPlaylist`（通过 getter 暴露为 `userCreatePlaylist` / `userSubPlaylist`，依据 `subscribed` 标志分离）
- `userLikeListSet: Set<number|string>`（用 Set 加速 `isSongLiked` 查询）
- `userSubCount: userSimpleInfo | null`（关注/粉丝数）

**Actions**：

- `init()` / `fetchUser(force=false)` / `ensureUser()` / `setUser(user, account)` / `resetUser()` / `persist()`
- `toggleLikeMusic(song)` —— 调 `likeMusic(id, !isAlreadyLike)`，通过**新建一个 Set**触发响应式，emit toast

---

## ⚠️ 已知问题

### 1. `stores/app.ts` — 非响应式 const

整个 store 使用 `const isSidebarCollapsed = false` 等**普通变量**而非 `ref()` / `state()`：

```typescript
// 当前（buggy）
const isSidebarCollapsed = false
const isMobileMenuOpen = false
const user = null as UserInfo | null
const searchQuery = ''
const theme = 'light' as 'light' | 'dark'
```

**修复方向**：改为 `defineStore('app', () => { const isSidebarCollapsed = ref(false) ... })` 或 `state: () => ({ ... })`。

### 2. `stores/counter.ts` — 残留脚手架

`count` / `doubleCount` / `increment()` 的 Pinia 模板，**没有任何消费者**。可删除。

### 3. `views/Player.vue` — 旧版占位

未接入路由，仅 emoji 按钮 + 静态进度条。真实全屏播放器是 `views/FullscreenPlayer/FullScreenPlayer.vue`。

### 4. `core/player/player.ts` import 大小写

```typescript
import MusicController from './musicController' // ⚠️ 实际文件是 MusicController.ts
```

Windows 不区分大小写所以能跑；部署到 Linux / CI 时会报模块未找到。

### 5. `constants/events.ts` `SCROOL_TOP` 与 `constants/messages.ts` `TOAST_SUSSESS` 拼写错误

已在整个 codebase 沿用，**不建议改动**（破坏面太大），写新代码时请按现有拼写。

### 6. `utils/misc.ts` `extractLeagcyLyrics` 拼写错误

同上，已沿用。

---

## 主题系统

### CSS 变量 (`styles/dark-mode.css`)

**亮色模式（`:root`，lines 3-28）：**

```css
--bg-primary: #ffffff --bg-secondary: #f8f9fa --bg-tertiary: #f3f4f6
  --bg-card: rgba(255, 255, 255, 0.7) --bg-hover: rgba(243, 244, 246, 0.7) --text-primary: #1f2937
  --text-secondary: #6b7280 --text-tertiary: #9ca3af --text-inverse: #ffffff
  --border-primary: #e5e7eb --border-secondary: rgba(229, 231, 235, 0.5)
  --border-tertiary: rgba(229, 231, 235, 0.3) --shadow-sm / md / lg / xl
  --glass-bg: rgba(255, 255, 255, 0.7) --glass-border: rgba(255, 255, 255, 0.2) --glass-shadow: 0
  8px 32px rgba(0, 0, 0, 0.1);
```

**暗黑模式（`:root.dark`，lines 30-55）：** 镜像 dark 配色（`#0d0d0d`、`#1a1a1a`、白文、`#374151` 边框、`rgba(26,26,26,0.7)` glass 背景）。

### 毛玻璃类（分两个文件）

| 类名               | 定义于                     | 特性                                                                 |
| ------------------ | -------------------------- | -------------------------------------------------------------------- |
| `.glass`           | `dark-mode.css` (line 131) | `backdrop-filter: blur(20px) saturate(180%)`，使用 CSS 变量          |
| `.glass-light`     | `dark-mode.css`            | 纯 `rgba(255,255,255,0.85)`，无 backdrop-filter                      |
| `.glass-dark`      | `dark-mode.css`            | 纯 `rgba(26,26,26,0.85)`，无 backdrop-filter                         |
| `.glass-container` | `style.css`                | `blur(18px) saturate(200%) brightness(1.2) contrast(1.05)` + padding |
| `.glass-card`      | `style.css`                | 同上，卡片样式                                                       |
| `.glass-effect`    | `style.css`                | 同上 + 强调发光                                                      |
| `.glass-component` | `style.css` (line 385)     | 侧边栏变体                                                           |

**移动端降级**（`dark-mode.css` line 230-235）：`@media (max-width: 768px) { .glass { backdrop-filter: blur(10px) saturate(180%) } }`。

**`style.css` 也含 `oklch()`**：shadcn 调色板（`--background`、`--foreground`、`--card`、`--primary`、`--destructive`、`--chart-1..5`、`--sidebar-*`），位于 `:root`（line 110-151）。自定义 `--primary-color: #e74c3c` 等。

### 主题切换

- **实现**: `document.documentElement.classList.toggle('dark')`（在 `LayoutContainer.vue` lines 47-54 初始化）
- **持久化**: `localStorage.setItem('theme', 'dark'|'light')`
- **系统偏好**: `window.matchMedia('(prefers-color-scheme: dark)')`
- **触发位置**: `TheHeader.vue`, `TheSidebar.vue`

---

## 特色功能

### 全屏播放器 (`views/FullscreenPlayer/FullScreenPlayer.vue`)

- **布局**: 2 列 grid `4fr 6fr`，左侧 = `AlbumCover` + `SongControl`，右侧 = `LyricPlayer`（TTML 优先，回退 legacy）
- **触发**: `playerStore.setFullPlayer(true)` / `EVENTS.TOGGLE_FULLSCREEN`
- **退出**: ESC 键（`onUnmounted` 清理），或右上角关闭按钮
- **集成**: `LayoutContainer.vue` 用 `v-if="!isFullScreen"` 隐藏主布局，`FullScreenPlayer` 用 slide-up 过渡（`translateY(100%)`）

### 苹果风格歌词背景 (`LayoutContainer.vue`)

```typescript
import { BackgroundRender } from '@applemusic-like-lyrics/vue'
import { MeshGradientRenderer } from '@applemusic-like-lyrics/core'

// 用 currentSong.cover 作为动态背景（无播放时用 user.avatarUrl）
// 暗黑模式叠加红色线性渐变
```

固定定位 `<BackgroundRender>`，90fps mesh gradient。

### 无限加载 (`SongList.vue`)

```typescript
const DISPLAY_BATCH_SIZE = 20
const displayCount = ref(DISPLAY_BATCH_SIZE)
const loadMore = () => {
  displayCount.value += DISPLAY_BATCH_SIZE
}
```

使用 `IntersectionObserver` 监听底部哨兵元素。

### 随机播放（Fisher-Yates 洗牌）

```typescript
const generateRandomQueue = () => {
  const len = playlist.value.length
  randomQueue.value = Array.from({ length: len }, (_, i) => i)
  for (let i = len - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[randomQueue.value[i], randomQueue.value[j]] = [randomQueue.value[j], randomQueue.value[i]]
  }
}
```

实现位于 `stores/playerStore.ts:66-83`，且把当前歌曲放到队列首位。

---

## 路由配置 (`router/index.ts`)

| 路径        | 名称       | 组件                                 |
| ----------- | ---------- | ------------------------------------ |
| `/`         | `Home`     | `views/Home/index.vue`               |
| `/search`   | `Search`   | `views/Search/index.vue`             |
| `/playlist` | `playlist` | `views/Playlist/index.vue`           |
| `/artist`   | `artist`   | `views/Artist/index.vue`             |
| `/album`    | `album`    | `views/Album/index.vue`              |
| `/user`     | `user`     | `views/User/index.vue` ⚠️ 原文档遗漏 |

全部 `() => import(...)` 懒加载。`createWebHistory(import.meta.env.BASE_URL)`。全局 `beforeEach` 调用 `userStore.fetchUser()`（未加载时）。

---

## Vite 配置 (`vite.config.ts`)

- **Plugins**: `vue()`, `vueDevTools()`, `tailwindcss()`, `wasm()`, `topLevelAwait()`
- **Alias**: `'@': path.resolve(__dirname, './src')`
- **Server**: `host: '0.0.0.0'`，proxy `/api` → `http://192.168.31.157:3000`（`changeOrigin: true`，`rewrite: '/api' → ''`）
- **端口**: 未指定（Vite 默认 5173）

---

## 常用命令

```bash
pnpm dev          # 开发模式
pnpm build        # 构建生产版本
pnpm type-check   # 类型检查
pnpm format       # 代码格式化
pnpm preview      # 预览构建结果
pnpm lint         # Lint 检查
```

---

## 开发指南

### 组件开发规范

- 使用 `<script setup lang="ts">` 语法
- Tailwind CSS 进行样式设计（v4，via `@tailwindcss/vite`）
- 暗黑模式样式使用 `.dark` 选择器
- 毛玻璃效果使用 `backdrop-filter: blur()`，参考主题系统章节选用类名
- 组件文件 PascalCase 命名（**例外**：`artistDivider.vue`、`songsContainer.vue`、`collectSongToPlaylistDialog.vue`、`BouncingSlider.vue` 等沿用旧命名）

### 组件通信

1. **Props/Events**: 父子组件通信
2. **mitt 事件总线**: 跨组件通信（用 `EVENTS.*` 常量）
3. **Pinia Store**: 全局状态管理（`storeToRefs` 解构）

### API 调用规范

```typescript
import { getAlbumDetail } from '@/api/album'
const data = await getAlbumDetail(id)
```

### 数据转换规范

```typescript
import { transformToSong } from '@/utils/dataTransformer'
const song = transformToSong(apiResponse)
```

---

## 注意事项

- **播放器单例**: 只在 `core/player/player.ts` 中 `new MusicController()` 一次
- **事件总线初始化**: 在 `main.ts` 中注册 4 个 handler
- **使用 `storeToRefs`**: 从 store 解构响应式数据
- **HTTP 库**: 使用 `ky` 而非 `axios`
- **颜色系统**: `dark-mode.css` 用 hex/rgba，`style.css` 部分用 `oklch()` —— **不要假设统一**
- **导入路径**: `@/` 指向 `src/`
- **拼写错误**：`SCROOL_TOP` / `TOAST_SUSSESS` / `extractLeagcyLyrics` 沿用旧拼写，不要改
