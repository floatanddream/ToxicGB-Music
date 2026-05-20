<script setup lang="ts">
import BouncingSlider from '@/components/misc/BouncingSlider.vue'
import { formatTime } from '@/utils/format'
import { usePlayerStore } from '@/stores/playerStore'
import ArtistDivider from '@/components/common/musicComponents/artistDivider.vue'
import { FastForward, NotepadTextDashedIcon, PauseIcon, PlayIcon, Rewind } from 'lucide-vue-next'
import { reactive } from 'vue'

const playerStore = usePlayerStore()

const props = defineProps<{
  duration: number
  currentTime: number
  isPlaying: boolean
}>()

const songBtn = reactive({
  prev: false,
  play: false,
  next: false
})

const emit = defineEmits<{
  seek: [time: number]
}>()

const handleSeek = (time: number) => {
  emit('seek', time)
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
      <div class="flex justify-center items-center h-15 w-15 cursor-pointer prevSong
           rounded-full hover:bg-[rgba(0,0,0,0.08)] transition-colors duration-200" @click="playerStore.next()"
        @mousedown="songBtn.prev = true" @mouseup="songBtn.prev = false">
        <Rewind :style="{ width: songBtn.prev ? '2rem' : '2.5rem', height: songBtn.prev ? '2rem' : '2.5rem' }" />
      </div>

      <div class="flex justify-center items-center h-15 w-15 cursor-pointer playPause
           rounded-full hover:bg-[rgba(0,0,0,0.08)] transition-colors duration-200"
        @click="playerStore.playing ? playerStore.pause() : playerStore.play()" @mousedown="songBtn.play = true"
        @mouseup="songBtn.play = false">
        <PauseIcon :style="{ width: songBtn.play ? '2rem' : '2.5rem', height: songBtn.play ? '2rem' : '2.5rem' }"
          v-if="playerStore.playing" />
        <PlayIcon :style="{ width: songBtn.play ? '2rem' : '2.5rem', height: songBtn.play ? '2rem' : '2.5rem' }"
          v-else />
      </div>

      <div class="flex justify-center items-center h-15 w-15 cursor-pointer nextSong
           rounded-full hover:bg-[rgba(0,0,0,0.08)] transition-colors duration-200" @click="playerStore.next()"
        @mousedown="songBtn.next = true" @mouseup="songBtn.next = false">
        <FastForward :style="{ width: songBtn.next ? '2rem' : '2.5rem', height: songBtn.next ? '2rem' : '2.5rem' }" />
      </div>
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
