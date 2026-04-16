<script setup lang="ts">
import { User } from 'lucide-vue-next';
import { formatNumber } from '@/utils/format';
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';
import type { Artist } from '@/types/musicTypes';

defineProps<{
  artist: Artist;
}>();

const handleArtistClick = (artist: Artist) => {
  emitter.emit(EVENTS.ARTIST_CLICK, artist);
  emitter.emit(EVENTS.SCROOL_TOP);
};
</script>

<template>
  <div class="artist-card group cursor-pointer" @click="handleArtistClick(artist)">
    <div class="relative">
      <div
        class="aspect-square rounded-full overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all relative">
        <img :src="artist.avatar" :alt="artist.name" class="w-full h-full object-cover artist-image" />
      </div>
      <div v-if="artist.verified" class="absolute bottom-2 right-5 bg-red-500 rounded-full p-1">
        <User class="w-5 h-5 text-white" />
      </div>
    </div>

    <h3 class="font-medium text-gray-900 dark:text-white text-center truncate">
      {{ artist.name }}
    </h3>

    <div class="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
      <span>{{ formatNumber(Number(artist.fanCount)) }} 粉丝</span>
      <span>•</span>
      <span>{{ artist.songCount }} 歌曲</span>
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