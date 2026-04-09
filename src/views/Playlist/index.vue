<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserIcon, MusicIcon, PlayIcon, HeartIcon, ShuffleIcon } from 'lucide-vue-next';
import PlaylistHeader from './components/PlaylistHeader.vue';
import SongList from '@/components/common/SongList.vue';

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  isPlaying: boolean;
}

interface Playlist {
  id: string;
  title: string;
  cover: string;
  creator: string;
  description: string;
  songCount: string;
  playCount: string;
  likeCount: string;
  isLiked: boolean;
  createTime: string;
  updateTime: string;
}

const route = useRoute();
const playlistId = computed(() => route.query.id as string);

// 模拟歌单数据
const mockPlaylist: Playlist = {
  id: '1',
  title: '今日热门',
  cover: 'https://picsum.photos/300/300?random=1',
  creator: '系统推荐',
  description: '今日最热门的歌曲集合，包含各种风格的流行歌曲',
  songCount: '32',
  playCount: '12.3万',
  likeCount: '892',
  isLiked: false,
  createTime: '2024-01-01',
  updateTime: '2小时前'
};

// 模拟歌曲数据
const mockSongs: Song[] = [
  { id: '7', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction', duration: '5:56', cover: 'https://picsum.photos/60/60?random=7', isPlaying: false },
  { id: '8', title: 'Imagine', artist: 'John Lennon', album: 'Imagine', duration: '3:07', cover: 'https://picsum.photos/60/60?random=8', isPlaying: false },
  { id: '1', title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack', duration: '5:26', cover: 'https://picsum.photos/60/60?random=1', isPlaying: false },
  { id: '2', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: '5:55', cover: 'https://picsum.photos/60/60?random=2', isPlaying: false },
  { id: '3', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷', duration: '3:53', cover: 'https://picsum.photos/60/60?random=3', isPlaying: false },
  { id: '4', title: 'Rolling in the Deep', artist: 'Adele', album: '21', duration: '3:48', cover: 'https://picsum.photos/60/60?random=4', isPlaying: false },
  { id: '5', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', duration: '4:54', cover: 'https://picsum.photos/60/60?random=5', isPlaying: false },
  { id: '6', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: '6:30', cover: 'https://picsum.photos/60/60?random=6', isPlaying: false },
  { id: '7', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction', duration: '5:56', cover: 'https://picsum.photos/60/60?random=7', isPlaying: false },
  { id: '8', title: 'Imagine', artist: 'John Lennon', album: 'Imagine', duration: '3:07', cover: 'https://picsum.photos/60/60?random=8', isPlaying: false },
  { id: '1', title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack', duration: '5:26', cover: 'https://picsum.photos/60/60?random=1', isPlaying: false },
  { id: '2', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: '5:55', cover: 'https://picsum.photos/60/60?random=2', isPlaying: false },
  { id: '3', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷', duration: '3:53', cover: 'https://picsum.photos/60/60?random=3', isPlaying: false },
  { id: '4', title: 'Rolling in the Deep', artist: 'Adele', album: '21', duration: '3:48', cover: 'https://picsum.photos/60/60?random=4', isPlaying: false },
  { id: '5', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', duration: '4:54', cover: 'https://picsum.photos/60/60?random=5', isPlaying: false },
  { id: '6', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: '6:30', cover: 'https://picsum.photos/60/60?random=6', isPlaying: false },
  { id: '7', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction', duration: '5:56', cover: 'https://picsum.photos/60/60?random=7', isPlaying: false },
  { id: '8', title: 'Imagine', artist: 'John Lennon', album: 'Imagine', duration: '3:07', cover: 'https://picsum.photos/60/60?random=8', isPlaying: false },
  { id: '1', title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack', duration: '5:26', cover: 'https://picsum.photos/60/60?random=1', isPlaying: false },
  { id: '2', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: '5:55', cover: 'https://picsum.photos/60/60?random=2', isPlaying: false },
  { id: '3', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷', duration: '3:53', cover: 'https://picsum.photos/60/60?random=3', isPlaying: false },
  { id: '4', title: 'Rolling in the Deep', artist: 'Adele', album: '21', duration: '3:48', cover: 'https://picsum.photos/60/60?random=4', isPlaying: false },
  { id: '5', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', duration: '4:54', cover: 'https://picsum.photos/60/60?random=5', isPlaying: false },
  { id: '6', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: '6:30', cover: 'https://picsum.photos/60/60?random=6', isPlaying: false },
  { id: '7', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction', duration: '5:56', cover: 'https://picsum.photos/60/60?random=7', isPlaying: false },
  { id: '8', title: 'Imagine', artist: 'John Lennon', album: 'Imagine', duration: '3:07', cover: 'https://picsum.photos/60/60?random=8', isPlaying: false },
  { id: '1', title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack', duration: '5:26', cover: 'https://picsum.photos/60/60?random=1', isPlaying: false },
  { id: '2', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: '5:55', cover: 'https://picsum.photos/60/60?random=2', isPlaying: false },
  { id: '3', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷', duration: '3:53', cover: 'https://picsum.photos/60/60?random=3', isPlaying: false },
  { id: '4', title: 'Rolling in the Deep', artist: 'Adele', album: '21', duration: '3:48', cover: 'https://picsum.photos/60/60?random=4', isPlaying: false },
  { id: '5', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', duration: '4:54', cover: 'https://picsum.photos/60/60?random=5', isPlaying: false },
  { id: '6', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: '6:30', cover: 'https://picsum.photos/60/60?random=6', isPlaying: false },
  { id: '7', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction', duration: '5:56', cover: 'https://picsum.photos/60/60?random=7', isPlaying: false },
  { id: '8', title: 'Imagine', artist: 'John Lennon', album: 'Imagine', duration: '3:07', cover: 'https://picsum.photos/60/60?random=8', isPlaying: false },
  { id: '1', title: 'Lose Yourself', artist: 'Eminem', album: '8 Mile Soundtrack', duration: '5:26', cover: 'https://picsum.photos/60/60?random=1', isPlaying: false },
  { id: '2', title: 'Bohemian Rhapsody', artist: 'Queen', album: 'A Night at the Opera', duration: '5:55', cover: 'https://picsum.photos/60/60?random=2', isPlaying: false },
  { id: '3', title: 'Shape of You', artist: 'Ed Sheeran', album: '÷', duration: '3:53', cover: 'https://picsum.photos/60/60?random=3', isPlaying: false },
  { id: '4', title: 'Rolling in the Deep', artist: 'Adele', album: '21', duration: '3:48', cover: 'https://picsum.photos/60/60?random=4', isPlaying: false },
  { id: '5', title: 'Billie Jean', artist: 'Michael Jackson', album: 'Thriller', duration: '4:54', cover: 'https://picsum.photos/60/60?random=5', isPlaying: false },
  { id: '6', title: 'Hotel California', artist: 'Eagles', album: 'Hotel California', duration: '6:30', cover: 'https://picsum.photos/60/60?random=6', isPlaying: false },
  { id: '7', title: 'Sweet Child O\' Mine', artist: 'Guns N\' Roses', album: 'Appetite for Destruction', duration: '5:56', cover: 'https://picsum.photos/60/60?random=7', isPlaying: false },
  { id: '8', title: 'Imagine', artist: 'John Lennon', album: 'Imagine', duration: '3:07', cover: 'https://picsum.photos/60/60?random=8', isPlaying: false },
];

const playlist = ref<Playlist>(mockPlaylist);
const songs = ref<Song[]>(mockSongs);
const isPlayingAll = ref(false);
const currentSongIndex = ref(0);

// 播放全部
const playAll = () => {
  isPlayingAll.value = !isPlayingAll.value;
  if (isPlayingAll.value) {
    songs.value.forEach((song, index) => {
      song.isPlaying = index === currentSongIndex.value;
    });
  } else {
    songs.value.forEach(song => song.isPlaying = false);
  }
};

// 播放单首歌曲
const playSong = (song: Song) => {
  const index = songs.value.findIndex(s => s.id === song.id);
  if (index !== -1) {
    songs.value.forEach((s, i) => {
      s.isPlaying = i === index;
    });
    currentSongIndex.value = index;
    isPlayingAll.value = true;
  }
};

// 收藏歌单
const toggleLike = () => {
  playlist.value.isLiked = !playlist.value.isLiked;
};

// 格式化播放次数
const formatPlayCount = (count: string) => {
  if (parseInt(count) >= 10000) {
    return (parseInt(count) / 10000).toFixed(1) + '万';
  }
  return count;
};

// 监听路由变化
watch(playlistId, (newId) => {
  console.log('Playlist ID changed:', newId);
  // 这里可以加载对应ID的歌单数据
});
</script>

<template>
  <div class="glass-container min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
      <!-- 歌单头部信息 -->
      <PlaylistHeader :playlist="playlist" :is-playing-all="isPlayingAll" @play-all="playAll"
        @toggle-like="toggleLike" />

      <!-- 歌曲列表 -->
      <SongList :songs="songs" @play-song="playSong" />
    </div>
  </div>
</template>

<style scoped>
/* 背景装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.bg-blur-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

/* 动画 */
@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -30px) scale(1.05);
  }

  66% {
    transform: translate(-30px, 30px) scale(0.95);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .playlist-container {
    padding: 1rem;
  }
}
</style>