/***********************
 * p5 + 串口 + 视频状态机
 * A 组：随机连续播放
 * 触发(拍手/响度>阈值)：切到 B1 播完 → 回到 A 组随机
 * 空格 = 手动触发（没连串口时测试）
 ************************/

// === 可按需修改：文件名要与你仓库里的文件一致 ===
const A_FILES = ["A1.mp4","A2.mp4","A3.mp4","A4.mp4","A5.mp4","A6.mp4"]; // 有几个就写几个
const B_FILE  = "B1.mp4"; // 如果你是 .mov，就改成 "B1.mov"

const THRESHOLD = 200;     // 触发阈值（串口响度 ≥ 此值切到 B）
const COOLDOWN_MS = 1500;  // 触发冷却，避免抖动
const SHOW_DEBUG = true;   // true = 左上角显示状态信息

// === 运行时变量 ===
let serial, latest = 0;     // 串口对象 / 最新响度
let lastTrigger = -9999;    // 上次触发时间
let curMode = "A";          // A: 播放 A 组；B: 播放 B1
let vid = null;             // p5 媒体对象
let hudEl;                  // 顶部信息 DOM

// 端口自动选择（mac 常见前缀）
const PREFERRED_PREFIXES = ["/dev/cu.usbmodem", "/dev/tty.usbmodem", "/dev/cu.usbserial", "/dev/tty.usbserial"];

function setup() {
  createCanvas(windowWidth, windowHeight);
  hudEl = document.getElementById('hud');

  // 串口（可选）
  try {
    serial = new p5.SerialPort();
    serial.on('list', tryOpenBestPort);
    serial.on('open', () => print('[serial] opened'));
    serial.on('data', onSerialData);
    serial.on('error', e => print('[serial] error:', e));
    serial.on('close', () => print('[serial] closed'));
    serial.list();
  } catch(e) {
    print('[serial] init failed:', e);
  }

  // 初始进入 A 组
  enterA(true);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 自动选择一个看起来像 Arduino 的端口
function tryOpenBestPort(list) {
  print('[serial] ports:', list);
  let port = list.find(p => PREFERRED_PREFIXES.some(pref => p.startsWith(pref))) || list[0];
  if (port) {
    print('[serial] open:', port);
    serial.open(port);
  } else {
    print('[serial] no port found');
  }
}

// 串口读一行，取整数
function onSerialData() {
  let s = serial.readLine();
  if (typeof s !== 'string') return;
  s = s.trim();
  if (!s) return;
  let v = parseInt(s, 10);
  if (Number.isFinite(v)) {
    latest = v;
  } else {
    // 调试：打印非数字行
    // console.log('[serial] non-number:', JSON.stringify(s));
  }
}

function draw() {
  background(0);

  // —— 状态机逻辑 —— //
  if (curMode === "A") {
    // 串口触发（或按键模拟）
    if (shouldTrigger()) {
      enterB();
    }
  }

  // 把视频画到画布（自适应居中）
  if (vid) {
    const vw = vid.width  || width;
    const vh = vid.height || height;
    const s = min(width / vw, height / vh);
    const rw = vw * s, rh = vh * s;
    image(vid, (width - rw)/2, (height - rh)/2, rw, rh);
  }

  // HUD 调试
  if (SHOW_DEBUG && hudEl) {
    hudEl.innerHTML =
      `<b>模式</b>：${curMode}　` +
      `<b>响度</b>：${latest}（阈值：${THRESHOLD}）　` +
      `<b>文件</b>：${currentName() || '-'}　` +
      `<b>提示</b>：${serial ? '串口尝试连接中（可忽略）' : '未使用串口；按空格模拟触发'}`;
  }
}

// —— 触发条件：串口值 ≥ 阈值 + 冷却 —— //
function shouldTrigger() {
  let now = millis();
  if (now - lastTrigger < COOLDOWN_MS) return false;
  if (latest >= THRESHOLD) {
    lastTrigger = now;
    return true;
  }
  return false;
}

// —— 键盘：空格模拟触发 —— //
function keyPressed() {
  if (key === ' ') {
    lastTrigger = millis();
    if (curMode === 'A') enterB();
  }
}

// —— 进入 A 组：随机连播 —— //
function enterA(forceNew = false) {
  curMode = "A";
  // 如果没有视频或要求强制换新，就挑一条
  if (!vid || forceNew) {
    loadVideo(randomA(), true, () => {
      // A 组要连播：播完自动换下一条
      vid.elt.onended = () => enterA(true);
      vid.loop(); // 连续播放（防止某些浏览器 ended 不触发）
    });
  } else {
    // 已有视频时继续 loop
    vid.loop();
  }
}

// —— 进入 B：播放一遍，结束回到 A —— //
function enterB() {
  curMode = "B";
  loadVideo(B_FILE, false, () => {
    vid.elt.onended = () => enterA(true);
    vid.play(); // 只播一遍
  });
}

// —— 工具：装载某个视频（文件名） —— //
function loadVideo(name, mute = true, onready = null) {
  if (vid) {
    try { vid.remove(); } catch(e) {}
    vid = null;
  }
  // p5 的 createVideo 支持相对路径；文件与 index.html 同目录即可
  vid = createVideo(name, () => {
    // ready callback
    if (typeof onready === 'function') onready();
  });
  vid.hide();          // 不要让原生 <video> 出现在页面上
  vid.volume(mute ? 0 : 1);
}

// —— A 组随机 —— //
function randomA() {
  return random(A_FILES);
}

// —— 取当前文件名（显示用） —— //
function currentName() {
  if (!vid) return '';
  // p5 媒体对象内部存着 <video> 元素，可以拿到 src
  const src = vid.elt?.currentSrc || vid.elt?.src || '';
  if (!src) return '';
  try {
    return decodeURIComponent(src.split('/').pop());
  } catch {
    return src;
  }
}

// —— 处理用户交互（移动端/桌面浏览器首次需点击才能播放） —— //
function mousePressed() {
  if (vid && vid.elt && vid.elt.paused) {
    vid.loop();
  }
}
