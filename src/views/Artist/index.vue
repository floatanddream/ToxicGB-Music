<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import ArtistHeader from './components/ArtistHeader.vue';
import ArtistContent from './components/ArtistContent.vue';
import type { ArtistData } from '@/types/artist';
import type { Song } from '@/types/musicTypes';
import { getArtistTop50,getArtistDetail } from '@/api/artistPage';
import { transformToSong } from '@/utils/dataTransformer';

const route = useRoute();
const artistId = computed(() => route.query.id as string);

const artistData = ref<ArtistData>();
const Songs = ref<Song[]>([]);

const fetchArtistData = async () => {
  const artistRes = await getArtistDetail(artistId.value);
  const songRes = await getArtistTop50(artistId.value);
  artistData.value = artistRes.data as ArtistData;
  Songs.value = songRes.songs.map(transformToSong);
}




// 模拟歌手数据
const mockArtist: Artist = {
  id: '1',
  name: '周杰伦',
  cover: 'https://picsum.photos/200/200?random=artist1',
  backgroundImage: 'https://picsum.photos/1920/300?random=bg1',
  fanCount: '12580000',
  songCount: '156',
  albumCount: '15',
  isSubscribed: false,
  description: '华语流行乐坛最具影响力的创作歌手之一，以其独特的音乐风格和才华横溢的创作能力闻名于世。',
  verified: true
};

// 模拟歌曲数据
const mockSongs: ArtistSong[] = [
  { id: '1', title: '七里香', duration: '4:35', playCount: '8923万', publishTime: '2004-08-03', album: '七里香', isPlaying: false },
  { id: '2', title: '青花瓷', duration: '4:13', playCount: '7654万', publishTime: '2007-11-02', album: '我很忙', isPlaying: false },
  { id: '3', title: '稻香', duration: '3:43', playCount: '6543万', publishTime: '2008-10-15', album: '魔杰座', isPlaying: false },
  { id: '4', title: '双截棍', duration: '3:29', playCount: '5432万', publishTime: '2001-09-14', album: '范特西', isPlaying: false },
  { id: '5', title: '简单爱', duration: '4:30', playCount: '4321万', publishTime: '2001-09-14', album: '范特西', isPlaying: false },
  { id: '6', title: '告白气球', duration: '3:51', playCount: '3210万', publishTime: '2016-06-24', album: '周杰伦的床边故事', isPlaying: false },
  { id: '7', title: '等你下课', duration: '4:14', playCount: '2109万', publishTime: '2018-01-18', album: '最伟大的作品', isPlaying: false },
  { id: '8', title: 'Mojito', duration: '3:46', playCount: '1987万', publishTime: '2020-06-12', album: 'Mojito', isPlaying: false }
];

const artist = ref<Artist>(mockArtist);
const songs = ref<ArtistSong[]>(mockSongs);

// 播放歌曲
const playSong = (song: ArtistSong) => {
  songs.value.forEach(s => s.isPlaying = s.id === song.id);
  console.log('播放歌曲:', song.title);
};

// 播放全部
const playAllSongs = () => {
  if (songs.value.length > 0) {
    playSong(songs.value[0]);
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
    <ArtistHeader :artist="artist" @subscribe="handleSubscribe" @play-all="playAllSongs" />
    <div class="artist-content max-w-7xl mx-auto px-4 md:px-6 pb-8">
      <ArtistContent :songs="songs" :artist-name="artist.name" @play-song="playSong" />
    </div>
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