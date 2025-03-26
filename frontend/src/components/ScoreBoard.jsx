import React, { useState, useEffect } from 'react';
import { getHighScores } from '../services/api';

const ScoreBoard = ({ onBack }) => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadScores = async () => {
      try {
        // First try to load from API
        const apiScores = await getHighScores();
        if (apiScores && apiScores.length > 0) {
          setScores(apiScores);
          setLoading(false);
          return;
        }
        
        // Fallback to localStorage if API fails
        const localScores = JSON.parse(localStorage.getItem('musicQuizHighScores') || '[]');
        setScores(localScores);
      } catch (error) {
        // Fallback to localStorage if API fails
        const localScores = JSON.parse(localStorage.getItem('musicQuizHighScores') || '[]');
        setScores(localScores);
      } finally {
        setLoading(false);
      }
    };

    loadScores();
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">คะแนนสูงสุด</h2>
      
      {loading ? (
        <div className="text-center py-4">กำลังโหลด...</div>
      ) : scores.length > 0 ? (
        <div className="mb-6">
          <div className="grid grid-cols-12 font-bold mb-2 text-gray-700 border-b pb-2">
            <div className="col-span-2 text-center">#</div>
            <div className="col-span-6">ชื่อผู้เล่น</div>
            <div className="col-span-4 text-right">คะแนน</div>
          </div>
          
          {scores.map((score, index) => (
            <div 
              key={index} 
              className={`grid grid-cols-12 py-2 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
            >
              <div className="col-span-2 text-center font-medium">
                {index === 0 && <span className="text-yellow-500">🏆</span>}
                {index === 1 && <span className="text-gray-400">🥈</span>}
                {index === 2 && <span className="text-amber-600">🥉</span>}
                {index > 2 && index + 1}
              </div>
              <div className="col-span-6 truncate">{score.name}</div>
              <div className="col-span-4 text-right font-medium">{score.score}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 mb-6 text-gray-500">
          ยังไม่มีคะแนนที่บันทึกไว้
        </div>
      )}
      
      <button
        onClick={onBack}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 button-hover-effect"
      >
        กลับไปหน้าหลัก
      </button>
    </div>
  );
};

export default ScoreBoard;