<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import UserHeader from './components/UserHeader.vue';
import UserContent from './components/UserContent.vue';
import type { User as UserInfo, UserSongRecord } from '@/types/user';
import type { Playlist, User } from '@/types/musicTypes';
import { getUser, fetchUserPlaylist, fetchUserFollows, fetchUserFolloweds, getUserSongRecord } from '@/api/user';
import { transformToPlaylist, transformToSong, transformToUser } from '@/utils/dataTransformer';
import { Loader2 } from 'lucide-vue-next';
import { EVENTS } from '@/constants/events';
import emitter from '@/utils/eventBus';

const route = useRoute();
const userId = computed(() => route.query.id as string);

const userData = ref<UserInfo>();
const playlists = ref<Playlist[]>([]);
const follows = ref<User[]>([]);
const followeds = ref<User[]>([]);
const songRecord = ref<UserSongRecord[]>([]);
const songRecordLoading = ref(false);
const recordDisplay = ref<'week' | 'all'>('week');
const loading = ref(false);

const fetchUserPlaylists = async (uid: string) => {
  const playlistRes = await fetchUserPlaylist(uid);
  const allPlaylists = playlistRes.playlist || [];
  playlists.value = allPlaylists.map(transformToPlaylist);

  const followsRes = await fetchUserFollows(uid);
  follows.value = followsRes.follow.map(transformToUser);

  const followedsRes = await fetchUserFolloweds(uid);
  followeds.value = followedsRes.followeds.map(transformToUser);
};

const fetchUserSongRecord = async (uid: string) => {
  songRecordLoading.value = true;
  try {
    const type = recordDisplay.value === 'week' ? 1 : 0;
    const userSongHistory = await getUserSongRecord(uid, type);
    const data = type === 1 ? userSongHistory.weekData : userSongHistory.allData;
    songRecord.value = data?.map((item: UserSongRecord) => ({
      ...item,
      song: transformToSong(item.song),
    })) || [];
  } finally {
    songRecordLoading.value = false;
  }
};

const fetchUserData = async () => {
  emitter.emit(EVENTS.SCROOL_TOP);
  loading.value = true;
  try {
    const userIdToFetch = userId.value || 'self';
    const userRes = await getUser(userIdToFetch);
    const userInfo = userRes.profile;
    if (userInfo) {
      userData.value = userInfo as UserInfo;
    }

    const uid = userId.value || userInfo?.userId;

    if (uid) {
      await fetchUserPlaylists(uid);
      await fetchUserSongRecord(userIdToFetch);
    }
  } catch (error) {
    console.error('获取用户数据失败:', error);
  } finally {
    loading.value = false;
  }
};

// 用户切换时自动更新
watch(() => route.query.id, () => {
  fetchUserData();
});

// 切换周/全部记录时重新获取
watch(recordDisplay, () => {
  const userIdToFetch = userId.value || userData.value?.userId;
  if (userIdToFetch) {
    fetchUserSongRecord(String(userIdToFetch));
  }
});

onMounted(() => {
  fetchUserData();
});
</script>

<template>
  <div class="user-page glass-container min-h-screen">
    <Transition name="fade-slide" mode="out-in">
      <div v-if="loading" key="loading" class="flex items-center justify-center h-screen">
        <Loader2 class="w-12 h-12 animate-spin text-gray-500" />
      </div>

      <div v-else :key="userId">
        <UserHeader v-if="userData" :user="userData" />
        <div class="user-content max-w-7xl mx-auto px-4 md:px-6 pb-8">
          <UserContent v-if="userData" v-model:record-display="recordDisplay" :songRecord="songRecord" :songRecordLoading="songRecordLoading" :playlists="playlists" :follows="follows" :followeds="followeds" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.user-page {
  position: relative;
}

.bg-blur-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
  animation: float 20s infinite ease-in-out;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -30px) scale(1.05);
  }

  66% {
    transform: translate(-30px, 30px) scale(0.95);
  }
}

/* 淡入淡出+滑动动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>