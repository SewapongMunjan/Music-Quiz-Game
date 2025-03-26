import React, { useState, useEffect } from 'react';

const GamePlay = ({ 
  currentSong, 
  timeLeft, 
  score, 
  round, 
  maxRounds, 
  onSubmit, 
  onSkip,
  gameMode
}) => {
  const [guess, setGuess] = useState('');
  
  useEffect(() => {
    setGuess('');  // Reset guess when song changes
  }, [currentSong]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (guess.trim()) {
      onSubmit(guess);
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-bold">รอบ: {round}/{maxRounds}</div>
        <div className="text-lg font-bold">คะแนน: {score}</div>
      </div>
      
      <div className="mb-4 text-center">
        <div className="text-3xl font-bold mb-2">{timeLeft}</div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full timer-bar" 
            style={{ width: `${(timeLeft / 10) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mb-6 text-center">
        {currentSong?.image ? (
          <img 
            src={currentSong.image} 
            alt="อัลบั้ม" 
            className="w-32 h-32 mx-auto mb-2 rounded-lg object-cover album-image"
          />
        ) : (
          <div className="w-32 h-32 mx-auto mb-2 rounded-full bg-gray-300 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
            </svg>
          </div>
        )}
        <p className="text-sm text-gray-600">
          กำลังเล่นเพลง... {gameMode === 'artist' ? 'ทายชื่อศิลปิน' : 'ทายชื่อเพลง'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder={gameMode === 'artist' ? "พิมพ์ชื่อศิลปิน..." : "พิมพ์ชื่อเพลง..."}
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 button-hover-effect"
        >
          ตอบ
        </button>
      </form>
      
      <button
        onClick={onSkip}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
      >
        ยอมแพ้
      </button>
    </div>
  );
};

export default GamePlay;