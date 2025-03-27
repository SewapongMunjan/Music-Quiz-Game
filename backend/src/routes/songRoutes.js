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
    const playlists = await spotifyService.getUserPlaylists(req);
    res.json(playlists);
  } catch (error) {
    console.error('Error fetching playlists:', error.message);
    res.status(401).json({ error: 'Failed to fetch playlists', message: error.message });
  }
});

// Get tracks from a specific playlist - FIXED: now using route parameter
router.get('/api/spotify/playlist/:playlistId/tracks', async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const tracks = await spotifyService.getPlaylistTracks(playlistId, req);
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching playlist tracks:', error.message);
    // Return fallback songs if playlist tracks fetch fails
    const fallbackSongs = await songController.getFallbackSongs(req, res);
    res.json(fallbackSongs);
  }
});

module.exports = router;