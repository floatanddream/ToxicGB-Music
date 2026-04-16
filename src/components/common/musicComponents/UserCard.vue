<script setup lang="ts">
import type { User } from '@/types/musicTypes';

defineProps<{
  user: User;
}>();

defineEmits<{
  'user-click': [user: User];
}>();

const handleUserClick = (user: User, event?: Event) => {
  if (event) event.stopPropagation();
  window.dispatchEvent(new CustomEvent('user-click', { detail: user }));
};
</script>

<template>
  <div class="artist-card group cursor-pointer" @click="$emit('user-click', user)">
    <div class="relative">
      <div
        class="aspect-square rounded-full overflow-hidden mb-3 ring-2 ring-transparent group-hover:ring-gray-200 dark:group-hover:ring-gray-700 transition-all relative">
        <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover user-image" />
      </div>
    </div>

    <h3 class="font-medium text-gray-900 dark:text-white text-center truncate">
      {{ user.name }}
    </h3>
  </div>
</template>

<style scoped>
.artist-card {
  transition: all 0.2s ease;
}

.artist-card:hover {
  transform: translateY(-4px);
}

.artist-card:hover h3 {
  color: #0ea5e9;
}

.user-image {
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.artist-card:hover .user-image {
  transform: scale(1.1);
}
</style>