import { useEffect, useState, useRef } from 'react';
import { FastAverageColor } from 'fast-average-color';
import { useParams } from 'react-router-dom';
import { artistService, type ArtistDto } from '../services/artistService';
import { mediaService } from '../services/mediaService';
import type { MediaItemDto } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Play, MoreHorizontal, Share2 } from 'lucide-react';
import { ShareMediaModal } from '../components/ShareMediaModal';

export const ArtistDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [artist, setArtist] = useState<ArtistDto | null>(null);
  const [tracks, setTracks] = useState<MediaItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [bgColor, setBgColor] = useState<string>('rgba(49, 46, 129, 0.4)');

  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const [showAllTracks, setShowAllTracks] = useState(false);
  const [showArtistMenu, setShowArtistMenu] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const { playMediaList, currentMedia, isPlaying, togglePlayPause, updateQueueContext, queue, isFavorited, setIsFavorited } = usePlayer();
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentMedia) return;
    setLikedTracks(prev => {
      const next = new Set(prev);
      if (isFavorited) next.add(currentMedia.id);
      else next.delete(currentMedia.id);
      return next;
    });
  }, [isFavorited, currentMedia]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;

        // Fetch all artists and find the matching one
        const allArtists = await artistService.getAllArtists();
        const foundArtist = allArtists.find(a => a.id === id);

        if (foundArtist) {
          setArtist(foundArtist);
        }

        // Fetch follow status
        const followStatus = await artistService.getFollowStatus(id);
        setIsFollowing(followStatus);

        // Fetch all media and filter by artistId
        const allMedia = await mediaService.getAllMedia();
        const artistTracks = allMedia.filter(m => m.artistId === id);
        setTracks(artistTracks);

        // Fetch liked tracks for the tracklist
        const favoritesData = await mediaService.getFavorites();
        setLikedTracks(new Set(favoritesData.map(t => t.id)));

      } catch (error) {
        console.error("Error fetching artist details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (artist?.avatarUrl) {
      const fac = new FastAverageColor();
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      const baseUrl = artist.avatarUrl.startsWith('http') ? artist.avatarUrl : `https://tunevault-api.onrender.com${artist.avatarUrl}`;
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
  }, [artist?.avatarUrl]);

  const handleToggleFollow = async () => {
    if (!id) return;
    setLoadingFollow(true);
    try {
      if (isFollowing) {
        await artistService.unfollowArtist(id);
        setIsFollowing(false);
      } else {
        await artistService.followArtist(id);
        setIsFollowing(true);
      }
      window.dispatchEvent(new Event('followedArtistsUpdated'));
    } catch (error) {
      console.error("Lỗi khi theo dõi nghệ sĩ", error);
    } finally {
      setLoadingFollow(false);
      setShowArtistMenu(false);
    }
  };

  const handlePlayMedia = (index: number) => {
    if (tracks.length === 0) return;
    playMediaList(tracks, index);
  };

  const isCurrentArtistTrackPlaying = currentMedia && tracks.some(t => t.id === currentMedia.id);
  const isArtistPlaying = isCurrentArtistTrackPlaying && isPlaying;

  const handleMainPlayClick = () => {
    if (tracks.length === 0) return;
    if (isCurrentArtistTrackPlaying) {
      if (queue.length <= 1) {
        updateQueueContext(tracks, currentMedia.id);
      }
      togglePlayPause();
    } else {
      handlePlayMedia(0);
    }
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current && gradientRef.current) {
      gradientRef.current.style.transform = `translateY(-${scrollRef.current.scrollTop}px)`;
    }
  };

  if (loading) return <div className="p-6 text-white">Đang tải chi tiết nghệ sĩ...</div>;
  if (!artist) return <div className="p-6 text-white">Không tìm thấy nghệ sĩ.</div>;

  const displayTracks = showAllTracks ? tracks : tracks.slice(0, 5);
  const getAvatarUrl = (url: string | undefined) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://tunevault-api.onrender.com${url}`;
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
        {/* Header - Image as background */}
        <div
          className="relative px-6 pb-6 pt-16 flex items-end"
          style={{ height: 'clamp(340px, 40cqw, 400px)', minHeight: '340px' }}
        >
          {/* Header Background Image */}
          {artist.avatarUrl && (
            <div
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${getAvatarUrl(artist.avatarUrl)})`,
                backgroundPosition: '50% 15%'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
          )}

          <div className="relative z-10 flex flex-col justify-end min-w-0 flex-1 w-full pb-1">
            <h1
              className="font-black text-white tracking-tighter leading-tight mb-4 line-clamp-2 drop-shadow-xl"
              style={{ fontSize: 'clamp(64px, 8cqw, 96px)', lineHeight: '1.1' }}
            >
              {artist.name}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                <path d="M12 21.643l-2.606-1.127-2.805.344-.925-2.673-2.673-.925.344-2.805L2.208 12l1.127-2.606-.344-2.805 2.673-.925.925-2.673 2.805.344L12 2.208l2.606 1.127 2.805-.344.925 2.673 2.673.925-.344 2.805L21.792 12l-1.127 2.606.344 2.805-2.673.925-.925 2.673-2.805-.344L12 21.643z" fill="#3D91F4"></path>
                <path d="M16.5 8.25l-5.5 5.5-2.5-2.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"></path>
              </svg>
              <span className="text-white text-sm font-medium drop-shadow-md">Do Tunevault xác minh</span>
            </div>
            <div className="text-white font-medium text-base drop-shadow-md">
              {/* Fake monthly listeners count based on ID length to be consistent */}
              {Math.floor((artist.name.length * 12345) % 1000000 + 50000).toLocaleString('vi-VN')} người nghe hằng tháng
            </div>
          </div>
        </div>

        {/* Content wrapper */}
        <div className="flex-1 flex flex-col pt-6 relative z-10 bg-black/40">
          {/* Controls */}
          <div className="flex items-center gap-6 mb-8 px-6">
            <button
              onClick={handleMainPlayClick}
              className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center hover:scale-105 transition hover:bg-green-400 shadow-xl"
            >
              {isArtistPlaying ? (
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" className="text-black ml-0">
                  <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
                </svg>
              ) : (
                <Play size={24} className="text-black fill-black ml-1" />
              )}
            </button>
            <button
              onClick={handleToggleFollow}
              disabled={loadingFollow}
              className={`text-sm font-bold border rounded-full px-4 py-1.5 transition ${isFollowing
                  ? 'border-white text-white hover:border-zinc-400 hover:text-zinc-400'
                  : 'border-zinc-400 text-white hover:border-white hover:scale-105'
                }`}
            >
              {loadingFollow ? '...' : (isFollowing ? 'Đang theo dõi' : 'Theo dõi')}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowArtistMenu(!showArtistMenu)}
                className="text-zinc-400 hover:text-white transition"
                title="Khác"
              >
                <MoreHorizontal size={32} />
              </button>

              {showArtistMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowArtistMenu(false)}></div>
                  <div className="absolute left-0 top-full mt-1 w-48 bg-[#282828] rounded shadow-xl py-1 z-50 border border-white/10">
                    <button
                      onClick={handleToggleFollow}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white"
                    >
                      {isFollowing ? 'Hủy theo dõi' : 'Theo dõi'}
                    </button>
                    <button
                      onClick={() => {
                        setShowShareModal(true);
                        setShowArtistMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between"
                    >
                      Chia sẻ <Share2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Popular Tracks Section */}
          <div className="w-full px-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Phổ biến</h2>

            {tracks.length > 0 ? (
              <div className="flex flex-col gap-0 pb-4">
                {displayTracks.map((track, index) => {
                  const isPlayingTrack = currentMedia?.id === track.id;
                  // Mock play count consistently
                  const mockPlays = Math.floor(((track.title.length * 345) % 1000000) + 100000);

                  return (
                    <div
                      key={track.id}
                      className="grid grid-cols-[32px_1fr_100px_minmax(80px,120px)] gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer"
                      onDoubleClick={() => handlePlayMedia(index)}
                    >
                      <div className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-spotify-lighttext'} text-base font-medium flex items-center justify-end pr-2 relative w-full`}>
                        <span className="group-hover:hidden">{index + 1}</span>
                        <button className="hidden group-hover:block" onClick={(e) => {
                          e.stopPropagation();
                          if (isPlayingTrack) {
                            if (queue.length <= 1) updateQueueContext(tracks, currentMedia.id);
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

                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-zinc-800">
                          {track.coverUrl ? (
                            <img src={getAvatarUrl(track.coverUrl)} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-zinc-700"></div>
                          )}
                        </div>
                        <div className="flex flex-col overflow-hidden justify-center">
                          <span className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-white'} font-medium text-base truncate`}>{track.title}</span>
                          {/* Dấu 'E' cho bài hát có lời explicit có thể thêm ở đây, nhưng tạm thời bỏ qua */}
                        </div>
                      </div>

                      <div className="text-spotify-lighttext text-sm flex items-center">
                        {mockPlays.toLocaleString('vi-VN')}
                      </div>

                      <div className="flex items-center justify-end gap-4 pr-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleToggleFavorite(track.id); }}
                          className={`${likedTracks.has(track.id) ? 'opacity-100 text-[#1ed760]' : 'opacity-0 group-hover:opacity-100 text-spotify-lighttext hover:text-white'} transition`}
                        >
                          {likedTracks.has(track.id) ? (
                            <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                          ) : (
                            <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                          )}
                        </button>
                        <div className="text-sm text-spotify-lighttext font-medium w-12 text-right">{formatDuration(track.duration)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-zinc-400">Nghệ sĩ này chưa có bài hát nào.</div>
            )}

            {tracks.length > 5 && (
              <button
                onClick={() => setShowAllTracks(!showAllTracks)}
                className="text-zinc-400 hover:text-white text-sm font-bold mt-4 ml-4"
              >
                {showAllTracks ? "Ẩn bớt" : "Xem thêm"}
              </button>
            )}
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareMediaModal
          mediaId={artist.id}
          mediaType="Nghệ sĩ"
          mediaTitle={artist.name}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default ArtistDetail;
