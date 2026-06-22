import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mediaService } from '../services/mediaService';
import { usePlayer } from '../context/PlayerContext';
import type { MediaItemDto } from '../types';
import { Play, Clock } from 'lucide-react';

export const TopTracks = () => {
  const navigate = useNavigate();
  const [topTracks, setTopTracks] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { playMediaList } = usePlayer();

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
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto px-8 py-6">
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white mb-2">Bản nhạc hàng đầu tháng này</h1>
        <p className="text-sm text-zinc-400">Chỉ hiển thị với bạn</p>
      </div>
      <div className="flex flex-col">
        {/* Header Row */}
        <div className="flex items-center gap-4 px-4 py-2 text-sm text-zinc-400 border-b border-white/10 mb-4">
          <div className="w-6 text-center">#</div>
          <div className="w-10"></div>
          <div className="flex-1 min-w-0">Tiêu đề</div>
          <div className="hidden md:block flex-1">Album</div>
          <div className="w-12 flex justify-end">
            <Clock size={16} />
          </div>
        </div>
        
        {topTracks.map((track, index) => (
          <div
            key={track.id}
            className="flex items-center gap-4 px-4 py-2 hover:bg-white/10 rounded-md group cursor-pointer"
            onClick={() => playMediaList(topTracks, index)}
          >
            <div className="w-6 text-center text-zinc-400 group-hover:hidden">{index + 1}</div>
            <div className="w-6 text-center text-white hidden group-hover:flex items-center justify-center">
              <Play size={16} fill="currentColor" />
            </div>
            <img
              src={track.coverUrl ? (track.coverUrl.startsWith('http') || track.coverUrl.startsWith('data:') ? track.coverUrl : track.coverUrl?.startsWith('http') ? track.coverUrl : `https://tunevault-api.onrender.com${track.coverUrl}`) : "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62"}
              alt={track.title}
              className="w-10 h-10 rounded shadow"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate group-hover:underline">{track.title}</h4>
              <p 
                className="text-sm text-zinc-400 truncate hover:underline hover:text-white cursor-pointer inline-block w-fit relative z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  if (track.artistId) navigate(`/artist/${track.artistId}`);
                }}
              >
                {track.artistName || 'Unknown Artist'}
              </p>
            </div>
            <div className="hidden md:block flex-1 text-sm text-zinc-400 truncate hover:underline">
              {track.albumTitle || ''}
            </div>
            <div className="text-sm text-zinc-400 w-12 text-right">
              {formatDuration(track.duration)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
