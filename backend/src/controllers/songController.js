// File: backend/src/controllers/songController.js
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
    try {
      const songs = await spotifyService.getPlaylistTracks(null, req);
      
      // Cache the result for 1 hour
      if (songs && songs.length > 0) {
        cache.set('songs', songs, 3600);
        return res.json(songs);
      } else {
        // If no songs found, throw error to trigger fallback
        throw new Error('No songs returned from Spotify');
      }
    } catch (error) {
      console.error('Error fetching songs from Spotify:', error);
      // If Spotify fails, use fallback songs
      const fallbackSongs = getFallbackSongsArray();
      return res.json(fallbackSongs);
    }
  } catch (error) {
    console.error('Final error handler:', error);
    const fallbackSongs = getFallbackSongsArray();
    return res.json(fallbackSongs);
  }
};

// Get fallback songs if Spotify API fails
exports.getFallbackSongs = (req, res) => {
  const fallbackSongs = getFallbackSongsArray();
  return res.json(fallbackSongs);
};

// Helper function to get fallback songs array
const getFallbackSongsArray = () => {
  return [
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
    },
    {
      id: '6',
      name: 'แพ้ทาง',
      artist: 'Labanoon',
      preview_url: 'https://p.scdn.co/mp3-preview/5a8f3899a1e4cb6539da13f65897a8af7181958d',
      image: 'https://i.scdn.co/image/ab67616d0000b27314abe21fd8d3a0c72c9e0f09'
    },
    {
      id: '7',
      name: 'อยู่ตรงนี้นานกว่าเดิม',
      artist: 'Palmy',
      preview_url: 'https://p.scdn.co/mp3-preview/89f8dea61080414f6e25dbbd96b5799026df9539',
      image: 'https://i.scdn.co/image/ab67616d0000b273c7e3a2d3ef8fa25f5d60ddd6'
    },
    {
      id: '8',
      name: 'ไม่บอกเธอ',
      artist: 'Bedroom Audio',
      preview_url: 'https://p.scdn.co/mp3-preview/e4c9f886dc6c7d41db58b31bdc6b6bd8d0475ee8',
      image: 'https://i.scdn.co/image/ab67616d0000b2739ec45a685a73f6caac7d9d3f'
    },
    {
      id: '9',
      name: 'ทุกลมหายใจ',
      artist: 'Singular',
      preview_url: 'https://p.scdn.co/mp3-preview/3f6d94f6bc2f7f4f59d904535a7aed81f50fe9a6',
      image: 'https://i.scdn.co/image/ab67616d0000b2737265fdb5acf4fce76efa8f75'
    },
    {
      id: '10',
      name: 'ฤดูร้อน',
      artist: 'Paradox',
      preview_url: 'https://p.scdn.co/mp3-preview/b3c30dded7d9c9caa0962c3c3c699e396881e8d2',
      image: 'https://i.scdn.co/image/ab67616d0000b2736ea0545bbfc86457d23ae657'
    }
  ];
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
      const songs = await spotifyService.getPlaylistTracks(config.spotify.playlists[genre], req);
      
      // Cache the result for 1 hour
      if (songs && songs.length > 0) {
        cache.set(cacheKey, songs, 3600);
        return res.json(songs);
      } else {
        throw new Error(`No songs found for genre ${genre}`);
      }
    } catch (error) {
      console.error(`Error fetching songs for genre ${genre}:`, error);
      return res.json(getFallbackSongsArray());
    }
  } catch (error) {
    console.error('Final genre error handler:', error);
    return res.json(getFallbackSongsArray());
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
      if (songs && songs.length > 0) {
        return res.json(songs);
      } else {
        throw new Error('No search results found');
      }
    } catch (error) {
      console.error('Error searching tracks:', error);
      return res.json(getFallbackSongsArray());
    }
  } catch (error) {
    console.error('Final search error handler:', error);
    return res.json(getFallbackSongsArray());
  }
};