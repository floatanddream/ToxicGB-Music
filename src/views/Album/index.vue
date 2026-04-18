<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
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

const route = useRoute();
const albumId = computed(() => route.query.id as string);

const albumDetail = ref<Album>();
const songs = ref<Song[]>([]);
const albumComments = ref<CommentListResponse>();

const loading = ref(false);
const isPlayingAll = ref(false);

const commentsLoading = ref(false);
const commentsLoadingMore = ref(false);
const commentsOffset = ref(0);

const fetchAlbumDetail = async () => {
  emitter.emit(EVENTS.SCROOL_TOP);
  loading.value = true;
  try {
    const albumRes = await getAlbumDetail(albumId.value);
    albumDetail.value = transformAlbumDetail(albumRes);
    //处理网易云专辑的歌曲没有url问题
    albumDetail.value.songs?.map((item) => {
      if (item.cover?.startsWith('undefined')) {
        item.cover = albumDetail.value?.picUrl;
      }
    });
    songs.value = albumDetail.value.songs || [];
  } catch (error) {
    console.error('获取专辑数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const fetchAlbumComments = async () => {
  commentsLoading.value = true;
  commentsOffset.value = 0;
  try {
    const data = await getAlbumComments({ id: albumId.value, limit: 50, offset: 0 });
    albumComments.value = transformCommentListResponse(data);
  } catch (error) {
    console.error('获取专辑评论数据失败:', error);
  } finally {
    commentsLoading.value = false;
  }
};

const loadMoreComments = async () => {
  if (!albumComments.value?.more || commentsLoadingMore.value) return;

  commentsLoadingMore.value = true;
  commentsOffset.value += 20;

  try {
    const data = await getAlbumComments({
      id: albumId.value,
      limit: 20,
      offset: commentsOffset.value
    });

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
    console.error('加载更多评论失败:', error);
  } finally {
    commentsLoadingMore.value = false;
  }
};

const handleTabChange = (newTab: string) => {
  if (newTab === 'comments') {
    fetchAlbumComments();
  }
};

// 播放全部
const playAllSongs = () => {
  isPlayingAll.value = !isPlayingAll.value;
  if (songs.value.length > 0) {
    console.log('播放专辑全部歌曲:', songs.value);
  }
};

// 收藏专辑
const toggleLike = () => {
  // if (albumDetail.value) {
  //   albumDetail.value.isLiked = !albumDetail.value.isLiked;
  //   console.log('收藏状态:', albumDetail.value.isLiked);
  // }
};

watch(() => route.query.id, () => {
  fetchAlbumDetail();
});

onMounted(() => {
  fetchAlbumDetail();
});
</script>

<template>
  <div class="album-page glass-container min-h-screen">
    <div class="bg-decoration">
      <div class="bg-blur-circle bg-purple-500 top-1/4 left-1/4 w-96 h-96"></div>
      <div class="bg-blur-circle bg-pink-500 top-1/3 right-1/4 w-80 h-80"></div>
      <div class="bg-blur-circle bg-blue-500 bottom-1/4 left-1/3 w-72 h-72"></div>
    </div>

    <Transition name="fade-slide" mode="out-in">
      <div v-if="loading" key="loading" class="flex items-center justify-center h-screen">
        <Loader2 class="w-12 h-12 animate-spin text-gray-500" />
      </div>

      <div v-else :key="albumId" class="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
        <!-- 专辑头部信息 -->
        <AlbumHeader v-if="albumDetail" :album="albumDetail" :is-playing-all="isPlayingAll" @play-all="playAllSongs"
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
  overflow: hidden;
}

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
