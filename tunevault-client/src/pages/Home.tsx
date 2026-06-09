import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { mediaService } from '../services/mediaService';
import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';
import type { MediaItemDto } from '../types';
import { Plus, Trash2 } from 'lucide-react';

export const Home = () => {
  const { playMedia } = usePlayer();
  const [tracks, setTracks] = useState<MediaItemDto[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

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
    <div className="pb-8">
      {/* Section 2 */}
      <section>
        <div className="flex items-end justify-between mb-4 mt-8">
          <div>
            <p className="text-sm text-zinc-400 font-medium">Dành Cho</p>
            <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Bạn</h2>
          </div>
          <span className="text-sm font-bold text-zinc-400 hover:text-white cursor-pointer transition">Hiện tất cả</span>
        </div>
        
        {loading ? (
          <div className="text-zinc-500 font-medium">Đang tải...</div>
        ) : tracks.length > 0 ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
            {tracks.map(track => (
              <div 
                key={track.id}
                onClick={() => playMedia(track)}
                className="p-4 rounded-md bg-zinc-800/20 hover:bg-zinc-800 transition cursor-pointer group relative"
              >
                <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 shadow-lg flex items-center justify-center group-hover:shadow-xl transition relative overflow-hidden">
                  {track.coverUrl ? (
                    <img src={`http://localhost:5183${track.coverUrl}`} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                       <span className="text-3xl font-black text-white/50">{track.title.charAt(0)}</span>
                    </div>
                  )}
                  <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                    <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                  </button>
                </div>
                <h3 className="font-bold text-white truncate text-base">{track.title}</h3>
                <p className="text-sm text-zinc-400 mt-1 truncate">{track.artistName || track.description || 'Nghệ sĩ'}</p>
                
                {currentUser && track.uploaderId === currentUser.userId && (
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm("Bạn có chắc chắn muốn xóa bài này vĩnh viễn khỏi hệ thống không? Hành động này không thể hoàn tác.")) {
                        try {
                          await mediaService.deleteMedia(track.id);
                          setTracks(prev => prev.filter(t => t.id !== track.id));
                          alert("Đã xóa bài hát thành công!");
                        } catch (error) {
                          alert("Lỗi khi xóa. Bạn chỉ có thể xóa bài hát do chính mình tải lên.");
                        }
                      }
                    }}
                    className="absolute top-6 left-6 p-1.5 bg-black/60 hover:bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition shadow-md"
                    title="Xóa bài hát này"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
                
                <button 
                  onClick={(e) => handleAddToPlaylist(e, track.id)}
                  className="absolute top-6 right-6 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition shadow-md"
                  title="Thêm vào Playlist"
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 font-medium">Chưa có bài hát nào được tải lên.</div>
        )}
      </section>
    </div>
  );
};
