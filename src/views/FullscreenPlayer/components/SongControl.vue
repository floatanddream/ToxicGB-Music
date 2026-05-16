<script setup lang="ts">
import BouncingSlider from '@/components/misc/BouncingSlider.vue'
import { formatTime } from '@/utils/format';

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
    <div class="progressBar">
      <BouncingSlider :value="currentTime" :min="0" :max="duration" :is-playing="false" :change-on-drag="true"
        @change="handleSeek" @after-change="handleSeek" />
      <div class="timeDisplay flex justify-between">
        <div class="totalTime">{{ formatTime(duration) }}</div>
        <div class="leftTime"> - {{ formatTime(duration - currentTime) }}</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.song-control {
  width: 100%;
  max-width: 400px;
  margin-top: 40px;
}
</style>
