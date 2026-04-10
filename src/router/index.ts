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
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
