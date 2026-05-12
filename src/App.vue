<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import { computed } from 'vue'

const router = useRouter()
const route = useRoute()
const sidebarVisible = ref(true)

const isLoginPage = computed(() => route.path === '/login')

const menuItems = [
  { name: 'video', label: 'video', route: '/video' },
  { name: 'zw', label: 'zw', route: '/zw' },
]

function toggleSidebar() {
  sidebarVisible.value = !sidebarVisible.value
}

function navigateTo(path: string) {
  router.push(path)
}
</script>

<template>
  <div v-if="isLoginPage" class="login-layout">
    <router-view />
  </div>
  <div v-else class="layout">
    <!-- 侧边栏遮罩（手机端） -->
    <div
      v-if="sidebarVisible"
      class="sidebar-overlay"
      @click="toggleSidebar"
    ></div>

    <!-- 侧边栏 -->
    <aside class="sidebar" :class="{ collapsed: !sidebarVisible }">
      <div class="sidebar-header">
        <span class="sidebar-title">目录</span>
        <button class="close-btn-sidebar" @click="toggleSidebar">&times;</button>
      </div>
      <nav class="sidebar-nav">
        <div
          v-for="item in menuItems"
          :key="item.name"
          class="nav-item"
          :class="{ active: route.path === item.route }"
          @click="navigateTo(item.route)"
        >
          {{ item.label }}
        </div>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content" :class="{ expanded: !sidebarVisible }">
      <!-- 顶部栏（侧边栏隐藏时显示展开按钮） -->
      <div class="top-bar">
        <button v-if="!sidebarVisible" class="menu-toggle" @click="toggleSidebar">
          &#9776;
        </button>
      </div>
      <router-view />
    </main>
  </div>
</template>

<style>
/* 全局重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
}

#app {
  width: 100%;
  max-width: 100%;
  margin: 0;
  text-align: left;
  border: none;
  min-height: 100vh;
  display: block;
}
</style>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  position: relative;
}

.login-layout {
  width: 100%;
  height: 100vh;
}

/* 侧边栏遮罩 */
.sidebar-overlay {
  display: none;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  min-width: 220px;
  background: #fff;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease, min-width 0.3s ease;
  overflow: hidden;
  position: relative;
}

.sidebar.collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
}

.sidebar-title {
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

.close-btn-sidebar {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #000;
  padding: 0 4px;
  line-height: 1;
}

.sidebar-nav {
  padding: 8px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  padding: 12px 16px;
  cursor: pointer;
  color: #000;
  font-size: 15px;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.nav-item:hover {
  background-color: #f0f0f0;
}

.nav-item.active {
  background-color: #e8e8e8;
  font-weight: bold;
}

/* 主内容区 */
.main-content {
  flex: 1;
  transition: margin-left 0.3s ease;
  min-width: 0;
}

/* 顶部栏 */
.top-bar {
  padding: 8px 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.menu-toggle {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #333;
  padding: 4px 8px;
}

.menu-toggle:hover {
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>
