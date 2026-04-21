/**
 * MeetNote — 백엔드 서버
 * Express + JSON 파일 저장 (meetings.json)
 * 실행: node server.js  →  http://localhost:3000
 */

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'meetings.json');

// ── 미들웨어 ──────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── 데이터 헬퍼 ───────────────────────────────
function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ── API Routes ────────────────────────────────

// GET /api/meetings — 전체 목록 (최신순)
app.get('/api/meetings', (req, res) => {
  const data = readData();
  // 날짜 내림차순 정렬
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(data);
});

// GET /api/meetings/:id — 단건 조회
app.get('/api/meetings/:id', (req, res) => {
  const data = readData();
  const meeting = data.find(m => m.id === req.params.id);
  if (!meeting) return res.status(404).json({ error: '회의록을 찾을 수 없습니다.' });
  res.json(meeting);
});

// POST /api/meetings — 신규 저장
app.post('/api/meetings', (req, res) => {
  const data = readData();
  const newMeeting = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    ...req.body
  };
  data.push(newMeeting);
  writeData(data);
  res.status(201).json(newMeeting);
});

// PUT /api/meetings/:id — 수정
app.put('/api/meetings/:id', (req, res) => {
  const data = readData();
  const idx = data.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '회의록을 찾을 수 없습니다.' });
  data[idx] = { ...data[idx], ...req.body, id: req.params.id };
  writeData(data);
  res.json(data[idx]);
});

// DELETE /api/meetings/:id — 삭제
app.delete('/api/meetings/:id', (req, res) => {
  const data = readData();
  const idx = data.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: '회의록을 찾을 수 없습니다.' });
  data.splice(idx, 1);
  writeData(data);
  res.json({ success: true });
});

// ── 서버 시작 ────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  MeetNote 서버 실행 중 → http://localhost:${PORT}`);
  console.log(`📁  데이터 저장 위치: ${DATA_FILE}`);
});
