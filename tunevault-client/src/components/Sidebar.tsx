import { Library, Plus, ArrowRight, Search, List, Heart, Music, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useNotification } from '../context/NotificationContext';
import { mediaService } from '../services/mediaService';
import type { MediaItemDto } from '../types';

export const Sidebar = () => {
  const { playMedia } = usePlayer();
  const { unreadCount } = useNotification();
  const [library, setLibrary] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const data = await mediaService.getLibraryPlaylists();
        setLibrary(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  return (
    <div className="w-[350px] lg:w-[420px] bg-zinc-900 rounded-lg flex flex-col overflow-hidden h-full">
      {/* Header */}
      <div className="p-4 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 text-zinc-400 hover:text-white font-bold transition group">
              <Library size={24} className="group-hover:text-white" />
              <span>Thư viện</span>
            </button>
            
            {/* Notification Bell with Badge */}
            <button className="relative flex items-center gap-2 text-zinc-400 hover:text-white font-bold transition">
              <Bell size={20} />
              <span>Thông báo</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-zinc-400">
            <button className="p-2 hover:bg-zinc-800 hover:text-white rounded-full transition">
              <Plus size={20} />
            </button>
            <button className="p-2 hover:bg-zinc-800 hover:text-white rounded-full transition">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 text-sm font-medium">
          <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full transition">Danh sách phát</button>
          <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full transition">Nghệ sĩ</button>
          <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full transition">Album</button>
        </div>
      </div>

      {/* Playlist Content */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className="flex items-center justify-between px-2 py-2 mb-2 text-zinc-400">
          <button className="p-1.5 hover:bg-zinc-800 rounded-full transition"><Search size={18} /></button>
          <button className="flex items-center gap-1.5 text-sm font-medium hover:text-white transition group">
            <span>Gần đây</span>
            <List size={18} className="group-hover:text-white" />
          </button>
        </div>

        {/* List */}
        <div className="flex flex-col gap-1 pb-4">
          <div className="flex items-center gap-3 p-2 hover:bg-zinc-800/80 rounded-md cursor-pointer transition">
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-indigo-600 to-purple-400 flex-shrink-0 flex items-center justify-center shadow-md">
              <Heart size={20} className="fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base text-white font-semibold">Bài hát đã thích</span>
              <span className="text-sm text-zinc-400 font-medium">Danh sách phát • Tự động</span>
            </div>
          </div>
          
          {loading ? (
             <div className="p-4 text-center text-zinc-500 text-sm">Đang tải thư viện...</div>
          ) : library.length > 0 ? (
             library.map(item => (
                <div 
                  key={item.id}
                  onClick={() => playMedia(item)}
                  className="flex items-center gap-3 p-2 hover:bg-zinc-800/80 rounded-md cursor-pointer transition"
                >
                  <div className="w-12 h-12 rounded-md bg-zinc-800 flex-shrink-0 shadow-md flex items-center justify-center">
                    <Music size={20} className="text-zinc-500" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-base text-white font-semibold truncate">{item.title}</span>
                    <span className="text-sm text-zinc-400 font-medium truncate">{item.mediaType} • Tải lên gần đây</span>
                  </div>
                </div>
             ))
          ) : (
             <div className="p-4 text-center text-zinc-500 text-sm">Thư viện trống.</div>
          )}
        </div>
      </div>
    </div>
  );
};
