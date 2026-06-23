import { usePlayer } from '../context/PlayerContext';
import { MoreHorizontal, X, Trash2, Maximize2, Play, Share2, User, Disc } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { VideoCanvas } from './VideoCanvas';
import { ShareMediaModal } from './ShareMediaModal';
import { artistService } from '../services/artistService';

interface RightPanelProps {
  width?: number;
}

export const RightPanel = ({ width }: RightPanelProps) => {
  const { currentMedia, mediaRef, isFavorited, toggleFavorite, showQueue, setShowQueue, queue, currentIndex, playMediaList, setIsExpandedView } = usePlayer();
  const navigate = useNavigate();
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState<{ id: string, title: string } | null>(null);
  const [isFollowingArtist, setIsFollowingArtist] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  
  const [openDropdown, setOpenDropdown] = useState<{ id: string, openUpwards: boolean, top?: number, bottom?: number, right?: number } | null>(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [favoritesIds, setFavoritesIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchFavs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const res = await mediaService.getFavorites();
          setFavoritesIds(new Set(res.map(f => f.id)));
        }
      } catch {}
    };
    fetchFavs();
    window.addEventListener('favoritesUpdated', fetchFavs);
    return () => window.removeEventListener('favoritesUpdated', fetchFavs);
  }, []);

  const handleQueueToggleFavorite = async (e: React.MouseEvent, trackId: string) => {
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
      if (currentMedia && currentMedia.id === trackId) {
         // Optionally sync PlayerContext's toggleFavorite but the UI uses favoritesIds anyway
      }
    } catch (error) {
      alert("Lỗi khi thay đổi trạng thái yêu thích.");
    }
    setOpenDropdown(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      import('../services/playlistService').then(m => {
        m.playlistService.getUserPlaylists().then(res => setPlaylists(res)).catch(() => {});
      });
    }
  }, []);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (currentMedia?.artistId) {
        try {
          const status = await artistService.getFollowStatus(currentMedia.artistId);
          setIsFollowingArtist(status);
        } catch (error) {
          console.error("Lỗi khi kiểm tra follow status", error);
        }
      } else {
        setIsFollowingArtist(false);
      }
    };
    checkFollowStatus();

    window.addEventListener('followedArtistsUpdated', checkFollowStatus);
    return () => window.removeEventListener('followedArtistsUpdated', checkFollowStatus);
  }, [currentMedia?.artistId]);

  const handleToggleFollowArtist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentMedia?.artistId) return;
    setLoadingFollow(true);
    try {
      if (isFollowingArtist) {
        await artistService.unfollowArtist(currentMedia.artistId);
        setIsFollowingArtist(false);
        window.dispatchEvent(new Event('followedArtistsUpdated'));
      } else {
        await artistService.followArtist(currentMedia.artistId);
        setIsFollowingArtist(true);
        window.dispatchEvent(new Event('followedArtistsUpdated'));
      }
    } catch (error) {
      console.error("Lỗi khi theo dõi nghệ sĩ", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const getImageUrl = (url: string | undefined | null) => {
    if (!url) return "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62"; // Fallback Ed Sheeran image
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'https://tunevault-api.onrender.com';
    return `${baseUrl}${url}`;
  };

  if (showQueue) {
    const nextTracks = currentIndex !== -1 ? queue.slice(currentIndex + 1) : [];

    return (
      <div 
        className="bg-[#121212] flex flex-col shrink-0 relative overflow-hidden rounded-lg border-l border-zinc-800 p-4"
        style={{ width: width ? `${width}px` : '420px', minWidth: '280px' }}
      >
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h2 className="text-xl font-bold text-white">Danh sách chờ</h2>
          <button 
            onClick={() => setShowQueue(false)}
            className="text-zinc-400 hover:text-white transition rounded-full p-1 hover:bg-zinc-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden scrollbar-hide flex-1">
          {/* Đang phát */}
          <div className="mb-8">
            <h3 className="text-base font-bold text-white mb-3">Đang phát</h3>
            {currentMedia ? (
              <div 
                className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800/50 transition cursor-pointer group"
              >
                <div className="w-12 h-12 relative flex-shrink-0">
                  <img src={getImageUrl(currentMedia.coverUrl)} alt="" className="w-full h-full object-cover rounded shadow-md" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Play size={16} fill="currentColor" className="text-white ml-1" />
                  </div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[#1ed760] font-medium truncate text-sm">{currentMedia.title}</span>
                  <span className="text-zinc-400 text-sm truncate">{(currentMedia as any).artist?.name || currentMedia.artistName || currentMedia.description || 'Nghệ sĩ'}</span>
                </div>

                <div className="flex-shrink-0 flex items-center gap-2 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const openUpwards = window.innerHeight - rect.bottom < 250;
                      if (openDropdown?.id === `playing-${currentMedia.id}`) setOpenDropdown(null);
                      else setOpenDropdown({ 
                        id: `playing-${currentMedia.id}`, 
                        openUpwards,
                        top: openUpwards ? undefined : rect.bottom + 4,
                        bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
                        right: window.innerWidth - rect.right
                      });
                    }}
                    className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                  >
                    <MoreHorizontal size={20} />
                  </button>

                  {openDropdown?.id === `playing-${currentMedia.id}` && createPortal(
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}></div>
                      <div
                        className="fixed w-max min-w-[200px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10"
                        style={{
                           top: openDropdown.top,
                           bottom: openDropdown.bottom,
                           right: openDropdown.right,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="relative"
                          onMouseEnter={() => setShowPlaylistMenu(`playing-${currentMedia.id}`)}
                          onMouseLeave={() => setShowPlaylistMenu(null)}
                        >
                          <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between">
                            <span>Thêm vào danh sách phát</span>
                            <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 14l8-6-8-6v12z"></path></svg>
                          </button>
                          {showPlaylistMenu === `playing-${currentMedia.id}` && (
                            <div className={`absolute ${openDropdown?.openUpwards ? 'bottom-full mb-1' : 'top-0'} right-full mr-1 w-full min-w-[150px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10 max-h-64 overflow-y-auto custom-scrollbar`}>
                              {playlists.length === 0 ? (
                                <div className="px-4 py-2 text-sm text-zinc-500">Chưa có danh sách phát</div>
                              ) : (
                                playlists.map(p => (
                                  <button
                                    key={p.id}
                                    onClick={async () => {
                                      try {
                                        const m = await import('../services/playlistService');
                                        await m.playlistService.addTrackToPlaylist(p.id, currentMedia.id);
                                        alert("Đã thêm vào " + p.name);
                                      } catch(err) {
                                        alert("Lỗi khi thêm. Có thể bài hát đã có trong danh sách.");
                                      }
                                      setOpenDropdown(null);
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
                          onClick={(e) => handleQueueToggleFavorite(e, currentMedia.id)}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                        >
                          {favoritesIds.has(currentMedia.id) || (isFavorited && favoritesIds.size === 0) ? (
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
                        
                        <div className="h-px bg-white/10 my-1 mx-2"></div>

                        {(currentMedia.artistId || (currentMedia as any).artist?.id) && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const id = currentMedia.artistId || (currentMedia as any).artist?.id;
                              if (id) {
                                setOpenDropdown(null); 
                                navigate(`/artist/${id}`); 
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                          >
                            <User size={16} /> Chuyển tới Nghệ sĩ
                          </button>
                        )}
                        {(currentMedia.albumId || (currentMedia as any).album?.id) && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const id = currentMedia.albumId || (currentMedia as any).album?.id;
                              if (id) {
                                setOpenDropdown(null); 
                                navigate(`/album/${id}`); 
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                          >
                            <Disc size={16} /> Chuyển đến Album
                          </button>
                        )}
                        
                        <div className="h-px bg-white/10 my-1 mx-2"></div>

                        <button 
                          onClick={() => {
                            setShareData({ id: currentMedia.id, title: currentMedia.title });
                            setShowShareModal(true);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                        >
                          <Share2 size={16} /> Chia sẻ
                        </button>
                      </div>
                    </>,
                    document.body
                  )}
                </div>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">Chưa có bài hát nào</p>
            )}
          </div>

          {/* Tiếp theo */}
          {nextTracks.length > 0 && (
            <div>
              <h3 className="text-base font-bold text-white mb-3">Tiếp theo</h3>
              <div className="flex flex-col gap-1">
                {nextTracks.map((track, idx) => (
                  <div 
                    key={`${track.id}-${idx}`} 
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-zinc-800/50 transition cursor-pointer group" 
                    onClick={() => playMediaList(queue, currentIndex + 1 + idx)}
                  >
                    <div className="w-12 h-12 relative flex-shrink-0">
                      <img src={getImageUrl(track.coverUrl)} alt="" className="w-full h-full object-cover rounded shadow-md" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Play size={16} fill="currentColor" className="text-white ml-1" />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-white font-medium truncate text-sm group-hover:underline">{track.title}</span>
                      <span className="text-zinc-400 text-sm truncate">{(track as any).artist?.name || track.artistName || track.description || 'Nghệ sĩ'}</span>
                    </div>

                    <div className="flex-shrink-0 flex items-center gap-2 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          const openUpwards = window.innerHeight - rect.bottom < 250;
                          if (openDropdown?.id === `${track.id}-${idx}`) setOpenDropdown(null);
                          else setOpenDropdown({ 
                            id: `${track.id}-${idx}`, 
                            openUpwards,
                            top: openUpwards ? undefined : rect.bottom + 4,
                            bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
                            right: window.innerWidth - rect.right
                          });
                        }}
                        className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {openDropdown?.id === `${track.id}-${idx}` && createPortal(
                        <>
                          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}></div>
                          <div
                            className="fixed w-max min-w-[200px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10"
                            style={{
                              top: openDropdown.top,
                              bottom: openDropdown.bottom,
                              right: openDropdown.right,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div
                              className="relative"
                              onMouseEnter={() => setShowPlaylistMenu(`${track.id}-${idx}`)}
                              onMouseLeave={() => setShowPlaylistMenu(null)}
                            >
                              <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between">
                                <span>Thêm vào danh sách phát</span>
                                <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 14l8-6-8-6v12z"></path></svg>
                              </button>
                              {showPlaylistMenu === `${track.id}-${idx}` && (
                                <div className={`absolute ${openDropdown?.openUpwards ? 'bottom-full mb-1' : 'top-0'} right-full mr-1 w-full min-w-[150px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10 max-h-64 overflow-y-auto custom-scrollbar`}>
                                  {playlists.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-zinc-500">Chưa có danh sách phát</div>
                                  ) : (
                                    playlists.map(p => (
                                      <button
                                        key={p.id}
                                        onClick={async () => {
                                          try {
                                            const m = await import('../services/playlistService');
                                            await m.playlistService.addTrackToPlaylist(p.id, track.id);
                                            alert("Đã thêm vào " + p.name);
                                          } catch(err) {
                                            alert("Lỗi khi thêm. Có thể bài hát đã có trong danh sách.");
                                          }
                                          setOpenDropdown(null);
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
                              onClick={(e) => handleQueueToggleFavorite(e, track.id)}
                              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                            >
                              {favoritesIds.has(track.id) ? (
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
                            
                            <div className="h-px bg-white/10 my-1 mx-2"></div>

                            {(track.artistId || (track as any).artist?.id) && (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  const id = track.artistId || (track as any).artist?.id;
                                  if (id) {
                                    setOpenDropdown(null); 
                                    navigate(`/artist/${id}`); 
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                              >
                                <User size={16} /> Chuyển tới Nghệ sĩ
                              </button>
                            )}
                            {(track.albumId || (track as any).album?.id) && (
                              <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  const id = track.albumId || (track as any).album?.id;
                                  if (id) {
                                    setOpenDropdown(null); 
                                    navigate(`/album/${id}`); 
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                              >
                                <Disc size={16} /> Chuyển đến Album
                              </button>
                            )}
                            
                            <div className="h-px bg-white/10 my-1 mx-2"></div>

                            <button 
                              onClick={() => {
                                setShareData({ id: track.id, title: track.title });
                                setShowShareModal(true);
                                setOpenDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                            >
                              <Share2 size={16} /> Chia sẻ
                            </button>
                          </div>
                        </>,
                        document.body
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {showShareModal && currentMedia && (
          <ShareMediaModal
            mediaId={shareData?.id || currentMedia.id}
            mediaType="Bài hát"
            mediaTitle={shareData?.title || currentMedia.title}
            onClose={() => { setShowShareModal(false); setShareData(null); }}
          />
        )}
      </div>
    );
  }

  if (!currentMedia) {
    return (
      <div 
        className="bg-spotify-card rounded-lg flex flex-col p-4 items-center justify-center text-zinc-500 font-medium shrink-0"
        style={{ width: width ? `${width}px` : '420px', minWidth: '280px' }}
      >
        Phát một bài hát để xem chi tiết
      </div>
    );
  }

  const handleDeleteMedia = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa bài này vĩnh viễn khỏi hệ thống không? Hành động này không thể hoàn tác.")) {
      try {
        // Dừng phát nhạc và giải phóng file lock trên trình duyệt trước khi gọi API xóa
        if (mediaRef.current) {
          mediaRef.current.pause();
          mediaRef.current.removeAttribute('src');
          mediaRef.current.load();
        }

        await mediaService.deleteMedia(currentMedia.id);
        alert("Đã xóa bài hát thành công!");
        window.dispatchEvent(new Event('mediaUpdated')); // Cập nhật dữ liệu mà không làm f5 trang
      } catch (error) {
        alert("Lỗi khi xóa.");
      }
    }
  };

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isAdmin = currentUser && currentUser.role === 'Admin';

  return (
    <div 
      className="bg-[#121212] flex flex-col shrink-0 relative overflow-hidden rounded-lg border-l border-zinc-800 group"
      style={{ width: width ? `${width}px` : '420px', minWidth: '280px' }}
    >
         
       {/* 1. BACKGROUND VIDEO LAYER (Optimized JS scroll) */}
       <div 
         ref={bgLayerRef}
         className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none will-change-transform"
         style={{ transform: 'translate3d(0,0,0)' }}
       >
         {currentMedia.mediaType === 'Video' ? (
           <VideoCanvas 
             videoRef={mediaRef as React.RefObject<HTMLVideoElement>} 
             className="w-full h-full object-cover scale-[1.3] transform-gpu" 
           />
         ) : currentMedia.coverUrl ? (
           <img src={getImageUrl(currentMedia.coverUrl)} alt="Cover" className="w-full h-full object-cover scale-[1.3] transform-gpu blur-2xl opacity-40" />
         ) : (
           <img src="https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62" alt="Cover" className="w-full h-full object-cover scale-[1.3] transform-gpu blur-2xl opacity-40" />
         )}
         
         {/* Top Fade */}
         <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-900 via-zinc-900/50 to-transparent pointer-events-none"></div>

         {/* Vignette / Edge Fade */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#18181b_100%)] opacity-70 pointer-events-none"></div>
         
         {/* Bottom Fade to blend seamlessly with the content below */}
         <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent pointer-events-none"></div>
       </div>

       {/* 2. SCROLLING CONTENT LAYER */}
       <div 
         className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide z-10 flex flex-col"
         onScroll={(e) => {
           if (bgLayerRef.current) {
             bgLayerRef.current.style.transform = `translate3d(0, -${e.currentTarget.scrollTop}px, 0)`;
           }
         }}
       >
          {/* Top spacer container matching video height */}
          <div className="w-full min-h-[50vh] sm:min-h-full flex flex-col justify-between shrink-0 pointer-events-none">
             
             {/* Header */}
             <div className="w-full flex items-center justify-between p-4 pointer-events-auto">
               <h3 
                 onClick={() => navigate(`/track/${currentMedia.id}`)}
                 className="font-bold text-base text-white hover:underline cursor-pointer truncate mr-2 drop-shadow-md"
               >
                 {currentMedia.title}
               </h3>
               <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative">
                 {isAdmin && (
                   <button onClick={handleDeleteMedia} className="text-zinc-300 hover:text-red-500 transition drop-shadow-md" title="Xóa bài hát này">
                      <Trash2 size={20} />
                   </button>
                 )}
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     const rect = e.currentTarget.getBoundingClientRect();
                     const openUpwards = window.innerHeight - rect.bottom < 250;
                     if (openDropdown?.id === currentMedia.id) setOpenDropdown(null);
                     else setOpenDropdown({ 
                       id: currentMedia.id, 
                       openUpwards,
                       top: openUpwards ? undefined : rect.bottom + 4,
                       bottom: openUpwards ? window.innerHeight - rect.top + 4 : undefined,
                       right: window.innerWidth - rect.right
                     });
                   }}
                   className="text-zinc-300 hover:text-white transition drop-shadow-md"
                 >
                   <MoreHorizontal size={20} />
                 </button>
                 <button onClick={() => setIsExpandedView(true)} className="text-zinc-300 hover:text-white transition drop-shadow-md" title="Mở rộng chế độ xem Đang phát">
                    <Maximize2 size={20} />
                 </button>

                 {openDropdown?.id === currentMedia.id && createPortal(
                    <>
                      <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}></div>
                      <div
                        className="fixed w-max min-w-[200px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10"
                        style={{
                          top: openDropdown.top,
                          bottom: openDropdown.bottom,
                          right: openDropdown.right,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div
                          className="relative"
                          onMouseEnter={() => setShowPlaylistMenu(`rightpanel-${currentMedia.id}`)}
                          onMouseLeave={() => setShowPlaylistMenu(null)}
                        >
                          <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between">
                            <span>Thêm vào danh sách phát</span>
                            <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 14l8-6-8-6v12z"></path></svg>
                          </button>
                          {showPlaylistMenu === `rightpanel-${currentMedia.id}` && (
                            <div className={`absolute ${openDropdown?.openUpwards ? 'bottom-full mb-1' : 'top-0'} right-full mr-1 w-full min-w-[150px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10 max-h-64 overflow-y-auto custom-scrollbar`}>
                              {playlists.length === 0 ? (
                                <div className="px-4 py-2 text-sm text-zinc-500">Chưa có danh sách phát</div>
                              ) : (
                                playlists.map(p => (
                                  <button
                                    key={p.id}
                                    onClick={async () => {
                                      try {
                                        const m = await import('../services/playlistService');
                                        await m.playlistService.addTrackToPlaylist(p.id, currentMedia.id);
                                        alert("Đã thêm vào " + p.name);
                                      } catch(err) {
                                        alert("Lỗi khi thêm. Có thể bài hát đã có trong danh sách.");
                                      }
                                      setOpenDropdown(null);
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
                          onClick={(e) => handleQueueToggleFavorite(e, currentMedia.id)}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                        >
                          {isFavorited ? (
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
                        
                        <div className="h-px bg-white/10 my-1 mx-2"></div>

                        {(currentMedia.artistId || (currentMedia as any).artist?.id) && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const id = currentMedia.artistId || (currentMedia as any).artist?.id;
                              if (id) {
                                setOpenDropdown(null); 
                                navigate(`/artist/${id}`); 
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                          >
                            <User size={16} /> Chuyển tới Nghệ sĩ
                          </button>
                        )}
                        {(currentMedia.albumId || (currentMedia as any).album?.id) && (
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              const id = currentMedia.albumId || (currentMedia as any).album?.id;
                              if (id) {
                                setOpenDropdown(null); 
                                navigate(`/album/${id}`); 
                              }
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                          >
                            <Disc size={16} /> Chuyển đến Album
                          </button>
                        )}
                        
                        <div className="h-px bg-white/10 my-1 mx-2"></div>

                        <button 
                          onClick={() => {
                            setShareData({ id: currentMedia.id, title: currentMedia.title });
                            setShowShareModal(true);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                        >
                          <Share2 size={16} /> Chia sẻ
                        </button>
                      </div>
                    </>,
                    document.body
                 )}
               </div>
             </div>

             {/* Cover Image for Audio */}
             {currentMedia.mediaType !== 'Video' && (
               <div className="flex-1 w-full px-4 py-2 flex items-center justify-center pointer-events-auto">
                 <img 
                   src={currentMedia.coverUrl ? getImageUrl(currentMedia.coverUrl) : "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62"} 
                   alt="Cover" 
                   className="w-full aspect-square object-cover rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
                 />
               </div>
             )}

             {/* Overlaid Title and Action Buttons */}
             <div className="w-full p-4 flex items-end justify-between pointer-events-auto">
                <div className="flex flex-col overflow-hidden mr-2">
                  <h2 className="text-[24px] leading-[28.8px] font-bold text-white mb-1 hover:underline cursor-pointer truncate drop-shadow-lg">{currentMedia.title}</h2>
                  <div className="flex items-center gap-1">
                      <p 
                        className="text-zinc-200 font-medium hover:underline cursor-pointer text-[16px] leading-[22.4px] truncate drop-shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentMedia?.artistId) navigate(`/artist/${currentMedia.artistId}`);
                        }}
                      >
                        {(currentMedia as any).artist?.name || currentMedia.artistName || currentMedia.description || 'Unknown Artist'}
                      </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0 pb-1">
                   {/* Share Button */}
                   <button 
                      onClick={() => setShowShareModal(true)}
                      className="text-zinc-200 hover:text-white hover:scale-105 transition opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md" 
                      title="Chia sẻ"
                   >
                       <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M8 7l4-4 4 4M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                   </button>
                   
                   {/* Add to Playlist / Liked Button */}
                   <button 
                      onClick={toggleFavorite}
                      className="text-zinc-200 hover:text-white hover:scale-105 transition drop-shadow-md" 
                      title={isFavorited ? "Đã thêm vào Bài hát đã thích" : "Thêm vào danh sách phát"}
                   >
                      {isFavorited ? (
                         <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                      ) : (
                         <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                      )}
                   </button>
                </div>
             </div>
          </div>

       {/* Rest of the content */}
       <div className="px-4 pb-4 flex flex-col gap-4 bg-zinc-900 flex-1">
          {/* Giới thiệu nghệ sĩ / Info box */}
          <div 
            className="bg-zinc-800/80 hover:bg-zinc-800 transition rounded-xl overflow-hidden relative cursor-pointer flex flex-col shadow-xl"
            onClick={() => currentMedia?.artistId && navigate(`/artist/${currentMedia.artistId}`)}
          >
             {/* Large Cover Image */}
             <div className="h-48 w-full relative">
               <img src={getImageUrl(currentMedia.artistAvatarUrl)} className="w-full h-full object-cover" />
               <div className="absolute top-4 left-4 text-white font-bold text-base shadow-sm z-10">Giới thiệu về nghệ sĩ</div>
             </div>
             
             {/* Content Below Image */}
             <div className="p-4 flex flex-col gap-2 relative">
                {/* Name & Tick */}
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-white text-base hover:underline">{(currentMedia as any).artist?.name || currentMedia.artistName || currentMedia.description || 'Unknown Artist'}</h4>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.643l-2.606-1.127-2.805.344-.925-2.673-2.673-.925.344-2.805L2.208 12l1.127-2.606-.344-2.805 2.673-.925.925-2.673 2.805.344L12 2.208l2.606 1.127 2.805-.344.925 2.673 2.673.925-.344 2.805L21.792 12l-1.127 2.606.344 2.805-2.673.925-.925 2.673-2.805-.344L12 21.643z" fill="#3D91F4"></path>
                    <path d="M16.5 8.25l-5.5 5.5-2.5-2.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </div>

                {/* Listeners & Follow Button */}
                <div className="flex items-center justify-between mb-1">
                  <p className="text-zinc-300 text-sm drop-shadow-md">86.906.547 người nghe hằng tháng</p>
                  {currentMedia?.artistId && (
                    <button 
                      onClick={handleToggleFollowArtist}
                      disabled={loadingFollow}
                      className={`text-xs font-bold border rounded-full px-4 py-1 transition ${
                        isFollowingArtist 
                          ? 'border-white text-white hover:border-zinc-400 hover:text-zinc-400' 
                          : 'border-zinc-400 text-white hover:border-white hover:scale-105'
                      }`}
                    >
                      {loadingFollow ? '...' : (isFollowingArtist ? 'Đang theo dõi' : 'Theo dõi')}
                    </button>
                  )}
                </div>

                {/* Bio */}
                <p className="text-sm text-zinc-300 line-clamp-3 drop-shadow-md">
                  {currentMedia.artistBio || "Chưa có thông tin giới thiệu về nghệ sĩ này."}
                </p>
             </div>
          </div>
       </div>
       </div>

      {showShareModal && currentMedia && (
        <ShareMediaModal
          mediaId={shareData?.id || currentMedia.id}
          mediaType="Bài hát"
          mediaTitle={shareData?.title || currentMedia.title}
          onClose={() => { setShowShareModal(false); setShareData(null); }}
        />
      )}

    </div>
  );
};
