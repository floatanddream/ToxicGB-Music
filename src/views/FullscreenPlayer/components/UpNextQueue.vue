<script setup lang="ts">
import type { Song } from '@/types/player'

defineProps<{
  songs: Song[]
}>()

const emit = defineEmits<{
  'switch-song': [song: Song]
}>()
</script>

<template>
  <div class="queue-section" v-if="songs.length > 0">
    <h3 class="queue-title">Up Next</h3>
    <div class="queue-list">
      <div
        v-for="song in songs"
        :key="song.id"
        class="queue-item"
        @click="emit('switch-song', song)"
      >
        <img
          :src="song.cover || 'https://picsum.photos/50/50?random=1'"
          :alt="song.title"
          class="queue-cover"
        />
        <div class="queue-info">
          <span class="queue-song-title">{{ song.title }}</span>
          <span class="queue-artist" v-if="song.artist">
            {{ song.artist.map(a => a.name).join(', ') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.queue-section {
  /* margin-top: auto; */
}

.queue-title {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 16px 0;
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.queue-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.queue-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.queue-cover {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.queue-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.queue-song-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.queue-artist {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
