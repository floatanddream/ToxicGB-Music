<script setup lang="ts">
import { ref, computed } from 'vue'
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
import SongControl from './components/SongControl.vue'
import AlbumCover from './components/AlbumCover.vue'
import UpNextQueue from './components/UpNextQueue.vue'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'

const playerStore = usePlayerStore()
const { currentSong, playing, currentTime, duration, playlist, currentIndex, mode, volume } = storeToRefs(playerStore)

const isFullScreen = ref(true)
const localVolume = ref(volume.value * 100)

const handleTogglePlay = () => {
  playerStore.toggle()
}

const handlePrev = () => {
  playerStore.prev()
}

const handleNext = () => {
  playerStore.next()
}

const handleSeek = (time: number) => {
  playerStore.seek(time)
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
      <AlbumCover
        :cover="currentSong?.cover || 'https://picsum.photos/400/400?random=1'"
        :title="currentSong?.title || 'Album Cover'"
      />
      <SongControl
        :duration="duration"
        :current-time="currentTime"
        @seek="handleSeek"
      />
    </div>

    <!-- Right Panel: Song Info & Queue -->
    <div class="right-panel">
      <UpNextQueue
        :songs="upNextSongs"
        @switch-song="handleSwitchSong"
      />
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
