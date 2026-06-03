import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { MediaItemDto } from '../types';

interface PlayerContextType {
  currentMedia: MediaItemDto | null;
  isPlaying: boolean;
  playMedia: (media: MediaItemDto) => void;
  togglePlayPause: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentMedia, setCurrentMedia] = useState<MediaItemDto | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const playMedia = (media: MediaItemDto) => {
    setCurrentMedia(media);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    if (currentMedia) {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <PlayerContext.Provider value={{ currentMedia, isPlaying, playMedia, togglePlayPause, volume, setVolume }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
