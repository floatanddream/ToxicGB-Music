<script setup lang="ts">
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';
import type { Album } from '@/types/musicTypes';
import { Calendar } from 'lucide-vue-next';
import ArtistDivider from './artistDivider.vue';
defineProps<{
    album: Album;
}>();
</script>

<template>
    <div class="album-card group cursor-pointer" @click="emitter.emit(EVENTS.ALBUM_CLICK,album)">
        <div class="aspect-square rounded-lg overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all relative">
            <img :src="album.cover" :alt="album.title" class="w-full h-full object-cover album-image" />
        </div>

        <h3 class="font-medium text-gray-900 dark:text-white truncate group-hover:text-red-500 transition-colors">
            {{ album.title }}
        </h3>

        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
            <span class="truncate">
                <ArtistDivider v-if="album.artist" :artists="album.artist" />
            </span>
            <span>•</span>
            <span class="shrink-0">{{ album.songCount }} 首</span>
        </div>

        <div class="flex items-center gap-2 text-xs text-gray-400 mt-1">
            <Calendar class="w-3 h-3" />
            <span>{{ album.releaseDate }}</span>
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
}</style>