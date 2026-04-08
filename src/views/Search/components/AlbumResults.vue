<script setup lang="ts">
import { ref } from 'vue';
import { Disc3, Music2, Calendar, Play } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  releaseDate: string;
  songCount: string;
}

defineProps<{
  albums: Album[];
}>();

defineEmits<{
  'album-click': [album: Album];
}>();
</script>

<template>
  <div class="album-results">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">专辑</h2>
      <span class="text-sm text-gray-500">{{ albums.length }} 张专辑</span>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div
        v-for="album in albums"
        :key="album.id"
        class="album-card group cursor-pointer"
        @click="$emit('album-click', album)"
      >
        <div class="aspect-square rounded-lg overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all">
          <img :src="album.cover" :alt="album.title" class="w-full h-full object-cover" />
        </div>

        <h3 class="font-medium text-gray-900 dark:text-white truncate">
          {{ album.title }}
        </h3>

        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
          <span class="truncate">{{ album.artist }}</span>
          <span>•</span>
          <span class="flex-shrink-0">{{ album.songCount }} 首</span>
        </div>

        <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
          <Calendar class="w-3 h-3" />
          <span>{{ album.releaseDate }}</span>
        </div>
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
    color: #0ea5e9;
  }
  </style>