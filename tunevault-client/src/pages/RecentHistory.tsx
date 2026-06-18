import { useState, useEffect } from 'react';
import { Play, Clock, Music } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import { usePlayer } from '../context/PlayerContext';
import type { MediaItemDto } from '../types';

interface HistoryItem {
  id: string;
  userProfileId: string;
  mediaItemId: string;
  playedAt: string;
  mediaItem: MediaItemDto;
}

export const RecentHistory = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { playMedia } = usePlayer();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await mediaService.getRecentHistory(10);
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-zinc-400">Đang tải lịch sử...</div>;
  }

  return (
    <div className="p-6 md:p-8 flex-1 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Clock size={32} className="text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">Gần đây</h1>
          <p className="text-zinc-400 font-medium text-sm">10 bài hát bạn đã nghe gần đây nhất</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center text-zinc-500 mt-20">
          <Music size={64} className="mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">Bạn chưa nghe bài hát nào gần đây.</p>
        </div>
      ) : (
        <div className="flex flex-col">
          {history.map((item, index) => {
            const track = item.mediaItem;
            if (!track) return null;
            return (
              <div 
                key={item.id || index}
                className="group flex items-center gap-4 p-3 hover:bg-white/10 rounded-md transition cursor-pointer"
                onClick={() => playMedia(track)}
              >
                <div className="w-12 h-12 relative flex-shrink-0">
                  <div className="w-full h-full bg-zinc-800 rounded-md overflow-hidden">
                    {track.coverUrl ? (
                      <img src={track.coverUrl.startsWith('http') ? track.coverUrl : track.coverUrl?.startsWith('http') ? track.coverUrl : `https://tunevault-api.onrender.com${track.coverUrl}`} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                        <Music size={20} className="text-zinc-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition rounded-md">
                    <Play className="text-white fill-white" size={20} />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-base truncate group-hover:text-green-500 transition">{track.title}</h3>
                  <p className="text-zinc-400 text-sm truncate">{(track as any).artist?.name || track.artistName || track.description || 'Không rõ ca sĩ'}</p>
                </div>
                
                <div className="text-sm text-zinc-400 hidden sm:block whitespace-nowrap px-4">
                  {formatDate(item.playedAt)}
                </div>
                
                <div className="text-sm text-zinc-400 w-12 text-right">
                  {track.duration ? 
                    (track.duration.split(':').length === 3 && track.duration.startsWith('00:') 
                      ? track.duration.substring(3).split('.')[0] 
                      : track.duration.split('.')[0]) 
                    : '--:--'}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
