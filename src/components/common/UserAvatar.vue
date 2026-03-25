<script setup lang="ts">
defineProps<{
  src: string
  alt: string
  size?: 'small' | 'medium' | 'large'
}>()

const emit = defineEmits<{
  click: []
}>()

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-10 h-10',
  large: 'w-12 h-12'
}
</script>

<template>
  <img :src="src" :alt="alt" :class="['user-avatar', sizeClasses[size || 'small']]" @click="emit.click" />
</template>

<style scoped>
.user-avatar {
  height: 5vh;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}
</style>