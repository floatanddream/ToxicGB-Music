<script setup lang="ts">
import { Disc3,  Calendar } from 'lucide-vue-next';
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';
import type { Album,Artist } from '@/types/musicTypes';
import AlbumCard from '@/components/common/musicComponents/AlbumCard.vue';

defineProps<{
  albums: Album[];
}>();

defineEmits<{
  'album-click': [album: Album];
  'artist-click': [artist: Artist];
}>();
</script>

<template>
  <div class="album-results">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">专辑</h2>
      <span class="text-sm text-gray-500">{{ albums.length }} 张专辑</span>
    </div>

    <div v-if="albums.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div v-for="album in albums" :key="album.id" class="album-card group cursor-pointer">
        <AlbumCard :album="album" />
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <Disc3 class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">没有找到专辑</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">试试其他关键词</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.album-card {
  transition: all 0.2s ease;
}

.album-card:hover {
  transform: translateY(-4px);
}

.album-card:hover h3 {
  color: #fb2c36;
}

.album-image {
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.album-card:hover .album-image {
  transform: scale(1.1);
}
</style>