import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { mediaService } from '../services/mediaService';
import type { SearchResultDto } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Play } from 'lucide-react';

export const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const { playMedia } = usePlayer();
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

  const hasResults = results && (results.tracks?.length > 0 || results.artists?.length > 0 || results.albums?.length > 0 || results.playlists?.length > 0 || results.users?.length > 0);

  return (
    <div className="p-6 pb-8 text-white">
      {query ? (
        <h1 className="text-2xl font-bold mb-6">Kết quả cho "{query}"</h1>
      ) : (
        <h1 className="text-2xl font-bold mb-6">Khám phá & Xu hướng</h1>
      )}
      
      {loading ? (
        <div className="text-zinc-500 font-medium">Đang tải...</div>
      ) : !hasResults ? (
        <div className="text-zinc-500 font-medium text-center mt-12">
           <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy kết quả nào</h2>
           {query && <p>Vui lòng đảm bảo bạn đã viết đúng chính tả hoặc sử dụng ít từ khóa hơn.</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          
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

          {/* Tracks Section */}
          {(activeTab === 'all' || activeTab === 'songs') && results.tracks && results.tracks.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Bài hát</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
                {results.tracks.map(track => (
                  <div 
                    key={track.id}
                    onClick={() => playMedia(track)}
                    className="p-4 rounded-md bg-zinc-800/20 hover:bg-zinc-800 transition cursor-pointer group relative"
                  >
                    <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 shadow-lg flex items-center justify-center group-hover:shadow-xl transition relative overflow-hidden">
                      {track.coverUrl ? (
                        <img src={track.coverUrl?.startsWith('http') ? track.coverUrl : `https://tunevault-api.onrender.com${track.coverUrl}`} alt={track.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                           <span className="text-3xl font-black text-white/50">{track.title.charAt(0)}</span>
                        </div>
                      )}
                      <button className="absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition shadow-xl translate-y-2 group-hover:translate-y-0">
                        <Play fill="black" size={24} className="ml-1" />
                      </button>
                    </div>
                    <h3 className="font-bold text-white truncate text-base">{track.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{track.artistName || track.description || 'Nghệ sĩ'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Artists Section */}
          {(activeTab === 'all' || activeTab === 'artists') && results.artists && results.artists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Nghệ sĩ</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
                {results.artists.map(artist => (
                  <div 
                    key={artist.id}
                    className="p-4 rounded-md bg-zinc-800/20 hover:bg-zinc-800 transition cursor-pointer group relative"
                  >
                    <div className="w-full aspect-square bg-zinc-700 rounded-full mb-4 shadow-lg flex items-center justify-center relative overflow-hidden">
                      {artist.avatarUrl ? (
                        <img src={artist.avatarUrl?.startsWith('http') ? artist.avatarUrl : `https://tunevault-api.onrender.com${artist.avatarUrl}`} alt={artist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-700 to-zinc-900 flex items-center justify-center">
                           <span className="text-4xl font-black text-white/50">{artist.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-white truncate text-base text-center">{artist.name}</h3>
                    <p className="text-sm text-zinc-400 mt-1 truncate text-center">Nghệ sĩ</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Users Section */}
          {(activeTab === 'all' || activeTab === 'profiles') && results.users && results.users.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Hồ sơ người dùng</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
                {results.users.map(user => (
                  <div 
                    key={user.id}
                    onClick={() => navigate(`/user/${user.id}`)}
                    className="p-4 rounded-md bg-zinc-800/20 hover:bg-zinc-800 transition cursor-pointer group relative"
                  >
                    <div className="w-full aspect-square bg-zinc-700 rounded-full mb-4 shadow-lg flex items-center justify-center relative overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl?.startsWith('http') ? user.avatarUrl : `https://tunevault-api.onrender.com${user.avatarUrl}`} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                           <span className="text-4xl font-black text-white/50">{user.username.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-white truncate text-base text-center">{user.username}</h3>
                    <p className="text-sm text-zinc-400 mt-1 truncate text-center">Người dùng</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Albums Section */}
          {(activeTab === 'all' || activeTab === 'albums') && results.albums && results.albums.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Album</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
                {results.albums.map(album => (
                  <div 
                    key={album.id}
                    onClick={() => navigate(`/album/${album.id}`)}
                    className="p-4 rounded-md bg-zinc-800/20 hover:bg-zinc-800 transition cursor-pointer group relative"
                  >
                    <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 shadow-lg flex items-center justify-center relative overflow-hidden">
                      {album.coverUrl ? (
                        <img src={album.coverUrl?.startsWith('http') ? album.coverUrl : `https://tunevault-api.onrender.com${album.coverUrl}`} alt={album.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                           <span className="text-3xl font-black text-white/50">{album.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-white truncate text-base">{album.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1 truncate">{album.artistName || 'Nghệ sĩ'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Playlists Section */}
          {(activeTab === 'all' || activeTab === 'playlists') && results.playlists && results.playlists.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4">Danh sách phát</h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
                {results.playlists.map(playlist => (
                  <div 
                    key={playlist.id}
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                    className="p-4 rounded-md bg-zinc-800/20 hover:bg-zinc-800 transition cursor-pointer group relative"
                  >
                    <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 shadow-lg flex items-center justify-center relative overflow-hidden">
                      {playlist.coverUrl ? (
                        <img src={playlist.coverUrl.startsWith('http') ? playlist.coverUrl : playlist.coverUrl?.startsWith('http') ? playlist.coverUrl : `https://tunevault-api.onrender.com${playlist.coverUrl}`} alt={playlist.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                           <span className="text-3xl font-black text-white/50">{playlist.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-white truncate text-base">{playlist.name}</h3>
                    <p className="text-sm text-zinc-400 mt-1 truncate">Danh sách phát</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pagination */}
          {results.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
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
