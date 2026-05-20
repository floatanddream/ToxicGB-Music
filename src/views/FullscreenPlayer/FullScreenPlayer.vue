<script setup lang="ts">
import { ref, computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { usePlayerStore } from '@/stores/playerStore'
import { storeToRefs } from 'pinia'
import type { Song } from '@/types/player'
import {
  X,
} from 'lucide-vue-next'
import SongControl from './components/SongControl.vue'
import AlbumCover from './components/AlbumCover.vue'
import UpNextQueue from './components/UpNextQueue.vue'
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import { parseLrc, parseYrc, type LyricLine } from '@applemusic-like-lyrics/lyric'
import { getSongLyric } from '@/api/lyric'
import { LyricPlayer } from '@applemusic-like-lyrics/vue'
import "@applemusic-like-lyrics/core/style.css";
import { extractLyrics } from '@/utils/misc'

const playerStore = usePlayerStore()
const lyricData = shallowRef<LyricLine[]>([]);
const { currentSong, playing, currentTime, duration, playlist, currentIndex, mode, volume } =
  storeToRefs(playerStore)

// Esc监听器
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    handleClose()
  }
}

const handleSeek = (time: number) => {
  playerStore.seek(time)
}

const handleClose = () => {
  emitter.emit(EVENTS.TOGGLE_FULLSCREEN, false)
}

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

const testParseLrc = async () => {
  const lyricRes = await getSongLyric(playerStore.currentSong?.id);
  console.log(extractLyrics(lyricRes))
  lyricData.value = extractLyrics(lyricRes);
}
watch(() => playerStore.currentSong?.id,() => {
  testParseLrc()
});

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  testParseLrc()
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="fullscreen-player glass-component">
    <!-- Left Panel: Album Cover -->
    <div class="left-panel">
      <AlbumCover :cover="currentSong?.cover || 'https://picsum.photos/400/400?random=1'"
        :title="currentSong?.title || 'Album Cover'" />
      <SongControl :duration="duration" :current-time="currentTime" :is-playing="playing" @seek="handleSeek" />
    </div>

    <!-- Right Panel: Song Info & Queue -->
    <div class="right-panel">
      <UpNextQueue :songs="upNextSongs" @switch-song="handleSwitchSong" v-if="false" />
      <LyricPlayer class="lyric-player" :lyric-lines="lyricData" :current-time="currentTime * 1000"
        :playing="playerStore.playing" />
    </div>

    <!-- Close Button -->
    <button class="close-btn fixed" @click="handleClose">
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
  grid-template-columns: 4fr 6fr;
  grid-template-rows: 1fr auto;
  color: #fff;
}

/* Left Panel */
.left-panel {
  height: 85%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
}

/* Right Panel */
.right-panel {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* padding: 60px 40px; */
  /* overflow-y: hidden; */
}

.lyric-player {
  transform: translateY(-20vh);
  height:120vh;
  /* overflow-y: hidden; */
}
</style>
