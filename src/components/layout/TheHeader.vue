<script setup lang="ts">
import AppLogo from '../common/AppLogo.vue'
import SearchBar from '../common/SearchBar.vue'
import UserAvatar from '../common/UserAvatar.vue'
import AuthModal from '../common/AuthModal.vue'
import { ref, onMounted } from 'vue'
import { MoonIcon, SunIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user'

const isDarkMode = ref(false);
const authModalRef = ref<InstanceType<typeof AuthModal> | null>(null);

const userStore = useUserStore();

const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
};

const onClickAvatar = () => {
  if (authModalRef.value && !userStore.isLogin) {
    authModalRef.value.openAuthModal();
  }
};

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
</script>

<template>
  <header class="header">
    <div class="header-content">
      <AppLogo size="medium" />
      <div class="search-wrapper">
        <SearchBar placeholder="搜索音乐、歌手、专辑..." />

      </div>
      <div class="header-actions">
        <Button
          variant="ghost"
          size="icon"
          @click="toggleTheme"
          class="theme-toggle-btn"
        >
          <SunIcon v-if="isDarkMode" class="h-5 w-5 text-yellow-500" />
          <MoonIcon v-else class="h-5 w-5 text-gray-700" />
        </Button>
        <UserAvatar
          :src="userStore.isLogin ? userStore.avatar :`https://api.dicebear.com/7.x/avataaars/svg?seed=default`"
          alt="用户头像"
          size="small"
          @click="onClickAvatar"
          class="cursor-pointer w-10! h-10!"
        />
      </div>
    </div>
    <AuthModal ref="authModalRef" />
  </header>
</template>

<style scoped>
.header {
  background-color: rgba(255, 255, 255, 0.7);
  border-bottom: 1px solid rgba(224, 224, 224, 0.3);
  padding: 0 20px;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .header {
  background-color: rgba(26, 26, 26, 0.7);
  border-bottom-color: rgba(51, 51, 51, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 95%;
  margin: 0 auto;
  height: 60px;
}

.search-wrapper {
  flex: 1;
  max-width: 500px;
  margin: 0 20px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle-btn {
  border-radius: 50%;
  padding: 8px;
}
</style>