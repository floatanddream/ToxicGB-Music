import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import type { Router } from 'vue-router'
import type { Album, Artist, Playlist, Song } from '@/types/musicTypes'
import type { playerStore } from '@/stores/playerStore';

export function registerClickEvents(router: Router) {

  const handlerMap: Record<string, (event: unknown) => void> = {
    [EVENTS.ARTIST_CLICK]: (e: unknown) => {
      const artist = e as Artist;
      router.push({
        name: 'artist',
        query: { id: artist.id }
      })
    },

    [EVENTS.PLAYLIST_CLICK]: (e: unknown) => {
      const playlist = e as Playlist;
      router.push({
        name: 'playlist',
        query: { id: playlist.id }
      })
    },

    [EVENTS.ALBUM_CLICK]: (e: unknown) => {
      const album = e as Album;
      router.push({
        name: 'album',
        query: { id: album.id }
      })
    },

    [EVENTS.SONG_CLICK]: (e: unknown) => {
      const song = e as { id: number };
      console.log('播放歌曲:', song.id)
    },
  };

  Object.entries(handlerMap).forEach(([event, handler]) => {
    emitter.on(event, handler)
  });
}

export function registerPlayEvents(player : playerStore) {
  const handlerMap: Record<string, (event: unknown) => void> ={
    [EVENTS.PLAY_ALL]:(e: unknown) => {
       const songs = e as Song[];
      player.replaceList(songs); // 替换播放列表
    },
  };
  Object.entries(handlerMap).forEach(([event, handler]) => {
    emitter.on(event, handler)
  })
}
