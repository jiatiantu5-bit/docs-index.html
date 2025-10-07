let aVideos = [];
let bVideo;
let currentVideo;
let state = "A";
let mic, amplitude;
let threshold = 0.2; // 调整拍手灵敏度
let blackStart = 0;
let showBlack = false;

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
  textSize(20);
  fill(255);
  noStroke();

  // 初始化麦克风
  mic = new p5.AudioIn();
  mic.start(() => console.log("Mic started"));
  amplitude = new p5.Amplitude();
  amplitude.setInput(mic);

  // 随机播放一个 A 视频
  playRandomA();
}

function draw() {
  background(0);

  // 显示当前视频
  if (currentVideo && !showBlack) {
    image(currentVideo, 0, 0, width, height);
  }

  // 检测声音
  let level = amplitude.getLevel();
  text(
    `模式: ${state}\n响度: ${level.toFixed(2)} (阈值: ${threshold})`,
    20,
    40
  );

  // 声音触发
  if (state === "A" && level > threshold && !showBlack) {
    switchToB();
  }

  // 黑屏逻辑
  if (showBlack) {
    background(0);
    if (millis() - blackStart > 10000) {
      showBlack = false;
      playRandomA();
    }
  }
}

function playRandomA() {
  stopAllVideos();
  state = "A";
  let randIndex = floor(random(aVideos.length));
  currentVideo = aVideos[randIndex];
  currentVideo.show();
  currentVideo.play();
  currentVideo.onended(() => playRandomA());
}

function switchToB() {
  stopAllVideos();
  state = "B";
  currentVideo = bVideo;
  currentVideo.show();
  currentVideo.play();
  currentVideo.onended(() => {
    showBlack = true;
    blackStart = millis();
  });
}

function stopAllVideos() {
  [...aVideos, bVideo].forEach((v) => {
    v.stop();
    v.hide();
  });
}
