import { EVENTS } from '@/constants/events'
import emitter from '@/utils/eventBus'
import type { userStore } from '@/stores/user'
import type { Song } from '@/types/musicTypes';

export function registerUserEvent(user : userStore) {
  const handlerMap: Record<string, (event: unknown) => void> = {
    [EVENTS.USER_LOGIN]: () => {
      user.fetchUser();
    },
    [EVENTS.USER_LIKE_MUSIC]: (e: unknown) => {
      user.toggleLikeMusic(e as Song);
    },
  }

  Object.entries(handlerMap).forEach(([event, handler]) => {
    emitter.on(event, handler)
  })
}
