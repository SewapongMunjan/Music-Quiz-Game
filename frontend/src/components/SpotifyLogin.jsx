// File: src/components/SpotifyLogin.jsx
import React, { useState, useEffect } from 'react';

const SpotifyLogin = ({ onLoginStatusChange }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check login status when component mounts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('http://localhost:3001/api/spotify/me', {
          credentials: 'include' // Important to include cookies
        });
        
        if (response.ok) {
          setIsLoggedIn(true);
          if (onLoginStatusChange) {
            onLoginStatusChange(true);
          }
        } else {
          // Handle refresh token case
          const data = await response.json();
          if (data.refreshNeeded) {
            // Try to refresh the token
            const refreshResponse = await fetch('http://localhost:3001/api/spotify/refresh-token', {
              credentials: 'include'
            });
            
            if (refreshResponse.ok) {
              setIsLoggedIn(true);
              if (onLoginStatusChange) {
                onLoginStatusChange(true);
              }
            } else {
              setIsLoggedIn(false);
              if (onLoginStatusChange) {
                onLoginStatusChange(false);
              }
            }
          } else {
            setIsLoggedIn(false);
            if (onLoginStatusChange) {
              onLoginStatusChange(false);
            }
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
        setIsLoggedIn(false);
        if (onLoginStatusChange) {
          onLoginStatusChange(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Also check URL hash for auth success parameter
    const checkUrlHash = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('auth=success')) {
        // Clear hash from URL
        window.location.hash = '';
        setIsLoggedIn(true);
        if (onLoginStatusChange) {
          onLoginStatusChange(true);
        }
      }
    };
    
    checkUrlHash();
    checkLoginStatus();
  }, [onLoginStatusChange]);

  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/api/spotify/login';
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3001/api/spotify/logout', {
        credentials: 'include'
      });
      setIsLoggedIn(false);
      if (onLoginStatusChange) {
        onLoginStatusChange(false);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mb-4">
        <p className="mb-2 text-sm text-gray-600">กำลังตรวจสอบสถานะการเข้าสู่ระบบ...</p>
      </div>
    );
  }

  return (
    <div className="text-center mb-4">
      {!isLoggedIn ? (
        <>
          <p className="mb-2 text-sm text-gray-600">เข้าสู่ระบบเพื่อใช้เพลย์ลิสต์ของคุณ</p>
          <button
            onClick={handleLogin}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition duration-300 flex items-center justify-center mx-auto"
          >
            <svg className="w-6 h-6 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            เข้าสู่ระบบด้วย Spotify
          </button>
        </>
      ) : (
        <>
          <p className="mb-2 text-sm text-green-600">เข้าสู่ระบบแล้ว</p>
          <button
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 underline transition duration-300"
          >
            ออกจากระบบ
          </button>
        </>
      )}
    </div>
  );
};

export default SpotifyLogin;