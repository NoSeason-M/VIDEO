<template>
  <div class="p-video-page">
    <h1 class="main-title">P-video</h1>
    <div ref="appContainer" id="app"></div>

    <div class="player-modal" id="modal" @click="closeVideo">
      <span class="close-btn" id="closeBtn" @click.stop="closeVideo">&times;</span>
      <video
        class="play-video"
        id="videoPlayer"
        @click.stop="toggleControls"
        ref="videoPlayer"
      ></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIp } from '../store/ip';

// ====================== 仅修改这里 → 可无限添加分类 ======================
const { minioIp } = useIp();
const bucketName = "video";
const rootDir = "PIAN";

// 🔥 无限添加分类：想加多少加多少，页面自动无限向下延伸
const config: Record<string, number> = {
  "裸舞": 20,
  "自慰": 20,
  "情侣": 20,
  "约炮": 20,
  "擦边": 20,
  "自拍": 20,
  "黑料": 30,
  "正常": 30,
  // 继续加...无限多都可以
};
// ======================================================================

const appContainer = ref<HTMLDivElement>()
const videoPlayer = ref<HTMLVideoElement>()

const baseUrl = `http://${minioIp.value}:9000/${bucketName}/${rootDir}/`;

// 检测视频文件是否存在（MinIO中）
async function checkVideoExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// 渲染单个分类（仅当有有效视频时）
async function renderSingleCategory(dirName: string, count: number) {
  // 第一步：数量≤0直接跳过
  if (count <= 0) return;

  // 第二步：检测该分类下是否有至少一个有效视频
  let hasValidVideo = false;
  const validVideos: { url: string; name: string }[] = [];

  for (let i = 1; i <= count; i++) {
    const fileName = `${i}.mp4`;
    const fullPath = `${dirName}/${fileName}`;
    const videoUrl = baseUrl + fullPath;

    const exists = await checkVideoExists(videoUrl);
    if (exists) {
      hasValidVideo = true;
      validVideos.push({ url: videoUrl, name: `${dirName}${i}.mp4` });
    }
  }

  // 无有效视频则跳过渲染
  if (!hasValidVideo) return;

  // 有有效视频则渲染分类
  const group = document.createElement("div");
  group.className = "folder-group";
  group.innerHTML = `<div class="folder-title">📂 ${dirName}</div>`;

  const grid = document.createElement("div");
  grid.className = "video-grid";
  group.appendChild(grid);

  validVideos.forEach(video => {
    createVideoCard(grid, video.url, video.name);
  });

  appContainer.value!.appendChild(group);
}

// 渲染所有分类：自动隐藏无视频的分类
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
    <img class="video-cover" id="${id}" alt="封面">
    <div class="video-info"><div class="video-name">${name}</div></div>
  `;

  const v = document.createElement("video");
  v.src = url;
  v.crossOrigin = "anonymous" as const;
  v.currentTime = 2.2;
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
    videoPlayer.value.volume = 0.1;
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

// 切换控件显示/隐藏（对齐video.html的切换逻辑）
function toggleControls() {
  if (!videoPlayer.value) return;
  videoPlayer.value.controls = !videoPlayer.value.controls;
  const closeBtn = document.getElementById("closeBtn")!;
  closeBtn.style.display = videoPlayer.value.controls ? "block" : "none";
}

// 关闭播放
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

onMounted(() => {
  renderAll();
});
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
.p-video-page{
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
.video-cover{
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
</style>
