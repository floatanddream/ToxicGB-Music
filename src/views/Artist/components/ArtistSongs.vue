<script lang="ts" setup>
import SongList from '@/components/common/musicComponents/SongList.vue';
import type { Song } from '@/types/musicTypes';
const props = defineProps<{
  songs: Song[];
}>();

</script>

<template>
     <!-- 自定义头部 -->
        <div class="content-header flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-semibold">热门歌曲</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">共 {{ props?.songs.length }} 首歌曲</p>
          </div>

          <div class="text-right">
            <p class="text-sm text-gray-500 dark:text-gray-400">最高播放量</p>
            <p class="text-lg font-semibold text-red-500">
              123
            </p>
          </div>
        </div>
        <!-- 使用SongList组件 -->
        <SongList :songs="props?.songs" />
</template>

<style scoped>
.content-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 16px;
}
</style>