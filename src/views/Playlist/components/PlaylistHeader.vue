<script setup lang="ts">
import { PlayIcon, PauseIcon, HeartIcon, ShareIcon,User2Icon,Music } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import type  { Playlist } from '@/types/playlist';
import { formatNumber } from '@/utils/format';
import DescriptionWithDialog from '@/components/common/musicComponents/DescriptionWithDialog.vue';

defineProps<{
  playlist: Playlist;
  isPlayingAll: boolean;
}>();

defineEmits<{
  'play-all': [];
  'toggle-like': [];
}>();
</script>

<template>
  <div class="playlist-header mb-8">
    <div class="flex flex-col md:flex-row gap-6 items-center md:items-start">
      <!-- 封面 -->
      <div class="cover-container">
        <img :src="playlist?.coverImgUrl" :alt="playlist?.name" class="cover-image" />
        <div class="cover-overlay">
          <Button variant="secondary" size="icon" class="play-cover-btn" @click="$emit('play-all')">
            <PlayIcon v-if="!isPlayingAll" class="h-8 w-8" />
            <PauseIcon v-else class="h-8 w-8" />
          </Button>
        </div>
      </div>

      <!-- 信息 -->
      <div class="flex-1 text-center md:text-left">
        <h1 class="text-3xl md:text-4xl font-bold mb-3">{{ playlist?.name }}</h1>
        <DescriptionWithDialog title="歌单简介" trigger-text="详细" :text="playlist?.description" />
        <div class="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <User2Icon class="h-4 w-4" />
            <span>{{ playlist?.creator?.nickname }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Music class="h-4 w-4" />
            <span>{{ playlist?.trackCount }} 首</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <PlayIcon class="h-4 w-4" />
            <span>{{ formatNumber(playlist?.playCount) }} 次播放</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <HeartIcon class="h-4 w-4" />
            <span>{{ formatNumber(playlist?.subscribedCount) }} 收藏</span>
          </div>
        </div>

        <div class="flex gap-3 justify-center md:justify-start">
          <Button size="lg" class="bg-gradient-red-custom" @click="$emit('play-all')">
            <PlayIcon  v-if="!isPlayingAll" class="h-5 w-5 mr-2 font-text-primary" />
            <PauseIcon v-else class="h-5 w-5 mr-2 font-text-primary" />
            <span class="font-text-primary">{{ isPlayingAll ? '暂停播放' : '播放全部' }}</span>
          </Button>
          <Button variant="outline" size="lg" @click="$emit('toggle-like')">
            <HeartIcon class="h-5 w-5 mr-2" :class="{ 'fill-red-500 text-red-500': playlist?.subscribed }" />
            {{ playlist?.subscribed ? '已收藏' : '收藏' }}
          </Button>
          <Button variant="outline" size="lg">
            <ShareIcon class="h-5 w-5 mr-2" />
            分享
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-header {
  position: relative;
  z-index: 1;
}

.cover-container {
  position: relative;
  width: 250px;
  height: 250px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.cover-container:hover .cover-overlay {
  opacity: 1;
}

.play-cover-btn {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #0ea5e9;
}
@media (max-width: 768px) {
  .cover-container {
    width: 200px;
    height: 200px;
  }
}
</style>