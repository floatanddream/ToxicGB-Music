# 全屏播放器实现计划

**目标**: 构建极简风格全屏播放器，仅显示专辑封面、歌曲信息、播放控制，保留 Apple Music 动态背景

**架构**: 新建全屏播放器页面，复用动态背景组件，添加全屏触发按钮

**技术栈**: Vue 3 + TypeScript, Pinia, Vue Router, @applemusic-like-lyrics

---

## 文件结构

| 操作 | 文件 |
|------|------|
| 新建 | `src/views/FullscreenPlayer/index.vue` |
| 修改 | `src/stores/app.ts` |
| 修改 | `src/components/layout/TheFooter.vue` |
| 修改 | `src/router/index.ts` |

---

## 任务清单

### Task 1: 在 appStore 添加全屏状态

**文件**: `src/stores/app.ts`

- [ ] **Step 1: 添加全屏状态**

```typescript
// 添加 isFullscreenPlayer 状态
const isFullscreenPlayer = false

// 添加到 return 对象
return {
  // ...existing
  isFullscreenPlayer
}
```

- [ ] **Step 2: 提交**

```bash
git add src/stores/app.ts
git commit -m "feat: add isFullscreenPlayer state to appStore"
```

---

### Task 2: 添加 /fullscreen 路由

**文件**: `src/router/index.ts`

- [ ] **Step 1: 导入全屏播放器组件**

```typescript
{
  path: '/fullscreen',
  name: 'FullscreenPlayer',
  component: () => import('@/views/FullscreenPlayer/index.vue')
}
```

- [ ] **Step 2: 提交**

```bash
git add src/router/index.ts
git commit -m "feat: add /fullscreen route"
```

---

### Task 3: 在 TheFooter 添加全屏按钮

**文件**: `src/components/layout/TheFooter.vue`

- [ ] **Step 1: 导入 Maximize2 图标和 router**

```typescript
import { Maximize2 } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
```

- [ ] **Step 2: 添加全屏按钮**

在 `volume-section` 区域添加按钮（播放列表按钮旁边）:

```html
<button class="icon-btn" @click="router.push('/fullscreen')">
  <Maximize2 :size="18" />
</button>
```

- [ ] **Step 3: 提交**

```bash
git add src/components/layout/TheFooter.vue
git commit -m "feat: add fullscreen button to player footer"
```

---

### Task 4: 创建全屏播放器页面

**文件**: `src/views/FullscreenPlayer/index.vue`

- [ ] **Step 1: 页面结构**

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { storeToRefs } from 'pinia'
import { BackgroundRender } from '@applemusic-like-lyrics/vue'
import { MeshGradientRenderer } from '@applemusic-like-lyrics/core'
import { useRouter } from 'vue-router'
import { Pause, Play, SkipBack, SkipForward, X } from 'lucide-vue-next'
import { formatTime } from '@/utils/format'

const router = useRouter()
const playerStore = usePlayerStore()
const { currentSong, currentTime, duration, playing } = storeToRefs(playerStore)

// 控制栏显示状态
const showControls = ref(false)
let hideTimeout: ReturnType<typeof setTimeout> | null = null

// Mock 数据 - 5首测试歌曲
const mockSongs = ref([
  {
    id: '1',
    title: '晴天',
    artist: '周杰伦',
    album: '叶惠美',
    cover: 'https://picsum.photos/400/400?random=1',
    duration: '04:29',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: '七里香',
    artist: '周杰伦',
    album: '七里香',
    cover: 'https://picsum.photos/400/400?random=2',
    duration: '04:59',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: '3',
    title: '稻香',
    artist: '周杰伦',
    album: '魔杰座',
    cover: 'https://picsum.photos/400/400?random=3',
    duration: '03:43',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: '4',
    title: '告白气球',
    artist: '周杰伦',
    album: '周杰伦的床边故事',
    cover: 'https://picsum.photos/400/400?random=4',
    duration: '03:35',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: '5',
    title: '简单爱',
    artist: '周杰伦',
    album: '范特西',
    cover: 'https://picsum.photos/400/400?random=5',
    duration: '04:31',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  }
])

// 进度
const progress = computed(() => {
  if (!duration.value || duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// 音量
const volume = ref(70)

// 触摸起始位置
const touchStartY = ref(0)

// 显示控制栏
const showControlsBar = () => {
  showControls.value = true
  if (hideTimeout) clearTimeout(hideTimeout)
  hideTimeout = setTimeout(() => {
    showControls.value = false
  }, 2000)
}

// 触摸事件 - 下拉检测
const handleTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY
}

const handleTouchMove = (e: TouchEvent) => {
  const deltaY = e.touches[0].clientY - touchStartY.value
  if (deltaY > 100) {
    router.back()
  }
}

// 退出全屏
const exitFullscreen = () => {
  router.back()
}

// 播放/暂停
const togglePlay = () => {
  playing.value ? playerStore.pause() : playerStore.play()
}

onMounted(() => {
  // 如果没有播放列表，使用 Mock 数据
  if (playerStore.playlist.length === 0) {
    playerStore.replaceList(mockSongs.value as any)
  }
})

onUnmounted(() => {
  if (hideTimeout) clearTimeout(hideTimeout)
})
</script>

<template>
  <div
    class="fullscreen-player"
    @click="showControlsBar"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
  >
    <!-- 动态背景 -->
    <BackgroundRender
      v-if="currentSong?.cover"
      :src="currentSong.cover"
      :renderer="MeshGradientRenderer"
      class="background-render"
    />

    <!-- 退出按钮 -->
    <Transition name="fade">
      <button
        v-if="showControls"
        class="exit-btn"
        @click.stop="exitFullscreen"
      >
        <X :size="24" />
      </button>
    </Transition>

    <!-- 主要内容 -->
    <div class="content">
      <!-- 专辑封面 -->
      <div class="cover-container">
        <img
          :src="currentSong?.cover || 'https://picsum.photos/400/400?random=1'"
          :alt="currentSong?.title"
          class="album-cover"
        />
      </div>

      <!-- 歌曲信息 -->
      <div class="song-info">
        <h1 class="song-title">{{ currentSong?.title || '未播放' }}</h1>
        <p class="artist-name">{{ currentSong?.artist?.[0]?.name || '未知艺术家' }}</p>
      </div>

      <!-- 播放控制 - 常驻显示 -->
      <div class="playback-controls">
        <button class="control-btn" @click.stop="playerStore.prev">
          <SkipBack :size="32" />
        </button>
        <button class="play-btn" @click.stop="togglePlay">
          <Play v-if="!playing" :size="36" />
          <Pause v-else :size="36" />
        </button>
        <button class="control-btn" @click.stop="playerStore.next">
          <SkipForward :size="32" />
        </button>
      </div>

      <!-- 交互时显示的控制栏 -->
      <Transition name="slide-up">
        <div v-if="showControls" class="controls-bar" @click.stop>
          <!-- 进度条 -->
          <div class="progress-section">
            <span class="time-text">{{ formatTime(currentTime) }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
              <input
                type="range"
                class="progress-input"
                min="0"
                :max="duration"
                :value="currentTime"
                @input="playerStore.seek(Number(($event.target as HTMLInputElement).value))"
              />
            </div>
            <span class="time-text">{{ formatTime(duration) }}</span>
          </div>

          <!-- 音量 -->
          <div class="volume-section">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
              <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
            </svg>
            <div class="volume-bar">
              <div class="volume-fill" :style="{ width: `${volume}%` }"></div>
              <input
                type="range"
                class="volume-input"
                min="0"
                max="100"
                v-model="volume"
                @input="playerStore.setVolume(Number(($event.target as HTMLInputElement).value))"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.fullscreen-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}

.background-render {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.exit-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  backdrop-filter: blur(10px);
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
}

.cover-container {
  width: 280px;
  height: 280px;
}

.album-cover {
  width: 100%;
  height: 100%;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}

.song-info {
  text-align: center;
}

.song-title {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.artist-name {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 32px;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;
  opacity: 0.9;
  transition: opacity 0.2s;
}

.control-btn:hover {
  opacity: 1;
}

.play-btn {
  background: white;
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  transition: transform 0.2s;
}

.play-btn:hover {
  transform: scale(1.05);
}

.controls-bar {
  position: absolute;
  bottom: 60px;
  left: 0;
  right: 0;
  padding: 0 24px;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.time-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  min-width: 40px;
}

.progress-bar {
  flex: 1;
  position: relative;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: white;
  border-radius: 2px;
}

.progress-input {
  position: absolute;
  top: -8px;
  left: 0;
  width: 100%;
  height: 20px;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  opacity: 0;
}

.progress-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: white;
}

.volume-section {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.volume-bar {
  position: relative;
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.volume-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: white;
  border-radius: 2px;
}

.volume-input {
  position: absolute;
  top: -8px;
  left: 0;
  width: 100%;
  height: 20px;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  opacity: 0;
}

.volume-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
```

- [ ] **Step 2: 提交**

```bash
git add src/views/FullscreenPlayer/index.vue
git commit -m "feat: add fullscreen player page with mock data"
```

---

## 验证

1. 运行 `pnpm dev`
2. 点击底部播放器的全屏按钮
3. 验证：
   - 动态背景正常显示
   - 专辑封面、歌曲标题、艺术家名正常显示
   - 播放/暂停按钮可点击
   - 点击屏幕显示控制栏（进度条、音量）
   - 2秒后控制栏自动隐藏
   - 点击左上角退出按钮返回上一页
   - 从屏幕顶部下拉超过 100px 退出全屏