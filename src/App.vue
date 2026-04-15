<script setup lang="ts">
import LayoutContainer from '@/components/layout/LayoutContainer.vue'
import emitter from '@/utils/eventBus'
import { onMounted, onUnmounted } from 'vue'
import { EVENTS } from './constants/events'
import { useRouter } from 'vue-router'
import type { Artist } from './types/musicTypes'

const router = useRouter()

const handleArtistClick = ( e:Artist ) => {
  router.push({
    name: 'artist',
    query: {
      id: e.id
    }
  })
}


onMounted(() => {
  emitter.on(EVENTS.ARTIST_CLICK, handleArtistClick)
})

onUnmounted(() => {
  emitter.off(EVENTS.ARTIST_CLICK, handleArtistClick)
})
</script>

<template>
  <LayoutContainer>
    <Transition name="scale" mode="out-in">
      <RouterView />
    </Transition>
  </LayoutContainer>
</template>

<style scoped>
/* 缩放 + 淡入淡出动画 */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.4s ease;
}

.scale-enter-from {
  transform: scale(0.95);
  opacity: 0;
}

.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
