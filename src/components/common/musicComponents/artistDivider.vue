<template>
    <span class="artist-divider">
        <template v-for="(artist, index) in artists" :key="artist.id">
            <span class="artist-name" @click.stop="emitter.emit(EVENTS.ARTIST_CLICK, artist)">
                {{ artist.name }}
            </span>
            <span v-if="index !== artists.length - 1" class="artist-separator"> / </span>
        </template>
    </span>
</template>
<script lang="ts" setup>
import { EVENTS } from '@/constants/events';
import emitter from '@/utils/eventBus';
import type { Artist } from '@/types/musicTypes';

const props = defineProps<{
    artists: Artist[];
}>();

</script>

<style scoped>
.artist-divider {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.artist-name {
    font-size: 13px;
    cursor: pointer;
    transition: color 0.15s ease;
}

.artist-name:hover {
    color: #fa233b;
}

.dark .artist-name:hover {
    color: #fa233b;
}

.artist-separator {
    margin: 0 4px;
}
</style>