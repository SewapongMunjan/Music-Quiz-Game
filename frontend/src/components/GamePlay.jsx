import React from 'react';
import SpotifyLogin from './SpotifyLogin';

const GameStart = ({ onStart, onChangeMode, gameMode, onShowScores, onLoginStatusChange }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full text-center">
      <h2 className="text-xl font-bold mb-4">กติกา</h2>
      <p className="mb-2">1. ฟังเพลงและทายชื่อเพลง</p>
      <p className="mb-2">2. คุณมีเวลา 10 วินาทีในการตอบ</p>
      <p className="mb-6">3. ยิ่งตอบเร็ว คะแนนยิ่งเพิ่ม!</p>
      
      {/* Spotify Login - pass the onLoginStatusChange prop */}
      <SpotifyLogin onLoginStatusChange={onLoginStatusChange} />
      
      <div className="mb-4">
        <h3 className="text-lg font-medium mb-2">เลือกโหมด:</h3>
        <div className="flex space-x-2 justify-center">
          <button 
            onClick={() => onChangeMode('normal')}
            className={`px-3 py-1 rounded ${gameMode === 'normal' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            ทายเพลง
          </button>
          <button 
            onClick={() => onChangeMode('artist')}
            className={`px-3 py-1 rounded ${gameMode === 'artist' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            ทายศิลปิน
          </button>
        </div>
      </div>
      
      <button 
        onClick={onStart}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300 button-hover-effect mb-4"
      >
        เริ่มเกม
      </button>
      
      <div>
        <button 
          onClick={onShowScores}
          className="text-blue-600 hover:text-blue-800 underline transition duration-300"
        >
          ดูคะแนนสูงสุด
        </button>
      </div>
    </div>
  );
};

export default GameStart;