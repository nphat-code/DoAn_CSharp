import { Library, Plus, ArrowRight, Search, List, Heart, Users, Disc } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';
import { albumService } from '../services/albumService';
import type { AlbumDto } from '../services/albumService';
import { artistService } from '../services/artistService';

interface SidebarProps {
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  width?: number;
}

export const Sidebar = ({ isExpanded = false, onToggleExpand, width }: SidebarProps) => {
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [likedTracksCount, setLikedTracksCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!localStorage.getItem('token');
  const navigate = useNavigate();

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
    return () => {
      window.removeEventListener('savedAlbumsUpdated', handleUpdate);
      window.removeEventListener('followedArtistsUpdated', handleUpdate);
      window.removeEventListener('favoritesUpdated', handleUpdate);
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
      className={`${isExpanded ? 'flex-1' : ''} bg-spotify-card rounded-lg flex flex-col overflow-hidden h-full`}
      style={!isExpanded ? { width: width ? `${width}px` : '420px', minWidth: '280px' } : {}}
    >
      {/* Header */}
      <div className="p-4 flex flex-col gap-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-3 text-spotify-lighttext hover:text-white font-bold transition group">
              <Library size={24} className="group-hover:text-white shrink-0" />
              <span className={isExpanded ? "block" : "hidden lg:block"}>Thư viện</span>
            </button>
          </div>
          
          <div className={`items-center gap-2 text-spotify-lighttext ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
            {isAuthenticated && (
              <button onClick={submitCreatePlaylistAuto} className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition flex items-center gap-1 text-sm font-semibold" title="Tạo playlist mới">
                <Plus size={20} /> Tạo
              </button>
            )}
            <button onClick={onToggleExpand} className="p-2 hover:bg-spotify-hover2 hover:text-white rounded-full transition" title={isExpanded ? "Thu gọn Thư viện" : "Mở rộng Thư viện"}>
              <ArrowRight size={20} className={isExpanded ? "rotate-180 transition-transform" : "transition-transform"} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={`gap-2 text-sm font-medium mt-1 ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
          <button className="px-3 py-1.5 bg-spotify-hover2 text-white rounded-full transition">Playlist</button>
        </div>
      </div>

      {/* Playlist Content */}
      <div className="flex-1 overflow-y-auto px-2">
        <div className={`items-center justify-between px-2 py-2 mb-2 text-spotify-lighttext ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
          <button className="p-1.5 hover:bg-spotify-hover2 rounded-full transition"><Search size={18} /></button>
          <button className="flex items-center gap-1.5 text-sm font-medium hover:text-white transition group">
            <span>Gần đây</span>
            <List size={18} className="group-hover:text-white" />
          </button>
        </div>

        {/* List */}
        <div className={isExpanded ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4 px-2 mt-4" : "flex flex-col gap-1 pb-4"}>
          {!isAuthenticated ? (
            <div className={`bg-[#242424] rounded-lg p-4 mx-2 my-2 flex-col items-start gap-4 ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
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
          ) : (
            <>
              <div onClick={() => navigate('/favorites')} className={`p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition ${isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'flex items-center gap-3'}`}>
                <div className={`${isExpanded ? 'w-full aspect-square mb-2' : 'w-12 h-12'} rounded-md bg-gradient-to-br from-indigo-600 to-purple-400 flex-shrink-0 flex items-center justify-center shadow-md`}>
                  <Heart size={isExpanded ? 48 : 20} className="fill-white text-white shrink-0" />
                </div>
                <div className={`flex-col w-full ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
                  <span className="text-base text-white font-semibold truncate">Bài hát đã thích</span>
                  <span className="text-sm text-spotify-lighttext font-medium truncate">Danh sách phát • {likedTracksCount} bài hát</span>
                </div>
              </div>

              <div onClick={() => navigate('/shared-with-me')} className={`p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition ${isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'flex items-center gap-3'}`}>
                <div className={`${isExpanded ? 'w-full aspect-square mb-2' : 'w-12 h-12'} rounded-md bg-gradient-to-br from-emerald-600 to-teal-400 flex-shrink-0 flex items-center justify-center shadow-md`}>
                  <Users size={isExpanded ? 48 : 20} className="text-white shrink-0" />
                </div>
                <div className={`flex-col w-full ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
                  <span className="text-base text-white font-semibold truncate">Trung tâm chia sẻ</span>
                  <span className="text-sm text-spotify-lighttext font-medium truncate">Danh sách phát • Bạn bè</span>
                </div>
              </div>
            </>
          )}
          
          {/* User Playlists */}
          {isAuthenticated && playlists.map(playlist => (
            <div 
              key={playlist.id}
              onClick={() => navigate(`/playlist/${playlist.id}`)}
              className={`p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition ${isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'flex items-center gap-3'}`}
            >
              <div className={`${isExpanded ? 'w-full aspect-square mb-2' : 'w-12 h-12'} rounded-md bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center overflow-hidden`}>
                {playlist.coverUrl ? (
                  <img src={playlist.coverUrl.startsWith('http') || playlist.coverUrl.startsWith('data:') ? playlist.coverUrl : playlist.coverUrl?.startsWith('http') ? playlist.coverUrl : `https://tunevault-api.onrender.com${playlist.coverUrl}`} alt={playlist.name} className="w-full h-full object-cover shrink-0" />
                ) : (
                  <Library size={isExpanded ? 48 : 20} className="text-zinc-500 shrink-0" />
                )}
              </div>
              <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
                <span className="text-base text-white font-semibold truncate">{playlist.name}</span>
                <span className="text-sm text-spotify-lighttext font-medium truncate">Danh sách phát • Bạn</span>
              </div>
            </div>
          ))}
          
          {/* Albums */}
          {loading ? (
             <div className="p-4 text-center text-zinc-500 text-sm col-span-full">Đang tải thư viện...</div>
          ) : (
            <>
              {albums.map(album => (
                <div 
                  key={album.id}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className={`p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition ${isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'flex items-center gap-3'}`}
                >
                  <div className={`${isExpanded ? 'w-full aspect-square mb-2' : 'w-12 h-12'} rounded-md bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center overflow-hidden`}>
                    {album.coverUrl ? (
                      <img src={album.coverUrl?.startsWith('http') ? album.coverUrl : `https://tunevault-api.onrender.com${album.coverUrl}`} alt={album.title} className="w-full h-full object-cover shrink-0" />
                    ) : (
                      <Disc size={isExpanded ? 48 : 20} className="text-zinc-500 shrink-0" />
                    )}
                  </div>
                  <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
                    <span className="text-base text-white font-semibold truncate">{album.title}</span>
                    <span className="text-sm text-spotify-lighttext font-medium truncate">Album • {album.artistName}</span>
                  </div>
                </div>
              ))}
              {/* Artists */}
              {artists.map(artist => (
                <div 
                  key={artist.id}
                  onClick={() => { navigate(`/artist/${artist.id}`); }}
                  className={`p-2 hover:bg-spotify-hover rounded-md cursor-pointer transition ${isExpanded ? 'flex flex-col items-start gap-3 bg-zinc-800/40 p-4' : 'flex items-center gap-3'}`}
                >
                  <div className={`${isExpanded ? 'w-full aspect-square mb-2' : 'w-12 h-12'} rounded-full bg-spotify-hover2 flex-shrink-0 shadow-md flex items-center justify-center overflow-hidden`}>
                    {artist.avatarUrl ? (
                      <img src={artist.avatarUrl?.startsWith('http') || artist.avatarUrl?.startsWith('data:') ? artist.avatarUrl : `https://tunevault-api.onrender.com${artist.avatarUrl}`} alt={artist.name} className="w-full h-full object-cover shrink-0" />
                    ) : (
                      <Users size={isExpanded ? 48 : 20} className="text-zinc-500 shrink-0" />
                    )}
                  </div>
                  <div className={`flex-col overflow-hidden w-full ${isExpanded ? 'flex' : 'hidden lg:flex'}`}>
                    <span className="text-base text-white font-semibold truncate">{artist.name}</span>
                    <span className="text-sm text-spotify-lighttext font-medium truncate">Nghệ sĩ</span>
                  </div>
                </div>
              ))}
              {albums.length === 0 && playlists.length === 0 && artists.length === 0 && isAuthenticated && (
                 <div className="p-4 text-center text-zinc-500 text-sm col-span-full">Thư viện trống.</div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Removed Create Modal */}
    </div>
  );
};
