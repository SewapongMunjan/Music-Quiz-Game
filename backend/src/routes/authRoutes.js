// File: backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const spotifyService = require('../services/spotifyService');

// Initiate Spotify authorization
router.get('/api/spotify/login', authController.login);

// Callback URL from Spotify
router.get('/api/spotify/callback', authController.callback);

// Refresh token
router.get('/api/spotify/refresh-token', authController.refreshToken);

// Get user profile
router.get('/api/spotify/me', authController.getMe);

// Logout
router.get('/api/spotify/logout', authController.logout);

// Get user's playlists
router.get('/api/spotify/playlists', async (req, res, next) => {
  try {
    const playlists = await spotifyService.getUserPlaylists(req);
    res.json(playlists);
  } catch (error) {
    // Handle authentication errors specifically
    if (error.message === 'Not authenticated' || error.message === 'Token expired') {
      return res.status(401).json({ 
        error: error.message, 
        refreshNeeded: error.message === 'Token expired'
      });
    }
    next(error);
  }
});

// Get tracks from a specific playlist
router.get('/api/spotify/playlist/1SuDkmlDf7U0qrMdcjU0xN/tracks', async (req, res, next) => {
  try {
    const { playlistId } = req.params;
    const tracks = await spotifyService.getPlaylistTracks(playlistId, req);
    res.json(tracks);
  } catch (error) {
    // Handle authentication errors
    if (error.message === 'Not authenticated' || error.message === 'Token expired') {
      return res.status(401).json({ 
        error: error.message, 
        refreshNeeded: error.message === 'Token expired'
      });
    }
    next(error);
  }
});

module.exports = router;