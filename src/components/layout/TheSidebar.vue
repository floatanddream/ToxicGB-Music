<script setup lang="ts">
import NavigationMenu from '../common/NavigationMenu.vue'
import type { MenuItem } from '@/types/menu'
import { ref, onMounted, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon, Music, ListMusic, ChevronDown, ChevronRight } from 'lucide-vue-next'
import { useUserStore } from '@/stores/user'
import { useRoute } from 'vue-router'

const userStore = useUserStore();
const route = useRoute();

//用户创建歌单与用户收藏歌单的容器ref
const userCreatePlaylistRef = ref<HTMLDivElement>();
const userSubPlaylistRef = ref<HTMLDivElement>();
const createPlaylistHeight = computed(() => {
  return userCreatePlaylistRef.value?.scrollHeight;
});
const subPlaylistHeight = computed(() => {
  return userSubPlaylistRef.value?.scrollHeight;
  
});

// 是否有歌单数据
const hasPlaylists = computed(() =>
  (userStore.userCreatePlaylist?.length || 0) > 0 ||
  (userStore.userSubPlaylist?.length || 0) > 0
)

// 当前歌单 ID
const currentPlaylistId = computed(() => {
  return route.query.id as string
})

// 判断歌单是否激活
const isPlaylistActive = (playlistId: string) => {
  return currentPlaylistId.value === playlistId
}

// 歌单折叠状态
const myPlaylistsCollapsed = ref(true)
const subPlaylistsCollapsed = ref(true)

const toggleMyPlaylists = () => {
  myPlaylistsCollapsed.value = !myPlaylistsCollapsed.value
}

const toggleSubPlaylists = () => {
  subPlaylistsCollapsed.value = !subPlaylistsCollapsed.value
}

const isDarkMode = ref(false)

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

const initTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  } else {
    isDarkMode.value = false
    document.documentElement.classList.remove('dark')
  }
}

onMounted(() => {
  initTheme()
  userStore.ensureUser()
})

defineProps<{
  isCollapsed?: boolean
}>()

defineEmits<{
  'update:isCollapsed': [value: boolean]
}>()

// 基础菜单项（不包括歌单）
const baseMenuItems: MenuItem[] = [
  {
    id: 'theme-toggle',
    label: '主题',
    icon: '🎨',
    action: toggleTheme
  },
  {
    id: 'home',
    label: '首页',
    icon: '🏠',
    route: '/'
  },
  {
    id: 'search',
    label: '搜索',
    icon: '🔍',
    route: '/search'
  },
]
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <NavigationMenu :items="baseMenuItems" />

    <!-- 歌单列表 -->
    <div v-if="hasPlaylists" class="playlists-section">
      <!-- 我的歌单 -->
      <div v-if="userStore.userCreatePlaylist.length" class="playlist-group">
        <div class="playlist-group-header clickable" @click="toggleMyPlaylists">
          <Music class="h-4 w-4" />
          <span>我的歌单</span>
          <ChevronRight v-if="myPlaylistsCollapsed" class="h-4 w-4 ml-auto" />
          <ChevronDown v-else class="h-4 w-4 ml-auto" />
        </div>
        <div ref="userCreatePlaylistRef"
          :style="{ maxHeight: !myPlaylistsCollapsed ? `${createPlaylistHeight}px` : '0' }"
          :class="['playlist-list', { expanded: !myPlaylistsCollapsed }]">
          <RouterLink v-for="playlist in userStore.userCreatePlaylist" :key="playlist.id"
            :to="`/playlist?id=${playlist.id}`" class="playlist-item"
            :class="{ active: isPlaylistActive(playlist.id) }">
            <img :src="playlist.cover" :alt="playlist.title" class="playlist-cover" />
            <span class="playlist-name">{{ playlist.title }}</span>
          </RouterLink>
        </div>
      </div>

      <!-- 收藏的歌单 -->
      <div v-if="userStore.userSubPlaylist.length" class="playlist-group">
        <div class="playlist-group-header clickable" @click="toggleSubPlaylists">
          <ListMusic class="h-4 w-4" />
          <span>收藏的歌单</span>
          <ChevronRight v-if="subPlaylistsCollapsed" class="h-4 w-4 ml-auto" />
          <ChevronDown v-else class="h-4 w-4 ml-auto" />
        </div>
        <div ref="userSubPlaylistRef" :class="['playlist-list', { expanded: !subPlaylistsCollapsed }]"
          :style="{ maxHeight: !subPlaylistsCollapsed ? `${subPlaylistHeight}px` : `0` }">
          <RouterLink v-for="playlist in userStore.userSubPlaylist" :key="playlist.id"
            :to="`/playlist?id=${playlist.id}`" class="playlist-item"
            :class="{ active: isPlaylistActive(playlist.id) }">
            <img :src="playlist.cover" :alt="playlist.title" class="playlist-cover" />
            <span class="playlist-name">{{ playlist.title }}</span>
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="theme-toggle-container">
      <Button variant="outline" size="sm" @click="toggleTheme" class="theme-toggle-btn">
        <SunIcon v-if="isDarkMode" class="h-4 w-4 text-yellow-500" />
        <MoonIcon v-else class="h-4 w-4 text-gray-700" />
        {{ isDarkMode ? '浅色模式' : '深色模式' }}
      </Button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  /* width: 240px; */
  width: 30vh;
  background-color: rgba(248, 249, 250, 0.7);
  border-right: 1px solid rgba(224, 224, 224, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.05);
}

.dark .sidebar {
  background-color: rgba(26, 26, 26, 0.7);
  border-right-color: rgba(51, 51, 51, 0.3);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
}

.sidebar.collapsed {
  width: 60px;
}

.theme-toggle-container {
  padding: 16px;
  margin-top: auto;
  border-top: 1px solid rgba(224, 224, 224, 0.3);
}

.dark .theme-toggle-container {
  border-top-color: rgba(51, 51, 51, 0.3);
}

.theme-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -240px;
    z-index: 99;
    height: calc(100vh - 60px);
    width: 0;
  }

  .sidebar.open {
    left: 0;
  }
}

/* 歌单区域样式 */
.playlists-section {
  padding: 10px 0;
  border-top: 1px solid rgba(224, 224, 224, 0.3);
  margin-top: 10px;
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 400px);
}

.dark .playlists-section {
  border-top-color: rgba(51, 51, 51, 0.3);
}

.playlist-group {
  margin-bottom: 15px;
}

.playlist-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 20px;
  font-weight: bold;
  color: #666;
  font-size: 13px;
  cursor: default;
}

.playlist-group-header.clickable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.3s ease;
}

.playlist-group-header.clickable:hover {
  background-color: rgba(224, 224, 224, 0.1);
}

.dark .playlist-group-header.clickable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.dark .playlist-group-header {
  color: #999;
}

.playlist-group-header span {
  margin-left: 10px;
}

.playlist-list {
  list-style: none;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease, opacity 0.5s ease;
}

.playlist-list.expanded {
  opacity: 1;
}

.playlist-item {
  display: flex;
  align-items: center;
  padding: 6px 20px;
  margin: 4px 12px;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
  gap: 10px;
  border-radius: 8px;
  border: 1px solid transparent;
}

.dark .playlist-item {
  color: #e0e0e0;
}

.playlist-item:hover {
  background: #ff3b30;
  border-radius: 8px;
  border: 1px solid #ff3b30;
  color: #fff;
}

.dark .playlist-item:hover {
  background: #ff453a;
  border: 1px solid #ff453a;
  color: #fff;
}

.playlist-item.active {
  background: #ff3b30;
  border-radius: 8px;
  border: 1px solid #ff3b30;
  color: #fff;
}

.dark .playlist-item.active {
  background: #ff453a;
  border: 1px solid #ff453a;
  color: #fff;
}

.playlist-cover {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
}

.playlist-name {
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

/* 滚动条样式 */
.playlists-section::-webkit-scrollbar {
  width: 4px;
}

.playlists-section::-webkit-scrollbar-track {
  background: transparent;
}

.playlists-section::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.dark .playlists-section::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
}
</style>