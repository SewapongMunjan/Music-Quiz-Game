import React, { useState, useEffect } from 'react';
import GameStart from './components/GameStart';
import GamePlay from './components/GamePlay';
import GameFeedback from './components/GameFeedback';
import ScoreBoard from './components/ScoreBoard';
import { fetchSongs } from './services/api';
import useAudio from './hooks/useAudio';
import './App.css';

function App() {
  // Game states
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

  // Fetch songs from backend on component mount
  useEffect(() => {
    const loadSongs = async () => {
      try {
        const songs = await fetchSongs();
        setPlaylist(songs);
        setLoading(false);
      } catch (error) {
        console.error('Error loading songs:', error);
        setLoading(false);
      }
    };

    loadSongs();
  }, []);

  // Timer effect when song is playing
  useEffect(() => {
    let timer = null;
    
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      handleSkip();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, timeLeft]);

  // Start the game
  const handleStart = () => {
    setScore(0);
    setRound(1);
    setGameState('playing');
    nextSong();
  };

  // Play the next song
  const nextSong = () => {
    if (round > maxRounds) {
      setGameState('end');
      return;
    }

    if (playlist.length === 0) {
      setGameState('end');
      return;
    }

    // Pick a random song
    const randomIndex = Math.floor(Math.random() * playlist.length);
    const nextSong = playlist[randomIndex];
    
    // Remove the chosen song to avoid repeats
    const updatedPlaylist = [...playlist];
    updatedPlaylist.splice(randomIndex, 1);
    
    setCurrentSong(nextSong);
    setPlaylist(updatedPlaylist);
    setTimeLeft(10);
    setGameState('playing');
    
    // Set up and play the audio
    const audio = setup(nextSong.preview_url);
    play();
  };

  // Handle guess submission
  const handleSubmit = (guess) => {
    stop();
    
    // Check if guess is correct based on game mode
    const userGuess = guess.toLowerCase().trim();
    let targetValue;
    
    if (gameMode === 'normal') {
      targetValue = currentSong.name.toLowerCase();
    } else if (gameMode === 'artist') {
      targetValue = currentSong.artist.toLowerCase();
    }
    
    // Check for partial matches too
    const isMatch = userGuess === targetValue || 
                    targetValue.includes(userGuess) || 
                    userGuess.includes(targetValue);
    
    if (isMatch) {
      const points = timeLeft;
      setScore(prev => prev + points);
      setEarnedPoints(points);
      setIsCorrect(true);
    } else {
      setIsCorrect(false);
      setEarnedPoints(0);
    }
    
    setGameState('feedback');
  };

  // Handle skip/give up
  const handleSkip = () => {
    stop();
    setIsCorrect(false);
    setEarnedPoints(0);
    setGameState('feedback');
  };

  // Continue to next round
  const handleContinue = () => {
    setRound(prev => prev + 1);
    nextSong();
  };

  // Restart the game
  const handleRestart = () => {
    setShowScoreboard(false);
    setGameState('start');
  };

  // Show high scores
  const handleShowScores = () => {
    setShowScoreboard(true);
  };

  // Save high score at game end
  const saveHighScore = () => {
    try {
      const highScores = JSON.parse(localStorage.getItem('musicQuizHighScores') || '[]');
      const playerName = prompt('ใส่ชื่อของคุณเพื่อบันทึกคะแนน:');
      
      if (playerName) {
        highScores.push({ name: playerName, score });
        highScores.sort((a, b) => b.score - a.score);
        const top10 = highScores.slice(0, 10);
        localStorage.setItem('musicQuizHighScores', JSON.stringify(top10));
      }
    } catch (error) {
      console.error('Error saving high score:', error);
    }
  };

  // View based on game state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center">
        <div className="text-white text-xl">กำลังโหลดเพลง...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">เกมแข่งทายเพลง</h1>
      
      {gameState === 'start' && !showScoreboard && (
        <GameStart 
          onStart={handleStart} 
          onChangeMode={setGameMode} 
          gameMode={gameMode} 
          onShowScores={handleShowScores}
        />
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