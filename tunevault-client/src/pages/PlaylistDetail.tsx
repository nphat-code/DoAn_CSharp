import { useEffect, useState, useRef } from 'react';
import { FastAverageColor } from 'fast-average-color';
import { useParams, useNavigate } from 'react-router-dom';
import { playlistService } from '../services/playlistService';
import type { PlaylistDetailDto } from '../services/playlistService';
import { usePlayer } from '../context/PlayerContext';
import { Play, Trash2, Search, MoreHorizontal, Camera, Music, Share2, Edit2, Globe, Lock, Clock, X } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import type { MediaItemDto } from '../types';
import { ShareMediaModal } from '../components/ShareMediaModal';
import { TrackDropdownMenu } from '../components/TrackDropdownMenu';

export const PlaylistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [playlist, setPlaylist] = useState<PlaylistDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [bgColor, setBgColor] = useState<string>('rgba(49, 46, 129, 0.4)');

  const { playMediaList, currentMedia, isPlaying, togglePlayPause, queue, updateQueueContext } = usePlayer();

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCover, setEditCover] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCoverDropdown, setShowCoverDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [autoOpenFilePicker, setAutoOpenFilePicker] = useState(false);

  useEffect(() => {
    if (showEditModal && autoOpenFilePicker && fileInputRef.current) {
      setTimeout(() => {
        fileInputRef.current?.click();
        setAutoOpenFilePicker(false);
      }, 100);
    }
  }, [showEditModal, autoOpenFilePicker]);

  // Share states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ id: string, type: 'Bài hát' | 'Nghệ sĩ' | 'Album' | 'Danh sách phát', title: string } | null>(null);

  // Favorites state
  const [favoritesIds, setFavoritesIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFavs = () => {
      if (localStorage.getItem('token')) {
        mediaService.getFavorites().then(f => setFavoritesIds(new Set(f.map(t => t.id)))).catch(() => { });
      }
    };
    fetchFavs();
    window.addEventListener('favoritesUpdated', fetchFavs);
    return () => window.removeEventListener('favoritesUpdated', fetchFavs);
  }, []);

  const handleToggleFavorite = async (e: React.MouseEvent, trackId: string) => {
    e.stopPropagation();
    try {
      const res = await mediaService.toggleFavorite(trackId);
      setFavoritesIds(prev => {
        const next = new Set(prev);
        if (res.isFavorited) next.add(trackId);
        else next.delete(trackId);
        return next;
      });
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (error) {
      console.error(error);
    }
  };

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
        setAddResults(data.tracks ? data.tracks.filter(t => !existingIds.has(t.id)) : []);
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

  const handleEditSave = async () => {
    if (!id || !playlist) return;
    try {
      await playlistService.updatePlaylist(id, editName, editDescription, editCover);
      setPlaylist({ ...playlist, name: editName, description: editDescription, coverUrl: editCover || undefined });
      setShowEditModal(false);
      window.dispatchEvent(new Event('playlistsUpdated'));
    } catch (error) {
      alert("Lỗi khi cập nhật playlist.");
    }
  };

  const handleTogglePublic = async () => {
    if (!id || !playlist) return;
    try {
      await playlistService.updatePlaylist(id, playlist.name, playlist.description, undefined, !playlist.isPublic);
      setPlaylist({ ...playlist, isPublic: !playlist.isPublic });
      setShowDropdown(false);
    } catch (error) {
      alert("Lỗi khi cập nhật trạng thái");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditCover(reader.result as string);
        setShowCoverDropdown(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayCover = playlist?.coverUrl || (playlist?.tracks && playlist.tracks.length > 0 ? playlist.tracks[0].coverUrl : null);
  const getCoverUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://tunevault-api.onrender.com';
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    if (displayCover) {
      const fac = new FastAverageColor();
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      const baseUrl = getCoverUrl(displayCover);
      if (baseUrl) {
        img.src = baseUrl.startsWith('data:') ? baseUrl : `${baseUrl}?c=${Date.now()}`;
      }
      img.onload = () => {
        try {
          const color = fac.getColor(img);
          setBgColor(`rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.8)`);
        } catch (e) {
          console.error("Lỗi lấy màu nền", e);
        }
      };
    } else {
      setBgColor('rgba(63, 63, 70, 0.8)');
    }
  }, [displayCover]);

  if (loading) return <div className="p-6 text-white">Đang tải chi tiết playlist...</div>;
  if (!playlist) return <div className="p-6 text-white">Playlist không tồn tại.</div>;

  const isCurrentPlaylistTrackPlaying = currentMedia && playlist.tracks?.some(t => t.id === currentMedia.id);
  const isPlaylistPlaying = isCurrentPlaylistTrackPlaying && isPlaying;

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const username = (playlist as any).userName || user?.username || "Người dùng";
  const isAdmin = user && playlist && user.id === playlist.userProfileId;

  const handleMainPlayClick = () => {
    if (!playlist || !playlist.tracks || playlist.tracks.length === 0) return;
    if (isCurrentPlaylistTrackPlaying) {
      if (queue.length <= 1) {
        updateQueueContext(playlist.tracks, currentMedia.id);
      }
      togglePlayPause();
    } else {
      playMediaList(playlist.tracks, 0);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-black relative"
      style={{ overflowY: 'overlay' as any }}
    >
      {/* Background Gradient */}
      <div
        className="absolute top-0 left-0 w-full h-[500px] pointer-events-none z-0"
        style={{
          background: `linear-gradient(to bottom, ${bgColor} 0%, rgba(0,0,0,1) 100%)`,
        }}
      />
      {/* Header */}
      <div
        className="flex items-end gap-6 px-6 pb-6 shrink-0 relative z-10"
        style={{ height: 'clamp(195.5px, 25cqw, 340px)', minHeight: '195.5px' }}
      >
        <div
          className="bg-zinc-800 shadow-2xl rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden group relative cursor-pointer"
          style={{ width: 'clamp(143.69px, 20cqw, 232px)', height: 'clamp(143.69px, 20cqw, 232px)' }}
          onClick={() => {
            setEditName(playlist.name);
            setEditDescription(playlist.description || "");
            setEditCover(playlist.coverUrl || null);
            setShowEditModal(true);
            setAutoOpenFilePicker(true);
          }}
        >
          {displayCover ? (
            <img src={getCoverUrl(displayCover)!} alt={playlist.name} className="w-full h-full object-cover" />
          ) : (
            <Music className="text-zinc-500 w-16 h-16" />
          )}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
            <Camera size={48} className="mb-2" />
            <span className="text-sm font-bold">Chọn ảnh</span>
          </div>
        </div>
        <div className="flex flex-col justify-end min-w-0 flex-1 w-full pb-1">
          <span className="text-sm font-bold text-white tracking-widest mb-1">Danh sách phát {playlist.isPublic ? "công khai" : "riêng tư"}</span>
          <h1
            className="font-black text-white tracking-tighter leading-tight mb-2 line-clamp-2 cursor-pointer"
            style={{ fontSize: 'clamp(32px, 5cqw, 56px)', lineHeight: '1.2' }}
            onClick={() => {
              setEditName(playlist.name);
              setEditDescription(playlist.description || "");
              setEditCover(playlist.coverUrl || null);
              setShowEditModal(true);
            }}
          >
            {playlist.name}
          </h1>
          {playlist.description && <p className="text-zinc-300 mb-2 truncate">{playlist.description}</p>}
          <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
            <span className="font-bold text-white hover:underline cursor-pointer" onClick={() => navigate(`/user/${playlist.userProfileId || user?.id}`)}>{username}</span>
            <span className="text-white font-bold">•</span>
            <span>{playlist.tracks?.length || 0} bài hát</span>
          </div>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col border-t border-white/10 pt-6 relative z-10 bg-black/20">
        {/* Controls */}
        <div className="flex items-center gap-6 mb-6 px-6">
          {playlist.tracks && playlist.tracks.length > 0 && (
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
          )}

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-zinc-400 hover:text-white transition p-2"
            >
              <MoreHorizontal size={32} />
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)}></div>
                <div className="absolute left-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-2xl border border-zinc-700 py-1 z-20">
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setEditName(playlist.name);
                      setEditDescription(playlist.description || "");
                      setEditCover(playlist.coverUrl || null);
                      setShowEditModal(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Sửa thông tin chi tiết
                  </button>
                  <button
                    onClick={handleTogglePublic}
                    className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
                  >
                    {playlist.isPublic ? <Lock size={16} /> : <Globe size={16} />}
                    {playlist.isPublic ? "Đặt thành riêng tư" : "Đặt thành công khai"}
                  </button>
                  <hr className="border-white/10 my-1" />
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleDeletePlaylist();
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    Xóa
                  </button>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      setShareData({ id: playlist.id, type: 'Danh sách phát', title: playlist.name });
                      setShowShareModal(true);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition flex items-center gap-2"
                  >
                    <Share2 size={16} />
                    Chia sẻ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Track List Section */}
        <div className="w-full flex-1">
          {/* Table Header */}
          {playlist.tracks && playlist.tracks.length > 0 && (
            <div className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm font-medium text-[#b3b3b3] mb-4 sticky top-0 bg-transparent z-10 items-center">
              <div className="text-right pr-2">#</div>
              <div>Tiêu đề</div>
              <div className="hidden md:block">Album</div>
              <div className="flex items-center justify-end gap-4 pr-4">
                <div className="w-4"></div>
                <div className="w-12 text-right flex justify-end"><Clock size={16} /></div>
                <div className="w-[18px]"></div>
              </div>
            </div>
          )}

          {/* Tracks */}
          <div className="flex flex-col gap-0 pb-10">
            {playlist.tracks && playlist.tracks.map((track, index) => {
              const isPlayingTrack = currentMedia?.id === track.id;
              return (
                <div
                  key={track.id}
                  className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(120px,1fr)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer"
                  onDoubleClick={() => {
                    if (isPlayingTrack) {
                      if (queue.length <= 1) {
                        updateQueueContext(playlist.tracks, currentMedia.id);
                      }
                      togglePlayPause();
                    } else {
                      playMediaList(playlist.tracks, index);
                    }
                  }}
                >
                  <div className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-[#b3b3b3]'} text-base font-medium flex items-center justify-end pr-2 relative w-full`}>
                    <span className="group-hover:hidden">{index + 1}</span>
                    <button className="hidden group-hover:block" onClick={(e) => {
                      e.stopPropagation();
                      if (isPlayingTrack) {
                        if (queue.length <= 1) {
                          updateQueueContext(playlist.tracks, currentMedia.id);
                        }
                        togglePlayPause();
                      } else {
                        playMediaList(playlist.tracks, index);
                      }
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
                        <img src={track.coverUrl.startsWith('http') || track.coverUrl.startsWith('data:') ? track.coverUrl : track.coverUrl?.startsWith('http') ? track.coverUrl : `https://tunevault-api.onrender.com${track.coverUrl}`} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white/50 text-xs">{track.title.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-white'} font-semibold text-base truncate`}>{track.title}</span>
                      <span
                        className="text-[#b3b3b3] text-sm truncate hover:underline hover:text-white cursor-pointer inline-block w-fit"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (track.artistId) navigate(`/artist/${track.artistId}`);
                        }}
                      >
                        {track.artistName || track.description || "Nghệ sĩ"}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-[#b3b3b3] truncate hover:text-white transition hidden md:block">{track.albumTitle || track.title}</div>
                  <div className="flex items-center justify-end gap-4 pr-4">
                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => handleToggleFavorite(e, track.id)}
                        className={`hover:scale-105 transition ${favoritesIds.has(track.id) ? 'opacity-100' : 'text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100'}`}
                      >
                        {favoritesIds.has(track.id) ? (
                          <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                        ) : (
                          <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                        )}
                      </button>
                    </div>
                    <div className="text-sm text-[#b3b3b3] font-medium w-12 text-right">{formatDuration(track.duration)}</div>
                    <TrackDropdownMenu
                      track={track}
                      isFavorited={favoritesIds.has(track.id)}
                      onToggleFavorite={(id) => handleToggleFavorite(undefined, id)}
                      onShare={(id, title) => {
                        setShareData({ id, type: 'Bài hát', title });
                        setShowShareModal(true);
                      }}
                      onRemoveFromPlaylist={isAdmin ? handleRemoveTrack : undefined}
                      className="opacity-0 group-hover:opacity-100 transition"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Tìm kiếm để thêm bài hát */}
        <div className="mt-12 w-full pt-8 px-6 pb-12 border-t border-zinc-800">
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
            <div className="flex flex-col gap-0 pb-6">
              {addResults.map((track, idx) => {
                const isPlayingTrack = currentMedia?.id === track.id;
                return (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 hover:bg-white/10 rounded-md transition group cursor-pointer"
                    onDoubleClick={() => {
                      if (isPlayingTrack) {
                        togglePlayPause();
                      } else {
                        playMediaList(addResults, idx);
                      }
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1 overflow-hidden">
                      <div className="relative w-10 h-10 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {track.coverUrl ? (
                          <img src={track.coverUrl.startsWith('http') || track.coverUrl.startsWith('data:') ? track.coverUrl : track.coverUrl?.startsWith('http') ? track.coverUrl : `https://tunevault-api.onrender.com${track.coverUrl}`} alt={track.title} className="w-full h-full object-cover group-hover:opacity-50 transition" />
                        ) : (
                          <span className="text-white/50 text-xs group-hover:opacity-0 transition">{track.title.charAt(0)}</span>
                        )}

                        <button className="absolute inset-0 m-auto flex items-center justify-center hidden group-hover:flex" onClick={(e) => {
                          e.stopPropagation();
                          if (isPlayingTrack) {
                            togglePlayPause();
                          } else {
                            playMediaList(addResults, idx);
                          }
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
                      <div className="flex flex-col overflow-hidden w-[40%]">
                        <span className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-white'} font-semibold text-base truncate`}>{track.title}</span>
                        <span
                          className="text-zinc-400 text-sm hover:underline hover:text-white cursor-pointer inline-block w-fit truncate"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (track.artistId) navigate(`/artist/${track.artistId}`);
                          }}
                        >
                          {track.artistName || track.description || "Nghệ sĩ"}
                        </span>
                      </div>
                      <div className="text-sm text-[#b3b3b3] truncate flex-1 hidden md:block">{track.albumTitle || track.title}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAddTrack(track); }}
                      className="px-4 py-1.5 ml-4 rounded-full border border-zinc-500 text-white font-bold text-sm hover:border-white hover:scale-105 transition flex items-center gap-1 shrink-0"
                    >
                      Thêm
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showShareModal && shareData && (
        <ShareMediaModal
          mediaId={shareData.id}
          mediaType={shareData.type}
          mediaTitle={shareData.title}
          onClose={() => {
            setShowShareModal(false);
            setShareData(null);
          }}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-800 rounded-lg shadow-2xl w-full max-w-[524px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 pb-4">
              <h2 className="text-2xl font-bold text-white">Sửa thông tin chi tiết</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-zinc-400 hover:text-white transition rounded-full p-2 hover:bg-white/10"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 pt-2 flex gap-4">
              {/* Image Uploader */}
              <div
                className="relative w-[180px] h-[180px] bg-zinc-700 rounded shadow-md group flex-shrink-0"
                onMouseLeave={() => setShowCoverDropdown(false)}
              >
                {editCover || (displayCover && editCover !== "") ? (
                  <img src={getCoverUrl(editCover || displayCover)!} alt="Cover" className="w-full h-full object-cover rounded" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music size={48} className="text-zinc-500" />
                  </div>
                )}

                {/* Hover overlay for clicking */}
                <div
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer rounded"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera size={48} className="mb-2" />
                  <span className="text-sm font-medium">Chọn ảnh</span>
                </div>

                {/* Top-right 3 dots */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowCoverDropdown(!showCoverDropdown); }}
                      className="p-1 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                    {showCoverDropdown && (
                      <div className="absolute top-full right-0 mt-1 w-36 bg-zinc-800 rounded shadow-xl border border-zinc-700 py-1 z-50">
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        >
                          <Camera size={16} />
                          <span>Thay đổi ảnh</span>
                        </button>
                        <button
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditCover("");
                            setShowCoverDropdown(false);
                          }}
                        >
                          <Trash2 size={16} />
                          <span>Xóa ảnh</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Form Fields */}
              <div className="flex flex-col flex-1 gap-4">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Thêm tên"
                  className="w-full bg-zinc-700/50 text-white p-3 rounded text-sm font-medium focus:outline-none focus:bg-zinc-700 focus:ring-1 focus:ring-white transition"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Thêm phần mô tả không bắt buộc"
                  className="w-full bg-zinc-700/50 text-white p-3 rounded text-sm font-medium focus:outline-none focus:bg-zinc-700 focus:ring-1 focus:ring-white transition resize-none flex-1 min-h-[100px]"
                ></textarea>
              </div>
            </div>

            <div className="p-6 pt-2 flex justify-end">
              <button
                onClick={handleEditSave}
                disabled={!editName.trim()}
                className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                Lưu
              </button>
            </div>
            <div className="px-6 pb-6 pt-2">
              <p className="text-xs text-zinc-400 font-medium">Bằng cách tiếp tục, bạn đồng ý cho phép TuneVault truy cập vào hình ảnh bạn đã chọn để tải lên. Vui lòng đảm bảo bạn có quyền tải lên hình ảnh.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
