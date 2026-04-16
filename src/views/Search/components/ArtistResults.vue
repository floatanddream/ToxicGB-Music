<script setup lang="ts">
import type { Artist } from '@/types/musicTypes';
import ArtistCard from '@/components/common/musicComponents/ArtistCard.vue';
import { User } from 'lucide-vue-next';

defineProps<{
  artists: Artist[];
}>();
</script>

<template>
  <div class="artist-results">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">歌手</h2>
      <span class="text-sm text-gray-500">{{ artists.length }} 位歌手</span>
    </div>

    <div v-if="artists.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <ArtistCard v-for="artist in artists" :key="artist.id" :artist="artist" />
    </div>

    <div v-else class="empty-state">
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <User class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">没有找到歌手</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">试试其他关键词</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.artist-card {
  transition: all 0.2s ease;
}

.artist-card:hover {
  transform: translateY(-4px);
}

.artist-card:hover h3 {
  color: #0ea5e9;
}

.artist-image {
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.artist-card:hover .artist-image {
  transform: scale(1.1);
}
</style>