<script setup lang="ts">
import { ref, computed } from 'vue'

const currentSong = ref({
  title: '示例歌曲',
  artist: '示例歌手',
  duration: 180
})

const isPlaying = ref(false)
const currentTime = ref(0)
const volume = ref(70)

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
}

const playNext = () => {
  // 模拟下一首
  currentSong.value.title = '下一首歌曲'
}

const playPrev = () => {
  // 模拟上一首
  currentSong.value.title = '上一首歌曲'
}

const handleProgress = (e: Event) => {
  const target = e.target as HTMLInputElement
  currentTime.value = Number(target.value)
}

const handleVolume = (e: Event) => {
  const target = e.target as HTMLInputElement
  volume.value = Number(target.value)
}
</script>

<template>
  <footer class="player-footer">
    <div class="player-controls">
      <div class="song-info">
        <img
          src="https://picsum.photos/50/50?random=1"
          alt="专辑封面"
          class="album-cover"
        />
        <div class="song-details">
          <span class="song-title">{{ currentSong.title }}</span>
          <span class="song-artist">{{ currentSong.artist }}</span>
        </div>
      </div>

      <div class="playback-controls">
        <button class="control-btn" @click="playPrev">⏮</button>
        <button class="play-btn" @click="togglePlay">
          {{ isPlaying ? '⏸' : '▶' }}
        </button>
        <button class="control-btn" @click="playNext">⏭</button>
      </div>

      <div class="progress-container">
        <span class="time-current">{{ formatTime(currentTime) }}</span>
        <input
          type="range"
          class="progress-bar"
          min="0"
          :max="currentSong.duration"
          v-model="currentTime"
          @input="handleProgress"
        />
        <span class="time-total">{{ formatTime(currentSong.duration) }}</span>
      </div>

      <div class="volume-controls">
        <span class="volume-icon">🔊</span>
        <input
          type="range"
          class="volume-bar"
          min="0"
          max="100"
          v-model="volume"
          @input="handleVolume"
        />
        <span class="volume-text">{{ volume }}%</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.player-footer {
  background-color: rgba(44, 44, 44, 0.85) !important;
  color: #fff;
  padding: 15px 20px;
  border-top: 1px solid rgba(68, 68, 68, 0.5) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.05) !important;
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 99 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.dark .player-footer {
  background-color: rgba(13, 13, 13, 0.85) !important;
  border-top-color: rgba(34, 34, 34, 0.5) !important;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2) !important;
}

.player-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
}

.song-info {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 300px;
}

.album-cover {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 15px;
}

.song-details {
  display: flex;
  flex-direction: column;
}

.song-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
}

.song-artist {
  font-size: 12px;
  color: #999;
}

.dark .song-artist {
  color: #666;
}

.playback-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.control-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  transition: color 0.3s ease;
}

.dark .control-btn {
  color: #e0e0e0;
}

.control-btn:hover {
  color: #e74c3c;
}

.play-btn {
  background-color: #e74c3c;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.play-btn:hover {
  background-color: #c0392b;
}

.progress-container {
  display: flex;
  align-items: center;
  flex: 2;
  max-width: 500px;
  margin: 0 30px;
}

.time-current,
.time-total {
  font-size: 12px;
  color: #999;
  min-width: 40px;
}

.dark .time-current,
.dark .time-total {
  color: #666;
}

.progress-bar {
  flex: 1;
  margin: 0 10px;
  height: 4px;
  background-color: #444;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.dark .progress-bar {
  background-color: #333;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  background-color: #e74c3c;
  border-radius: 50%;
  cursor: pointer;
}

.volume-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.volume-icon {
  font-size: 16px;
}

.volume-bar {
  width: 80px;
  height: 4px;
  background-color: #444;
  border-radius: 2px;
  outline: none;
  -webkit-appearance: none;
}

.dark .volume-bar {
  background-color: #333;
}

.volume-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px;
  height: 10px;
  background-color: #e74c3c;
  border-radius: 50%;
  cursor: pointer;
}

.volume-text {
  font-size: 12px;
  color: #999;
  min-width: 35px;
}

.dark .volume-text {
  color: #666;
}
</style>