<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import ArtistHeader from './components/ArtistHeader.vue';
import ArtistContent from './components/ArtistContent.vue';
import type { ArtistData } from '@/types/artist';
import type { Song } from '@/types/musicTypes';
import { getArtistTop50,getArtistDetail } from '@/api/artistPage';
import { transformToSong } from '@/utils/dataTransformer';
import { Loader2 } from 'lucide-vue-next';
import { EVENTS } from '@/constants/events';
import emitter from '@/utils/eventBus'

const route = useRoute();
const artistId = computed(() => route.query.id as string);

const artistData = ref<ArtistData>();
const Songs = ref<Song[]>([]);
const loading = ref(false);

const fetchArtistData = async () => { 
  emitter.emit(EVENTS.SCROOL_TOP);
  loading.value = true;
  try {
    const artistRes = await getArtistDetail(artistId.value);
    const songRes = await getArtistTop50(artistId.value);
    artistData.value = artistRes.data as ArtistData;
    Songs.value = songRes.songs.map(transformToSong);
  } catch (error) {
    console.error('获取歌手数据失败:', error);
  } finally {
    loading.value = false;
  }
}

// 播放歌曲
const playSong = () => {
  console.log('播放全部歌曲:', Songs);
};

// 播放全部
const playAllSongs = () => {
  if (Songs.value.length > 0) {
    playSong();
  }
};

// 关注歌手
const handleSubscribe = () => {
  // artist.value.isSubscribed = !artist.value.isSubscribed;
  // console.log('关注状态:', artist.value.isSubscribed);
};

//歌手切换时自动更新歌手
watch(()=> route.query.id,()=>{
  fetchArtistData();
});

onMounted(() => {
  fetchArtistData();
});
</script>

<template>
  <div class="artist-page glass-container min-h-screen">
    <Transition name="fade-slide" mode="out-in">
      <div v-if="loading" key="loading" class="flex items-center justify-center h-screen">
        <Loader2 class="w-12 h-12 animate-spin text-gray-500" />
      </div>

      <div v-else :key="artistId">
        <ArtistHeader v-if="artistData" :artist="artistData" @subscribe="handleSubscribe" @play-all="playAllSongs" />
        <div class="artist-content max-w-7xl mx-auto px-4 md:px-6 pb-8">
          <ArtistContent v-if="Songs" :songs="Songs"/>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.artist-page {
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
</style>