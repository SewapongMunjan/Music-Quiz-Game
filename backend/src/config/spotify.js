require('dotenv').config();

module.exports = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI || 'http://localhost:3001/api/spotify/callback',
  scopes: [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ')
};