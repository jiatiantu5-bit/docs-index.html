let aVideos = [];
let bVideo;
let currentVideo;
let mic;
let vol = 0;
let threshold = 20;
let state = "A"; // 当前状态 A/B
let switching = false;

function preload() {
  // 加载 A 类视频
  for (let i = 1; i <= 6; i++) {
    aVideos.push(createVideo(`A${i}.mp4`));
  }
  // 加载 B 视频
  bVideo = createVideo("B1.mp4");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("Noto Sans SC");
  textSize(24);
  textAlign(LEFT, TOP);

  // 初始化麦克风
  mic = new p5.AudioIn();
  mic.start();

  // 隐藏所有视频
  for (let v of aVideos) {
    v.hide();
  }
  bVideo.hide();

  // 随机播放一个A
  playRandomA();
}

function draw() {
  background(0);

  // 更新响度
  vol = mic.getLevel() * 1000;

  // 显示视频
  if (currentVideo) {
    image(currentVideo, 0, 0, width, height);
  }

  // 文字信息
  let infoText = `模式: ${state}
响度: ${vol.toFixed(1)} (阈值: ${threshold})
文件: ${state === "A" ? "A类随机视频" : "B1.mp4"}
提示: 拍手或制造较大声音触发切换`;
  select('#info').html(infoText);

  // 检测声音触发
  if (!switching && state === "A" && vol > threshold) {
    switching = true;
    switchToB();
  }
}

// 播放随机A视频
function playRandomA() {
  state = "A";
  switching = false;
  if (currentVideo) currentVideo.stop();

  let randIndex = floor(random(aVideos.length));
  currentVideo = aVideos[randIndex];
  currentVideo.show();
  currentVideo.loop();

  currentVideo.onended(() => {
    if (state === "A" && !switching) {
      playRandomA(); // 播完继续随机A
    }
  });
}

// 切换到B视频
function switchToB() {
  if (currentVideo) currentVideo.stop();
  state = "B";
  currentVideo = bVideo;
  currentVideo.show();
  currentVideo.play();

  // B播放完回到A
  currentVideo.onended(() => {
    playRandomA();
  });
}
