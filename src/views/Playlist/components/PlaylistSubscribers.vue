<script lang="ts" setup>
import UserCard from '@/components/common/musicComponents/UserCard.vue';
import type { User } from '@/types/musicTypes';
const props = defineProps<{
    subscribers : User[] | undefined;
}>();
</script>

<template>
  <div class="playlist-subscribers">
    <div class="text-center py-12 text-gray-500 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      <UserCard v-if="subscribers" v-for="user in subscribers" :user="user" />
    </div>
  </div>
</template>

<style scoped>
.playlist-subscribers {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .playlist-subscribers {
    padding: 16px;
  }
}
</style>
