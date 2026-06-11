import { useEffect, useState } from 'react';
import { mediaService } from '../services/mediaService';
import { usePlayer } from '../context/PlayerContext';
import { Play, Heart, Clock } from 'lucide-react';
import type { MediaItemDto } from '../types';

const formatDuration = (timeString: string | undefined) => {
  if (!timeString) return "0:00";
  if (timeString.includes(":")) {
    const parts = timeString.split(":");
    if (parts.length >= 2) {
      const min = parseInt(parts[1], 10);
      const sec = parseFloat(parts[2] || "0");
      return `${min}:${Math.floor(sec).toString().padStart(2, '0')}`;
    }
  }
  return timeString;
};

export const Favorites = () => {
  const [favorites, setFavorites] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { playMedia, currentMedia, isFavorited, setIsFavorited } = usePlayer();

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  const fetchFavorites = async () => {
    try {
      const data = await mediaService.getFavorites();
      setFavorites(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Đồng bộ danh sách bài hát với thay đổi từ PlayerBar hoặc RightPanel
  useEffect(() => {
    if (!currentMedia || loading) return;
    
    setFavorites(prev => {
      const isCurrentlyInList = prev.some(t => t.id === currentMedia.id);
      
      if (isFavorited && !isCurrentlyInList) {
        // Đã thả tim từ nơi khác -> thêm vào đầu danh sách
        return [currentMedia, ...prev];
      } else if (!isFavorited && isCurrentlyInList) {
        // Đã bỏ tim từ nơi khác -> xóa khỏi danh sách
        return prev.filter(t => t.id !== currentMedia.id);
      }
      return prev;
    });
  }, [isFavorited, currentMedia, loading]);

  const handleToggleFavorite = async (e: React.MouseEvent, track: MediaItemDto) => {
    e.stopPropagation();
    try {
      const res = await mediaService.toggleFavorite(track.id);
      if (!res.isFavorited) {
        // Remove from list if un-favorited
        setFavorites(prev => prev.filter(t => t.id !== track.id));
      }
      // Đồng bộ nếu bài hát đang phát bị xóa khỏi danh sách yêu thích
      if (currentMedia && currentMedia.id === track.id) {
        setIsFavorited(res.isFavorited);
      }
    } catch (error) {
      alert("Lỗi khi thay đổi bài hát yêu thích");
    }
  };

  // Tính tổng thời lượng
  const getTotalDuration = () => {
    let totalSeconds = 0;
    favorites.forEach(t => {
      // Assuming t.duration is like "04:23"
      if (t.duration) {
        const parts = t.duration.split(':');
        if (parts.length === 3) {
          totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
        } else if (parts.length === 2) {
          totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }
    });
    
    if (totalSeconds === 0) return "";
    
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `, ${h} giờ ${m} phút`;
    }
    return `, ${m} phút ${s} giây`;
  };

  if (loading) return <div className="p-6 text-white">Đang tải danh sách bài hát đã thích...</div>;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-[#4A30A4] to-[#121212] overflow-y-auto">
      {/* Header */}
      <div 
        className="flex items-end gap-6 px-6 pb-6 shrink-0"
        style={{ height: 'clamp(195.5px, 25cqw, 340px)', minHeight: '195.5px' }}
      >
        <div 
          className="bg-gradient-to-br from-[#4F37E5] to-[#8C6CEE] shadow-2xl rounded-md flex-shrink-0 flex items-center justify-center"
          style={{ width: 'clamp(143.69px, 20cqw, 232px)', height: 'clamp(143.69px, 20cqw, 232px)' }}
        >
          <Heart size={64} className="fill-white text-white" />
        </div>
        <div className="flex flex-col justify-end min-w-0 flex-1 w-full pb-1">
          <span className="text-sm font-bold text-white tracking-widest mb-1">Playlist</span>
          <h1 
            className="font-black text-white tracking-tighter leading-tight mb-2 truncate"
            style={{ fontSize: 'clamp(48px, 6cqw, 72px)', lineHeight: '1.2' }}
          >
            Bài hát đã thích
          </h1>
          <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
            <span className="font-bold text-white hover:underline cursor-pointer">{currentUser?.username || "Người dùng"}</span>
            <span className="text-white font-bold">•</span>
            <span>{favorites.length} bài hát{getTotalDuration()}</span>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-black/20 to-black/60 border-t border-white/10 pt-6 px-6">

        {/* Controls */}
        <div className="flex items-center gap-6 mb-6">
          <button 
            onClick={() => favorites.length > 0 && playMedia(favorites[0])}
            className="w-14 h-14 rounded-full bg-[#1ED760] flex items-center justify-center hover:scale-105 transition hover:bg-[#1fdf64] shadow-xl"
          >
            <Play size={24} className="text-black fill-black ml-1" />
          </button>
        </div>

        {/* Track List Section */}
        <div className="w-full flex-1">
          {/* Table Header */}
          <div className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,2fr)_minmax(100px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm font-medium text-[#b3b3b3] mb-4 sticky top-0 bg-transparent z-10 items-center">
            <div className="text-right pr-2">#</div>
            <div>Tiêu đề</div>
            <div className="hidden md:block">Album</div>
            <div className="hidden lg:block">Ngày thêm</div>
            <div className="flex justify-end pr-6"><Clock size={16} /></div>
          </div>

        {/* Tracks */}
        <div className="flex flex-col gap-0 pb-10">
          {favorites.length === 0 ? (
            <div className="text-center text-zinc-400 mt-10">Bạn chưa thêm bài hát nào vào danh sách này.</div>
          ) : (
            favorites.map((track, index) => (
              <div 
                key={track.id} 
                className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,2fr)_minmax(100px,1fr)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer"
                onClick={() => playMedia(track)}
              >
                <div className="text-[#b3b3b3] text-base font-medium flex items-center justify-end pr-2 relative w-full">
                  <span className="group-hover:hidden">{index + 1}</span>
                  <button className="hidden group-hover:block text-white">
                    <Play size={14} className="fill-white" />
                  </button>
                </div>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {track.coverUrl ? (
                      <img src={track.coverUrl.startsWith('http') || track.coverUrl.startsWith('data:') ? track.coverUrl : `http://localhost:5183${track.coverUrl}`} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/50 text-xs">{track.title.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-white font-semibold text-base truncate group-hover:text-white">{track.title}</span>
                    <span className="text-[#b3b3b3] text-sm truncate hover:underline">{track.artistName || track.description || "Nghệ sĩ"}</span>
                  </div>
                </div>
                <div className="text-sm text-[#b3b3b3] truncate hover:text-white transition hidden md:block">
                  {track.albumTitle || "Đĩa đơn"}
                </div>
                <div className="text-sm text-[#b3b3b3] truncate hidden lg:block">Gần đây</div>
                <div className="flex items-center justify-end gap-6 pr-4">
                  <button 
                    onClick={(e) => handleToggleFavorite(e, track)}
                    className="hover:scale-105 transition"
                    title="Bỏ thích bài hát"
                  >
                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                  </button>
                  <div className="text-sm text-[#b3b3b3] font-medium w-10 text-right">{formatDuration(track.duration)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  );
};
