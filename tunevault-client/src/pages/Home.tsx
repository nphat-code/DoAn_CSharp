import { getImageUrl } from '../utils/imageUrl';
import { useEffect, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { mediaService } from '../services/mediaService';
import { albumService } from '../services/albumService';
import type { AlbumDto } from '../services/albumService';
import type { MediaItemDto } from '../types';
// import { aiService } from '../services/aiService';
import { Disc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const { currentMedia, isPlaying, togglePlayPause, playMediaList } = usePlayer();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<MediaItemDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  // const [aiTracks, setAiTracks] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'foryou'>('all');


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [libData, albumData] = await Promise.all([
          mediaService.getAllMedia(),
          albumService.getAllAlbums().catch(() => [])
        ]);
        setTracks(libData);
        setAlbums(albumData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    // const fetchAiData = async () => {
    //   // Tạm thời vô hiệu hóa AI
    //   // if (currentUserStr) {
    //   //   const aiData = await aiService.getRecommendations().catch(() => []);
    //   //   setAiTracks(aiData);
    //   // }
    // };

    fetchData();
    // fetchAiData(); // Đã tắt AI theo yêu cầu

    window.addEventListener('mediaUpdated', fetchData);
    window.addEventListener('favoritesUpdated', fetchData);
    return () => {
      window.removeEventListener('mediaUpdated', fetchData);
      window.removeEventListener('favoritesUpdated', fetchData);
    };
  }, []);

  const handlePlayAlbum = async (e: React.MouseEvent, albumId: string) => {
    e.stopPropagation();
    
    if (currentMedia?.albumId === albumId) {
      togglePlayPause();
      return;
    }

    try {
      const albumDetail = await albumService.getAlbumById(albumId);
      if (albumDetail.tracks && albumDetail.tracks.length > 0) {
        const tracksToPlay = albumDetail.tracks.map(t => ({
          ...t,
          albumId: albumId,
          isAlbumContext: true,
          coverUrl: t.coverUrl || albumDetail.coverUrl,
          artistName: t.artistName || albumDetail.artistName
        }));
        await playMediaList(tracksToPlay, 0);
      } else {
        alert("Album này chưa có bài hát nào.");
      }
    } catch (error) {
      console.error("Lỗi khi phát album:", error);
      alert("Lỗi khi phát album.");
    }
  };


  return (
    <div className="p-6 pb-8">
      {/* Filters */}
      <div className="flex gap-3 px-1 mt-4 mb-6">
        <button 
          onClick={() => setActiveTab('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'all' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
        >
          Tất cả
        </button>
        {/* Tạm thời ẩn Tab 'Dành cho bạn' (AI) */}
        {/* {currentUser && (
          <button 
            onClick={() => setActiveTab('foryou')}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'foryou' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            Dành cho bạn
          </button>
        )} */}
        <button 
          onClick={() => setActiveTab('songs')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'songs' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
        >
          Bài hát
        </button>
        <button 
          onClick={() => setActiveTab('albums')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'albums' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
        >
          Album
        </button>
      </div>

      {/* For You Section (AI) - Tạm thời vô hiệu hóa */}
      {/* {currentUser && (activeTab === 'all' || activeTab === 'foryou') && aiTracks.length > 0 && (
        <section className="mb-10">
          ...
        </section>
      )} */}

      {/* Album Section */}
      {(activeTab === 'all' || activeTab === 'albums') && (
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4 mt-2">
            <div>
              <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Album</h2>
            </div>
            {activeTab === 'all' && (
              <span onClick={() => setActiveTab('albums')} className="text-sm font-bold text-zinc-400 hover:text-white cursor-pointer transition">Hiện tất cả</span>
            )}
          </div>
          
          {loading ? (
            <div className="text-zinc-500 font-medium">Đang tải...</div>
          ) : albums.length > 0 ? (
            <div className={activeTab === 'all' ? "flex overflow-x-auto gap-0 pb-4 custom-scrollbar" : "grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-0"}>
              {albums.slice(0, activeTab === 'all' ? 10 : undefined).map(album => (
                <div 
                  key={album.id}
                  onClick={() => navigate(`/album/${album.id}`)}
                  className={`p-3 rounded-md bg-transparent hover:bg-[#282828] transition cursor-pointer group relative flex flex-col ${activeTab === 'all' ? 'min-w-[180px] w-[180px] flex-shrink-0' : ''}`}
                >
                  <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 shadow-lg flex items-center justify-center relative overflow-hidden group-hover:shadow-xl transition">
                    {album.coverUrl ? (
                      <img src={getImageUrl(album.coverUrl)} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                         <Disc size={64} className="text-white/30" />
                      </div>
                    )}
                    <button 
                      onClick={(e) => handlePlayAlbum(e, album.id)}
                      className={`absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black transition-all duration-200 shadow-xl z-20 hover:scale-110 hover:bg-green-400 hover:shadow-2xl ${currentMedia?.albumId === album.id && currentMedia?.isAlbumContext ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
                    >
                      {currentMedia?.albumId === album.id && currentMedia?.isAlbumContext && isPlaying ? (
                        <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
                      ) : (
                        <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                      )}
                    </button>
                  </div>
                  <h3 className="font-bold text-white truncate text-base">{album.title}</h3>
                  <p 
                    className="text-sm text-zinc-400 mt-1 truncate hover:underline hover:text-white cursor-pointer relative z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (album.artistId) navigate(`/artist/${album.artistId}`);
                    }}
                  >
                    {album.artistName || 'Nghệ sĩ'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 font-medium">Chưa có album nào.</div>
          )}
        </section>
      )}

      {/* Tracks Section */}
      {(activeTab === 'all' || activeTab === 'songs') && (
        <section>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Bài hát</h2>
            </div>
            {activeTab === 'all' && (
              <span onClick={() => setActiveTab('songs')} className="text-sm font-bold text-zinc-400 hover:text-white cursor-pointer transition">Hiện tất cả</span>
            )}
          </div>
          
          {loading ? (
          <div className="text-zinc-500 font-medium">Đang tải...</div>
        ) : tracks.length > 0 ? (
          <div className={activeTab === 'all' ? "flex overflow-x-auto gap-0 pb-4 custom-scrollbar" : "grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-0"}>
            {tracks.slice(0, activeTab === 'all' ? 10 : undefined).map((track, index, arr) => (
              <div 
                key={track.id}
                onClick={() => playMediaList(arr, index)}
                className={`p-3 rounded-md bg-transparent hover:bg-[#282828] transition cursor-pointer group relative ${activeTab === 'all' ? 'min-w-[180px] w-[180px] flex-shrink-0' : ''}`}
              >
                <div className="w-full aspect-square bg-zinc-700 rounded-md mb-4 shadow-lg flex items-center justify-center group-hover:shadow-xl transition relative overflow-hidden">
                  {track.coverUrl ? (
                    <img src={getImageUrl(track.coverUrl)} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                       <span className="text-3xl font-black text-white/50">{track.title.charAt(0)}</span>
                    </div>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentMedia?.id === track.id) {
                        togglePlayPause();
                      } else {
                        playMediaList(arr, index);
                      }
                    }}
                    className={`absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black transition-all duration-200 shadow-xl hover:scale-110 hover:bg-green-400 hover:shadow-2xl ${currentMedia?.id === track.id ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
                  >
                    {currentMedia?.id === track.id && isPlaying ? (
                      <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
                    ) : (
                      <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                    )}
                  </button>
                </div>
                <h3 className="font-bold text-white truncate text-base">{track.title}</h3>
                <p 
                  className="text-sm text-zinc-400 mt-1 truncate hover:underline hover:text-white cursor-pointer relative z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (track.artistId) navigate(`/artist/${track.artistId}`);
                  }}
                >
                  {track.artistName || track.description || 'Nghệ sĩ'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-zinc-500 font-medium">Chưa có bài hát nào được tải lên.</div>
        )}
        </section>
      )}
    </div>
  );
};
