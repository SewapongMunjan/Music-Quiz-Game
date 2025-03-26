// API Service for communicating with the backend

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Fetch songs for the game
export const fetchSongs = async () => {
  try {
    const response = await fetch(`${API_URL}/api/songs`);
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

// Fetch songs by genre
export const fetchSongsByGenre = async (genre) => {
  try {
    const response = await fetch(`${API_URL}/api/songs/genre/${genre}`);
    if (!response.ok) {
      throw new Error('Failed to fetch songs by genre');
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching songs for genre ${genre}:`, error);
    return [];
  }
};

// Search for songs
export const searchSongs = async (query) => {
  try {
    const response = await fetch(`${API_URL}/api/songs/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search songs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching songs:', error);
    return [];
  }
};

// Report a score
export const reportScore = async (playerName, score) => {
  try {
    const response = await fetch(`${API_URL}/api/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ playerName, score }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error reporting score:', error);
    return null;
  }
};

// Get high scores
export const getHighScores = async () => {
  try {
    const response = await fetch(`${API_URL}/api/scores/top`);
    if (!response.ok) {
      throw new Error('Failed to fetch high scores');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching high scores:', error);
    return [];
  }
};