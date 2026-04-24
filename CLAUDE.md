# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

---

## 项目概述

ToxicGB-Music 是一个基于 Vue 3 + TypeScript 的现代音乐播放器 Web 应用，采用苹果音乐风格的 UI 设计，支持深色模式、歌词显示、音乐播放等核心功能。

**Node.js 版本要求**: ^20.19.0 || >=22.12.0
**包管理器**: pnpm

---

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 + TypeScript (Composition API) |
| 构建工具 | Vite |
| 状态管理 | Pinia |
| 路由 | Vue Router |
| 样式 | Tailwind CSS |
| UI组件 | shadcn-vue + Reka UI |
| 图标 | Lucide Vue Next |
| 事件总线 | mitt |
| Toast通知 | vue-sonner |
| 特殊效果 | @applemusic-like-lyrics（苹果风格歌词） |

---

## 项目结构

```
src/
├── api/                    # API 请求模块
│   ├── album.ts           # 专辑相关 API
│   ├── artistPage.ts      # 歌手页面 API
│   ├── playlist.ts        # 歌单相关 API
│   ├── search.ts          # 搜索 API
│   ├── song.ts            # 歌曲相关 API
│   └── user.ts            # 用户相关 API
│
├── components/             # 组件目录
│   ├── common/            # 通用组件
│   │   ├── AppLogo.vue    # 应用 Logo
│   │   ├── SearchBar.vue  # 搜索栏
│   │   ├── UserAvatar.vue # 用户头像
│   │   ├── Auth/          # 认证相关组件
│   │   │   ├── LoginForm.vue
│   │   │   ├── RegisterForm.vue
│   │   │   ├── QRCodeLoginForm.vue
│   │   │   └── ForgotPasswordForm.vue
│   │   ├── AuthModal.vue  # 认证弹窗
│   │   ├── musicComponents/  # 音乐相关组件
│   │   │   ├── AlbumCard.vue      # 专辑卡片
│   │   │   ├── ArtistCard.vue     # 歌手卡片
│   │   │   ├── PlaylistCard.vue   # 歌单卡片
│   │   │   ├── ArtistDivider.vue  # 歌手分隔组件
│   │   │   └── DescriptionWithDialog.vue
│   │   └── pageComponents/  # 页面级组件
│   │       ├── CommonTabs.vue     # 通用标签页
│   │       ├── CommentList.vue    # 评论列表
│   │       ├── CommentItem.vue    # 评论项
│   │       └── songsContainer.vue # 歌曲容器
│   │
│   ├── layout/            # 布局组件
│   │   ├── TheHeader.vue  # 顶部导航
│   │   ├── TheSidebar.vue # 侧边栏
│   │   ├── TheFooter.vue  # 底部播放器
│   │   └── LayoutContainer.vue
│   │
│   └── ui/                # shadcn-vue 基础组件
│       ├── button/        # 按钮
│       ├── card/          # 卡片
│       ├── dialog/        # 对话框
│       ├── input/         # 输入框
│       ├── label/         # 标签
│       ├── scroll-area/   # 滚动区域
│       ├── separator/     # 分隔线
│       ├── sheet/         # 侧边抽屉
│       ├── skeleton/      # 骨架屏
│       ├── sidebar/       # 侧边栏
│       ├── sonner/        # Toast 通知
│       ├── tabs/          # 标签页
│       ├── tooltip/       # 工具提示
│       └── collapsible/   # 可折叠组件
│
├── constants/             # 常量定义
│   ├── events.ts          # 事件名称常量
│   └── messages.ts        # 消息类型常量
│
├── core/                  # 核心功能
│   └── player/            # 播放器核心
│       ├── MusicController.ts   # 播放器控制器
│       ├── MusicService.ts      # 歌曲服务（URL 获取、缓存）
│       └── player.ts
│
├── router/                # 路由配置
│   └── index.ts
│
├── stores/                # Pinia 状态管理
│   ├── playerStore.ts     # 播放器状态
│   ├── user.ts            # 用户状态
│   ├── app.ts             # 应用状态
│   └── counter.ts         # 计数器（示例）
│
├── styles/                # 全局样式
│   ├── dark-mode.css      # 暗黑模式样式
│   └── ...
│
├── types/                 # TypeScript 类型定义
│   ├── album.ts
│   ├── artist.ts
│   ├── comment.ts
│   ├── menu.ts
│   ├── musicTypes.ts       # 核心音乐类型
│   ├── player.ts          # 播放器类型
│   ├── playlist.ts
│   ├── toast.ts
│   └── user.ts
│
├── utils/                 # 工具函数
│   ├── eventBus.ts        # 事件总线（mitt）
│   ├── eventBusHandler/   # 事件处理器
│   │   ├── clickEventHandler.ts   # 点击事件处理
│   │   ├── playEventHandler.ts    # 播放事件处理
│   │   └── toastEventHandler.ts   # Toast 事件处理
│   ├── format.ts          # 格式化工具
│   ├── dataTransformer.ts # 数据转换
│   ├── request.ts         # 请求封装
│   └── misc.ts            # 杂项工具
│
├── views/                 # 页面视图
│   ├── Home/index.vue     # 首页
│   ├── Search/index.vue   # 搜索页
│   ├── Playlist/index.vue # 歌单页
│   ├── Artist/index.vue   # 歌手页
│   └── Album/index.vue    # 专辑页
│
├── App.vue                # 根组件
├── main.ts                # 入口文件
└── style.css              # 全局样式
```

---

## 核心类型定义

### 音乐类型 (`types/musicTypes.ts`)

```typescript
interface Song {
  id: string;
  title: string;
  aliasTitle: string;
  artist: Artist[];
  album: Album;
  duration: string;
  cover: string | undefined;
}

interface Artist {
  id: string;
  name: string;
  avatar: string;
  fanCount: string;
  songCount: string;
  verified: boolean;
}

interface Album {
  id: string;
  title: string;
  artist: Array<Artist>;
  cover: string;
  releaseDate: string;
  songCount: string;
}

interface Playlist {
  id: string;
  title: string;
  creator: User;
  cover: string;
  songCount: string;
  playCount: string;
  likeCount: string;
  isLiked: boolean;
  description: string;
  updateTime: string;
}
```

### 播放器类型 (`types/player.ts`)

```typescript
type PlayMode = 'loop' | 'single' | 'random';

interface Song extends MusicType.Song {
  url?: string;  // 扩展：添加歌曲 URL
}
```

---

## 路由配置

| 路径 | 名称 | 组件 |
|------|------|------|
| `/` | Home | 首页 |
| `/search` | Search | 搜索页 |
| `/playlist` | playlist | 歌单页 |
| `/artist` | artist | 歌手页 |
| `/album` | album | 专辑页 |

---

## 播放器架构

### MusicController (`core/player/MusicController.ts`)

核心播放器控制器，负责：
- 音频播放控制（播放/暂停/跳转）
- 播放列表管理
- 播放模式（循环/单曲/随机）
- 事件触发（songchange, play, pause, timeupdate, loaded, modechange）

### MusicService (`core/player/MusicService.ts`)

歌曲服务，负责：
- 获取歌曲 URL（通过 API）
- URL 缓存（避免重复请求）

### playerStore (`stores/playerStore.ts`)

Pinia 状态管理，负责：
- 播放状态（playlist, currentSong, playing, currentTime, duration）
- 播放操作（play, pause, next, prev, seek）
- 列表操作（replaceList, playSong, insertNext, insertNextAndPlay）
- 自动预加载后续歌曲（watch currentIndex）

**播放器方法**:
```typescript
playerStore.init()           // 初始化
playerStore.replaceList()    // 替换播放列表
playerStore.playSong()       // 播放单曲
playerStore.insertNext()     // 插入下一首
playerStore.insertNextAndPlay()  // 插入并立即播放
playerStore.play()           // 播放
playerStore.pause()          // 暂停
playerStore.toggle()         // 切换播放/暂停
playerStore.next()           // 下一首
playerStore.prev()           // 上一首
playerStore.seek()           // 跳转
playerStore.setMode()        // 设置播放模式
playerStore.setVolume()      // 设置音量
```

---

## 事件系统

使用 `mitt` 实现事件总线，分三个处理器：

### EVENTS 常量 (`constants/events.ts`)

```typescript
ARTIST_CLICK: 'artist-click'       // 歌手点击
PLAYLIST_CLICK: 'playlist-click'  // 歌单点击
ALBUM_CLICK: 'album-click'        // 专辑点击
SONG_CLICK: 'song-click'          // 歌曲点击
SCROOL_TOP: 'scroll-top'          // 滚动到顶
PLAY_ALL: 'play-all'              // 播放全部
INSERT_NEXT: 'insert-next'        // 插入下一首
INSERT_AND_PLAY: 'insert-and-play' // 插入并播放
```

### 事件处理器

| 文件 | 功能 |
|------|------|
| `clickEventHandler.ts` | 处理页面跳转事件 |
| `playEventHandler.ts` | 处理播放控制事件 |
| `toastEventHandler.ts` | 处理 Toast 通知事件 |

---

## 主题系统

### 暗黑模式

项目支持暗黑/亮色模式切换，通过 `.dark` class 控制。

**CSS 变量** (`styles/dark-mode.css`):
```css
/* 亮色模式 */
:root {
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* 暗黑模式 */
:root.dark {
  --glass-bg: rgba(26, 26, 26, 0.7);
  --glass-border: rgba(55, 65, 81, 0.3);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 毛玻璃效果类

| 类名 | 用途 |
|------|------|
| `.glass` | 自适应毛玻璃 |
| `.glass-light` | 强制亮色毛玻璃 |
| `.glass-dark` | 强制暗黑毛玻璃 |
| `.glass-container` | 玻璃容器 |
| `.glass-card` | 玻璃卡片 |

### 响应式毛玻璃

移动端自动降低模糊度以优化性能（768px 断点）。

---

## 常用命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 预览构建结果
npm run preview

# Lint 检查
npm run lint
```

---

## 开发指南

### 组件开发

- 使用 `<script setup lang="ts">` 语法
- 使用 Tailwind CSS 进行样式设计
- 暗黑模式样式使用 `.dark` 选择器
- 毛玻璃效果使用 `backdrop-filter: blur()`

### 组件通信

1. **Props/Events**: 父子组件通信
2. **mitt 事件总线**: 跨组件通信
3. **Pinia Store**: 全局状态管理

### API 调用

通过 `src/api/` 目录下的模块进行 API 调用，统一封装在 `src/utils/request.ts` 中。

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

## 注意事项

- 组件使用 Composition API 风格
- 全局状态使用 Pinia 管理
- 播放器是单例模式，不要在 store 里 new 多次
- 事件总线在 main.ts 中初始化
- 使用 `storeToRefs` 从 store 解构响应式数据
