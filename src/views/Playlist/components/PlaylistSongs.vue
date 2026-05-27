<script setup lang="ts">
import type { Song } from '@/types/musicTypes';
import SongsContainer from '@/components/common/pageComponents/songsContainer.vue';

const props = defineProps<{
  songs: Song[];
}>();
</script>

<template>
  <div class="playlist-songs">
    <SongsContainer title="歌单歌曲" :songs="songs" />
    <div class="songs-footer mt-6 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        最后更新: {{ new Date().toLocaleDateString() }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.playlist-songs {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .playlist-songs {
    padding: 16px;
  }
}
</style>
