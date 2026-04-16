<script setup lang="ts">
import NavigationMenu from '../common/NavigationMenu.vue'
import type { MenuItem } from '@/types/menu'
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { MoonIcon, SunIcon } from 'lucide-vue-next'

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
})

defineProps<{
  isCollapsed?: boolean
}>()

defineEmits<{
  'update:isCollapsed': [value: boolean]
}>()

const menuItems: MenuItem[] = [
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
  {
    id: 'playlists',
    label: '歌单',
    icon: '📋',
    children: [
      {
        id: 'my-playlists',
        label: '我的歌单',
        route: '/playlist?id=2084738832'
      },
    ]
  },
]
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }">
    <NavigationMenu :items="menuItems" />
    <div class="theme-toggle-container">
      <Button
        variant="outline"
        size="sm"
        @click="toggleTheme"
        class="theme-toggle-btn"
      >
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
</style>