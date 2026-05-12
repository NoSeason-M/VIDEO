import { createRouter, createWebHashHistory } from 'vue-router'
import VideoPage from '../views/VideoPage.vue'
import ZwPage from '../views/ZwPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/video'
  },
  {
    path: '/video',
    name: 'video',
    component: VideoPage
  },
  {
    path: '/zw',
    name: 'zw',
    component: ZwPage
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
