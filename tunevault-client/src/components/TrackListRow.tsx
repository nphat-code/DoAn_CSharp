import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { getImageUrl } from '../utils/imageUrl';
import { formatDuration } from '../utils/format';
import { TrackDropdownMenu } from './TrackDropdownMenu';
import type { MediaItemDto } from '../types';

interface TrackListRowProps {
  track: MediaItemDto;
  index: number;
  tracks: MediaItemDto[];
  showCover?: boolean;
  showAlbum?: boolean;
  showGoToArtist?: boolean;
  showGoToAlbum?: boolean;
  className?: string; 
  
  isFavorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  onShare?: (id: string, title: string) => void;
  onRemoveFromPlaylist?: (id: string) => void;
  onRemoveFromAlbum?: (id: string) => void;
}

export const TrackListRow: React.FC<TrackListRowProps> = ({
  track,
  index,
  tracks,
  showCover = true,
  showAlbum = true,
  showGoToArtist = true,
  showGoToAlbum = true,
  className,
  isFavorited = false,
  onToggleFavorite,
  onShare,
  onRemoveFromPlaylist,
  onRemoveFromAlbum
}) => {
  const navigate = useNavigate();
  const { currentMedia, isPlaying, queue, updateQueueContext, togglePlayPause, playMediaList } = usePlayer();
  
  const isPlayingTrack = currentMedia?.id === track.id;

  const handlePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isPlayingTrack) {
      if (queue.length <= 1) {
        updateQueueContext(tracks, currentMedia.id);
      }
      togglePlayPause();
    } else {
      playMediaList(tracks, index);
    }
  };

  const defaultGridClass = showAlbum 
    ? 'grid-cols-[32px_minmax(120px,4fr)_minmax(100px,3fr)_minmax(100px,1fr)]'
    : 'grid-cols-[32px_1fr_minmax(80px,120px)]';

  const gridClass = className || defaultGridClass;

  return (
    <div 
      className={`grid ${gridClass} gap-4 px-4 py-2 hover:bg-white/10 rounded-md transition items-center group cursor-pointer`}
      onDoubleClick={() => handlePlay()}
    >
      
      <div className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-[#b3b3b3]'} text-base font-medium flex items-center justify-end pr-2 relative w-full`}>
        <span className="group-hover:hidden">{index + 1}</span>
        <button className="hidden group-hover:block" onClick={handlePlay}>
          {isPlayingTrack && isPlaying ? (
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" className="text-white">
              <path d="M5.7 3a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7H5.7zm10 0a.7.7 0 0 0-.7.7v16.6a.7.7 0 0 0 .7.7h2.6a.7.7 0 0 0 .7-.7V3.7a.7.7 0 0 0-.7-.7h-2.6z"></path>
            </svg>
          ) : (
            <Play size={14} className="fill-white text-white" />
          )}
        </button>
      </div>

      
      <div className="flex items-center gap-3 overflow-hidden">
        {showCover && (
          <div className="w-10 h-10 bg-zinc-800 rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
            {track.coverUrl ? (
              <img src={getImageUrl(track.coverUrl)} alt={track.title} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/50 text-xs">{track.title.charAt(0)}</span>
            )}
          </div>
        )}
        <div className="flex flex-col overflow-hidden justify-center">
          <span className={`${isPlayingTrack ? 'text-[#1ed760]' : 'text-white'} font-semibold text-base truncate`}>
            {track.title}
          </span>
          <span 
            className="text-[#b3b3b3] text-sm truncate hover:underline hover:text-white cursor-pointer inline-block w-fit"
            onClick={(e) => {
              e.stopPropagation();
              if (track.artistId) navigate(`/artist/${track.artistId}`);
            }}
          >
            {track.artistName || track.description || "Nghệ sĩ"}
          </span>
        </div>
      </div>

      
      {showAlbum && (
        <div 
          className="text-sm text-[#b3b3b3] truncate hover:text-white transition hidden md:block cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (track.albumId) navigate(`/album/${track.albumId}`);
          }}
        >
          {track.albumTitle || "Đĩa đơn"}
        </div>
      )}

      
      <div className="flex items-center justify-end gap-4 pr-4 relative">
        {onToggleFavorite && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(track.id); }}
            className={`hover:scale-105 transition ${isFavorited ? 'opacity-100 text-[#1ed760]' : 'opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white'}`}
          >
            {isFavorited ? (
              <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
            ) : (
              <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
            )}
          </button>
        )}
        <div className="text-sm text-[#b3b3b3] font-medium w-12 text-right">
          {formatDuration(track.duration)}
        </div>
        <TrackDropdownMenu
          track={track}
          isFavorited={isFavorited}
          onToggleFavorite={onToggleFavorite}
          onShare={onShare}
          showGoToArtist={showGoToArtist}
          showGoToAlbum={showGoToAlbum}
          onRemoveFromPlaylist={onRemoveFromPlaylist}
          onRemoveFromAlbum={onRemoveFromAlbum}
          className="opacity-0 group-hover:opacity-100 transition"
        />
      </div>
    </div>
  );
};
