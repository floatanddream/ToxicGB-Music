<script setup lang="ts">
import { ref, watch } from 'vue';
import AlbumSongs from './AlbumSongs.vue';
import AlbumComments from './AlbumComments.vue';
import AlbumTabs from './AlbumTabs.vue';
import type { Song } from '@/types/musicTypes';
import type { CommentListResponse } from '@/types/comment';

const activeTab = ref<'songs' | 'comments'>('songs');

const emit = defineEmits(['activeTabChange', 'load-more-comments']);

watch(activeTab, (newTab: string) => {
  emit('activeTabChange', newTab);
});

const handleLoadMore = () => {
  emit('load-more-comments');
};

const props = defineProps<{
  songs: Song[];
  commentsLoading: boolean;
  commentsLoadingMore: boolean;
  comments: CommentListResponse | undefined;
}>();
</script>

<template>
  <div class="album-content-container">
    <!-- 标签页切换 -->
    <AlbumTabs v-model="activeTab" />

    <!-- 标签页内容 -->
    <Transition name="fade-slide" mode="out-in">
      <!-- 歌曲标签页 -->
      <AlbumSongs v-if="activeTab === 'songs'" key="songs" :songs="songs" />

      <!-- 评论标签页 -->
      <AlbumComments
        v-else-if="activeTab === 'comments'"
        key="comments"
        :loading="commentsLoading"
        :loading-more="commentsLoadingMore"
        :comments="comments"
        @load-more="handleLoadMore"
      />
    </Transition>
  </div>
</template>

<style scoped>
.album-content-container {
  padding-top: 20px;
}

/* 淡入淡出+滑动动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
