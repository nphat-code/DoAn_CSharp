import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mediaService } from '../services/mediaService';
import { albumService } from '../services/albumService';
import { playlistService } from '../services/playlistService';
import type { SearchResultDto } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Play, Pause } from 'lucide-react';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const { playMedia, playMediaList, currentMedia, isPlaying, togglePlayPause } = usePlayer();
  const navigate = useNavigate();
  
  const [results, setResults] = useState<SearchResultDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'artists' | 'albums' | 'playlists' | 'profiles'>('all');

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

  const renderRow = (item: any, type: 'track' | 'artist' | 'album' | 'playlist' | 'profile') => {
    let id: string = '';
    let title: string = '';
    let subtitle: string = '';
    let imageUrl: string | undefined;
    let isCircular: boolean = false;
    let onClick: () => void = () => {};
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

    return (
      <div 
        key={`${type}-${id}`}
        onClick={onClick}
        className="flex items-center gap-4 p-2 rounded-md hover:bg-zinc-800/50 transition cursor-pointer group w-full"
      >
        <div className={`w-12 h-12 flex-shrink-0 bg-zinc-700 overflow-hidden ${isCircular ? 'rounded-full' : 'rounded-md'}`}>
          {imageUrl ? (
            <img src={getImageUrl(imageUrl)} className="w-full h-full object-cover" alt={title} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-600 font-bold text-lg text-white/50">
               {title?.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <span className={`font-medium truncate ${isPlayingRow ? 'text-[#1ed760]' : 'text-white'}`}>{title}</span>
          <span className="text-sm text-zinc-400 truncate">{subtitle}</span>
        </div>
        {type !== 'profile' && (
          <div className="flex-shrink-0 pr-4">
             <button 
               onClick={(e) => { e.stopPropagation(); handlePlayDirectly(item, type); }}
               className={`w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black hover:scale-105 transition shadow-md ${isPlayingRow && isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
             >
                {isPlayingRow && isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
             </button>
          </div>
        )}
      </div>
    );
  };

  const getTopResult = () => {
    if (!results) return null;
    if (results.artists && results.artists.length > 0) return { type: 'artist' as const, item: results.artists[0] };
    if (results.tracks && results.tracks.length > 0) return { type: 'track' as const, item: results.tracks[0] };
    if (results.albums && results.albums.length > 0) return { type: 'album' as const, item: results.albums[0] };
    if (results.playlists && results.playlists.length > 0) return { type: 'playlist' as const, item: results.playlists[0] };
    if (results.users && results.users.length > 0) return { type: 'profile' as const, item: results.users[0] };
    return null;
  };

  const hasResults = results && (results.tracks?.length > 0 || results.artists?.length > 0 || results.albums?.length > 0 || results.playlists?.length > 0 || results.users?.length > 0);
  const topResult = query ? getTopResult() : null;

  return (
    <div className="p-6 pb-8 text-white max-w-5xl mx-auto">
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

          {/* Top Result Section */}
          {activeTab === 'all' && topResult && (
            <section>
              <div className="bg-zinc-800/20 p-2 rounded-lg">
                {renderRow(topResult.item, topResult.type)}
              </div>
            </section>
          )}

          {/* Tracks Section */}
          {(activeTab === 'all' || activeTab === 'songs') && results.tracks && results.tracks.length > 0 && (
            <section>
              <div className="flex flex-col gap-1">
                {results.tracks.filter(track => !(activeTab === 'all' && topResult?.type === 'track' && track.id === topResult.item.id)).map(track => renderRow(track, 'track'))}
              </div>
            </section>
          )}

          {/* Artists Section */}
          {(activeTab === 'all' || activeTab === 'artists') && results.artists && results.artists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Nghệ sĩ</h2>
              <div className="flex flex-col gap-1">
                {results.artists.map(artist => renderRow(artist, 'artist'))}
              </div>
            </section>
          )}

          {/* Albums Section */}
          {(activeTab === 'all' || activeTab === 'albums') && results.albums && results.albums.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Album</h2>
              <div className="flex flex-col gap-1">
                {results.albums.map(album => renderRow(album, 'album'))}
              </div>
            </section>
          )}

          {/* Playlists Section */}
          {(activeTab === 'all' || activeTab === 'playlists') && results.playlists && results.playlists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Danh sách phát</h2>
              <div className="flex flex-col gap-1">
                {results.playlists.map(playlist => renderRow(playlist, 'playlist'))}
              </div>
            </section>
          )}

          {/* Users Section */}
          {(activeTab === 'all' || activeTab === 'profiles') && results.users && results.users.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Hồ sơ người dùng</h2>
              <div className="flex flex-col gap-1">
                {results.users.map(user => renderRow(user, 'profile'))}
              </div>
            </section>
          )}

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
    </div>
  );
};

