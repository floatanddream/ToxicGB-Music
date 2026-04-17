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
      <div class="artist-content">
       <ArtistSongs v-if="activeTab === 'songs'" key="songs"  :songs="songs"/>
       <ArtistAlbums :albums="albums" v-else-if="activeTab === 'albums'" key="albums" />
      <ArtistVideos v-else-if="activeTab === 'videos'" key="videos" />
      <ArtistActivities v-else-if="activeTab === 'activities'" key="activities" />
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
</style>