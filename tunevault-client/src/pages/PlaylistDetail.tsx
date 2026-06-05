import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { playlistService } from '../services/playlistService';
import type { PlaylistDetailDto } from '../services/playlistService';
import { usePlayer } from '../context/PlayerContext';
import { Play, Trash2, Clock } from 'lucide-react';

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
        <div className="grid grid-cols-[16px_1fr_minmax(120px,200px)_minmax(120px,200px)_minmax(50px,100px)_40px] gap-4 px-4 py-2 border-b border-zinc-800 text-sm font-medium text-zinc-400 mb-4">
          <div>#</div>
          <div>Tiêu đề</div>
          <div>Album</div>
          <div>Ngày thêm</div>
          <div className="flex justify-center"><Clock size={16} /></div>
          <div></div>
        </div>

        {/* Tracks */}
        <div className="flex flex-col gap-1">
          {playlist.tracks.map((track, index) => (
            <div 
              key={track.id} 
              className="grid grid-cols-[16px_1fr_minmax(120px,200px)_minmax(120px,200px)_minmax(50px,100px)_40px] gap-4 px-4 py-2 hover:bg-zinc-800/50 rounded-md transition items-center group"
            >
              <div className="text-zinc-400 text-sm font-medium flex items-center">{index + 1}</div>
              <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => playMedia(track)}>
                <div className="w-10 h-10 bg-zinc-700 rounded flex-shrink-0"></div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white font-semibold text-base truncate">{track.title}</span>
                  <span className="text-zinc-400 text-sm truncate">{track.mediaType}</span>
                </div>
              </div>
              <div className="text-sm text-zinc-400 truncate">Album</div>
              <div className="text-sm text-zinc-400 truncate">Gần đây</div>
              <div className="text-sm text-zinc-400 font-medium text-center">{track.duration}</div>
              <div>
                <button 
                  onClick={() => handleRemoveTrack(track.id)}
                  className="p-2 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  title="Xóa bài hát"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
