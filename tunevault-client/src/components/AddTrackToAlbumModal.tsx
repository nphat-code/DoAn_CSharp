import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, Plus } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import { albumService } from '../services/albumService';
import type { MediaItemDto } from '../types';

interface AddTrackToAlbumModalProps {
  onClose: () => void;
  onSuccess: () => void;
  albumId: string;
}

export const AddTrackToAlbumModal = ({ onClose, onSuccess, albumId }: AddTrackToAlbumModalProps) => {
  const [query, setQuery] = useState('');
  const [tracks, setTracks] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const data = await mediaService.getAllMedia(); // gets all media
        setTracks(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        const data = await mediaService.getAllMedia();
        setTracks(data);
        return;
      }
      setLoading(true);
      try {
        const data = await mediaService.searchMedia(query);
        setTracks(data.tracks ? data.tracks : []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    const debounceTimeout = setTimeout(doSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleAdd = async (trackId: string) => {
    try {
      await albumService.addTrackToAlbum(albumId, trackId);
      alert('Đã thêm bài hát vào album!');
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Lỗi khi thêm bài hát');
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[#282828] rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
          <h2 className="text-xl font-bold text-white">Thêm bài hát có sẵn vào Album</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4 overflow-hidden min-h-0 flex-1">
          <div className="flex items-center bg-zinc-800 rounded-full h-10 px-4">
            <Search size={18} className="text-zinc-400 mr-2" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm bài hát..." 
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-zinc-400"
            />
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 -mx-2 px-2">
            {loading ? (
              <div className="text-zinc-400 text-center py-4">Đang tải...</div>
            ) : tracks.length === 0 ? (
              <div className="text-zinc-400 text-center py-4">Không tìm thấy bài hát.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {tracks.map((track) => (
                  <div key={track.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-md group">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 bg-zinc-700 rounded-sm flex-shrink-0">
                        {track.coverUrl && (
                          <img src={track.coverUrl.startsWith('http') ? track.coverUrl : track.coverUrl?.startsWith('http') ? track.coverUrl : `https://tunevault-api.onrender.com${track.coverUrl}`} alt="" className="w-full h-full object-cover rounded-sm" />
                        )}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-white text-sm font-medium truncate">{track.title}</span>
                        <span className="text-zinc-400 text-xs truncate">{track.artistName || 'Nghệ sĩ'}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleAdd(track.id)}
                      className="text-white bg-transparent border border-white/30 rounded-full px-3 py-1 text-xs font-bold hover:border-white hover:scale-105 transition flex items-center gap-1 shrink-0"
                    >
                      <Plus size={14} /> Thêm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
