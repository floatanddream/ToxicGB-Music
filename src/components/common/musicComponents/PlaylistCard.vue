<script setup lang="ts">
import { Music2, User, Play, Heart } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { formatNumber } from '@/utils/format';
import type { Playlist } from '@/types/musicTypes';

defineProps<{
  playlist: Playlist;
}>();

defineEmits<{
  'playlist-click': [playlist: Playlist];
  'like-playlist': [playlist: Playlist];
  'artist-click': [artist: any];
}>();

const handlePlaylistClick = (playlist: Playlist, event?: Event) => {
  if (event) event.stopPropagation();
  window.dispatchEvent(new CustomEvent('playlist-click', { detail: playlist }));
};
</script>

<template>
  <div class="playlist-card group cursor-pointer" @click="$emit('playlist-click', playlist)">
    <div class="relative">
      <div class="aspect-square rounded-lg overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all relative">
        <img :src="playlist.cover" :alt="playlist.title" class="w-full h-full object-cover playlist-image" />
      </div>

      <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="secondary"
          class="w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white"
          @click.stop="$emit('like-playlist', playlist)">
          <Heart class="w-3 h-3" :class="{ 'fill-red-500 text-red-500': playlist.isLiked }" />
        </Button>
        <Button size="icon" variant="secondary"
          class="w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white">
          <Play class="w-3 h-3" />
        </Button>
      </div>
    </div>

    <h3 class="font-medium text-gray-900 dark:text-white text-sm truncate">
      {{ playlist.title }}
    </h3>

    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger as-child>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate mt-1 cursor-pointer">
            {{ playlist.description }}
          </p>
        </TooltipTrigger>
        <TooltipContent side="top" :side-offset="5" class="max-w-xs">
          <p class="text-xs leading-5 [&:not(:first-child)]:mt-1 whitespace-normal break-words">
            {{ playlist.description }}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
      <div class="flex items-center gap-1">
        <User class="w-2.5 h-2.5" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger as-child>
              <span class="text-xs hover:text-red-500 cursor-pointer truncate max-w-[80px]"
                @click.stop="$emit('artist-click', playlist.creator)">{{ playlist.creator.name }}</span>
            </TooltipTrigger>
            <TooltipContent side="top" :side-offset="5">
              <p class="text-xs">{{ playlist.creator.name }}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <span>•</span>
      <div class="flex items-center gap-1">
        <Music2 class="w-2.5 h-2.5" />
        <span class="text-xs">{{ playlist.songCount }} 首</span>
      </div>
    </div>

    <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
      <div class="flex items-center gap-1">
        <Play class="w-2.5 h-2.5" />
        <span>{{ formatNumber(Number(playlist.playCount)) }} 播放</span>
      </div>
      <span>•</span>
      <div class="flex items-center gap-1">
        <Heart class="w-2.5 h-2.5" />
        <span>{{ playlist.likeCount }}</span>
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