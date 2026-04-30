import emitter from '@/utils/eventBus'
import { EVENTS } from '@/constants/events'
import type { Song } from '@/types/musicTypes'
import type { playerStore } from '@/stores/playerStore'

export function registerPlayEvents(player: playerStore) {
  const handlerMap: Record<string, (event: unknown) => void> = {
    [EVENTS.PLAY_ALL]: (e: unknown) => {
      const songs = e as Song[]
      player.replaceList(songs)
    },

    [EVENTS.INSERT_NEXT]: (e: unknown) => {
      const song = e as Song
      player.insertNext(song)
    },

    [EVENTS.INSERT_AND_PLAY]: (e: unknown) => {
      const song = e as Song
      player.insertNextAndPlay(song)
    },

    [EVENTS.SWITCH_SONG]: (e: unknown) => {
      const song = e as Song
      player.switchSong(song);
    },
  }

  Object.entries(handlerMap).forEach(([event, handler]) => {
    emitter.on(event, handler)
  })
}
