const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// Get songs for the game
router.get('/api/songs', songController.getSongs);

// Get fallback songs if Spotify API fails
router.get('/api/fallback-songs', songController.getFallbackSongs);

// Get songs by genre
router.get('/api/songs/genre/:genre', songController.getSongsByGenre);

// Search songs
router.get('/api/songs/search', songController.searchSongs);

module.exports = router;