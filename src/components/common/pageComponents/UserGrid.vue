<script setup lang="ts">
import { UserPlus } from 'lucide-vue-next';
import type { User } from '@/types/musicTypes';
import UserCard from '@/components/common/musicComponents/UserCard.vue';
import emitter from '@/utils/eventBus';
import { EVENTS } from '@/constants/events';

defineProps<{
  users: User[];
  title?: string;
}>();

const handleUserClick = (user: User) => {
  emitter.emit(EVENTS.USER_CLICK, user);
};
</script>

<template>
  <div class="user-grid">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">用户</h2>
      <span class="text-sm text-gray-500">{{ users.length }} 位用户</span>
    </div>

    <div v-if="users.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      <UserCard
        v-for="user in users"
        :key="user.id"
        :user="user"
        @user-click="handleUserClick"
      />
    </div>
    <div v-else class="text-center py-12">
      <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <UserPlus class="w-12 h-12 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无内容</h3>
    </div>
  </div>
</template>