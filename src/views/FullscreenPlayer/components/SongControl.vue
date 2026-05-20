<script setup lang="ts">
import BouncingSlider from '@/components/misc/BouncingSlider.vue'
import { animate, motion, useSpring } from "motion-v"
import { formatTime } from '@/utils/format'
import { usePlayerStore } from '@/stores/playerStore'
import ArtistDivider from '@/components/common/musicComponents/artistDivider.vue'
import { FastForward, PauseIcon, PlayIcon, Rewind } from 'lucide-vue-next'

const playerStore = usePlayerStore()

const prevSpring = useSpring(1, { damping: 10, stiffness: 300 })
const playSpring = useSpring(1, { damping: 10, stiffness: 300 })
const nextSpring = useSpring(1, { damping: 10, stiffness: 300 })

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
      <motion.div class="flex justify-center items-center h-15 w-15 cursor-pointer prevSong
           rounded-full hover:bg-[rgba(0,0,0,0.08)] transition-colors duration-200"
        :style="{ scale: prevSpring }"
        @click="playerStore.prev()"
        @mousedown="animate(prevSpring, 0.85, { type: 'spring', damping: 12, stiffness: 300 })"
        @mouseup="animate(prevSpring, 1, { type: 'spring', damping: 12, stiffness: 300 })"
        @mouseleave="animate(prevSpring, 1, { type: 'spring', damping: 12, stiffness: 300 })">
        <Rewind class="h-8 w-8" />
      </motion.div>

      <motion.div class="flex justify-center items-center h-15 w-15 cursor-pointer playPause
           rounded-full hover:bg-[rgba(0,0,0,0.08)] transition-colors duration-200"
        :style="{ scale: playSpring }"
        @click="playerStore.playing ? playerStore.pause() : playerStore.play()"
        @mousedown="animate(playSpring, 0.85, { type: 'spring', damping: 12, stiffness: 300 })"
        @mouseup="animate(playSpring, 1, { type: 'spring', damping: 12, stiffness: 300 })"
        @mouseleave="animate(playSpring, 1, { type: 'spring', damping: 12, stiffness: 300 })">
        <PauseIcon class="h-8 w-8" v-if="playerStore.playing" />
        <PlayIcon class="h-8 w-8" v-else />
      </motion.div>

      <motion.div class="flex justify-center items-center h-15 w-15 cursor-pointer nextSong
           rounded-full hover:bg-[rgba(0,0,0,0.08)] transition-colors duration-200"
        :style="{ scale: nextSpring }"
        @click="playerStore.next()"
        @mousedown="animate(nextSpring, 0.85, { type: 'spring', damping: 12, stiffness: 300 })"
        @mouseup="animate(nextSpring, 1, { type: 'spring', damping: 12, stiffness: 300 })"
        @mouseleave="animate(nextSpring, 1, { type: 'spring', damping: 12, stiffness: 300 })">
        <FastForward class="h-8 w-8" />
      </motion.div>
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