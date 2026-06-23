import { getImageUrl } from '../utils/imageUrl';
import { useEffect, useState } from 'react';
import { FastAverageColor } from 'fast-average-color';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, MoreHorizontal, Download } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import type { MediaItemDto } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { formatDuration } from '../utils/format';

export const TrackDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [track, setTrack] = useState<MediaItemDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [bgColor, setBgColor] = useState<string>('rgba(17, 94, 89, 0.8)'); // Fallback teal
  const { playMedia, currentMedia, isPlaying, togglePlayPause, setIsFavorited } = usePlayer();



  useEffect(() => {
    const fetchTrack = async () => {
      try {
        const allMedia = await mediaService.getAllMedia();
        const found = allMedia.find(m => m.id === id);
        if (found) {
          setTrack(found);
          // Check favorite status
          try {
            const favRes = await mediaService.checkFavorite(found.id);
            setIsFav(favRes.isFavorited);
          } catch (e) {
            console.error("Lỗi khi tải trạng thái yêu thích:", e);
          }
        } else {
          // Xử lý không tìm thấy
          navigate('/');
        }
      } catch (error) {
        console.error("Lỗi khi tải bài hát:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrack();
    window.addEventListener('favoritesUpdated', fetchTrack);
    return () => window.removeEventListener('favoritesUpdated', fetchTrack);
  }, [id, navigate]);

  useEffect(() => {
    if (track?.coverUrl) {
      const fac = new FastAverageColor();
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      const baseUrl = getImageUrl(track.coverUrl);
      img.src = `${baseUrl}?c=${Date.now()}`;
      img.onload = () => {
        try {
          const color = fac.getColor(img);
          setBgColor(`rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.8)`);
        } catch (e) {
          console.error("Lỗi lấy màu nền", e);
        }
      };
    } else {
      setBgColor('rgba(17, 94, 89, 0.8)');
    }
  }, [track?.coverUrl]);

  if (loading) {
    return <div className="p-8 text-white">Đang tải...</div>;
  }

  if (!track) return null;

  const isCurrentTrack = currentMedia?.id === track.id;

  const handlePlayClick = () => {
    if (isCurrentTrack) {
      togglePlayPause();
    } else {
      playMedia(track);
    }
  };

  const handleFavoriteClick = async () => {
    try {
      const res = await mediaService.toggleFavorite(track.id);
      setIsFav(res.isFavorited);
      if (isCurrentTrack) {
        setIsFavorited(res.isFavorited);
      }
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error("Lỗi toggle favorite:", error);
    }
  };

  const coverUrl = track.coverUrl ? getImageUrl(track.coverUrl) : "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62";
  const artistAvatar = track.artistAvatarUrl ? getImageUrl(track.artistAvatarUrl) : "https://i.scdn.co/image/ab67616d00001e023192276cb04c3da1dd1f2cf8"; // Default avatar

  return (
    <div 
      className="flex flex-col h-full bg-spotify-card overflow-y-auto"
      style={{
        background: `linear-gradient(to bottom, ${bgColor} 0%, transparent 70%)`
      }}
    >
      {/* Header */}
      <div 
        className="flex items-end gap-6 px-6 pb-6 shrink-0 relative z-10"
        style={{ height: 'clamp(195.5px, 25cqw, 340px)', minHeight: '195.5px' }}
      >
        {/* Cover Art */}
        <div 
          className="bg-zinc-800 shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ width: 'clamp(143.69px, 20cqw, 232px)', height: 'clamp(143.69px, 20cqw, 232px)' }}
        >
          <img 
            src={coverUrl} 
            alt="Track Cover" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-end min-w-0 flex-1 w-full pb-1">
          <span className="text-sm font-bold text-white tracking-widest mb-1">Bài hát</span>
          
          <h1 
            className="font-black text-white tracking-tighter leading-tight mb-2 line-clamp-2"
            style={{ fontSize: track.title.length > 20 ? 'clamp(32px, 4cqw, 48px)' : 'clamp(48px, 6cqw, 72px)', lineHeight: '1.2' }}
          >
            {track.title}
          </h1>
          
          <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm font-medium text-white/90">
            {/* Artist Avatar & Name */}
            <div 
              className="flex items-center gap-2 group cursor-pointer hover:underline"
              onClick={() => track.artistId && navigate(`/artist/${track.artistId}`)}
            >
              <img 
                src={artistAvatar} 
                alt="Artist" 
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
              />
              <span className="font-bold">{track.artistName || 'Unknown Artist'}</span>
            </div>
            
            <span className="text-xs text-white/70">•</span>
            <span className="hover:underline cursor-pointer">{track.albumTitle || track.title}</span>

            {track.createdAt && (
              <>
                <span className="text-xs text-white/70">•</span>
                <span>{new Date(track.createdAt).getFullYear()}</span>
              </>
            )}

            <span className="text-xs text-white/70">•</span>
            <span>{formatDuration(track.duration)}</span>
          </div>
        </div>
      </div>

      {/* Action Bar Background transition */}
      <div className="flex-1 flex flex-col">
        {/* ACTION BAR */}
        <div className="flex items-center gap-6 px-6 py-4">
        <button 
          onClick={handlePlayClick}
          className="w-14 h-14 bg-green-500 hover:bg-green-400 text-black rounded-full flex items-center justify-center transition hover:scale-105 shadow-xl shrink-0"
        >
          {isCurrentTrack && isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </button>

        <button 
          onClick={handleFavoriteClick}
          className={`transition hover:scale-105 ${isFav ? 'text-green-500' : 'text-zinc-400 hover:text-white'}`}
          title={isFav ? "Xóa khỏi Thư viện" : "Thêm vào Thư viện"}
        >
          {isFav ? (
             <svg role="img" height="32" width="32" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
          ) : (
             <svg role="img" height="32" width="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
          )}
        </button>

        <button className="text-zinc-400 hover:text-white transition" title="Tải xuống">
           <Download size={32} />
        </button>

        <button className="text-zinc-400 hover:text-white transition" title="Khác">
          <MoreHorizontal size={32} />
        </button>
        </div>

        {/* Lời bài hát Section (Lyrics Placeholder) */}
        <div className="px-6 max-w-3xl mt-4 pb-24">
           <h2 className="text-white text-2xl font-bold mb-6">Lời bài hát</h2>
           <div className="bg-zinc-800/40 rounded-xl p-6">
               {track.description ? (
                 <p className="text-zinc-300 whitespace-pre-wrap text-lg leading-relaxed font-medium">
                   {track.description}
                 </p>
               ) : (
                 <p className="text-zinc-400 italic text-lg">Chưa có lời bài hát cho bài hát này.</p>
               )}
           </div>
        </div>
      </div>
    </div>
  );
};
