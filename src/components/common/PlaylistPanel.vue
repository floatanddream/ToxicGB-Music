<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { X, ListMusic } from 'lucide-vue-next'
import { usePlayerStore } from '@/stores/playerStore'
import ArtistDivider from './musicComponents/artistDivider.vue';

const props = defineProps<{
  visible: boolean
}>()

const playerStore = usePlayerStore();

// 直接使用 store 的响应式数据
const songs = computed(() => playerStore.playlist)
const currentSong = computed(() => playerStore.currentSong)

// 虚拟滚动配置
const ITEM_HEIGHT = 68
const BUFFER_COUNT = 5

const scrollRef = ref<HTMLDivElement | null>(null)
const scrollTop = ref(0)
const containerHeight = ref(400)

const visibleRange = computed(() => {
  const start = Math.max(0, Math.floor(scrollTop.value / ITEM_HEIGHT) - BUFFER_COUNT)
  const visibleCount = Math.ceil(containerHeight.value / ITEM_HEIGHT) + 2 * BUFFER_COUNT
  const end = Math.min(songs.value.length, start + visibleCount)
  return { start, end }
})

const visibleItems = computed(() => {
  return songs.value.slice(visibleRange.value.start, visibleRange.value.end)
})

const totalHeight = computed(() => songs.value.length * ITEM_HEIGHT)
const offsetY = computed(() => visibleRange.value.start * ITEM_HEIGHT)

const onScroll = (e: Event) => {
  const target = e.target as HTMLDivElement
  scrollTop.value = target.scrollTop
}

// 滚动到当前播放歌曲
const scrollToCurrentSong = () => {
  if (!scrollRef.value) return
  if (!currentSong.value) return

  const index = songs.value.findIndex(s => s.id === currentSong.value?.id)
  if (index === -1) return

  const marginTop = 20
  const targetScrollTop = index * ITEM_HEIGHT - marginTop
  const maxScrollTop = totalHeight.value - containerHeight.value
  const clampedScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop))

  scrollRef.value.scrollTop = clampedScrollTop
  scrollTop.value = clampedScrollTop
}

onMounted(() => {
  if (scrollRef.value) {
    containerHeight.value = scrollRef.value.clientHeight
  }
  if (props.visible) {
    setTimeout(() => {
      nextTick(() => {
        scrollToCurrentSong()
      })
    }, 100)
  }
})

// 监听 visible 变化，自动滚动到当前歌曲
watch(() => props.visible, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      nextTick(() => {
        scrollToCurrentSong()
      })
    }, 100)
  }
})
</script>

<template>
  <div class="playlist-panel" @click.stop>
    <!-- 头部 -->
    <div class="playlist-header">
      <div class="flex items-center gap-3">
        <ListMusic class="w-5 h-5 text-red-500" />
        <h2 class="playlist-title">正在播放</h2>
      </div>
      <button class="playlist-close-btn" @click="$emit('close')">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- 歌曲数量 -->
    <div class="playlist-count-bar">
      <span class="text-sm text-gray-500 dark:text-gray-400">共 {{ songs.length }} 首歌曲</span>
    </div>

    <!-- 虚拟滚动容器 -->
    <div ref="scrollRef" class="playlist-viewport custom-scrollbar" @scroll="onScroll">
      <div class="playlist-spacer" :style="{ height: `${totalHeight}px` }">
        <div class="playlist-visible" :style="{ transform: `translateY(${offsetY}px)` }">
          <div v-for="song in visibleItems" :key="song.id" class="playlist-item"
            :class="{ 'playlist-item-active': currentSong?.id === song.id }" @click="$emit('playSong', song)">
            <img :src="song.cover" :alt="song.title" class="playlist-cover" />
            <div class="playlist-info">
              <span class="playlist-song-title">{{ song.title }}</span>
              <!-- <span class="playlist-artist">{{ song.artist[0]?.name }}</span> -->
              <ArtistDivider :artists="song.artist" />
            </div>
            <span class="playlist-duration">{{ song.duration }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playlist-panel {
  z-index: 10000;
  position: fixed;
  top: 15vh;
  right: 0;
  width: 380px;
  max-height: 70vh;
  height: 70vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  margin: 10px;
  overflow: hidden;

  background: var(--glass-bg);
  backdrop-filter: blur(18px) saturate(200%) brightness(1.2) contrast(1.05);
  -webkit-backdrop-filter: blur(18px) saturate(200%) brightness(1.2) contrast(1.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.15);
}

.dark .playlist-panel {
  background: rgba(17, 25, 40, 0.35);
  border-color: rgba(255, 255, 255, 0.08);
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.dark .playlist-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.playlist-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.dark .playlist-title {
  color: #ffffff;
}

.playlist-close-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.playlist-close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}

.dark .playlist-close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.playlist-count-bar {
  padding: 12px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.dark .playlist-count-bar {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.playlist-viewport {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.playlist-spacer {
  position: relative;
  width: 100%;
}

.playlist-visible {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 0 12px;
}

.playlist-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  height: 68px;
  box-sizing: border-box;
}

.playlist-item:hover {
  background: rgba(0, 0, 0, 0.04);
}

.dark .playlist-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.playlist-item-active {
  background: rgba(250, 35, 59, 0.08);
}

.dark .playlist-item-active {
  background: rgba(250, 35, 59, 0.15);
}

.playlist-item-active .playlist-song-title {
  color: #fa233b;
}

.playlist-cover {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.playlist-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  overflow: hidden;
}

.playlist-song-title {
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .playlist-song-title {
  color: #ffffff;
}

.playlist-artist {
  font-size: 12px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.dark .playlist-artist {
  color: #aaa;
}

.playlist-duration {
  font-size: 12px;
  color: #999;
  flex-shrink: 0;
}

.dark .playlist-duration {
  color: #888;
}
</style>
