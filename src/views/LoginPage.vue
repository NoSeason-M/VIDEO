<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-container">
      <div class="login-card">
        <div class="logo-section">
          <div class="logo-icon">
            <svg viewBox="0 0 60 60" width="60" height="60">
              <circle cx="30" cy="30" r="28" fill="none" stroke="currentColor" stroke-width="2" />
              <polygon points="24,18 24,42 42,30" fill="currentColor" />
            </svg>
          </div>
          <h1 class="login-title">VIDEO</h1>
          <p class="login-subtitle">视频管理平台</p>
        </div>

        <div class="form-section">
          <div class="input-group">
            <label class="input-label">账号</label>
            <div class="input-wrapper static-account">
              <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor" />
              </svg>
              <span class="account-text">yj</span>
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">密码</label>
            <div class="input-wrapper" :class="{ 'input-focus': focusField === 'password' }">
              <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" fill="currentColor" />
              </svg>
              <input
                v-model="password"
                type="password"
                placeholder="请输入密码"
                @focus="focusField = 'password'"
                @blur="focusField = ''"
                @keyup.enter="handleLogin"
              />
            </div>
          </div>

          <div class="input-group">
            <label class="input-label">IP 地址</label>
            <div class="input-wrapper" :class="{ 'input-focus': focusField === 'ip' }">
              <svg class="input-icon" viewBox="0 0 24 24" width="18" height="18">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor" />
              </svg>
              <input
                v-model="ipAddress"
                type="text"
                placeholder="请输入 MinIO IP 地址"
                @focus="focusField = 'ip'"
                @blur="focusField = ''"
                @keyup.enter="handleLogin"
              />
            </div>
          </div>

          <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>

          <button class="login-btn" @click="handleLogin">
            <span class="btn-text">登 录</span>
            <span class="btn-loader" v-if="loading"></span>
          </button>
        </div>
      </div>

      <p class="version-text">v2.0.0</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useIp } from '../store/ip'

const router = useRouter()
const { setIp } = useIp()

const password = ref('')
const ipAddress = ref('')
const errorMsg = ref('')
const loading = ref(false)
const focusField = ref('')

function handleLogin() {
  errorMsg.value = ''

  if (!password.value.trim()) {
    errorMsg.value = '请输入密码'
    return
  }
  if (!ipAddress.value.trim()) {
    errorMsg.value = '请输入 IP 地址'
    return
  }

  if (password.value.trim() !== '20251001') {
    errorMsg.value = '密码错误'
    return
  }

  loading.value = true

  setIp(ipAddress.value.trim())

  setTimeout(() => {
    loading.value = false
    router.push('/video')
  }, 600)
}
</script>

<style scoped>
.login-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  inset: -50%;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  z-index: 0;
}

.login-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(72, 49, 212, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(139, 92, 246, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 80%, rgba(59, 130, 246, 0.2) 0%, transparent 50%);
  animation: bgShift 12s ease-in-out infinite alternate;
}

@keyframes bgShift {
  0% { transform: scale(1) rotate(0deg); }
  100% { transform: scale(1.1) rotate(3deg); }
}

.login-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-card {
  width: 400px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 25px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  padding: 48px 40px 40px;
  animation: cardIn 0.6s ease-out;
}

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.logo-section {
  text-align: center;
  margin-bottom: 36px;
}

.logo-icon {
  color: #a78bfa;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 20px rgba(167, 139, 250, 0.4));
  animation: pulseGlow 3s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(167, 139, 250, 0.4)); }
  50% { filter: drop-shadow(0 0 30px rgba(167, 139, 250, 0.7)); }
}

.login-title {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: 8px;
  background: linear-gradient(135deg, #c4b5fd, #818cf8, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.login-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 4px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  letter-spacing: 1px;
  padding-left: 4px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 14px;
  transition: all 0.3s ease;
}

.input-wrapper:hover {
  background: rgba(255, 255, 255, 0.09);
  border-color: rgba(255, 255, 255, 0.18);
}

.input-wrapper.input-focus {
  background: rgba(255, 255, 255, 0.1);
  border-color: #818cf8;
  box-shadow: 0 0 20px rgba(129, 140, 248, 0.15);
}

.input-icon {
  color: rgba(255, 255, 255, 0.3);
  flex-shrink: 0;
  transition: color 0.3s ease;
}

.input-focus .input-icon {
  color: #818cf8;
}

.input-wrapper input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 15px;
  padding: 14px 0;
  font-family: inherit;
}

.input-wrapper input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.account-text {
  flex: 1;
  color: #fff;
  font-size: 15px;
  padding: 14px 0;
  letter-spacing: 1px;
}

.static-account {
  cursor: default;
  border-color: rgba(129, 140, 248, 0.3);
}

.error-msg {
  color: #f87171;
  font-size: 13px;
  text-align: center;
  padding: 2px 0;
}

.login-btn {
  position: relative;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 6px;
  cursor: pointer;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
  transition: all 0.3s ease;
  margin-top: 4px;
  font-family: inherit;
  overflow: hidden;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(99, 102, 241, 0.5);
}

.login-btn:active {
  transform: translateY(0);
}

.btn-text {
  opacity: 1;
  transition: opacity 0.3s;
}

.btn-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  margin: -11px 0 0 -11px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.login-btn:has(.btn-loader) .btn-text {
  opacity: 0;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.version-text {
  margin-top: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 2px;
}
</style>
