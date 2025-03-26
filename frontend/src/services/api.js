// API Service for communicating with the backend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Fetch songs for the game
export const fetchSongs = async (playlistId = null) => {
  try {
    // ถ้ามี playlistId ให้ดึงเพลงจาก playlist นั้น
    const url = playlistId 
      ? `${API_URL}/api/spotify/playlist/${playlistId}/tracks` 
      : `${API_URL}/api/songs`;
      
    const response = await fetch(url, {
      credentials: 'include' // สำคัญเพื่อส่ง cookies
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch songs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching songs:', error);
    // Try fallback if main API fails
    try {
      const fallbackResponse = await fetch(`${API_URL}/api/fallback-songs`);
      return await fallbackResponse.json();
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      // Return empty array if both fail - this will trigger the app to show an error
      return [];
    }
  }
};

// Fetch user profile
export const fetchUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/api/spotify/me`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// Fetch user playlists
export const fetchUserPlaylists = async () => {
  try {
    const response = await fetch(`${API_URL}/api/spotify/playlists`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch playlists');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return [];
  }
};

// ส่วนอื่นๆ คงเดิม
export const fetchSongsByGenre = async (genre) => { /*...*/ };
export const searchSongs = async (query) => { /*...*/ };
export const reportScore = async (playerName, score) => { /*...*/ };
export const getHighScores = async () => { /*...*/ };