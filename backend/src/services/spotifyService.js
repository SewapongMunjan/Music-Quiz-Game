const axios = require('axios');
const querystring = require('querystring');
const config = require('../config');
const authController = require('../controllers/authController');

// Get client credentials token
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
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

// Refresh access token without Express req/res
const refreshAccessToken = async () => {
  if (!authController.tokens.refreshToken) {
    throw new Error('No refresh token available');
  }
  
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: authController.tokens.refreshToken
      }),
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          config.spotify.clientId + ':' + config.spotify.clientSecret
        ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // อัพเดท tokens
    authController.tokens.accessToken = response.data.access_token;
    authController.tokens.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
    // ถ้าได้รับ refresh token ใหม่ ให้อัพเดทด้วย
    if (response.data.refresh_token) {
      authController.tokens.refreshToken = response.data.refresh_token;
    }
    
    return authController.tokens.accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    throw error;
  }
};

// Get user's playlists
const getUserPlaylists = async () => {
  try {
    // ตรวจสอบว่ามี token หรือไม่
    if (!authController.tokens.accessToken) {
      throw new Error('Not authenticated');
    }
    
    // ตรวจสอบว่า token หมดอายุหรือไม่
    if (authController.tokens.tokenExpiry < Date.now()) {
      await refreshAccessToken();
    }
    
    // ดึงรายการ playlists ของผู้ใช้
    const response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/me/playlists',
      headers: {
        'Authorization': `Bearer ${authController.tokens.accessToken}`
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
const getPlaylistTracks = async (playlistId) => {
  // ใช้ default playlist ถ้าไม่ได้ระบุ
  const playlist = playlistId || config.spotify.playlists.thai;
  
  try {
    // ดึงข้อมูลจาก API ด้วย client credentials หรือ auth token
    let token;
    
    // ถ้ามี auth token ให้ใช้ auth token
    if (authController.tokens.accessToken) {
      // ตรวจสอบว่า token หมดอายุหรือไม่
      if (authController.tokens.tokenExpiry < Date.now()) {
        await refreshAccessToken();
      }
      token = authController.tokens.accessToken;
    } else {
      // ถ้าไม่มี auth token ให้ใช้ client credentials
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

    // ปรับรูปแบบข้อมูลสำหรับเกม
    const songs = response.data.items
      .filter(item => item.track && item.track.preview_url)
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
    // ใช้ client credentials
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
    console.error('Error searching tracks:', error.response?.data || error.message);
    throw error;
  }
};

module.exports = {
  getUserPlaylists,
  getPlaylistTracks,
  searchTracks,
  getClientCredentialsToken,
  refreshAccessToken
};