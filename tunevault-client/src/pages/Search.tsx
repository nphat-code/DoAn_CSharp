import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mediaService } from '../services/mediaService';
import { albumService } from '../services/albumService';
import { playlistService } from '../services/playlistService';
import type { SearchResultDto } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, MoreHorizontal, Share2 } from 'lucide-react';
import { ShareMediaModal } from '../components/ShareMediaModal';

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
    if (localStorage.getItem('token')) {
      mediaService.getFavorites().then(f => setFavoritesIds(new Set(f.map(t => t.id)))).catch(() => { });
      import('../services/artistService').then(m => m.artistService.getFollowedArtists().then(a => setFollowedArtistIds(new Set(a.map(x => x.id))))).catch(() => { });
      playlistService.getUserPlaylists().then(setPlaylists).catch(() => { });
    }
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
        playMedia(item);
      }
    } else if (type === 'artist') {
      try {
        const allMedia = await mediaService.getAllMedia();
        const artistTracks = allMedia.filter(m => m.artistId === item.id);
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
          playMediaList(albumDetail.tracks, 0);
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
          playMediaList(playlistDetail.tracks, 0);
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
    let isPlayingRow: boolean = false;

    if (type === 'track') {
      id = item.id;
      title = item.title;
      subtitle = `Bài hát • ${item.artistName || 'Nghệ sĩ'}`;
      imageUrl = item.coverUrl;
      isCircular = false;
      onClick = () => navigate(`/track/${id}`); // Original was to play directly but user requested row click = go to page
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
      isPlayingRow = false;
    } else if (type === 'playlist') {
      id = item.id;
      title = item.name;
      subtitle = "Danh sách phát";
      imageUrl = item.coverUrl;
      isCircular = false;
      onClick = () => navigate(`/playlist/${id}`);
      isPlayingRow = false;
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
    const playSize = isTopResult ? 24 : 20;
    const playBtnClass = isTopResult ? "w-12 h-12" : "w-10 h-10";

    return (
      <div
        key={`${type}-${id}`}
        onClick={onClick}
        className={`flex items-center gap-4 p-2 rounded-md hover:bg-zinc-800/50 transition cursor-pointer group w-full ${isTopResult ? 'bg-zinc-800/20 p-4 mb-2' : ''}`}
      >
        <div className={`${sizeClass} flex-shrink-0 bg-zinc-700 overflow-hidden ${isCircular ? 'rounded-full' : 'rounded-md shadow-md'}`}>
          {imageUrl ? (
            <img src={getImageUrl(imageUrl)} className="w-full h-full object-cover" alt={title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-600 font-bold text-2xl text-white/50">
              {title?.charAt(0)}
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
              onClick={(e) => { e.stopPropagation(); handlePlayDirectly(item, type); }}
              className={`${playBtnClass} rounded-full bg-green-500 flex items-center justify-center text-black hover:scale-105 transition shadow-md ${isPlayingRow && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
            >
              {isPlayingRow && isPlaying ? <Pause size={playSize} fill="currentColor" /> : <Play size={playSize} fill="currentColor" className="ml-1" />}
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
              <div
                className={`absolute right-12 w-56 bg-[#282828] rounded-md shadow-2xl py-1 z-50 text-sm font-medium ${openDropdown?.openUpwards ? 'bottom-full mb-2' : 'top-full mt-2'}`}
                onClick={(e) => e.stopPropagation()}
              >
                {type === 'track' && (
                  <>
                    <div
                      className="relative"
                      onMouseEnter={() => setShowPlaylistMenu(item.id)}
                      onMouseLeave={() => setShowPlaylistMenu(null)}
                    >
                      <button className="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex justify-between items-center">
                        Thêm vào danh sách phát
                        <span>▶</span>
                      </button>
                      {showPlaylistMenu === item.id && (
                        <div className={`absolute right-full w-48 bg-[#282828] rounded-md shadow-2xl py-1 z-50 ${openDropdown?.openUpwards ? 'bottom-0' : 'top-0'} mr-1`}>
                          {playlists.length === 0 ? (
                            <div className="px-4 py-3 text-zinc-400">Chưa có danh sách phát</div>
                          ) : (
                            playlists.map(p => (
                              <button
                                key={p.id}
                                className="w-full text-left px-4 py-3 text-white hover:bg-white/10 truncate"
                                onClick={() => {
                                  playlistService.addTrackToPlaylist(p.id, item.id)
                                    .then(() => alert("Đã thêm vào danh sách phát"))
                                    .catch(() => alert("Lỗi khi thêm"))
                                    .finally(() => { setOpenDropdown(null); setShowPlaylistMenu(null); });
                                }}
                              >
                                {p.title || p.name}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => { handleToggleFavorite(e, item.id); setOpenDropdown(null); }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-white/10"
                    >
                      {favoritesIds.has(item.id) ? "Xóa khỏi Bài hát đã thích" : "Lưu vào Bài hát đã thích"}
                    </button>
                    <hr className="border-white/10 my-1 mx-2" />
                    {item.artistId && (
                      <button onClick={() => { navigate(`/artist/${item.artistId}`); setOpenDropdown(null); }} className="w-full text-left px-4 py-3 text-white hover:bg-white/10">
                        Chuyển tới nghệ sĩ
                      </button>
                    )}
                    {item.albumId && (
                      <button onClick={() => { navigate(`/album/${item.albumId}`); setOpenDropdown(null); }} className="w-full text-left px-4 py-3 text-white hover:bg-white/10">
                        Chuyển đến album
                      </button>
                    )}
                    <button
                      onClick={() => { setShareData({ id: item.id, type: 'Bài hát', title }); setShowShareModal(true); setOpenDropdown(null); }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center justify-between"
                    >
                      Chia sẻ <Share2 size={16} />
                    </button>
                  </>
                )}
                {type === 'artist' && (
                  <>
                    <button
                      onClick={(e) => { handleToggleFollow(e, item.id); setOpenDropdown(null); }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-white/10"
                    >
                      {followedArtistIds.has(item.id) ? "Hủy theo dõi" : "Theo dõi"}
                    </button>
                    <button
                      onClick={() => { setShareData({ id: item.id, type: 'Nghệ sĩ', title }); setShowShareModal(true); setOpenDropdown(null); }}
                      className="w-full text-left px-4 py-3 text-white hover:bg-white/10 flex items-center justify-between"
                    >
                      Chia sẻ <Share2 size={16} />
                    </button>
                  </>
                )}
              </div>
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

    return (
      <div 
        key={`${type}-${id}`}
        onClick={onClick}
        className="p-4 rounded-md bg-zinc-800/20 hover:bg-zinc-800 transition cursor-pointer group relative flex flex-col"
      >
        <div className={`w-full aspect-square bg-zinc-700 mb-4 shadow-lg flex items-center justify-center relative overflow-hidden ${isCircular ? 'rounded-full' : 'rounded-md'}`}>
          {imageUrl ? (
            <img src={getImageUrl(imageUrl)} className="w-full h-full object-cover" alt={title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center font-bold text-4xl text-white/50">
              {title?.charAt(0)}
            </div>
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
          {activeTab === 'all' || activeTab === 'songs' ? (
            <div className="flex flex-col gap-1">
              {activeTab === 'all' && topResult && renderRow(topResult.item, topResult.type, true)}
              {activeTab === 'all' && getAllList().map(x => renderRow(x.item, x.type))}
              {activeTab === 'songs' && results.tracks?.map(track => renderRow(track, 'track'))}
            </div>
          ) : null}

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

