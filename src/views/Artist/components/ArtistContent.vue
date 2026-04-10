<script setup lang="ts">
import { Play } from 'lucide-vue-next';
import SongList from '@/components/common/SongList.vue';
import { computed, ref } from 'vue';
import ArtistTabs from './ArtistTabs.vue';

const activeTab = ref<'songs' | 'albums' | 'videos' | 'activities'>('songs');

interface ArtistSong {
  id: string;
  title: string;
  duration: string;
  playCount: string;
  publishTime: string;
  album: string;
  isPlaying: boolean;
}

const props = defineProps<{
  songs: ArtistSong[];
  artistName: string;
}>();

defineEmits<{
  'play-song': [song: ArtistSong];
}>();

// 转换数据格式，适配SongList组件
const adaptedSongs = computed(() => {
  return props.songs.map(song => ({
    id: song.id,
    title: song.title,
    artist: song.artist || '未知歌手', // 从父组件传入歌手信息
    album: song.album,
    duration: song.duration,
    cover: `https://picsum.photos/60/60?random=${song.id}`,
    isPlaying: song.isPlaying
  }));
});

const formatPlayCount = (count: string) => {
  if (count.includes('万')) {
    return count;
  }
  const num = parseInt(count);
  if (num >= 10000) {
    return (num / 10000).toFixed(0) + '万';
  }
  return count;
};

const handlePlaySong = (song: any) => {
  // 找到原始歌曲数据
  const originalSong = songs.find(s => s.id === song.id);
  if (originalSong) {
    emit('play-song', originalSong);
  }
};
</script>

<template>
  <div class="artist-songs">
    <!-- 自定义头部 -->
    <div class="songs-header flex items-center justify-between mb-6">
      <div>
        <h3 class="text-xl font-semibold">热门歌曲</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">共 {{ songs.length }} 首歌曲</p>
      </div>
            <ArtistTabs v-model:active-tab="activeTab" />

      <div class="text-right">
        <p class="text-sm text-gray-500 dark:text-gray-400">最高播放量</p>
        <p class="text-lg font-semibold text-red-500">
          {{ formatPlayCount(songs[0]?.playCount || '0') }}
        </p>
      </div>
    </div>

    <!-- 使用SongList组件 -->
    <SongList :songs="adaptedSongs" @play-song="handlePlaySong" />

    <!-- 额外信息 -->
    <div class="songs-footer mt-6 text-center">
      <p class="text-sm text-gray-500 dark:text-gray-400">
        最后更新: {{ new Date().toLocaleDateString() }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.artist-songs {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.songs-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 16px;
}

@media (max-width: 640px) {
  .artist-songs {
    padding: 16px;
  }
}
</style>