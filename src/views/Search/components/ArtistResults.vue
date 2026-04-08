<script setup lang="ts">
import { ref } from 'vue';
import { User, Music2, Play } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

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

defineEmits<{
  'artist-click': [artist: Artist];
}>();
</script>

<template>
  <div class="artist-results">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">歌手</h2>
      <span class="text-sm text-gray-500">{{ artists.length }} 位歌手</span>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div
        v-for="artist in artists"
        :key="artist.id"
        class="artist-card group cursor-pointer"
        @click="$emit('artist-click', artist)"
      >
        <div class="relative">
          <div class="aspect-square rounded-full overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all">
            <img :src="artist.avatar" :alt="artist.name" class="w-full h-full object-cover" />
          </div>
          <div
            v-if="artist.verified"
            class="absolute bottom-3 right-0 bg-sky-500 rounded-full p-1"
          >
            <User class="w-3 h-3 text-white" />
          </div>
        </div>

        <h3 class="font-medium text-gray-900 dark:text-white text-center truncate">
          {{ artist.name }}
        </h3>

        <div class="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>{{ artist.fanCount }} 粉丝</span>
          <span>•</span>
          <span>{{ artist.songCount }} 歌曲</span>
        </div>
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