<script setup lang="ts">
import type { Comment, CommentListResponse } from '@/types/comment';
import { Loader2, MessageSquare } from 'lucide-vue-next';
import { computed } from 'vue';
import CommentItem from './CommentItem.vue';
import { transformToUser } from '@/utils/dataTransformer';

const props = defineProps<{
  loading: boolean;
  loadingMore: boolean;
  comments: CommentListResponse | undefined;
}>();

const emit = defineEmits<{
  'load-more': [];
}>();

// 合并热门评论和普通评论
const allComments = computed<Comment[]>(() => {
  console.log(props.comments)
  if (!props.comments) return [];

  const { hotComments = [], comments = [] } = props.comments;
  const TempComments = [...hotComments, ...comments];
  
  // 转换 user 数据
  return TempComments.map(comment => ({
    ...comment,
    user: transformToUser(comment.user as any)
  }));
});
</script>

<template>
  <div class="comment-list-container">
    <div class="comments-container">
      <!-- 加载状态 -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <Loader2 class="w-8 h-8 animate-spin text-gray-500" />
      </div>

      <!-- 空状态 -->
      <div v-else-if="allComments.length === 0" class="empty-state">
        <div class="text-center py-12">
          <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <MessageSquare class="w-12 h-12 text-gray-400" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无评论</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">快来发表第一条评论吧</p>
        </div>
      </div>

      <!-- 评论列表 -->
      <div v-else class="space-y-6">
        <CommentItem
          v-for="comment in allComments"
          :key="comment.commentId"
          :comment="comment"
        />
      </div>

      <!-- 加载更多 -->
      <div v-if="comments?.more" class="text-center mt-8">
        <button
          v-if="!loadingMore"
          @click="emit('load-more')"
          class="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          加载更多评论
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
.comment-list-container {
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
  .comment-list-container {
    padding: 16px;
  }
}
</style>
