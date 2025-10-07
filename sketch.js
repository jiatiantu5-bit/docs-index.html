let aVideos = [];
let bVideo;
let currentVideo;
let mic;
let threshold = 20; // 触发B视频的响度阈值
let state = "A";
let isBlack = false;
let blackTimer = 0;
let blackDuration = 10000; // 黑屏10秒
let videoReady = false;

function preload() {
  // ✅ 改成你的 GitHub Pages 链接
  const baseURL = "https://jiatiantu5-bit.github.io/docs-index.html/";

  aVideos = [
    createVideo(baseURL + "A1.mp4"),
    createVideo(baseURL + "A2.mp4"),
    createVideo(baseURL + "A3.mp4"),
    createVideo(baseURL + "A4.mp4"),
    createVideo(baseURL + "A5.mp4"),
    createVideo(baseURL + "A6.mp4")
  ];

  bVideo = createVideo(baseURL + "B1.mp4");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  userStartAudio(); // ✅ 激活音频
  mic = new p5.AudioIn();
  mic.start();

  // 初始化所有视频设置
  for (let v of aVideos) {
    v.hide();
    v.volume(0);
  }
  bVideo.hide();
  bVideo.volume(0);

  playRandomAVideo();
}

function draw() {
  background(0);

  let vol = mic.getLevel() * 1000; // 响度放大，方便显示

  if (!isBlack) {
    // 显示当前视频画面
    if (currentVideo) {
      image(currentVideo, 0, 0, width, height);
    }

    // 🎤 声音检测逻辑
    if (state === "A" && vol > threshold) {
      switchToBVideo();
    }

    // 播放完一个A视频就随机下一个
    if (state === "A" && currentVideo && currentVideo.elt.ended) {
      playRandomAVideo();
    }

    // B视频播放完 → 黑屏
    if (state === "B" && currentVideo && currentVideo.elt.ended) {
      startBlackScreen();
    }
  } else {
    background(0);
    if (millis() - blackTimer > blackDuration) {
      isBlack = false;
      playRandomAVideo();
    }
  }

  // 显示信息（调试）
  fill(255);
  textSize(24);
  textAlign(LEFT, TOP);
  text(`模式: ${state}`, 20, 20);
  text(`响度: ${vol.toFixed(1)} (阈值: ${threshold})`, 20, 50);
  text(`文件: ${state === "A" ? "A类随机视频" : "B1.mp4"}`, 20, 80);
  text(`提示: 拍手或制造较大声音触发切换`, 20, 110);
}

// 播放随机A类视频
function playRandomAVideo() {
  state = "A";
  let randIndex = floor(random(aVideos.length));
  currentVideo = aVideos[randIndex];
  stopAllVideos();
  currentVideo.show();
  currentVideo.play();
}

// 切换到B类视频
function switchToBVideo() {
  state = "B";
  stopAllVideos();
  currentVideo = bVideo;
  currentVideo.show();
  currentVideo.play();
}

// 黑屏逻辑
function startBlackScreen() {
  stopAllVideos();
  isBlack = true;
  blackTimer = millis();
}

// 停止所有视频
function stopAllVideos() {
  for (let v of aVideos) {
    v.stop();
  }
  bVideo.stop();
}

// 空格键模拟拍手
function keyPressed() {
  if (key === " ") {
    switchToBVideo();
  }
}
