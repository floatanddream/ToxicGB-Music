<script setup lang="ts">
import BouncingSlider from '@/components/misc/BouncingSlider.vue'
import { formatTime } from '@/utils/format'
import { usePlayerStore } from '@/stores/playerStore'
import ArtistDivider from '@/components/common/musicComponents/artistDivider.vue'

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
</script>

<template>
  <div class="song-control">
    <div class="songInfo">
      <div class="songName text-xl">{{ playerStore.currentSong?.title }}</div>
      <ArtistDivider :artists="playerStore.currentSong?.artist || []" />
    </div>
    <div class="progressBar">
      <BouncingSlider
        :value="currentTime"
        :min="0"
        :max="duration"
        :is-playing="false"
        :change-on-drag="true"
        @change="handleSeek"
        @after-change="handleSeek"
      />
      <div class="timeDisplay flex justify-between">
        <div class="totalTime">{{ formatTime(duration) }}</div>
        <div class="leftTime">- {{ formatTime(duration - currentTime) }}</div>
      </div>
      <div class="control flex justify-center gap-10 mt-10">
        <div class="prevSong" @click="playerStore.next()">上一首</div>
        <div
          class="playPause"
          @click="playerStore.playing ? playerStore.pause() : playerStore.play()"
        >
          播放/暂停
        </div>
        <div class="nextSong" @click="playerStore.next()">下一歌曲</div>
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
