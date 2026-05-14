<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { storeToRefs } from 'pinia'
import { formatTime } from '@/utils/format'
import type { Song } from '@/types/player'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  X,
  ListMusic
} from 'lucide-vue-next'
import ArtistDivider from '@/components/common/musicComponents/artistDivider.vue'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import { Progress } from '@/components/ui/progress'

const playerStore = usePlayerStore()
const { currentSong, playing, currentTime, duration, playlist, currentIndex, mode, volume } = storeToRefs(playerStore)

const isFullScreen = ref(true)
const localVolume = ref(volume.value * 100)

const progress = computed(() => {
  if (!duration.value || duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

const handleTogglePlay = () => {
  playerStore.toggle()
}

const handlePrev = () => {
  playerStore.prev()
}

const handleNext = () => {
  playerStore.next()
}

const tempSeekValue = ref(currentTime.value)
const isDragging = ref(false)

watch(currentTime, (newTime) => {
  if (!isDragging.value) {
    tempSeekValue.value = newTime
  }
})

const handleSeekInput = (e: Event) => {
  isDragging.value = true
  const target = e.target as HTMLInputElement
  const value = Number(target.value)
  tempSeekValue.value = value
  playerStore.seek(value)
}

const handleSeekChange = () => {
  isDragging.value = false
}

const handleVolumeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  localVolume.value = Number(target.value)
  playerStore.setVolume(localVolume.value)
}

const handleToggleMute = () => {
  if (localVolume.value > 0) {
    playerStore.setVolume(0)
    localVolume.value = 0
  } else {
    playerStore.setVolume(70)
    localVolume.value = 70
  }
}

const cycleMode = () => {
  const modes: ('loop' | 'single' | 'random')[] = ['loop', 'single', 'random']
  const currentIdx = modes.indexOf(mode.value)
  const nextIdx = (currentIdx + 1) % modes.length
  const nextMode = modes[nextIdx]
  if (nextMode) {
    playerStore.setMode(nextMode)
  }
}

const modeIcon = computed(() => {
  switch (mode.value) {
    case 'single':
      return Repeat1
    case 'random':
      return Shuffle
    default:
      return Repeat
  }
})

const handleClose = () => {
  emitter.emit(EVENTS.TOGGLE_FULLSCREEN, false)
}

const isMuted = computed(() => localVolume.value === 0)

const upNextSongs = computed(() => {
  const songs = playlist.value
  const upNext: Song[] = []
  let idx = currentIndex.value + 1
  while (upNext.length < 3 && idx < songs.length) {
    const song = songs[idx]
    if (song) {
      upNext.push(song)
    }
    idx++
  }
  return upNext
})

const handleSwitchSong = (song: Song) => {
  playerStore.switchSong(song)
}
</script>

<template>
  <div class="fullscreen-player glass-component">
    <!-- Left Panel: Album Cover -->
    <div class="left-panel">
      <div class="cover-container">
        <img
          :src="currentSong?.cover || 'https://picsum.photos/400/400?random=1'"
          :alt="currentSong?.title || 'Album Cover'"
          class="album-cover"
        />
        <div class="cover-reflection"></div>
      </div>
      <div class="song-control">
         <div class="song-progress">
            <Progress
              :model-value="(tempSeekValue / duration) * 100"
              class="progress-component"
            />
            <input
              type="range"
              class="progress-input"
              min="0"
              :max="duration"
              :value="tempSeekValue"
              @input="handleSeekInput"
              @change="handleSeekChange"
            />
         </div>
      </div>
    </div>

    <!-- Right Panel: Song Info & Queue -->
    <div class="right-panel">
      <div class="song-info">
        <h1 class="song-title">{{ currentSong?.title || '未播放' }}</h1>
        <div class="artist-name" v-if="currentSong?.artist">
        </div>
        <p class="album-name" v-if="currentSong?.album">{{ currentSong.album.title }}</p>
      </div>

      <!-- Up Next Queue -->
      <div class="queue-section" v-if="upNextSongs.length > 0">
        <h3 class="queue-title">Up Next</h3>
        <div class="queue-list">
          <div
            v-for="song in upNextSongs"
            :key="song.id"
            class="queue-item"
            @click="handleSwitchSong(song)"
          >
            <img
              :src="song.cover || 'https://picsum.photos/50/50?random=1'"
              :alt="song.title"
              class="queue-cover"
            />
            <div class="queue-info">
              <span class="queue-song-title">{{ song.title }}</span>
              <span class="queue-artist" v-if="song.artist">
                {{ song.artist.map(a => a.name).join(', ') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

   

    <!-- Close Button -->
    <button class="close-btn" @click="handleClose">
      <X :size="24" />
    </button>
  </div>
</template>

<style scoped>
.fullscreen-player {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  color: #fff;
}


/* Left Panel */
.left-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
}

.cover-container {
  position: relative;
  max-width: 400px;
  width: 100%;
}

.album-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.cover-reflection {
  position: absolute;
  bottom: -60px;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 0 0 8px 8px;
  transform: scaleY(-1);
  opacity: 0.3;
  filter: blur(8px);
}

/* Right Panel */
.right-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 40px;
  overflow-y: auto;
}

.song-info {
  margin-bottom: 40px;
}

.song-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.artist-name {
  margin-bottom: 8px;
}

.album-name {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

/* Queue Section */
.queue-section {
  margin-top: auto;
}

.queue-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 16px 0;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.queue-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.queue-cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.queue-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.queue-song-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 进度条容器 */
.song-control {
  width: 100%;
  max-width: 400px;
  margin-top: 40px;
}

.song-progress {
  position: relative;
  width: 100%;
}

.progress-component {
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.progress-component :deep([data-slot="progress-indicator"]) {
  background: rgba(255, 255, 255, 1);
  transition: none;
}

.progress-input {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 22px;
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
</style>
