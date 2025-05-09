// File: src/App.js
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import GameStart from './components/GameStart';
import GamePlay from './components/GamePlay';
import GameFeedback from './components/GameFeedback';
import ScoreBoard from './components/ScoreBoard';
import { fetchSongs, getSongsByGenre, getPlaylistTracks } from './services/api';

function App() {
  // Game state
  const [gameState, setGameState] = useState('start'); // 'start', 'playing', 'feedback', 'end', 'scores'
  const [gameMode, setGameMode] = useState('normal'); // 'normal', 'artist'
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [currentSong, setCurrentSong] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isCorrect, setIsCorrect] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [rounds, setRounds] = useState(10);
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [namePrompted, setNamePrompted] = useState(false);
  
  // Audio player reference
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Load songs when component mounts
  useEffect(() => {
    // Check if player name exists in localStorage
    const savedName = localStorage.getItem('musicQuizPlayerName');
    if (savedName) {
      setPlayerName(savedName);
      setNamePrompted(true);
    }
    
    // Load songs
    loadSongs();
    
    // Cleanup function for timer and audio
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Load songs from API
  const loadSongs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchSongs();
      
      if (response && response.length > 0) {
        // Shuffle songs
        const shuffledSongs = [...response].sort(() => Math.random() - 0.5);
        setSongs(shuffledSongs);
      } else {
        throw new Error('No songs available');
      }
    } catch (err) {
      console.error('Error loading songs:', err);
      setError('ไม่สามารถโหลดเพลงได้ โปรดลองอีกครั้งในภายหลัง');
    } finally {
      setIsLoading(false);
    }
  };

  // Load songs by genre
  const loadSongsByGenre = async (genre) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getSongsByGenre(genre);
      
      if (response && response.length > 0) {
        // Shuffle songs
        const shuffledSongs = [...response].sort(() => Math.random() - 0.5);
        setSongs(shuffledSongs);
      } else {
        throw new Error('No songs available for this genre');
      }
    } catch (err) {
      console.error(`Error loading ${genre} songs:`, err);
      setError(`ไม่สามารถโหลดเพลง${genre}ได้ โปรดลองอีกครั้งในภายหลัง`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load songs from playlist
  const loadSongsFromPlaylist = async (playlistId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getPlaylistTracks(playlistId);
      
      if (response && response.length > 0) {
        // Shuffle songs
        const shuffledSongs = [...response].sort(() => Math.random() - 0.5);
        setSongs(shuffledSongs);
      } else {
        throw new Error('No playable songs in this playlist');
      }
    } catch (err) {
      console.error('Error loading playlist songs:', err);
      setError('ไม่สามารถโหลดเพลงจากเพลย์ลิสต์นี้ได้');
    } finally {
      setIsLoading(false);
    }
  };

  // Start game
  const startGame = () => {
    // Check if we need to prompt for name
    if (!playerName && !namePrompted) {
      const name = prompt('กรุณาใส่ชื่อของคุณ:');
      setNamePrompted(true);
      
      if (name) {
        setPlayerName(name);
        localStorage.setItem('musicQuizPlayerName', name);
      } else {
        return; // Don't start game if no name provided
      }
    }
    
    // Reset game state
    setCurrentSongIndex(0);
    setScore(0);
    setTimeLeft(10);
    
    // Set current song
    if (songs.length > 0) {
      setCurrentSong(songs[0]);
      setGameState('playing');
      
      // Play audio
      if (audioRef.current) {
        audioRef.current.src = songs[0].preview_url;
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
      
      // Start timer
      startTimer();
    } else {
      setError('ไม่มีเพลงที่จะเล่น โปรดลองใหม่อีกครั้ง');
    }
  };

  // Timer function
  const startTimer = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Reset time
    setTimeLeft(10);
    
    // Start new timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle timeout
  const handleTimeout = () => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Show feedback (incorrect)
    setIsCorrect(false);
    setEarnedPoints(0);
    setGameState('feedback');
  };

  // Handle guess
  const handleGuess = (guess) => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Check answer
    let isAnswerCorrect = false;
    
    if (gameMode === 'artist') {
      // Check artist name
      isAnswerCorrect = compareStrings(guess, currentSong.artist);
    } else {
      // Check song name
      isAnswerCorrect = compareStrings(guess, currentSong.name);
    }
    
    // Calculate points
    const points = isAnswerCorrect ? Math.max(1, timeLeft) * 10 : 0;
    
    // Update state
    setIsCorrect(isAnswerCorrect);
    setEarnedPoints(points);
    setScore(prev => prev + points);
    setGameState('feedback');
  };

  // String comparison utility
  const compareStrings = (str1, str2) => {
    if (!str1 || !str2) return false;
    
    // Normalize strings for comparison
    const normalize = (s) => s.trim().toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    
    const normalizedStr1 = normalize(str1);
    const normalizedStr2 = normalize(str2);
    
    // Exact match
    if (normalizedStr1 === normalizedStr2) return true;
    
    // Check if one string contains the other
    if (normalizedStr1.includes(normalizedStr2) || normalizedStr2.includes(normalizedStr1)) {
      // Make sure it's a substantial match
      const longerLength = Math.max(normalizedStr1.length, normalizedStr2.length);
      const shorterLength = Math.min(normalizedStr1.length, normalizedStr2.length);
      
      return shorterLength / longerLength >= 0.7;
    }
    
    return false;
  };

  // Handle skip
  const handleSkip = () => {
    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Show feedback (incorrect)
    setIsCorrect(false);
    setEarnedPoints(0);
    setGameState('feedback');
  };

  // Go to next song
  const goToNextSong = () => {
    const nextIndex = currentSongIndex + 1;
    
    // Check if we've reached the end
    if (nextIndex >= Math.min(rounds, songs.length)) {
      setGameState('end');
      return;
    }
    
    // Set next song
    setCurrentSongIndex(nextIndex);
    setCurrentSong(songs[nextIndex]);
    setGameState('playing');
    
    // Play audio
    if (audioRef.current) {
      audioRef.current.src = songs[nextIndex].preview_url;
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    
    // Start timer
    startTimer();
  };

  // Save score
  const saveScore = async () => {
    try {
      // Create score object
      const scoreData = {
        name: playerName || 'ไม่ระบุชื่อ',
        score,
        mode: gameMode,
        date: new Date().toISOString()
      };
      
      // Get existing scores from localStorage
      const existingScores = JSON.parse(localStorage.getItem('musicQuizHighScores') || '[]');
      
      // Add new score
      existingScores.push(scoreData);
      
      // Sort by score (highest first)
      existingScores.sort((a, b) => b.score - a.score);
      
      // Keep only top 10
      const topScores = existingScores.slice(0, 10);
      
      // Save back to localStorage
      localStorage.setItem('musicQuizHighScores', JSON.stringify(topScores));
      
      alert('บันทึกคะแนนเรียบร้อย!');
    } catch (error) {
      console.error('Error saving score:', error);
      alert('ไม่สามารถบันทึกคะแนนได้');
    }
  };

  // Change game mode
  const changeGameMode = (mode) => {
    setGameMode(mode);
  };

  // Show scores
  const showScores = () => {
    setGameState('scores');
  };

  // Spotify login status change handler
  const handleLoginStatusChange = (status) => {
    setIsLoggedIn(status);
  };

  // Loading state
  if (isLoading && gameState === 'start') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full text-center">
          <div className="text-xl mb-4">กำลังโหลดเพลง...</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && gameState === 'start') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full text-center">
          <div className="text-xl mb-4 text-red-600">เกิดข้อผิดพลาด</div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition duration-300"
          >
            ลองใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
      {/* Hidden audio player */}
      <audio ref={audioRef} />
      
      {/* Game states */}
      {gameState === 'start' && (
        <GameStart
          onStart={startGame}
          onChangeMode={changeGameMode}
          gameMode={gameMode}
          onShowScores={showScores}
          onLoginStatusChange={handleLoginStatusChange}
        />
      )}
      
      {gameState === 'playing' && currentSong && (
        <GamePlay
          currentSong={currentSong}
          timeLeft={timeLeft}
          score={score}
          round={currentSongIndex + 1}
          maxRounds={Math.min(rounds, songs.length)}
          onSubmit={handleGuess}
          onSkip={handleSkip}
          gameMode={gameMode}
        />
      )}
      
      {gameState === 'feedback' && (
        <GameFeedback
          isCorrect={isCorrect}
          correctAnswer={currentSong}
          earnedPoints={earnedPoints}
          onContinue={goToNextSong}
          isGameOver={false}
          gameMode={gameMode}
        />
      )}
      
      {gameState === 'end' && (
        <GameFeedback
          isCorrect={false}
          correctAnswer={{}}
          earnedPoints={0}
          onContinue={() => {}}
          isGameOver={true}
          finalScore={score}
          onRestart={startGame}
          onSaveScore={saveScore}
        />
      )}
      
      {gameState === 'scores' && (
        <ScoreBoard onBack={() => setGameState('start')} />
      )}
    </div>
  );
}

export default App;