html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: black;
  height: 100%;
  width: 100%;
  font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
  color: white;
}

canvas, video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

#info {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.4);
  padding: 10px 16px;
  border-radius: 8px;
  color: #fff;
  font-size: 18px;
  line-height: 1.5;
  white-space: pre-line;
}
