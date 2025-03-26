const spotifyService = require('../services/spotifyService');
const config = require('../config');
const cache = require('../utils/cache');

// Get songs for the game
// อัพเดตส่วนนี้ถ้าต้องการ
exports.getSongs = async (req, res, next) => {
  try {
    // Check cache first
    const cachedSongs = cache.get('songs');
    if (cachedSongs) {
      return res.json(cachedSongs);
    }

    // If not in cache, fetch from Spotify
    try {
      const songs = await spotifyService.getPlaylistTracks();
      
      // Cache the result for 1 hour
      if (songs && songs.length > 0) {
        cache.set('songs', songs, 3600);
      }
      
      return res.json(songs);
    } catch (error) {
      console.error('Error fetching songs from Spotify:', error);
      // If Spotify fails, return fallback songs
      return this.getFallbackSongs(req, res);
    }
  } catch (error) {
    next(error);
  }
};

// Get fallback songs if Spotify API fails
exports.getFallbackSongs = (req, res) => {
  const fallbackSongs = [
    {
      id: '1',
      name: 'ขอเวลาลืม',
      artist: 'Aun Feeble Heart',
      preview_url: 'https://p.scdn.co/mp3-preview/d26b3ef7fbdbc3e8e1c88d486bb67ad300e3302c',
      image: 'https://i.scdn.co/image/ab67616d0000b273aedfea23aa334722d93c68a3'
    },
    {
      id: '2',
      name: 'คิดถึง',
      artist: 'Bodyslam',
      preview_url: 'https://p.scdn.co/mp3-preview/12e809f4386c1d1c0ee9322501d5220817ea30d5',
      image: 'https://i.scdn.co/image/ab67616d0000b2734ae252d82e388ae5a8f2d651'
    },
    {
      id: '3',
      name: 'ใจความสำคัญ',
      artist: 'Scrubb',
      preview_url: 'https://p.scdn.co/mp3-preview/9a611215e4486d874c297fd6d101c7f0f3564215',
      image: 'https://i.scdn.co/image/ab67616d0000b2738f3b6f061560d8481eb152e5'
    },
    {
      id: '4',
      name: 'เพียงแค่ใจเรารักกัน',
      artist: 'ดา เอ็นโดรฟิน',
      preview_url: 'https://p.scdn.co/mp3-preview/8f20fd0aadc237f712c2d547352a328bef8894e6',
      image: 'https://i.scdn.co/image/ab67616d0000b2733e67d851bf5f06e37c581c1d'
    },
    {
      id: '5',
      name: 'เรือเล็กควรออกจากฝั่ง',
      artist: 'Bodyslam',
      preview_url: 'https://p.scdn.co/mp3-preview/8153a07ee0881d5bf2fb4a539fe4cdb1243d8dbe',
      image: 'https://i.scdn.co/image/ab67616d0000b273bc9f74e19ea7f5f3f2189a60'
    }
  ];
  
  return res.json(fallbackSongs);
};

// Get songs by genre
exports.getSongsByGenre = async (req, res, next) => {
  try {
    const { genre } = req.params;
    
    // Check if this is a valid genre
    if (!config.spotify.playlists[genre]) {
      return res.status(400).json({ error: 'Invalid genre' });
    }
    
    // Check cache first
    const cacheKey = `songs_${genre}`;
    const cachedSongs = cache.get(cacheKey);
    if (cachedSongs) {
      return res.json(cachedSongs);
    }
    
    // Fetch songs from Spotify for this genre
    try {
      const songs = await spotifyService.getPlaylistTracks(config.spotify.playlists[genre]);
      
      // Cache the result for 1 hour
      cache.set(cacheKey, songs, 3600);
      
      return res.json(songs);
    } catch (error) {
      console.error(`Error fetching songs for genre ${genre}:`, error);
      return this.getFallbackSongs(req, res);
    }
  } catch (error) {
    next(error);
  }
};

// Search songs
exports.searchSongs = async (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ error: 'Search query too short' });
    }
    
    try {
      const songs = await spotifyService.searchTracks(q);
      return res.json(songs);
    } catch (error) {
      console.error('Error searching tracks:', error);
      return this.getFallbackSongs(req, res);
    }
  } catch (error) {
    next(error);
  }
};