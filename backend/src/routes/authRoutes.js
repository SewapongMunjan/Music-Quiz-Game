const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// เริ่มกระบวนการ authorization
router.get('/api/spotify/login', authController.login);

// Callback URL จาก Spotify
router.get('/api/spotify/callback', authController.callback);

// Refresh token
router.get('/api/spotify/refresh-token', authController.refreshToken);

// ดึงข้อมูลผู้ใช้ที่ login แล้ว
router.get('/api/spotify/me', authController.getMe);

// ดึง playlists ของผู้ใช้
router.get('/api/spotify/playlists', async (req, res, next) => {
  try {
    const spotifyService = require('../services/spotifyService');
    const playlists = await spotifyService.getUserPlaylists();
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

// ดึงเพลงจาก playlist ที่ระบุ
router.get('/api/spotify/playlist/:playlistId/tracks', async (req, res, next) => {
  try {
    const spotifyService = require('../services/spotifyService');
    const { playlistId } = req.params;
    const tracks = await spotifyService.getPlaylistTracks(playlistId);
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

module.exports = router;