import type { ExternalToast } from 'vue-sonner'

export type ToastApi = {
  success: (message: string, options?: ExternalToast) => void
  error: (message: string, options?: ExternalToast) => void
  message: (message: string, options?: ExternalToast) => void
  warning: (message: string, options?: ExternalToast) => void
  info: (message: string, options?: ExternalToast) => void
}