<script setup lang="ts">
import { PlayIcon, HeartIcon, ListPlusIcon, BookmarkPlus, Loader2Icon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import type { Song } from '@/types/musicTypes';
import type { UserSongRecord } from '@/types/user';
import ArtistDivider from './artistDivider.vue';
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';
import { MESSAGE_TYPE } from '@/constants/messages';
import { usePlayerStore } from '@/stores/playerStore';
import { useUserStore } from '@/stores/user';
import { formatNumber } from '@/utils/format';
import { ref, computed, onMounted, onBeforeUnmount, type ComponentPublicInstance } from 'vue';
import { storeToRefs } from 'pinia';

const playerStore = usePlayerStore();
const userStore = useUserStore();
const { userLikeListSet } = storeToRefs(userStore);

const props = defineProps<{
  songRecords: UserSongRecord[];
  loading?: boolean;
}>();

const recordDisplay = defineModel<'week' | 'all'>('recordDisplay', { default: 'week' });

const DISPLAY_BATCH_SIZE = 20;
const displayCount = ref(DISPLAY_BATCH_SIZE);
const loadingMore = ref(false);
const loadMoreTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;

const coverImgRefs = ref<HTMLImageElement[]>([]);

const setCoverRef = (el: Element | ComponentPublicInstance | null) => {
  if (el instanceof HTMLImageElement && !coverImgRefs.value.includes(el)) {
    coverImgRefs.value.push(el);
  }
};

const displayedRecords = computed(() => {
  return props.songRecords.slice(0, displayCount.value);
});

const loadMore = () => {
  if (loadingMore.value || displayCount.value >= props.songRecords.length) {
    return;
  }
  loadingMore.value = true;
  requestAnimationFrame(() => {
    displayCount.value += DISPLAY_BATCH_SIZE;
    loadingMore.value = false;
  });
};

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
  coverImgRefs.value.forEach(img => {
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  });
  coverImgRefs.value.length = 0;
});

const handleInsertSong = (song: Song) => {
  emitter.emit(EVENTS.INSERT_NEXT, song);
  emitter.emit(MESSAGE_TYPE.TOAST_INFO, `已将歌曲 "${song.title}" 插入到下一首`);
};

const playSong = (song: Song) => {
  emitter.emit(EVENTS.INSERT_AND_PLAY, song);
  emitter.emit(MESSAGE_TYPE.TOAST_INFO, `开始播放歌曲 "${song.title}"`);
};

const handleAddSongToUserPlaylist = (song: Song) => {
  emitter.emit(EVENTS.USER_COLLECT_SONG, song);
};

const songs = computed(() => props.songRecords.map(r => r.song));

const playAll = () => {
  emitter.emit(EVENTS.PLAY_ALL, songs.value);
  emitter.emit(MESSAGE_TYPE.TOAST_INFO,'开始播放所有歌曲')
};
</script>

<template>
  <div class="song-record-list glass-card rounded-2xl p-6">
    <!-- 头部 -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <p class="text-sm text-gray-500 dark:text-gray-400">共 {{ songRecords.length }} 首歌曲</p>
      </div>
      <div class="flex items-center gap-2">
        <Button
          :variant="recordDisplay === 'week' ? 'secondary' : 'ghost'"
          size="sm"
          @click="recordDisplay = 'week'"
        >最近一周</Button>
        <Button
          :variant="recordDisplay === 'all' ? 'secondary' : 'ghost'"
          size="sm"
          @click="recordDisplay = 'all'"
        >全部</Button>
        <Button
        v-if="songRecords.length > 0"
        variant="default"
        size="sm"
        class="gap-2 bg-gradient-red-custom"
        @click="playAll"
      >
        <PlayIcon class="h-4 w-4" />
        播放全部
      </Button>
      </div>
    </div>

    <div v-if="loading" class="flex items-center justify-center py-16">
      <Loader2Icon class="h-8 w-8 animate-spin text-gray-400" />
    </div>

    <div v-else-if="songRecords.length === 0" class="flex items-center justify-center py-16">
      <p class="text-sm text-gray-400 dark:text-gray-500">暂无听歌记录</p>
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="(record, index) in displayedRecords"
        :key="record.song.id"
        class="song-item group"
        @dblclick="playSong(record.song)"
      >
        <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <!-- 序号/播放按钮 -->
          <div class="w-8 h-8 flex items-center justify-center shrink-0">
            <span v-if="record.song.id !== playerStore.currentSong?.id" class="text-sm text-gray-500">{{ index + 1 }}</span>
            <PlayIcon v-else class="h-5 w-5 text-red-500" />
          </div>

          <!-- 封面 -->
          <img
            :ref="setCoverRef"
            :src="record.song.cover"
            :alt="record.song.title"
            class="w-12 h-12 rounded-lg object-cover shrink-0"
          />

          <!-- 歌曲信息 -->
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-gray-900 dark:text-white truncate">
              {{ record.song.title }}
            </h3>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <span class="truncate">
                <ArtistDivider v-if="record.song.artist" :artists="record.song.artist" />
              </span>
              <span>•</span>
              <span
                class="truncate hover:text-red-500 cursor-pointer"
                @click.stop="emitter.emit(EVENTS.ALBUM_CLICK, record.song.album)"
              >{{ record.song.album.title }}</span>
              <span>•</span>
              <span>{{ record.song.duration }}</span>
            </div>
          </div>

          <!-- 播放次数 -->
          <div class="hidden sm:flex items-center gap-1 shrink-0 min-w-[80px]">
            <span class="text-sm text-gray-500 dark:text-gray-400">播放</span>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ formatNumber(record.playCount) }}</span>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon" @click="emitter.emit(EVENTS.USER_LIKE_MUSIC, record.song)">
              <HeartIcon
                class="w-4 h-4 text-white transition-all duration-300"
                :class="[userStore.isSongLiked(record.song) ? 'fill-red-500 text-red-500 scale-110' : '']"
              />
            </Button>
            <Button @click="handleInsertSong(record.song)" variant="ghost" size="icon">
              <ListPlusIcon class="h-4 w-4" />
            </Button>
            <Button @click="handleAddSongToUserPlaylist(record.song)" variant="ghost" size="icon">
              <BookmarkPlus class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <!-- 加载更多指示器 -->
      <div
        v-if="displayedRecords.length < songRecords.length"
        ref="loadMoreTrigger"
        class="flex items-center justify-center py-8"
      >
        <Loader2Icon class="h-6 w-6 animate-spin text-gray-400" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.song-item {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
  border-radius: 10px;
}

.song-item:hover .p-3 {
  background:
    radial-gradient(ellipse at 50% 30%,
      rgba(255, 255, 255, 0.45) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      transparent 100%),
    rgba(255, 255, 255, 0.35);

  backdrop-filter: blur(10px) saturate(200%) brightness(1.05);
  -webkit-backdrop-filter: blur(25px) saturate(200%) brightness(1.05);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.5),
    inset 0 -1px 0 rgba(0, 0, 0, 0.05),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2),
    0 8px 32px rgba(0, 0, 0, 0.12);
}

.dark .song-item:hover .p-3 {
  background: rgba(37, 37, 37, 0.1);

  backdrop-filter: blur(10px) saturate(180%) brightness(1.5);
  -webkit-backdrop-filter: blur(10px) saturate(180%) brightness(1.5);

  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    inset 0 -1px 0 rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 8px 32px rgba(0, 0, 0, 0.3);
}
</style>
