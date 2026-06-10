import { useEffect, useState } from 'react';
import { FastAverageColor } from 'fast-average-color';
import { useParams, useNavigate } from 'react-router-dom';
import { albumService, type AlbumDetailDto } from '../services/albumService';
import { usePlayer } from '../context/PlayerContext';
import { Play, Clock, Heart, Disc, PlusCircle, ArrowDownCircle, MoreHorizontal, User, Plus, Trash2 } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import { AddTrackToAlbumModal } from '../components/AddTrackToAlbumModal';
import type { MediaItemDto } from '../types';

export const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<AlbumDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [bgColor, setBgColor] = useState<string>('rgba(49, 46, 129, 0.4)');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const { playMedia } = usePlayer();
  const navigate = useNavigate();

  const fetchDetails = async () => {
    try {
      if (id) {
        const data = await albumService.getAlbumById(id);
        setAlbum(data);
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

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setIsAdmin(user?.role === 'Admin');
    }
  }, []);

  useEffect(() => {
    if (album?.coverUrl) {
      const fac = new FastAverageColor();
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      const baseUrl = album.coverUrl.startsWith('http') ? album.coverUrl : `http://localhost:5183${album.coverUrl}`;
      img.src = `${baseUrl}?c=${Date.now()}`;
      img.onload = () => {
        try {
          const color = fac.getColor(img);
          setBgColor(`rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.8)`);
        } catch (e) {
          console.error("Lỗi lấy màu nền", e);
        }
      };
    } else {
      setBgColor('rgba(49, 46, 129, 0.4)');
    }
  }, [album?.coverUrl]);

  const handleToggleFavorite = async (trackId: string) => {
    try {
      await mediaService.toggleFavorite(trackId);
      alert('Đã cập nhật bài hát yêu thích!');
    } catch (error) {
      alert("Lỗi khi cập nhật");
    }
  };

  const handlePlayMedia = (track: MediaItemDto) => {
    playMedia({
      ...track,
      coverUrl: track.coverUrl || album?.coverUrl,
      artistName: track.artistName || album?.artistName,
      artistAvatarUrl: track.artistAvatarUrl || album?.artistImageUrl
    });
  };

  const handleDeleteAlbum = async () => {
    if (!album || !window.confirm("Bạn có chắc chắn muốn xóa album này?")) return;
    try {
      await albumService.deleteAlbum(album.id);
      alert("Xóa album thành công!");
      navigate('/'); // Go to home after delete
    } catch (error) {
      alert("Lỗi khi xóa album");
    }
  };

  const getTotalDuration = () => {
    if (!album || !album.tracks) return "0 phút";
    let totalSeconds = 0;
    album.tracks.forEach(t => {
      const parts = t.duration.split(':');
      if (parts.length === 3) {
        totalSeconds += parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
      } else if (parts.length === 2) {
        totalSeconds += parseInt(parts[0]) * 60 + parseInt(parts[1]);
      }
    });

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes} phút ${seconds} giây`;
  };

  const formatDuration = (durationStr: string) => {
    if (!durationStr) return "0:00";
    const parts = durationStr.split(':');
    if (parts.length >= 3) {
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      const seconds = parseInt(parts[2].split('.')[0], 10);
      if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return durationStr;
  };

  if (loading) return <div className="p-6 text-white">Đang tải chi tiết album...</div>;
  if (!album) return <div className="p-6 text-white">Album không tồn tại.</div>;

  return (
    <div 
      className="flex flex-col h-full bg-black overflow-y-auto"
      style={{
        background: `linear-gradient(to bottom, ${bgColor} 0%, rgba(0,0,0,1) 70%)`
      }}
    >
      {/* Header */}
      <div 
        className="flex items-end gap-6 px-6 pb-6 shrink-0"
        style={{ height: '225.9px', minHeight: '225.9px' }}
      >
        <div 
          className="shadow-2xl rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden relative group bg-zinc-800"
          style={{ width: '174.11px', height: '174.11px' }}
        >
          {album.coverUrl ? (
            <img src={album.coverUrl.startsWith('http') ? album.coverUrl : `http://localhost:5183${album.coverUrl}`} alt={album.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Disc size={64} className="text-white/30" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-end min-w-0 flex-1 w-full pb-1">
          <span className="text-sm font-bold text-white uppercase tracking-widest mb-1">Album</span>
          <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-tight mb-4 truncate">{album.title}</h1>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0 flex items-center justify-center">
              {album.artistImageUrl ? (
                <img src={album.artistImageUrl.startsWith('http') ? album.artistImageUrl : `http://localhost:5183${album.artistImageUrl}`} alt={album.artistName} className="w-full h-full object-cover" />
              ) : (
                <User size={16} className="text-white opacity-50" />
              )}
            </div>
            <span className="text-white font-bold text-sm hover:underline cursor-pointer">{album.artistName || 'Nghệ sĩ'}</span>
            <span className="text-zinc-300 text-xs">•</span>
            <span className="text-zinc-300 font-medium text-sm">{new Date(album.releaseDate).getFullYear()}</span>
            <span className="text-zinc-300 text-xs">•</span>
            <span className="text-zinc-300 font-medium text-sm">{album.tracks?.length || 0} bài hát,</span>
            <span className="text-zinc-400 text-sm">{getTotalDuration()}</span>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-black/20 to-black/60 border-t border-white/10 pt-6 px-6">
        {/* Controls */}
        <div className="flex items-center gap-6 mb-6 px-2">
          <button
          onClick={() => album.tracks && album.tracks.length > 0 && handlePlayMedia(album.tracks[0])}
          className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:scale-105 transition hover:bg-green-400 shadow-xl"
        >
          <Play size={24} className="text-black fill-black ml-1" />
        </button>
        <button className="text-zinc-400 hover:text-white transition" title="Lưu vào Thư viện">
          <PlusCircle size={32} />
        </button>
        <button className="text-zinc-400 hover:text-white transition" title="Tải xuống">
          <ArrowDownCircle size={32} />
        </button>
        <button className="text-zinc-400 hover:text-white transition ml-2" title="Khác">
          <MoreHorizontal size={32} />
        </button>
        {isAdmin && (
          <div className="flex items-center gap-4 ml-4">
            <button 
              onClick={() => setShowAddTrackModal(true)}
              className="flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition hover:bg-zinc-700"
            >
              <Plus size={18} />
              Thêm bài hát
            </button>
            <button 
              onClick={handleDeleteAlbum}
              className="flex items-center gap-2 bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition"
              title="Xóa Album"
            >
              <Trash2 size={18} />
              Xóa Album
            </button>
          </div>
        )}
      </div>

      {/* Track List Section */}
      <div className="w-full flex-1">
        {/* Table Header */}
        <div className="grid grid-cols-[32px_1fr_minmax(50px,100px)_60px] gap-4 px-4 py-2 border-b border-white/10 text-sm font-medium text-spotify-lighttext mb-4 sticky top-0 bg-transparent z-10 items-center">
            <div className="text-right pr-2">#</div>
            <div>Tiêu đề</div>
            <div className="flex justify-end pr-8"><Clock size={16} /></div>
            <div></div>
          </div>

          {/* Tracks */}
          <div className="flex flex-col gap-1 pb-10">
            {album.tracks && album.tracks.map((track, index) => (
              <div
                key={track.id}
                className="grid grid-cols-[32px_1fr_minmax(50px,100px)_60px] gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer"
                onDoubleClick={() => handlePlayMedia(track)}
              >
                <div className="text-spotify-lighttext text-base font-medium flex items-center justify-end pr-2 relative w-full">
                  <span className="group-hover:hidden">{index + 1}</span>
                  <button className="hidden group-hover:block" onClick={(e) => { e.stopPropagation(); handlePlayMedia(track); }}>
                    <Play size={16} className="fill-white text-white" />
                  </button>
                </div>
                <div className="flex flex-col overflow-hidden justify-center">
                  <span className="text-white font-medium text-base truncate">{track.title}</span>
                  <span className="text-spotify-lighttext text-sm truncate hover:underline hover:text-white inline-block w-fit">{track.artistName || album.artistName}</span>
                </div>

                <div className="text-sm text-spotify-lighttext font-medium text-right pr-8 flex items-center justify-end">{formatDuration(track.duration)}</div>

                <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition justify-end">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(track.id); }}
                    className="text-spotify-lighttext hover:text-white transition"
                    title="Thích"
                  >
                    <PlusCircle size={18} />
                  </button>
                  <button className="text-spotify-lighttext hover:text-white transition">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            ))}
            {(!album.tracks || album.tracks.length === 0) && (
              <div className="text-zinc-500 font-medium py-4 px-2">Chưa có bài hát nào trong album này.</div>
            )}
          </div>
        </div>
      </div>
      {/* Add Track Modal */}
      {showAddTrackModal && isAdmin && album && (
        <AddTrackToAlbumModal 
          onClose={() => setShowAddTrackModal(false)}
          onSuccess={() => {
            setShowAddTrackModal(false);
            fetchDetails(); // Reload để thấy bài hát mới
          }}
          albumId={album.id}
        />
      )}
    </div>
  );
};

export default AlbumDetail;
