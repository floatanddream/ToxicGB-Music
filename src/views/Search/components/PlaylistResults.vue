<script setup lang="ts">
import { ref } from 'vue';
import { Disc3, Music2, User, Clock, Play, Heart } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

interface Playlist {
  id: string;
  title: string;
  creator: string;
  cover: string;
  songCount: string;
  playCount: string;
  likeCount: string;
  isLiked: boolean;
  description: string;
  updateTime: string;
}

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

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="playlist in playlists"
        :key="playlist.id"
        class="playlist-card group cursor-pointer"
        @click="$emit('playlist-click', playlist)"
      >
        <div class="relative">
          <div class="aspect-square rounded-lg overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all">
            <img :src="playlist.cover" :alt="playlist.title" class="w-full h-full object-cover" />
          </div>

          <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              class="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
              @click.stop="$emit('like-playlist', playlist)"
            >
              <Heart
                class="w-4 h-4"
                :class="{ 'fill-red-500 text-red-500': playlist.isLiked }"
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              class="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white"
            >
              <Play class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <h3 class="font-medium text-gray-900 dark:text-white truncate">
          {{ playlist.title }}
        </h3>

        <p class="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
          {{ playlist.description }}
        </p>

        <div class="flex items-center gap-3 text-xs text-gray-400 mt-2">
          <div class="flex items-center gap-1">
            <User class="w-3 h-3" />
            <span>{{ playlist.creator }}</span>
          </div>
          <span>•</span>
          <div class="flex items-center gap-1">
            <Music2 class="w-3 h-3" />
            <span>{{ playlist.songCount }} 首</span>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs text-gray-400 mt-1">
          <div class="flex items-center gap-1">
            <Play class="w-3 h-3" />
            <span>{{ playlist.playCount }} 播放</span>
          </div>
          <span>•</span>
          <div class="flex items-center gap-1">
            <Heart class="w-3 h-3" />
            <span>{{ playlist.likeCount }}</span>
          </div>
          <span>•</span>
          <div class="flex items-center gap-1">
            <Clock class="w-3 h-3" />
            <span>{{ playlist.updateTime }}</span>
          </div>
        </div>
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
    color: #0ea5e9;
  }
  </style>