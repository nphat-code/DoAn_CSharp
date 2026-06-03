import { usePlayer } from '../context/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export const PlayerBar = () => {
  const { currentMedia, isPlaying, togglePlayPause, volume, setVolume } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
      audioRef.current.volume = volume;
    }
  }, [isPlaying, currentMedia, volume]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const seekTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  if (!currentMedia) {
    return <div className="h-24 bg-zinc-950 border-t border-zinc-900 flex items-center justify-center text-zinc-500">Select a track to play</div>;
  }

  return (
    <div className="h-24 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between px-4">
      {/* Cấu hình HTTP Range Request cho phép stream và seek mượt mà */}
      <audio
        ref={audioRef}
        src={`http://localhost:5000/api/media/${currentMedia.id}/stream`} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => togglePlayPause()}
      />
      
      {/* Song Info */}
      <div className="flex items-center w-1/3">
        <div className="w-14 h-14 bg-zinc-800 rounded-md flex-shrink-0"></div>
        <div className="ml-4">
          <div className="text-sm font-semibold text-white">{currentMedia.title}</div>
          <div className="text-xs text-zinc-400">Artist Name</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center w-1/3 max-w-md">
        <div className="flex items-center gap-6 mb-2">
          <button className="text-zinc-400 hover:text-white"><SkipBack size={20} /></button>
          <button onClick={togglePlayPause} className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 transition">
            {isPlaying ? <Pause size={16} className="fill-black" /> : <Play size={16} className="fill-black ml-1" />}
          </button>
          <button className="text-zinc-400 hover:text-white"><SkipForward size={20} /></button>
        </div>
        <div className="w-full flex items-center gap-2">
          <span className="text-xs text-zinc-400">0:00</span>
          <input 
            type="range" min="0" max="100" value={progress || 0} onChange={handleSeek}
            className="w-full h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-white"
          />
          <span className="text-xs text-zinc-400">{currentMedia.duration.substring(3)}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="flex items-center justify-end w-1/3 gap-2">
        <Volume2 size={20} className="text-zinc-400" />
        <input 
          type="range" min="0" max="1" step="0.01" value={volume} 
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-white"
        />
      </div>
    </div>
  );
};
