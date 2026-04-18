<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import PlaylistHeader from './components/PlaylistHeader.vue';
import PlaylistContent from './components/PlaylistContent.vue';
import type { Song } from '@/types/musicTypes';
import type { Playlist } from '@/types/playlist';
import { getPlaylistDetail } from '@/api/playlist';
import { transformPlaylistDetail } from '@/utils/dataTransformer';
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';
import { Loader2 } from 'lucide-vue-next';


const route = useRoute();
const playlistId = computed(() => route.query.id as string);
const playlistDetail = ref<Playlist>();

const isPlayingAll = ref(false);
const loading = ref(false);

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
  // playlist.value.isLiked = !playlist.value.isLiked;
};

onMounted(() => {
  fetchPlaylistDetail();
})

// 监听路由变化
// watch(playlistId, (newId) => {
//   console.log('Playlist ID changed:', newId);
//   // 这里可以加载对应ID的歌单数据
// });
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
        <PlaylistContent v-if="playlistDetail" :songs="playlistDetail?.tracks || []" />
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