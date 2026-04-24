<script setup lang="ts">
import { PlayIcon, HeartIcon, ListPlusIcon, MoreVerticalIcon, Loader2Icon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import type { Song, Artist, Album } from '@/types/musicTypes';
import ArtistDivider from './artistDivider.vue';
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';
import { MESSAGE_TYPE } from '@/constants/messages';
import { usePlayerStore } from '@/stores/playerStore';
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const playerStore = usePlayerStore();

const props = defineProps<{
  songs: Song[];
}>();

// 分段加载配置
const DISPLAY_BATCH_SIZE = 20; // 每次渲染的数量
const displayCount = ref(DISPLAY_BATCH_SIZE);
const loadingMore = ref(false);
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

// 计算需要显示的歌曲
const displayedSongs = computed(() => {
  return props.songs.slice(0, displayCount.value);
});

// 加载更多歌曲
const loadMore = () => {
  if (loadingMore.value || displayCount.value >= props.songs.length) {
    return;
  }

  loadingMore.value = true;
  // 模拟异步加载，给用户视觉反馈
  requestAnimationFrame(() => {
    displayCount.value += DISPLAY_BATCH_SIZE;
    loadingMore.value = false;
  });
};

// 设置 Intersection Observer
const setupIntersectionObserver = () => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      });
    },
    {
      root: null,
      rootMargin: '15%',
      threshold: 1,
    }
  );
};

onMounted(() => {
  if (loadMoreTrigger.value) {
    setupIntersectionObserver();
    observer?.observe(loadMoreTrigger.value);
  }
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

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
      <div v-for="(song, index) in displayedSongs" :key="song.id" class="song-item group" @dblclick="playSong(song)">
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
      <!-- 加载更多指示器 -->
      <div  v-if="displayedSongs.length < songs.length" ref="loadMoreTrigger" class="flex items-center justify-center py-8">
        <Loader2Icon class="h-6 w-6 animate-spin text-gray-400" />
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
/* 浅色模式 - 透明毛玻璃效果 */
.song-item:hover .p-3 {
  background:
    radial-gradient(
      ellipse at 50% 30%,
      rgba(255, 255, 255, 0.45) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%
    ),
    rgba(255, 255, 255, 0.35);

  backdrop-filter: blur(10px) saturate(200%) brightness(1.05);
  -webkit-backdrop-filter: blur(25px) saturate(200%) brightness(1.05);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.12);
}

/* 暗色模式 - 透明毛玻璃效果 */
.dark .song-item:hover .p-3 {
  background:rgba(37, 37, 37, 0.1);

  backdrop-filter: blur(10px) saturate(180%) brightness(1.5);
  -webkit-backdrop-filter: blur(10px) saturate(180%) brightness(1.5);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 8px 32px rgba(0, 0, 0, 0.3);
}
</style>