import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mediaService } from '../services/mediaService';
import { albumService } from '../services/albumService';
import { playlistService } from '../services/playlistService';
import type { SearchResultDto } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, MoreHorizontal, Share2, Clock, Plus } from 'lucide-react';
import { ShareMediaModal } from '../components/ShareMediaModal';

const formatDuration = (timeString: string | undefined) => {
  if (!timeString) return "0:00";
  if (timeString.includes(":")) {
    const parts = timeString.split(":");
    if (parts.length >= 2) {
      const min = parseInt(parts[1], 10);
      const sec = parseFloat(parts[2] || "0");
      return `${min}:${Math.floor(sec).toString().padStart(2, '0')}`;
    }
  }
  return timeString;
};

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const { playMedia, playMediaList, currentMedia, isPlaying, togglePlayPause } = usePlayer();
  const navigate = useNavigate();

  const [results, setResults] = useState<SearchResultDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums' | 'playlists' | 'profiles'>('all');

  const [favoritesIds, setFavoritesIds] = useState<Set<string>>(new Set());
  const [followedArtistIds, setFollowedArtistIds] = useState<Set<string>>(new Set());
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState<{ id: string, type: string, openUpwards: boolean } | null>(null);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState<string | null>(null);
  const [shareData, setShareData] = useState<{ id: string, type: string, title: string } | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchFavs = () => {
      if (localStorage.getItem('token')) {
        mediaService.getFavorites().then(f => setFavoritesIds(new Set(f.map(t => t.id)))).catch(() => { });
        import('../services/artistService').then(m => m.artistService.getFollowedArtists().then(a => setFollowedArtistIds(new Set(a.map(x => x.id))))).catch(() => { });
        playlistService.getUserPlaylists().then(setPlaylists).catch(() => { });
      }
    };
    fetchFavs();
    window.addEventListener('favoritesUpdated', fetchFavs);
    return () => window.removeEventListener('favoritesUpdated', fetchFavs);
  }, []);

  useEffect(() => {
    const doSearch = async () => {
      setLoading(true);
      try {
        const data = await mediaService.searchMedia(query, page, 20); // pageSize = 20
        setResults(data);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm:", error);
        setResults(null);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimeout = setTimeout(() => {
      doSearch();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [query, page]);

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

  const handleToggleFollow = async (e: React.MouseEvent, artistId: string) => {
    e.stopPropagation();
    try {
      const { artistService } = await import('../services/artistService');
      const isFollowing = followedArtistIds.has(artistId);
      if (isFollowing) {
        await artistService.unfollowArtist(artistId);
        setFollowedArtistIds(prev => { const next = new Set(prev); next.delete(artistId); return next; });
      } else {
        await artistService.followArtist(artistId);
        setFollowedArtistIds(prev => { const next = new Set(prev); next.add(artistId); return next; });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
    } else {
      navigate(`/search?page=${newPage}`);
    }
  };

  const handlePlayDirectly = async (item: any, type: string) => {
    if (type === 'track') {
      if (currentMedia?.id === item.id) {
        togglePlayPause();
      } else {
        if (results?.tracks && results.tracks.length > 0) {
          const index = results.tracks.findIndex((t: any) => t.id === item.id);
          playMediaList(results.tracks, index !== -1 ? index : 0);
        } else {
          playMedia(item);
        }
      }
    } else if (type === 'artist') {
      try {
        const allMedia = await mediaService.getAllMedia();
        const artistTracks = allMedia.filter(m => m.artistId === item.id).map(t => ({
          ...t,
          artistId: item.id
        }));
        if (artistTracks.length > 0) {
          playMediaList(artistTracks, 0);
        } else {
          alert("Nghệ sĩ này chưa có bài hát nào.");
        }
      } catch (e) {
        console.error("Failed to play artist tracks", e);
      }
    } else if (type === 'album') {
      try {
        const albumDetail = await albumService.getAlbumById(item.id);
        if (albumDetail.tracks && albumDetail.tracks.length > 0) {
          const albumTracks = albumDetail.tracks.map(t => ({
            ...t,
            albumId: item.id,
            coverUrl: t.coverUrl || albumDetail.coverUrl,
            artistName: t.artistName || albumDetail.artistName
          }));
          playMediaList(albumTracks, 0);
        } else {
          alert("Album này chưa có bài hát nào.");
        }
      } catch (e) {
        console.error("Failed to play album tracks", e);
      }
    } else if (type === 'playlist') {
      try {
        const playlistDetail = await playlistService.getPlaylistDetails(item.id);
        if (playlistDetail.tracks && playlistDetail.tracks.length > 0) {
          const playlistTracks = playlistDetail.tracks.map(t => ({
            ...t,
            playlistId: item.id
          }));
          playMediaList(playlistTracks, 0);
        } else {
          alert("Danh sách phát này chưa có bài hát nào.");
        }
      } catch (e) {
        console.error("Failed to play playlist tracks", e);
      }
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://tunevault-api.onrender.com${url}`;
  };

  const renderRow = (item: any, type: 'track' | 'artist' | 'album' | 'playlist' | 'profile', isTopResult: boolean = false) => {
    let id: string = '';
    let title: string = '';
    let subtitle: string = '';
    let imageUrl: string | undefined;
    let isCircular: boolean = false;
    let onClick: () => void = () => { };
    let onDoubleClick: (() => void) | undefined = undefined;
    let isPlayingRow: boolean = false;

    if (type === 'track') {
      id = item.id;
      title = item.title;
      subtitle = `Bài hát • ${item.artistName || 'Nghệ sĩ'}`;
      imageUrl = item.coverUrl;
      isCircular = false;
      onClick = () => {}; 
      onDoubleClick = () => handlePlayDirectly(item, type);
      isPlayingRow = currentMedia?.id === id;
    } else if (type === 'artist') {
      id = item.id;
      title = item.name;
      subtitle = "Nghệ sĩ";
      imageUrl = item.avatarUrl;
      isCircular = true;
      onClick = () => navigate(`/artist/${id}`);
      isPlayingRow = currentMedia?.artistId === id;
    } else if (type === 'album') {
      id = item.id;
      title = item.title;
      subtitle = `Album • ${item.artistName || 'Nghệ sĩ'}`;
      imageUrl = item.coverUrl;
      isCircular = false;
      onClick = () => navigate(`/album/${id}`);
      isPlayingRow = currentMedia?.albumId === id;
    } else if (type === 'playlist') {
      id = item.id;
      title = item.name;
      subtitle = "Danh sách phát";
      imageUrl = item.coverUrl;
      isCircular = false;
      onClick = () => navigate(`/playlist/${id}`);
      isPlayingRow = (currentMedia as any)?.playlistId === id;
    } else if (type === 'profile') {
      id = item.id;
      title = item.username;
      subtitle = "Hồ sơ";
      imageUrl = item.avatarUrl;
      isCircular = true;
      onClick = () => navigate(`/user/${id}`);
      isPlayingRow = false;
    }

    const sizeClass = isTopResult ? "w-20 h-20" : "w-12 h-12";
    const titleClass = isTopResult ? "text-lg font-bold" : "text-base font-medium";
    const playBtnClass = isTopResult ? "w-12 h-12" : "w-10 h-10";

    return (
      <div
        key={`${type}-${id}`}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        className={`flex items-center gap-4 p-2 rounded-md transition cursor-pointer group w-full ${isTopResult ? 'bg-zinc-800/60 hover:bg-zinc-800 p-4 mb-2' : 'hover:bg-zinc-800/50'}`}
      >
        <div className={`${sizeClass} flex-shrink-0 bg-zinc-700 overflow-hidden relative ${isCircular ? 'rounded-full' : 'rounded-md shadow-md'}`}>
          {imageUrl ? (
            <img src={getImageUrl(imageUrl)} className="w-full h-full object-cover" alt={title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-600 font-bold text-2xl text-white/50">
              {title?.charAt(0)}
            </div>
          )}
          
          {!isTopResult && type === 'track' && (
            <div 
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayDirectly(item, type);
              }}
            >
               {isPlayingRow && isPlaying ? <Pause size={16} fill="currentColor" className="text-white" /> : <Play size={16} fill="currentColor" className="text-white ml-1" />}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <span className={`${titleClass} truncate ${isPlayingRow ? 'text-[#1ed760]' : 'text-white'}`}>{title}</span>
          <span className="text-sm text-zinc-400 truncate">{subtitle}</span>
        </div>
        {type !== 'profile' && isTopResult && (
          <div className="flex-shrink-0 pr-4">
            <button
              onClick={(e) => { 
                e.stopPropagation(); 
                if (isPlayingRow) {
                  togglePlayPause();
                } else {
                  handlePlayDirectly(item, type); 
                }
              }}
              className={`${playBtnClass} rounded-full bg-green-500 flex items-center justify-center text-black hover:scale-110 hover:bg-green-400 hover:shadow-2xl transition-all duration-200 shadow-md opacity-100`}
            >
              {isPlayingRow && isPlaying ? (
                <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
              ) : (
                <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
              )}
            </button>
          </div>
        )}
        {!isTopResult && (type === 'track' || type === 'artist') && (
          <div className="flex-shrink-0 pr-4 flex items-center gap-4 relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const openUpwards = window.innerHeight - rect.bottom < 250;
                if (openDropdown?.id === item.id) setOpenDropdown(null);
                else setOpenDropdown({ id: item.id, type, openUpwards });
              }}
              className="text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
            >
              <MoreHorizontal size={20} />
            </button>

            {type === 'track' && (
              <button
                onClick={(e) => handleToggleFavorite(e, item.id)}
                className={`text-zinc-400 hover:text-white transition ${favoritesIds.has(item.id) ? 'opacity-100 text-[#1ed760] hover:text-[#1fdf64]' : 'opacity-0 group-hover:opacity-100'}`}
              >
                {favoritesIds.has(item.id) ? (
                  <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                ) : (
                  <svg role="img" height="20" width="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                )}
              </button>
            )}
            {type === 'artist' && (
              <button
                onClick={(e) => handleToggleFollow(e, item.id)}
                className={`text-sm font-semibold px-4 py-1 rounded-full border transition ${followedArtistIds.has(item.id) ? 'border-zinc-500 text-white hover:border-white' : 'border-zinc-500 text-white hover:scale-105'}`}
              >
                {followedArtistIds.has(item.id) ? "Đang theo dõi" : "Theo dõi"}
              </button>
            )}

            {openDropdown?.id === item.id && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}></div>
                <div
                  className={`absolute right-12 w-max min-w-[240px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10 ${openDropdown?.openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {type === 'track' && (
                    <>
                      <div
                        className="relative"
                        onMouseEnter={() => setShowPlaylistMenu(item.id)}
                        onMouseLeave={() => setShowPlaylistMenu(null)}
                      >
                        <button className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between">
                          <span>Thêm vào danh sách phát</span>
                          <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 14l8-6-8-6v12z"></path></svg>
                        </button>
                        {showPlaylistMenu === item.id && (
                          <div className={`absolute ${openDropdown?.openUpwards ? 'bottom-0' : 'top-0'} right-full mr-1 w-56 bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10 max-h-64 overflow-y-auto custom-scrollbar`}>
                            {playlists.length === 0 ? (
                              <div className="px-4 py-2 text-sm text-zinc-500">Chưa có danh sách phát</div>
                            ) : (
                              playlists.map(p => (
                                <button
                                  key={p.id}
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await playlistService.addTrackToPlaylist(p.id, item.id);
                                      alert("Đã thêm vào " + p.name);
                                      setOpenDropdown(null);
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
                        onClick={(e) => {
                          handleToggleFavorite(e, item.id);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                      >
                        {favoritesIds.has(item.id) ? (
                          <>
                            <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                            Xóa khỏi Bài hát đã thích
                          </>
                        ) : (
                          <>
                            <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                            Thêm vào Bài hát đã thích
                          </>
                        )}
                      </button>

                      <hr className="border-white/10 my-1" />

                      {item.artistId && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/artist/${item.artistId}`);
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
                        >
                          Chuyển tới nghệ sĩ
                        </button>
                      )}

                      {(item.albumId || item.albumTitle) && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (item.albumId) {
                              navigate(`/album/${item.albumId}`);
                            }
                            setOpenDropdown(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
                        >
                          Chuyển đến Album
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareData({ id: item.id, type: 'Bài hát', title });
                          setShowShareModal(true);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                      >
                        <Share2 size={16} /> Chia sẻ
                      </button>
                    </>
                  )}
                  {type === 'artist' && (
                    <>
                      <button
                        onClick={(e) => { handleToggleFollow(e, item.id); setOpenDropdown(null); }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
                      >
                        {followedArtistIds.has(item.id) ? "Hủy theo dõi" : "Theo dõi"}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareData({ id: item.id, type: 'Nghệ sĩ', title });
                          setShowShareModal(true);
                          setOpenDropdown(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                      >
                        <Share2 size={16} /> Chia sẻ
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCard = (item: any, type: 'artist' | 'album' | 'playlist' | 'profile') => {
    let id: string = '';
    let title: string = '';
    let subtitle: string = '';
    let imageUrl: string | undefined;
    let isCircular: boolean = false;
    let onClick: () => void = () => { };

    if (type === 'artist') {
      id = item.id;
      title = item.name;
      subtitle = "Nghệ sĩ";
      imageUrl = item.avatarUrl;
      isCircular = true;
      onClick = () => navigate(`/artist/${id}`);
    } else if (type === 'album') {
      id = item.id;
      title = item.title;
      subtitle = item.artistName || "Album";
      imageUrl = item.coverUrl;
      onClick = () => navigate(`/album/${id}`);
    } else if (type === 'playlist') {
      id = item.id;
      title = item.name;
      subtitle = `Bởi ${item.userName || 'Người dùng'}`;
      imageUrl = item.coverUrl;
      onClick = () => navigate(`/playlist/${id}`);
    } else if (type === 'profile') {
      id = item.id;
      title = item.username;
      subtitle = "Hồ sơ";
      imageUrl = item.avatarUrl;
      isCircular = true;
      onClick = () => navigate(`/user/${id}`);
    }

    const isPlayingRow = 
      (type === 'artist' && currentMedia?.artistId === id) || 
      (type === 'album' && currentMedia?.albumId === id) ||
      (type === 'playlist' && (currentMedia as any)?.playlistId === id);

    return (
      <div 
        key={`${type}-${id}`}
        onClick={onClick}
        className="p-3 rounded-md bg-zinc-800/20 hover:bg-zinc-800 transition cursor-pointer group relative flex flex-col"
      >
        <div className="w-full aspect-square mb-3 relative">
          <div className={`w-full h-full bg-zinc-700 shadow-lg flex items-center justify-center relative overflow-hidden group-hover:shadow-xl transition ${isCircular ? 'rounded-full' : 'rounded-md'}`}>
            {imageUrl ? (
              <img src={getImageUrl(imageUrl)} className="w-full h-full object-cover" alt={title} />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-white/50">
                {title?.charAt(0)}
              </div>
            )}
          </div>
          {type !== 'profile' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (isPlayingRow) {
                  togglePlayPause();
                } else {
                  handlePlayDirectly(item, type);
                }
              }}
              className={`absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black transition-all duration-200 shadow-xl z-20 hover:scale-110 hover:bg-green-400 hover:shadow-2xl ${isPlayingRow ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
            >
              {isPlayingRow && isPlaying ? (
                <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
              ) : (
                <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
              )}
            </button>
          )}
        </div>
        <h3 className="font-bold text-white truncate text-base">{title}</h3>
        <p className="text-sm text-zinc-400 mt-1 truncate">{subtitle}</p>
      </div>
    );
  };

  const getTopResult = () => {
    if (!results) return null;
    const lowerQuery = query.toLowerCase();

    // Prioritize exact matches
    if (results.artists?.some(a => a.name.toLowerCase() === lowerQuery)) {
      return { type: 'artist' as const, item: results.artists.find(a => a.name.toLowerCase() === lowerQuery) };
    }
    if (results.tracks?.some(t => t.title.toLowerCase() === lowerQuery)) {
      return { type: 'track' as const, item: results.tracks.find(t => t.title.toLowerCase() === lowerQuery) };
    }

    // Fallback order
    if (results.artists && results.artists.length > 0) return { type: 'artist' as const, item: results.artists[0] };
    if (results.tracks && results.tracks.length > 0) return { type: 'track' as const, item: results.tracks[0] };
    if (results.albums && results.albums.length > 0) return { type: 'album' as const, item: results.albums[0] };
    if (results.playlists && results.playlists.length > 0) return { type: 'playlist' as const, item: results.playlists[0] };
    if (results.users && results.users.length > 0) return { type: 'profile' as const, item: results.users[0] };
    return null;
  };

  const hasResults = results && (results.tracks?.length > 0 || results.artists?.length > 0 || results.albums?.length > 0 || results.playlists?.length > 0 || results.users?.length > 0);
  const topResult = query ? getTopResult() : null;

  const getAllList = () => {
    if (!results) return [];
    let list: { item: any, type: 'track' | 'artist' | 'album' | 'playlist' | 'profile' }[] = [];

    // Add artists first so they appear right after the top result if it's a track
    if (results.artists) list.push(...results.artists.map(a => ({ item: a, type: 'artist' as const })));
    if (results.tracks) list.push(...results.tracks.map(t => ({ item: t, type: 'track' as const })));
    if (results.playlists) list.push(...results.playlists.map(p => ({ item: p, type: 'playlist' as const })));
    if (results.users) list.push(...results.users.map(u => ({ item: u, type: 'profile' as const })));

    if (topResult) {
      list = list.filter(x => !(x.type === topResult.type && x.item.id === topResult.item.id));
    }
    return list;
  };

  return (
    <div className="p-6 pb-8 text-white max-w-5xl mx-auto" onClick={() => { if (openDropdown) setOpenDropdown(null); }}>
      {loading ? (
        <div className="text-zinc-500 font-medium">Đang tải...</div>
      ) : !hasResults ? (
        <div className="text-zinc-500 font-medium text-center mt-12">
          <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy kết quả nào</h2>
          {query && <p>Vui lòng đảm bảo bạn đã viết đúng chính tả hoặc sử dụng ít từ khóa hơn.</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {/* Tabs */}
          {query && hasResults && (
            <div className="flex flex-wrap gap-3 mb-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'all' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setActiveTab('songs')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'songs' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                Bài hát
              </button>
              <button
                onClick={() => setActiveTab('artists')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'artists' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                Nghệ sĩ
              </button>
              <button
                onClick={() => setActiveTab('albums')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'albums' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                Album
              </button>
              <button
                onClick={() => setActiveTab('profiles')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'profiles' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                Hồ sơ
              </button>
              <button
                onClick={() => setActiveTab('playlists')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'playlists' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
              >
                Danh sách phát
              </button>
            </div>
          )}

          {/* Unified Results List */}
          {activeTab === 'all' && (
            <div className="flex flex-col gap-1">
              {topResult && renderRow(topResult.item, topResult.type, true)}
              {getAllList().map(x => renderRow(x.item, x.type))}
            </div>
          )}

          {/* Detailed Songs List */}
          {activeTab === 'songs' && results.tracks && results.tracks.length > 0 && (
            <div className="w-full flex-1">
              <div className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-sm font-medium text-[#b3b3b3] mb-4 sticky top-0 bg-transparent z-10 items-center">
                <div className="text-right pr-2">#</div>
                <div>Tiêu đề</div>
                <div className="hidden md:block">Album</div>
                <div className="flex items-center justify-end gap-4 pr-4">
                  <div className="w-4"></div>
                  <div className="w-12 text-right flex justify-end"><Clock size={16} /></div>
                  <div className="w-[18px]"></div>
                </div>
              </div>
              <div className="flex flex-col gap-0 pb-10">
                {results.tracks.map((track, index) => {
                  const isPlayingTrack = currentMedia?.id === track.id;
                  const isTrackFavorited = favoritesIds.has(track.id);
                  return (
                    <div 
                      key={track.id} 
                      className="grid grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,1fr)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer"
                      onDoubleClick={() => {
                        if (isPlayingTrack) {
                          togglePlayPause();
                        } else {
                          playMediaList(results.tracks, index);
                        }
                      }}
                    >
                      <div className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-[#b3b3b3]'} text-base font-medium flex items-center justify-end pr-2 relative w-full`}>
                        <span className="group-hover:hidden">{index + 1}</span>
                        <button className="hidden group-hover:block" onClick={(e) => { 
                          e.stopPropagation(); 
                          if (isPlayingTrack) {
                            togglePlayPause();
                          } else {
                            playMediaList(results.tracks, index); 
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
                            <img src={getImageUrl(track.coverUrl)} alt={track.title} className="w-full h-full object-cover" />
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
                      <div className="text-sm text-[#b3b3b3] truncate hover:text-white transition hidden md:block cursor-pointer"
                           onClick={(e) => {
                             e.stopPropagation();
                             if (track.albumId) navigate(`/album/${track.albumId}`);
                           }}>
                        {track.albumTitle || track.title}
                      </div>
                      <div className="flex items-center justify-end gap-4 pr-4 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(e, track.id);
                          }}
                          className={`hover:scale-105 transition ${isTrackFavorited ? 'opacity-100 text-green-500' : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white'}`}
                        >
                          {isTrackFavorited ? (
                            <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                          ) : (
                            <Plus size={16} className="rounded-full border border-current p-[1px]" />
                          )}
                        </button>
                        <div className="text-sm text-[#b3b3b3] font-medium w-12 text-right">{formatDuration(track.duration)}</div>
                        
                        <div className="relative flex items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openDropdown?.id === track.id) {
                                setOpenDropdown(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const openUpwards = window.innerHeight - rect.bottom < 250;
                                setOpenDropdown({ id: track.id, type: 'track', openUpwards });
                              }
                            }}
                            className={`text-zinc-400 hover:text-white transition ${openDropdown?.id === track.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                          >
                            <MoreHorizontal size={18} />
                          </button>

                          {openDropdown?.id === track.id && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setOpenDropdown(null); }}></div>
                              <div className={`absolute right-12 w-max min-w-[240px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10 ${openDropdown.openUpwards ? 'bottom-0' : 'top-full mt-1'}`}>
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
                                    <div className={`absolute ${openDropdown.openUpwards ? 'bottom-0' : 'top-0'} right-full mr-1 w-56 bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10 max-h-64 overflow-y-auto custom-scrollbar`}>
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
                                                setOpenDropdown(null);
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
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleFavorite(e, track.id);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
                                >
                                  {isTrackFavorited ? (
                                    <><svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg> Xóa khỏi Bài hát đã thích</>
                                  ) : (
                                    <><Plus size={16} /> Lưu vào Bài hát đã thích</>
                                  )}
                                </button>
                                <hr className="border-white/10 my-1" />
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (track.artistId) navigate(`/artist/${track.artistId}`);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
                                >
                                  Chuyển tới nghệ sĩ
                                </button>
                                {(track.albumId || track.albumTitle) && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (track.albumId) navigate(`/album/${track.albumId}`);
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
                                  >
                                    Chuyển đến Album
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShareData({ id: track.id, type: 'Bài hát', title: track.title });
                                    setShowShareModal(true);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
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
                })}
              </div>
            </div>
          )}

          {/* Grid Results List */}
          {activeTab !== 'all' && activeTab !== 'songs' ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
              {activeTab === 'artists' && results.artists?.map(artist => renderCard(artist, 'artist'))}
              {activeTab === 'albums' && results.albums?.map(album => renderCard(album, 'album'))}
              {activeTab === 'playlists' && results.playlists?.map(playlist => renderCard(playlist, 'playlist'))}
              {activeTab === 'profiles' && results.users?.map(user => renderCard(user, 'profile'))}
            </div>
          ) : null}

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-zinc-800">
              <button
                disabled={results.currentPage <= 1}
                onClick={() => handlePageChange(results.currentPage - 1)}
                className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <span className="text-sm text-zinc-400">
                Trang {results.currentPage} / {results.totalPages}
              </span>
              <button
                disabled={results.currentPage >= results.totalPages}
                onClick={() => handlePageChange(results.currentPage + 1)}
                className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}

        </div>
      )}
      {showShareModal && shareData && (
        <ShareMediaModal
          onClose={() => setShowShareModal(false)}
          mediaId={shareData.id}
          mediaType={shareData.type}
          mediaTitle={shareData.title}
        />
      )}
    </div>
  );
};

