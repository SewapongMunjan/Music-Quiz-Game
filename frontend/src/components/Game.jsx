import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameStart from '../components/GameStart';
import GamePlay from '../components/GamePlay';
import GameFeedback from '../components/GameFeedback';
import ScoreBoard from '../components/ScoreBoard';
import UserPlaylistSelector from '../components/UserPlaylistSelector';
import { getSongs, getSongsByGenre, getPlaylistTracks } from '../services/api';
import { saveHighScore } from '../services/scoreService';

// Utilities for string comparison
import { compareStrings } from '../utils/stringUtils';

const Game = () => {
  // Game state management
  const [gameState, setGameState] = useState('start'); // start, playing, feedback, end, scores
  const [gameMode, setGameMode] = useState('normal'); // normal, artist
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
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [isNamePromptShown, setIsNamePromptShown] = useState(false); // Track if name prompt has been shown

  // Audio player
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  // Load songs when component mounts
  useEffect(() => {
    const loadSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get songs from API
        const response = await getSongs();
        
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

    loadSongs();
    
    // Check if player name exists in localStorage
    const savedName = localStorage.getItem('musicQuizPlayerName');
    if (savedName) {
      setPlayerName(savedName);
    }
  }, []);

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

  // Load songs from user's playlist
  const loadSongsFromPlaylist = async (playlistId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getPlaylistTracks(playlistId);
      
      if (response && response.length > 0) {
        // Shuffle songs
        const shuffledSongs = [...response].sort(() => Math.random() - 0.5);
        setSongs(shuffledSongs);
        setShowPlaylistSelector(false);
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
  const startGame = useCallback(() => {
    // Check if player name is set
    if (!playerName && !isNamePromptShown) {
      const name = prompt('กรุณาใส่ชื่อของคุณ:');
      setIsNamePromptShown(true); // Mark that we've shown the prompt
      
      if (name) {
        setPlayerName(name);
        localStorage.setItem('musicQuizPlayerName', name);
      } else {
        return; // Don't start game if no name provided
      }
    }
    
    // Reset game state
    setGameState('playing');
    setCurrentSongIndex(0);
    setScore(0);
    setTimeLeft(10);
    
    // Set current song
    if (songs.length > 0) {
      setCurrentSong(songs[0]);
      
      // Play audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = songs[0].preview_url;
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setError('ไม่สามารถเล่นเพลงได้ โปรดลองอีกครั้ง');
        });
      }
      
      // Start timer
      startTimer();
    }
  }, [playerName, songs, isNamePromptShown]);

  // Timer function
  const startTimer = useCallback(() => {
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
  }, []);

  // Handle timeout
  const handleTimeout = useCallback(() => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Show feedback
    setIsCorrect(false);
    setEarnedPoints(0);
    setGameState('feedback');
  }, []);

  // Handle user guess
  const handleGuess = useCallback((guess) => {
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
  }, [gameMode, currentSong, timeLeft]);

  // Handle skip
  const handleSkip = useCallback(() => {
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
  }, []);

  // Go to next song
  const goToNextSong = useCallback(() => {
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
  }, [currentSongIndex, rounds, songs, startTimer]);

  // Save high score
  const saveScore = useCallback(async () => {
    try {
      // Create score object
      const scoreData = {
        name: playerName,
        score,
        mode: gameMode,
        date: new Date().toISOString()
      };
      
      // Save to API (or localStorage as fallback)
      await saveHighScore(scoreData);
      
      alert('บันทึกคะแนนเรียบร้อย!');
    } catch (error) {
      console.error('Error saving score:', error);
      
      // Fallback to localStorage
      try {
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
        
        alert('บันทึกคะแนนเรียบร้อย! (แบบออฟไลน์)');
      } catch (localError) {
        console.error('Error saving score to localStorage:', localError);
        alert('ไม่สามารถบันทึกคะแนนได้');
      }
    }
  }, [playerName, score, gameMode]);

  // Change game mode
  const changeGameMode = (mode) => {
    setGameMode(mode);
  };

  // Show score board
  const showScores = () => {
    setGameState('scores');
  };

  // Go back to start
  const goToStart = () => {
    setGameState('start');
  };

  // Handle Spotify login status change
  const handleLoginStatusChange = (status) => {
    setIsLoggedIn(status);
  };

  // Handle playlist selection
  const handleShowPlaylistSelector = () => {
    if (isLoggedIn) {
      setShowPlaylistSelector(true);
    } else {
      alert('กรุณาเข้าสู่ระบบ Spotify ก่อน');
    }
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  // Render loading state
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

  // Render error state
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
      {/* Audio Player (hidden) */}
      <audio ref={audioRef} />
      
      {/* Game Content */}
      {gameState === 'start' && !showPlaylistSelector && (
        <GameStart
          onStart={startGame}
          onChangeMode={changeGameMode}
          gameMode={gameMode}
          onShowScores={showScores}
          onLoginStatusChange={handleLoginStatusChange}
          onSelectPlaylist={handleShowPlaylistSelector}
          isLoggedIn={isLoggedIn}
        />
      )}
      
      {showPlaylistSelector && (
        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-center">เลือกเพลย์ลิสต์</h2>
          <UserPlaylistSelector onSelectPlaylist={loadSongsFromPlaylist} />
          <button
            onClick={() => setShowPlaylistSelector(false)}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300"
          >
            กลับ
          </button>
        </div>
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
        <ScoreBoard onBack={goToStart} />
      )}
    </div>
  );
};

export default Game;