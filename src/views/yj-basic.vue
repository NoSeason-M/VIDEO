<template>
  <div class="yj-basic-page">
    <h1 class="main-title">yj--我想以此来记录我认识的喻婕</h1>

    <div class="music-control">
      <select class="music-select" id="musicSelect"></select>
      <button class="music-btn" id="toggleMusicBtn" @click="toggleMusic">点击播放</button>

      <div class="volume-control">
        <span class="volume-text">音量</span>
        <input type="range" class="volume-slider" id="volumeSlider" min="0" max="100" value="50">
      </div>

      <select id="playMode" class="play-mode">
        <option value="single">单曲循环</option>
        <option value="list">列表循环</option>
      </select>

      <span class="music-tip">🎵 音乐：picture-yj/yj/ 目录 | 无损播放</span>
    </div>

    <div ref="appContainer" id="app"></div>

    <div class="viewer-modal" id="modal" @click="closeImage">
      <span class="close-btn" @click.stop="closeImage">&times;</span>
      <img class="view-image" id="imageViewer" ref="imageViewer">
    </div>

    <audio ref="audioEl" id="backgroundMusic"></audio>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIp } from '../store/ip';

// ====================== 你只需要改这里 ======================
const { minioIp } = useIp();
const bucketName = "picture-yj";
const rootDir = "yj";

// 音乐列表（可无限加）
const musicList = [
  { name: "春娇与志明", file: "1.mp3" },
  { name: "the way i still love you", file: "2.mp3" },
];
// ==========================================================

const config: Record<string, number> = {
  "25.国庆，是我们重相识的一天，我很感谢直播，和张宇辰，不然我觉得我不会再和你有所交集，这一刻我觉得我很幸运":1,
  "你很想去南京，是我对不起你，导致你没有考到理想的地方，这次转本要加油，一起加油":1,
  "25.10.3  第一次一起看的电影（猪猪侠），感觉有点小孩子的电影，可惜票找不到了": 1,
  "其实我很后悔，因为太想见你，当时的我还不是很优秀，很好看就去见你了，非常后悔":0,
  "如果我要是在我状态很好，优秀的时候去见你，你是不是就不会突然这样了": 0,
  "是我太心急了，好后悔":0,
  "25.11.7  你在抖音发了一张伤心的动图，我知道了每当天气不好 下雨的时候，你的心情会非常不好":1,
  "25.11.15---25.11.18  去重庆比赛，拍了些重庆的照片给你看，感觉重庆的夜景很美，希望有机会能一起去": 5,
  "25.11.16   和你打了视频，带你看了看重庆，很高兴，但是可惜你要乐跑":0,
  "25.11.18  在重庆买了些吃的，听说你最近睡眠不好，偶然听见店员说这个花茶对睡眠好，给你买了一些": 4,
  "25.11月------  为了能和你说上话，每天给你拍了些风景😂，哎，是有点傻傻的，但是确实想你":3,
  "26.1.2    爬上了武功山，然后分享给了你，其实山顶没有爬上去🫠🙃，太冷了  然后在抖音上找了个山顶的图片，忘记截图了，把抖音露出来了，后面才发现，在你面前真的太丢人了🙃 我服了":6,
  "图":30,
  // 继续加...无限多都可以
};

const imageExt = "jpg";
const appContainer = ref<HTMLDivElement>()
const imageViewer = ref<HTMLImageElement>()
const audioEl = ref<HTMLAudioElement>()

const baseUrl = `http://${minioIp.value}:9000/${bucketName}/${rootDir}/`;

let currentMusicIndex = 0;

function toggleMusic() {
  const audio = audioEl.value;
  const toggleBtn = document.getElementById("toggleMusicBtn") as HTMLButtonElement;
  if (!audio) return;
  if (audio.paused) {
    audio.play().then(() => {
      toggleBtn.textContent = "暂停";
    }).catch(err => {
      alert("播放失败：检查音乐是否存在\n" + err.message);
    });
  } else {
    audio.pause();
    toggleBtn.textContent = "播放";
  }
}

function loadMusic(index: number) {
  if (musicList.length === 0) return;
  currentMusicIndex = index;
  const select = document.getElementById("musicSelect") as HTMLSelectElement;
  if (select) select.value = String(index);
  const audio = audioEl.value;
  if (!audio) return;
  const file = musicList[index].file;
  audio.src = baseUrl + file;
}

function playNext() {
  if (musicList.length <= 1) return;
  let nextIdx = currentMusicIndex + 1;
  if (nextIdx >= musicList.length) nextIdx = 0;
  loadMusic(nextIdx);
  const audio = audioEl.value;
  if (audio) audio.play().catch(console.warn);
  const toggleBtn = document.getElementById("toggleMusicBtn") as HTMLButtonElement;
  toggleBtn.textContent = "暂停";
}

function initMusicList() {
  const select = document.getElementById("musicSelect") as HTMLSelectElement;
  if (!select) return;
  select.innerHTML = "";
  musicList.forEach((m, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = m.name;
    select.appendChild(opt);
  });
  loadMusic(0);
}

function renderAll() {
  for (const dir in config) {
    const count = config[dir];
    if (count <= 0) continue;
    const g = document.createElement("div");
    g.className = "folder-group";
    g.innerHTML = `<div class="folder-title">📂 ${dir}</div>`;
    const grid = document.createElement("div");
    grid.className = "image-grid";
    g.appendChild(grid);

    for (let i = 1; i <= count; i++) {
      const url = baseUrl + dir + "/" + i + "." + imageExt;
      const card = document.createElement("div");
      card.className = "image-card";
      card.innerHTML = `<img class="image-cover" src="${url}"><div class="image-info"><div class="image-name">${dir}${i}</div></div>`;
      card.onclick = () => {
        const viewer = document.getElementById("imageViewer") as HTMLImageElement;
        viewer.src = url;
        document.getElementById("modal")!.style.display = "flex";
      };
      grid.appendChild(card);
    }
    appContainer.value!.appendChild(g);
  }
}

function closeImage() {
  document.getElementById("modal")!.style.display = "none";
}

function closeImageStop() {
  closeImage();
}

onMounted(() => {
  const audio = audioEl.value!;

  // 初始化音乐列表
  initMusicList();

  // 音乐播放结束
  audio.onended = () => {
    const playMode = document.getElementById("playMode") as HTMLSelectElement;
    const mode = playMode.value;
    if (mode === "list") {
      playNext();
    } else {
      audio.play();
    }
  };

  // 音量
  const volumeSlider = document.getElementById("volumeSlider") as HTMLInputElement;
  volumeSlider.oninput = () => {
    audio.volume = volumeSlider.valueAsNumber / 100;
  };

  // 手动切歌
  const musicSelect = document.getElementById("musicSelect") as HTMLSelectElement;
  musicSelect.onchange = () => {
    loadMusic(Number(musicSelect.value));
    audio.play().catch(console.warn);
    const toggleBtn = document.getElementById("toggleMusicBtn") as HTMLButtonElement;
    toggleBtn.textContent = "暂停";
  };

  renderAll();
});
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
.yj-basic-page{
  padding:20px;
  background:#f7f8fa;
  font-family:微软雅黑;
  min-height:100vh;
  height:auto !important;
}
.main-title{text-align:center;margin:30px 0;color:#333;font-size:24px;}

.music-control{
  background:#fff;
  padding:15px 20px;
  border-radius:8px;
  margin:0 auto 30px;
  max-width:850px;
  display:flex;
  align-items:center;
  justify-content: center;
  gap:15px;
  flex-wrap:wrap;
  box-shadow:0 2px 8px rgba(0,0,0,0.05);
}
.music-btn{
  background:#409eff;
  color:#fff;
  border:none;
  padding:10px 20px;
  border-radius:6px;
  cursor:pointer;
  font-size:14px;
  transition:0.2s;
}
.music-btn:hover{
  background:#337ecc;
}
.music-select{
  padding:8px 12px;
  border:1px solid #e6e6e6;
  border-radius:6px;
  font-size:14px;
  color:#333;
  outline:none;
  cursor:pointer;
  min-width:180px;
}
.music-select:focus{
  border-color:#409eff;
}
.play-mode{
  padding:8px 12px;
  border:1px solid #e6e6e6;
  border-radius:6px;
  font-size:14px;
  cursor:pointer;
  outline:none;
}
.volume-control{
  display:flex;
  align-items:center;
  gap:8px;
}
.volume-text{
  font-size:14px;
  color:#666;
  white-space:nowrap;
}
.volume-slider{
  width:120px;
  height:6px;
  cursor:pointer;
  accent-color:#409eff;
}
.music-tip{
  font-size:12px;
  color:#999;
  white-space:nowrap;
}

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
  z-index:99999;cursor:pointer;
}
.view-image{
  max-width:90vw;max-height:90vh;
  object-fit:contain;outline:none;
}
.close-btn{
  position:absolute;top:20px;right:30px;
  color:#fff;font-size:36px;z-index:100000;
  display:block;
}
</style>
