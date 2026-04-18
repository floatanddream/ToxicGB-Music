<script setup lang="ts">
import { ref } from 'vue';
import ArtistTabs from './ArtistTabs.vue';
import ArtistAlbums from './ArtistAlbums.vue';
import ArtistVideos from './ArtistVideos.vue';
import ArtistActivities from './ArtistActivities.vue';
import type { Album, Song } from '@/types/musicTypes';
import ArtistSongs from './ArtistSongs.vue';
const activeTab = ref<'songs' | 'albums' | 'videos' | 'activities'>('songs');
const props = defineProps<{
  songs: Song[];
  albums: Album[];
}>();
</script>

<template>
  <div class="artist-content-container">
    <!-- 标签切换内容 -->
    <ArtistTabs v-model="activeTab" />
    <Transition name="fade-slide" mode="out-in">
      <div v-if="activeTab === 'songs'" key="songs" class="artist-content">
        <ArtistSongs :songs="songs" />
      </div>
      <div v-else-if="activeTab === 'albums'" key="albums" class="artist-content">
        <ArtistAlbums :albums="albums" />
      </div>
      <div v-else-if="activeTab === 'videos'" key="videos" class="artist-content">
        <ArtistVideos />
      </div>
      <div v-else-if="activeTab === 'activities'" key="activities" class="artist-content">
        <ArtistActivities />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.artist-content {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .artist-songs {
    padding: 16px;
  }
}
:deep(.fade-slide-enter-active),
:deep(.fade-slide-leave-active) {
  transition: all 0.3s ease;
}

:deep(.fade-slide-enter-from) {
  opacity: 0;
  transform: translateY(10px);
}

:deep(.fade-slide-leave-to) {
  opacity: 0;
  transform: translateY(-10px);
}
</style>