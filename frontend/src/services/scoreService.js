// File: frontend/src/services/scoreService.js
const API_BASE_URL = 'http://localhost:3001';

// Save high score
export const saveHighScore = async (scoreData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(scoreData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error saving score:', error);
    
    // If API fails, save to localStorage
    saveScoreToLocalStorage(scoreData);
    throw new Error('ไม่สามารถบันทึกคะแนนไปยังเซิร์ฟเวอร์ได้ บันทึกแบบออฟไลน์แทน');
  }
};

// Save score to localStorage (fallback)
const saveScoreToLocalStorage = (scoreData) => {
  try {
    // Get existing scores
    const existingScores = JSON.parse(localStorage.getItem('musicQuizHighScores') || '[]');
    
    // Add new score
    existingScores.push({
      ...scoreData,
      // Add local ID
      id: `local_${Date.now()}`
    });
    
    // Sort by score (highest first)
    existingScores.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    const topScores = existingScores.slice(0, 10);
    
    // Save back to localStorage
    localStorage.setItem('musicQuizHighScores', JSON.stringify(topScores));
    
    return topScores;
  } catch (error) {
    console.error('Error saving score to localStorage:', error);
    throw new Error('ไม่สามารถบันทึกคะแนนได้');
  }
};