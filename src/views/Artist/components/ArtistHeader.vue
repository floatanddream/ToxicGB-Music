<script setup lang="ts">
import { ref } from 'vue';
import { Play, Heart, Users, Music, Disc, Award, Info } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ArtistData } from '@/types/artist';
import ScrollArea from '@/components/ui/scroll-area/ScrollArea.vue';

defineProps<{
  artist: ArtistData;
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

const shouldTruncate = (text: string) => {
  return text && text.length > 100;
};

// 获取缩略后的简介
const getTruncatedDesc = (text: string) => {
  if (!text) return '';
  return shouldTruncate(text) ? text.slice(0, 100) + '...' : text;
};
</script>

<template>
  <div class="artist-header relative">

    <!-- 内容层 -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
        <!-- 歌手头像 -->
        <div class="avatar-container relative">
          <div
            class="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
            <img :src="artist?.artist?.cover" :alt="artist?.artist?.name" class="w-full h-full object-cover" />
          </div>
          <div v-if="artist?.user?.followed"
            class="verified-badge absolute bottom-2 right-2 bg-red-500 rounded-full p-2 shadow-lg">
            <Award class="w-5 h-5 text-white" />
          </div>
        </div>

        <!-- 歌手信息 -->
        <div class="flex-1 text-center md:text-left ">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-3  drop-shadow-lg">
            {{ artist?.artist?.name }}
          </h1>
          <div class="flex items-start gap-2 mb-4 max-w-2xl">
            <p class="text-sm md:text-base">
              {{ getTruncatedDesc(artist?.artist?.briefDesc || '') }}
              <Dialog v-if="shouldTruncate(artist?.artist?.briefDesc || '')">
                <DialogTrigger as-child>
                  <Button variant="ghost" size="sm" class="h-6 text-xs">
                    详细
                  </Button>
                </DialogTrigger>
                <DialogContent class="max-w-2xl max-h-[80vh] z-500 overflow-hidden">
                  <DialogHeader>
                    <DialogTitle>歌手简介</DialogTitle>
                  </DialogHeader>
                  <ScrollArea class="h-[calc(80vh-120px)]">
                    <DialogDescription class="whitespace-pre-wrap break-words pr-4">
                      {{ artist?.artist?.briefDesc }}
                    </DialogDescription>
                  </ScrollArea>
                </DialogContent>
              </Dialog>
            </p>
          </div>

          <!-- 统计数据 -->
          <div class="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start mb-6">
            <!-- <div class="flex items-center gap-2 text-sm ">
              <Users class="w-4 h-4" />
              <span> {{artist.user}}粉丝</span>
            </div> -->
            <div class="flex items-center gap-2 text-sm ">
              <Music class="w-4 h-4" />
              <span>{{ artist?.artist?.musicSize }} 首歌曲</span>
            </div>
            <div class="flex items-center gap-2 text-sm ">
              <Disc class="w-4 h-4" />
              <span>{{ artist?.artist?.albumSize }} 张专辑</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="flex gap-3 justify-center md:justify-start">
            <Button size="lg" class="play-all-btn btn-gradient-primary" @click="$emit('play-all')">
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

  0%,
  100% {
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