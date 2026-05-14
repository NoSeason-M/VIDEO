<template>
  <div class="zw-page">
    <h1 class="main-title">zw</h1>
    <div ref="appContainer" id="app"></div>

    <!-- 视频播放弹窗 -->
    <div class="player-modal" id="modal" @click="closeVideo">
      <span class="close-btn" id="closeBtn" @click.stop="closeVideo">&times;</span>
      <video
        class="play-video"
        id="videoPlayer"
        @click.stop="toggleControls"
        ref="videoPlayer"
      ></video>
    </div>

    <!-- 图片预览弹窗 -->
    <div class="image-modal" id="imageModal" @click="closeImage">
      <span class="close-btn" id="imageCloseBtn" @click.stop="closeImage">&times;</span>
      <img class="preview-image" id="imagePreview" ref="imagePreview" alt="预览图片" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIp } from '../store/ip'

// ====================== 仅修改这里 → 可无限添加分类 ======================
const { minioIp } = useIp();
const bucketName = "video";
const rootDir = "17岁自拍";

// 🔥 无限添加分类：想加多少加多少，页面自动无限向下延伸（数量为0则自动隐藏）
const config: Record<string, number> = {
  "1": 100,
  "2": 20,
  "3": 20,
  "4": 20,
  "5": 20,
  "6": 20,
  // 继续加...无限多都可以
};
// ======================================================================

const appContainer = ref<HTMLDivElement>()
const videoPlayer = ref<HTMLVideoElement>()
const imagePreview = ref<HTMLImageElement>()

let scale = 1;
let isDragging = false;
let startX = 0, startY = 0, offsetX = 0, offsetY = 0;

const baseUrl = `http://${minioIp.value}:9000/${bucketName}/${rootDir}/`;

// 检测文件是否存在（通用：支持mp4/jpg/png）
async function checkFileExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 渲染单个分类（支持视频+图片）
async function renderSingleCategory(dirName: string, count: number) {
  if (count <= 0) return;

  let hasValidFile = false;
  interface FileInfo { type: "video" | "image"; url: string; name: string }
  const validFiles: FileInfo[] = [];

  for (let i = 1; i <= count; i++) {
    const mp4FileName = `${i}.mp4`;
    const jpgFileName = `${i}.jpg`;
    const pngFileName = `${i}.png`;
    const mp4FullPath = `${dirName}/${mp4FileName}`;
    const jpgFullPath = `${dirName}/${jpgFileName}`;
    const pngFullPath = `${dirName}/${pngFileName}`;
    const mp4Url = baseUrl + mp4FullPath;
    const jpgUrl = baseUrl + jpgFullPath;
    const pngUrl = baseUrl + pngFullPath;
    const displayName = `${dirName}${i}`;

    const isMp4Exist = await checkFileExists(mp4Url);
    if (isMp4Exist) {
      hasValidFile = true;
      validFiles.push({ type: "video", url: mp4Url, name: `${displayName}.mp4` });
      continue;
    }

    const isJpgExist = await checkFileExists(jpgUrl);
    if (isJpgExist) {
      hasValidFile = true;
      validFiles.push({ type: "image", url: jpgUrl, name: `${displayName}.jpg` });
      continue;
    }

    const isPngExist = await checkFileExists(pngUrl);
    if (isPngExist) {
      hasValidFile = true;
      validFiles.push({ type: "image", url: pngUrl, name: `${displayName}.png` });
    }
  }

  if (!hasValidFile) return;

  const group = document.createElement("div");
  group.className = "folder-group";
  group.innerHTML = `<div class="folder-title">📂 ${dirName}</div>`;

  const grid = document.createElement("div");
  grid.className = "video-grid";
  group.appendChild(grid);

  validFiles.forEach(file => {
    if (file.type === "video") {
      createVideoCard(grid, file.url, file.name);
    } else {
      createImageCard(grid, file.url, file.name);
    }
  });

  appContainer.value!.appendChild(group);
}

// 渲染所有分类
async function renderAll() {
  appContainer.value!.innerHTML = "";

  for (const dirName in config) {
    const count = config[dirName];
    await renderSingleCategory(dirName, count);
  }
}

// 创建视频卡片
function createVideoCard(container: HTMLElement, url: string, name: string) {
  const card = document.createElement("div");
  card.className = "video-card";
  const id = "cover_" + Math.random().toString(36);

  card.innerHTML = `
    <img class="video-cover" id="${id}" alt="视频封面">
    <div class="video-info"><div class="video-name">${name}</div></div>
  `;

  const v = document.createElement("video");
  v.src = url;
  v.crossOrigin = "anonymous" as const;
  v.currentTime = 0.5;
  v.onloadeddata = () => {
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    canvas.getContext("2d")!.drawImage(v, 0, 0);
    (document.getElementById(id) as HTMLImageElement).src = canvas.toDataURL("image/jpeg");
  };

  card.onclick = () => {
    if (!videoPlayer.value) return;
    videoPlayer.value.src = url;
    videoPlayer.value.volume = 0.3;
    videoPlayer.value.loop = true;
    const modal = document.getElementById("modal")!;
    modal.style.display = "flex";
    videoPlayer.value.controls = false;
    const closeBtn = document.getElementById("closeBtn")!;
    closeBtn.style.display = "none";
    videoPlayer.value.play();
  };

  container.appendChild(card);
}

// 创建图片卡片
function createImageCard(container: HTMLElement, url: string, name: string) {
  const card = document.createElement("div");
  card.className = "video-card";

  card.innerHTML = `
    <img class="image-cover" src="${url}" alt="图片封面">
    <div class="video-info"><div class="video-name">${name}</div></div>
  `;

  card.onclick = () => {
    if (!imagePreview.value) return;
    imagePreview.value.src = url;
    const imageModal = document.getElementById("imageModal")!;
    imageModal.style.display = "flex";
    const imageCloseBtn = document.getElementById("imageCloseBtn")!;
    imageCloseBtn.style.display = "block";
    scale = 1;
    imagePreview.value.style.transform = `translate(0, 0) scale(${scale})`;
    offsetX = 0;
    offsetY = 0;
  };

  container.appendChild(card);
}

// 切换视频控件
function toggleControls() {
  if (!videoPlayer.value) return;
  videoPlayer.value.controls = !videoPlayer.value.controls;
  const closeBtn = document.getElementById("closeBtn")!;
  closeBtn.style.display = videoPlayer.value.controls ? "block" : "none";
}

// 关闭视频播放
function closeVideo() {
  const modal = document.getElementById("modal")!;
  modal.style.display = "none";
  if (!videoPlayer.value) return;
  videoPlayer.value.pause();
  videoPlayer.value.src = "";
  videoPlayer.value.controls = false;
  const closeBtn = document.getElementById("closeBtn")!;
  closeBtn.style.display = "none";
}

// 关闭图片预览
function closeImage() {
  const imageModal = document.getElementById("imageModal")!;
  imageModal.style.display = "none";
  const imageCloseBtn = document.getElementById("imageCloseBtn")!;
  imageCloseBtn.style.display = "none";
  scale = 1;
  if (imagePreview.value) {
    imagePreview.value.style.transform = `translate(0, 0) scale(${scale})`;
  }
}

// 图片滚轮缩放
function onImageWheel(e: WheelEvent) {
  e.preventDefault();
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  scale = Math.max(0.5, Math.min(3, scale + delta));
  if (imagePreview.value) {
    imagePreview.value.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }
}

// 图片拖动
function onImageMouseDown(e: MouseEvent) {
  e.preventDefault();
  isDragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
  document.addEventListener('mousemove', onDragMove);
  document.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e: MouseEvent) {
  if (!isDragging) return;
  offsetX = e.clientX - startX;
  offsetY = e.clientY - startY;
  if (imagePreview.value) {
    imagePreview.value.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  }
}

function onDragEnd() {
  isDragging = false;
  document.removeEventListener('mousemove', onDragMove);
  document.removeEventListener('mouseup', onDragEnd);
}

onMounted(() => {
  renderAll();

  const imgPreview = imagePreview.value;
  if (imgPreview) {
    imgPreview.addEventListener('wheel', onImageWheel);
    imgPreview.addEventListener('mousedown', onImageMouseDown);
  }
});
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
.zw-page{
  padding:20px;
  background:#f7f8fa;
  font-family:微软雅黑;
  min-height:100vh;
  height:auto !important;
}
.main-title{text-align:center;margin:30px 0;color:#333;font-size:24px;}

.folder-group{
  margin-bottom:40px;
  width:100%;
  height:auto;
}
.folder-title{
  background:#fff; padding:12px 15px; border-radius:8px;
  margin-bottom:15px; font-size:16px; font-weight:bold;
  border-left:4px solid #409eff; color:#333;
  width:100%;
}

.video-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
  gap:18px;
  width:100%;
  height:auto;
}

.video-card{
  background:#fff; border-radius:10px; overflow:hidden;
  cursor:pointer; transition:0.3s; box-shadow:0 2px 8px rgba(0,0,0,0.05);
  height:auto;
}
.video-card:hover{transform:translateY(-4px);box-shadow:0 8px 20px rgba(0,0,0,0.1);}
.video-cover, .image-cover{
  width:100%;
  height:160px;
  object-fit:contain;
  background:#000;
  display:block;
}
.video-info{padding:12px;}
.video-name{font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

.player-modal{
  position:fixed;inset:0;background:rgba(0,0,0,1);
  display:none;justify-content:center;align-items:center;
  z-index:99999;cursor:pointer;
}
.play-video{
  max-width:100vw;max-height:100vh;
  object-fit:contain;outline:none;
}
.close-btn{
  position:absolute;top:20px;right:30px;
  color:#fff;font-size:36px;z-index:100000;
  display:none;
}

.image-modal{
  position:fixed;inset:0;background:rgba(0,0,0,0.95);
  display:none;justify-content:center;align-items:center;
  z-index:99998;cursor:grab;
}
.image-modal:active{
  cursor:grabbing;
}
.preview-image{
  max-width:90vw;
  max-height:90vh;
  transition:transform 0.2s ease;
  transform-origin:center center;
  position:relative;
}
</style>
