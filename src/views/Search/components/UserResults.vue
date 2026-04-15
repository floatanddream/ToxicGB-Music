<script setup lang="ts">
import { ref } from 'vue';
import { User, UserPlus, Music2, Heart } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import type {User as UserStru} from '@/types/musicTypes'

defineProps<{
  users: UserStru[];
}>();

defineEmits<{
  'follow-user': [user: UserStru];
  'user-click': [user: UserStru];
}>();
</script>

<template>
  <div class="user-results">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">用户</h2>
      <span class="text-sm text-gray-500">{{ users.length }} 位用户</span>
    </div>

    <div v-if="users.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div v-for="user in users" :key="user.id" class="artist-card group cursor-pointer"
        @click="$emit('user-click', user)">
        <div class="relative">
          <div
            class="aspect-square rounded-full overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all">
            <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
          </div>
        </div>

        <h3 class="font-medium text-gray-900 dark:text-white text-center truncate">
          {{ user.name }}
        </h3>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <UserPlus class="w-12 h-12 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-2">没有找到用户</h3>
        <p class="text-sm text-gray-500 dark:text-gray-400">试试其他关键词</p>
      </div>
    </div>
  </div>
</template>

  <style scoped>
  .user-item {
    border-radius: 8px;
    transition: all 0.2s ease;
  }

  .user-item:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }

  .dark .user-item:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }
  </style>