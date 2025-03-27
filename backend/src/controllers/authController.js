// File: backend/src/controllers/authController.js
const axios = require('axios');
const querystring = require('querystring');
const spotifyConfig = require('../config/spotify');
const crypto = require('crypto');

// Instead of using in-memory storage for tokens, we'll now use cookies
// This is more secure and survives server restarts

// Generate a secure random state for CSRF protection
const generateRandomState = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Start authorization process
exports.login = (req, res) => {
  const scope = spotifyConfig.scopes;
  
  // Generate a secure random state to prevent CSRF attacks
  const state = generateRandomState();
  
  // Set cookie with state value (httpOnly for security)
  res.cookie('spotify_auth_state', state, { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 60 * 1000 // 10 minutes expiry
  });
  
  // Redirect to Spotify authorization
  const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: spotifyConfig.clientId,
      scope: scope,
      redirect_uri: spotifyConfig.redirectUri,
      state: state,
      show_dialog: true // Force the user to approve the app again
    });
  
  res.redirect(authUrl);
};

// Handle callback from Spotify authorization
exports.callback = async (req, res) => {
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies['spotify_auth_state'] : null;
  
  // Verify state matches to prevent CSRF attacks
  if (state === null || state !== storedState) {
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/#` + 
      querystring.stringify({
        error: 'state_mismatch'
      }));
  }
  
  // Clear the state cookie as it's no longer needed
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
    
    // Store tokens in cookies (httpOnly for security)
    res.cookie('spotify_access_token', response.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: response.data.expires_in * 1000
    });
    
    res.cookie('spotify_refresh_token', response.data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // Don't set expiry for refresh token, it's valid until revoked
    });
    
    // Store expiry time
    const expiryTime = Date.now() + (response.data.expires_in * 1000);
    res.cookie('spotify_token_expiry', expiryTime, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: response.data.expires_in * 1000
    });
    
    // Redirect back to frontend with success parameter
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/#auth=success`);
  } catch (error) {
    console.error('Error getting access token:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/#error=invalid_token`);
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.spotify_refresh_token;
  
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
    
    // Update cookies with new tokens
    res.cookie('spotify_access_token', response.data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: response.data.expires_in * 1000
    });
    
    const expiryTime = Date.now() + (response.data.expires_in * 1000);
    res.cookie('spotify_token_expiry', expiryTime, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: response.data.expires_in * 1000
    });
    
    // If new refresh token is provided, update it too
    if (response.data.refresh_token) {
      res.cookie('spotify_refresh_token', response.data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production'
      });
    }
    
    res.json({
      success: true,
      expires_in: response.data.expires_in
    });
  } catch (error) {
    console.error('Error refreshing token:', error.response?.data || error.message);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
};

// Get user profile
exports.getMe = async (req, res) => {
  const accessToken = req.cookies.spotify_access_token;
  const tokenExpiry = req.cookies.spotify_token_expiry;
  
  if (!accessToken) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  try {
    // Check if token is expired
    if (tokenExpiry && parseInt(tokenExpiry) < Date.now()) {
      // Token is expired, try refreshing it
      return res.status(401).json({ error: 'Token expired', refreshNeeded: true });
    }
    
    // Get user profile
    const response = await axios({
      method: 'get',
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Token might be invalid, return specific error
      return res.status(401).json({ error: 'Invalid token', refreshNeeded: true });
    }
    console.error('Error getting user profile:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
};

// Logout - clear all cookies
exports.logout = (req, res) => {
  res.clearCookie('spotify_access_token');
  res.clearCookie('spotify_refresh_token');
  res.clearCookie('spotify_token_expiry');
  
  res.json({ success: true, message: 'Logged out successfully' });
};