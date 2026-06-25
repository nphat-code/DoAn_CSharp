import { getImageUrl } from '../utils/imageUrl';
import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { mediaService } from '../services/mediaService';
import { albumService } from '../services/albumService';
import { artistService } from '../services/artistService';
import { playlistService } from '../services/playlistService';
import type { AlbumDto } from '../services/albumService';
import type { MediaItemDto } from '../types';
import { Disc, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Home = () => {
  const { currentMedia, isPlaying, togglePlayPause, playMediaList, showToast } = usePlayer();
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<MediaItemDto[]>([]);
  const [albums, setAlbums] = useState<AlbumDto[]>([]);
  const [recentItems, setRecentItems] = useState<{isAlbum: boolean, data: any}[]>([]);
  const [recentCards, setRecentCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'foryou'>('all');
  const colorCache = useRef<{ [key: string]: string }>({});
  const defaultColor = useRef('rgba(79, 70, 229, 0.8)');

  useEffect(() => {
    const computeDefaultBg = async () => {
      if (recentItems.length > 0) {
        const firstItem = recentItems[0];
        const coverUrl = firstItem.data.coverUrl;
        if (coverUrl) {
          try {
            const url = getImageUrl(coverUrl);
            const { getAverageColor } = await import('../utils/colorUtils');
            const color = await getAverageColor(url);
            defaultColor.current = color;
            colorCache.current[url] = color;
            window.dispatchEvent(new CustomEvent('homeBgColorChange', { detail: color }));
          } catch (e) {
            // ignore
          }
        }
      }
    };
    computeDefaultBg();
  }, [recentItems]);

  const handleMouseEnter = async (coverUrl: string | undefined) => {
    if (!coverUrl) {
      window.dispatchEvent(new CustomEvent('homeBgColorChange', { detail: defaultColor.current }));
      return;
    }
    const url = getImageUrl(coverUrl);
    if (colorCache.current[url]) {
      window.dispatchEvent(new CustomEvent('homeBgColorChange', { detail: colorCache.current[url] }));
      return;
    }
    try {
      const { getAverageColor } = await import('../utils/colorUtils');
      const color = await getAverageColor(url);
      colorCache.current[url] = color;
      window.dispatchEvent(new CustomEvent('homeBgColorChange', { detail: color }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('homeBgColorChange', { detail: defaultColor.current }));
    }
  };

  const handleMouseLeave = () => {
    window.dispatchEvent(new CustomEvent('homeBgColorChange', { detail: defaultColor.current }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [libData, albumData, artistData, historyData, playlistData] = await Promise.all([
          mediaService.getAllMedia(),
          albumService.getAllAlbums().catch(() => []),
          artistService.getAllArtists().catch(() => []),
          mediaService.getRecentHistory(50).catch(() => []),
          playlistService.getUserPlaylists().catch(() => [])
        ]);
        setTracks(libData);
        setAlbums(albumData);
        
        // Process history for top 2x4 grid
        const uniqueItems = new Map<string, any>();
        for (const item of historyData) {
          if (!item.mediaItem) continue;
          
          if (item.mediaItem.albumId) {
            const album = albumData.find(a => a.id === item.mediaItem.albumId);
            if (album && !uniqueItems.has(`album_${album.id}`)) {
              uniqueItems.set(`album_${album.id}`, { isAlbum: true, data: album });
            }
          } else {
            if (!uniqueItems.has(`track_${item.mediaItem.id}`)) {
              uniqueItems.set(`track_${item.mediaItem.id}`, { isAlbum: false, data: item.mediaItem });
            }
          }
          if (uniqueItems.size >= 8) break;
        }
        setRecentItems(Array.from(uniqueItems.values()));

        // Build mixed Recently Played cards
        const recentlyPlayedCards: any[] = [];
        const seenKeys = new Set<string>();

        // Load playlists from localStorage
        let recentPlaylists: any[] = [];
        try {
          const localRecentPlaylistsJson = localStorage.getItem('recent_playlists');
          const localRecentPlaylistIds: string[] = localRecentPlaylistsJson ? JSON.parse(localRecentPlaylistsJson) : [];
          recentPlaylists = localRecentPlaylistIds
            .map(id => playlistData.find((p: any) => p.id === id))
            .filter(Boolean);
        } catch {}

        // Add playlists
        for (const playlist of recentPlaylists) {
          if (playlist && !seenKeys.has(`playlist_${playlist.id}`)) {
            seenKeys.add(`playlist_${playlist.id}`);
            recentlyPlayedCards.push({
              type: 'playlist',
              id: playlist.id,
              title: playlist.name,
              coverUrl: playlist.coverUrl,
              subtitle: 'Danh sách phát',
              data: playlist
            });
          }
        }

        // Interleave history items
        for (const item of historyData) {
          if (!item.mediaItem) continue;
          const track = item.mediaItem;

          // Add Artist
          if (track.artistId) {
            const artist = artistData.find((a: any) => a.id === track.artistId);
            if (artist && !seenKeys.has(`artist_${artist.id}`)) {
              seenKeys.add(`artist_${artist.id}`);
              recentlyPlayedCards.push({
                type: 'artist',
                id: artist.id,
                title: artist.name,
                coverUrl: artist.avatarUrl,
                subtitle: 'Nghệ sĩ',
                data: artist
              });
            }
          }

          // Add Album
          if (track.albumId) {
            const album = albumData.find((a: any) => a.id === track.albumId);
            if (album && !seenKeys.has(`album_${album.id}`)) {
              seenKeys.add(`album_${album.id}`);
              recentlyPlayedCards.push({
                type: 'album',
                id: album.id,
                title: album.title,
                coverUrl: album.coverUrl,
                subtitle: `Album • ${album.artistName || 'Nghệ sĩ'}`,
                data: album
              });
            }
          }

          // Add Track
          if (!seenKeys.has(`track_${track.id}`)) {
            seenKeys.add(`track_${track.id}`);
            recentlyPlayedCards.push({
              type: 'track',
              id: track.id,
              title: track.title,
              coverUrl: track.coverUrl,
              subtitle: `Bài hát • ${track.artistName || 'Nghệ sĩ'}`,
              data: track
            });
          }
        }

        setRecentCards(recentlyPlayedCards.slice(0, 10));

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    window.addEventListener('mediaUpdated', fetchData);
    window.addEventListener('favoritesUpdated', fetchData);
    window.addEventListener('playlistsUpdated', fetchData);
    return () => {
      window.removeEventListener('mediaUpdated', fetchData);
      window.removeEventListener('favoritesUpdated', fetchData);
      window.removeEventListener('playlistsUpdated', fetchData);
    };
  }, []);

  const handlePlayAlbum = async (e: React.MouseEvent, albumId: string) => {
    e.stopPropagation();
    
    if (currentMedia?.albumId === albumId && currentMedia?.isAlbumContext) {
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
        showToast("Album này chưa có bài hát nào.", "error");
      }
    } catch (error) {
      console.error("Lỗi khi phát album:", error);
      showToast("Lỗi khi phát album.", "error");
    }
  };

  const isRecentCardPlaying = (item: any) => {
    if (!isPlaying || !currentMedia) return false;
    if (item.type === 'track') {
      return currentMedia.id === item.id;
    }
    if (item.type === 'album') {
      return currentMedia.albumId === item.id && currentMedia.isAlbumContext;
    }
    if (item.type === 'artist') {
      return currentMedia.artistId === item.id && !currentMedia.isAlbumContext;
    }
    if (item.type === 'playlist') {
      return (currentMedia as any).playlistId === item.id;
    }
    return false;
  };

  const handlePlayRecentCard = async (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    const isPlayingThis = isRecentCardPlaying(item);
    if (isPlayingThis) {
      togglePlayPause();
      return;
    }

    try {
      if (item.type === 'track') {
        playMediaList([item.data], 0);
      } else if (item.type === 'album') {
        handlePlayAlbum(e, item.id);
      } else if (item.type === 'artist') {
        const artistTracks = tracks.filter(t => t.artistId === item.id);
        if (artistTracks.length > 0) {
          playMediaList(artistTracks, 0);
        } else {
          showToast("Nghệ sĩ này chưa có bài hát nào.", "info");
        }
      } else if (item.type === 'playlist') {
        const playlistDetail = await playlistService.getPlaylistDetails(item.id);
        if (playlistDetail.tracks && playlistDetail.tracks.length > 0) {
          const tracksToPlay = playlistDetail.tracks.map(t => ({
            ...t,
            playlistId: item.id
          }));
          playMediaList(tracksToPlay, 0);
        } else {
          showToast("Danh sách phát này chưa có bài hát nào.", "info");
        }
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể phát nội dung này.", "error");
    }
  };

  return (
    <div className="px-6 pt-2 pb-8">
      {/* Filters */}
      <div className="flex gap-3 px-1 mt-2 mb-6">
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
          onClick={() => setActiveTab('albums')}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${activeTab === 'albums' ? 'bg-white text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
        >
          Album
        </button>
      </div>

      {/* Recent History Grid */}
      {activeTab === 'all' && !loading && recentItems.length > 0 && (
        <section className="mb-10" style={{ containerType: 'inline-size' }}>
          <div className="recent-grid gap-3">
            {recentItems.map((item) => {
              const isAlbum = item.isAlbum;
              const data = item.data;
              const isPlayingThis = isAlbum 
                ? currentMedia?.albumId === data.id && currentMedia?.isAlbumContext
                : currentMedia?.id === data.id;

              return (
                <div 
                  key={`${isAlbum ? 'album' : 'track'}_${data.id}`}
                  onClick={(e) => isAlbum ? handlePlayAlbum(e, data.id) : playMediaList([data], 0)}
                  onMouseEnter={() => handleMouseEnter(data.coverUrl)}
                  onMouseLeave={handleMouseLeave}
                  className="flex items-center bg-white/5 hover:bg-white/20 transition-colors rounded-md overflow-hidden cursor-pointer group relative shadow-md hover:shadow-xl"
                >
                  <div className="w-12 h-12 flex-shrink-0 bg-zinc-800 shadow-[4px_0_12px_rgba(0,0,0,0.5)] z-10 relative">
                    {data.coverUrl ? (
                      <img src={getImageUrl(data.coverUrl)} alt={data.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                        {isAlbum ? <Disc size={18} className="text-zinc-400" /> : <Music size={18} className="text-zinc-400" />}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 px-3 truncate">
                    <h3 className="font-bold text-white text-sm truncate">{data.title}</h3>
                  </div>
                  <div className="pr-3 flex items-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isPlayingThis) {
                          togglePlayPause();
                        } else {
                          isAlbum ? handlePlayAlbum(e, data.id) : playMediaList([data], 0);
                        }
                      }}
                      className={`w-9 h-9 bg-green-500 rounded-full flex items-center justify-center text-black transition-all duration-200 shadow-xl z-20 hover:scale-105 hover:bg-green-400 ${isPlayingThis ? 'opacity-100 scale-100' : 'opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100'}`}
                    >
                      {isPlayingThis && isPlaying ? (
                        <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
                      ) : (
                        <svg height="20" width="20" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recently Played Shelf */}
      {activeTab === 'all' && !loading && recentCards.length > 0 && (
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4 mt-2">
            <div>
              <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Gần đây đã nghe</h2>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar">
            {recentCards.map((item) => {
              const isPlayingThis = isRecentCardPlaying(item);
              const isArtist = item.type === 'artist';
              
              const handleClick = () => {
                if (item.type === 'track') {
                  playMediaList([item.data], 0);
                } else if (item.type === 'album') {
                  navigate(`/album/${item.id}`);
                } else if (item.type === 'artist') {
                  navigate(`/artist/${item.id}`);
                } else if (item.type === 'playlist') {
                  navigate(`/playlist/${item.id}`);
                }
              };

              return (
                <div
                  key={`${item.type}_${item.id}`}
                  onClick={handleClick}
                  className="p-3 rounded-md bg-transparent hover:bg-[#282828] transition-all duration-300 cursor-pointer group relative flex flex-col min-w-[180px] w-[180px] flex-shrink-0"
                >
                  <div className="relative mb-4">
                    <div className={`w-full aspect-square bg-zinc-800 shadow-lg flex items-center justify-center overflow-hidden group-hover:shadow-xl transition-all duration-300 ${isArtist ? 'rounded-full' : 'rounded-md'}`}>
                      {item.coverUrl ? (
                        <img 
                          src={getImageUrl(item.coverUrl)} 
                          alt={item.title} 
                          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isArtist ? 'rounded-full' : 'rounded-md'}`} 
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${isArtist ? 'bg-zinc-700 rounded-full' : 'bg-gradient-to-br from-zinc-700 to-zinc-800'}`}>
                          {isArtist ? (
                            <span className="text-white/30 font-bold text-4xl">{item.title.charAt(0).toUpperCase()}</span>
                          ) : (
                            <Disc size={64} className="text-white/30" />
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={(e) => handlePlayRecentCard(e, item)}
                      className={`absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black transition-all duration-200 shadow-xl z-20 hover:scale-110 hover:bg-green-400 hover:shadow-2xl ${isPlayingThis ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
                    >
                      {isPlayingThis && isPlaying ? (
                        <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
                      ) : (
                        <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                      )}
                    </button>
                  </div>
                  <h3 className="font-bold text-white truncate text-base">{item.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1 truncate">
                    {item.subtitle}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Album Section */}
      {(activeTab === 'all' || activeTab === 'albums') && (
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4 mt-2">
            <div>
              <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">Album</h2>
            </div>
            {activeTab === 'all' && (
              <span onClick={() => setActiveTab('albums')} className="text-sm font-bold text-zinc-400 hover:text-white cursor-pointer transition flex-shrink-0">Hiện tất cả</span>
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
              <span onClick={() => setActiveTab('songs')} className="text-sm font-bold text-zinc-400 hover:text-white cursor-pointer transition flex-shrink-0">Hiện tất cả</span>
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
