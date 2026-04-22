/**
 * MeetNote — 백엔드 서버
 * Express + MongoDB Atlas 저장
 * 실행: node server.js  →  http://localhost:3000
 */

require('dotenv').config();

const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

// ── 미들웨어 ──────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── MongoDB 연결 ─────────────────────────────
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI 환경변수가 설정되지 않았습니다.');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공');
  })
  .catch((err) => {
    console.error('❌ MongoDB 연결 실패:', err.message);
    process.exit(1);
  });

// ── 스키마 / 모델 ────────────────────────────
const meetingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => Date.now().toString() + Math.random().toString(36).slice(2, 8),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      default: '',
    },
    keywords: {
      type: [String],
      default: [],
    },
    attendees: {
      type: [String],
      default: [],
    },
    agenda: {
      type: String,
      default: '',
    },
    discussion: {
      type: String,
      default: '',
    },
    decisions: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
  }
);

const Meeting = mongoose.model('Meeting', meetingSchema);

// ── API Routes ────────────────────────────────

// GET /api/meetings — 전체 목록 (최신순)
app.get('/api/meetings', async (req, res) => {
  try {
    const meetings = await Meeting.find().sort({ createdAt: -1 });
    res.json(meetings);
  } catch (error) {
    console.error('GET /api/meetings 오류:', error.message);
    res.status(500).json({ error: '회의록 목록을 불러오지 못했습니다.' });
  }
});

// GET /api/meetings/:id — 단건 조회
app.get('/api/meetings/:id', async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ id: req.params.id });
    if (!meeting) {
      return res.status(404).json({ error: '회의록을 찾을 수 없습니다.' });
    }
    res.json(meeting);
  } catch (error) {
    console.error('GET /api/meetings/:id 오류:', error.message);
    res.status(500).json({ error: '회의록을 불러오지 못했습니다.' });
  }
});

// POST /api/meetings — 신규 저장
app.post('/api/meetings', async (req, res) => {
  try {
    const newMeeting = new Meeting({
      ...req.body,
      id: Date.now().toString(),
      createdAt: new Date(),
    });

    await newMeeting.save();
    res.status(201).json(newMeeting);
  } catch (error) {
    console.error('POST /api/meetings 오류:', error.message);
    res.status(500).json({ error: '회의록 저장에 실패했습니다.' });
  }
});

// PUT /api/meetings/:id — 수정
app.put('/api/meetings/:id', async (req, res) => {
  try {
    const updatedMeeting = await Meeting.findOneAndUpdate(
      { id: req.params.id },
      { ...req.body, id: req.params.id },
      { new: true, runValidators: true }
    );

    if (!updatedMeeting) {
      return res.status(404).json({ error: '회의록을 찾을 수 없습니다.' });
    }

    res.json(updatedMeeting);
  } catch (error) {
    console.error('PUT /api/meetings/:id 오류:', error.message);
    res.status(500).json({ error: '회의록 수정에 실패했습니다.' });
  }
});

// DELETE /api/meetings/:id — 삭제
app.delete('/api/meetings/:id', async (req, res) => {
  try {
    const deletedMeeting = await Meeting.findOneAndDelete({ id: req.params.id });

    if (!deletedMeeting) {
      return res.status(404).json({ error: '회의록을 찾을 수 없습니다.' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/meetings/:id 오류:', error.message);
    res.status(500).json({ error: '회의록 삭제에 실패했습니다.' });
  }
});

// ── 서버 시작 ────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ MeetNote 서버 실행 중 → http://localhost:${PORT}`);
});
