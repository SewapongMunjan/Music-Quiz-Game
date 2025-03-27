require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3001,
  
  // Spotify API configuration
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    playlists: {
      thai: '4QwQ8Z2XT9ysONAOxIgwLz',    // Thai playlist (using RapCaviar as a placeholder)
      pop: '1SuDkmlDf7U0qrMdcjU0xN',      // Global Top 50
      rock: '1SuDkmlDf7U0qrMdcjU0xN',     // Rock Classics
      hiphop: '1SuDkmlDf7U0qrMdcjU0xN',   // RapCaviar
      kpop: '1SuDkmlDf7U0qrMdcjU0xN'      // K-Pop Hits
    }
  },
  
  // App configuration
  app: {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    }
  }
};