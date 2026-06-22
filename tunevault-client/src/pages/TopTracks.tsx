import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mediaService } from '../services/mediaService';
import { usePlayer } from '../context/PlayerContext';
import type { MediaItemDto } from '../types';
import { Play, Clock, Plus } from 'lucide-react';
import { TrackDropdownMenu } from '../components/TrackDropdownMenu';
import { ShareMediaModal } from '../components/ShareMediaModal';

export const TopTracks = () => {
  const navigate = useNavigate();
  const [topTracks, setTopTracks] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { playMediaList, currentMedia, isPlaying, togglePlayPause, queue, updateQueueContext } = usePlayer();

  const [favoritesIds, setFavoritesIds] = useState<Set<string>>(new Set());
  const [shareData, setShareData] = useState<{ id: string, type: string, title: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = async () => {
    try {
      setLoading(true);
      const allMedia = await mediaService.getAllMedia();
      setTopTracks(allMedia);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchFavs = () => {
      if (localStorage.getItem('token')) {
        mediaService.getFavorites().then(f => setFavoritesIds(new Set(f.map(t => t.id)))).catch(() => { });
      }
    };
    fetchFavs();
    window.addEventListener('favoritesUpdated', fetchFavs);
    return () => window.removeEventListener('favoritesUpdated', fetchFavs);
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent | undefined, trackId: string) => {
    e?.stopPropagation();
    try {
      const res = await mediaService.toggleFavorite(trackId);
      setFavoritesIds(prev => {
        const next = new Set(prev);
        if (res.isFavorited) next.add(trackId);
        else next.delete(trackId);
        return next;
      });
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error(error);
    }
  };


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

  if (loading) return <div className="text-zinc-400 p-8 h-full bg-[#121212]">Đang tải...</div>;

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto px-8 py-6 pb-24">
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white mb-2">Bản nhạc hàng đầu tháng này</h1>
        <p className="text-sm text-zinc-400">Chỉ hiển thị với bạn</p>
      </div>
      <div className="flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm font-medium text-[#b3b3b3] mb-4 sticky top-0 bg-[#121212] z-10 items-center">
          <div className="text-right pr-2">#</div>
          <div className="text-left">Tiêu đề</div>
          <div className="hidden md:block text-left">Album</div>
          <div className="flex items-center justify-end gap-4 pr-4">
            <div className="w-4"></div>
            <div className="w-12 text-right flex justify-end"><Clock size={16} /></div>
            <div className="w-[18px]"></div>
          </div>
        </div>
        
        {/* Tracks */}
        <div className="flex flex-col gap-0 pb-10">
          {topTracks.map((track, index) => {
            const isPlayingTrack = currentMedia?.id === track.id;
            const isTrackFavorited = favoritesIds.has(track.id);
            return (
              <div 
                key={track.id} 
                className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,1fr)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer"
                onDoubleClick={() => {
                  if (isPlayingTrack) {
                    if (queue.length <= 1) {
                      updateQueueContext(topTracks, currentMedia.id);
                    }
                    togglePlayPause();
                  } else {
                    playMediaList(topTracks, index);
                  }
                }}
              >
                <div className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-[#b3b3b3]'} text-base font-medium flex items-center justify-end pr-2 relative w-full`}>
                  <span className="group-hover:hidden">{index + 1}</span>
                  <button className="hidden group-hover:block" onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isPlayingTrack) {
                      if (queue.length <= 1) {
                        updateQueueContext(topTracks, currentMedia.id);
                      }
                      togglePlayPause();
                    } else {
                      playMediaList(topTracks, index); 
                    }
                  }}>
                    {isPlayingTrack && isPlaying ? (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="text-white">
                        <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
                      </svg>
                    ) : (
                      <Play size={14} className="fill-white text-white" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {track.coverUrl ? (
                      <img src={track.coverUrl.startsWith('http') || track.coverUrl.startsWith('data:') ? track.coverUrl : track.coverUrl?.startsWith('http') ? track.coverUrl : `https://tunevault-api.onrender.com${track.coverUrl}`} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/50 text-xs">{track.title.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-white'} font-semibold text-base truncate`}>{track.title}</span>
                    <span 
                      className="text-[#b3b3b3] text-sm truncate hover:underline hover:text-white cursor-pointer inline-block w-fit"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (track.artistId) navigate(`/artist/${track.artistId}`);
                      }}
                    >
                      {track.artistName || track.description || "Nghệ sĩ"}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-[#b3b3b3] truncate hover:text-white transition hidden md:block cursor-pointer"
                     onClick={(e) => {
                       e.stopPropagation();
                       if (track.albumId) navigate(`/album/${track.albumId}`);
                     }}>
                  {track.albumTitle || track.title}
                </div>
                <div className="flex items-center justify-end gap-4 pr-4 relative">
                  <button
                    onClick={(e) => handleToggleFavorite(e, track.id)}
                    className={`hover:scale-105 transition ${isTrackFavorited ? 'opacity-100 text-[#1ed760]' : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white'}`}
                  >
                    {isTrackFavorited ? (
                      <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                    ) : (
                      <Plus size={16} className="rounded-full border border-current p-[1px]" />
                    )}
                  </button>
                  <div className="text-sm text-[#b3b3b3] font-medium w-12 text-right">{formatDuration(track.duration)}</div>
                  
                  <TrackDropdownMenu
                    track={track}
                    isFavorited={isTrackFavorited}
                    onToggleFavorite={() => handleToggleFavorite(undefined, track.id)}
                    onShare={(id, title) => {
                      setShareData({ id, type: 'Bài hát', title });
                      setShowShareModal(true);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition"
                  />
                </div>
              </div>
            )})
          }
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
