import React, { useEffect } from 'react';

const GameFeedback = ({ 
  isCorrect, 
  correctAnswer, 
  earnedPoints, 
  onContinue, 
  isGameOver, 
  finalScore, 
  onRestart,
  onSaveScore,
  gameMode
}) => {
  
  useEffect(() => {
    // Auto-save score when game is over
    if (isGameOver && onSaveScore) {
      onSaveScore();
    }
  }, [isGameOver, onSaveScore]);

  return (
    <div className={`bg-white rounded-lg p-6 shadow-lg max-w-md w-full text-center ${isCorrect ? 'correct-answer-animation' : isGameOver ? '' : 'wrong-answer-animation'}`}>
      {!isGameOver ? (
        <>
          <div className={`text-xl mb-4 font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
            {isCorrect 
              ? `ถูกต้อง! +${earnedPoints} คะแนน` 
              : gameMode === 'artist'
                ? `ไม่ถูกต้อง ศิลปินนี้คือ "${correctAnswer.artist}"`
                : `ไม่ถูกต้อง เพลงนี้คือ "${correctAnswer.name}" โดย ${correctAnswer.artist}`}
          </div>
          
          {!isCorrect && (
            <div className="mb-4">
              <img 
                src={correctAnswer.image} 
                alt="อัลบั้ม" 
                className="w-24 h-24 mx-auto rounded-lg object-cover"
              />
            </div>
          )}
          
          <button
            onClick={onContinue}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 button-hover-effect mb-4"
          >
            เพลงต่อไป
          </button>
        </>
      ) : (
        <>
          <div className="text-2xl font-bold mb-4">จบเกม!</div>
          <div className="text-xl mb-6">คะแนนทั้งหมดของคุณคือ {finalScore}</div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <button
              onClick={onRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 button-hover-effect"
            >
              เล่นอีกครั้ง
            </button>
            
            <button
              onClick={onSaveScore}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 button-hover-effect"
            >
              บันทึกคะแนน
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default GameFeedback;