import { EVENTS } from '@/constants/events'
import emitter from '@/utils/eventBus'
import type { userStore } from '@/stores/user'

export function registerUserEvent(user : userStore) {
  const handlerMap: Record<string, (event: unknown) => void> = {
    [EVENTS.USER_LOGIN]: () => {
      user.fetchUser();
    },
  }

  Object.entries(handlerMap).forEach(([event, handler]) => {
    emitter.on(event, handler)
  })
}
