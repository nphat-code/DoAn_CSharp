import { getImageUrl } from '../utils/imageUrl';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mediaService } from '../services/mediaService';
import { usePlayer } from '../context/PlayerContext';

export const TopArtists = () => {
  const navigate = useNavigate();
  const [topArtists, setTopArtists] = useState<{ name: string, avatarUrl: string, id?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { isPlaying, togglePlayPause, currentMedia, playMediaList } = usePlayer();

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    try {
      setLoading(true);
      const allMedia = await mediaService.getAllMedia();
      const artistsMap = new Map();
      allMedia.forEach(m => {
        if (m.artistName && !artistsMap.has(m.artistName)) {
          artistsMap.set(m.artistName, { avatarUrl: m.artistAvatarUrl || "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62", id: m.artistId });
        }
      });
      setTopArtists(Array.from(artistsMap.entries()).map(([name, data]) => ({ name, avatarUrl: data.avatarUrl, id: data.id })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayArtist = async (e: React.MouseEvent, artistId?: string) => {
    e.stopPropagation();
    if (!artistId) return;

    if (currentMedia?.artistId === artistId) {
      togglePlayPause();
      return;
    }

    try {
      const allMedia = await mediaService.getAllMedia();
      const artistTracks = allMedia.filter(m => m.artistId === artistId).map(t => ({
        ...t,
        artistId: artistId
      }));
      if (artistTracks.length > 0) {
        playMediaList(artistTracks, 0);
      } else {
        alert("Nghệ sĩ này chưa có bài hát nào.");
      }
    } catch (error) {
      console.error("Failed to play artist tracks", error);
    }
  };

  if (loading) return <div className="text-zinc-400 p-8 h-full bg-[#121212]">Đang tải...</div>;

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto px-8 py-6">
      <div className="mb-8 mt-4">
        <h1 className="text-3xl font-bold text-white mb-2">Nghệ sĩ hàng đầu tháng này</h1>
        <p className="text-sm text-zinc-400">Chỉ hiển thị với bạn</p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-0 -mx-6 px-6">
        {topArtists.map((artist, idx) => {
          const isPlayingRow = currentMedia?.artistId === artist.id;
          return (
            <div
              key={idx}
              onClick={() => { if (artist.id) navigate(`/artist/${artist.id}`); }}
              className="p-2 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer flex flex-col items-center"
            >
              <div className="relative w-full aspect-square mb-3">
                <div className="w-full h-full shadow-lg rounded-full bg-zinc-800 shrink-0 relative overflow-hidden">
                  <img src={getImageUrl(artist.avatarUrl)} alt={artist.name} className="w-full h-full object-cover rounded-full" />
                </div>
                {/* Play button overlay */}
                <button 
                  onClick={(e) => handlePlayArtist(e, artist.id)}
                  className={`absolute right-2 bottom-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black transition-all duration-200 shadow-xl z-20 hover:scale-110 hover:bg-green-400 hover:shadow-2xl ${isPlayingRow ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'}`}
                >
                  {isPlayingRow && isPlaying ? (
                    <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path></svg>
                  ) : (
                    <svg height="24" width="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606z"></path></svg>
                  )}
                </button>
              </div>
              <div className="w-full">
                <h3 className="text-white font-bold truncate w-full text-left">{artist.name}</h3>
                <p className="text-sm text-zinc-400 truncate w-full text-left mt-1">Nghệ sĩ</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
