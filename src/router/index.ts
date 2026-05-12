import { createRouter, createWebHashHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import VideoPage from '../views/VideoPage.vue'
import ZwPage from '../views/ZwPage.vue'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage
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
