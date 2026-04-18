<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import PlaylistHeader from './components/PlaylistHeader.vue';
import PlaylistContent from './components/PlaylistContent.vue';
import type { Song, User } from '@/types/musicTypes';
import type { Playlist } from '@/types/playlist';
import { getPlaylistComments, getPlaylistDetail, getPlaylistSubscribers } from '@/api/playlist';
import { transformCommentListResponse, transformPlaylistDetail, transformToUser } from '@/utils/dataTransformer';
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';
import { Loader2 } from 'lucide-vue-next';
import type { Comment } from '@/types/comment';


const route = useRoute();
const playlistId = computed(() => route.query.id as string);
const playlistDetail = ref<Playlist>();
import type { CommentListResponse } from '@/types/comment';

const playlistComments = ref<CommentListResponse>();
const playlistSubscribers = ref<User[]>();

const isPlayingAll = ref(false);
const loading = ref(false);

const commentsLoading = ref(false);
const commentsLoadingMore = ref(false);
const commentsOffset = ref(0);

const subscribersLoading = ref(false);
const subscribersLoadingMore = ref(false);
const subscribersOffset = ref(0);

const fetchPlaylistDetail = async () => {
  emitter.emit(EVENTS.SCROOL_TOP);
  loading.value = true;
  try {
    const data = await getPlaylistDetail(playlistId.value);
    playlistDetail.value = transformPlaylistDetail(data.playlist);
  } catch (error) {
    console.error('获取歌单数据失败:', error);
  } finally {
    loading.value = false;
  }
}

// 收藏歌单
const toggleLike = () => {
};

const handleTabChange = (newTab: string) => {
  if (newTab === 'comments') {
    fetchPlaylistComments();
  } else if (newTab === 'subscribers') {
    fetchPlaylistSubscribers();
  }
};

const fetchPlaylistComments = async () => {
  commentsLoading.value = true;
  commentsOffset.value = 0;
  try {
    const data = await getPlaylistComments({ id: playlistId.value, limit: 50, offset: 0 });
    playlistComments.value = transformCommentListResponse(data);
  } catch (error) {
    console.error('获取歌单评论数据失败:', error);
  } finally {
    commentsLoading.value = false;
  }
}

const loadMoreComments = async () => {
  if (!playlistComments.value?.more || commentsLoadingMore.value) return;

  commentsLoadingMore.value = true;
  commentsOffset.value += 20;

  try {
    const data = await getPlaylistComments({
      id: playlistId.value,
      limit: 20,
      offset: commentsOffset.value
    });

    const newComments = transformCommentListResponse(data);

    if (playlistComments.value) {
      playlistComments.value.comments = [
        ...playlistComments.value.comments,
        ...newComments.comments
      ];
      playlistComments.value.more = newComments.more;
      playlistComments.value.total = newComments.total;
    }
  } catch (error) {
    console.error('加载更多评论失败:', error);
  } finally {
    commentsLoadingMore.value = false;
  }
}
const fetchPlaylistSubscribers = async () => {
  subscribersLoading.value = true;
  subscribersOffset.value = 0;
  try {
    const data = await getPlaylistSubscribers({ id: playlistId.value, limit: 50, offset: 0 });
    playlistSubscribers.value = data.subscribers?.map(transformToUser);
  } catch (error) {
    console.error('获取歌单评论数据失败:', error);
  } finally {
    subscribersLoading.value = false;
  }
}


onMounted(() => {
  fetchPlaylistDetail();
})
</script>

<template>
  <div class="playlist-page glass-container min-h-screen">
    <div class="bg-decoration">
      <div class="bg-blur-circle bg-purple-500 top-1/4 left-1/4 w-96 h-96"></div>
      <div class="bg-blur-circle bg-pink-500 top-1/3 right-1/4 w-80 h-80"></div>
      <div class="bg-blur-circle bg-blue-500 bottom-1/4 left-1/3 w-72 h-72"></div>
    </div>

    <Transition name="fade-slide" mode="out-in">
      <div v-if="loading" key="loading" class="flex items-center justify-center h-screen">
        <Loader2 class="w-12 h-12 animate-spin text-gray-500" />
      </div>

      <div v-else :key="playlistId" class="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
        <!-- 歌单头部信息 -->
        <PlaylistHeader v-if="playlistDetail" :playlist="playlistDetail" :is-playing-all="isPlayingAll"
          @toggle-like="toggleLike" />
        <!-- 歌单内容区域 -->
        <PlaylistContent v-if="playlistDetail" @active-tab-change="handleTabChange" @load-more-comments="loadMoreComments"
          :songs="playlistDetail?.tracks || []" :comments-loading="commentsLoading" :comments-loading-more="commentsLoadingMore" :comments="playlistComments"
          :subscribers="playlistSubscribers" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 背景装饰 */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}

.bg-blur-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

/* 动画 */
@keyframes float {

  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -30px) scale(1.05);
  }

  66% {
    transform: translate(-30px, 30px) scale(0.95);
  }
}

/* 响应式 */
@media (max-width: 768px) {
  .playlist-container {
    padding: 1rem;
  }
}

/* 新增淡入淡出+滑动动画 */
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