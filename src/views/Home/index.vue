<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Button } from '@/components/ui/button';
import { CircleFadingArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, UserIcon } from 'lucide-vue-next';
import UserCard from './components/userCard.vue';
import Carousel from './components/carousel.vue';
import PopularSinger from './components/popularSinger.vue';
import PlaylistSection from './components/PlaylistSection.vue';
import MusicRankingList from './components/musicRankingList.vue';

</script>

<template>
  <div class="home">
    <!-- 新的布局：左侧用户信息，右侧轮播图 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- 左侧：用户卡片 -->
      <UserCard />

      <!-- 右侧：轮播图 -->
      <Carousel />
    </div>

    <!-- 热门歌手图片布局  -->
    <PopularSinger />

    <!-- 推荐歌单 -->
    <PlaylistSection />

    <!-- 音乐榜单 -->
    <MusicRankingList />
  </div>
</template>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

.home h1 {
  margin-bottom: 30px;
  color: #2c3e50;
}

.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}
</style>