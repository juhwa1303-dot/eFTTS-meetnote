const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB 연결 성공'))
  .catch(err => console.error('❌ MongoDB 연결 실패:', err));

const meetingSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  date:       String,
  keywords:   [String],
  attendees:  [String],
  agenda:     String,
  discussion: String,
  decisions:  String,
  createdAt:  { type: Date, default: Date.now }
});

const Meeting = mongoose.model('Meeting', meetingSchema);

app.get('/api/meetings', async (req, res) => {
  try {
    const data = await Meeting.find().sort({ createdAt: -1 });
    res.json(data.map(m => ({ ...m.toObject(), id: m._id.toString() })));
  } catch(e) { res.status(500).json({ error: '조회 실패' }); }
});

app.get('/api/meetings/:id', async (req, res) => {
  try {
    const m = await Meeting.findById(req.params.id);
    if (!m) return res.status(404).json({ error: '찾을 수 없습니다.' });
    res.json({ ...m.toObject(), id: m._id.toString() });
  } catch(e) { res.status(500).json({ error: '조회 실패' }); }
});

app.post('/api/meetings', async (req, res) => {
  try {
    const m = await Meeting.create(req.body);
    res.status(201).json({ ...m.toObject(), id: m._id.toString() });
  } catch(e) { res.status(500).json({ error: '저장 실패' }); }
});

app.put('/api/meetings/:id', async (req, res) => {
  try {
    const m = await Meeting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!m) return res.status(404).json({ error: '찾을 수 없습니다.' });
    res.json({ ...m.toObject(), id: m._id.toString() });
  } catch(e) { res.status(500).json({ error: '수정 실패' }); }
});

app.delete('/api/meetings/:id', async (req, res) => {
  try {
    await Meeting.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: '삭제 실패' }); }
});

app.listen(PORT, () => {
  console.log(`✅ MeetNote 서버 실행 중 → http://localhost:${PORT}`);
});

// ── 결정사항 스키마 ──────────────────────────
const decisionSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  content:   String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Decision = mongoose.model('Decision', decisionSchema);

// 결정사항 전체 목록
app.get('/api/decisions', async (req, res) => {
  try {
    const data = await Decision.find().sort({ updatedAt: -1 });
    res.json(data.map(d => ({ ...d.toObject(), id: d._id.toString() })));
  } catch(e) { res.status(500).json({ error: '조회 실패' }); }
});

// 결정사항 저장
app.post('/api/decisions', async (req, res) => {
  try {
    const d = await Decision.create(req.body);
    res.status(201).json({ ...d.toObject(), id: d._id.toString() });
  } catch(e) { res.status(500).json({ error: '저장 실패' }); }
});

// 결정사항 수정
app.put('/api/decisions/:id', async (req, res) => {
  try {
    const d = await Decision.findByIdAndUpdate(req.params.id, { ...req.body, updatedAt: new Date() }, { new: true });
    if (!d) return res.status(404).json({ error: '찾을 수 없습니다.' });
    res.json({ ...d.toObject(), id: d._id.toString() });
  } catch(e) { res.status(500).json({ error: '수정 실패' }); }
});

// 결정사항 삭제
app.delete('/api/decisions/:id', async (req, res) => {
  try {
    await Decision.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: '삭제 실패' }); }
});
