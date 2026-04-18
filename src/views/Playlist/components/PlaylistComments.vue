<script setup lang="ts">
import type { CommentListResponse } from '@/types/comment';
import CommentList from '@/components/common/pageComponents/CommentList.vue';

const props = defineProps<{
  loading: boolean;
  loadingMore: boolean;
  comments: CommentListResponse | undefined;
}>();

const emit = defineEmits<{
  'load-more': [];
}>();
</script>

<template>
  <CommentList
    :loading="loading"
    :loading-more="loadingMore"
    :comments="comments"
    @load-more="emit('load-more')"
  />
</template>
