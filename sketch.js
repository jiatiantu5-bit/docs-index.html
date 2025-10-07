let aVideos = [];
let bVideo;
let currentVideo;
let state = "A";
let mic;
let threshold = 0.2; // 拍手触发阈值，可调节

function preload() {
  // A类视频
  for (let i = 1; i <= 6; i++) {
    aVideos.push(createVideo(`A${i}.mp4`));
  }
  // B类视频
  bVideo = createVideo("B1.mp4");
}

function setup() {
  // 自动根据屏幕创建全屏画布
  createCanvas(windowWidth, windowHeight);
  background(0);

  // 初始化麦克风
  mic = new p5.AudioIn();
  mic.start();

  // 隐藏所有视频
  for (let v of aVideos) {
    v.hide();
  }
  bVideo.hide();

  // 启动第一个A类视频
  playRandomAVideo();
}

function draw() {
  background(0);

  // 显示当前视频帧
  if (currentVideo) {
    image(currentVideo, 0, 0, width, height);
  }

  // 获取当前音量（检测拍手）
  let vol = mic.getLevel();
  console.log(vol);

  if (state === "A" && vol > threshold) {
    switchToBVideo();
  }

  // 当B播放完毕后，黑屏10秒再回到A
  if (state === "B" && currentVideo.elt.ended) {
    state = "black";
    background(0);
    currentVideo.stop();
    currentVideo.hide();
    setTimeout(playRandomAVideo, 10000);
  }
}

// 播放A类视频
function playRandomAVideo() {
  let randIndex = floor(random(aVideos.length));
  currentVideo = aVideos[randIndex];
  currentVideo.volume(0);
  currentVideo.loop(); // 自动播放循环
  currentVideo.show();
  currentVideo.play();
  state = "A";
}

// 播放B类视频
function switchToBVideo() {
  if (currentVideo) {
    currentVideo.stop();
    currentVideo.hide();
  }
  currentVideo = bVideo;
  currentVideo.volume(0);
  currentVideo.play();
  currentVideo.show();
  state = "B";
}

// 允许用户点击播放（浏览器策略）
function mousePressed() {
  if (getAudioContext().state !== "running") {
    getAudioContext().resume();
  }
  if (currentVideo) {
    currentVideo.play();
  }
}
