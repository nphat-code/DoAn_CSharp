import { Library, Plus, ArrowRight, Search, List, Heart, Music } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePlayer } from '../context/PlayerContext';
import { mediaService } from '../services/mediaService';
import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';
import type { MediaItemDto } from '../types';

interface SidebarProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  width?: number;
}

export const Sidebar = ({ isExpanded = false, onToggleExpand, width }: SidebarProps) => {
  const { playMedia } = usePlayer();
  const [library, setLibrary] = useState<MediaItemDto[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pList = [];
        pList.push(mediaService.getAllMedia());
        if (isAuthenticated) {
          pList.push(playlistService.getUserPlaylists().catch(() => []));
        }
        const [libData, playData] = await Promise.all(pList);
        setLibrary(libData as MediaItemDto[]);
        if (playData) setPlaylists(playData as PlaylistDto[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const submitCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const newPlaylist = await playlistService.createPlaylist(newPlaylistName, undefined, isPublic);
      setPlaylists([newPlaylist, ...playlists]);
      setShowCreateModal(false);
      setNewPlaylistName("");
      setIsPublic(false);
    } catch (error) {
      alert("Lỗi khi tạo playlist. Vui lòng đăng nhập.");
    }
  };

  return (
    <div 
      className={`${isExpanded ? 'flex-1' : ''} bg-spotify-card rounded-lg flex flex-col overflow-hidden h-full`}
      style={!isExpanded ? { width: width ? `${width}px` : '420px', minWidth: '280px' } : {}}
    >
      {/* Header */}
      <div className="p-4 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 text-spotify-lighttext hover:text-white font-bold transition group">
              <Library size={24} className="group-hover:text-white shrink-0" />
              <span className={isExpanded ? "block" : "hidden lg:block"}>Thư viện</span>
            </button>
          </div>
          
          <div className={`items-center gap-2 text-spotify-lighttext ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
            {isAuthenticated && (
              <button onClick={() => setShowCreateModal(true)} className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition flex items-center gap-1 text-sm font-semibold" title="Tạo playlist mới">
                <Plus size={20} /> Tạo
              </button>
            )}
            <button onClick={onToggleExpand} className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition" title={isExpanded ? "Thu gọn Thư viện" : "Mở rộng Thư viện"}>
              <ArrowRight size={20} className={isExpanded ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`gap-2 text-sm font-medium mt-1 ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
          <button className="px-3 py-1.5 bg-spotify-hover2 text-white rounded-full transition">Playlist</button>
        </div>
      </div>

      {/* Playlist Content */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className={`items-center justify-between px-2 py-2 mb-2 text-spotify-lighttext ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
          <button className="p-1.5 hover:bg-spotify-hover2 rounded-full transition"><Search size={18} /></button>
          <button className="flex items-center gap-1.5 text-sm font-medium hover:text-white transition group">
            <span>Gần đây</span>
            <List size={18} className="group-hover:text-white" />
          </button>
        </div>

        {/* List */}
        <div className={isExpanded ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4 px-2 mt-4" : "flex flex-col gap-1 pb-4"}>
          {!isAuthenticated ? (
            <div className={`bg-[#242424] rounded-lg p-4 mx-2 my-2 flex-col items-start gap-4 ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
              <div className="flex flex-col gap-1">
                <span className="text-white font-bold text-base">Tạo danh sách phát đầu tiên của bạn</span>
                <span className="text-white font-medium text-sm">Rất dễ, chúng tôi sẽ giúp bạn</span>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:scale-105 transition"
              >
                Tạo danh sách phát
              </button>
            </div>
          ) : (
            <div onClick={() => navigate('/favorites')} className={`p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition ${isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'flex items-center gap-3'}`}>
              <div className={`${isExpanded ? 'w-full aspect-square mb-2' : 'w-12 h-12'} rounded-md bg-gradient-to-br from-indigo-600 to-purple-400 flex-shrink-0 flex items-center justify-center shadow-md`}>
                <Heart size={isExpanded ? 48 : 20} className="fill-white text-white shrink-0" />
              </div>
              <div className={`flex-col w-full ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
                <span className="text-base text-white font-semibold truncate">Bài hát đã thích</span>
                <span className="text-sm text-spotify-lighttext font-medium truncate">Danh sách phát • Tự động</span>
              </div>
            </div>
          )}
          
          {/* User Playlists */}
          {isAuthenticated && playlists.map(playlist => (
            <div 
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className={`p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition ${isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'flex items-center gap-3'}`}
            >
              <div className={`${isExpanded ? 'w-full aspect-square mb-2' : 'w-12 h-12'} rounded-md bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center overflow-hidden`}>
                {playlist.coverUrl ? (
                  <img src={playlist.coverUrl.startsWith('http') || playlist.coverUrl.startsWith('data:') ? playlist.coverUrl : `http://localhost:5183${playlist.coverUrl}`} alt={playlist.name} className="w-full h-full object-cover shrink-0" />
                ) : (
                  <Library size={isExpanded ? 48 : 20} className="text-zinc-500 shrink-0" />
                )}
              </div>
              <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
                <span className="text-base text-white font-semibold truncate">{playlist.name}</span>
                <span className="text-sm text-spotify-lighttext font-medium truncate">Danh sách phát • Bạn</span>
              </div>
            </div>
          ))}
          
          {loading ? (
             <div className="p-4 text-center text-zinc-500 text-sm col-span-full">Đang tải thư viện...</div>
          ) : library.length > 0 ? (
             library.map(item => (
                <div 
                  key={item.id}
                  onClick={() => playMedia(item)}
                  className={`p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition ${isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'flex items-center gap-3'}`}
                >
                  <div className={`${isExpanded ? 'w-full aspect-square mb-2' : 'w-12 h-12'} rounded-md bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center overflow-hidden`}>
                    {item.coverUrl ? (
                      <img src={`http://localhost:5183${item.coverUrl}`} alt={item.title} className="w-full h-full object-cover shrink-0" />
                    ) : (
                      <Music size={isExpanded ? 48 : 20} className="text-zinc-500 shrink-0" />
                    )}
                  </div>
                  <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
                    <span className="text-base text-white font-semibold truncate">{item.title}</span>
                    <span className="text-sm text-spotify-lighttext font-medium truncate">{item.mediaType} • Tải lên gần đây</span>
                  </div>
                </div>
             ))
          ) : (
             isAuthenticated && <div className="p-4 text-center text-zinc-500 text-sm col-span-full">Thư viện trống.</div>
          )}
        </div>
      </div>
      {/* Modal Tạo Playlist */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-xl p-6 w-96 shadow-2xl border border-zinc-700 animate-in fade-in zoom-in duration-200">
             <h2 className="text-xl font-bold text-white mb-6 text-center">Tạo danh sách phát</h2>
             <input 
               type="text" 
               placeholder="Thêm tên..." 
               value={newPlaylistName}
               onChange={(e) => setNewPlaylistName(e.target.value)}
               onKeyDown={(e) => { if (e.key === 'Enter') submitCreatePlaylist(); }}
               className="w-full bg-zinc-700/50 text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-white mb-4 placeholder-zinc-400 font-medium"
               autoFocus
             />
             <div className="flex items-center gap-2 mb-6">
               <input 
                 type="checkbox" 
                 id="isPublic"
                 checked={isPublic}
                 onChange={(e) => setIsPublic(e.target.checked)}
                 className="w-4 h-4 rounded text-green-500 focus:ring-green-500 bg-zinc-700 border-zinc-600"
               />
               <label htmlFor="isPublic" className="text-sm text-zinc-300 font-medium cursor-pointer">
                 Đặt ở chế độ công khai
               </label>
             </div>
             <div className="flex justify-end gap-2">
               <button 
                 onClick={() => { setShowCreateModal(false); setNewPlaylistName(""); setIsPublic(false); }}
                 className="px-6 py-3 font-bold text-white hover:scale-105 transition"
               >
                 Hủy
               </button>
               <button 
                 onClick={submitCreatePlaylist}
                 disabled={!newPlaylistName.trim()}
                 className="px-6 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
               >
                 Tạo mới
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
