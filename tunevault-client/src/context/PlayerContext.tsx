import { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { MediaItemDto } from '../types';
import { mediaService } from '../services/mediaService';

interface PlayerContextType {
  currentMedia: MediaItemDto | null;
  isPlaying: boolean;
  playMedia: (media: MediaItemDto) => void;
  playMediaList: (mediaList: MediaItemDto[], startIndex?: number) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  togglePlayPause: () => void;
  updateQueueContext: (newQueue: MediaItemDto[], trackId: string) => void;
  volume: number;
  setVolume: (v: number) => void;
  mediaRef: RefObject<HTMLMediaElement | null>;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  isFavorited: boolean;
  setIsFavorited: (val: boolean) => void;
  toggleFavorite: () => Promise<void>;
  queue: MediaItemDto[];
  currentIndex: number;
  showQueue: boolean;
  setShowQueue: (show: boolean) => void;
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
  const [showQueue, setShowQueue] = useState(false);

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
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      console.error(err);
      alert("Lỗi khi thêm vào bài hát đã thích");
    }
  };

  const playMediaList = async (mediaList: MediaItemDto[], startIndex: number = 0) => {
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
    
    // Auto-append 15 random tracks to show in the queue UI
    try {
      const m = await import('../services/mediaService');
      const allMedia = await m.mediaService.getAllMedia();
      if (allMedia.length > 0) {
        const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
        const extraTracks = shuffled.slice(0, 15);
        setQueue(prev => {
          if (prev.length >= mediaList.length && prev[0].id === mediaList[0].id) {
            return [...prev, ...extraTracks];
          }
          return prev;
        });
      }
      await m.mediaService.recordPlayHistory(mediaList[startIndex].id);
    } catch (error) {
      console.error(error);
    }
  };

  const playMedia = (media: MediaItemDto) => {
    playMediaList([media], 0);
  };

  const playNext = async () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      
      setCurrentIndex(nextIndex);
      setCurrentMedia(queue[nextIndex]);
      setIsPlaying(true);
      
      // Auto-fetch more if getting close to the end
      if (nextIndex >= queue.length - 3) {
        try {
          const m = await import('../services/mediaService');
          const allMedia = await m.mediaService.getAllMedia();
          if (allMedia.length > 0) {
            const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
            const extraTracks = shuffled.slice(0, 15);
            setQueue(prev => [...prev, ...extraTracks]);
          }
        } catch (e) {}
      }

      try {
        const m = await import('../services/mediaService');
        await m.mediaService.recordPlayHistory(queue[nextIndex].id);
      } catch (error) {
        console.error(error);
      }
    } else {
      // End of queue -> Fetch and play 15 random tracks
      try {
        const m = await import('../services/mediaService');
        const allMedia = await m.mediaService.getAllMedia();
        if (allMedia.length > 0) {
          const shuffled = [...allMedia].sort(() => 0.5 - Math.random());
          const extraTracks = shuffled.slice(0, 15);
          
          setQueue(prev => [...prev, ...extraTracks]);
          setCurrentIndex(prev => prev + 1);
          setCurrentMedia(extraTracks[0]);
          setIsPlaying(true);
          await m.mediaService.recordPlayHistory(extraTracks[0].id);
        } else {
          setIsPlaying(false);
        }
      } catch {
        setIsPlaying(false);
      }
    }
  };

  const updateQueueContext = (newQueue: MediaItemDto[], trackId: string) => {
    const idx = newQueue.findIndex(t => t.id === trackId);
    if (idx !== -1) {
      setQueue(newQueue);
      setCurrentIndex(idx);
    }
  };

  const playPrevious = async () => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentMedia(queue[prevIndex]);
      setIsPlaying(true);
      try {
        const m = await import('../services/mediaService');
        await m.mediaService.recordPlayHistory(queue[prevIndex].id);
      } catch (error) {
        console.error(error);
      }
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
      togglePlayPause, updateQueueContext, volume, setVolume, mediaRef, 
      showLoginModal, setShowLoginModal, isFavorited, setIsFavorited, toggleFavorite,
      queue,
      currentIndex,
      showQueue,
      setShowQueue
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
