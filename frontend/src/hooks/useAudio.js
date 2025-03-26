import { useState, useEffect, useRef } from 'react';

const useAudio = () => {
  const [audio, setAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef(null);

  // Set up the audio
  const setup = (url) => {
    // Clear any existing audio
    if (audio) {
      stop();
    }
    
    const newAudio = new Audio(url);
    
    newAudio.onloadedmetadata = () => {
      setDuration(newAudio.duration);
    };
    
    newAudio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    
    setAudio(newAudio);
    return newAudio;
  };

  // Play the audio
  const play = () => {
    if (!audio) return;
    
    audio.play()
      .then(() => {
        setIsPlaying(true);
        
        // Update current time every 100ms
        intervalRef.current = setInterval(() => {
          setCurrentTime(audio.currentTime);
        }, 100);
      })
      .catch(error => {
        console.error('Error playing audio:', error);
      });
  };

  // Pause the audio
  const pause = () => {
    if (!audio) return;
    
    audio.pause();
    setIsPlaying(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Stop the audio
  const stop = () => {
    if (!audio) return;
    
    audio.pause();
    audio.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [audio]);

  return {
    audio,
    isPlaying,
    duration,
    currentTime,
    setup,
    play,
    pause,
    stop
  };
};

export default useAudio;