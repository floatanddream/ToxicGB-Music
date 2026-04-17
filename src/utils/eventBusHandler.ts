// src/events/register.ts
import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import type { Router } from 'vue-router'
import type { Artist } from '@/types/musicTypes'
import type { Playlist } from '@/types/musicTypes'

export function registerEvents(router: Router) {

  const handlerMap = {
    [EVENTS.ARTIST_CLICK]: (e: Artist) => {
      router.push({
        name: 'artist',
        query: { id: e.id }
      })
    },

    [EVENTS.PLAYLIST_CLICK]: (e: Playlist) => {
      router.push({
        name: 'playlist',
        query: { id: e.id }
      })
    },

    [EVENTS.ALBUM_CLICK]: (e: { id: number }) => {
      router.push({
        name: 'album',
        query: { id: e.id }
      })
    },

    [EVENTS.SONG_CLICK]: (e: { id: number }) => {
      console.log('播放歌曲:', e.id)
    },
  };

  Object.entries(handlerMap).forEach(([event, handler]) => {
    emitter.on(event, handler)
  })
}