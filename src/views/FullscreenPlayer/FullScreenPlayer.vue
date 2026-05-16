<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
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
  ListMusic,
} from 'lucide-vue-next'
import SongControl from './components/SongControl.vue'
import AlbumCover from './components/AlbumCover.vue'
import UpNextQueue from './components/UpNextQueue.vue'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'

const playerStore = usePlayerStore()
const { currentSong, playing, currentTime, duration, playlist, currentIndex, mode, volume } =
  storeToRefs(playerStore)

// Esc监听器
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}

const localVolume = ref(volume.value * 100)

const handleSeek = (time: number) => {
  playerStore.seek(time)
}

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

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="fullscreen-player glass-component">
    <!-- Left Panel: Album Cover -->
    <div class="left-panel">
      <AlbumCover
        :cover="currentSong?.cover || 'https://picsum.photos/400/400?random=1'"
        :title="currentSong?.title || 'Album Cover'"
      />
      <SongControl
        :duration="duration"
        :current-time="currentTime"
        :is-playing="playing"
        @seek="handleSeek"
      />
    </div>

    <!-- Right Panel: Song Info & Queue -->
    <div class="right-panel">
      <UpNextQueue :songs="upNextSongs" @switch-song="handleSwitchSong" />
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

/* Right Panel */
.right-panel {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 40px;
  overflow-y: auto;
}
</style>
