const express = require('express');
const cors = require('cors');
const config = require('./config');
const songRoutes = require('./routes/songRoutes');
const scoreRoutes = require('./routes/scoreRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(cors(config.app.cors));
app.use(express.json());

// Routes
app.use(songRoutes);
app.use(scoreRoutes);

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
      '/api/scores/top - คะแนนสูงสุด'
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