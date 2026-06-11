import { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { MediaItemDto } from '../types';
import { mediaService } from '../services/mediaService';

interface PlayerContextType {
  currentMedia: MediaItemDto | null;
  isPlaying: boolean;
  playMedia: (media: MediaItemDto) => void;
  playMediaList: (mediaList: MediaItemDto[], startIndex?: number) => void;
  playNext: () => void;
  playPrevious: () => void;
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
  const [queue, setQueue] = useState<MediaItemDto[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

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

  const playMediaList = (mediaList: MediaItemDto[], startIndex: number = 0) => {
    const isAuthenticated = !!localStorage.getItem('token');
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (mediaList.length === 0) return;
    
    setQueue(mediaList);
    setCurrentIndex(startIndex);
    setCurrentMedia(mediaList[startIndex]);
    setIsPlaying(true);
    import('../services/mediaService').then(m => m.mediaService.recordPlayHistory(mediaList[startIndex].id).catch(console.error));
  };

  const playMedia = (media: MediaItemDto) => {
    playMediaList([media], 0);
  };

  const playNext = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentMedia(queue[nextIndex]);
      setIsPlaying(true);
      import('../services/mediaService').then(m => m.mediaService.recordPlayHistory(queue[nextIndex].id).catch(console.error));
    } else {
      // End of queue
      setIsPlaying(false);
    }
  };

  const playPrevious = () => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentMedia(queue[prevIndex]);
      setIsPlaying(true);
      import('../services/mediaService').then(m => m.mediaService.recordPlayHistory(queue[prevIndex].id).catch(console.error));
    }
  };

  const togglePlayPause = () => {
    if (currentMedia) {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <PlayerContext.Provider value={{ 
      currentMedia, isPlaying, playMedia, playMediaList, playNext, playPrevious, 
      togglePlayPause, volume, setVolume, mediaRef, 
      showLoginModal, setShowLoginModal, isFavorited, setIsFavorited, toggleFavorite 
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within PlayerProvider');
  return context;
};
