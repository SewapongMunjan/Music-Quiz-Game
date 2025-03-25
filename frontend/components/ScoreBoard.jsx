import React, { useState, useEffect } from 'react';

const ScoreBoard = ({ onBack }) => {
  const [highScores, setHighScores] = useState([]);

  useEffect(() => {
    // Load high scores from local storage
    try {
      const savedScores = JSON.parse(localStorage.getItem('musicQuizHighScores') || '[]');
      // Sort scores in descending order
      const sortedScores = savedScores.sort((a, b) => b.score - a.score);
      setHighScores(sortedScores);
    } catch (error) {
      console.error('Error loading high scores:', error);
    }
  }, []);

  // Clear high scores
  const handleClearScores = () => {
    try {
      localStorage.removeItem('musicQuizHighScores');
      setHighScores([]);
    } catch (error) {
      console.error('Error clearing high scores:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-4 text-center">คะแนนสูงสุด</h2>
      
      {highScores.length === 0 ? (
        <div className="text-center text-gray-600 mb-4">
          ยังไม่มีคะแนนสูงสุด
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {highScores.map((score, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <span className="font-medium">{index + 1}. {score.name}</span>
              <span className="font-bold text-blue-600">{score.score} คะแนน</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onBack}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 button-hover-effect"
        >
          กลับหน้าหลัก
        </button>
        
        {highScores.length > 0 && (
          <button
            onClick={handleClearScores}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 button-hover-effect"
          >
            ล้างคะแนน
          </button>
        )}
      </div>
    </div>
  );
};

export default ScoreBoard;