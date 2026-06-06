import { Library, Plus, ArrowRight, Search, List, Heart, Music } from 'lucide-react';
import { useEffect, useState } from 'react';

import { usePlayer } from '../context/PlayerContext';
import { mediaService } from '../services/mediaService';
import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';
import type { MediaItemDto } from '../types';

export const Sidebar = () => {
  const { playMedia } = usePlayer();
  const [library, setLibrary] = useState<MediaItemDto[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [libData, playData] = await Promise.all([
          mediaService.getLibraryPlaylists(),
          playlistService.getUserPlaylists().catch(() => []) // Catch nếu chưa đăng nhập
        ]);
        setLibrary(libData);
        setPlaylists(playData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  const submitCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    try {
      const newPlaylist = await playlistService.createPlaylist(newPlaylistName);
      setPlaylists([newPlaylist, ...playlists]);
      setShowCreateModal(false);
      setNewPlaylistName("");
    } catch (error) {
      alert("Lỗi khi tạo playlist. Vui lòng đăng nhập.");
    }
  };

  return (
    <div className="w-[350px] lg:w-[420px] bg-spotify-card rounded-lg flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 text-spotify-lighttext hover:text-white font-bold transition group">
              <Library size={24} className="group-hover:text-white" />
              <span>Thư viện</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-spotify-lighttext">
            <button onClick={() => setShowCreateModal(true)} className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition flex items-center gap-1 text-sm font-semibold" title="Tạo playlist mới">
              <Plus size={20} /> Tạo
            </button>
            <button className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 text-sm font-medium mt-1">
          <button className="px-3 py-1.5 bg-spotify-hover2 text-white rounded-full transition">Playlist</button>
        </div>
      </div>

      {/* Playlist Content */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="flex items-center justify-between px-2 py-2 mb-2 text-spotify-lighttext">
          <button className="p-1.5 hover:bg-spotify-hover2 rounded-full transition"><Search size={18} /></button>
          <button className="flex items-center gap-1.5 text-sm font-medium hover:text-white transition group">
            <span>Gần đây</span>
            <List size={18} className="group-hover:text-white" />
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-1 pb-4">
          <div className="flex items-center gap-3 p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition">
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-600 to-purple-400 flex-shrink-0 flex items-center justify-center shadow-md">
              <Heart size={20} className="fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base text-white font-semibold">Bài hát đã thích</span>
              <span className="text-sm text-spotify-lighttext font-medium">Danh sách phát • Tự động</span>
            </div>
          </div>
          
          {/* User Playlists */}
          {playlists.map(playlist => (
            <div 
              key={playlist.id}
              onClick={() => window.location.href = `/playlist/${playlist.id}`}
              className="flex items-center gap-3 p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition"
            >
              <div className="w-12 h-12 rounded-md bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center overflow-hidden">
                {playlist.coverUrl ? (
                  <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
                ) : (
                  <Library size={20} className="text-zinc-500" />
                )}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-base text-white font-semibold truncate">{playlist.name}</span>
                <span className="text-sm text-spotify-lighttext font-medium truncate">Danh sách phát • Bạn</span>
              </div>
            </div>
          ))}
          
          {loading ? (
             <div className="p-4 text-center text-zinc-500 text-sm">Đang tải thư viện...</div>
          ) : library.length > 0 ? (
             library.map(item => (
                <div 
                  key={item.id}
                  onClick={() => playMedia(item)}
                  className="flex items-center gap-3 p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition"
                >
                  <div className="w-12 h-12 rounded-md bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center">
                    <Music size={20} className="text-zinc-500" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-base text-white font-semibold truncate">{item.title}</span>
                    <span className="text-sm text-spotify-lighttext font-medium truncate">{item.mediaType} • Tải lên gần đây</span>
                  </div>
                </div>
             ))
          ) : (
             <div className="p-4 text-center text-zinc-500 text-sm">Thư viện trống.</div>
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
               className="w-full bg-zinc-700/50 text-white rounded-md p-3 outline-none focus:ring-2 focus:ring-white mb-6 placeholder-zinc-400 font-medium"
               autoFocus
             />
             <div className="flex justify-end gap-2">
               <button 
                 onClick={() => { setShowCreateModal(false); setNewPlaylistName(""); }}
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
