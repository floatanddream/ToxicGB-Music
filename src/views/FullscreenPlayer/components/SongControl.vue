<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps<{
  duration: number
  currentTime: number
}>()

const emit = defineEmits<{
  seek: [time: number]
}>()

const tempSeekValue = ref(props.currentTime)
const isDragging = ref(false)
const progressRef = ref<HTMLElement | null>(null)

const calcSeekFromEvent = (clientX: number): number => {
  if (!progressRef.value || !props.duration) return 0
  const rect = progressRef.value.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  return ratio * props.duration
}

const handleMouseDown = (e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true
  const value = calcSeekFromEvent(e.clientX)
  tempSeekValue.value = value
  emit('seek', value)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return
  const value = calcSeekFromEvent(e.clientX)
  tempSeekValue.value = value
  emit('seek', value)
}

const handleMouseUp = () => {
  isDragging.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const handleTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  const value = calcSeekFromEvent(e.touches[0]!.clientX)
  tempSeekValue.value = value
  emit('seek', value)
  document.addEventListener('touchmove', handleTouchMove)
  document.addEventListener('touchend', handleTouchEnd)
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return
  const value = calcSeekFromEvent(e.touches[0]!.clientX)
  tempSeekValue.value = value
  emit('seek', value)
}

const handleTouchEnd = () => {
  isDragging.value = false
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('touchmove', handleTouchMove)
  document.removeEventListener('touchend', handleTouchEnd)
})

watch(() => props.currentTime, (newTime) => {
  if (!isDragging.value) {
    tempSeekValue.value = newTime
  }
})
</script>

<template>
  <div class="song-control">
    <div
      ref="progressRef"
      class="progress-bar"
      :class="{ dragging: isDragging }"
      @mousedown="handleMouseDown"
      @touchstart.prevent="handleTouchStart"
    >
      <div class="progress-track">
        <div
          class="progress-fill"
          :style="{ width: `${(tempSeekValue / duration) * 100}%` }"
        >
          <div class="progress-thumb"></div>
        </div>
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

.progress-bar {
  position: relative;
  width: 100%;
  cursor: pointer;
}

.progress-track {
  height: 15px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
  overflow: hidden;
  transform: scaleY(0.8);
  transform-origin: center;
  transition: transform 0.5s ease, box-shadow 0.5s ease;
}

.progress-bar:hover .progress-track,
.progress-bar.dragging .progress-track {
  transform: scaleY(1.3);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.1);
  
}

.progress-fill {
  height: 100%;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 6px;
  position: relative;
  transition: background 0.15s ease;
}

.progress-bar:hover .progress-fill,
.progress-bar.dragging .progress-fill {
  background: rgba(255, 255, 255, 0.7);
}



.progress-bar:hover .progress-thumb,
.progress-bar.dragging .progress-thumb {
  width: 16px;
  height: 16px;
  opacity: 1;
}

.progress-bar.dragging .progress-track,
.progress-bar.dragging .progress-thumb {
  transition: none;
}
</style>
