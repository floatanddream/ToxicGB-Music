<script lang="ts" setup>
import { Users, Loader2 } from 'lucide-vue-next';
import UserCard from '@/components/common/musicComponents/UserCard.vue';
import type { User } from '@/types/musicTypes';

const props = defineProps<{
    subscribers: User[] | undefined;
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
}>();

const emit = defineEmits<{
    'load-more': [];
}>();
</script>

<template>
  <div class="playlist-subscribers">
    <div class="subscribers-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <Loader2 class="w-8 h-8 animate-spin text-gray-500" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="!subscribers || subscribers.length === 0" class="empty-state">
        <div class="text-center py-12">
          <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Users class="w-12 h-12 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无收藏者</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">快来收藏这个歌单吧</p>
        </div>
      </div>

      <!-- 收藏者列表 -->
      <div v-else class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        <UserCard v-for="user in subscribers" :key="user.id" :user="user" />
      </div>

      <!-- 加载更多 -->
      <div v-if="hasMore" class="text-center mt-8">
        <button
          v-if="!loadingMore"
          @click="emit('load-more')"
          class="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          加载更多收藏者
        </button>
        <div v-else class="flex items-center justify-center gap-2">
          <Loader2 class="w-4 h-4 animate-spin text-gray-500" />
          <span class="text-sm text-gray-500">加载中...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-subscribers {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .playlist-subscribers {
    padding: 16px;
  }
}
</style>
