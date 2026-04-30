<script setup lang="ts">
import { Disc3 } from 'lucide-vue-next';
import type { Playlist } from '@/types/musicTypes';
import PlaylistCard from '@/components/common/musicComponents/PlaylistCard.vue';

defineProps<{
  playlists: Playlist[];
}>();
</script>

<template>
  <div class="playlist-grid">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">歌单</h2>
      <span class="text-sm text-gray-500">{{ playlists.length }} 个歌单</span>
    </div>

    <div v-if="playlists.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <PlaylistCard
        v-for="playlist in playlists"
        :key="playlist.id"
        :playlist="playlist"
      />
    </div>
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Disc3 class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无内容</h3>
    </div>
  </div>
</template>