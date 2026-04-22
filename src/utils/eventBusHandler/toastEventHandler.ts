import emitter from '@/utils/eventBus'
import { MESSAGE_TYPE } from '@/constants/messages'
import { toast } from 'vue-sonner'

export function registerToastMessages() {
  const handlerMap: Record<string, (event: unknown) => void> = {
    [MESSAGE_TYPE.TOAST_SUSSESS]: (e: unknown) => {
      toast.success(e as string,)
    },
    [MESSAGE_TYPE.TOAST_ERROR]: (e: unknown) => {
      toast.error(e as string)
    },
    [MESSAGE_TYPE.TOAST_WARNING]: (e: unknown) => {
      toast.warning(e as string)
    },
    [MESSAGE_TYPE.TOAST_INFO]: (e: unknown) => {
      toast.info(e as string)
    },
  }

  Object.entries(handlerMap).forEach(([event, handler]) => {
    emitter.on(event, handler)
  })
}
