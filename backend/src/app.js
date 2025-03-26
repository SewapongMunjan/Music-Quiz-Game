const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // เพิ่มบรรทัดนี้
const config = require('./config');
const songRoutes = require('./routes/songRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const authRoutes = require('./routes/authRoutes'); // เพิ่มบรรทัดนี้
const errorHandler = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // สำคัญสำหรับ cookies
}));
app.use(express.json());
app.use(cookieParser()); // เพิ่มบรรทัดนี้

// Routes
app.use(songRoutes);
app.use(scoreRoutes);
app.use(authRoutes); // เพิ่มบรรทัดนี้

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Default route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'เกมแข่งทายเพลง API', 
    version: '1.0.0',
    endpoints: [
      '/api/songs - รายการเพลงสำหรับเกม',
      '/api/songs/genre/:genre - รายการเพลงตามหมวดหมู่',
      '/api/songs/search - ค้นหาเพลง',
      '/api/scores - บันทึกคะแนน',
      '/api/scores/top - คะแนนสูงสุด',
      '/api/spotify/login - เข้าสู่ระบบ Spotify',
      '/api/spotify/me - ข้อมูลผู้ใช้ Spotify'
    ]
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handling
app.use(errorHandler);

module.exports = app;