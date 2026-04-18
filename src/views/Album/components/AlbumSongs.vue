<script setup lang="ts">
import type { Song } from '@/types/musicTypes';
import SongsContainer from '@/components/common/pageComponents/songsContainer.vue';

const props = defineProps<{
  songs: Song[];
}>();
</script>

<template>
  <div class="album-songs">
    <SongsContainer title="专辑歌曲" :songs="songs" />
  </div>
</template>

<style scoped>
.album-songs {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .album-songs {
    padding: 16px;
  }
}
</style>
