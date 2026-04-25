# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## 项目概述

ToxicGB-Music 是一个基于 Vue 3 + TypeScript 的现代音乐播放器 Web 应用，采用苹果音乐风格的 UI 设计，支持深色模式、歌词显示、音乐播放等核心功能。后端 API 位于 `http://127.0.0.1:3000`。

**Node.js 版本要求**: `^20.19.0 || >=22.12.0`
**包管理器**: pnpm

---

## 技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Vue 3 + TypeScript | Composition API (`<script setup lang="ts">`) |
| 构建工具 | Vite | 快速开发与热更新 |
| 状态管理 | Pinia | `storeToRefs` 解构响应式数据 |
| 路由 | Vue Router 3 | 动态导入组件 (`() => import()`) |
| 样式 | Tailwind CSS | `oklch` 颜色系统 |
| UI组件 | shadcn-vue + Reka UI | 基础组件库 |
| HTTP客户端 | ky | 现代 Fetch API 封装，比 axios 更轻量 |
| 图标 | Lucide Vue Next | |
| 事件总线 | mitt | 全局事件通信 |
| Toast通知 | vue-sonner | |
| 歌词特效 | @applemusic-like-lyrics | 苹果风格歌词 + 动态背景 |

---

## 项目结构

```
src/
├── api/                         # API 请求模块（统一封装，基于 ky）
│   ├── album.ts                # 专辑详情、评论
│   ├── artistPage.ts           # 歌手50首、详情、专辑
│   ├── playlist.ts             # 歌单详情、评论、订阅者
│   ├── search.ts               # 6种搜索类型（综合/歌曲/专辑/歌手/歌单/用户）
│   ├── song.ts                 # 歌曲URL获取（exhigh音质）
│   └── user.ts                 # 用户账户、歌单
│
├── components/
│   ├── common/
│   │   ├── Auth/               # 认证组件（Login/Register/QRCode/ForgotPassword）
│   │   ├── musicComponents/    # 音乐卡片组件
│   │   │   ├── AlbumCard.vue          # 专辑卡片
│   │   │   ├── ArtistCard.vue         # 歌手卡片（头像、粉丝数、认证标识）
│   │   │   ├── PlaylistCard.vue       # 歌单卡片（播放/喜欢按钮）
│   │   │   ├── SongList.vue           # 无限加载歌曲列表（IntersectionObserver）
│   │   │   ├── artistDivider.vue      # 艺人分隔（hover显示完整列表）
│   │   │   └── DescriptionWithDialog.vue
│   │   └── pageComponents/     # 页面级组件
│   │       ├── CommonTabs.vue         # 通用标签页
│   │       ├── CommentList.vue         # 评论列表
│   │       ├── CommentItem.vue         # 评论项
│   │       └── songsContainer.vue      # 歌曲容器
│   │
│   ├── layout/                 # 布局组件
│   │   ├── TheHeader.vue       # 顶部导航（Logo、搜索栏、主题切换、用户头像）
│   │   ├── TheSidebar.vue       # 侧边栏（菜单、用户歌单列表，可折叠）
│   │   ├── TheFooter.vue        # 底部播放器（歌曲信息、播放控制、进度条、音量）
│   │   └── LayoutContainer.vue # 根布局（Grid: header/sidebar/main，含歌词背景渲染）
│   │
│   └── ui/                     # shadcn-vue 基础组件
│       ├── button/, card/, dialog/, input/, label/
│       ├── scroll-area/, separator/, sheet/, skeleton/
│       ├── sidebar/, sonner/, tabs/, tooltip/, collapsible/
│
├── constants/
│   ├── events.ts               # 9种事件名称常量
│   └── messages.ts             # 4种Toast消息类型
│
├── core/player/                # 播放器核心（单例模式）
│   ├── MusicController.ts      # HTML5 Audio 封装，事件系统
│   ├── MusicService.ts         # 歌曲URL获取 + Map缓存
│   └── player.ts               # 单例导出
│
├── router/
│   └── index.ts                # 路由配置，动态导入
│
├── stores/                     # Pinia 状态管理
│   ├── playerStore.ts          # 播放器状态（播放列表、播放控制、预加载）
│   ├── user.ts                 # 用户状态（localStorage持久化、10分钟缓存）
│   └── app.ts                  # 应用状态
│
├── styles/
│   ├── dark-mode.css           # 暗黑模式 CSS 变量系统
│   └── dark-mode-pro.css      # 高对比度版本
│
├── types/                      # TypeScript 类型定义
│   ├── album.ts, artist.ts, comment.ts, menu.ts
│   ├── musicTypes.ts           # 核心音乐类型（S/D/Artist/Album/Playlist/User）
│   ├── player.ts               # 播放器类型（PlayMode, Song扩展）
│   ├── playlist.ts, toast.ts, user.ts
│
├── utils/
│   ├── eventBus.ts             # mitt 事件总线实例
│   ├── eventBusHandler/        # 事件处理器
│   │   ├── clickEventHandler.ts    # 路由跳转（Artist/Playlist/Album）
│   │   ├── playEventHandler.ts     # 播放控制（replaceList/insertNext/insertAndPlay）
│   │   └── toastEventHandler.ts    # Toast通知（success/error/warning/info）
│   ├── format.ts               # 数字/时间格式化
│   ├── dataTransformer.ts      # API数据转换（11个转换函数）
│   ├── request.ts              # ky 封装（拦截器、401自动刷新Token）
│   └── misc.ts                 # 杂项工具
│
├── views/                      # 页面视图
│   ├── Home/                   # 首页（轮播、热门歌手、歌单、榜单）
│   ├── Search/                 # 搜索页（6种结果类型）
│   ├── Playlist/                # 歌单页（歌曲、评论、收藏者）
│   ├── Artist/                  # 歌手页（专辑、视频、动态）
│   └── Album/                   # 专辑页（歌曲、评论）
│
├── App.vue                     # 根组件
├── main.ts                     # 入口文件（事件总线初始化）
└── style.css                   # 全局样式（Tailwind + 毛玻璃效果）
```

---

## 核心类型定义

### 音乐类型 (`types/musicTypes.ts`)

```typescript
interface Song {
  id: string;
  title: string;
  aliasTitle: string;     // 歌曲别名标题
  artist: Artist[];
  album: Album;
  duration: string;       // 时长字符串（如 "04:32"）
  cover: string | undefined;
}

interface Artist {
  id: string;
  name: string;
  avatar: string;
  fanCount: string;        // 粉丝数（已格式化字符串）
  songCount: string;      // 歌曲数
  verified: boolean;       // 是否已认证
}

interface Album {
  id: string;
  title: string;
  artist: Array<Artist>;
  cover: string;
  releaseDate: string;     // 发布日期
  songCount: string;       // 歌曲数
}

interface Playlist {
  id: string;
  title: string;
  creator: User;
  cover: string;
  songCount: string;
  playCount: string;       // 播放次数
  likeCount: string;       // 收藏数
  isLiked: boolean;
  description: string;
  updateTime: string;
}

interface User {
  id: string;
  name: string;
  avatar: string;
  fanCount: string;
  songCount: string;
  isFollowing: boolean;
}
```

### 播放器类型 (`types/player.ts`)

```typescript
type PlayMode = 'loop' | 'single' | 'random';

interface Song extends MusicType.Song {
  url?: string;           // 歌曲URL（扩展自 Song）
}

type SongLoader = (id: number | string) => Promise<Song>
```

---

## API 模块

### HTTP 客户端 (`utils/request.ts`)

基于 `ky` 的封装，关键特性：
- **拦截器链**: 请求/响应/错误拦截
- **401 自动刷新 Token**: token 过期时自动刷新
- **Cookie 自动携带**: 跨请求保持会话
- **超时**: 默认 10s，重试 2 次
- **Base URL**: `http://127.0.0.1:3000`

### API 列表

| 模块 | 关键方法 | 功能 |
|------|----------|------|
| `song.ts` | `getSongUrl(id)` | 获取歌曲URL，使用 `/song/url/v1` 接口，exhigh 音质 |
| `album.ts` | `getAlbumDetail(id)`, `getAlbumComments(params)` | 专辑详情 + 评论 |
| `artistPage.ts` | `getArtistTop50(id)`, `getArtistDetail(id)`, `getArtistAlbum(id)` | 歌手50首、详情、专辑列表 |
| `playlist.ts` | `getPlaylistDetail(id)`, `getPlaylistComments(params)`, `getPlaylistSubscribers(params)` | 歌单详情、评论、订阅者 |
| `search.ts` | `searchByKeyword/Song/Album/Singer/Playlist/User(keyword)` | 6种搜索类型 |
| `user.ts` | `getUserFromCookie()`, `fetchUserPlaylist(uid)` | 用户账户、歌单（创建/收藏分离） |

---

## 数据转换层 (`utils/dataTransformer.ts`)

将 API 原始数据转换为项目类型，11个转换函数：

```typescript
transformToArtist()             // Artist
transformAlbums()               // Album[]
transformToPlaylist()           // Playlist (精简版)
transformPlaylistDetail()       // Playlist (完整版，含description等)
transformToUser()               // User
transformToSong()               // Song
transformAlbumDetail()          // Album (完整版，含songs)
transformCommentListResponse()  // CommentListResponse
formatTimestampToDate()         // 时间戳 → 日期字符串
shouldTruncate()                // 判断描述是否需要截断
getTruncatedDesc()              // 获取截断后的描述
```

---

## 播放器架构

### MusicController (`core/player/MusicController.ts`)

**单例模式**，封装 HTML5 Audio API：

- **事件系统**: `on/off/emit` 订阅发布模式
- **触发事件**: `timeupdate`, `play`, `pause`, `ended`, `loaded`, `songchange`
- **播放控制**: `play()`, `pause()`, `toggle()`, `seek(time)`, `setVolume(vol)`
- **状态查询**: `getCurrentTime()`, `getDuration()`, `isPlaying()`

```typescript
// 使用示例
import player from '@/core/player/player'

player.on('timeupdate', (time) => {
  playerStore.currentTime = time
})
```

### MusicService (`core/player/MusicService.ts`)

- 使用 `Map<string, string>` 缓存已获取的歌曲 URL
- `getSong(song)`: 缓存查找 → API获取 → 缓存存储

```typescript
const songUrl = await musicService.getSong(song)
```

### playerStore (`stores/playerStore.ts`)

Pinia 状态管理，核心架构：

```typescript
// 状态
playlist: Song[]           // 播放列表
currentSong: Song | null // 当前歌曲
currentIndex: number      // 当前索引
mode: PlayMode           // 'loop' | 'single' | 'random'
playing: boolean         // 播放状态
currentTime: number      // 当前时间（秒）
duration: number         // 总时长（秒）
volume: number           // 音量 0-1

// 随机播放队列（Fisher-Yates 洗牌算法）
randomQueue: number[]
randomIndex: number

// 预加载机制
preloadNextSong()         // watch(currentIndex) 自动预加载后续3首
```

**播放器方法**:

| 方法 | 功能 |
|------|------|
| `init()` | 初始化 |
| `replaceList(list, startIndex?)` | 替换播放列表 |
| `playSong(song)` | 播放单曲 |
| `insertNext(song)` | 插入下一首 |
| `insertNextAndPlay(song)` | 插入并立即播放 |
| `play()` / `pause()` / `toggle()` | 播放控制 |
| `next()` / `prev()` | 切歌 |
| `seek(time)` | 跳转 |
| `setMode(mode)` | 设置播放模式 |
| `setVolume(vol)` | 设置音量 |

---

## 事件系统

### EVENTS 常量 (`constants/events.ts`)

```typescript
ARTIST_CLICK: 'artist-click'       // 歌手点击 → 跳转歌手页
PLAYLIST_CLICK: 'playlist-click'   // 歌单点击 → 跳转歌单页
ALBUM_CLICK: 'album-click'          // 专辑点击 → 跳转专辑页
SONG_CLICK: 'song-click'           // 歌曲点击 → 播放/插入
SCROOL_TOP: 'scroll-top'           // 滚动到顶
PLAY_ALL: 'play-all'               // 播放全部
INSERT_NEXT: 'insert-next'         // 插入下一首
INSERT_AND_PLAY: 'insert-and-play' // 插入并播放
```

### Toast 消息 (`constants/messages.ts`)

```typescript
TOAST_SUCCESS, TOAST_ERROR, TOAST_WARNING, TOAST_INFO
```

### 事件触发示例

```typescript
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'

// 触发播放全部
emitter.emit(EVENTS.PLAY_ALL, songs)

// 触发插入下一首
emitter.emit(EVENTS.INSERT_NEXT, song)

// 触发 Toast
emitter.emit('TOAST_SUCCESS', '操作成功')
```

---

## 主题系统

### CSS 变量 (`styles/dark-mode.css`)

```css
/* 亮色模式 */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #1f2937;
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.2);
}

/* 暗黑模式 */
:root.dark {
  --bg-primary: #0d0d0d;
  --bg-secondary: #1a1a1a;
  --text-primary: #ffffff;
  --glass-bg: rgba(26, 26, 26, 0.7);
  --glass-border: rgba(55, 65, 81, 0.3);
}
```

### 毛玻璃效果类 (`style.css`)

| 类名 | 用途 | 特性 |
|------|------|------|
| `.glass` | 自适应毛玻璃 | 根据主题自动切换 |
| `.glass-light` | 强制亮色毛玻璃 | |
| `.glass-dark` | 强制暗黑毛玻璃 | |
| `.glass-container` | 容器级玻璃 | `padding: 1.25rem` |
| `.glass-card` | 卡片级玻璃 | UI主用 |
| `.glass-effect` | 强化发光玻璃 | 重点UI |

**统一特性**: `backdrop-filter: blur(18-20px) saturate(200%) brightness(1.2)`
**移动端**: 自动降低模糊度（768px 断点）

### 主题切换

- **实现**: `document.documentElement.classList.toggle('dark')`
- **持久化**: `localStorage.setItem('theme', 'dark'|'light')`
- **系统偏好**: `window.matchMedia('(prefers-color-scheme: dark)')`
- **组件**: `TheHeader.vue`, `TheSidebar.vue` 都有主题切换按钮

---

## 特色功能

### 无限加载 (`SongList.vue`)

使用 `IntersectionObserver` 实现：

```typescript
const DISPLAY_BATCH_SIZE = 20;
const displayCount = ref(DISPLAY_BATCH_SIZE);
const loadMore = () => { displayCount.value += DISPLAY_BATCH_SIZE; }
```

### 苹果风格歌词背景 (`LayoutContainer.vue`)

```typescript
import { BackgroundRender } from '@applemusic-like-lyrics/vue';
import { MeshGradientRenderer } from '@applemusic-like-lyrics/core';

// 根据当前播放歌曲封面动态渲染背景
```

### 随机播放（Fisher-Yates 洗牌）

```typescript
const generateRandomQueue = () => {
  const len = playlist.value.length;
  randomQueue.value = Array.from({ length: len }, (_, i) => i);
  for (let i = len - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomQueue.value[i], randomQueue.value[j]] =
    [randomQueue.value[j], randomQueue.value[i]];
  }
}
```

### 用户状态 (`stores/user.ts`)

- **持久化**: `localStorage`（key: `user_store`）
- **缓存机制**: 10分钟刷新间隔（`FETCH_INTERVAL`）
- **自动获取**: 路由守卫 `router.beforeEach()` 触发
- **歌单分离**: 创建的歌单 vs 收藏的歌单分开管理

---

## 路由配置

| 路径 | 名称 | 组件 |
|------|------|------|
| `/` | Home | 首页 |
| `/search` | Search | 搜索页 |
| `/playlist` | Playlist | 歌单页 |
| `/artist` | Artist | 歌手页 |
| `/album` | Album | 专辑页 |

---

## 常用命令

```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 类型检查
pnpm type-check

# 代码格式化
pnpm format

# 预览构建结果
pnpm preview

# Lint 检查
pnpm lint
```

---

## 开发指南

### 组件开发规范

- 使用 `<script setup lang="ts">` 语法
- Tailwind CSS 进行样式设计
- 暗黑模式样式使用 `.dark` 选择器
- 毛玻璃效果使用 `backdrop-filter: blur()`
- 组件文件使用 PascalCase 命名

### 组件通信

1. **Props/Events**: 父子组件通信
2. **mitt 事件总线**: 跨组件通信（全局事件）
3. **Pinia Store**: 全局状态管理

### API 调用规范

```typescript
// 通过 api/ 目录下的模块调用
import { getAlbumDetail } from '@/api/album'

const data = await getAlbumDetail(id)
```

### 数据转换规范

所有 API 响应数据必须通过 `dataTransformer.ts` 中的函数转换后再使用：

```typescript
import { transformToSong } from '@/utils/dataTransformer'

const song = transformToSong(apiResponse)
```

---

## 注意事项

- **播放器是单例模式**: 不要在 store 里 new 多次 MusicController
- **事件总线初始化**: 在 `main.ts` 中完成
- **使用 `storeToRefs`**: 从 store 解构响应式数据
- **组件使用 Composition API**: 不使用 Options API
- **HTTP 库**: 使用 `ky` 而非 `axios`
- **颜色系统**: 使用 `oklch` 而非传统的 hex/rgb
