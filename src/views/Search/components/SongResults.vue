<script setup lang="ts">
import { ref } from 'vue';
import { Music2, Play, Pause } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
}

defineProps<{
  songs: Song[];
  isPlaying: boolean;
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

    <div class="space-y-2">
      <div
        v-for="song in songs"
        :key="song.id"
        class="song-item group"
      >
        <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
            <img :src="song.cover" :alt="song.title" class="w-full h-full object-cover" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">{{ song.title }}</h3>
              <Music2 class="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span class="truncate">{{ song.artist }}</span>
              <span>•</span>
              <span class="truncate">{{ song.album }}</span>
              <span>•</span>
              <span class="flex-shrink-0">{{ song.duration }}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            @click="$emit('play-song', song)"
          >
            <Play v-if="!isPlaying" class="w-5 h-5" />
            <Pause v-else class="w-5 h-5" />
          </Button>
        </div>
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