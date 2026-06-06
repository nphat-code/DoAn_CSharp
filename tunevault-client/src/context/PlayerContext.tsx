import { createContext, useContext, useState, useRef } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { MediaItemDto } from '../types';

interface PlayerContextType {
  currentMedia: MediaItemDto | null;
  isPlaying: boolean;
  playMedia: (media: MediaItemDto) => void;
  togglePlayPause: () => void;
  volume: number;
  setVolume: (v: number) => void;
  mediaRef: RefObject<HTMLMediaElement | null>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const mediaRef = useRef<HTMLMediaElement>(null);
  const [currentMedia, setCurrentMedia] = useState<MediaItemDto | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  const playMedia = (media: MediaItemDto) => {
    setCurrentMedia(media);
    setIsPlaying(true);
    // Ghi lại lịch sử nghe nhạc (không await để tránh block UI)
    import('../services/mediaService').then(m => m.mediaService.recordPlayHistory(media.id).catch(console.error));
  };

  const togglePlayPause = () => {
    if (currentMedia) {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <PlayerContext.Provider value={{ currentMedia, isPlaying, playMedia, togglePlayPause, volume, setVolume, mediaRef }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
