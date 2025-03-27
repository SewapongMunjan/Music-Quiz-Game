import React, { useState, useEffect } from 'react';
import GameStart from './components/GameStart';
import GamePlay from './components/GamePlay';
import GameFeedback from './components/GameFeedback';
import ScoreBoard from './components/ScoreBoard';
import SpotifyLogin from './components/SpotifyLogin';
import UserPlaylistSelector from './components/UserPlaylistSelector';
import { fetchSongs, fetchUserProfile } from './services/api';
import useAudio from './hooks/useAudio';
import './App.css';

function App() {
  // เพิ่ม state สำหรับ Spotify
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
  
  // Game states (คงเดิม)
  const [gameState, setGameState] = useState('start'); // start, playing, feedback, end
  const [gameMode, setGameMode] = useState('normal'); // normal, artist
  const [playlist, setPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRounds] = useState(5);
  const [timeLeft, setTimeLeft] = useState(10);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);
  
  // Audio hook
  const { setup, play, stop } = useAudio();

  // ตรวจสอบว่าได้ login แล้วหรือไม่ จาก hash ในเมื่อกลับมาจาก Spotify Auth
  useEffect(() => {
    const hash = window.location.hash;
    let token = null;
    
    if (hash) {
      token = hash
        .substring(1)
        .split('&')
        .find(elem => elem.startsWith('access_token'))
        ?.split('=')[1];
      
      if (token) {
        // Clear hash from URL
        window.location.hash = '';
        setIsLoggedIn(true);
        
        // ดึงข้อมูลผู้ใช้
        fetchUserData();
      }
    }
    
    // ถ้าไม่มี token ให้ตรวจสอบว่าได้ login ไว้แล้วหรือไม่
    if (!token) {
      fetchUserData();
    }
  }, []);

  // ดึงข้อมูลผู้ใช้
  const fetchUserData = async () => {
    try {
      const user = await fetchUserProfile();
      if (user && user.id) {
        setIsLoggedIn(true);
        setUserProfile(user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // ดึงเพลง (ปรับปรุงให้รองรับ playlist ที่เลือก)
  useEffect(() => {
    const loadSongs = async () => {
      try {
        setLoading(true);
        const songs = await fetchSongs(selectedPlaylistId);
        setPlaylist(songs);
        setLoading(false);
      } catch (error) {
        console.error('Error loading songs:', error);
        setLoading(false);
      }
    };

    if (gameState === 'start' || selectedPlaylistId) {
      loadSongs();
    }
  }, [selectedPlaylistId]);

  // ส่วนอื่นๆ เหมือนเดิม...
  
  // Start the game
const handleStart = () => {
  console.log("Starting game, playlist:", playlist);
  // ตรวจสอบว่ามีเพลงในรายการหรือไม่
  if (!playlist || playlist.length === 0) {
    console.error("No songs in playlist");
    alert("ไม่พบเพลงในรายการ กรุณาลองใหม่อีกครั้ง");
    return;
  }
  
  setScore(0);
  setRound(1);
  setGameState('playing');
  
  // เรียกฟังก์ชัน nextSong ภายใน setTimeout เพื่อให้แน่ใจว่า state อัพเดทแล้ว
  setTimeout(() => {
    nextSong();
  }, 100);
};
  
  // เลือก playlist
  const handleSelectPlaylist = (playlistId) => {
    setSelectedPlaylistId(playlistId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">เกมแข่งทายเพลง</h1>
      
      {gameState === 'start' && !showScoreboard && (
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full text-center">
          {/* แสดงข้อมูลผู้ใช้ถ้า login แล้ว */}
          {isLoggedIn && userProfile && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-center">
              {userProfile.images && userProfile.images[0] ? (
                  <img src={userProfile.images[0].url} alt={userProfile.display_name} className="w-10 h-10 rounded-full mr-3" />
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-full mr-3 flex items-center justify-center text-white font-bold">
                    {userProfile.display_name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-lg font-medium">สวัสดี, {userProfile.display_name}</div>
              </div>
            </div>
          )}
          
          {/* ถ้ายังไม่ได้ login แสดงปุ่ม login */}
          {!isLoggedIn && <SpotifyLogin />}
          
          {/* ถ้า login แล้ว แสดงตัวเลือก playlist */}
          {isLoggedIn && <UserPlaylistSelector onSelectPlaylist={handleSelectPlaylist} />}
          
          <GameStart 
            onStart={handleStart} 
            onChangeMode={setGameMode} 
            gameMode={gameMode} 
            onShowScores={handleShowScores}
          />
        </div>
      )}
      
      {showScoreboard && (
        <ScoreBoard onBack={handleRestart} />
      )}
      
      {gameState === 'playing' && (
        <GamePlay 
          currentSong={currentSong} 
          timeLeft={timeLeft} 
          score={score} 
          round={round} 
          maxRounds={maxRounds} 
          onSubmit={handleSubmit} 
          onSkip={handleSkip}
          gameMode={gameMode}
        />
      )}
      
      {gameState === 'feedback' && (
        <GameFeedback 
          isCorrect={isCorrect} 
          correctAnswer={currentSong} 
          earnedPoints={earnedPoints} 
          onContinue={handleContinue} 
          isGameOver={false}
          gameMode={gameMode}
        />
      )}
      
      {gameState === 'end' && (
        <GameFeedback 
          isGameOver={true} 
          finalScore={score} 
          onRestart={handleRestart}
          onSaveScore={saveHighScore}
        />
      )}
    </div>
  );
}

export default App;