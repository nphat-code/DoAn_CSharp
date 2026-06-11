import { useEffect, useState } from 'react';
import { FastAverageColor } from 'fast-average-color';
import { useParams, useNavigate } from 'react-router-dom';
import { albumService, type AlbumDetailDto } from '../services/albumService';
import { usePlayer } from '../context/PlayerContext';
import { Play, Clock, Disc, PlusCircle, ArrowDownCircle, MoreHorizontal, User, Plus, Trash2 } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import { AddTrackToAlbumModal } from '../components/AddTrackToAlbumModal';

export const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<AlbumDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [bgColor, setBgColor] = useState<string>('rgba(49, 46, 129, 0.4)');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const { playMediaList, currentMedia, isFavorited, setIsFavorited, isPlaying, togglePlayPause } = usePlayer();
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLikedTracks = async () => {
      try {
        const data = await mediaService.getFavorites();
        setLikedTracks(new Set(data.map(t => t.id)));
      } catch (err) {
        console.error(err);
      }
    };
    if (localStorage.getItem('token')) {
      fetchLikedTracks();
    }
  }, []);

  useEffect(() => {
    if (!currentMedia) return;
    setLikedTracks(prev => {
      const next = new Set(prev);
      if (isFavorited) next.add(currentMedia.id);
      else next.delete(currentMedia.id);
      return next;
    });
  }, [isFavorited, currentMedia]);

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
      const res = await mediaService.toggleFavorite(trackId);
      setLikedTracks(prev => {
        const next = new Set(prev);
        if (res.isFavorited) next.add(trackId);
        else next.delete(trackId);
        return next;
      });
      if (currentMedia && currentMedia.id === trackId) {
        setIsFavorited(res.isFavorited);
      }
    } catch (error) {
      alert("Lỗi khi cập nhật");
    }
  };

  const handlePlayMedia = (index: number) => {
    if (!album || !album.tracks) return;
    const tracksWithCover = album.tracks.map(t => ({
      ...t,
      coverUrl: t.coverUrl || album.coverUrl,
      artistName: t.artistName || album.artistName,
      artistAvatarUrl: t.artistAvatarUrl || album.artistImageUrl
    }));
    playMediaList(tracksWithCover, index);
  };

  const isCurrentAlbum = currentMedia && album?.tracks?.some(t => t.id === currentMedia.id);
  const isAlbumPlaying = isCurrentAlbum && isPlaying;

  const handleMainPlayClick = () => {
    if (!album || !album.tracks || album.tracks.length === 0) return;
    
    if (isCurrentAlbum) {
      togglePlayPause();
    } else {
      handlePlayMedia(0);
    }
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
        className="flex items-end gap-6 px-6 pb-6 shrink-0 relative z-10"
        style={{ height: 'clamp(195.5px, 25cqw, 340px)', minHeight: '195.5px' }}
      >
        <div 
          className="bg-zinc-800 shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden"
          style={{ width: 'clamp(143.69px, 20cqw, 232px)', height: 'clamp(143.69px, 20cqw, 232px)' }}
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
          <span className="text-sm font-bold text-white tracking-widest mb-1">Album</span>
          <h1 
            className="font-black text-white tracking-tighter leading-tight mb-2 line-clamp-2"
            style={{ fontSize: 'clamp(48px, 6cqw, 72px)', lineHeight: '1.2' }}
          >
            {album.title}
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-700 flex-shrink-0 flex items-center justify-center">
              {album.artistImageUrl ? (
                <img src={album.artistImageUrl.startsWith('http') ? album.artistImageUrl : `http://localhost:5183${album.artistImageUrl}`} alt={album.artistName} className="w-full h-full object-cover" />
              ) : (
                <User size={16} className="text-white opacity-50" />
              )}
            </div>
            <span className="text-white font-bold text-xs hover:underline cursor-pointer">{album.artistName || 'Nghệ sĩ'}</span>
            <span className="text-zinc-300 text-[10px]">•</span>
            <span className="text-zinc-300 font-medium text-xs">{new Date(album.releaseDate).getFullYear()}</span>
            <span className="text-zinc-300 text-[10px]">•</span>
            <span className="text-zinc-300 font-medium text-xs">{album.tracks?.length || 0} bài hát,</span>
            <span className="text-zinc-400 text-xs">{getTotalDuration()}</span>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-black/20 to-black/60 border-t border-white/10 pt-6 px-6">
        {/* Controls */}
        <div className="flex items-center gap-6 mb-6 px-2">
          <button
          onClick={handleMainPlayClick}
          className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:scale-105 transition hover:bg-green-400 shadow-xl"
        >
          {isAlbumPlaying ? (
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-black ml-0">
              <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
            </svg>
          ) : (
            <Play size={24} className="text-black fill-black ml-1" />
          )}
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
            {album.tracks && album.tracks.map((track, index) => {
              const isPlayingTrack = currentMedia?.id === track.id;
              return (
              <div
                key={track.id}
                className="grid grid-cols-[32px_1fr_minmax(50px,100px)_60px] gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer"
                onDoubleClick={() => handlePlayMedia(index)}
              >
                <div className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-spotify-lighttext'} text-base font-medium flex items-center justify-end pr-2 relative w-full`}>
                  <span className="group-hover:hidden">{index + 1}</span>
                  <button className="hidden group-hover:block" onClick={(e) => { 
                    e.stopPropagation(); 
                    if (isPlayingTrack) togglePlayPause();
                    else handlePlayMedia(index); 
                  }}>
                    {isPlayingTrack && isPlaying ? (
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="text-white">
                        <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
                      </svg>
                    ) : (
                      <Play size={16} className="fill-white text-white" />
                    )}
                  </button>
                </div>
                <div className="flex flex-col overflow-hidden justify-center">
                  <span className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-white'} font-medium text-base truncate`}>{track.title}</span>
                  <span className="text-spotify-lighttext text-sm truncate hover:underline hover:text-white inline-block w-fit">{track.artistName || album.artistName}</span>
                </div>

                <div className="text-sm text-spotify-lighttext font-medium text-right pr-8 flex items-center justify-end gap-6">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(track.id); }}
                    className={`${likedTracks.has(track.id) ? 'opacity-100 text-[#1ed760]' : 'opacity-0 group-hover:opacity-100 text-spotify-lighttext hover:text-white'} transition`}
                    title={likedTracks.has(track.id) ? "Bỏ thích" : "Thích"}
                  >
                    {likedTracks.has(track.id) ? (
                      <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                    ) : (
                      <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                    )}
                  </button>
                  <span className="w-10">{formatDuration(track.duration)}</span>
                </div>

                <div className="flex items-center gap-4 transition justify-end pr-2 opacity-0 group-hover:opacity-100">
                  <button className="text-spotify-lighttext hover:text-white transition">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>
            )})}
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
