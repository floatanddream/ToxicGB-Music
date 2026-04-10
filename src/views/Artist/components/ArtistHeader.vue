<script setup lang="ts">
import { Play, Heart, Users, Music, Disc, Award } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

interface Artist {
  id: string;
  name: string;
  cover: string;
  backgroundImage: string;
  fanCount: string;
  songCount: string;
  albumCount: string;
  isSubscribed: boolean;
  description: string;
  verified: boolean;
}

defineProps<{
  artist: Artist;
}>();

defineEmits<{
  'subscribe': [];
  'play-all': [];
}>();

const formatFanCount = (count: string) => {
  const num = parseInt(count);
  if (num >= 10000) {
    return (num / 10000).toFixed(0) + '万';
  }
  return count;
};
</script>

<template>
  <div class="artist-header relative">

    <!-- 内容层 -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
        <!-- 歌手头像 -->
        <div class="avatar-container relative">
          <div class="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
            <img :src="artist.cover" :alt="artist.name" class="w-full h-full object-cover" />
          </div>
          <div
            v-if="artist.verified"
            class="verified-badge absolute bottom-2 right-2 bg-red-500 rounded-full p-2 shadow-lg"
          >
            <Award class="w-5 h-5 text-white" />
          </div>
        </div>

        <!-- 歌手信息 -->
        <div class="flex-1 text-center md:text-left ">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-3  drop-shadow-lg">
            {{ artist.name }}
          </h1>
          <p class=" mb-4 max-w-2xl text-sm md:text-base">
            {{ artist.description }}
          </p>

          <!-- 统计数据 -->
          <div class="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start mb-6">
            <div class="flex items-center gap-2 text-sm ">
              <Users class="w-4 h-4" />
              <span>{{ formatFanCount(artist.fanCount) }} 粉丝</span>
            </div>
            <div class="flex items-center gap-2 text-sm ">
              <Music class="w-4 h-4" />
              <span>{{ artist.songCount }} 首歌曲</span>
            </div>
            <div class="flex items-center gap-2 text-sm ">
              <Disc class="w-4 h-4" />
              <span>{{ artist.albumCount }} 张专辑</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 justify-center md:justify-start">
            <Button
              size="lg"
              class="bg-gradient-red-custom text-white"
              @click="$emit('subscribe')"
            >
              <Heart
                class="w-5 h-5 mr-2 transition-all"
                :class="{ 'fill-current': artist.isSubscribed }"
              />
              {{ artist.isSubscribed ? '已关注' : '关注' }}
            </Button>
            <Button
              size="lg"
              class="play-all-btn btn-gradient-primary"
              @click="$emit('play-all')"
            >
              <Play class="w-5 h-5 mr-2 fill-current" />
              播放全部
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.artist-header {
  position: relative;
  overflow: hidden;
}

.background-image-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 320px;
}

@media (max-width: 768px) {
  .background-image-container {
    height: 280px;
  }
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.2) 50%, var(--background-color) 100%);
}

.avatar-container {
  transition: transform 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.verified-badge {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

.play-all-btn {
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.play-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .artist-header .flex {
    flex-direction: column;
    align-items: center;
  }

  .artist-header h1 {
    font-size: 2rem;
  }

  .artist-header .avatar-container .w-32 {
    width: 8rem;
    height: 8rem;
  }
}
</style>