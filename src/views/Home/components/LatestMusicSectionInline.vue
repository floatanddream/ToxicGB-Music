<template>
  <div class="latest-music-section" :style="{ paddingLeft: '1rem', paddingRight: '1rem' }">
    <div class="section-header" :style="{ marginBottom: '2rem' }">
      <h2 :style="{ fontSize: '2.25rem', lineHeight: '2.5rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: isDarkMode ? '#ffffff' : '#1f2937' }">最新音乐</h2>
      <p :style="{ color: isDarkMode ? '#d1d5db' : '#6b7280', marginTop: '0.5rem' }">抢先试听新歌</p>
    </div>

    <div class="music-list" :style="{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1.5rem' }">
      <div
        v-for="song in songs"
        :key="song.id"
        class="song-item"
        :style="songItemStyle"
        @mouseenter="handleSongItemHover($event, true)"
        @mouseleave="handleSongItemHover($event, false)"
      >
        <!-- 播放按钮 -->
        <button
          @click="togglePlay(song)"
          :style="playButtonStyle"
          @mouseenter="e => e.currentTarget.style.opacity = 1"
          @mouseleave="e => e.currentTarget.style.opacity = 0.8"
        >
          <PauseIcon v-if="song.isPlaying" :style="{ width: '1.25rem', height: '1.25rem', color: '#0ea5e9' }" />
          <PlayIcon v-else :style="{ width: '1.25rem', height: '1.25rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }" />
        </button>

        <!-- 歌曲信息 -->
        <div :style="{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }">
          <img
            :src="song.coverUrl"
            :alt="song.title"
            :style="coverStyle"
          />
          <div :style="{ minWidth: 0, flex: 1 }">
            <h3 :style="{ fontSize: '1rem', fontWeight: '600', color: isDarkMode ? '#ffffff' : '#1f2937', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">{{ song.title }}</h3>
            <div :style="{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }">
              <span :style="{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">{{ song.artist }}</span>
              <span>•</span>
              <span :style="{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }">{{ song.album }}</span>
            </div>
          </div>
        </div>

        <!-- 时长和日期 -->
        <div :style="{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }">
          <span :style="{ fontWeight: '500' }">{{ song.duration }}</span>
          <span :style="dateBadgeStyle" class="hidden sm:inline">{{ formatDate(song.releaseDate) }}</span>
        </div>

        <!-- 操作按钮 -->
        <div :style="{ display: 'flex', alignItems: 'center', gap: '0.25rem' }">
          <button
            @click="toggleLike(song)"
            :style="iconButtonStyle"
            @mouseenter="e => { e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6' }"
            @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
          >
            <HeartIcon
              :style="{
                width: '1rem',
                height: '1rem',
                color: song.isLiked ? '#ef4444' : (isDarkMode ? '#9ca3af' : '#6b7280')
              }"
              :class="{ 'fill-current': song.isLiked }"
            />
          </button>
          <button
            :style="iconButtonStyle"
            @mouseenter="e => { e.currentTarget.style.backgroundColor = isDarkMode ? '#4b5563' : '#f3f4f6' }"
            @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'"
          >
            <MoreHorizontalIcon :style="{ width: '1rem', height: '1rem', color: isDarkMode ? '#9ca3af' : '#6b7280' }" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon, PauseIcon, ClockIcon, HeartIcon, MoreHorizontalIcon } from 'lucide-vue-next';
import { ref, computed } from 'vue';

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

const isDarkMode = computed(() => document.documentElement.classList.contains('dark'));

// Computed styles
const songItemStyle = computed(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem',
  borderRadius: '0.75rem',
  backgroundColor: isDarkMode.value ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${isDarkMode.value ? 'rgba(55, 65, 81, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
  transition: 'all 0.2s ease',
  cursor: 'pointer'
}));

const playButtonStyle = computed(() => ({
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '9999px',
  border: 'none',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  opacity: 0.8
}));

const iconButtonStyle = computed(() => ({
  width: '2.25rem',
  height: '2.25rem',
  borderRadius: '9999px',
  border: 'none',
  background: 'transparent',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease'
}));

const coverStyle = computed(() => ({
  width: '3.5rem',
  height: '3.5rem',
  borderRadius: '0.5rem',
  objectFit: 'cover',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  flexShrink: 0
}));

const dateBadgeStyle = computed(() => ({
  padding: '0.25rem 0.5rem',
  borderRadius: '9999px',
  backgroundColor: isDarkMode.value ? '#374151' : '#f3f4f6',
  fontSize: '0.75rem'
}));

const togglePlay = (song: Song) => {
  song.isPlaying = !song.isPlaying;
};

const toggleLike = (song: Song) => {
  song.isLiked = !song.isLiked;
};

const handleSongItemHover = (event: MouseEvent, isHover: boolean) => {
  const target = event.currentTarget as HTMLElement;
  if (isHover) {
    target.style.backgroundColor = isDarkMode.value ? 'rgba(55, 65, 81, 0.5)' : 'rgba(243, 244, 246, 0.7)';
    target.style.transform = 'translateY(-1px)';
  } else {
    target.style.backgroundColor = isDarkMode.value ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.5)';
    target.style.transform = 'translateY(0)';
  }
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