<script setup lang="ts">
import { ref } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'

const playerStore = usePlayerStore()
const { currentSong, currentTime, duration, playing } = playerStore

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const handleProgress = (e: Event) => {
  const target = e.target as HTMLInputElement
  playerStore.seek(Number(target.value))
}

const handleVolume = (e: Event) => {
  const target = e.target as HTMLInputElement
  playerStore.setVolume(Number(target.value) / 100)
}
</script>

<template>
  <footer class="player-footer">
    <div class="player-controls">
      <div class="song-info">
        <img
          :src="currentSong?.picUrl || 'https://picsum.photos/50/50?random=1'"
          :alt="currentSong?.name || '专辑封面'"
          class="album-cover"
        />
        <div class="song-details">
          <span class="song-title">{{ currentSong?.name || '未播放' }}</span>
          <span class="song-artist">{{ currentSong?.artists?.map(a => a.name).join(' / ') || '未知歌手' }}</span>
        </div>
      </div>

      <div class="playback-controls">
        <button class="control-btn" @click="playerStore.prev">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="19 20 9 12 19 4 19 20"></polygon>
            <line x1="5" y1="19" x2="5" y2="5"></line>
          </svg>
        </button>
        <button class="play-btn" @click="playerStore.toggle">
          <svg v-if="playing" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
        <button class="control-btn" @click="playerStore.next">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 4 15 12 5 20 5 4"></polygon>
            <line x1="19" y1="5" x2="19" y2="19"></line>
          </svg>
        </button>
      </div>

      <div class="progress-container">
        <span class="time-current">{{ formatTime(currentTime) }}</span>
        <input
          type="range"
          class="progress-bar"
          min="0"
          :max="duration"
          :value="currentTime"
          @input="handleProgress"
        />
        <span class="time-total">{{ formatTime(duration) }}</span>
      </div>

      <div class="volume-controls">
        <button class="volume-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>
        <input
          type="range"
          class="volume-bar"
          min="0"
          max="100"
          :value="70"
          @input="handleVolume"
        />
      </div>
    </div>
  </footer>
</template>

<style scoped>
.player-footer {
  background-color: rgba(255, 255, 255, 0.8);
  color: #1f2937;
  padding: 12px 20px;
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05);
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .player-footer {
  background-color: rgba(26, 26, 26, 0.85);
  color: #f3f4f6;
  border-top-color: rgba(75, 85, 99, 0.3);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
}

.player-controls {
  display: flex;
;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  gap: 20px;
}

.song-info {
  display: flex;
  align-items: center;
  min-width: 200px;
  max-width: 300px;
  flex: 1;
}

.album-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  margin-right: 12px;
  object-fit: cover;
}

.song-details {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.song-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.song-artist {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dark .song-artist {
  color: #9ca3af;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn {
  background: none;
  border: none;
  color: #374151;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .control-btn {
  color: #e5e7eb;
}

.control-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #ef4444;
}

.dark .control-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #f87171;
}

.play-btn {
  background-color:
  #ef4444;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .play-btn {
  background-color: #f87171;
}

.play-btn:hover {
  transform: scale(1.05);
  background-color: #dc2626;
}

.dark .play-btn:hover {
  background-color: #ef4444;
}

.progress-container {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.time-current,
.time-total {
  font-size: 12px;
  color: #6b7280;
  min-width: 40px;
}

.dark .time-current,
.dark .time-total {
  color: #9ca3af;
}

.progress-bar {
  flex: 1;
  margin: 0 10px;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.dark .progress-bar {
  background-color: #374151;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background-color:
  #ef4444;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.dark .progress-bar::-webkit-slider-thumb {
  background-color: #f87171;
}

.progress-bar::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.volume-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 140px;
}

.volume-btn {
  background: none;
  border: none;
  color: #374151;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.dark .volume-btn {
  color: #9ca3af;
}

.volume-btn:hover {
  color: #ef4444;
}

.dark .volume-btn:hover {
  color: #f87171;
}

.volume-bar {
  width: 80px;
  height: 4px;
  background-color: #e5e7eb;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.dark .volume-bar {
  background-color: #374151;
}

.volume-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  background-color:
  #ef4444;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.dark .volume-bar::-webkit-slider-thumb {
  background-color: #f87171;
}

.volume-bar::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

@media (max-width: 768px) {
  .player-controls {
    gap: 12px;
  }

  .song-info {
    min-width: 120px;
    max-width: 150px;
  }

  .album-cover {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }

  .song-title {
    font-size: 12px;
  }

  .song-artist {
    font-size: 11px;
  }

  .progress-container {
    margin: 0 10px;
  }

  .volume-controls {
    display: none;
  }

  .play-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
