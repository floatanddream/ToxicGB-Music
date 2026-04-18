<template>
    <template v-for="(artist, index) in artists" :key="artist.id">
        <span class="hover:text-red-500 cursor-pointer" @click.stop="emitter.emit(EVENTS.ARTIST_CLICK, artist)">
            {{ artist.name }}
        </span>
        <span v-if="index !== artists.length - 1"> / </span>
    </template>
</template>
<script lang="ts" setup>
import { EVENTS } from '@/constants/events';
import emitter from '@/utils/eventBus';
import type { Artist } from '@/types/musicTypes';

const props = defineProps<{
    artists: Artist[];
}>();

</script>