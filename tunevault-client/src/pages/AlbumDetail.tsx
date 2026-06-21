import { useEffect, useState, useRef } from 'react';
import { FastAverageColor } from 'fast-average-color';
import { useParams, useNavigate } from 'react-router-dom';
import { albumService, type AlbumDetailDto } from '../services/albumService';
import { usePlayer } from '../context/PlayerContext';
import { Play, Clock, Disc, ArrowDownCircle, MoreHorizontal, User, Plus, Trash2, Share2 } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import { AddTrackToAlbumModal } from '../components/AddTrackToAlbumModal';
import { ShareMediaModal } from '../components/ShareMediaModal';
import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';

export const AlbumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<AlbumDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [bgColor, setBgColor] = useState<string>('rgba(49, 46, 129, 0.4)');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddTrackModal, setShowAddTrackModal] = useState(false);
  const [openTrackDropdown, setOpenTrackDropdown] = useState<{ id: string, openUpwards: boolean } | null>(null);
  const { playMediaList, currentMedia, isFavorited, setIsFavorited, isPlaying, togglePlayPause, queue, updateQueueContext } = usePlayer();
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [showAlbumMenu, setShowAlbumMenu] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  // Share states
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ id: string, type: string, title: string } | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [favoritesData, playlistsData] = await Promise.all([
          mediaService.getFavorites(),
          playlistService.getUserPlaylists()
        ]);
        setLikedTracks(new Set(favoritesData.map(t => t.id)));
        setPlaylists(playlistsData);
      } catch (err) {
        console.error(err);
      }
    };
    if (localStorage.getItem('token')) {
      fetchInitialData();
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

        // Check if saved
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const savedAlbums = JSON.parse(localStorage.getItem(`savedAlbums_${user.id}`) || '[]');
          setIsSaved(savedAlbums.includes(data.id));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
    window.addEventListener('mediaUpdated', fetchDetails);
    return () => window.removeEventListener('mediaUpdated', fetchDetails);
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
      const baseUrl = album.coverUrl.startsWith('http') ? album.coverUrl : album.coverUrl?.startsWith('http') ? album.coverUrl : `https://tunevault-api.onrender.com${album.coverUrl}`;
      img.src = `${baseUrl}?c=${Date.now()}`;
      img.onload = () => {
        try {
          const color = fac.getColor(img);
          setBgColor(`rgba(${color.value[0]}, ${color.value[1]}, ${color.value[2]}, 0.8)`);
        } catch (e) {
          console.error("Lỗi lấy màu nền", e);
        }
      };
      img.onerror = () => {
        setBgColor('rgba(49, 46, 129, 0.8)');
      };
    } else {
      setBgColor('rgba(49, 46, 129, 0.4)');
    }
  }, [album?.coverUrl]);



  const handleToggleSaveAlbum = () => {
    if (!album) return;
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert("Vui lòng đăng nhập để lưu album.");
      return;
    }
    const user = JSON.parse(userStr);
    const storageKey = `savedAlbums_${user.id}`;
    let savedAlbums = JSON.parse(localStorage.getItem(storageKey) || '[]');

    if (isSaved) {
      savedAlbums = savedAlbums.filter((id: string) => id !== album.id);
      localStorage.setItem(storageKey, JSON.stringify(savedAlbums));
      setIsSaved(false);
    } else {
      savedAlbums.push(album.id);
      localStorage.setItem(storageKey, JSON.stringify(savedAlbums));
      setIsSaved(true);
    }
    window.dispatchEvent(new Event('savedAlbumsUpdated'));
  };

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

  const isCurrentAlbumTrackPlaying = currentMedia && album?.tracks?.some(t => t.id === currentMedia.id);
  const isAlbumPlaying = isCurrentAlbumTrackPlaying && isPlaying;

  const handleMainPlayClick = () => {
    if (!album || !album.tracks || album.tracks.length === 0) return;

    if (isCurrentAlbumTrackPlaying) {
      if (queue.length <= 1) {
        // We were playing a single track, switch queue context to the album
        updateQueueContext(album.tracks.map(t => ({
          ...t,
          coverUrl: t.coverUrl || album.coverUrl,
          artistName: t.artistName || album.artistName,
          artistAvatarUrl: t.artistAvatarUrl || album.artistImageUrl
        })), currentMedia.id);
      }
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

  const handleRemoveTrack = async (trackId: string) => {
    if (!album || !window.confirm("Bạn có chắc chắn muốn xóa bài hát này khỏi album?")) return;
    try {
      await albumService.removeTrackFromAlbum(album.id, trackId);
      // Cập nhật lại list bài hát trong UI
      setAlbum({
        ...album,
        tracks: album.tracks.filter(t => t.id !== trackId)
      });
    } catch (error) {
      alert("Lỗi khi xóa bài hát");
    }
  };

  const handleShareAlbum = () => {
    if (!album) return;
    setShareData({ id: album.id, type: 'Album', title: album.title });
    setShowShareModal(true);
  };

  const handleShareTrack = (trackId: string, trackTitle: string) => {
    setShareData({ id: trackId, type: 'Bài hát', title: trackTitle });
    setShowShareModal(true);
    setOpenTrackDropdown(null);
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  if (loading) return <div className="p-6 text-white">Đang tải chi tiết album...</div>;
  if (!album) return <div className="p-6 text-white">Album không tồn tại.</div>;

  const handleScroll = () => {
    if (scrollRef.current && gradientRef.current) {
      gradientRef.current.style.transform = `translateY(-${scrollRef.current.scrollTop}px)`;
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-black overflow-hidden">
      {/* Background Gradient Layer */}
      <div
        ref={gradientRef}
        className="absolute top-0 left-0 w-full pointer-events-none z-0"
        style={{
          height: '500px',
          backgroundImage: `linear-gradient(to bottom, ${bgColor.replace(/([\d.]+)\)/, '0.9)')} 0%, transparent 100%)`
        }}
      />

      {/* Scrollable Content Layer */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative z-10 w-full scrollbar-hide"
        onScroll={handleScroll}
      >
        {/* Header */}
        <div
          className="flex items-end gap-6 px-6 pb-6 pt-16 shrink-0 relative z-10"
          style={{ height: 'clamp(195.5px, 25cqw, 340px)', minHeight: '195.5px' }}
        >
          <div
            className="bg-zinc-800 shadow-2xl flex-shrink-0 flex items-center justify-center overflow-hidden"
            style={{ width: 'clamp(143.69px, 20cqw, 232px)', height: 'clamp(143.69px, 20cqw, 232px)' }}
          >
            {album.coverUrl ? (
              <img src={album.coverUrl.startsWith('http') ? album.coverUrl : album.coverUrl?.startsWith('http') ? album.coverUrl : `https://tunevault-api.onrender.com${album.coverUrl}`} alt={album.title} className="w-full h-full object-cover" />
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
                  <img src={album.artistImageUrl.startsWith('http') ? album.artistImageUrl : album.artistImageUrl?.startsWith('http') ? album.artistImageUrl : `https://tunevault-api.onrender.com${album.artistImageUrl}`} alt={album.artistName} className="w-full h-full object-cover" />
                ) : (
                  <User size={16} className="text-white opacity-50" />
                )}
              </div>
              <span 
              className="text-white font-bold text-xs hover:underline cursor-pointer"
              onClick={() => {
                if (album.artistId) {
                  navigate(`/artist/${album.artistId}`);
                }
              }}
            >
              {album.artistName || 'Nghệ sĩ'}
            </span>
              <span className="text-zinc-300 text-[10px]">•</span>
              <span className="text-zinc-300 font-medium text-xs">{new Date(album.releaseDate).getFullYear()}</span>
              <span className="text-zinc-300 text-[10px]">•</span>
              <span className="text-zinc-300 font-medium text-xs">{album.tracks?.length || 0} bài hát,</span>
              <span className="text-zinc-400 text-xs">{getTotalDuration()}</span>
            </div>
          </div>
        </div>

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col border-t border-white/10 pt-6 relative z-10 bg-black/20">
          {/* Controls */}
          <div className="flex items-center gap-6 mb-6 px-6">
            <button
              onClick={handleMainPlayClick}
              className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:scale-110 hover:bg-green-400 hover:shadow-2xl transition-all duration-200 shadow-xl"
            >
              {isAlbumPlaying ? (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-black ml-0">
                  <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
                </svg>
              ) : (
                <Play size={24} className="text-black fill-black ml-1" />
              )}
            </button>
            <button onClick={handleToggleSaveAlbum} className="text-zinc-400 hover:text-white hover:scale-105 transition focus:outline-none flex items-center justify-center" title={isSaved ? "Xóa khỏi Thư viện" : "Lưu vào Thư viện"}>
              {isSaved ? (
                <svg role="img" height="32" width="32" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
              ) : (
                <svg role="img" height="32" width="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
              )}
            </button>
            <button className="text-zinc-400 hover:text-white transition" title="Tải xuống">
              <ArrowDownCircle size={32} />
            </button>
            <div className="relative">
              <button onClick={() => setShowAlbumMenu(!showAlbumMenu)} className="text-zinc-400 hover:text-white transition ml-2" title="Khác">
                <MoreHorizontal size={32} />
              </button>

              {showAlbumMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowAlbumMenu(false)}></div>
                  <div className="absolute left-0 top-full mt-1 w-56 bg-[#282828] rounded shadow-xl py-1 z-50 border border-white/10">
                    <button
                      onClick={() => {
                        handleToggleSaveAlbum();
                        setShowAlbumMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                    >
                      {isSaved ? (
                        <>
                          <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                          Xóa khỏi Thư viện
                        </>
                      ) : (
                        <>
                          <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                          Thêm vào Thư viện
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        handleShareAlbum();
                        setShowAlbumMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                    >
                      <Share2 size={16} /> Chia sẻ
                    </button>
                  </div>
                </>
              )}
            </div>
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
            <div className="grid grid-cols-[32px_1fr_minmax(80px,120px)] gap-4 px-6 py-2 border-b border-white/10 text-sm font-medium text-spotify-lighttext mb-4 sticky top-0 bg-transparent z-10 items-center">
              <div className="text-right pr-2">#</div>
              <div>Tiêu đề</div>
              <div className="flex items-center justify-end gap-4 pr-4">
                <div className="w-4"></div>
                <div className="w-12 text-right flex justify-end"><Clock size={16} /></div>
                <div className="w-[18px]"></div>
              </div>
            </div>

            {/* Tracks */}
            <div className="flex flex-col gap-0 pb-10 px-2">
              {album.tracks && album.tracks.map((track, index) => {
                const isPlayingTrack = currentMedia?.id === track.id;

                return (
                  <div
                    key={track.id}
                    className="grid grid-cols-[32px_1fr_minmax(80px,120px)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer"
                    onDoubleClick={() => handlePlayMedia(index)}
                  >
                    <div className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-spotify-lighttext'} text-base font-medium flex items-center justify-end pr-2 relative w-full`}>
                      <span className="group-hover:hidden">{index + 1}</span>
                      <button className="hidden group-hover:block" onClick={(e) => {
                        e.stopPropagation();
                        if (isPlayingTrack) {
                          if (queue.length <= 1) {
                            updateQueueContext(album.tracks.map(t => ({
                              ...t,
                              coverUrl: t.coverUrl || album.coverUrl,
                              artistName: t.artistName || album.artistName,
                              artistAvatarUrl: t.artistAvatarUrl || album.artistImageUrl
                            })), currentMedia.id);
                          }
                          togglePlayPause();
                        } else {
                          handlePlayMedia(index);
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
                    <div className="flex flex-col overflow-hidden justify-center">
                      <span className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-white'} font-medium text-base truncate`}>{track.title}</span>
                      <span 
                        className="text-spotify-lighttext text-sm truncate hover:underline hover:text-white inline-block w-fit cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          const targetArtistId = track.artistId || album.artistId;
                          if (targetArtistId) {
                            navigate(`/artist/${targetArtistId}`);
                          }
                        }}
                      >
                        {track.artistName || album.artistName}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-4 pr-4">
                      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(track.id); }}
                          className={`${likedTracks.has(track.id) ? 'opacity-100 text-[#1ed760]' : 'text-spotify-lighttext hover:text-white'}`}
                        >
                          {likedTracks.has(track.id) ? (
                            <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                          ) : (
                            <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                          )}
                        </button>
                      </div>
                      <div className="text-sm text-spotify-lighttext font-medium w-12 text-right">{formatDuration(track.duration)}</div>

                      <div className="relative flex items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (openTrackDropdown?.id === track.id) {
                              setOpenTrackDropdown(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const windowHeight = window.innerHeight;
                              const openUpwards = rect.bottom > windowHeight - 350;
                              setOpenTrackDropdown({ id: track.id, openUpwards });
                            }
                          }}
                          className={`text-spotify-lighttext hover:text-white transition ${openTrackDropdown?.id === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {openTrackDropdown?.id === track.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenTrackDropdown(null); }}></div>
                            <div className={`absolute right-0 ${openTrackDropdown.openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'} w-max min-w-[240px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10`}>
                              {isAdmin && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenTrackDropdown(null);
                                    handleRemoveTrack(track.id);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-red-500 flex items-center gap-2"
                                >
                                  <Trash2 size={16} />
                                  Xóa khỏi album
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleFavorite(track.id);
                                  setOpenTrackDropdown(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                              >
                                {likedTracks.has(track.id) ? (
                                  <>
                                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                                    Xóa khỏi Bài hát đã thích
                                  </>
                                ) : (
                                  <>
                                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                                    Lưu vào Bài hát đã thích
                                  </>
                                )}
                              </button>
                              <div
                                className="relative"
                                onMouseEnter={() => setShowPlaylistMenu(track.id)}
                                onMouseLeave={() => setShowPlaylistMenu(null)}
                              >
                                <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between">
                                  <span>Thêm vào danh sách phát</span>
                                  <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 14l8-6-8-6v12z"></path></svg>
                                </button>

                                {showPlaylistMenu === track.id && (
                                  <div className={`absolute ${openTrackDropdown.openUpwards ? 'bottom-0' : 'top-0'} right-full mr-1 w-56 bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10 max-h-64 overflow-y-auto custom-scrollbar`}>
                                    {playlists.length === 0 ? (
                                      <div className="px-4 py-2 text-sm text-zinc-500">Chưa có danh sách phát</div>
                                    ) : (
                                      playlists.map(p => (
                                        <button
                                          key={p.id}
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            try {
                                              await playlistService.addTrackToPlaylist(p.id, track.id);
                                              alert("Đã thêm vào " + p.name);
                                              setOpenTrackDropdown(null);
                                              setShowPlaylistMenu(null);
                                            } catch (err) {
                                              alert("Có thể bài hát đã có trong playlist này.");
                                            }
                                          }}
                                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white truncate"
                                        >
                                          {p.name}
                                        </button>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                                onClick={() => handleShareTrack(track.id, track.title)}
                              >
                                <Share2 size={16} /> Chia sẻ
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}{(!album.tracks || album.tracks.length === 0) && (
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
            existingTrackIds={album.tracks?.map(t => t.id) || []}
          />
        )}

        {/* Share Modal */}
        {showShareModal && shareData && (
          <ShareMediaModal
            mediaId={shareData.id}
            mediaType={shareData.type}
            mediaTitle={shareData.title}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default AlbumDetail;
