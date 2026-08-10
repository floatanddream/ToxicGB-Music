<script setup lang="ts">
import type { Song } from '@/types/musicTypes';
import SongListInfinite from '@/components/infiniteScroll/SongListInfinite.vue';

defineProps<{
  songs: Song[];
}>();
</script>

<template>
  <div class="album-songs">
    <div class="content-header flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold">专辑歌曲</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">共 {{ songs.length }} 首歌曲</p>
      </div>
    </div>
    <SongListInfinite :songs="songs" />
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

.content-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 16px;
}

@media (max-width: 640px) {
  .album-songs {
    padding: 16px;
  }
}
</style>
