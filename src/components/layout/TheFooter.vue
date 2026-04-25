<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { FastForward, Pause, Play, Rewind, ListMusic } from 'lucide-vue-next'
import ArtistDivider from '../common/musicComponents/artistDivider.vue';
import { storeToRefs } from 'pinia';
import { formatTime } from '@/utils/format';
import PlaylistPanel from '../common/PlaylistPanel.vue';

const playerStore = usePlayerStore();

const { currentSong, currentTime, duration, playing } = storeToRefs(playerStore);
const isPlaylistOpen = ref(false);

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

const handleVolume = (e: Event) => {
  const target = e.target as HTMLInputElement
  playerStore.setVolume(Number(target.value))
}

const volume = ref(70)
</script>

<template>
  <footer class="player-footer">
    <div class="player-container">
      <!-- 左侧：歌曲信息 -->
      <div class="song-section">
        <img
          :src="currentSong?.cover || 'https://picsum.photos/50/50?random=1'"
          :alt="currentSong?.title || '专辑封面'"
          class="album-cover"
        />
        <div class="song-info">
          <span class="song-title">{{ currentSong?.title || '未播放' }}</span>
          <ArtistDivider v-if="currentSong" :artists="currentSong?.artist" />
        </div>
      </div>

      <!-- 中间：播放控制 -->
      <div class="center-section">
        <div class="controls-row">
          <button class="icon-btn" @click="playerStore.prev">
            <Rewind />
          </button>
          <button class="play-btn" @click="handleClickPlayAndPause">
            <Play v-if="!playing" />
            <Pause v-else />
          </button>
          <button class="icon-btn" @click="playerStore.next">
            <FastForward />
          </button>
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
        <button class="icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
            <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
          </svg>
        </button>
        <div class="volume-bar">
          <div class="volume-fill" :style="{ width: `${volume}%` }"></div>
          <input
            type="range"
            class="volume-input"
            min="0"
            max="100"
            v-model="volume"
            @input="handleVolume"
          />
        </div>
        <button class="icon-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
        </button>
        <button class="icon-btn" @click="isPlaylistOpen = !isPlaylistOpen">
          <ListMusic :size="20" />
        </button>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="playlist-slide">
        <PlaylistPanel
          v-if="isPlaylistOpen"
          :playlist="[]"
          :current-song="currentSong"
          @close="isPlaylistOpen = false"
        />
      </Transition>
    </Teleport>
  </footer>
</template>

<style scoped>
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
  height: 80px;
}

/* 左侧歌曲信息 */
.song-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 280px;
  flex: 0 0 auto;
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
  font-weight: 500;
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
  background: #fa233b;
  border: none;
  border-radius: 50%;
  width: 42px;
  height: 42px;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.play-btn:hover {
  transform: scale(1.05);
  background: #d91a2e;
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
  background: #fa233b;
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
  -webkit-appearance: none;
  opacity: 0;
}

.progress-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fa233b;
}

/* 右侧音量 */
.volume-section {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
  flex: 0 0 auto;
}

.volume-bar {
  position: relative;
  width: 100px;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.dark .volume-bar {
  background: rgba(255, 255, 255, 0.15);
}

.volume-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #fa233b;
  border-radius: 2px;
}

.volume-input {
  position: absolute;
  top: -4px;
  left: 0;
  width: 100%;
  height: 12px;
  background: transparent;
  border: none;
  outline: none;
  cursor: pointer;
  -webkit-appearance: none;
  opacity: 0;
}

.volume-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fa233b;
}

/* 响应式 */
@media (max-width: 768px) {
  .player-container {
    padding: 8px 16px;
    gap: 16px;
    height: 72px;
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

  .song-artist {
    font-size: 12px;
  }

  .play-btn {
    width: 38px;
    height: 38px;
  }

  .volume-section {
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
