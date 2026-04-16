<script setup lang="ts">
import { User } from 'lucide-vue-next';
import { formatNumber } from '@/utils/format';
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'

interface Artist {
  id: string;
  name: string;
  avatar: string;
  fanCount: string;
  songCount: string;
  verified: boolean;
}

defineProps<{
  artists: Artist[];
}>();

const handleArtistClick = (artist : Artist) =>{
  emitter.emit(EVENTS.ARTIST_CLICK, artist);
  emitter.emit(EVENTS.SCROOL_TOP);
};

</script>

<template>
  <div class="artist-results">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">歌手</h2>
      <span class="text-sm text-gray-500">{{ artists.length }} 位歌手</span>
    </div>

    <div v-if="artists.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div v-for="artist in artists" :key="artist.id" class="artist-card group cursor-pointer"
        @click="handleArtistClick(artist)">
        <div class="relative">
          <div
            class="aspect-square rounded-full overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all">
            <img :src="artist.avatar" :alt="artist.name" class="w-full h-full object-cover" />
          </div>
          <div v-if="artist.verified" class="absolute bottom-2 right-5  bg-red-500 rounded-full p-1">
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
</style>