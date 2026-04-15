<script setup lang="ts">
import LayoutContainer from '@/components/layout/LayoutContainer.vue'
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
