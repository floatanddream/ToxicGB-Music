<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
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

// 请求竞态保护：currentUserId 记录当前用户；activeController 取消旧请求
const currentUserId = ref('');
let activeController: AbortController | null = null;

const fetchUserPlaylists = async (uid: string, signal?: AbortSignal) => {
  const playlistRes = await fetchUserPlaylist(uid, signal);
  // 校验：是否还是当前用户
  if (currentUserId.value !== uid || signal?.aborted) return;
  const allPlaylists = playlistRes.playlist || [];
  playlists.value = allPlaylists.map(transformToPlaylist);

  const followsRes = await fetchUserFollows(uid);
  if (currentUserId.value !== uid || signal?.aborted) return;
  follows.value = followsRes.follow.map(transformToUser);

  const followedsRes = await fetchUserFolloweds(uid);
  if (currentUserId.value !== uid || signal?.aborted) return;
  followeds.value = followedsRes.followeds.map(transformToUser);
};

const fetchUserSongRecord = async (uid: string, signal?: AbortSignal) => {
  songRecordLoading.value = true;
  try {
    const type = recordDisplay.value === 'week' ? 1 : 0;
    const userSongHistory = await getUserSongRecord(uid, type, signal);
    // 校验：是否还是当前用户 + 当前类型
    if (currentUserId.value !== uid || signal?.aborted) return;
    const data = type === 1 ? userSongHistory.weekData : userSongHistory.allData;
    songRecord.value = data?.map((item: UserSongRecord) => ({
      ...item,
      song: transformToSong(item.song),
    })) || [];
  } catch (error) {
    if (signal?.aborted) return;
    console.error('获取用户听歌记录失败:', error);
  } finally {
    if (currentUserId.value === uid) songRecordLoading.value = false;
  }
};

const fetchUserData = async () => {
  const requestedId = userId.value || 'self';
  currentUserId.value = requestedId;

  // 取消旧请求
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;

  emitter.emit(EVENTS.SCROOL_TOP);
  loading.value = true;
  try {
    const userRes = await getUser(requestedId, controller.signal);
    // 校验：是否还是当前用户
    if (currentUserId.value !== requestedId || controller.signal.aborted) return;
    const userInfo = userRes.profile;
    if (userInfo) {
      userData.value = userInfo as UserInfo;
    }

    // 用解析出的真实 uid 调用依赖接口（修复之前传 'self' 字符串给 getUserSongRecord 的 bug）
    const resolvedUid = userId.value || userInfo?.userId;
    if (resolvedUid) {
      const uidStr = String(resolvedUid);
      await fetchUserPlaylists(uidStr, controller.signal);
      if (currentUserId.value !== requestedId || controller.signal.aborted) return;
      await fetchUserSongRecord(uidStr, controller.signal);
    }
  } catch (error) {
    if (controller.signal.aborted) return;
    console.error('获取用户数据失败:', error);
  } finally {
    if (currentUserId.value === requestedId) loading.value = false;
  }
};

// 用户切换时自动更新
watch(() => route.query.id, () => {
  fetchUserData();
});

// 切换周/全部记录时重新获取（使用独立 controller，避免与 fetchUserData 互杀）
watch(recordDisplay, () => {
  const uid = userId.value || (userData.value?.userId ? String(userData.value.userId) : null);
  if (!uid) return;
  // 不复用 activeController：用新的确保不被 fetchUserData 中途取消
  const controller = new AbortController();
  fetchUserSongRecord(uid, controller.signal);
});

onMounted(() => {
  fetchUserData();
});

onUnmounted(() => {
  activeController?.abort();
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