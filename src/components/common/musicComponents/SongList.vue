<script setup lang="ts">
import { PlayIcon, HeartIcon, ListPlusIcon, MoreVerticalIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import type { Song, Artist, Album } from '@/types/musicTypes';
import ArtistDivider from './artistDivider.vue';
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';
import { MESSAGE_TYPE } from '@/constants/messages';
import { usePlayerStore } from '@/stores/playerStore';

const playerStore = usePlayerStore();

const props = defineProps<{
  songs: Song[];
}>();

const handleInsertSong = (song :Song) =>{
  emitter.emit(EVENTS.INSERT_NEXT,song);
  emitter.emit(MESSAGE_TYPE.TOAST_INFO, `已将歌曲 "${song.title}" 插入到下一首`)
}

const playSong = (song :Song) =>{
  emitter.emit(EVENTS.INSERT_AND_PLAY,song);
  emitter.emit(MESSAGE_TYPE.TOAST_INFO, `开始播放歌曲 "${song.title}"`)
}
</script>

<template>
  <div class="song-list-container glass-card rounded-2xl p-6">
    <h2 class="text-2xl font-bold mb-6">歌曲列表</h2>
    <div class="space-y-2">
      <div v-for="(song, index) in songs" :key="song.id" class="song-item group" @dblclick="playSong(song)">
        <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <!-- 序号/播放按钮 -->
          <div class="w-8 h-8 flex items-center justify-center">
            <span v-if="song.id !== playerStore.currentSong?.id" class="text-sm text-gray-500">{{ index + 1 }}</span>
            <PlayIcon v-else class="h-5 w-5 text-red-500" />
          </div>

          <!-- 封面 -->
          <img :src="song.cover" :alt="song.title" class="w-12 h-12 rounded-lg object-cover" />

          <!-- 歌曲信息 -->
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 dark:text-white truncate">
              {{ song.title }}
            </h3>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span class="truncate">
                <ArtistDivider v-if="song.artist" :artists="song.artist" />
              </span>
              <span>•</span>
              <span class="truncate hover:text-red-500" @click.stop="emitter.emit(EVENTS.ALBUM_CLICK, song.album)">{{
                song.album.title }}</span>
              <span>•</span>
              <span>{{ song.duration }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon">
              <HeartIcon class="h-4 w-4" />
            </Button>
            <Button @click="handleInsertSong(song)" variant="ghost" size="icon">
              <ListPlusIcon class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVerticalIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 歌曲列表 */
.song-item {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 10px;
}

.song-item:hover {
  transform: translateY(-3px);
}

.dark .song-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}
</style>