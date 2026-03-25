import { defineStore } from 'pinia'
import type { UserInfo } from '@/types/user'

export const useAppStore = defineStore('app', () => {
  // 侧边栏收起状态
  const isSidebarCollapsed = false

  // 移动端菜单状态
  const isMobileMenuOpen = false

  // 用户信息
  const user = null as UserInfo | null

  // 搜索关键词
  const searchQuery = ''

  // 主题模式
  const theme = 'light' as 'light' | 'dark'

  return {
    isSidebarCollapsed,
    isMobileMenuOpen,
    user,
    searchQuery,
    theme
  }
})