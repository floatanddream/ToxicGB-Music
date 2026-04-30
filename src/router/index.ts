import { useUserStore } from '@/stores/user'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home/index.vue')
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('@/views/Search/index.vue')
  },
  {
    path: '/playlist',
    name: 'playlist',
    component: () => import('@/views/Playlist/index.vue')
  },
  {
    path: '/artist',
    name: 'artist',
    component: () => import('@/views/Artist/index.vue')
  },
  {
    path: '/album',
    name: 'album',
    component: () => import('@/views/Album/index.vue')
  },
  {
    path: '/user',
    name: 'user',
    component: () => import('@/views/User/index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async () => {
  const userStore = useUserStore()
  if (!userStore.loaded) {
    await userStore.fetchUser()
  }
})

export default router
