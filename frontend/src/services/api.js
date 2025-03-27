// File: src/services/api.js
const API_BASE_URL = 'http://localhost:3001';

// Function to handle API errors consistently
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Check if we have a response with error data
  if (error.response && error.response.data) {
    throw new Error(error.response.data.message || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
  }
  
  // Network or other errors
  throw new Error('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
};

// Get songs for the game
export const fetchSongs = async () => {
  try {
    console.log('Fetching songs from API...');
    const response = await fetch(`${API_BASE_URL}/api/songs`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error(`HTTP error ${response.status} when fetching songs`);
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error('No songs returned from API');
      throw new Error('No songs available');
    }
    
    console.log(`Successfully fetched ${data.length} songs`);
    return data;
  } catch (error) {
    console.error('Error in fetchSongs:', error);
    
    // Try fallback songs if main API fails
    console.log('Trying fallback songs API...');
    try {
      const fallbackResponse = await fetch(`${API_BASE_URL}/api/fallback-songs`);
      
      if (!fallbackResponse.ok) {
        console.error(`HTTP error ${fallbackResponse.status} when fetching fallback songs`);
        throw new Error(`HTTP error ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackData || !Array.isArray(fallbackData) || fallbackData.length === 0) {
        console.error('No fallback songs available');
        throw new Error('No fallback songs available');
      }
      
      console.log(`Successfully fetched ${fallbackData.length} fallback songs`);
      return fallbackData;
    } catch (fallbackError) {
      console.error('Error fetching fallback songs:', fallbackError);
      
      // Last resort - hardcoded fallback songs
      console.log('Using hardcoded fallback songs as last resort');
      const hardcodedSongs = getHardcodedFallbackSongs();
      
      if (hardcodedSongs.length > 0) {
        return hardcodedSongs;
      }
      
      throw new Error('ไม่สามารถโหลดเพลงได้');
    }
  }
};

// Alias for compatibility
export const getSongs = fetchSongs;

// Get songs by genre
export const getSongsByGenre = async (genre) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/songs/genre/${genre}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error(`No songs available for genre ${genre}`);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${genre} songs:`, error);
    
    // Try fallback songs
    try {
      const fallbackResponse = await fetch(`${API_BASE_URL}/api/fallback-songs`);
      if (!fallbackResponse.ok) {
        throw new Error(`HTTP error ${fallbackResponse.status}`);
      }
      
      const fallbackData = await fallbackResponse.json();
      
      if (!fallbackData || !Array.isArray(fallbackData) || fallbackData.length === 0) {
        throw new Error('No fallback songs available');
      }
      
      return fallbackData;
    } catch (fallbackError) {
      console.error('Error fetching fallback songs:', fallbackError);
      
      // Last resort - hardcoded fallback songs
      const hardcodedSongs = getHardcodedFallbackSongs();
      
      if (hardcodedSongs.length > 0) {
        return hardcodedSongs;
      }
      
      throw new Error(`ไม่สามารถโหลดเพลง${genre}ได้`);
    }
  }
};

// Search songs
export const searchSongs = async (query) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/songs/search?q=${encodeURIComponent(query)}`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error searching songs:', error);
    
    // Return hardcoded fallback songs for search as well
    return getHardcodedFallbackSongs();
  }
};

// Get user's playlists
export const getUserPlaylists = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/spotify/playlists`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching playlists:', error);
    throw new Error('ไม่สามารถดึงข้อมูลเพลย์ลิสต์ได้');
  }
};

// Get tracks from a playlist
export const getPlaylistTracks = async (playlistId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/spotify/playlist/${playlistId}/tracks`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('No tracks available in this playlist');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    
    // Try fallback songs
    try {
      const fallbackResponse = await fetch(`${API_BASE_URL}/api/fallback-songs`);
      if (!fallbackResponse.ok) {
        throw new Error(`HTTP error ${fallbackResponse.status}`);
      }
      return await fallbackResponse.json();
    } catch (fallbackError) {
      console.error('Error fetching fallback songs:', fallbackError);
      
      // Last resort - hardcoded fallback songs
      return getHardcodedFallbackSongs();
    }
  }
};

// Get high scores
export const getHighScores = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scores`);
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching high scores:', error);
    
    // Return empty array - we'll fallback to localStorage in the component
    return [];
  }
};

// Last resort - hardcoded fallback songs
const getHardcodedFallbackSongs = () => {
  console.log('Using hardcoded fallback songs');
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
    }
  ];
};

// String comparison utility for answer checking
export const compareStrings = (str1, str2) => {
  if (!str1 || !str2) return false;
  
  // Process strings for comparison
  const normalize = (s) => s.trim().toLowerCase()
    .replace(/\s+/g, ' ')           // Normalize spaces
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ""); // Remove punctuation
  
  const normalizedStr1 = normalize(str1);
  const normalizedStr2 = normalize(str2);
  
  // Exact match
  if (normalizedStr1 === normalizedStr2) return true;
  
  // Check if str1 is contained within str2 or vice versa
  if (normalizedStr1.includes(normalizedStr2) || normalizedStr2.includes(normalizedStr1)) {
    // Make sure it's a substantial match (at least 70% of the longer string)
    const longerLength = Math.max(normalizedStr1.length, normalizedStr2.length);
    const shorterLength = Math.min(normalizedStr1.length, normalizedStr2.length);
    
    return shorterLength / longerLength >= 0.7;
  }
  
  return false;
};