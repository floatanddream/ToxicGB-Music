<script setup lang="ts">
import AlbumCard from '@/components/common/musicComponents/AlbumCard.vue';
import type { Album } from '@/types/musicTypes';
const props = defineProps<{
  albums: Album[];
}>();
</script>

<template>
  <div class="artist-albums">
    <div v-if="albums.length > 0" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <div v-for="album in albums" :key="album.id" class="album-card group cursor-pointer">
        <AlbumCard :album="album" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.artist-albums {
  padding: 20px;
}
.album-card {
  transition: all 0.2s ease;
}
.album-card:hover {
  transform: translateY(-4px);
}

.album-card:hover h3 {
  color: #fb2c36;
}

.album-image {
  transition: transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.album-card:hover .album-image {
  transform: scale(1.1);
}
</style>