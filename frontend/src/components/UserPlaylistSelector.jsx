import React, { useState, useEffect } from 'react';

const UserPlaylistSelector = ({ onSelectPlaylist }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserPlaylists = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/spotify/playlists', {
          credentials: 'include' // สำคัญเพื่อส่ง cookies
        });
        
        if (!response.ok) {
          throw new Error('ไม่สามารถดึงข้อมูลเพลย์ลิสต์ได้');
        }
        
        const data = await response.json();
        setPlaylists(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching playlists:', err);
        setError('ไม่สามารถดึงข้อมูลเพลย์ลิสต์ได้');
        setLoading(false);
      }
    };

    fetchUserPlaylists();
  }, []);

  if (loading) {
    return <div className="text-center py-4">กำลังโหลดเพลย์ลิสต์...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
        <button 
          onClick={() => window.location.href = 'http://localhost:3001/api/spotify/login'} 
          className="mt-2 text-blue-500 underline"
        >
          ลองเข้าสู่ระบบอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">เลือกเพลย์ลิสต์ของคุณ:</h3>
      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
        {playlists.length > 0 ? (
          playlists.map(playlist => (
            <button
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist.id)}
              className="flex items-center p-2 border border-gray-300 rounded hover:bg-gray-100 transition duration-200"
            >
              {playlist.images && playlist.images[0] ? (
                <img src={playlist.images[0].url} alt={playlist.name} className="w-10 h-10 mr-3 rounded" />
              ) : (
                <div className="w-10 h-10 bg-gray-300 mr-3 rounded flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z"></path>
                  </svg>
                </div>
              )}
              <div className="text-left">
                <div className="font-medium truncate max-w-xs">{playlist.name}</div>
                <div className="text-sm text-gray-500">{playlist.tracks.total} เพลง</div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">ไม่พบเพลย์ลิสต์</div>
        )}
      </div>
    </div>
  );
};

export default UserPlaylistSelector;