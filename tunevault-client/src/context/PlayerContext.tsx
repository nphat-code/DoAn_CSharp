import { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { MediaItemDto } from '../types';
import { mediaService } from '../services/mediaService';

interface PlayerContextType {
  currentMedia: MediaItemDto | null;
  isPlaying: boolean;
  playMedia: (media: MediaItemDto) => void;
  togglePlayPause: () => void;
  volume: number;
  setVolume: (v: number) => void;
  mediaRef: RefObject<HTMLMediaElement | null>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  isFavorited: boolean;
  setIsFavorited: (val: boolean) => void;
  toggleFavorite: () => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const mediaRef = useRef<HTMLMediaElement>(null);
  const [currentMedia, setCurrentMedia] = useState<MediaItemDto | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (!currentMedia) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    const checkFav = async () => {
      try {
        const res = await mediaService.checkFavorite(currentMedia.id);
        setIsFavorited(res.isFavorited);
      } catch (err) {
        console.error(err);
      }
    };
    checkFav();
  }, [currentMedia]);

  const toggleFavorite = async () => {
    if (!currentMedia) return;
    try {
      const res = await mediaService.toggleFavorite(currentMedia.id);
      setIsFavorited(res.isFavorited);
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm vào bài hát đã thích");
    }
  };

  const playMedia = (media: MediaItemDto) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
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
    <PlayerContext.Provider value={{ currentMedia, isPlaying, playMedia, togglePlayPause, volume, setVolume, mediaRef, showLoginModal, setShowLoginModal, isFavorited, setIsFavorited, toggleFavorite }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
