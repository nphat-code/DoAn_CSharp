import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { mediaService } from '../services/mediaService';
import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';
import type { MediaItemDto } from '../types';
import { Plus } from 'lucide-react';

export const Home = () => {
  const { playMedia } = usePlayer();
  const [tracks, setTracks] = useState<MediaItemDto[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [libData, playData] = await Promise.all([
          mediaService.getLibraryPlaylists(),
          playlistService.getUserPlaylists().catch(() => [])
        ]);
        setTracks(libData);
        setPlaylists(playData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddToPlaylist = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    if (playlists.length === 0) {
      alert("Bạn chưa có playlist nào. Hãy tạo playlist bên Sidebar trước.");
      return;
    }
    
    // Đơn giản hóa: Dùng prompt cho user chọn (thay vì UI phức tạp)
    const playlistOptions = playlists.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
    const choice = prompt(`Chọn playlist (nhập số):\n${playlistOptions}`);
    
    if (choice) {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < playlists.length) {
        try {
          await playlistService.addTrackToPlaylist(playlists[index].id, trackId);
          alert("Thêm vào playlist thành công!");
        } catch (error) {
          alert("Thêm thất bại. Có thể bài hát đã có trong playlist.");
        }
      }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-white">Thư viện của bạn</h1>
      
      {loading ? (
        <div className="text-zinc-500">Đang tải...</div>
      ) : tracks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tracks.map(track => (
            <div 
              key={track.id}
              onClick={() => playMedia(track)}
              className="bg-zinc-800/40 p-4 rounded-md hover:bg-zinc-800 transition cursor-pointer group relative"
            >
              <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 shadow-lg flex items-center justify-center group-hover:shadow-xl transition">
                <span className="text-zinc-500 font-bold">Album Art</span>
              </div>
              <h3 className="font-semibold text-white truncate pr-8">{track.title}</h3>
              <p className="text-sm text-zinc-400 mt-1 truncate">{track.mediaType} • {track.description || 'Chưa có mô tả'}</p>
              
              <button 
                onClick={(e) => handleAddToPlaylist(e, track.id)}
                className="absolute bottom-4 right-4 p-2 bg-zinc-700 hover:bg-zinc-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition shadow-md"
                title="Thêm vào Playlist"
              >
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-zinc-500">Chưa có bài hát nào được tải lên.</div>
      )}
    </div>
  );
};
