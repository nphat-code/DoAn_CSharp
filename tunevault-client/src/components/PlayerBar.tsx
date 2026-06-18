import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Plus, Check, Music, Library } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';

export const PlayerBar = () => {
  const { currentMedia, isPlaying, togglePlayPause, playNext, playPrevious, volume, setVolume, mediaRef, isFavorited, toggleFavorite } = usePlayer();
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.play().catch(e => console.error("Lỗi tự động phát:", e));
      } else {
        mediaRef.current.pause();
      }
      mediaRef.current.volume = volume;
    }
  }, [isPlaying, currentMedia, volume, mediaRef]);

  const isSeeking = useRef(false);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      if (!isSeeking.current) {
        setProgress((media.currentTime / media.duration) * 100 || 0);
        setCurrentTime(media.currentTime);
      }
      setDuration(media.duration);
    };

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);
    
    // Khởi tạo giá trị ban đầu nếu media đã load xong
    if (media.readyState >= 1) {
      setDuration(media.duration);
    }
    
    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
    };
  }, [currentMedia, mediaRef, playNext]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mediaRef.current) {
      const seekTime = (Number(e.target.value) / 100) * mediaRef.current.duration;
      setProgress(Number(e.target.value));
      setCurrentTime(seekTime);
    }
  };

  const handleSeekStart = () => {
    isSeeking.current = true;
  };

  const handleSeekEnd = (e: React.SyntheticEvent<HTMLInputElement>) => {
    if (mediaRef.current && isSeeking.current) {
      const target = e.target as HTMLInputElement;
      const seekTime = (Number(target.value) / 100) * mediaRef.current.duration;
      mediaRef.current.currentTime = seekTime;
      isSeeking.current = false;
    }
  };

  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    playlistService.getUserPlaylists().then(setPlaylists).catch(console.error);
  }, []);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowPlaylistMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentMedia) return;
    
    if (!isFavorited) {
      await toggleFavorite();
    } else {
      setShowPlaylistMenu(prev => !prev);
    }
  };

  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated && !currentMedia) {
    return (
      <div className="h-20 bg-gradient-to-r from-[#af2896] to-[#509bf5] flex items-center justify-between px-6 pb-2 cursor-pointer hover:scale-[1.01] transition-transform" onClick={() => window.location.href = '/register'}>
        <div className="flex flex-col text-white">
          <span className="text-sm font-bold tracking-wider uppercase mb-1">Xem trước TuneVault</span>
          <span className="text-base font-medium">Đăng ký để nghe bài hát và podcast không giới hạn với quảng cáo thỉnh thoảng xuất hiện. Không cần thẻ tín dụng.</span>
        </div>
        <button className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition shrink-0 ml-4">
          Đăng ký miễn phí
        </button>
      </div>
    );
  }

  if (!currentMedia) {
    return <div className="h-20 bg-spotify-base flex items-center justify-center text-zinc-500">Select a track to play</div>;
  }

  return (
    <div className="h-20 bg-spotify-base flex items-center justify-between px-4 pb-2">
      {/* Global Media Element - Hidden by default, manually appended to targets */}
      <div className="hidden">
        {currentMedia.mediaType === 'Video' ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={currentMedia.fileUrl?.startsWith('http') ? currentMedia.fileUrl : `https://tunevault-api.onrender.com/api/media/${currentMedia.id}/stream`}
            poster={currentMedia.coverUrl ? (currentMedia.coverUrl.startsWith('http') ? currentMedia.coverUrl : currentMedia.coverUrl?.startsWith('http') ? currentMedia.coverUrl : `https://tunevault-api.onrender.com${currentMedia.coverUrl}`) : undefined}
            playsInline
            className="w-full h-full object-cover scale-[1.3] transform-gpu"
          />
        ) : (
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={currentMedia.fileUrl?.startsWith('http') ? currentMedia.fileUrl : `https://tunevault-api.onrender.com/api/media/${currentMedia.id}/stream`} 
          />
        )}
      </div>
      
      {/* Song Info */}
      <div className="flex items-center w-1/3">
        {currentMedia.coverUrl ? (
          <img src={currentMedia.coverUrl.startsWith('http') ? currentMedia.coverUrl : currentMedia.coverUrl?.startsWith('http') ? currentMedia.coverUrl : `https://tunevault-api.onrender.com${currentMedia.coverUrl}`} alt={currentMedia.title} className="w-14 h-14 rounded-md object-cover flex-shrink-0 shadow-lg" />
        ) : (
          <div className="w-14 h-14 bg-spotify-hover2 rounded-md flex-shrink-0 flex items-center justify-center shadow-lg">
             <Music size={24} className="text-zinc-500" />
          </div>
        )}
        <div className="ml-4 flex items-center gap-4">
          <div>
            <div className="text-sm font-semibold text-white hover:underline cursor-pointer">{currentMedia.title}</div>
            <div className="text-xs text-spotify-lighttext hover:underline cursor-pointer hover:text-white">{currentMedia.artistName || currentMedia.description || 'Unknown Artist'}</div>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button onClick={handleLikeClick} className="text-zinc-400 hover:text-white hover:scale-105 transition focus:outline-none flex items-center justify-center">
              {isFavorited ? (
                 <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
              ) : (
                 <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              )}
            </button>
            
            {/* Menu Thêm vào danh sách phát */}
            {showPlaylistMenu && (
              <div className="absolute bottom-full left-0 mb-4 w-72 bg-[#282828] rounded-md shadow-[0_16px_24px_rgba(0,0,0,0.5)] p-2 z-50 animate-in fade-in zoom-in duration-200 border border-zinc-700/50">
                <div className="text-sm font-bold text-white mb-2 px-2 pt-2">Thêm vào danh sách phát</div>
                <div className="relative mb-2 px-2 mt-3">
                  <input type="text" placeholder="Tìm một danh sách phát" className="w-full bg-zinc-700/50 text-white text-xs p-2.5 rounded-md outline-none focus:bg-zinc-700" />
                </div>
                <button className="flex items-center gap-3 text-sm font-semibold text-white p-2 hover:bg-white/10 w-full rounded-sm transition mb-1">
                   <div className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-sm">
                      <Plus size={16} /> 
                   </div>
                   Danh sách phát mới
                </button>
                <div className="h-px bg-zinc-800 my-1"></div>
                
                <div className="max-h-64 overflow-y-auto mt-2 flex flex-col gap-1 custom-scrollbar">
                   <div 
                     onClick={async () => { 
                       await toggleFavorite();
                     }}
                     className="flex items-center justify-between p-2 hover:bg-white/10 rounded-sm cursor-pointer group"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                         <Heart size={18} className="text-white fill-white" />
                       </div>
                       <span className="text-sm text-white font-medium">Bài hát đã thích</span>
                     </div>
                     {isFavorited && <Check size={16} className="text-spotify-green" />}
                   </div>

                   {playlists.map(playlist => (
                     <div 
                       key={playlist.id}
                       onClick={async () => {
                         try {
                           await playlistService.addTrackToPlaylist(playlist.id, currentMedia.id);
                           alert("Đã thêm vào " + playlist.name);
                         } catch(e) {
                           alert("Có thể bài hát đã có trong playlist này.");
                         }
                       }}
                       className="flex items-center justify-between p-2 hover:bg-white/10 rounded-sm cursor-pointer group"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-sm bg-zinc-800 flex items-center justify-center overflow-hidden">
                            {playlist.coverUrl ? <img src={playlist.coverUrl} className="w-full h-full object-cover" /> : <Library size={18} className="text-zinc-400" />}
                         </div>
                         <span className="text-sm text-white font-medium">{playlist.name}</span>
                       </div>
                     </div>
                   ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center w-1/3 max-w-md mt-1">
        <div className="flex items-center gap-6 mb-2">
          <button onClick={playPrevious} className="text-spotify-lighttext hover:text-white transition"><SkipBack size={20} className="fill-current" /></button>
          <button onClick={togglePlayPause} className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition">
            {isPlaying ? <Pause size={16} className="fill-black" /> : <Play size={16} className="fill-black" />}
          </button>
          <button onClick={playNext} className="text-spotify-lighttext hover:text-white transition"><SkipForward size={20} className="fill-current" /></button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-[11px] text-spotify-lighttext min-w-[32px] text-right">{formatTime(currentTime)}</span>
          <div className="w-full group flex items-center">
            <input 
              type="range" min="0" max="100" value={progress || 0} 
              onChange={handleSeek}
              onMouseDown={handleSeekStart}
              onTouchStart={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchEnd={handleSeekEnd}
              className="spotify-slider"
              style={{ '--progress': `${progress || 0}%` } as React.CSSProperties}
            />
          </div>
          <span className="text-[11px] text-spotify-lighttext min-w-[32px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end w-1/3 gap-2">
        <button className="text-spotify-lighttext hover:text-white transition">
           <Volume2 size={20} />
        </button>
        <div className="w-24 group flex items-center">
          <input 
            type="range" min="0" max="1" step="0.01" value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            className="spotify-slider"
            style={{ '--progress': `${volume * 100}%` } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
};
