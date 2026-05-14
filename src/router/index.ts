import { createRouter, createWebHashHistory } from 'vue-router'
import LoginPage from '../views/LoginPage.vue'
import VideoPage from '../views/VideoPage.vue'
import ZwPage from '../views/ZwPage.vue'
import PVideo from '../views/P-video.vue'
import YjBasic from '../views/yj-basic.vue'
import Picture from '../views/图片.vue'

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
  },
  {
    path: '/p-video',
    name: 'p-video',
    component: PVideo
  },
  {
    path: '/yj-basic',
    name: 'yj-basic',
    component: YjBasic
  },
  {
    path: '/picture',
    name: 'picture',
    component: Picture
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
