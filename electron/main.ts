import { app, BrowserWindow, dialog } from 'electron'
import path from 'node:path'

// ===================== 修复 __dirname 未定义（ESM 兼容）=====================
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import pkg from 'electron-updater'
const { autoUpdater } = pkg

// 定义兼容 ES 模块的 __filename 和 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// ======================================================================

process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : path.join(process.env.DIST, '../public')

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(process.env.DIST!, 'index.html'))
  }
}

// 👇 新增：启动后检测更新（延迟3秒，等窗口加载完成）
app.whenReady().then(() => {
  createWindow()
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify()
  }, 3000)
})

// 👇 新增：自动更新事件监听
// 发现新版本
autoUpdater.on('update-available', (info) => {
  dialog.showMessageBox({
    type: 'info',
    title: '发现新版本',
    message: `当前版本：${app.getVersion()}\n最新版本：${info.version}`,
    detail: '正在自动下载更新，请稍候...'
  })
})

// 没有新版本
autoUpdater.on('update-not-available', () => {
  // 静默处理，不弹窗
})

// 下载进度（可选，你也可以把进度传到渲染进程显示）
autoUpdater.on('download-progress', (progress) => {
  console.log('更新下载进度：', progress.percent.toFixed(1) + '%')
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-progress', {
      percent: Math.round(progress.percent),
      transferred: (progress.transferred / 1024 / 1024).toFixed(2),
      total: (progress.total / 1024 / 1024).toFixed(2),
      speed: (progress.bytesPerSecond / 1024 / 1024).toFixed(2)
    })
  }
})

// 下载完成，询问用户重启安装
autoUpdater.on('update-downloaded', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-finish')
  }
  dialog.showMessageBox({
    type: 'info',
    title: '更新下载完成',
    message: '新版本已下载完成，是否立即重启安装？',
    buttons: ['立即重启', '稍后再说']
  }).then(res => {
    if (res.response === 0) {
      autoUpdater.quitAndInstall()
    }
  })
})

// 更新错误
autoUpdater.on('error', (err) => {
  console.error('自动更新失败：', err)
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('update-error', err.message)
  }
})



app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    mainWindow = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
