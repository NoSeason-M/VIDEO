<template>
  <div class="picture-page">
    <h1 class="main-title">抖音图片库</h1>
    <div ref="appContainer" id="app"></div>

    <div class="viewer-modal" id="modal" ref="modalEl">
      <span class="close-btn" id="closeBtn" @click="closeImage">&times;</span>
      <img class="view-image" id="imageViewer" ref="imageViewer">
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIp } from '../store/ip';

const { minioIp } = useIp();
const bucketName = "video";
const rootDir = "图片";

const config: Record<string, number> = {
  "裸照": 30,
  "擦边": 30,
  "D玉欣和地铁女孩": 30,
};

const imageExt = "jpg";
const appContainer = ref<HTMLDivElement>()
const imageViewer = ref<HTMLImageElement>()
const modalEl = ref<HTMLDivElement>()

const baseUrl = `http://${minioIp.value}:9000/${bucketName}/${rootDir}/`;

let scale = 1;
let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;
const minScale = 1;
const maxScale = 5;
const scaleStep = 0.1;

function renderAll() {
  for (const dirName in config) {
    const count = config[dirName];
    const group = document.createElement("div");
    group.className = "folder-group";
    group.innerHTML = `<div class="folder-title">📂 ${dirName}</div>`;

    const grid = document.createElement("div");
    grid.className = "image-grid";
    group.appendChild(grid);

    for (let i = 1; i <= count; i++) {
      const fileName = `${i}.${imageExt}`;
      const fullPath = `${dirName}/${fileName}`;
      const imageUrl = baseUrl + fullPath;
      const displayName = `${dirName}${i}.${imageExt}`;
      createImageCard(grid, imageUrl, displayName);
    }
    appContainer.value!.appendChild(group);
  }
}

function createImageCard(container: HTMLElement, url: string, name: string) {
  const card = document.createElement("div");
  card.className = "image-card";

  card.innerHTML = `
    <img class="image-cover" src="${url}" alt="${name}">
    <div class="image-info"><div class="image-name">${name}</div></div>
  `;

  const imgElement = card.querySelector('.image-cover') as HTMLImageElement;
  imgElement.onerror = function() {
    card.style.display = 'none';
  };

  card.onclick = () => {
    scale = 1;
    translateX = 0;
    translateY = 0;
    const viewer = imageViewer.value!;
    viewer.style.transform = `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${scale})`;
    viewer.src = url;
    viewer.alt = name;
    modalEl.value!.style.display = "flex";
  };

  container.appendChild(card);
}

function closeImage() {
  modalEl.value!.style.display = "none";
  imageViewer.value!.src = "";
  scale = 1;
  translateX = 0;
  translateY = 0;
}

onMounted(() => {
  renderAll();

  const modal = modalEl.value!;
  const viewer = imageViewer.value!;
  const closeBtn = document.getElementById("closeBtn")!;

  // 点击背景关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeImage();
    }
  });

  closeBtn.addEventListener('click', closeImage);

  // 滚轮缩放
  modal.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      scale = Math.min(scale + scaleStep, maxScale);
    } else {
      scale = Math.max(scale - scaleStep, minScale);
    }
    viewer.style.transform = `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }, { passive: false });

  // 鼠标拖动
  viewer.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    viewer.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    viewer.style.transform = `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${scale})`;
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    viewer.style.cursor = 'grab';
  });

  document.addEventListener('mouseleave', () => {
    isDragging = false;
    viewer.style.cursor = 'grab';
  });
});
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
.picture-page{
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

.image-grid{
  display:grid;
  grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
  gap:18px;
  width:100%;
  height:auto;
}

.image-card{
  background:#fff; border-radius:10px; overflow:hidden;
  cursor:pointer; transition:0.3s; box-shadow:0 2px 8px rgba(0,0,0,0.05);
  height:auto;
}
.image-card:hover{transform:translateY(-4px);box-shadow:0 8px 20px rgba(0,0,0,0.1);}
.image-cover{
  width:100%;
  height:160px;
  object-fit:contain;
  background:#f5f5f5;
  display:block;
}
.image-info{padding:12px;}
.image-name{font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

.viewer-modal{
  position:fixed;inset:0;background:rgba(0,0,0,1);
  display:none;justify-content:center;align-items:center;
  z-index:99999;
}
.view-image{
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width:90vw;
  max-height:90vh;
  object-fit:contain;
  outline:none;
  cursor: grab;
  transition: cursor 0.2s ease;
  user-select: none;
}
.view-image:active {
  cursor: grabbing;
}
.close-btn{
  position:absolute;top:20px;right:30px;
  color:#fff;font-size:36px;z-index:100000;
  display:block;
  cursor: pointer;
}
</style>
