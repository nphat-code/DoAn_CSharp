import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { playlistService } from '../services/playlistService';
import type { PlaylistDetailDto } from '../services/playlistService';
import { usePlayer } from '../context/PlayerContext';
import { Play, Trash2, Clock, Search, Heart } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import type { MediaItemDto } from '../types';

export const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [playlist, setPlaylist] = useState<PlaylistDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { playMedia } = usePlayer();

  const fetchDetails = async () => {
    try {
      if (id) {
        const data = await playlistService.getPlaylistDetails(id);
        setPlaylist(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // State cho việc tìm kiếm và thêm bài hát
  const [addQuery, setAddQuery] = useState("");
  const [addResults, setAddResults] = useState<MediaItemDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (addQuery.trim() === '') {
      setAddResults([]);
      return;
    }
    const doSearch = async () => {
      setIsSearching(true);
      try {
        const data = await mediaService.searchMedia(addQuery);
        // Lọc ra các bài hát chưa có trong playlist
        const existingIds = new Set(playlist?.tracks.map(t => t.id) || []);
        setAddResults(data.filter(t => !existingIds.has(t.id)));
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    };
    const debounceTimeout = setTimeout(() => doSearch(), 500);
    return () => clearTimeout(debounceTimeout);
  }, [addQuery, playlist]);

  const handleAddTrack = async (track: MediaItemDto) => {
    if (!id) return;
    try {
      await playlistService.addTrackToPlaylist(id, track.id);
      // Thêm ngay vào state để cập nhật UI
      setPlaylist(prev => prev ? { ...prev, tracks: [...prev.tracks, track] } : null);
      // Xóa khỏi kết quả tìm kiếm
      setAddResults(prev => prev.filter(t => t.id !== track.id));
    } catch (error) {
      alert("Lỗi khi thêm bài hát");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRemoveTrack = async (trackId: string) => {
    if (!id) return;
    if (confirm("Bạn có chắc muốn xóa bài hát này khỏi playlist?")) {
      try {
        await playlistService.removeTrackFromPlaylist(id, trackId);
        // Cập nhật lại list
        setPlaylist(prev => prev ? { ...prev, tracks: prev.tracks.filter(t => t.id !== trackId) } : null);
      } catch (error) {
        alert("Lỗi khi xóa bài hát");
      }
    }
  };

  const handleDeletePlaylist = async () => {
    if (!id) return;
    if (confirm("Xóa playlist này vĩnh viễn?")) {
      try {
        await playlistService.deletePlaylist(id);
        window.location.href = '/'; // Quay về home
      } catch (error) {
        alert("Lỗi khi xóa playlist");
      }
    }
  };

  if (loading) return <div className="p-6 text-white">Đang tải chi tiết playlist...</div>;
  if (!playlist) return <div className="p-6 text-white">Playlist không tồn tại.</div>;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900/40 to-black p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-end gap-6 mb-8 mt-10">
        <div className="w-48 h-48 bg-zinc-800 shadow-2xl rounded-md flex-shrink-0 flex items-center justify-center">
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-zinc-500 font-bold">Playlist Cover</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-white uppercase tracking-widest">{playlist.isPublic ? "Công khai" : "Cá nhân"}</span>
          <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tighter">{playlist.name}</h1>
          <p className="text-zinc-300 mt-2">{playlist.description || "Danh sách phát tuyệt vời của bạn."}</p>
          <div className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
            <span>{playlist.tracks.length} bài hát</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6 mb-8">
        <button 
          onClick={() => playlist.tracks.length > 0 && playMedia(playlist.tracks[0])}
          className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:scale-105 transition hover:bg-green-400 shadow-xl"
        >
          <Play size={24} className="text-black fill-black ml-1" />
        </button>
        <button onClick={handleDeletePlaylist} className="text-zinc-400 hover:text-white transition">
          Xóa Playlist
        </button>
      </div>

      {/* Track List */}
      <div className="w-full">
        {/* Table Header */}
        <div className="grid grid-cols-[32px_1fr_minmax(120px,200px)_minmax(120px,200px)_minmax(50px,100px)_100px] gap-4 px-4 py-2 border-b border-zinc-800 text-sm font-medium text-spotify-lighttext mb-4 sticky top-0 bg-spotify-card/90 backdrop-blur-md z-10">
          <div className="text-center">#</div>
          <div>Tiêu đề</div>
          <div>Album</div>
          <div>Ngày thêm</div>
          <div className="flex justify-center"><Clock size={16} /></div>
          <div></div>
        </div>

        {/* Tracks */}
        <div className="flex flex-col gap-1 pb-10">
          {playlist.tracks.map((track, index) => (
            <div 
              key={track.id} 
              className="grid grid-cols-[32px_1fr_minmax(120px,200px)_minmax(120px,200px)_minmax(50px,100px)_100px] gap-4 px-4 py-2 hover:bg-spotify-hover2 rounded-md transition items-center group cursor-pointer"
              onDoubleClick={() => playMedia(track)}
            >
              <div className="text-spotify-lighttext text-base font-medium flex items-center justify-center relative w-full">
                <span className="group-hover:hidden">{index + 1}</span>
                <button className="hidden group-hover:block" onClick={(e) => { e.stopPropagation(); playMedia(track); }}>
                  <Play size={16} className="fill-white text-white" />
                </button>
              </div>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 bg-zinc-700 rounded flex-shrink-0"></div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white font-semibold text-base truncate">{track.title}</span>
                  <span className="text-spotify-lighttext text-sm truncate">{track.mediaType}</span>
                </div>
              </div>
              <div className="text-sm text-spotify-lighttext truncate">Album</div>
              <div className="text-sm text-spotify-lighttext truncate">Gần đây</div>
              <div className="text-sm text-spotify-lighttext font-medium text-center">{track.duration}</div>
              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition justify-end">
                <button className="text-spotify-lighttext hover:text-white"><Heart size={16} /></button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemoveTrack(track.id); }}
                  className="text-spotify-lighttext hover:text-red-500 transition"
                  title="Xóa bài hát"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tìm kiếm để thêm bài hát */}
      <div className="mt-12 w-full pt-8 border-t border-zinc-800">
         <h2 className="text-xl font-bold text-white mb-4">Hãy cùng tìm nội dung cho danh sách phát của bạn</h2>
         <div className="relative w-full md:w-96 mb-6">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
           <input 
             type="text" 
             value={addQuery}
             onChange={(e) => setAddQuery(e.target.value)}
             placeholder="Tìm kiếm bài hát hoặc tập tin..."
             className="w-full bg-zinc-800 text-white pl-10 pr-4 py-3 rounded-md text-sm font-medium outline-none focus:ring-1 focus:ring-white transition"
           />
         </div>

         {isSearching && <div className="text-zinc-500 font-medium">Đang tìm kiếm...</div>}
         
         {!isSearching && addResults.length > 0 && (
           <div className="flex flex-col gap-2">
             {addResults.map(track => (
               <div key={track.id} className="flex items-center justify-between p-3 hover:bg-zinc-800/80 rounded-md transition group">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-zinc-700 rounded flex-shrink-0 flex items-center justify-center">
                     <span className="text-white/50 font-bold">{track.title.charAt(0)}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-white font-semibold">{track.title}</span>
                     <span className="text-zinc-400 text-sm">{track.artistName || track.description || "Nghệ sĩ"}</span>
                   </div>
                 </div>
                 <button 
                   onClick={() => handleAddTrack(track)}
                   className="px-4 py-1.5 rounded-full border border-zinc-500 text-white font-bold text-sm hover:border-white hover:scale-105 transition flex items-center gap-1"
                 >
                   Thêm
                 </button>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
};
