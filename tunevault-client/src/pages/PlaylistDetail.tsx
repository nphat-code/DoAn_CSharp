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
  const { playMediaList, currentMedia, isPlaying, togglePlayPause } = usePlayer();

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

  const isCurrentPlaylist = currentMedia && playlist.tracks?.some(t => t.id === currentMedia.id);
  const isPlaylistPlaying = isCurrentPlaylist && isPlaying;

  const handleMainPlayClick = () => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return;
    if (isCurrentPlaylist) {
      togglePlayPause();
    } else {
      playMediaList(playlist.tracks, 0);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-indigo-900/40 to-black overflow-y-auto">
      {/* Header */}
      <div 
        className="flex items-end gap-6 px-6 pb-6 shrink-0 relative z-10"
        style={{ height: 'clamp(195.5px, 25cqw, 340px)', minHeight: '195.5px' }}
      >
        <div 
          className="bg-zinc-800 shadow-2xl rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ width: 'clamp(143.69px, 20cqw, 232px)', height: 'clamp(143.69px, 20cqw, 232px)' }}
        >
          {playlist.coverUrl ? (
            <img src={playlist.coverUrl.startsWith('http') || playlist.coverUrl.startsWith('data:') ? playlist.coverUrl : `http://localhost:5183${playlist.coverUrl}`} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-zinc-500 font-bold">Playlist Cover</span>
          )}
        </div>
        <div className="flex flex-col justify-end min-w-0 flex-1 w-full pb-1">
          <span className="text-sm font-bold text-white tracking-widest mb-1">{playlist.isPublic ? "Công khai" : "Cá nhân"}</span>
          <h1 
            className="font-black text-white tracking-tighter leading-tight mb-2 line-clamp-2"
            style={{ fontSize: 'clamp(48px, 6cqw, 72px)', lineHeight: '1.2' }}
          >
            {playlist.name}
          </h1>
          <p className="text-zinc-300 mb-2 truncate">{playlist.description || "Danh sách phát tuyệt vời của bạn."}</p>
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
            <span className="font-bold text-white hover:underline cursor-pointer">Người dùng</span>
            <span className="text-white font-bold">•</span>
            <span>{playlist.tracks?.length || 0} bài hát</span>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-black/20 to-black/60 border-t border-white/10 pt-6 px-6">
        {/* Controls */}
        <div className="flex items-center gap-6 mb-6">
          <button 
            onClick={handleMainPlayClick}
            className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:scale-105 transition hover:bg-green-400 shadow-xl"
          >
            {isPlaylistPlaying ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-black ml-0">
                <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
              </svg>
            ) : (
              <Play size={24} className="text-black fill-black ml-1" />
            )}
          </button>
          <button onClick={handleDeletePlaylist} className="text-zinc-400 hover:text-white transition">
            Xóa Playlist
          </button>
        </div>

        {/* Track List Section */}
        <div className="w-full flex-1">
          {/* Table Header */}
          <div className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,2fr)_minmax(100px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm font-medium text-[#b3b3b3] mb-4 sticky top-0 bg-transparent z-10 items-center">
            <div className="text-right pr-2">#</div>
            <div>Tiêu đề</div>
            <div className="hidden md:block">Album</div>
            <div className="hidden lg:block">Ngày thêm</div>
            <div className="flex justify-end pr-6"><Clock size={16} /></div>
          </div>

          {/* Tracks */}
          <div className="flex flex-col gap-0 pb-10">
            {playlist.tracks && playlist.tracks.map((track, index) => {
              const isPlayingTrack = currentMedia?.id === track.id;
              return (
              <div 
                key={track.id} 
                className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,2fr)_minmax(100px,1fr)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer"
                onDoubleClick={() => {
                  if (isPlayingTrack) togglePlayPause();
                  else playMediaList(playlist.tracks, index);
                }}
              >
                <div className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-[#b3b3b3]'} text-base font-medium flex items-center justify-end pr-2 relative w-full`}>
                  <span className="group-hover:hidden">{index + 1}</span>
                  <button className="hidden group-hover:block" onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isPlayingTrack) togglePlayPause();
                    else playMediaList(playlist.tracks, index); 
                  }}>
                    {isPlayingTrack && isPlaying ? (
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="text-white">
                        <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
                      </svg>
                    ) : (
                      <Play size={14} className="fill-white text-white" />
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {track.coverUrl ? (
                        <img src={track.coverUrl.startsWith('http') || track.coverUrl.startsWith('data:') ? track.coverUrl : `http://localhost:5183${track.coverUrl}`} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white/50 text-xs">{track.title.charAt(0)}</span>
                      )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-white'} font-semibold text-base truncate`}>{track.title}</span>
                    <span className="text-[#b3b3b3] text-sm truncate hover:underline">{track.artistName || track.description || "Nghệ sĩ"}</span>
                  </div>
                </div>
                <div className="text-sm text-[#b3b3b3] truncate hover:text-white transition hidden md:block">{track.albumTitle || "Đĩa đơn"}</div>
                <div className="text-sm text-[#b3b3b3] truncate hidden lg:block">Gần đây</div>
                <div className="flex items-center justify-end gap-6 pr-4">
                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition">
                    <button className="text-[#b3b3b3] hover:text-white"><Heart size={16} /></button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveTrack(track.id); }}
                      className="text-[#b3b3b3] hover:text-red-500 transition"
                      title="Xóa bài hát"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="text-sm text-[#b3b3b3] font-medium w-10 text-right">{track.duration}</div>
                </div>
              </div>
            )})}
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
    </div>
  );
};
