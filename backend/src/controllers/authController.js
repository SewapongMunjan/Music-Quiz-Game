const axios = require('axios');
const querystring = require('querystring');
const spotifyConfig = require('../config/spotify');

// เก็บข้อมูล token (ในการใช้งานจริงควรใช้ session หรือ database)
const tokens = {
  accessToken: null,
  refreshToken: null,
  tokenExpiry: null
};

// ส่งออก tokens เพื่อใช้ในบริการอื่น
exports.tokens = tokens;

// เริ่มการขอ authorization
exports.login = (req, res) => {
  const scope = spotifyConfig.scopes;
  
  // สร้าง state เพื่อป้องกัน CSRF
  const state = Math.random().toString(36).substring(2, 15);
  res.cookie('spotify_auth_state', state);
  
  const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: spotifyConfig.clientId,
      scope: scope,
      redirect_uri: spotifyConfig.redirectUri,
      state: state
    });
    
  res.redirect(authUrl);
};

// ดึง token จาก code ที่ได้รับจาก authorization
exports.callback = async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;
  
  // ตรวจสอบค่า state เพื่อป้องกัน CSRF
  if (state === null || state !== storedState) {
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/#` + 
      querystring.stringify({
        error: 'state_mismatch'
      }));
    return;
  }
  
  res.clearCookie('spotify_auth_state');
  
  try {
    // Exchange code for access token
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        code: code,
        redirect_uri: spotifyConfig.redirectUri,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          spotifyConfig.clientId + ':' + spotifyConfig.clientSecret
        ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // บันทึก tokens
    tokens.accessToken = response.data.access_token;
    tokens.refreshToken = response.data.refresh_token;
    tokens.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
    // Redirect กลับไปที่หน้า frontend
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/#access_token=${tokens.accessToken}`);
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/#error=invalid_token`);
  }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
  const refreshToken = tokens.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token available' });
  }
  
  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'refresh_token',
        refresh_token: refreshToken
      }),
      headers: {
        'Authorization': 'Basic ' + Buffer.from(
          spotifyConfig.clientId + ':' + spotifyConfig.clientSecret
        ).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // อัพเดท tokens
    tokens.accessToken = response.data.access_token;
    tokens.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
    
    // ถ้าได้รับ refresh token ใหม่ ให้อัพเดทด้วย
    if (response.data.refresh_token) {
      tokens.refreshToken = response.data.refresh_token;
    }
    
    res.json({
      access_token: tokens.accessToken,
      expires_in: Math.floor((tokens.tokenExpiry - Date.now()) / 1000)
    });
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
};

// ดึงข้อมูลผู้ใช้ที่ login แล้ว
exports.getMe = async (req, res) => {
  // ตรวจสอบว่ามี token หรือไม่
  if (!tokens.accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  // ตรวจสอบว่า token หมดอายุหรือไม่
  if (tokens.tokenExpiry < Date.now()) {
    try {
      // Refresh token โดยเรียกใช้ refreshAccessToken
      const refreshToken = tokens.refreshToken;
      
      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token available' });
      }
      
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        data: querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }),
        headers: {
          'Authorization': 'Basic ' + Buffer.from(
            spotifyConfig.clientId + ':' + spotifyConfig.clientSecret
          ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      tokens.accessToken = response.data.access_token;
      tokens.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      if (response.data.refresh_token) {
        tokens.refreshToken = response.data.refresh_token;
      }
    } catch (error) {
      return res.status(401).json({ error: 'Token expired' });
    }
  }
  
  try {
    // ดึงข้อมูลผู้ใช้
    const response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': `Bearer ${tokens.accessToken}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error getting user profile:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};