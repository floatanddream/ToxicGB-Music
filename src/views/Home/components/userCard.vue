<script lang="ts" setup>
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useUserStore } from '@/stores/user';

const userStore = useUserStore();

</script>
<template>
  <div class="lg:col-span-1 h-90">
    <Card class="h-full user-card">
      <CardHeader class="items-center text-center pb-6">
        <div class="relative mb-4">
          <div class="user-avatar" >
            <img class="w-full h-full rounded-full" alt="user avatar" :src="userStore.user?.avatarUrl" />
          </div>
          <div class="user-status" />
        </div>
        <CardTitle class="text-xl text-primary">{{ userStore.user?.nickname }}</CardTitle>
        <CardDescription class="text-secondary">{{ userStore.user?.signature }}</CardDescription>
      </CardHeader>
      <CardContent class="py-2">
        <div class="grid grid-cols-2 gap-x-12 gap-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm text-secondary">创建歌单</span>
            <span class="font-semibold text-primary">{{ userStore.userSubCount?.createdPlaylistCount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-secondary">收藏歌单</span>
            <span class="font-semibold text-primary">{{ userStore.userSubCount?.subPlaylistCount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-secondary">关注歌手</span>
            <span class="font-semibold text-primary">{{ userStore.userSubCount?.artistCount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-secondary">电台</span>
            <span class="font-semibold text-primary">{{ userStore.userSubCount?.djRadioCount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-secondary">MV</span>
            <span class="font-semibold text-primary">{{ userStore.userSubCount?.mvCount }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-secondary">关注歌手</span>
            <span class="font-semibold text-primary">{{ userStore.userSubCount?.artistCount }}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
.user-card {
  padding: 1.25rem !important;
  opacity: 0.9;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  background-color: var(--glass-bg) !important;
  border: 1px solid var(--glass-border) !important;
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.user-avatar {
  
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  /* background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%); */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.user-status {
  position: absolute;
  bottom: 0;
  left: 4rem;
  width: 1.5rem;
  height: 1.5rem;
  background-color: #10b981;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.user-avatar {
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  background: linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary)/0.7) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.user-status {
  position: absolute;
  bottom: 0;
  left: 4rem;
  width: 1.5rem;
  height: 1.5rem;
  background-color: #10b981;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  .user-status {
    border-color: #1f2937;
  }
}
</style>