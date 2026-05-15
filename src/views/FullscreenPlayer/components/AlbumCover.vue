<script setup lang="ts">
defineProps<{
  cover: string
  title: string
}>()
</script>

<template>
  <div class="cover-container">
    <img
      :src="cover"
      :alt="title"
      class="album-cover"
    />
    <div class="cover-reflection"></div>
  </div>
</template>

<style scoped>
.cover-container {
  position: relative;
  max-width: 400px;
  width: 100%;
}

.album-cover {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.cover-reflection {
  position: absolute;
  bottom: -60px;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.1), transparent);
  border-radius: 0 0 8px 8px;
  transform: scaleY(-1);
  opacity: 0.3;
  filter: blur(8px);
}
</style>
