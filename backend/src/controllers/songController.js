const spotifyService = require('../services/spotifyService');
const config = require('../config');
const cache = require('../utils/cache');

// Get songs for the game
exports.getSongs = async (req, res, next) => {
  try {
    // Check cache first
    const cachedSongs = cache.get('songs');
    if (cachedSongs) {
      return res.json(cachedSongs);
    }

    // If not in cache, fetch from Spotify
    const songs = await spotifyService.getPlaylistTracks();
    
    // Cache the result for 1 hour
    cache.set('songs', songs, 3600);
    
    res.json(songs);
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
      preview_url: 'https://p.scdn.co/mp3-preview/samples-url-1',
      image: 'https://via.placeholder.com/300'
    },
    {
      id: '2',
      name: 'คิดถึง',
      artist: 'Bodyslam',
      preview_url: 'https://p.scdn.co/mp3-preview/samples-url-2',
      image: 'https://via.placeholder.com/300'
    },
    {
      id: '3',
      name: 'ใจความสำคัญ',
      artist: 'Scrubb',
      preview_url: 'https://p.scdn.co/mp3-preview/samples-url-3',
      image: 'https://via.placeholder.com/300'
    },
    {
      id: '4',
      name: 'เพียงแค่ใจเรารักกัน',
      artist: 'ดา เอ็นโดรฟิน',
      preview_url: 'https://p.scdn.co/mp3-preview/samples-url-4',
      image: 'https://via.placeholder.com/300'
    },
    {
      id: '5',
      name: 'เรือเล็กควรออกจากฝั่ง',
      artist: 'Bodyslam',
      preview_url: 'https://p.scdn.co/mp3-preview/samples-url-5',
      image: 'https://via.placeholder.com/300'
    }
  ];
  
  res.json(fallbackSongs);
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
    const songs = await spotifyService.getPlaylistTracks(config.spotify.playlists[genre]);
    
    // Cache the result for 1 hour
    cache.set(cacheKey, songs, 3600);
    
    res.json(songs);
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
    
    const songs = await spotifyService.searchTracks(q);
    res.json(songs);
  } catch (error) {
    next(error);
  }
};