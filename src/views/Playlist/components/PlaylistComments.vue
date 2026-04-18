<script setup lang="ts">
import type { Comment, CommentListResponse } from '@/types/comment';
import { Loader2 } from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{
  loading: boolean;
  comments: CommentListResponse | undefined;
}>();

// 合并热门评论和普通评论
const allComments = computed(() => {
  if (!props.comments) return [];

  const { hotComments = [], comments = [] } = props.comments;
  return [...hotComments, ...comments];
});

// 格式化时间的辅助函数
const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);

  if (hours < 1) {
    return '刚刚';
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days < 7) {
    return `${days}天前`;
  } else {
    return new Date(timestamp).toLocaleDateString();
  }
};
</script>

<template>
  <div class="playlist-comments">
    <div class="comments-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <Loader2 class="w-8 h-8 animate-spin text-gray-500" />
      </div>

      <!-- 评论列表 -->
      <div v-else class="space-y-6">
        <div
          v-for="comment in allComments"
          :key="comment.commentId"
          class="comment-item border-b border-gray-200/10 pb-6"
        >
          <div class="flex gap-4">
            <!-- 用户头像 -->
            <div class="flex-shrink-0">
              <img
                :src="comment.user.avatarUrl || '/api/placeholder/40/40'"
                :alt="comment.user.nickname"
                class="w-10 h-10 rounded-full object-cover"
              />
            </div>

            <!-- 评论内容 -->
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ comment.user.nickname }}
                </span>
                <span class="text-xs text-gray-500">
                  {{ comment.ipLocation?.location || formatTime(comment.time) }}
                </span>
                <span
                  v-if="comment.owner"
                  class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded"
                >
                  作者
                </span>
              </div>

              <div class="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                {{ comment.content }}
              </div>

              <div class="flex items-center gap-4 text-xs text-gray-500">
                <button
                  class="flex items-center gap-1 hover:text-red-500 transition-colors"
                >
                  <span class="w-4 h-4">👍</span>
                  {{ comment.likedCount }}
                </button>
                <button class="hover:text-red-500 transition-colors">回复</button>
              </div>

              <!-- 回复列表 -->
              <div
                v-if="comment.beReplied && comment.beReplied.length > 0"
                class="mt-4 space-y-3"
              >
                <div
                  v-for="replied in comment.beReplied"
                  :key="replied.beRepliedCommentId"
                  class="bg-gray-50/5 rounded-lg p-3"
                >
                  <div class="flex items-center gap-2 mb-1">
                    <span class="text-xs font-medium text-gray-900 dark:text-white">
                      {{ replied.user.nickname }}
                    </span>
                    <span class="text-xs text-gray-500">回复</span>
                    <span class="text-xs text-gray-900 dark:text-white">
                      {{ comment.user.nickname }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-700 dark:text-gray-300">
                    {{ replied.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div v-if="comments?.more" class="text-center mt-8">
        <button
          class="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          加载更多评论
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-comments {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comments-container {
  min-height: 400px;
}

@media (max-width: 640px) {
  .playlist-comments {
    padding: 16px;
  }
}
</style>
