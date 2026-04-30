<script setup lang="ts">
import { Music2, Play, Pause } from 'lucide-vue-next';
import SongList from '@/components/common/musicComponents/SongList.vue';
import type { Song } from '@/types/musicTypes';

const props = defineProps<{
  songs: Song[];
}>();

defineEmits<{
  'play-song': [song: Song];
}>();
</script>

<template>
  <div class="song-results">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">歌曲</h2>
      <span class="text-sm text-gray-500">{{ songs.length }} 首歌曲</span>
    </div>

    <div v-if="songs.length > 0" class="space-y-2">
      <SongList :songs="props.songs" />
    </div>

    <div v-else class="empty-state">
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Music2 class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">没有找到歌曲</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">试试其他关键词</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.song-item {
  border-radius: 8px;
  transition: all 0.2s ease;
}

.song-item:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.dark .song-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>