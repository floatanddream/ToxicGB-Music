<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ArtistHeader from './components/ArtistHeader.vue';
import ArtistContent from './components/ArtistContent.vue';
import type { ArtistData } from '@/types/artist';
import type { Song } from '@/types/musicTypes';
import { getArtistTop50,getArtistDetail } from '@/api/artistPage';
import { transformToSong } from '@/utils/dataTransformer';
import { Loader2 } from 'lucide-vue-next';

const route = useRoute();
const artistId = computed(() => route.query.id as string);

const artistData = ref<ArtistData>();
const Songs = ref<Song[]>([]);
const loading = ref(false);

const fetchArtistData = async () => {
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
  artist.value.isSubscribed = !artist.value.isSubscribed;
  console.log('关注状态:', artist.value.isSubscribed);
};

onMounted(() => {
  console.log('歌手ID:', artistId.value);
  fetchArtistData();
  
});
</script>

<template>
  <div class="artist-page glass-container min-h-screen">
    <div v-if="loading" class="flex items-center justify-center h-screen">
      <Loader2 class="w-12 h-12 animate-spin text-gray-500" />
    </div>

    <template v-else>
      <ArtistHeader :artist="artistData" @subscribe="handleSubscribe" @play-all="playAllSongs" />
      <div class="artist-content max-w-7xl mx-auto px-4 md:px-6 pb-8">
        <ArtistContent :songs="Songs"/>
      </div>
    </template>
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
</style>