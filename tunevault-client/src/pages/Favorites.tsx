import { useEffect, useState } from 'react';
import { mediaService } from '../services/mediaService';
import { usePlayer } from '../context/PlayerContext';
import { Heart, Clock } from 'lucide-react';
import type { MediaItemDto } from '../types';
import { ShareMediaModal } from '../components/ShareMediaModal';

import { TrackListRow } from '../components/TrackListRow';

export const Favorites = () => {
  const [favorites, setFavorites] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { playMediaList, currentMedia, isFavorited, setIsFavorited, isPlaying, togglePlayPause, queue, updateQueueContext } = usePlayer();

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ id: string, type: string, title: string } | null>(null);

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
    
    window.addEventListener('favoritesUpdated', fetchFavorites);
    return () => window.removeEventListener('favoritesUpdated', fetchFavorites);
  }, []);

  
  useEffect(() => {
    if (!currentMedia || loading) return;
    
    setFavorites(prev => {
      const isCurrentlyInList = prev.some(t => t.id === currentMedia.id);
      
      if (isFavorited && !isCurrentlyInList) {
        
        return [currentMedia, ...prev];
      } else if (!isFavorited && isCurrentlyInList) {
        
        return prev.filter(t => t.id !== currentMedia.id);
      }
      return prev;
    });
  }, [isFavorited, currentMedia, loading]);

  const handleToggleFavorite = async (e: React.MouseEvent | undefined, track: MediaItemDto) => {
    e?.stopPropagation();
    try {
      const res = await mediaService.toggleFavorite(track.id);
      if (!res.isFavorited) {
        
        setFavorites(prev => prev.filter(t => t.id !== track.id));
      }
      
      if (currentMedia && currentMedia.id === track.id) {
        setIsFavorited(res.isFavorited);
      }
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      alert("Lỗi khi thay đổi bài hát yêu thích");
    }
  };

  
  const getTotalDuration = () => {
    let totalSeconds = 0;
    favorites.forEach(t => {
      
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

  const isCurrentPlaylistTrackPlaying = currentMedia && favorites.some(t => t.id === currentMedia.id);
  const isPlaylistPlaying = isCurrentPlaylistTrackPlaying && isPlaying;

  const handleMainPlayClick = () => {
    if (favorites.length === 0) return;
    if (isCurrentPlaylistTrackPlaying) {
      if (queue.length <= 1) {
        updateQueueContext(favorites, currentMedia.id);
      }
      togglePlayPause();
    } else {
      const tracksToPlay = favorites.map(t => ({ ...t, isLikedContext: true }));
      playMediaList(tracksToPlay, 0);
    }
  };

  if (loading) return <div className="p-6 text-white">Đang tải danh sách bài hát đã thích...</div>;

  return (
    <div className="h-full bg-gradient-to-b from-[#4A30A4] to-[#121212] overflow-y-auto scrollbar-hide grid grid-rows-[auto_1fr]">
      
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

      
      <div className="w-full h-full bg-gradient-to-b from-black/20 to-black/60 border-t border-white/10 pt-6 px-6">

        
        <div className="flex items-center gap-6 mb-6">
          <button 
            onClick={handleMainPlayClick}
            className="w-14 h-14 rounded-full bg-[#1ED760] flex items-center justify-center hover:scale-105 transition hover:bg-[#1fdf64] shadow-xl"
          >
            {isPlaylistPlaying ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-black ml-0">
                <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-black ml-1">
                <path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path>
              </svg>
            )}
          </button>
        </div>

        
        <div className="w-full flex-1">
          
          <div className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm font-medium text-[#b3b3b3] mb-4 sticky top-0 bg-transparent z-10 items-center">
            <div className="text-right pr-2">#</div>
            <div>Tiêu đề</div>
            <div className="hidden md:block">Album</div>
            <div className="flex items-center justify-end gap-4 pr-4">
              <div className="w-4"></div>
              <div className="w-12 text-right flex justify-end"><Clock size={16} /></div>
              <div className="w-[18px]"></div>
            </div>
          </div>

        
        <div className="flex flex-col gap-0 pb-10">
          {favorites.length === 0 ? (
            <div className="text-center text-zinc-400 mt-10">Bạn chưa thêm bài hát nào vào danh sách này.</div>
          ) : (
            favorites.map((track, index) => (
              <TrackListRow 
                key={track.id}
                track={track}
                index={index}
                tracks={favorites.map(t => ({ ...t, isLikedContext: true }))}
                isFavorited={true}
                onToggleFavorite={() => handleToggleFavorite(undefined, track)}
                onShare={(id, title) => {
                  setShareData({ id, type: 'Bài hát', title });
                  setShowShareModal(true);
                }}
              />
            ))
          )}
        </div>
      </div>
      </div>

      
      {showShareModal && shareData && (
        <ShareMediaModal
          mediaId={shareData.id}
          mediaType={shareData.type}
          mediaTitle={shareData.title}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};
