<template>
  <div class="latest-music-section px-4 md:px-6">
    <div class="section-header mb-8">
      <h2 class="text-3xl font-bold tracking-tight text-primary">最新音乐</h2>
      <p class="text-secondary mt-2">抢先试听新歌</p>
    </div>

    <div class="music-list space-y-2">
      <div
        v-for="song in songs"
        :key="song.id"
        class="song-item group hover:bg-hover rounded-xl p-4 transition-all duration-200 backdrop-blur-sm border border-secondary"
      >
        <div class="flex items-center gap-4">
          <!-- 播放控制 -->
          <Button
            variant="ghost"
            size="icon"
            @click="togglePlay(song)"
            class="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity w-10 h-10"
          >
            <PauseIcon v-if="song.isPlaying" class="w-5 h-5 text-primary" />
            <PlayIcon v-else class="w-5 h-5 text-secondary" />
          </Button>

          <!-- 歌曲信息 -->
          <div class="flex items-center gap-4 flex-1 min-w-0">
            <img
              :src="song.coverUrl"
              :alt="song.title"
              class="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-md"
            />
            <div class="min-w-0 flex-1">
              <h3 class="font-semibold text-base text-primary truncate mb-1">{{ song.title }}</h3>
              <div class="flex items-center gap-3 text-sm text-secondary">
                <span class="truncate hover:text-primary transition-colors cursor-pointer">{{ song.artist }}</span>
                <span>•</span>
                <span class="truncate text-xs">{{ song.album }}</span>
              </div>
            </div>
          </div>

          <!-- 时长和日期 -->
          <div class="flex items-center gap-4 text-sm text-tertiary">
            <span class="font-medium">{{ song.duration }}</span>
            <span class="hidden sm:inline px-2 py-1 rounded-full bg-tertiary text-xs">{{ formatDate(song.releaseDate) }}</span>
          </div>

          <!-- 操作按钮 -->
          <div class="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              @click="toggleLike(song)"
              class="w-9 h-9 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <HeartIcon
                class="w-4 h-4"
                :class="{ 'fill-red-500 text-red-500': song.isLiked, 'text-secondary': !song.isLiked }"
              />
            </Button>
            <Button variant="ghost" size="icon" class="w-9 h-9 rounded-full hover:bg-tertiary">
              <MoreHorizontalIcon class="w-4 h-4 text-secondary" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon, PauseIcon, ClockIcon, HeartIcon, MoreHorizontalIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ref } from 'vue';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  duration: string;
  releaseDate: string;
  isPlaying: boolean;
  isLiked: boolean;
}

const songs = ref<Song[]>([
  {
    id: 1,
    title: '星光不问赶路人',
    artist: '林俊杰',
    album: '新专辑《时光旅人》',
    coverUrl: 'https://picsum.photos/60/60?random=20',
    duration: '3:45',
    releaseDate: '2024-03-15',
    isPlaying: false,
    isLiked: true
  },
  {
    id: 2,
    title: '城市边缘',
    artist: '周杰伦',
    album: '单曲发行',
    coverUrl: 'https://picsum.photos/60/60?random=21',
    duration: '4:12',
    releaseDate: '2024-03-14',
    isPlaying: false,
    isLiked: false
  },
  {
    id: 3,
    title: '记忆碎片',
    artist: '邓紫棋',
    album: '《回忆拼图》',
    coverUrl: 'https://picsum.photos/60/60?random=22',
    duration: '3:28',
    releaseDate: '2024-03-13',
    isPlaying: false,
    isLiked: true
  },
  {
    id: 4,
    title: '夜空中最亮的星',
    artist: '张杰',
    album: '重制版',
    coverUrl: 'https://picsum.photos/60/60?random=23',
    duration: '4:02',
    releaseDate: '2024-03-12',
    isPlaying: false,
    isLiked: false
  },
  {
    id: 5,
    title: '时光隧道',
    artist: '王菲',
    album: '经典回归',
    coverUrl: 'https://picsum.photos/60/60?random=24',
    duration: '3:56',
    releaseDate: '2024-03-11',
    isPlaying: false,
    isLiked: true
  },
  {
    id: 6,
    title: '风继续吹',
    artist: '张国荣',
    album: '纪念版',
    coverUrl: 'https://picsum.photos/60/60?random=25',
    duration: '4:18',
    releaseDate: '2024-03-10',
    isPlaying: false,
    isLiked: false
  }
]);

const togglePlay = (song: Song) => {
  song.isPlaying = !song.isPlaying;
};

const toggleLike = (song: Song) => {
  song.isLiked = !song.isLiked;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return '昨天';
  if (diffDays === 2) return '前天';
  if (diffDays < 7) return `${diffDays}天前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
  return dateString;
};
</script>

<style scoped>
.latest-music-section {
  margin-bottom: 3rem;
}

.section-header {
  text-align: left;
}

@media (max-width: 768px) {
  .hidden-sm {
    display: none;
  }
}
</style>