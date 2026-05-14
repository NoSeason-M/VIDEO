# README

## 项目概述

Vue 3 + TypeScript + Electron 桌面应用项目。

### 快速开始

```bash
# 1. 安装 pnpm（如已安装可跳过）
npm install -g pnpm

# 2. 安装依赖
pnpm install

# 3. 启动开发服务器 + Electron 窗口
pnpm dev
```

> 要求 Node.js >= 18。首次安装 Electron 依赖较大会稍等片刻。

## 技术栈

| 技术 | 用途 |
|---|---|
| **Vue 3** (^3.5.32) | 前端 UI 框架（Composition API） |
| **TypeScript** (~6.0.2) | 类型安全开发 |
| **Vite** (^8.0.10) | 构建工具与开发服务器 |
| **Electron** (^42.0.1) | 桌面应用壳 |
| **electron-builder** (^26.8.1) | 桌面应用打包 |
| **vite-plugin-electron** (^0.29.1) | Vite 中编译 Electron 主进程 / preload |
| **vite-plugin-electron-renderer** (^0.14.7) | 渲染进程 Node.js 模块兼容 |

## 目录结构

```
video/
├── electron/
│   ├── main.ts              # Electron 主进程入口
│   └── preload.ts           # 预加载脚本（contextBridge）
├── src/
│   ├── App.vue              # 根组件（含侧边栏导航 + router-view）
│   ├── main.ts              # Vue 应用入口
│   ├── style.css            # 全局样式
│   ├── electron.d.ts        # electronAPI 类型声明
│   ├── router/
│   │   └── index.ts         # Vue Router 配置（/login、/video、/zw、/p-video、/yj-basic、/picture 路由）
│   ├── views/
│   │   ├── LoginPage.vue    # 登录页面（深色玻璃拟态风格）
│   │   ├── VideoPage.vue    # 视频页面（源自 video.html）
│   │   ├── ZwPage.vue       # 视频+图片页面（源自 zw.html）
│   │   ├── P-video.vue      # 视频页面（源自 P-video.html，PIAN目录）
│   │   ├── yj-basic.vue     # 图片+音乐页面（源自 yj-basic.html）
│   │   └── 图片.vue          # 图片页面（源自 图片.html）
│   ├── store/
│   │   └── ip.ts              # 共享 IP 地址状态（登录页设置，各页面读取）
│   ├── assets/              # 静态资源
├── public/                  # 公共资源
├── index.html               # HTML 入口
├── vite.config.ts           # Vite + Electron 插件配置
├── tsconfig.json            # TS 配置（引用 app/node 两个子配置）
├── tsconfig.app.json        # src 目录 TS 配置
├── tsconfig.node.json       # vite.config.ts + electron 目录 TS 配置
└── package.json             # 依赖与脚本
```

## 依赖清单

### 运行时依赖

- **vue** ^3.5.32
- **vue-router** ^4.6.4 — 路由管理
- **electron-updater** ^6.8.3 — 自动更新（通过 GitHub Releases 发布新版本）

### 开发依赖

- **@vitejs/plugin-vue** ^6.0.6 — Vite Vue 插件
- **vue-tsc** ^3.2.7 — Vue TypeScript 类型检查
- **@vue/tsconfig** ^0.9.1 — Vue TS 配置预设
- **typescript** ~6.0.2
- **vite** ^8.0.10
- **electron** ^42.0.1
- **electron-builder** ^26.8.1
- **vite-plugin-electron** ^0.29.1
- **vite-plugin-electron-renderer** ^0.14.7
- **esbuild** ^0.28.0
- **concurrently** ^9.2.1
- **cross-env** ^10.1.0
- **wait-on** ^9.0.5
- **@types/node** ^24.12.2

## 关键配置说明

### vite.config.ts

使用 `vite-plugin-electron` 将 `electron/main.ts` 和 `electron/preload.ts` 分别编译到 `dist-electron/` 目录。开发模式下自动启动 Electron 窗口并加载 Vite 开发服务器。

### package.json

- `"main": "dist-electron/main.js"` — Electron 入口指向编译后的主进程文件
- `"build"` 字段 — electron-builder 打包配置，输出到 `release/` 目录

### electron/main.ts

- 开发模式：通过 `process.env.VITE_DEV_SERVER_URL` 加载 Vite 开发服务器
- 生产模式：加载 `dist/index.html`
- 启用了 `contextIsolation: true` 和 `nodeIntegration: false`，保证安全性
- macOS 支持 `activate` 事件（点击 Dock 图标重新创建窗口）

### electron/preload.ts

通过 `contextBridge.exposeInMainWorld` 向渲染进程暴露 `window.electronAPI`：

- `platform` — 当前操作系统平台
- `send(channel, ...args)` — 向主进程发送消息（单向）
- `on(channel, callback)` — 监听主进程消息
- `invoke(channel, ...args)` — 向主进程发送消息并等待返回（双向 IPC）

### 自动更新

项目使用 `electron-updater` 配合 GitHub Releases 实现桌面应用自动更新。

**发布配置（package.json）：**

- `appId`: `com.video.app`
- `productName`: `Video`
- 发布提供商：`github`，仓库 `NoSeason-M/VIDEO`
- 打包格式：Windows NSIS、macOS DMG、Linux AppImage

**更新流程：**

1. 应用启动 3 秒后，主进程调用 `autoUpdater.checkForUpdatesAndNotify()` 检查 GitHub Releases 是否有新版本
2. 检测到新版本 → 弹出对话框提示用户（显示当前版本与新版本号），自动后台下载
3. 下载完成 → 弹出对话框询问「立即重启」或「稍后再说」
4. 用户点击立即重启 → `autoUpdater.quitAndInstall()` 完成更新安装

**发版流程：**

每次发布新版本时：

```bash
# 1. 更新 package.json 中的 version 字段
# 2. 构建并打包
pnpm run electron:build
# 3. 在 GitHub 创建 Release，上传 release/ 目录下的安装包
```

> 注意：`electron-updater` 已在 `vite.config.ts` 中配置为外部模块，不会被打包到 Vite 产物中。版本号从 `package.json` 读取，每次发版前需手动更新。

## 可用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 启动 Vite 开发服务器 + Electron 窗口（支持热重载） |
| `npm run build` | TypeScript 类型检查 + 构建 Vue 应用和 Electron（输出到 dist/ 和 dist-electron/） |
| `npm run preview` | 预览构建后的 Vue 应用 |
| `npm run electron:build` | 构建后通过 electron-builder 打包桌面安装包（Windows NSIS / macOS DMG / Linux AppImage） |

## 启动开发

```bash
npm run dev
```

## 打包构建

```bash
npm run electron:build
```

打包产物位于 `release/` 目录。

## 页面路由

项目使用 Vue Router 管理多页面切换：

| 路由 | 页面 | 说明 |
|---|---|---|
| `/` | — | 自动重定向到 `/login` |
| `/login` | LoginPage | 登录页面，输入密码和 IP 地址后进入视频页。账号固定为 yj，密码 20251001 |
| `/video` | VideoPage | 视频播放页面（源自 `video.html`），从 MinIO 加载 .mp4 文件，支持封面生成、全屏播放、音量10%、循环播放 |
| `/zw` | ZwPage | 视频+图片页面（源自 `zw.html`），从 MinIO 加载 .mp4/.jpg/.png 文件，保留图片预览缩放与拖拽功能，默认音量30% |
| `/p-video` | P-video | 视频页面（源自 `P-video.html`），从 `video/PIAN/` 加载 .mp4 文件，支持封面生成、自动重播 |
| `/yj-basic` | yj-basic | 图片+音乐页面（源自 `yj-basic.html`），从 `picture-yj/yj/` 加载图片，带背景音乐播放器（播放/暂停、音量调节、单曲/列表循环） |
| `/picture` | 图片 | 图片页面（源自 `图片.html`），从 `video/图片/` 加载图片，支持滚轮缩放、鼠标拖拽平移 |

### 共享 IP 地址

IP 地址通过 `src/store/ip.ts` 全局共享：

1. 登录页输入 MinIO IP 地址后点击登录，IP 存入共享状态
2. VideoPage、ZwPage 等页面从 `useIp()` 读取 `minioIp` 构建资源 URL
3. 切换 IP 时只需重新登录，输入新 IP 即可

### 侧边栏导航

- 左侧白色背景侧边栏，黑色文字
- 点击右上角 **×** 隐藏侧边栏
- 隐藏后左上角显示 **☰** 按钮，点击可重新展开
- 点击菜单项通过路由切换页面

### 扩展页面

如需添加新页面：
1. 在 `src/views/` 下新建 `.vue` 组件
2. 在 `src/router/index.ts` 中添加对应路由
3. 在 `src/App.vue` 的 `menuItems` 中添加菜单项
