const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');
const spotifyService = require('../services/spotifyService');

// Get songs for the game
router.get('/api/songs', songController.getSongs);

// Get fallback songs if Spotify API fails
router.get('/api/fallback-songs', songController.getFallbackSongs);

// Get songs by genre
router.get('/api/songs/genre/:genre', songController.getSongsByGenre);

// Search songs
router.get('/api/songs/search', songController.searchSongs);

// Get user's playlists
router.get('/api/spotify/playlists', async (req, res, next) => {
  try {
    const playlists = await spotifyService.getUserPlaylists();
    res.json(playlists);
  } catch (error) {
    next(error);
  }
});

// Get tracks from a specific playlist
router.get('/api/spotify/playlist/:playlistId/tracks', async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const tracks = await spotifyService.getPlaylistTracks(playlistId);
    res.json(tracks);
  } catch (error) {
    next(error);
  }
});

module.exports = router;