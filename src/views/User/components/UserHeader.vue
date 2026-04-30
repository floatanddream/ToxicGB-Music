<script setup lang="ts">
import { Music2, User, Disc } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import type { User as UserType } from '@/types/user';
import { useUserStore } from '@/stores/user';
import DescriptionWithDialog from '@/components/common/musicComponents/DescriptionWithDialog.vue';
import { computed } from 'vue';

const props = defineProps<{
  user: UserType;
}>();

defineEmits<{
  'follow': [];
}>();

const userStore = useUserStore();
const isOwnProfile = computed(() => {
  return userStore.userId === Number(props.user.userId);
});
</script>

<template>
  <div class="user-header relative">
    <!-- 背景图 -->
    <div class="background-image-container">
      <img
        :src="user.backgroundUrl || user.avatarUrl"
        :alt="user.nickname"
        class="w-full h-full object-cover"
      />
      <div class="gradient-overlay"></div>
    </div>

    <!-- 内容层 -->
    <div class="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
      <div class="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
        <!-- 用户头像 -->
        <div class="avatar-container relative">
          <div
            class="w-32 h-32 md:w-40 md:h-40 lg:w-60 lg:h-60 rounded-full overflow-hidden ring-4 ring-white/20 shadow-2xl">
            <img :src="user.avatarUrl" :alt="user.nickname" class="w-full h-full object-cover" />
          </div>
        </div>

        <!-- 用户信息 -->
        <div class="flex-1 text-center md:text-left">
          <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 drop-shadow-lg">
            {{ user.nickname }}
          </h1>

          <div v-if="user.signature" class="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-6 max-w-xl leading-relaxed">
            {{ user.signature }}
          </div>

          <!-- 统计数据 -->
          <div class="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start mb-20">
            <div class="flex items-center gap-2 text-sm">
              <User class="w-4 h-4" />
              <span>动态</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <Music2 class="w-4 h-4" />
              <span>关注 {{ user.follows }}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
              <Disc class="w-4 h-4" />
              <span>粉丝 {{ user.followeds }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div v-if="!isOwnProfile" class="flex gap-3 justify-center md:justify-start">
            <Button size="lg" class="follow-btn" variant="outline" @click="$emit('follow')">
              关注
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-header {
  position: relative;
  overflow: hidden;
}

.background-image-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 1rem;
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  opacity: 0.6;
}

.background-image-container img {
  filter: blur(10px);
  transform: scale(1.1);
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 50%, var(--background-color) 100%);
  border-radius: 1rem;
}

.avatar-container {
  transition: transform 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.follow-btn {
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.follow-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .user-header .flex {
    flex-direction: column;
    align-items: center;
  }

  .user-header h1 {
    font-size: 2rem;
  }

  .user-header .avatar-container .w-32 {
    width: 8rem;
    height: 8rem;
  }
}
</style>