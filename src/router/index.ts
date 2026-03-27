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
    component: () => import('@/views/Search.vue')
  },
  {
    path: '/player',
    name: 'Player',
    component: () => import('@/views/Player.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
