<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import PlaylistHeader from './components/PlaylistHeader.vue';
import SongList from '@/components/common/musicComponents/SongList.vue';
import type { Playlist } from '@/types/playlist';
import { getPlaylistDetail } from '@/api/playlist';
import { transformPlaylistDetail } from '@/utils/dataTransformer';
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';


const route = useRoute();
const playlistId = computed(() => route.query.id as string);
const playlistDetail = ref<Playlist>();

const isPlayingAll = ref(false);

const fetchPlaylistDetail = async () => {
  emitter.emit(EVENTS.SCROOL_TOP);
  const data = await getPlaylistDetail(playlistId.value);
  playlistDetail.value = transformPlaylistDetail(data.playlist);
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
  <div class="glass-container min-h-screen">
    <div class="max-w-7xl mx-auto px-4 md:px-6 py-8 relative z-10">
      <!-- 歌单头部信息 -->
      <PlaylistHeader v-if="playlistDetail" :playlist="playlistDetail" :is-playing-all="isPlayingAll"
        @toggle-like="toggleLike" />


      <!-- 歌曲列表 -->
      <SongList :songs="playlistDetail?.tracks || []" />
    </div>
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
</style>