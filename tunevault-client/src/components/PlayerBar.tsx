import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { mediaService } from '../services/mediaService';

export const PlayerBar = () => {
  const { currentMedia, isPlaying, togglePlayPause, volume, setVolume, mediaRef } = usePlayer();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.play().catch(e => console.error("Lỗi tự động phát:", e));
      } else {
        mediaRef.current.pause();
      }
      mediaRef.current.volume = volume;
    }
  }, [isPlaying, currentMedia, volume, mediaRef]);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      setProgress((media.currentTime / media.duration) * 100);
    };

    const handleEnded = () => {
      togglePlayPause();
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('ended', handleEnded);
    
    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('ended', handleEnded);
    };
  }, [currentMedia, mediaRef, togglePlayPause]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mediaRef.current) {
      const seekTime = (Number(e.target.value) / 100) * mediaRef.current.duration;
      mediaRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  const [isLiked, setIsLiked] = useState(false);

  // Load like state khi đổi bài
  useEffect(() => {
    if (currentMedia) {
      mediaService.checkFavorite(currentMedia.id).then(res => setIsLiked(res.isFavorited)).catch(console.error);
    } else {
      setIsLiked(false);
    }
  }, [currentMedia]);

  const handleLike = async () => {
    if (!currentMedia) return;
    try {
      const result = await mediaService.toggleFavorite(currentMedia.id);
      setIsLiked(result.isFavorited);
    } catch (error) {
      console.error("Lỗi khi thả tim:", error);
    }
  };

  if (!currentMedia) {
    return <div className="h-20 bg-spotify-base flex items-center justify-center text-zinc-500">Select a track to play</div>;
  }

  return (
    <div className="h-20 bg-spotify-base flex items-center justify-between px-4 pb-2">
      {/* Cấu hình HTTP Range Request cho phép stream và seek mượt mà */}
      {currentMedia.mediaType !== 'Video' && (
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={`http://localhost:5183/api/media/${currentMedia.id}/stream`} 
        />
      )}
      
      {/* Song Info */}
      <div className="flex items-center w-1/3">
        <div className="w-14 h-14 bg-spotify-hover2 rounded-md flex-shrink-0"></div>
        <div className="ml-4 flex items-center gap-4">
          <div>
            <div className="text-sm font-semibold text-white hover:underline cursor-pointer">{currentMedia.title}</div>
            <div className="text-xs text-spotify-lighttext hover:underline cursor-pointer hover:text-white">Artist Name</div>
          </div>
          <button onClick={handleLike} className="text-spotify-lighttext hover:text-white transition focus:outline-none">
            <Heart size={20} className={isLiked ? "fill-spotify-green text-spotify-green" : ""} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center w-1/3 max-w-md mt-1">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-spotify-lighttext hover:text-white transition"><SkipBack size={20} className="fill-current" /></button>
          <button onClick={togglePlayPause} className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition">
            {isPlaying ? <Pause size={16} className="fill-black" /> : <Play size={16} className="fill-black ml-1" />}
          </button>
          <button className="text-spotify-lighttext hover:text-white transition"><SkipForward size={20} className="fill-current" /></button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-[11px] text-spotify-lighttext">0:00</span>
          <div className="w-full group flex items-center">
            <input 
              type="range" min="0" max="100" value={progress || 0} onChange={handleSeek}
              className="spotify-slider"
              style={{ '--progress': `${progress || 0}%` } as React.CSSProperties}
            />
          </div>
          <span className="text-[11px] text-spotify-lighttext">{currentMedia.duration.substring(3)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end w-1/3 gap-2">
        <button className="text-spotify-lighttext hover:text-white transition">
           <Volume2 size={20} />
        </button>
        <div className="w-24 group flex items-center">
          <input 
            type="range" min="0" max="1" step="0.01" value={volume} 
            onChange={(e) => setVolume(Number(e.target.value))}
            className="spotify-slider"
            style={{ '--progress': `${volume * 100}%` } as React.CSSProperties}
          />
        </div>
      </div>
    </div>
  );
};
