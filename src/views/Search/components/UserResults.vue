<script setup lang="ts">
import { ref } from 'vue';
import { User, UserPlus, Music2, Heart } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  avatar: string;
  fanCount: string;
  songCount: string;
  isFollowing: boolean;
}

defineProps<{
  users: User[];
}>();

defineEmits<{
  'follow-user': [user: User];
  'user-click': [user: User];
}>();
</script>

<template>
  <div class="user-results">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold dark:text-white">用户</h2>
      <span class="text-sm text-gray-500">{{ users.length }} 位用户</span>
    </div>

    <div class="space-y-3">
      <div
        v-for="user in users"
        :key="user.id"
        class="user-item group"
      >
        <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div
            class="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 cursor-pointer"
            @click="$emit('user-click', user)"
          >
            <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover" />
          </div>

          <div
            class="flex-1 min-w-0 cursor-pointer"
            @click="$emit('user-click', user)"
          >
            <div class="flex items-center gap-2">
              <h3 class="font-medium text-gray-900 dark:text-white truncate">{{ user.name }}</h3>
            </div>
            <div class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
              <div class="flex items-center gap-1">
                <Music2 class="w-3 h-3" />
                <span>{{ user.songCount }} 歌曲</span>
              </div>
              <div class="flex items-center gap-1">
                <Heart class="w-3 h-3" />
                <span>{{ user.fanCount }} 粉丝</span>
              </div>
            </div>
          </div>

          <Button
            :variant="user.isFollowing ? 'outline' : 'default'"
            size="sm"
            @click="$emit('follow-user', user)"
          >
            <UserPlus class="w-4 h-4 mr-1" />
            {{ user.isFollowing ? '已关注' : '关注' }}
          </Button>
        </div>
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