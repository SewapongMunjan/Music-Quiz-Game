// File: backend/src/services/spotifyService.js
const axios = require('axios');
const querystring = require('querystring');
const config = require('../config');

// Get client credentials token - for public endpoints that don't need user auth
const getClientCredentialsToken = async () => {
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(
          config.spotify.clientId + ':' + config.spotify.clientSecret
        ).toString('base64')
      },
      data: querystring.stringify({
        grant_type: 'client_credentials'
      })
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error.response?.data || error.message);
    throw error;
  }
};

// Get user's playlists
const getUserPlaylists = async (req) => {
  try {
    // If req is not provided or doesn't have cookies, use client credentials
    if (!req || !req.cookies || !req.cookies.spotify_access_token) {
      throw new Error('Not authenticated');
    }
    
    // Get access token from cookie
    const accessToken = req.cookies.spotify_access_token;
    
    // Check if token is expired
    const tokenExpiry = req.cookies.spotify_token_expiry;
    if (tokenExpiry && parseInt(tokenExpiry) < Date.now()) {
      throw new Error('Token expired');
    }
    
    // Get user playlists
    const response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/me/playlists',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params: {
        limit: 50
      }
    });
    
    return response.data.items;
  } catch (error) {
    console.error('Error fetching user playlists:', error.response?.data || error.message);
    throw error;
  }
};

// Get tracks from a specific playlist
const getPlaylistTracks = async (playlistId, req) => {
  // Use default playlist if not specified
  const playlist = playlistId || config.spotify.playlists.thai;
  
  try {
    let token;
    
    // Try to get access token from request cookies (if user is logged in)
    if (req && req.cookies && req.cookies.spotify_access_token) {
      token = req.cookies.spotify_access_token;
      
      // Check if token is expired
      const tokenExpiry = req.cookies.spotify_token_expiry;
      if (tokenExpiry && parseInt(tokenExpiry) < Date.now()) {
        // If token is expired, we'll fall back to client credentials
        token = await getClientCredentialsToken();
      }
    } else {
      // User not logged in, use client credentials
      token = await getClientCredentialsToken();
    }
    
    const response = await axios({
      method: 'get',
      url: `https://api.spotify.com/v1/playlists/${playlist}/tracks`,
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        limit: 30,
        fields: 'items(track(id,name,artists,preview_url,album(images)))'
      }
    });

    // Process data for the game
    const songs = response.data.items
      .filter(item => item.track && item.track.preview_url)
      .map(item => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0].name,
        preview_url: item.track.preview_url,
        image: item.track.album.images[0].url
      }));

    // If no songs with preview URLs found, throw error to trigger fallback
    if (songs.length === 0) {
      throw new Error('No songs with preview URLs available');
    }

    return songs;
  } catch (error) {
    console.error('Error fetching playlist tracks:', error.response?.data || error.message);
    throw error;
  }
};

// Search for tracks by query
const searchTracks = async (query, limit = 20) => {
  try {
    // Always use client credentials for search
    const token = await getClientCredentialsToken();
    
    const response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/search',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: query,
        type: 'track',
        limit,
        market: 'TH' // Add market parameter for better results
      }
    });

    const songs = response.data.tracks.items
      .filter(track => track.preview_url)
      .map(track => ({
        id: track.id,
        name: track.name,
        artist: track.artists[0].name,
        preview_url: track.preview_url,
        image: track.album.images[0].url
      }));

    return songs;
  } catch (error) {
    console.error('Error searching tracks:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  getUserPlaylists,
  getPlaylistTracks,
  searchTracks,
  getClientCredentialsToken
};