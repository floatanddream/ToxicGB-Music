<script setup lang="ts">
defineProps<{
  size?: 'small' | 'medium' | 'large'
}>()

const emit = defineEmits<{
  click: []
}>()

const sizeClasses = {
  small: 'text-xl',
  medium: 'text-2xl',
  large: 'text-3xl'
}
</script>

<template>
  <div class="app-logo" :class="sizeClasses[size || 'medium']" @click="emit('click')">
    <span class="logo-text">专心音乐！</span>
  </div>
</template>

<style scoped>
.app-logo {
  font-weight: bold;
  color: var(--primary-color);
  cursor: pointer;
  user-select: none;
}

.logo-text {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>