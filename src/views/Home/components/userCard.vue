<script lang="ts" setup>
import { UserIcon } from 'lucide-vue-next';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useUserStore } from '@/stores/user';

const user = useUserStore();

</script>
<template>
  <div class="lg:col-span-1 h-90">
    <Card class="h-full user-card">
      <CardHeader class="items-center text-center pb-6">
        <div class="relative mb-4">
          <div class="user-avatar" >
            <!-- <UserIcon class="w-12 h-12 text-white" /> -->
            <img class="w-full h-full rounded-full" alt="user avatar" :src="user.user?.avatarUrl" />
          </div>
          <div class="user-status" />
        </div>
        <CardTitle class="text-xl text-primary">{{ user.user?.nickname }}</CardTitle>
        <CardDescription class="text-secondary">{{ user.user?.signature }}</CardDescription>
      </CardHeader>
      <CardContent class="py-2">
        <div class="grid place-items-center">
          <div class="w-1/2">
            <div class="w-full space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary">听歌时长</span>
                <span class="font-semibold text-primary">2,560小时</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary">收藏歌曲</span>
                <span class="font-semibibold text-primary">892首</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary">创建歌单</span>
                <span class="font-semibold text-primary">12个</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter class="mt-auto pt-4">
        <p class="text-sm italic text-gray-600 text-center w-full">"音乐是心灵的翅膀"</p>
      </CardFooter>
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

@media (prefers-color-scheme: dark) {
  .user-status {
    border-color: #1f2937;
  }

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