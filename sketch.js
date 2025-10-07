// 🎬 声音控制视频播放系统（完整版）
// 功能说明：
// - 随机播放 A1~A6
// - 声音响度超过阈值（拍手或其他）时切换到 B1
// - B1 播放结束后 → 黑屏10秒 → 再随机播放A类
// - 持续循环
// - 自动匹配视频尺寸，不模糊

let aVideos = [];
let bVideo;
let currentVideo;
let amplitude;
let state = "A";
let blackScreenTimer = 0;
let blackScreen = false;

const THRESHOLD = 20; // 声音触发阈值（可调大一点，比如 30）

function preload() {
  // ✅ 改成你自己的GitHub Pages上视频路径（或相对路径）
  for (let i = 1; i <= 6; i++) {
    aVideos.push(createVideo(`A${i}.mp4`));
  }
  bVideo = createVideo("B1.mp4");
}

function setup() {
  // ✅ 画布自动匹配第一个视频的尺寸
  createCanvas(1920, 1080); // 或自动用视频宽高
  background(0);

  amplitude = new p5.Amplitude();
  userStartAudio();

  // 隐藏所有视频
  for (let v of aVideos) v.hide();
  bVideo.hide();

  playRandomAVideo();
}

// 播放随机A类视频
function playRandomAVideo() {
  state = "A";
  let randIndex = floor(random(aVideos.length));
  currentVideo = aVideos[randIndex];
  currentVideo.stop();
  currentVideo.show();
  currentVideo.loop();
  currentVideo.volume(0);
  currentVideo.onended(() => playRandomAVideo()); // 自动切下一个A
}

// 切换到B类视频
function switchToBVideo() {
  if (state === "B" || blackScreen) return;
  state = "B";
  if (currentVideo) currentVideo.stop();

  currentVideo = bVideo;
  currentVideo.show();
  currentVideo.play();
  currentVideo.volume(0);
  currentVideo.onended(() => startBlackScreen());
}

// 黑屏10秒后返回A视频
function startBlackScreen() {
  currentVideo.hide();
  blackScreen = true;
  blackScreenTimer = millis();
}

function draw() {
  background(0);

  // 🔊 声音检测
  let level = amplitude.getLevel() * 200;
  fill(255);
  textSize(20);
  text(`模式: ${state}`, 10, 20);
  text(`响度: ${level.toFixed(1)} (阈值: ${THRESHOLD})`, 10, 40);
  text(`文件: ${state === "A" ? "A类随机视频" : "B1.mp4"}`, 10, 60);
  text(`提示: 拍手或制造较大声音触发切换`, 10, 80);

  // 🚀 黑屏逻辑
  if (blackScreen) {
    background(0);
    if (millis() - blackScreenTimer > 10000) { // 10秒后
      blackScreen = false;
      playRandomAVideo();
    }
    return;
  }

  // 🎥 显示当前视频画面
  if (currentVideo) {
    image(currentVideo, 0, 0, width, height);
  }

  // 🚨 声音触发检测
  if (state === "A" && level > THRESHOLD) {
    switchToBVideo();
  }
}

// ✅ 空格键模拟拍手（调试用）
function keyPressed() {
  if (key === " ") switchToBVideo();
}

