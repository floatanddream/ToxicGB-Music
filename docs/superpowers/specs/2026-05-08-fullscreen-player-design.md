# 全屏播放器设计文档

**日期**: 2026-05-08

## 概述

设计一个极简风格的全屏播放器页面，用户触发后覆盖整个视口，仅显示核心播放内容。保留 Apple Music 动态背景效果。

## 背景

保持现有的 `@applemusic-like-lyrics/vue` 动态背景渲染，全屏时仅替换前景内容。

## 交互设计

### 显示状态

- **初始状态**：仅显示专辑封面（居中）、歌曲标题、艺术家名、播放/暂停按钮
- **用户触碰屏幕**：显示底部控制栏（进度条、播放控制、音量滑块）
- **2秒无操作**：控制栏自动淡出隐藏

### 退出方式

1. 左上角退出按钮（交互时显示）
2. 从屏幕顶部下拉超过 100px

## 页面结构

```
┌─────────────────────────────────────┐
│ [×] 退出按钮                         │  ← 仅交互时显示
│                                     │
│           ┌─────────┐              │
│           │  封面   │              │
│           │         │              │
│           └─────────┘              │
│                                     │
│         歌曲标题                      │
│         艺术家名                      │
│                                     │
│            ▶ / ❚❚                   │  ← 常驻显示
│                                     │
│  ━━━━━━━━━━━●━━━━━━━━━━━  02:34    │  ← 交互时显示
│  🔊━━━━━━                   │  ← 交互时显示
└─────────────────────────────────────┘
```

## 实现方案

### 新增文件

| 文件 | 说明 |
|------|------|
| `src/views/FullscreenPlayer/index.vue` | 全屏播放器页面 |

### 修改文件

| 文件 | 说明 |
|------|------|
| `src/stores/app.ts` | 添加 `isFullscreenPlayer` 状态 |
| `src/components/layout/TheFooter.vue` | 添加全屏按钮 |
| `src/router/index.ts` | 添加 `/fullscreen` 路由 |

### Mock 数据

内置 5-10 首模拟歌曲数据用于测试：

```typescript
interface MockSong {
  id: string
  title: string
  artist: string
  album: string
  cover: string
  duration: string
  url: string
}
```

## 技术要点

- **遮罩层**：`position: fixed` 全屏覆盖，`z-index: 200`
- **动态背景**：复用 `BackgroundRender` 组件
- **触摸检测**：`@touchstart`/`@touchmove`/`@touchend` 追踪下拉手势
- **自动隐藏**：2秒 setTimeout 淡出控制栏
- **动画**：`transition: opacity 300ms ease`