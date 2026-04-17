<script setup lang="ts">
import { Play } from 'lucide-vue-next';
import SongList from '@/components/common/musicComponents/SongList.vue';
import { computed, ref } from 'vue';
import ArtistTabs from './ArtistTabs.vue';
import type { Song } from '@/types/musicTypes';
const activeTab = ref<'songs' | 'albums' | 'videos' | 'activities'>('songs');

const props = defineProps<{
  songs: Song[];
}>();
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
          123
        </p>
      </div>
    </div>

    <!-- 使用SongList组件 -->
    <SongList :songs="props.songs" />

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