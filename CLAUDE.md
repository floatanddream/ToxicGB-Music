# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述
ToxicGB-Music 是一个基于 Vue 3 的现代音乐播放器 Web 应用，采用苹果音乐风格的 UI 设计，支持深色模式、歌词显示、音乐播放等核心功能。

## 技术栈
- **前端框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **状态管理**: Pinia
- **路由**: Vue Router
- **样式**: Tailwind CSS
- **UI组件**: Reka UI
- **特殊效果**: @applemusic-like-lyrics（苹果风格歌词和背景渲染）
- **图标**: Lucide Vue Next
- **UI库**: Shadcn-vue

## 项目结构
```
src/
├── components/           # 组件目录
│   ├── common/          # 通用组件
│   │   └── musicComponents/
│   │       ├── AlbumCard.vue           # 专辑卡片组件
│   │       ├── PlaylistCard.vue        # 歌单卡片组件
│   │       ├── SongList.vue            # 歌曲列表组件
│   │       └── artistDivider.vue       # 艺术家分隔组件
│   ├── layout/          # 布局组件
│   └── ui/              # UI基础组件
├── views/               # 页面视图
│   ├── Artist/          # 歌手页面
│   │   ├── index.vue              # 主页面
│   │   └── components/
│   │       ├── ArtistContent.vue  # 歌手内容区域
│   │       ├── ArtistHeader.vue   # 歌手头部
│   │       ├── ArtistTabs.vue     # 歌手标签页
│   │       ├── ArtistSongs.vue    # 歌曲标签内容
│   │       ├── ArtistAlbums.vue   # 专辑标签内容
│   │       ├── ArtistVideos.vue   # 视频标签内容
│   │       └── ArtistActivities.vue # 动态标签内容
│   ├── Album/           # 专辑页面
│   │   ├── index.vue              # 主页面
│   │   └── components/
│   │       └── AlbumHeader.vue    # 专辑头部
│   ├── Playlist/        # 歌单页面
│   │   ├── index.vue              # 主页面
│   │   └── components/
│   │       └── PlaylistHeader.vue # 歌单头部
│   ├── Home/            # 首页
│   ├── Player.vue       # 播放器页面
│   └── Search.vue       # 搜索页面
└── App.vue              # 根组件
```

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
```

## 核心功能
1. **主题系统**: 支持深色/浅色模式切换，自动跟随系统偏好
2. **背景效果**: 使用 @applemusic-like-lyrics 实现动态渐变背景
3. **音乐播放**: 完整的播放器界面和控制功能
4. **歌词显示**: 苹果风格的美观歌词展示
5. **响应式设计**: 适配不同屏幕尺寸

## 开发指南
- 组件采用 Composition API 风格
- 使用 `<script setup lang="ts">` 语法
- Tailwind CSS 用于样式，支持深色模式
- 组件间通信主要使用 Props 和 Events
-组件通信同时可以使用mitt
- 全局状态使用 Pinia 管理

## 注意事项
- Node.js 版本要求：^20.19.0 || >=22.12.0
- 使用 pnpm 作为包管理器
- 组件默认导出使用 `<script setup>` 语法
- 深色模式样式使用 `.dark` 选择器