<script setup lang="ts">
import BouncingSlider from '@/components/misc/BouncingSlider.vue'
import BouncingIconButton from '@/components/misc/BouncingIconButton.vue'
import { formatTime } from '@/utils/format'
import { usePlayerStore } from '@/stores/playerStore'
import ArtistDivider from '@/components/common/musicComponents/artistDivider.vue'
import { FastForward, PauseIcon, PlayIcon, Rewind } from 'lucide-vue-next'

const playerStore = usePlayerStore()

const props = defineProps<{
  duration: number
  currentTime: number
  isPlaying: boolean
}>()

const emit = defineEmits<{
  seek: [time: number]
}>()

const handleSeek = (time: number) => {
  emit('seek', time)
}

const togglePlay = () => {
  if (playerStore.playing) {
    playerStore.pause()
  } else {
    playerStore.play()
  }
}
</script>

<template>
  <div class="song-control">
    <div class="songInfo">
      <div class="songName text-3xl font-bold">{{ playerStore.currentSong?.title }}</div>
      <ArtistDivider :artists="playerStore.currentSong?.artist || []" />
    </div>
    <div class="progressBar">
      <BouncingSlider :value="currentTime" :min="0" :max="duration" :is-playing="false" :change-on-drag="true"
        @change="handleSeek" @after-change="handleSeek" />
      <div class="timeDisplay flex justify-between">
        <div class="totalTime">{{ formatTime(duration) }}</div>
        <div class="leftTime">- {{ formatTime(duration - currentTime) }}</div>
      </div>
    </div>
    <div class="control flex justify-center gap-10 mt-5">
      <BouncingIconButton custom-class="prevSong" @click="playerStore.prev()">
        <Rewind class="h-8 w-8" />
      </BouncingIconButton>

      <BouncingIconButton custom-class="playPause" @click="togglePlay">
        <PauseIcon v-if="playerStore.playing" class="h-8 w-8" />
        <PlayIcon v-else class="h-8 w-8" />
      </BouncingIconButton>

      <BouncingIconButton custom-class="nextSong" @click="playerStore.next()">
        <FastForward class="h-8 w-8" />
      </BouncingIconButton>
    </div>
  </div>
</template>

<style scoped>
.song-control {
  width: 100%;
  max-width: 400px;
  margin-top: 20px;
}
</style>