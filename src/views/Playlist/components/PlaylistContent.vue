<script setup lang="ts">
import { ref, watch } from 'vue';
import PlaylistTabs from './PlaylistTabs.vue';
import PlaylistSongs from './PlaylistSongs.vue';
import PlaylistComments from './PlaylistComments.vue';
import PlaylistSubscribers from './PlaylistSubscribers.vue';
import type { Song } from '@/types/musicTypes';

const activeTab = ref<'songs' | 'comments' | 'subscribers'>('songs');

// 当activeTab为comments，向父组件传递事件
const emit = defineEmits(['activeTabChange']);
watch(activeTab, (newTab:string) => {
  emit('activeTabChange', newTab);
});

const props = defineProps<{
  songs: Song[];
}>();
</script>

<template>
  <div class="playlist-content-container">
    <!-- 标签页切换 -->
    <PlaylistTabs v-model="activeTab" />

    <!-- 标签页内容 -->
    <Transition name="fade-slide" mode="out-in">
      <!-- 歌曲标签页 -->
      <PlaylistSongs v-if="activeTab === 'songs'" key="songs" :songs="songs" />

      <!-- 评论标签页 -->
      <PlaylistComments v-else-if="activeTab === 'comments'" key="comments" />

      <!-- 收藏者标签页 -->
      <PlaylistSubscribers v-else-if="activeTab === 'subscribers'" key="subscribers" />

      <!-- 动态标签页 -->
      <div v-else-if="activeTab === 'activities'" key="activities" class="playlist-content">
        <div class="text-center py-12 text-gray-500">
          <p>歌单动态</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.playlist-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .playlist-content {
    padding: 16px;
  }
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
