import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, User, Disc, Share2, MoreHorizontal } from 'lucide-react';
import { playlistService } from '../services/playlistService';
import type { PlaylistDto } from '../services/playlistService';
import type { MediaItemDto } from '../types';

interface TrackDropdownMenuProps {
  track: MediaItemDto;
  isFavorited?: boolean;
  onToggleFavorite?: (trackId: string) => void;
  onShare?: (trackId: string, trackTitle: string) => void;
  
  showGoToArtist?: boolean;
  showGoToAlbum?: boolean;
  
  onRemoveFromPlaylist?: (trackId: string) => void;
  onRemoveFromAlbum?: (trackId: string) => void;
  
  className?: string; // Optional custom styling for the 3-dots button wrapper
  iconSize?: number;
  alwaysShow?: boolean;
}

export const TrackDropdownMenu = ({
  track,
  isFavorited = false,
  onToggleFavorite,
  onShare,
  showGoToArtist = true,
  showGoToAlbum = true,
  onRemoveFromPlaylist,
  onRemoveFromAlbum,
  className = "",
  iconSize = 18,
  alwaysShow = false
}: TrackDropdownMenuProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);

  useEffect(() => {
    if (isOpen && localStorage.getItem('token')) {
      playlistService.getUserPlaylists().then(setPlaylists).catch(console.error);
    }
  }, [isOpen]);

  const handleOpenDropdown = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const shouldOpenUpwards = rect.bottom > windowHeight - 350;
      setOpenUpwards(shouldOpenUpwards);
      setIsOpen(true);
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsOpen(false);
    setShowPlaylistMenu(false);
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <button
        onClick={handleOpenDropdown}
        className={`text-[#b3b3b3] hover:text-white transition ${isOpen || alwaysShow ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        title="Tùy chọn khác"
      >
        <MoreHorizontal size={iconSize} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={handleClose}></div>
          <div className={`absolute right-0 ${openUpwards ? 'bottom-full mb-1' : 'top-full mt-1'} w-max min-w-[240px] bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10`}>
            
            {onRemoveFromPlaylist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                  onRemoveFromPlaylist(track.id);
                }}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-red-500 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Xóa khỏi danh sách phát này
              </button>
            )}

            <div
              className="relative"
              onMouseEnter={() => setShowPlaylistMenu(true)}
              onMouseLeave={() => setShowPlaylistMenu(false)}
            >
              <button className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Plus size={16} />
                  <span>Thêm vào danh sách phát</span>
                </div>
                <svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 14l8-6-8-6v12z"></path></svg>
              </button>

              {showPlaylistMenu && (
                <div className={`absolute ${openUpwards ? 'bottom-0' : 'top-0'} right-full mr-1 w-56 bg-[#282828] rounded shadow-xl py-1 z-[100] border border-white/10 max-h-64 overflow-y-auto custom-scrollbar`}>
                  {playlists.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-zinc-500">Chưa có danh sách phát</div>
                  ) : (
                    playlists.map(p => (
                      <button
                        key={p.id}
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await playlistService.addTrackToPlaylist(p.id, track.id);
                            alert("Đã thêm vào " + p.name);
                            handleClose();
                          } catch (err) {
                            alert("Có thể bài hát đã có trong playlist này.");
                          }
                        }}
                        className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white truncate"
                      >
                        {p.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                  onToggleFavorite(track.id);
                }}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
              >
                {isFavorited ? (
                  <>
                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                    Xóa khỏi bài hát đã thích
                  </>
                ) : (
                  <>
                    <svg role="img" height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                    Lưu vào bài hát đã thích
                  </>
                )}
              </button>
            )}

            <hr className="border-white/10 my-1" />

            {showGoToArtist && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                  const targetArtistId = track.artistId || track.albumId; // Provide fallback if possible
                  if (targetArtistId) navigate(`/artist/${targetArtistId}`);
                }}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
              >
                <User size={16} />
                Chuyển tới nghệ sĩ
              </button>
            )}

            {showGoToAlbum && (track.albumId || track.albumTitle) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                  if (track.albumId) navigate(`/album/${track.albumId}`);
                }}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
              >
                <Disc size={16} />
                Chuyển đến album
              </button>
            )}

            {onShare && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClose();
                  onShare(track.id, track.title);
                }}
                className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-white flex items-center gap-2"
              >
                <Share2 size={16} /> Chia sẻ
              </button>
            )}

            {onRemoveFromAlbum && (
              <>
                <hr className="border-white/10 my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                    onRemoveFromAlbum(track.id);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-zinc-300 hover:bg-white/10 hover:text-red-500 flex items-center gap-2"
                >
                  <Trash2 size={16} />
                  Xóa khỏi album
                </button>
              </>
            )}

          </div>
        </>
      )}
    </div>
  );
};
