<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import UserHeader from './components/UserHeader.vue';
import UserContent from './components/UserContent.vue';
import type { User } from '@/types/user';
import type { Playlist } from '@/types/musicTypes';
import { getUser, fetchUserPlaylist } from '@/api/user';
import { transformToPlaylist } from '@/utils/dataTransformer';
import { Loader2 } from 'lucide-vue-next';
import { EVENTS } from '@/constants/events';
import emitter from '@/utils/eventBus';

const route = useRoute();
const userId = computed(() => route.query.id as string);

const userData = ref<User>();
const playlists = ref<Playlist[]>([]);
const loading = ref(false);

const fetchUserData = async () => {
  emitter.emit(EVENTS.SCROOL_TOP);
  loading.value = true;
  try {
    // 获取当前登录用户或指定用户
    const userIdToFetch = userId.value || 'self';
    const userRes = await getUser(userIdToFetch);
    const userInfo = userRes.profile;
    if (userInfo) {
      userData.value = {
        id: String(userInfo.userId),
        username: userInfo.nickname,
        avatar: userInfo.avatarUrl,
        email: '',
        role: '',
        backgroundUrl: userInfo.backgroundUrl,
        birthday: userInfo.birthday,
        detailDescription: userInfo.detailDescription,
        authenticated: !!userInfo.authenticated,
        gender: userInfo.gender,
        city: userInfo.city,
        signature: userInfo.signature,
        description: userInfo.description,
        remarkName: userInfo.remarkName,
        shortUserName: userInfo.shortUserName,
        accountStatus: userInfo.accountStatus,
        locationStatus: userInfo.locationStatus,
        avatarImgId: userInfo.avatarImgId,
        defaultAvatar: userInfo.defaultAvatar,
        province: userInfo.province,
        nickname: userInfo.nickname,
        expertTags: userInfo.expertTags,
        djStatus: userInfo.djStatus,
        avatarUrl: userInfo.avatarUrl,
        accountType: userInfo.accountType,
        authStatus: userInfo.authStatus,
        vipType: userInfo.vipType,
        userName: userInfo.userName,
        followed: userInfo.followed,
        userId: userInfo.userId,
        lastLoginIP: userInfo.lastLoginIP,
        lastLoginTime: userInfo.lastLoginTime,
        authenticationTypes: userInfo.authenticationTypes,
        mutual: userInfo.mutual,
        createTime: userInfo.createTime,
        anchor: userInfo.anchor,
        authority: userInfo.authority,
        backgroundImgId: userInfo.backgroundImgId,
        userType: userInfo.userType,
        experts: userInfo.experts,
        avatarDetail: userInfo.avatarDetail
      };
    }

    // 获取用户歌单
    const uid = userId.value || userInfo?.userId;
    if (uid) {
      const playlistRes = await fetchUserPlaylist(uid);
      const allPlaylists = playlistRes.playlist || [];
      // 分离创建的歌单和收藏的歌单
      const createdPlaylists = allPlaylists.filter((p: any) => p.userId === uid);
      const subscribedPlaylists = allPlaylists.filter((p: any) => p.userId !== uid);
      // 合并显示，优先显示创建的歌单
      playlists.value = allPlaylists.map(transformToPlaylist);
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
          <UserContent v-if="userData" :playlists="playlists" />
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