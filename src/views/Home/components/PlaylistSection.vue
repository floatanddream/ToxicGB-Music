<template>
  <div class="playlist-section px-4 md:px-6 py-8">
    <div class="section-header mb-10">
      <h2 class="text-3xl font-bold tracking-tight">推荐歌单</h2>
      <p class="text-secondary mt-2">发现属于你的音乐世界</p>
    </div>

    <div class="playlist-carousel">
      <!-- 左按钮 -->
      <button class="carousel-button left-button" @click="scrollLeft" :disabled="isAtStart">
        <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- 滚动容器 -->
      <div class="playlist-scroll-container" ref="scrollContainer">
        <div class="playlist-flex-container">
          <div
            v-for="playlist in playlists"
            :key="playlist.id"
            class="playlist-card-wrapper"
          >
            <!-- 背景光效 -->
            <div class="playlist-glow" :class="{ active: hoveredPlaylist === playlist.id }" />

        <!-- 主卡片 -->
        <div
          class="relative rounded-2xl bg-card/70 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          :class="{
            'scale-105 shadow-2xl': hoveredPlaylist === playlist.id,
            'ring-2 ring-primary/30': playlist.isPremium
          }"
        >
          <!-- 封面区域 -->
          <div class="relative aspect-square overflow-hidden">
            <!-- 封面图片 -->
            <img
              :src="playlist.coverUrl"
              :alt="playlist.name"
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <!-- 渐变遮罩 -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <!-- 播放按钮 -->
            <div
              class="absolute bottom-3 right-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300"
            >
              <Button
                size="icon"
                class="rounded-full bg-primary hover:bg-primary/90 shadow-xl w-12 h-12"
                @click.stop="playPlaylist(playlist)"
              >
                <PlayIcon class="w-6 h-6 text-white ml-0.5" />
              </Button>
            </div>

            <!-- 喜欢按钮 -->
            <div class="absolute top-3 right-3">
              <Button
                variant="ghost"
                size="icon"
                class="w-8 h-8 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-sm transition-all duration-300"
                :class="{ 'scale-110': playlist.isLiked }"
                @click.stop="toggleLike(playlist)"
              >
                <HeartIcon
                  class="w-4 h-4 text-white transition-all duration-300"
                  :class="{ 'fill-red-500 text-red-500 scale-110': playlist.isLiked }"
                />
              </Button>
            </div>

            <!-- 优质标识 -->
            <div
              v-if="playlist.isPremium"
              class="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-xs px-2 py-1 rounded-full font-semibold"
            >
              优质
            </div>

            <!-- 播放数量 -->
            <div class="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-medium">
              <UsersIcon class="w-3 h-3" />
              <span>{{ formatPlayCount(playlist.playCount) }}</span>
            </div>
          </div>

          <!-- 信息区域 -->
          <div class="p-5 space-y-4">
            <!-- 标题 -->
            <h3 class="font-semibold text-base leading-tight line-clamp-2 min-h-[2.5rem]">
              {{ playlist.name }}
            </h3>

            <!-- 描述 -->
            <p class="text-sm text-secondary line-clamp-2 min-h-[2rem]">
              {{ playlist.description }}
            </p>

            <!-- 统计信息 -->
            <div class="flex items-center justify-between text-xs text-tertiary">
              <div class="flex items-center gap-2">
                <MusicIcon class="w-3 h-3" />
                <span>{{ playlist.songCount }} 首歌曲</span>
              </div>
              <div class="flex items-center gap-2">
                <ClockIcon class="w-3 h-3" />
                <span>{{ playlist.duration }}</span>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="flex gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                class="flex-1 bg-primary/10 hover:bg-primary/20 text-primary dark:bg-primary/20 dark:hover:bg-primary/30 transition-colors"
                @click.stop="playPlaylist(playlist)"
              >
                <PlayIcon class="w-3 h-3 mr-1" />
                播放
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="w-8 h-8 border-secondary hover:bg-tertiary"
                @click.stop="addToLibrary(playlist)"
              >
                <PlusIcon class="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                class="w-8 h-8 border-secondary hover:bg-tertiary"
                @click.stop="sharePlaylist(playlist)"
              >
                <Share2Icon class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <!-- 进度条（如果正在播放） -->
          <div
            v-if="playlist.isPlaying"
            class="absolute bottom-0 left-0 right-0 h-1 bg-primary/30"
          >
            <div class="h-full bg-primary animate-pulse" style="width: 65%" />
          </div>
        </div>
      </div>

      <!-- 右按钮 -->
      <button class="carousel-button right-button" @click="scrollRight" :disabled="isAtEnd">
        <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import {
  PlayIcon,
  HeartIcon,
  PlusIcon,
  ClockIcon,
  MusicIcon,
  UsersIcon,
  Share2Icon,
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

interface Playlist {
  id: number;
  name: string;
  description: string;
  coverUrl: string;
  songCount: number;
  duration: string;
  playCount: number;
  isLiked: boolean;
  isPremium: boolean;
  isPlaying: boolean;
}

const hoveredPlaylist = ref<number | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
const scrollPosition = ref(0);
const isAtStart = ref(true);
const isAtEnd = ref(false);

const playlists = ref<Playlist[]>([
  {
    id: 1,
    name: '华语流行精选',
    description: '最新华语流行歌曲合集，包含当下最热门单曲',
    coverUrl: 'https://picsum.photos/200/200?random=10',
    songCount: 24,
    duration: '1小时23分',
    playCount: 125000,
    isLiked: true,
    isPremium: true,
    isPlaying: false,
  },
  {
    id: 2,
    name: '欧美热单',
    description: 'Billboard 热门单曲，紧跟国际音乐潮流',
    coverUrl: 'https://picsum.photos/200/200?random=11',
    songCount: 18,
    duration: '1小时15分',
    playCount: 98000,
    isLiked: false,
    isPremium: false,
    isPlaying: true,
  },
  {
    id: 3,
    name: '轻音乐时光',
    description: '放松身心的轻音乐，适合工作学习时聆听',
    coverUrl: 'https://picsum.photos/200/200?random=12',
    songCount: 32,
    duration: '2小时08分',
    playCount: 87000,
    isLiked: true,
    isPremium: true,
    isPlaying: false,
  },
  {
    id: 4,
    name: '摇滚力量',
    description: '经典摇滚歌曲，感受音乐的力量',
    coverUrl: 'https://picsum.photos/200/200?random=13',
    songCount: 21,
    duration: '1小时45分',
    playCount: 156000,
    isLiked: false,
    isPremium: false,
    isPlaying: false,
  },
  {
    id: 5,
    name: '电子音乐',
    description: '最新电子音乐，适合运动健身时播放',
    coverUrl: 'https://picsum.photos/200/200?random=14',
    songCount: 28,
    duration: '1小时52分',
    playCount: 203000,
    isLiked: false,
    isPremium: true,
    isPlaying: false,
  },
  {
    id: 6,
    name: '怀旧经典',
    description: '重温经典老歌，找回青春记忆',
    coverUrl: 'https://picsum.photos/200/200?random=15',
    songCount: 35,
    duration: '2小时31分',
    playCount: 67000,
    isLiked: true,
    isPremium: false,
    isPlaying: false,
  },
  {
    id: 7,
    name: '流行金曲',
    description: '流行音乐经典之作',
    coverUrl: 'https://picsum.photos/200/200?random=16',
    songCount: 26,
    duration: '1小时38分',
    playCount: 178000,
    isLiked: false,
    isPremium: false,
    isPlaying: false,
  },
  {
    id: 8,
    name: '爵士风情',
    description: '经典爵士音乐合集',
    coverUrl: 'https://picsum.photos/200/200?random=17',
    songCount: 22,
    duration: '1小时29分',
    playCount: 95000,
    isLiked: true,
    isPremium: true,
    isPlaying: false,
  },
]);

const cardWidth = 16; // rem
const gapWidth = 1.5; // rem
const totalWidth = cardWidth + gapWidth; // rem

const updateButtonState = () => {
  if (scrollContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
    scrollPosition.value = scrollLeft;
    isAtStart.value = scrollLeft <= 0;
    isAtEnd.value = scrollLeft + clientWidth >= scrollWidth;
  }
};

const scrollLeft = () => {
  if (scrollContainer.value) {
    const currentScroll = scrollContainer.value.scrollLeft;
    const targetScroll = Math.max(0, currentScroll - totalWidth * 16);
    scrollContainer.value.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    setTimeout(updateButtonState, 100);
  }
};

const scrollRight = () => {
  if (scrollContainer.value) {
    const currentScroll = scrollContainer.value.scrollLeft;
    const maxScroll = scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth;
    const targetScroll = Math.min(maxScroll, currentScroll + totalWidth * 16);
    scrollContainer.value.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
    setTimeout(updateButtonState, 100);
  }
};

onMounted(() => {
  nextTick(() => {
    updateButtonState();
  });
});

const toggleLike = (playlist: Playlist) => {
  playlist.isLiked = !playlist.isLiked;
};

const playPlaylist = (playlist: Playlist) => {
  playlists.value.forEach(p => (p.isPlaying = false));
  playlist.isPlaying = true;
  // 这里可以添加实际的播放逻辑
};

const addToLibrary = (playlist: Playlist) => {
  // 添加到音乐库逻辑
};

const sharePlaylist = (playlist: Playlist) => {
  // 分享逻辑
};

const formatPlayCount = (count: number): string => {
  if (count >= 100000) {
    return `${(count / 10000).toFixed(0)}万`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
};

onMounted(() => {
  updateButtonState();
});
</script>

<style scoped>
.playlist-section {
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.25rem;
  line-height: 2.5rem;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 3rem;
  margin: 0;
}

.playlist-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.5rem;
}

@media (max-width: 1536px) {
  .section-header h2 {
    font-size: 2rem;
  }
}

@media (max-width: 1280px) {
  .section-header h2 {
    font-size: 1.875rem;
  }
}

@media (max-width: 768px) {
  .section-header h2 {
    font-size: 1.75rem;
  }
}
</style>