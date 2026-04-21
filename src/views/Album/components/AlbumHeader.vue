<script setup lang="ts">
import { PlayIcon,  HeartIcon, ShareIcon, Calendar, Disc, MessageCircleHeart, UserStarIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/utils/format';
import DescriptionWithDialog from '@/components/common/musicComponents/DescriptionWithDialog.vue';
import type { Album } from '@/types/album';
import ArtistDivider from '@/components/common/musicComponents/artistDivider.vue';
import { formatTimestampToDate } from '@/utils/dataTransformer';

defineProps<{
  album: Album;
}>();

defineEmits<{
  'play-all': [];
  'toggle-like': [];
}>();
</script>

<template>
  <div class="album-header mb-8">
    <div class="flex flex-col md:flex-row gap-6 items-center md:items-start">
      <!-- 封面 -->
      <div class="cover-container">
        <img :src="album?.picUrl" :alt="album?.name" class="cover-image" />
        <div class="cover-overlay">

        </div>
      </div>

      <!-- 信息 -->
      <div class="flex-1 text-center md:text-left">
        <h1 class="text-3xl md:text-4xl font-bold mb-3">{{ album?.name }}</h1>
        <div
          class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3 justify-center md:justify-start">
          <UserStarIcon class="h-4 w-4" />
          <ArtistDivider v-if="album.artists" :artists="album?.artists" />
        </div>
        <DescriptionWithDialog v-if="album?.description" title="专辑简介" trigger-text="详细" :text="album?.description" />
        <div class="flex flex-wrap gap-4 justify-center md:justify-start mb-4">
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Disc class="h-4 w-4" />
            <span>{{ album?.size }} 首</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Calendar class="h-4 w-4" />
            <span>{{ formatTimestampToDate(album?.publishTime) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ShareIcon class="h-4 w-4" />
            <span>{{ formatNumber(album?.shareCount || 0) }} 次分享</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <MessageCircleHeart class="h-4 w-4" />
            <span>{{ formatNumber(album.commentCount || 0) }} 评论</span>
          </div>
        </div>

        <div class="flex gap-3 justify-center md:justify-start">
          <Button size="lg" class="bg-gradient-red-custom" @click="$emit('play-all')">
            <PlayIcon class="h-5 w-5 mr-2 font-text-primary" />
            <span class="font-text-primary">{{  '播放全部' }}</span>
          </Button>
          <Button variant="outline" size="lg" @click="$emit('toggle-like')">
            <HeartIcon class="h-5 w-5 mr-2" :class="{ 'fill-red-500 text-red-500': album?.isLiked }" />
            {{ album?.isLiked ? '已收藏' : '收藏' }}
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
.album-header {
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