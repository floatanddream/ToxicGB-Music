<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import AlbumHeader from './components/AlbumHeader.vue';
import AlbumContent from './components/AlbumContent.vue';
import type { Song } from '@/types/musicTypes';
import { getAlbumDetail, getAlbumComments } from '@/api/album';
import { transformAlbumDetail } from '@/utils/dataTransformer';
import { Loader2 } from 'lucide-vue-next';
import { EVENTS } from '@/constants/events';
import emitter from '@/utils/eventBus';
import type { Album } from '@/types/album';
import type { CommentListResponse } from '@/types/comment';
import { transformCommentListResponse } from '@/utils/dataTransformer';
import { toast } from 'vue-sonner';
import { MESSAGE_TYPE } from '@/constants/messages';

const route = useRoute();
const albumId = computed(() => route.query.id as string);

const albumDetail = ref<Album>();
const songs = ref<Song[]>([]);
const albumComments = ref<CommentListResponse>();

const loading = ref(false);

const commentsLoading = ref(false);
const commentsLoadingMore = ref(false);
const commentsOffset = ref(0);

// 请求竞态保护：currentAlbumId 记录当前专辑；activeController 取消旧请求
const currentAlbumId = ref('');
let activeController: AbortController | null = null;

const fetchAlbumDetail = async () => {
  const id = albumId.value;
  if (!id) return;
  currentAlbumId.value = id;

  // 取消旧请求
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;

  emitter.emit(EVENTS.SCROOL_TOP);
  loading.value = true;
  try {
    const albumRes = await getAlbumDetail(id, controller.signal);
    // await 后校验：当前响应是否还属于 currentAlbumId
    if (currentAlbumId.value !== id || controller.signal.aborted) return;
    albumDetail.value = transformAlbumDetail(albumRes);
    //处理网易云专辑的歌曲没有url问题
    albumDetail.value.songs?.map((item) => {
      if (item.cover?.startsWith('undefined')) {
        item.cover = albumDetail.value?.picUrl;
      }
    });
    songs.value = albumDetail.value.songs || [];
  } catch (error) {
    if (controller.signal.aborted) return;
    console.error('获取专辑数据失败:', error);
  } finally {
    if (currentAlbumId.value === id) loading.value = false;
  }
};

const fetchAlbumComments = async () => {
  const id = albumId.value;
  if (!id) return;

  // 取消旧请求
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;

  commentsLoading.value = true;
  commentsOffset.value = 0;
  try {
    const data = await getAlbumComments({
      id,
      limit: 50,
      offset: 0,
      signal: controller.signal,
    });
    // 校验：评论是否还属于当前专辑
    if (currentAlbumId.value !== id || controller.signal.aborted) return;
    albumComments.value = transformCommentListResponse(data);
  } catch (error) {
    if (controller.signal.aborted) return;
    console.error('获取专辑评论数据失败:', error);
  } finally {
    if (currentAlbumId.value === id) commentsLoading.value = false;
  }
};

const loadMoreComments = async () => {
  if (!albumComments.value?.more || commentsLoadingMore.value) return;

  const id = albumId.value;
  if (!id) return;

  // 取消旧请求
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;

  commentsLoadingMore.value = true;
  commentsOffset.value += 20;

  try {
    const data = await getAlbumComments({
      id,
      limit: 20,
      offset: commentsOffset.value,
      signal: controller.signal,
    });

    // 校验：评论是否还属于当前专辑
    if (currentAlbumId.value !== id || controller.signal.aborted) return;

    const newComments = transformCommentListResponse(data);

    if (albumComments.value) {
      albumComments.value.comments = [
        ...albumComments.value.comments,
        ...newComments.comments
      ];
      albumComments.value.more = newComments.more;
      albumComments.value.total = newComments.total;
    }
  } catch (error) {
    if (controller.signal.aborted) return;
    // 失败时回滚 offset，避免下次跳过这页评论
    commentsOffset.value -= 20;
    console.error('加载更多评论失败:', error);
  } finally {
    if (currentAlbumId.value === id) commentsLoadingMore.value = false;
  }
};

const handleTabChange = (newTab: string) => {
  if (newTab === 'comments') {
    fetchAlbumComments();
  }
};

// 播放全部
const playAllSongs = () => {
  if (songs.value.length > 0) {
    emitter.emit(EVENTS.PLAY_ALL,songs.value);
    emitter.emit(MESSAGE_TYPE.TOAST_INFO,`播放专辑"${albumDetail.value?.name}"所有歌曲`);
  }
};

// 收藏专辑（本地状态切换；后端 API 待接入）
const toggleLike = () => {
  if (!albumDetail.value) return
  const next = !albumDetail.value.isLiked
  albumDetail.value = { ...albumDetail.value, isLiked: next }
  emitter.emit(MESSAGE_TYPE.TOAST_SUSSESS, next ? '已收藏专辑' : '已取消收藏')
};

watch(() => route.query.id, () => {
  fetchAlbumDetail();
});

onMounted(() => {
  fetchAlbumDetail();
});

onUnmounted(() => {
  activeController?.abort();
});
</script>

<template>
  <div class="album-page glass-container min-h-screen">
    <Transition name="fade-slide" mode="out-in">
      <div v-if="loading" key="loading" class="flex items-center justify-center h-screen">
        <Loader2 class="w-12 h-12 animate-spin text-gray-500" />
      </div>

      <div v-else :key="albumId" class="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
        <!-- 专辑头部信息 -->
        <AlbumHeader v-if="albumDetail" :album="albumDetail"  @play-all="playAllSongs"
          @toggle-like="toggleLike" />

        <!-- 专辑内容区域 -->
        <AlbumContent v-if="albumDetail" @active-tab-change="handleTabChange" @load-more-comments="loadMoreComments"
          :songs="songs" :comments-loading="commentsLoading" :comments-loading-more="commentsLoadingMore" :comments="albumComments" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.album-page {
  position: relative;
}


.bg-blur-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

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

/* 响应式 */
@media (max-width: 768px) {
  .album-container {
    padding: 1rem;
  }
}
</style>
