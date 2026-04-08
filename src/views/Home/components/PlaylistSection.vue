<template>
  <div class="playlist-section px-4 md:px-6 py-8">
    <div class="section-header mb-10">
      <h2 class="text-3xl font-bold tracking-tight">推荐歌单</h2>
      <p class="text-secondary mt-2">发现属于你的音乐世界</p>
    </div>

<<<<<<< HEAD
    <div class="playlist-carousel" @mouseenter="showButtons = true" @mouseleave="showButtons = false">
      <!-- 左按钮 -->
      <button class="carousel-button left-button" @click="() => { scrollLeft(); handlePress('left') }"
        :disabled="isAtStart" :class="[
          { 'opacity-100': showButtons || isButtonHovered, 'opacity-0': !showButtons && !isButtonHovered },
          { 'pressed': isButtonPressed && pressedButton === 'left' }
        ]" @mouseenter="isButtonHovered = true" @mouseleave="isButtonHovered = false;">
        <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- 视口容器 -->
      <div class="playlist-viewport" ref="viewportContainer">
        <div class="playlist-scroll-container" ref="scrollContainer" :style="{ transform: `translateX(-${offset}px)` }">
          <div class="playlist-flex-container">
            <div v-for="playlist in playlists" :key="playlist.id" class="playlist-card-wrapper">
              <!-- 背景光效 -->
              <div class="playlist-glow" :class="{ active: hoveredPlaylist === playlist.id }" />

              <!-- 主卡片 -->
              <div class="playlist-card group" @mouseenter="hoveredPlaylist = playlist.id"
                @mouseleave="hoveredPlaylist = null" :class="{
                  'scale-105 shadow-2xl': hoveredPlaylist === playlist.id,
                  'ring-2 ring-primary/30': playlist.isPremium
                }">
                <!-- 封面区域 -->
                <div class="cover-wrapper">
                  <!-- 封面图片 -->
                  <img :src="playlist.coverUrl" :alt="playlist.name" class="playlist-cover" />

                  <!-- 渐变遮罩 -->
                  <div class="cover-overlay" />

                  <!-- 播放按钮 -->
                  <div class="play-button-container">
                    <Button size="icon" class="play-button-main" @click.stop="playPlaylist(playlist)">
                      <PlayIcon class="w-6 h-6 text-white ml-0.5" />
                    </Button>
                  </div>

                  <!-- 喜欢按钮 -->
                  <div class="like-button-container">
                    <Button variant="ghost" size="icon" class="like-button" :class="{ 'scale-110': playlist.isLiked }"
                      @click.stop="toggleLike(playlist)">
                      <HeartIcon class="w-4 h-4 text-white transition-all duration-300"
                        :class="{ 'fill-red-500 text-red-500 scale-110': playlist.isLiked }" />
                    </Button>
                  </div>

                  <!-- 优质标识 -->
                  <div v-if="playlist.isPremium" class="premium-badge">
                    优质
                  </div>

                  <!-- 播放数量 -->
                  <div class="play-count">
                    <UsersIcon class="w-3 h-3" />
                    <span>{{ formatPlayCount(playlist.playCount) }}</span>
                  </div>
                </div>

                <!-- 信息区域 -->
                <div class="playlist-info">
                  <!-- 标题 -->
                  <h3 class="playlist-title">
                    {{ playlist.name }}
                  </h3>

                  <!-- 描述 -->
                  <p class="playlist-description">
                    {{ playlist.description }}
                  </p>

                  <!-- 统计信息 -->
                  <div class="playlist-stats">
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
                  <div class="playlist-actions">
                    <Button variant="secondary" size="sm" class="play-button" @click.stop="playPlaylist(playlist)">
                      <PlayIcon class="w-3 h-3 mr-1" />
                      播放
                    </Button>
                    <Button variant="outline" size="icon" class="action-button" @click.stop="addToLibrary(playlist)">
                      <PlusIcon class="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" class="action-button" @click.stop="sharePlaylist(playlist)">
                      <Share2Icon class="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <!-- 进度条（如果正在播放） -->
                <div v-if="playlist.isPlaying" class="progress-bar">
                  <div class="progress-fill" />
                </div>
              </div>
            </div>
=======
    <div class="px-4 py-6">
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-6 md:gap-8">
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="group relative cursor-pointer playlist-item"
          @mouseenter="hoveredPlaylist = playlist.id"
          @mouseleave="hoveredPlaylist = null"
        >
          <!-- 背景光效 -->
          <div
            class="absolute -inset-4 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl playlist-glow"
            :class="{ 'opacity-100': hoveredPlaylist === playlist.id }"
          />

          <!-- 主卡片 -->
          <div
            class="relative rounded-2xl bg-card/70 dark:bg-gray-800/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden playlist-card"
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
                class="w-full h-full object-cover playlist-cover"
              />

              <!-- 渐变遮罩 -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <!-- 播放按钮 -->
              <div class="play-button-container">
                <Button
                  size="icon"
                  class="rounded-full bg-primary hover:bg-primary/90 shadow-xl w-12 h-12 play-button-main"
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
                  class="w-8 h-8 rounded-full bg-black/30 hover:bg-black/40 backdrop-blur-sm transition-all duration-300 like-button"
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
              <div v-if="playlist.isPremium" class="premium-badge">
                优质
              </div>

              <!-- 播放数量 -->
              <div class="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-medium">
                <UsersIcon class="w-3 h-3" />
                <span>{{ formatPlayCount(playlist.playCount) }}</span>
              </div>
            </div>

            <!-- 信息区域 -->
            <div class="playlist-info">
              <!-- 标题 -->
              <h3 class="playlist-title">
                {{ playlist.name }}
              </h3>

              <!-- 描述 -->
              <p class="playlist-description">
                {{ playlist.description }}
              </p>

              <!-- 统计信息 -->
              <div class="playlist-stats">
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
              <div class="playlist-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  class="play-button"
                  @click.stop="playPlaylist(playlist)"
                >
                  <PlayIcon class="w-3 h-3 mr-1" />
                  播放
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  class="action-button"
                  @click.stop="addToLibrary(playlist)"
                >
                  <PlusIcon class="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  class="action-button"
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
>>>>>>> a1c846468964e9ef8889c5a8f34a2a9d166e4f24
          </div>
        </div>
      </div>

      <button class="carousel-button right-button" @click="() => { scrollRight(); handlePress('right') }"
        :disabled="isAtEnd" :class="[
          { 'opacity-100': showButtons || isButtonHovered, 'opacity-0': !showButtons && !isButtonHovered },
          { 'pressed': isButtonPressed && pressedButton === 'right' }
        ]" @mouseenter="isButtonHovered = true" @mouseleave="isButtonHovered = false">
        <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue';
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
const viewportContainer = ref<HTMLElement | null>(null);
const offset = ref(0);
const currentIndex = ref(0);
const showButtons = ref(false);
const isButtonHovered = ref(false);
const isButtonPressed = ref(false);
const pressedButton = ref<'left' | 'right' | null>(null);

const handlePress = (type) => {
  pressedButton.value = type
  isButtonPressed.value = true

  setTimeout(() => {
    isButtonPressed.value = false
    pressedButton.value = null
  }, 150) // 动画时间
}

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
  {
    id: 9,
    name: '民谣风',
    description: '清新民谣歌曲，感受自然的旋律',
    coverUrl: 'https://picsum.photos/200/200?random=18',
    songCount: 19,
    duration: '1小时12分',
    playCount: 45000,
    isLiked: false,
    isPremium: false,
    isPlaying: false,
  },
  {
    id: 10,
    name: '说唱潮流',
    description: '最新说唱音乐，感受街头文化',
    coverUrl: 'https://picsum.photos/200/200?random=19',
    songCount: 25,
    duration: '1小时35分',
    playCount: 134000,
    isLiked: true,
    isPremium: true,
    isPlaying: false,
  },
  {
    id: 11,
    name: '古典之美',
    description: '经典古典音乐，享受高雅艺术',
    coverUrl: 'https://picsum.photos/200/200?random=20',
    songCount: 16,
    duration: '2小时05分',
    playCount: 32000,
    isLiked: false,
    isPremium: true,
    isPlaying: false,
  },
  {
    id: 12,
    name: 'R&B节奏',
    description: '动感R&B音乐，随节奏摇摆',
    coverUrl: 'https://picsum.photos/200/200?random=21',
    songCount: 23,
    duration: '1小时32分',
    playCount: 89000,
    isLiked: true,
    isPremium: false,
    isPlaying: false,
  },
]);

const cardWidth = ref(1); // 默认宽度，避免初始为0
const visibleCards = ref(0);
const maxOffset = computed(() => {
  if (!scrollContainer.value || cardWidth.value === 0) return 0;
  const cardSpacing = cardWidth.value + 24; // 24px gap
  const totalWidth = playlists.value.length * cardSpacing;
  const viewportWidth = viewportContainer.value?.clientWidth || 0;
  return Math.max(0, totalWidth - viewportWidth);
});

const maxIndex = computed(() => {
  if (cardWidth.value === 0) return 0;
  const cardSpacing = cardWidth.value + 24;
  return Math.max(0, Math.ceil(maxOffset.value / cardSpacing));
});

const isAtStart = computed(() => currentIndex.value === 0);
const isAtEnd = computed(() => cardWidth.value > 0 && currentIndex.value >= maxIndex.value);

const updateLayout = () => {
  if (scrollContainer.value && viewportContainer.value) {
    // 直接获取卡片包装器的宽度
    const cardWrapper = scrollContainer.value.querySelector('.playlist-card-wrapper');
    if (cardWrapper) {
      const cardRect = cardWrapper.getBoundingClientRect();
      cardWidth.value = cardRect.width;
    }
    const cardSpacing = cardWidth.value + 24;
    visibleCards.value = Math.max(1, Math.floor(viewportContainer.value.clientWidth / cardSpacing));
  }
};

const scrollLeft = () => {
  if (currentIndex.value > 0) {
    const step = 3; // 每次滚动3个卡片
    currentIndex.value = Math.max(0, currentIndex.value - step);
    offset.value = currentIndex.value * (cardWidth.value + 24);
  }
};

const scrollRight = () => {
  if (scrollContainer.value && !isAtEnd.value) {
    const step = 3; // 每次滚动3个卡片
    currentIndex.value = Math.min(maxIndex.value, currentIndex.value + step);
    offset.value = currentIndex.value * (cardWidth.value + 24);
  }
};

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
  const initLayout = () => {
    if (scrollContainer.value && scrollContainer.value.children.length > 0) {
      updateLayout();
    } else {
      setTimeout(initLayout, 50);
    }
  };
  nextTick(initLayout);
  window.addEventListener('resize', updateLayout);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateLayout);
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

<<<<<<< HEAD
.playlist-carousel {
  position: relative;
  width: 100%;
  height: 32rem;
  display: flex;
  align-items: center;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease, opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 20;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 1;
}

.carousel-button.opacity-0 {
  opacity: 0;
}

.carousel-button.opacity-100 {
  opacity: 1;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) scale(1);
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: var(--glass-bg);
  border: 1px solid var(--glass-border);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease, opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 20;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 1;
}

/* 点击瞬间 */
.carousel-button.pressed {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

/* 左箭头移动 */
.left-button.pressed .button-icon {
  transform: translateX(-5px);
}

/* 右箭头移动 */
.right-button.pressed .button-icon {
  transform: translateX(5px);
}

/* 图标动画 */
.button-icon {
  transition: transform 0.2s ease;
}

.carousel-button:hover:not(:disabled) {
  background-color: var(--bg-hover);
  transform: translateY(-50%) scale(1.1);
}

.carousel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.left-button {
  left: 0.5rem;
}

.right-button {
  right: 0.5rem;
}

.button-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--text-primary);
}

/* 新增视口容器 */
.playlist-viewport {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: visible;
  padding: 2rem 0;
}

.playlist-scroll-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5rem;
  padding: 0 0.5rem;
  position: relative;
  transition: transform 0.3s ease;
  will-change: transform;
}

.playlist-flex-container {
  display: flex;
  flex-wrap: nowrap;
  gap: 1.5rem;
  position: relative;
}

.playlist-card-wrapper {
  flex: 0 0 auto;
  width: 16rem;
  height: 32rem;
  position: relative;
  z-index: 1;
}

.playlist-card-wrapper:hover {
  z-index: 2;
}

.playlist-glow {
  position: absolute;
  inset: -1rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, hsl(var(--primary)/0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.5s ease;
  filter: blur(1rem);
  z-index: 0;
}

.playlist-glow.active {
  opacity: 1;
}

.playlist-card {
  position: relative;
  height: 100%;
  background-color: var(--bg-card);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 1;
}

.playlist-card:hover {
  transform: scale(1.05);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.25);
  border-color: hsl(var(--primary)/0.3);
  z-index: 2;
}

.cover-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.playlist-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.playlist-card:hover .playlist-cover {
  transform: scale(1.1);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.2) 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-card:hover .cover-overlay {
  opacity: 1;
}

.play-button-container {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  transform: translateY(5rem);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 10;
}

.playlist-card:hover .play-button-container {
  transform: translateY(0);
}

.play-button-main {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background-color: hsl(var(--primary));
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.play-button-main:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.like-button-container {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
}

.like-button {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.3);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.like-button:hover {
  background-color: rgba(0, 0, 0, 0.4);
  transform: scale(1.1);
}

.premium-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(251, 191, 36, 0.3);
  z-index: 10;
  letter-spacing: 0.025em;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: premium-pulse 2s infinite;
}

@keyframes premium-pulse {
  0% {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(251, 191, 36, 0.3);
  }

  50% {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(251, 191, 36, 0.5);
  }

  100% {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(251, 191, 36, 0.3);
  }
}

.play-count {
  position: absolute;
  bottom: 0.75rem;
  left: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  z-index: 10;
}

=======
.playlist-item {
  margin: 0;
  padding: 0;
}

.playlist-glow {
  z-index: 0;
}

.playlist-card {
  z-index: 1;
}

>>>>>>> a1c846468964e9ef8889c5a8f34a2a9d166e4f24
.playlist-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
<<<<<<< HEAD
  height: calc(100% - 16rem);
  justify-content: space-between;
=======
>>>>>>> a1c846468964e9ef8889c5a8f34a2a9d166e4f24
}

.playlist-title {
  font-weight: 600;
  font-size: 1rem;
  line-height: 1.5rem;
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
  margin: 0;
  line-height: 1.375;
<<<<<<< HEAD
=======
}

.playlist-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

.playlist-stats > div {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.playlist-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
  margin: 0;
}

.play-button {
  flex: 1;
  background-color: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
  color: hsl(var(--primary));
  transition: background-color 0.2s ease;
}

.play-button:hover {
  background-color: color-mix(in srgb, hsl(var(--primary)) 20%, transparent);
}

.action-button {
  width: 2rem;
  height: 2rem;
  border-color: var(--border-secondary);
}

.action-button:hover {
  background-color: var(--bg-hover);
}

.playlist-cover {
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform: scale(1);
}

.group:hover .playlist-cover {
  transform: scale(1.1);
}

.play-button-container {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  transform: translateY(5rem);
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  z-index: 10;
}

.group:hover .play-button-container {
  transform: translateY(0);
}

.play-button-main {
  transition: all 0.3s ease;
}

.play-button-main:hover {
  transform: scale(1.1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.premium-badge {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  background: linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(251, 191, 36, 0.3);
  z-index: 10;
  letter-spacing: 0.025em;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: premium-pulse 2s infinite;
}

@keyframes premium-pulse {
  0% {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(251, 191, 36, 0.3);
  }
  50% {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(251, 191, 36, 0.5);
  }
  100% {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(251, 191, 36, 0.3);
  }
}

.play-button-container {
  z-index: 10;
}

.like-button {
  z-index: 10;
>>>>>>> a1c846468964e9ef8889c5a8f34a2a9d166e4f24
}

.playlist-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin: 0;
}

.playlist-stats>div {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.playlist-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 0.5rem;
  margin: 0;
}

.play-button {
  flex: 1;
  background-color: color-mix(in srgb, hsl(var(--primary)) 10%, transparent);
  color: hsl(var(--primary));
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.play-button:hover {
  background-color: color-mix(in srgb, hsl(var(--primary)) 20%, transparent);
}

.action-button {
  width: 2rem;
  height: 2rem;
  border-radius: 0.375rem;
  border: 1px solid var(--border-secondary);
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  background-color: var(--bg-hover);
}

.progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0.25rem;
  background-color: hsl(var(--primary)/0.3);
  z-index: 10;
}

.progress-fill {
  height: 100%;
  background-color: hsl(var(--primary));
  width: 65%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.7;
  }

  100% {
    opacity: 1;
  }
}
</style>