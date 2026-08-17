<script setup lang="ts">
import { ref } from 'vue';
import UserTabs from './UserTabs.vue';
import type { Playlist, User } from '@/types/musicTypes';
import { type UserSongRecord } from '@/types/user.ts';
import UserGrid from '@/components/common/pageComponents/UserGrid.vue';
import PlaylistGridInfinite from '@/components/infiniteScroll/PlaylistGridInfinite.vue';
import SongRecordList from '@/components/common/musicComponents/SongRecordList.vue';

const activeTab = ref<'playlists' | 'follows' | 'followeds' | 'songHistory'>('playlists');
const recordDisplay = defineModel<'week' | 'all'>('recordDisplay', { default: 'week' });

defineProps<{
  playlists: Playlist[];
  follows: User[];
  followeds: User[];
  songRecord: UserSongRecord[];
  songRecordLoading: boolean;
}>();
</script>

<template>
  <div class="user-content-container">
    <!-- 标签切换内容 -->
    <UserTabs v-model="activeTab" />
    <Transition name="fade-slide" mode="out-in">
      <!-- 歌单 -->
      <div v-if="activeTab === 'playlists'" key="playlists" class="user-content">
        <PlaylistGridInfinite :playlists="playlists" />
      </div>

      <!-- 关注 -->
      <div v-else-if="activeTab === 'follows'" key="follows" class="user-content">
        <UserGrid :users="follows" />
      </div>

      <!-- 粉丝 -->
      <div v-else-if="activeTab === 'followeds'" key="followeds" class="user-content">
        <UserGrid :users="followeds" />
      </div>

      <!-- 听歌历史 -->
      <div v-else-if="activeTab === 'songHistory'" key="songHistory" class="user-content">
        <SongRecordList v-model:record-display="recordDisplay" :song-records="songRecord" :loading="songRecordLoading" />
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