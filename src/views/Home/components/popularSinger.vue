<script setup lang="ts">
import { getHotArtists } from '@/api/artist'
import { EVENTS } from '@/constants/events'
import emitter from '@/utils/eventBus'
import { ref, computed, onMounted } from 'vue'

interface Singer {
  name: string
  imageUrl: string
  id: number
  height: string
}

// 生成值为70-100的随机数
const generateRandomHeight = () => {
  return Math.floor(Math.random() * 31) + 70 + 'px'
}

const getTopSingers = async () => {
  const res = await getHotArtists()
  singers.value = res.artists.map((artist: any) => ({
    name: artist.name,
    imageUrl: `${artist.picUrl}?param=128y128`,
    id: artist.id,
    height: generateRandomHeight(),
  }))
}

const handleArtistClick = (artist: Singer) => {
  emitter.emit(EVENTS.ARTIST_CLICK, artist)
}

const singers = ref<Singer[]>([])

// 分成两行显示
const firstRowSingers = computed(() => singers.value.slice(0, 15))
const secondRowSingers = computed(() => singers.value.slice(15, 35))

onMounted(() => {
  getTopSingers()
})
</script>

<template>
  <div class="mt-8 opacity-90 -m-5">
    <h2 class="text-2xl font-bold text-primary drop-shadow-md mb-6">热门歌手</h2>

    <!-- 第一行 - 向左滚动 -->
    <div class="mb-4 relative" style="overflow: hidden">
      <div class="scroll-track" style="animation: scroll-left 120s linear 0s infinite">
        <div
          v-for="singer in firstRowSingers"
          :key="'row1-' + singer.id"
          :style="{ height: singer.height }"
          class="singer-item"
          @click="handleArtistClick(singer)"
        >
          <img
            :src="singer.imageUrl"
            :alt="singer.name"
            class="w-full h-full object-cover singer-image"
          />
          <div class="singer-overlay">
            <div class="singer-name">
              <p>{{ singer.name }}</p>
            </div>
          </div>
        </div>
        <!-- 重复数据实现无缝循环 -->
        <div
          v-for="singer in firstRowSingers"
          :key="'row1-dup-' + singer.id"
          :style="{ height: singer.height }"
          class="singer-item"
          @click="handleArtistClick(singer)"
        >
          <img
            :src="singer.imageUrl"
            :alt="singer.name"
            class="w-full h-full object-cover singer-image"
          />
          <div class="singer-overlay">
            <div class="singer-name">
              <p>{{ singer.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行 - 向右滚动 -->
    <div class="relative" style="overflow: hidden">
      <div class="scroll-track-right" style="animation: scroll-right 120s linear 0s infinite">
        <div
          v-for="singer in secondRowSingers"
          :key="'row2-' + singer.id"
          :style="{ height: singer.height }"
          class="singer-item"
          @click="handleArtistClick(singer)"
        >
          <img
            :src="singer.imageUrl"
            :alt="singer.name"
            class="w-full h-full object-cover singer-image"
          />
          <div class="singer-overlay">
            <div class="singer-name">
              <p>{{ singer.name }}</p>
            </div>
          </div>
        </div>
        <!-- 重复数据实现无缝循环 -->
        <div
          v-for="singer in secondRowSingers"
          :key="'row2-dup-' + singer.id"
          :style="{ height: singer.height }"
          class="singer-item"
          @click="handleArtistClick(singer)"
        >
          <img
            :src="singer.imageUrl"
            :alt="singer.name"
            class="w-full h-full object-cover singer-image"
          />
          <div class="singer-overlay">
            <div class="singer-name">
              <p>{{ singer.name }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-50%);
  }
}

@keyframes scroll-right {
  0% {
    transform: translateX(-50%);
  }

  100% {
    transform: translateX(0);
  }
}

@keyframes scroll-right-opposite {
  0% {
    transform: translateX(-50%);
  }

  100% {
    transform: translateX(0);
  }
}
</style>

<style scoped>
.scroll-track {
  display: flex;
  width: max-content;
  will-change: transform;
}

.scroll-track:hover {
  animation-play-state: paused;
}

.scroll-track-right {
  display: flex;
  width: max-content;
  will-change: transform;
}

.scroll-track-right:hover {
  animation-play-state: paused;
}

.singer-item {
  flex-shrink: 0;
  width: 96px;

  position: relative;
  overflow: hidden;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  transition: box-shadow 0.3s;
  cursor: pointer;
}

.singer-item:hover {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.2);
}

.singer-image {
  transition: all 0.7s ease-out;
  transform: scale(1);
  filter: brightness(100%);
}

.singer-item:hover .singer-image {
  transform: scale(1.1);
  filter: brightness(110%);
}

.singer-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.3) 50%,
    transparent 100%
  );
  transition: all 0.5s ease-out;
  opacity: 0;
  transform: translateY(20px);
  backdrop-filter: blur(0px);
  -webkit-backdrop-filter: blur(0px);
}

.singer-item:hover .singer-overlay {
  opacity: 1;
  transform: translateY(0);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.singer-name {
  position: absolute;
  bottom: 12px;
  left: 12px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  drop-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.3s ease-out;
}

.singer-item:hover .singer-name {
  transform: translateY(0);
  opacity: 1;
}
</style>
