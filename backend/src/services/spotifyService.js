const axios = require('axios');
const querystring = require('querystring');
const config = require('../config');

let accessToken = null;
let tokenExpiry = null;

// Get Spotify Access Token
const getAccessToken = async () => {
  // Check if token is still valid
  if (accessToken && tokenExpiry && tokenExpiry > Date.now()) {
    return accessToken;
  }
  
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

    accessToken = response.data.access_token;
    // Set token expiry (subtract 60 seconds as a buffer)
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;
    
    return accessToken;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
};

// Get tracks from a specific playlist
const getPlaylistTracks = async (playlistId) => {
  // Use default Thai playlist if not specified
  const playlist = playlistId || config.spotify.playlists.thai;
  
  try {
    const token = await getAccessToken();
    
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

    // Format the response for the game
    const songs = response.data.items
      .filter(item => item.track && item.track.preview_url) // Only songs with preview URLs
      .map(item => ({
        id: item.track.id,
        name: item.track.name,
        artist: item.track.artists[0].name,
        preview_url: item.track.preview_url,
        image: item.track.album.images[0].url
      }));

    return songs;
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    throw error;
  }
};

// Search for tracks by query
const searchTracks = async (query, limit = 20) => {
  try {
    const token = await getAccessToken();
    
    const response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/search',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        q: query,
        type: 'track',
        limit
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
    console.error('Error searching tracks:', error);
    throw error;
  }
};

module.exports = {
  getAccessToken,
  getPlaylistTracks,
  searchTracks
};