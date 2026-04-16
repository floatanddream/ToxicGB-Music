<script setup lang="ts">
import { Disc3} from 'lucide-vue-next';
import type { Playlist} from '@/types/musicTypes';
import PlaylistCard from '../../../components/common/musicComponents/PlaylistCard.vue';

defineProps<{
  playlists: Playlist[];
}>();

defineEmits<{
  'playlist-click': [playlist: Playlist];
  'like-playlist': [playlist: Playlist];
}>();
</script>

<template>
  <div class="playlist-results">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">歌单</h2>
      <span class="text-sm text-gray-500">{{ playlists.length }} 个歌单</span>
    </div>

    <div v-if="playlists.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div v-for="playlist in playlists" :key="playlist.id" class="playlist-card group cursor-pointer"
        @click="$emit('playlist-click', playlist)">
        <PlaylistCard :playlist="playlist" />
        </div>
    </div>

    <div v-else class="empty-state">
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Disc3 class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">没有找到歌单</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">试试其他关键词</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.playlist-card {
  transition: all 0.2s ease;
}

.playlist-card:hover {
  transform: translateY(-4px);
}

.playlist-card:hover h3 {
  color: #fb2c36;
}

.playlist-image {
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.playlist-card:hover .playlist-image {
  transform: scale(1.1);
}
</style>