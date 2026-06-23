import { getImageUrl } from '../utils/imageUrl';
import { Library, Plus, ArrowRight, Search, List, Heart, Users, Disc, ArrowLeft, Maximize2, Minimize2, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';
import { albumService } from '../services/albumService';
import type { AlbumDto } from '../services/albumService';
import { artistService } from '../services/artistService';
import { mediaService } from '../services/mediaService';
import { usePlayer } from '../context/PlayerContext';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const Sidebar = ({ isCollapsed = false, onToggleCollapse, isExpanded = false, onToggleExpand }: SidebarProps) => {
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [likedTracksCount, setLikedTracksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!localStorage.getItem('token');
  const navigate = useNavigate();
  const { playMediaList } = usePlayer();

  const handleItemClick = (path: string) => {
    navigate(path);
    if (isExpanded && onToggleExpand) {
      onToggleExpand();
    }
  };

  const handlePlayLiked = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await mediaService.getFavorites();
      if (data && data.length > 0) {
        playMediaList(data, 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlayPlaylist = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const data = await playlistService.getPlaylistDetails(id);
      if (data && data.tracks && data.tracks.length > 0) {
        playMediaList(data.tracks, 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlayAlbum = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const data = await albumService.getAlbumById(id);
      if (data && data.tracks && data.tracks.length > 0) {
        playMediaList(data.tracks, 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePlayArtist = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const allMedia = await mediaService.getAllMedia();
      const artistTracks = allMedia.filter(m => m.artistId === id);
      if (artistTracks.length > 0) {
        playMediaList(artistTracks, 0);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pList = [];
        pList.push(albumService.getAllAlbums().catch(() => []));
        if (isAuthenticated) {
          pList.push(playlistService.getUserPlaylists().catch(() => []));
          pList.push(artistService.getFollowedArtists().catch(() => []));
        }
        
        if (isAuthenticated) {
            const [albumData, playData, artistData] = await Promise.all(pList);
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;
            const savedIds = user ? JSON.parse(localStorage.getItem(`savedAlbums_${user.id}`) || '[]') : [];
            const allAlbums = albumData as AlbumDto[];
            
            setAlbums(allAlbums.filter(a => savedIds.includes(a.id)));
            setPlaylists(playData as PlaylistDto[]);
            setArtists((artistData || []) as any[]);
            
            try {
              const favoritesData = await import('../services/mediaService').then(m => m.mediaService.getFavorites());
              setLikedTracksCount(favoritesData.length);
            } catch (err) {
              setLikedTracksCount(0);
            }
        } else {
            setAlbums([]);
            setPlaylists([]);
            setArtists([]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();

    const handleUpdate = () => fetchData();
    window.addEventListener('savedAlbumsUpdated', handleUpdate);
    window.addEventListener('followedArtistsUpdated', handleUpdate);
    window.addEventListener('favoritesUpdated', handleUpdate);
    window.addEventListener('playlistsUpdated', handleUpdate);
    return () => {
      window.removeEventListener('savedAlbumsUpdated', handleUpdate);
      window.removeEventListener('followedArtistsUpdated', handleUpdate);
      window.removeEventListener('favoritesUpdated', handleUpdate);
      window.removeEventListener('playlistsUpdated', handleUpdate);
    };
  }, [isAuthenticated]);

  const submitCreatePlaylistAuto = async () => {
    try {
      const myPlaylists = playlists.filter(p => p.name.startsWith('Danh sách phát của tôi #'));
      let nextNum = 1;
      if (myPlaylists.length > 0) {
        const nums = myPlaylists.map(p => {
          const numStr = p.name.replace('Danh sách phát của tôi #', '');
          return parseInt(numStr) || 0;
        });
        nextNum = Math.max(...nums) + 1;
      } else {
        nextNum = playlists.filter(p => p.name.startsWith('Danh sách phát của tôi')).length + 1;
        if (nextNum === 1) nextNum = playlists.length + 1;
      }
      const newName = `Danh sách phát của tôi #${nextNum}`;
      const newPlaylist = await playlistService.createPlaylist(newName, undefined, true);
      setPlaylists([newPlaylist, ...playlists]);
      navigate(`/playlist/${newPlaylist.id}`);
    } catch (error) {
      alert("Lỗi khi tạo playlist. Vui lòng đăng nhập.");
    }
  };

  return (
    <div 
      className="bg-spotify-card rounded-lg flex flex-col overflow-hidden h-full w-full group"
    >
      {/* Header */}
      <div className="p-4 flex flex-col gap-4 shadow-sm">
        {isCollapsed ? (
          <div className="flex flex-col items-center justify-center gap-4 group">
            <button onClick={onToggleCollapse} className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition text-spotify-lighttext" title="Mở thư viện">
              <ArrowRight size={24} />
            </button>
            {isAuthenticated && (
              <button onClick={submitCreatePlaylistAuto} className="p-2 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded-full transition text-spotify-lighttext" title="Tạo playlist mới">
                <Plus size={20} />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-0 opacity-0 group-hover:w-10 group-hover:opacity-100 overflow-hidden transition-all duration-300 flex items-center justify-center shrink-0">
                  <button onClick={onToggleCollapse} className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition text-spotify-lighttext shrink-0" title="Thu gọn Thư viện">
                    <ArrowLeft size={20} />
                  </button>
                </div>
                <span className="text-spotify-lighttext font-bold text-base hover:text-white transition cursor-pointer" onClick={onToggleCollapse}>Thư viện</span>
              </div>
              
              <div className="flex items-center gap-2 text-spotify-lighttext">
                {isAuthenticated && (
                  <button onClick={submitCreatePlaylistAuto} className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition" title="Tạo playlist mới">
                    <Plus size={20} />
                  </button>
                )}
                <button onClick={onToggleExpand} className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition" title={isExpanded ? "Thu nhỏ Thư viện" : "Mở rộng thư viện"}>
                  {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 text-sm font-medium mt-1">
              <button className="px-3 py-1.5 bg-spotify-hover2 text-white rounded-full transition">Playlist</button>
            </div>
          </>
        )}
      </div>

      {/* Playlist Content */}
      <div className={`flex-1 overflow-y-auto px-2 ${isCollapsed ? 'flex flex-col items-center' : ''} scrollbar-hide hover:scrollbar-default`}>
        {!isCollapsed && !isExpanded && (
          <div className="flex items-center justify-between px-2 py-2 mb-2 text-spotify-lighttext">
            <button className="p-1.5 hover:bg-spotify-hover2 rounded-full transition"><Search size={18} /></button>
            <button className="flex items-center gap-1.5 text-sm font-medium hover:text-white transition group">
              <span>Gần đây</span>
              <List size={18} className="group-hover:text-white" />
            </button>
          </div>
        )}

        {/* List */}
        <div className={`pb-4 ${isCollapsed ? 'flex flex-col items-center gap-4 w-full' : (isExpanded ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-2 mt-4" : "flex flex-col gap-1")}`}>
          {!isAuthenticated ? (
            !isCollapsed && (
              <div className="flex bg-[#242424] rounded-lg p-4 mx-2 my-2 flex-col items-start gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-white font-bold text-base">Tạo danh sách phát đầu tiên của bạn</span>
                  <span className="text-white font-medium text-sm">Rất dễ, chúng tôi sẽ giúp bạn</span>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="bg-white text-black font-bold px-4 py-1.5 rounded-full text-sm hover:scale-105 transition"
                >
                  Tạo danh sách phát
                </button>
              </div>
            )
          ) : (
            <>
              <div onClick={() => handleItemClick('/favorites')} className={`group/item relative hover:bg-spotify-hover rounded-md cursor-pointer transition ${isCollapsed ? 'p-0 w-12 h-12 flex justify-center items-center shrink-0' : (isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'p-2 flex items-center gap-3')}`} title="Bài hát đã thích">
                <div className={`${isExpanded ? 'w-full aspect-square mb-2 relative' : 'w-12 h-12 relative'} rounded-md bg-gradient-to-br from-indigo-600 to-purple-400 flex-shrink-0 flex items-center justify-center shadow-md`}>
                  <Heart size={isExpanded ? 48 : 20} className="fill-white text-white shrink-0" />
                  {isExpanded && (
                    <button 
                      onClick={handlePlayLiked}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center text-black opacity-0 group-hover/item:opacity-100 hover:scale-105 transition-all shadow-lg translate-y-2 group-hover/item:translate-y-0 z-10"
                    >
                      <Play fill="currentColor" size={24} className="ml-1" />
                    </button>
                  )}
                </div>
                {!isCollapsed && (
                  <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'flex'}`}>
                    <span className="text-base text-white font-semibold truncate">Bài hát đã thích</span>
                    <span className="text-sm text-spotify-lighttext font-medium truncate">Danh sách phát • {likedTracksCount} bài hát</span>
                  </div>
                )}
              </div>

              <div onClick={() => handleItemClick('/shared-with-me')} className={`group/item relative hover:bg-spotify-hover rounded-md cursor-pointer transition ${isCollapsed ? 'p-0 w-12 h-12 flex justify-center items-center shrink-0' : (isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'p-2 flex items-center gap-3')}`} title="Trung tâm chia sẻ">
                <div className={`${isExpanded ? 'w-full aspect-square mb-2 relative' : 'w-12 h-12 relative'} rounded-md bg-gradient-to-br from-emerald-600 to-teal-400 flex-shrink-0 flex items-center justify-center shadow-md`}>
                  <Users size={isExpanded ? 48 : 20} className="text-white shrink-0" />
                </div>
                {!isCollapsed && (
                  <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'flex'}`}>
                    <span className="text-base text-white font-semibold truncate">Trung tâm chia sẻ</span>
                    <span className="text-sm text-spotify-lighttext font-medium truncate">Danh sách phát • Bạn bè</span>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* User Playlists */}
          {isAuthenticated && playlists.map(playlist => (
            <div 
              key={playlist.id}
              onClick={() => handleItemClick(`/playlist/${playlist.id}`)}
              className={`group/item relative hover:bg-spotify-hover rounded-md cursor-pointer transition ${isCollapsed ? 'p-0 w-12 h-12 flex justify-center items-center shrink-0' : (isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'p-2 flex items-center gap-3')}`}
              title={playlist.name}
            >
              <div className={`${isExpanded ? 'w-full aspect-square mb-2 relative' : 'w-12 h-12 relative'} rounded-md bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center overflow-hidden`}>
                {playlist.coverUrl ? (
                  <img src={getImageUrl(playlist.coverUrl)} alt={playlist.name} className="w-full h-full object-cover shrink-0" />
                ) : (
                  <Library size={isExpanded ? 48 : 20} className="text-zinc-500 shrink-0" />
                )}
                {isExpanded && (
                  <button 
                    onClick={(e) => handlePlayPlaylist(e, playlist.id)}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center text-black opacity-0 group-hover/item:opacity-100 hover:scale-105 transition-all shadow-lg translate-y-2 group-hover/item:translate-y-0 z-10"
                  >
                    <Play fill="currentColor" size={24} className="ml-1" />
                  </button>
                )}
              </div>
              {!isCollapsed && (
                <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'flex'}`}>
                  <span className="text-base text-white font-semibold truncate">{playlist.name}</span>
                  <span className="text-sm text-spotify-lighttext font-medium truncate">Danh sách phát • Bạn</span>
                </div>
              )}
            </div>
          ))}
          
          {/* Albums */}
          {loading ? (
            !isCollapsed && <div className="p-4 text-center text-zinc-500 text-sm w-full">Đang tải thư viện...</div>
          ) : (
            <>
              {albums.map(album => (
                <div 
                  key={album.id}
                  onClick={() => handleItemClick(`/album/${album.id}`)}
                  className={`group/item relative hover:bg-spotify-hover rounded-md cursor-pointer transition ${isCollapsed ? 'p-0 w-12 h-12 flex justify-center items-center shrink-0' : (isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'p-2 flex items-center gap-3')}`}
                  title={album.title}
                >
                  <div className={`${isExpanded ? 'w-full aspect-square mb-2 relative' : 'w-12 h-12 relative'} rounded-md bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center overflow-hidden`}>
                    {album.coverUrl ? (
                      <img src={getImageUrl(album.coverUrl)} alt={album.title} className="w-full h-full object-cover shrink-0" />
                    ) : (
                      <Disc size={isExpanded ? 48 : 20} className="text-zinc-500 shrink-0" />
                    )}
                    {isExpanded && (
                      <button 
                        onClick={(e) => handlePlayAlbum(e, album.id)}
                        className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center text-black opacity-0 group-hover/item:opacity-100 hover:scale-105 transition-all shadow-lg translate-y-2 group-hover/item:translate-y-0 z-10"
                      >
                        <Play fill="currentColor" size={24} className="ml-1" />
                      </button>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'flex'}`}>
                      <span className="text-base text-white font-semibold truncate">{album.title}</span>
                      <span className="text-sm text-spotify-lighttext font-medium truncate">Album • {album.artistName || 'Nhiều nghệ sĩ'}</span>
                    </div>
                  )}
                </div>
              ))}
              {/* Artists */}
              {isAuthenticated && artists.map(artist => (
                <div 
                  key={artist.id}
                  onClick={() => handleItemClick(`/artist/${artist.id}`)}
                  className={`group/item relative hover:bg-spotify-hover rounded-md cursor-pointer transition ${isCollapsed ? 'p-0 w-12 h-12 flex justify-center items-center shrink-0' : (isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'p-2 flex items-center gap-3')}`}
                  title={artist.name}
                >
                  <div className={`${isExpanded ? 'w-full aspect-square mb-2 relative' : 'w-12 h-12 relative'} rounded-full bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center overflow-hidden`}>
                    {artist.avatarUrl ? (
                      <img src={getImageUrl(artist.avatarUrl)} alt={artist.name} className="w-full h-full object-cover shrink-0" />
                    ) : (
                      <Users size={isExpanded ? 48 : 20} className="text-zinc-500 shrink-0" />
                    )}
                    {isExpanded && (
                      <button 
                        onClick={(e) => handlePlayArtist(e, artist.id)}
                        className="absolute bottom-2 right-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center text-black opacity-0 group-hover/item:opacity-100 hover:scale-105 transition-all shadow-lg translate-y-2 group-hover/item:translate-y-0 z-10"
                      >
                        <Play fill="currentColor" size={24} className="ml-1" />
                      </button>
                    )}
                  </div>
                  {!isCollapsed && (
                    <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'flex'}`}>
                      <span className="text-base text-white font-semibold truncate">{artist.name}</span>
                      <span className="text-sm text-spotify-lighttext font-medium truncate">Nghệ sĩ</span>
                    </div>
                  )}
                </div>
              ))}
              {albums.length === 0 && playlists.length === 0 && artists.length === 0 && isAuthenticated && !isCollapsed && (
                 <div className="p-4 text-center text-zinc-500 text-sm w-full">Thư viện trống.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
