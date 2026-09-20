<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import {
  FastForward,
  Pause,
  Play,
  Rewind,
  ListMusic,
  Maximize2,
  SlidersHorizontal,
  Repeat,
  Repeat1,
  Shuffle,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-vue-next'
import type { PlayMode } from '@/types/player'
import { Slider } from '@/components/ui/slider'
import ArtistDivider from '../common/musicComponents/artistDivider.vue'
import { storeToRefs } from 'pinia'
import { formatTime } from '@/utils/format'
import PlaylistPanel from '../common/PlaylistPanel.vue'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import BouncingIconButton from '@/components/misc/BouncingIconButton.vue'
import AudioEffectDialog from '@/components/common/AudioEffectDialog.vue'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'

const playerStore = usePlayerStore()

const { currentSong, currentTime, duration, playing, volume, mode } = storeToRefs(playerStore)
const isPlaylistOpen = ref(false)
const isEffectOpen = ref(false)
const isVolumeOpen = ref(false)

/*
 * 音量浮层的悬停开关。
 *
 * 为什么关闭要延迟：PopoverContent 经 Portal 渲染到 body，脱离了锚点的 DOM 子树，
 * 鼠标从图标移向浮层时必然经过一段「谁的盒子都不是」的空隙（锚点与浮层之间的
 * side-offset），在那段里 mouseleave 一定会触发。所以关闭延后 120ms，
 * 一旦鼠标进入浮层就取消 —— 这段延时正是穿越空隙所需的时间。
 *
 * 对比：内联浮层（不 Portal）不需要这个延时，因为浮层是锚点的后代，
 * mouseleave 只在离开「元素及其全部后代」时才触发。Portal 换来了正确的
 * 层级与定位，代价就是这段延时。
 */
let volumeCloseTimer: ReturnType<typeof setTimeout> | undefined

const openVolumePopover = () => {
  cancelCloseVolumePopover()
  isVolumeOpen.value = true
}

const cancelCloseVolumePopover = () => {
  if (volumeCloseTimer !== undefined) {
    clearTimeout(volumeCloseTimer)
    volumeCloseTimer = undefined
  }
}

const scheduleCloseVolumePopover = () => {
  cancelCloseVolumePopover()
  volumeCloseTimer = setTimeout(() => {
    isVolumeOpen.value = false
    volumeCloseTimer = undefined
  }, 120)
}

onUnmounted(cancelCloseVolumePopover)

// 播放模式：点一次前进一档。顺序与图标一一对应，勿随意调整。
const MODE_CYCLE: readonly PlayMode[] = ['loop', 'single', 'random']

const MODE_LABELS: Record<PlayMode, string> = {
  loop: '列表循环',
  single: '单曲循环',
  random: '随机播放',
}

const cycleMode = () => {
  const index = MODE_CYCLE.indexOf(mode.value)
  const next = MODE_CYCLE[(index + 1) % MODE_CYCLE.length]
  if (next) playerStore.setMode(next)
}

// store 存 0-1，滑块要 0-100，双向桥接
const volumePercent = computed({
  get: () => Math.round(volume.value * 100),
  // 原生 range 的 v-model 传字符串（Vue 的 castToNumber 只对 type="number" / .number 生效），此处显式转换
  set: (v: number | string) => playerStore.setVolume(Number(v)),
})

// 滚轮调音量：上滚加、下滚减。固定步长，只看 deltaY 的符号 ——
// 鼠标滚轮一格通常是 ±100，固定 5% 正好；触控板的惯性滚动会偏快，若嫌灵敏调小此值。
const WHEEL_VOLUME_STEP = 5

const handleVolumeWheel = (e: WheelEvent) => {
  const next = volumePercent.value + (e.deltaY < 0 ? WHEEL_VOLUME_STEP : -WHEEL_VOLUME_STEP)
  // 必须在这里钳制：store 的 setVolume 只钳制传给 audio 的值（0–1），
  // 写回 volume 状态时不做钳制，超范围会让滑块显示成 150% 之类
  playerStore.setVolume(Math.max(0, Math.min(100, next)))
}

const progress = computed(() => {
  if (!duration || duration.value === 0 || !currentTime) return 0
  return (currentTime.value / duration.value) * 100
})

const handleClickPlayAndPause = () => {
  playing.value ? playerStore.pause() : playerStore.play()
}

const handleProgress = (e: Event) => {
  const target = e.target as HTMLInputElement
  playerStore.seek(Number(target.value))
}

const handleOpenPlaylist = () => {
  isPlaylistOpen.value = !isPlaylistOpen.value
  console.log('Playlist open state:', isPlaylistOpen.value)
}
</script>

<template>
  <footer class="player-footer">
    <div class="player-container">
      <!-- 左侧：歌曲信息 -->
      <div @click="emitter.emit(EVENTS.TOGGLE_FULLSCREEN, true)" class="song-section">
        <img
          :src="currentSong?.cover || 'https://picsum.photos/50/50?random=1'"
          :alt="currentSong?.title || '专辑封面'"
          class="album-cover"
        />
        <div class="song-info gap-1">
          <span class="song-title">{{ currentSong?.title || '未播放' }}</span>
          <ArtistDivider v-if="currentSong" :artists="currentSong?.artist" />
        </div>
      </div>

      <!-- 中间：播放控制 -->
      <div class="center-section">
        <div class="controls-row">
          <BouncingIconButton
            size="h-9 w-9"
            hover-bg="hover:bg-black/5 dark:hover:bg-white/10"
            :pressed-scale="0.8"
            custom-class="icon-btn"
            @click="playerStore.prev"
          >
            <Rewind />
          </BouncingIconButton>
          <BouncingIconButton
            size="h-[42px] w-[42px]"
            :pressed-scale="0.8"
            custom-class="play-btn"
            @click="handleClickPlayAndPause"
          >
            <Play v-if="!playing" />
            <Pause v-else />
          </BouncingIconButton>
          <BouncingIconButton
            size="h-9 w-9"
            hover-bg="hover:bg-black/5 dark:hover:bg-white/10"
            :pressed-scale="0.8"
            custom-class="icon-btn"
            @click="playerStore.next"
          >
            <FastForward />
          </BouncingIconButton>
        </div>
        <div class="progress-row">
          <span class="time-text">{{ formatTime(currentTime) }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
            <input
              type="range"
              class="progress-input"
              min="0"
              :max="duration"
              :value="currentTime"
              @input="handleProgress"
            />
          </div>
          <span class="time-text">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- 右侧：音量 & 播放列表 -->
      <div class="volume-section">
        <BouncingIconButton
          size="h-9 w-9"
          hover-bg="hover:bg-black/5 dark:hover:bg-white/10"
          :pressed-scale="0.8"
          custom-class="icon-btn"
          @click="isEffectOpen = true"
        >
          <SlidersHorizontal :size="18" />
        </BouncingIconButton>
        <!-- 音量：图标 + 悬停浮层（shadcn Popover）
             用 PopoverAnchor 而非 PopoverTrigger：后者自带「点击切换 open」，
             会和悬停开关打架（悬停已打开时点一下图标反而关掉）。
             reka-ui 在存在自定义锚点时会自动让 PopoverTrigger 退化成普通元素，
             所以只留 Anchor 也能正确定位。 -->
        <Popover :open="isVolumeOpen" @update:open="(v: boolean) => (isVolumeOpen = v)">
          <PopoverAnchor as-child>
            <div
              class="volume-control volume-only"
              @mouseenter="openVolumePopover"
              @mouseleave="scheduleCloseVolumePopover"
              @wheel.prevent="handleVolumeWheel"
            >
              <BouncingIconButton
                size="h-9 w-9"
                hover-bg="hover:bg-black/5 dark:hover:bg-white/10"
                :pressed-scale="0.8"
                custom-class="icon-btn"
                :title="`音量 ${volumePercent}%`"
              >
                <VolumeX v-if="volumePercent === 0" :size="18" />
                <Volume1 v-else-if="volumePercent <= 50" :size="18" />
                <Volume2 v-else :size="18" />
              </BouncingIconButton>
            </div>
          </PopoverAnchor>

          <!--
            z-[110] 不可省：PopoverContent 默认 z-50，而 .player-footer 是
            z-index: 100 —— 不抬高的话浮层会被 footer 自己盖住。
            覆盖三个 CSS 变量而非用 class 上色：styles/utilities.css 的
            .bg-primary / .border-primary 与 shadcn 同名工具类撞车且带 !important，
            class 覆盖会被顶掉。三个都要给 —— --primary 管带变体前缀的部件。
          -->
          <PopoverContent
            side="top"
            :side-offset="4"
            class="glass-card z-[110] w-12 rounded-md border-0 p-0 shadow-none"
            style="
              --primary: var(--primary-color);
              --bg-primary: var(--primary-color);
              --border-primary: var(--primary-color);
            "
            @mouseenter="cancelCloseVolumePopover"
            @mouseleave="scheduleCloseVolumePopover"
            @wheel.prevent="handleVolumeWheel"
            @open-auto-focus="(e: Event) => e.preventDefault()"
          >
            <div class="volume-popup-panel">
              <Slider
                orientation="vertical"
                class="volume-popup-slider"
                :model-value="[volumePercent]"
                :min="0"
                :max="100"
                :step="1"
                @update:model-value="
                  (v: number[] | undefined) => playerStore.setVolume(v?.[0] ?? 0)
                "
              />
            </div>
          </PopoverContent>
        </Popover>
        <BouncingIconButton
          size="h-9 w-9"
          hover-bg="hover:bg-black/5 dark:hover:bg-white/10"
          :pressed-scale="0.8"
          custom-class="icon-btn loop-mode"
          :title="MODE_LABELS[mode]"
          :aria-label="MODE_LABELS[mode]"
          @click="cycleMode"
        >
          <Repeat v-if="mode === 'loop'" :size="18" />
          <Repeat1 v-else-if="mode === 'single'" :size="18" />
          <Shuffle v-else :size="18" />
        </BouncingIconButton>
        <BouncingIconButton
          size="h-9 w-9"
          hover-bg="hover:bg-black/5 dark:hover:bg-white/10"
          :pressed-scale="0.8"
          custom-class="icon-btn"
          @click.stop="handleOpenPlaylist"
        >
          <ListMusic :size="20" />
        </BouncingIconButton>
        <BouncingIconButton
          size="h-9 w-9"
          hover-bg="hover:bg-black/5 dark:hover:bg-white/10"
          :pressed-scale="0.8"
          custom-class="icon-btn"
          @click="emitter.emit(EVENTS.TOGGLE_FULLSCREEN, true)"
        >
          <Maximize2 :size="18" />
        </BouncingIconButton>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="playlist-slide">
        <PlaylistPanel
          v-if="isPlaylistOpen"
          :visible="isPlaylistOpen"
          @close="isPlaylistOpen = false"
        />
      </Transition>

      <AudioEffectDialog v-model:open="isEffectOpen" />
    </Teleport>
  </footer>
</template>

<style scoped>
:deep(.artist-divider .artist-name),
:deep(.artist-divider .artist-separator) {
  font-weight: 400;
}
.player-footer {
  background: rgba(255, 255, 255, 0.95);
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.dark .player-footer {
  background: rgba(28, 28, 30, 0.95);
  border-top-color: rgba(255, 255, 255, 0.1);
}

.player-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1600px;
  margin: 0 auto;
  padding: 10px 20px;
  gap: 20px;
  height: var(--footer-h);
}

/* 左侧歌曲信息 */
.song-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 280px;
  flex: 0 0 auto;
  cursor: pointer;
}

.album-cover {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
}

.dark .album-cover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.song-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.song-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.dark .song-title {
  color: #ffffff;
}

/* 中间播放控制 */
.center-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex: 1;
  max-width: 600px;
}

.controls-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.icon-btn {
  background: none;
  border: none;
  color: #8a8a8a;
  cursor: pointer;
  padding: 6px;
  border-radius: 50%;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .icon-btn {
  color: #a1a1a6;
}

.icon-btn:hover {
  color: #1a1a1a;
  background: rgba(0, 0, 0, 0.04);
}

.dark .icon-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.08);
}

.play-btn {
  background: var(--primary-color);
  color: #fff; /* 强制白字：红底上跟随 buttontext 系统色（接近黑）对比度差 */
  border: none;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-btn:hover {
  transform: scale(1.05);
  background: var(--primary-dark);
}

.play-btn:active {
  transform: scale(0.98);
}

/* 进度条 */
.progress-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.time-text {
  font-size: 11px;
  color: #8a8a8a;
  min-width: 38px;
  font-variant-numeric: tabular-nums;
}

.dark .time-text {
  color: #a1a1a6;
}

.progress-bar {
  flex: 1;
  position: relative;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.dark .progress-bar {
  background: rgba(255, 255, 255, 0.15);
}

.progress-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--primary-color);
  border-radius: 2px;
  transition: width 0.05s linear;
}

.progress-input {
  position: absolute;
  top: -4px;
  left: 0;
  width: 100%;
  height: 12px;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  opacity: 0;
}

.progress-input::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary-color);
}

/* 右侧音量 */
.volume-section {
  display: flex;
  align-items: center;
  gap: 10px;
  /* 原为横向音量条预留的 min-width: 180px 已随音量条一起移除 */
  flex: 0 0 auto;
}

/* ---------- 音量：图标 + 悬停浮层 ---------- */

.volume-control {
  display: flex;
  align-items: center;
}

/* 浮层的定位与出入场动画都交给 reka-ui（PopoverContent side="top"），这里只排内容 */
.volume-popup-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 10px;
  border-radius: 12px;
}

.volume-popup-value {
  font-size: 11px;
  color: var(--text-secondary);
  font-variant-numeric: tabular-nums;
}

/*
 * Slider 竖向模式自带 `data-[orientation=vertical]:min-h-44`（176px），
 * 对 footer 浮层来说太高。这里用「祖先 + 自身」两级选择器压过它
 * （scoped 样式无 layer，且特异度 0,3,0 > 组件的 0,2,0）。
 */
.volume-popup-panel .volume-popup-slider {
  height: 112px;
  min-height: 112px;
}

/* 响应式 */
@media (max-width: 768px) {
  .player-container {
    padding: 6px 14px;
    gap: 14px;
  }

  .song-section {
    min-width: 120px;
    max-width: 140px;
  }

  .album-cover {
    width: 44px;
    height: 44px;
  }

  .song-title {
    font-size: 14px;
  }

  .play-btn {
    width: 38px;
    height: 38px;
  }

  .controls-row {
    gap: 14px;
  }

  .volume-only {
    display: none;
  }
}

@media (max-width: 480px) {
  .player-container {
    padding: 4px 10px;
    gap: 10px;
  }

  .song-section {
    min-width: 100px;
    max-width: 110px;
  }

  .album-cover {
    width: 36px;
    height: 36px;
  }

  .song-title {
    font-size: 13px;
  }

  .play-btn {
    width: 32px;
    height: 32px;
  }

  .controls-row {
    gap: 10px;
  }

  .progress-row {
    gap: 8px;
  }

  .time-text {
    display: none;
  }

  .loop-mode {
    display: none;
  }
}

/* 播放列表面板过渡动画 */
.playlist-slide-enter-active,
.playlist-slide-leave-active {
  transition: all 0.3s ease;
}

.playlist-slide-enter-from,
.playlist-slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
