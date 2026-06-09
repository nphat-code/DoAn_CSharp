import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, PlusCircle, CheckCircle, Plus, Check, Library } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { mediaService } from '../services/mediaService';
import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';

export const PlayerBar = () => {
  const { currentMedia, isPlaying, togglePlayPause, volume, setVolume, mediaRef } = usePlayer();
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      setProgress((media.currentTime / media.duration) * 100);
    };

    const handleEnded = () => {
      togglePlayPause();
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('ended', handleEnded);
    
    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('ended', handleEnded);
    };
  }, [currentMedia, mediaRef, togglePlayPause]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mediaRef.current) {
      const seekTime = (Number(e.target.value) / 100) * mediaRef.current.duration;
      mediaRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  const [isLiked, setIsLiked] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    playlistService.getUserPlaylists().then(setPlaylists).catch(console.error);
  }, []);

  // Load like state khi đổi bài
  useEffect(() => {
    if (currentMedia) {
      mediaService.checkFavorite(currentMedia.id).then(res => setIsLiked(res.isFavorited)).catch(console.error);
    } else {
      setIsLiked(false);
    }
  }, [currentMedia]);

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
    
    if (!isLiked) {
      try {
        const result = await mediaService.toggleFavorite(currentMedia.id);
        setIsLiked(result.isFavorited);
      } catch (error) {
        console.error("Lỗi khi thả tim:", error);
      }
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
      {/* Cấu hình HTTP Range Request cho phép stream và seek mượt mà */}
      {currentMedia.mediaType !== 'Video' && (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={`http://localhost:5183/api/media/${currentMedia.id}/stream`} 
        />
      )}
      
      {/* Song Info */}
      <div className="flex items-center w-1/3">
        <div className="w-14 h-14 bg-spotify-hover2 rounded-md flex-shrink-0"></div>
        <div className="ml-4 flex items-center gap-4">
          <div>
            <div className="text-sm font-semibold text-white hover:underline cursor-pointer">{currentMedia.title}</div>
            <div className="text-xs text-spotify-lighttext hover:underline cursor-pointer hover:text-white">{currentMedia.artistName || currentMedia.description || 'Unknown Artist'}</div>
          </div>
          
          <div className="relative" ref={menuRef}>
            <button onClick={handleLikeClick} className="text-spotify-lighttext hover:text-white hover:scale-105 transition focus:outline-none flex items-center justify-center">
              {isLiked ? (
                <CheckCircle size={20} className="text-spotify-green fill-spotify-green/20" />
              ) : (
                <PlusCircle size={20} />
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
                       const res = await mediaService.toggleFavorite(currentMedia.id); 
                       setIsLiked(res.isFavorited); 
                     }}
                     className="flex items-center justify-between p-2 hover:bg-white/10 rounded-sm cursor-pointer group"
                   >
                     <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                         <Heart size={18} className="text-white fill-white" />
                       </div>
                       <span className="text-sm text-white font-medium">Bài hát đã thích</span>
                     </div>
                     {isLiked && <Check size={16} className="text-spotify-green" />}
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
          <button className="text-spotify-lighttext hover:text-white transition"><SkipBack size={20} className="fill-current" /></button>
          <button onClick={togglePlayPause} className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition">
            {isPlaying ? <Pause size={16} className="fill-black" /> : <Play size={16} className="fill-black ml-1" />}
          </button>
          <button className="text-spotify-lighttext hover:text-white transition"><SkipForward size={20} className="fill-current" /></button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-[11px] text-spotify-lighttext">0:00</span>
          <div className="w-full group flex items-center">
            <input 
              type="range" min="0" max="100" value={progress || 0} onChange={handleSeek}
              className="spotify-slider"
              style={{ '--progress': `${progress || 0}%` } as React.CSSProperties}
            />
          </div>
          <span className="text-[11px] text-spotify-lighttext">{currentMedia.duration.substring(3)}</span>
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
