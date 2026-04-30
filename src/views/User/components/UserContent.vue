<script setup lang="ts">
import { ref } from 'vue';
import UserTabs from './UserTabs.vue';
import type { Playlist } from '@/types/musicTypes';
import PlaylistCard from '@/components/common/musicComponents/PlaylistCard.vue';

const activeTab = ref<'playlists'>('playlists');
const props = defineProps<{
  playlists: Playlist[];
}>();
</script>

<template>
  <div class="user-content-container">
    <!-- 标签切换内容 -->
    <UserTabs v-model="activeTab" />
    <Transition name="fade-slide" mode="out-in">
      <div v-if="activeTab === 'playlists'" key="playlists" class="user-content">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <PlaylistCard
            v-for="playlist in playlists"
            :key="playlist.id"
            :playlist="playlist"
          />
        </div>
        <div v-if="playlists.length === 0" class="text-center py-12 text-gray-500">
          暂无歌单
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.user-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .user-content {
    padding: 16px;
  }
}

:deep(.fade-slide-enter-active),
:deep(.fade-slide-leave-active) {
  transition: all 0.3s ease;
}

:deep(.fade-slide-enter-from) {
  opacity: 0;
  transform: translateY(10px);
}

:deep(.fade-slide-leave-to) {
  opacity: 0;
  transform: translateY(-10px);
}
</style>