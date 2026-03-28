<template>
  <div class="playlist-section px-4 md:px-6">
    <div class="section-header mb-8">
      <h2 class="text-3xl font-bold tracking-tight text-primary">推荐歌单</h2>
      <p class="text-secondary mt-2">发现属于你的音乐世界</p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 playlist-grid">
      <Card
        v-for="playlist in playlists"
        :key="playlist.id"
        class="group hover:shadow-xl transition-all duration-300 cursor-pointer bg-card border border-secondary hover:-translate-y-1"
        @mouseenter="e => e.currentTarget.style.transform = 'translateY(-4px)'"
        @mouseleave="e => e.currentTarget.style.transform = 'translateY(0)'"
      >
        <CardHeader class="p-0 rounded-lg">
          <div class="relative overflow-hidden rounded-lg aspect-square">
            <img
              :src="playlist.coverUrl"
              :alt="playlist.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="absolute inset-0 flex items-center justify-center">
                <Button
                  variant="secondary"
                  size="icon"
                  class="rounded-full shadow-xl bg-white/90 dark:bg-gray-100/90 hover:scale-110 transition-transform"
                  @click.stop
                >
                  <PlayIcon class="h-6 w-6 text-gray-800 dark:text-gray-900" />
                </Button>
              </div>
            </div>
            <div class="absolute top-2 right-2">
              <Button
                variant="ghost"
                size="icon"
                class="w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-sm"
                @click.stop="toggleLike(playlist)"
              >
                <HeartIcon
                  class="w-4 h-4 text-white"
                  :class="{ 'fill-red-500 text-red-500': playlist.isLiked }"
                />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent class="p-4">
          <CardTitle class="text-base font-semibold mb-2 text-primary line-clamp-1">{{ playlist.name }}</CardTitle>
          <p class="text-sm text-secondary mb-4 line-clamp-2 min-h-[2.5rem]">{{ playlist.description }}</p>

          <div class="flex items-center justify-between text-xs text-tertiary mb-4">
            <div class="flex items-center gap-2">
              <ClockIcon class="w-3 h-3" />
              <span>{{ playlist.duration }}</span>
            </div>
            <div class="flex items-center gap-1">
              <span>{{ playlist.songCount }} 首歌曲</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              class="flex-1 bg-sky-500 hover:bg-sky-600 text-white dark:bg-sky-600 dark:hover:bg-sky-700 transition-colors"
              @click.stop
            >
              <PlayIcon class="w-3 h-3 mr-1" />
              播放全部
            </Button>

            <Button
              variant="outline"
              size="sm"
              class="w-8 h-8 p-0 border-secondary hover:bg-tertiary"
              @click.stop
            >
              <PlusIcon class="w-4 h-4 text-secondary" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlayIcon, ClockIcon, HeartIcon, PlusIcon } from 'lucide-vue-next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ref } from 'vue';

interface Playlist {
  id: number;
  name: string;
  description: string;
  coverUrl: string;
  songCount: number;
  duration: string;
  isLiked: boolean;
}

const playlists = ref<Playlist[]>([
  {
    id: 1,
    name: '华语流行精选',
    description: '最新华语流行歌曲合集',
    coverUrl: 'https://picsum.photos/200/200?random=10',
    songCount: 24,
    duration: '1小时23分',
    isLiked: true
  },
  {
    id: 2,
    name: '欧美热单',
    description: 'Billboard 热门单曲',
    coverUrl: 'https://picsum.photos/200/200?random=11',
    songCount: 18,
    duration: '1小时15分',
    isLiked: false
  },
  {
    id: 3,
    name: '轻音乐时光',
    description: '放松身心的轻音乐',
    coverUrl: 'https://picsum.photos/200/200?random=12',
    songCount: 32,
    duration: '2小时08分',
    isLiked: true
  },
  {
    id: 4,
    name: '摇滚力量',
    description: '经典摇滚歌曲',
    coverUrl: 'https://picsum.photos/200/200?random=13',
    songCount: 21,
    duration: '1小时45分',
    isLiked: false
  }
]);

const toggleLike = (playlist: Playlist) => {
  playlist.isLiked = !playlist.isLiked;
};
</script>

<style scoped>
.playlist-section {
  margin-bottom: 3rem;
}

.section-header {
  text-align: left;
}

.playlist-grid {
  margin-top: 1.5rem;
}

.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.min-h-\[2\.5rem\] {
  min-height: 2.5rem;
}

@media (max-width: 768px) {
  .playlist-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .playlist-grid {
    grid-template-columns: 1fr;
  }
}
</style>