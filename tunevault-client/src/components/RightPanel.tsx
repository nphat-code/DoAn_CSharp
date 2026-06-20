import { usePlayer } from '../context/PlayerContext';
import { MoreHorizontal, X, Trash2, Maximize2 } from 'lucide-react';
import { mediaService } from '../services/mediaService';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { VideoCanvas } from './VideoCanvas';
import { ShareMediaModal } from './ShareMediaModal';
import { artistService } from '../services/artistService';

interface RightPanelProps {
  width?: number;
}

export const RightPanel = ({ width }: RightPanelProps) => {
  const { currentMedia, mediaRef, isFavorited, toggleFavorite } = usePlayer();
  const navigate = useNavigate();
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFollowingArtist, setIsFollowingArtist] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (currentMedia?.artistId) {
        try {
          const status = await artistService.getFollowStatus(currentMedia.artistId);
          setIsFollowingArtist(status);
        } catch (error) {
          console.error("Lỗi khi kiểm tra follow status", error);
        }
      } else {
        setIsFollowingArtist(false);
      }
    };
    checkFollowStatus();
  }, [currentMedia?.artistId]);

  const handleToggleFollowArtist = async () => {
    if (!currentMedia?.artistId) return;
    setLoadingFollow(true);
    try {
      if (isFollowingArtist) {
        await artistService.unfollowArtist(currentMedia.artistId);
        setIsFollowingArtist(false);
        window.dispatchEvent(new Event('followedArtistsUpdated'));
      } else {
        await artistService.followArtist(currentMedia.artistId);
        setIsFollowingArtist(true);
        window.dispatchEvent(new Event('followedArtistsUpdated'));
      }
    } catch (error) {
      console.error("Lỗi khi theo dõi nghệ sĩ", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  if (!currentMedia) {
    return (
      <div 
        className="bg-spotify-card rounded-lg flex flex-col p-4 items-center justify-center text-zinc-500 font-medium shrink-0"
        style={{ width: width ? `${width}px` : '420px', minWidth: '280px' }}
      >
        Phát một bài hát để xem chi tiết
      </div>
    );
  }

  const handleDeleteMedia = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa bài này vĩnh viễn khỏi hệ thống không? Hành động này không thể hoàn tác.")) {
      try {
        // Dừng phát nhạc và giải phóng file lock trên trình duyệt trước khi gọi API xóa
        if (mediaRef.current) {
          mediaRef.current.pause();
          mediaRef.current.removeAttribute('src');
          mediaRef.current.load();
        }

        await mediaService.deleteMedia(currentMedia.id);
        alert("Đã xóa bài hát thành công!");
        window.dispatchEvent(new Event('mediaUpdated')); // Cập nhật dữ liệu mà không làm f5 trang
      } catch (error) {
        alert("Lỗi khi xóa.");
      }
    }
  };

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isAdmin = currentUser && currentUser.role === 'Admin';

  const getImageUrl = (url: string | undefined | null) => {
    if (!url) return "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62"; // Fallback Ed Sheeran image
    if (url.startsWith('http')) return url;
    return url?.startsWith('http') ? url : `https://tunevault-api.onrender.com${url}`;
  };

  return (
    <div 
      className="bg-black flex flex-col shrink-0 relative overflow-hidden rounded-lg border-l border-zinc-800"
      style={{ width: width ? `${width}px` : '420px', minWidth: '280px' }}
    >
         
       {/* 1. BACKGROUND VIDEO LAYER (Optimized JS scroll) */}
       <div 
         ref={bgLayerRef}
         className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none will-change-transform"
         style={{ transform: 'translate3d(0,0,0)' }}
       >
         {currentMedia.mediaType === 'Video' ? (
           <VideoCanvas 
             videoRef={mediaRef as React.RefObject<HTMLVideoElement>} 
             className="w-full h-full object-cover scale-[1.3] transform-gpu" 
           />
         ) : currentMedia.coverUrl ? (
           <img src={currentMedia.coverUrl?.startsWith('http') ? currentMedia.coverUrl : `https://tunevault-api.onrender.com${currentMedia.coverUrl}`} alt="Cover" className="w-full h-full object-cover scale-[1.3] transform-gpu" />
         ) : (
           <img src="https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62" alt="Cover" className="w-full h-full object-cover scale-[1.3] transform-gpu" />
         )}
         
         {/* Top Fade */}
         <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-zinc-900 via-zinc-900/50 to-transparent pointer-events-none"></div>

         {/* Vignette / Edge Fade */}
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_#18181b_100%)] opacity-70 pointer-events-none"></div>
         
         {/* Bottom Fade to blend seamlessly with the content below */}
         <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent pointer-events-none"></div>
       </div>

       {/* 2. SCROLLING CONTENT LAYER */}
       <div 
         className="absolute inset-0 overflow-y-auto overflow-x-hidden scrollbar-hide z-10 flex flex-col"
         onScroll={(e) => {
           if (bgLayerRef.current) {
             bgLayerRef.current.style.transform = `translate3d(0, -${e.currentTarget.scrollTop}px, 0)`;
           }
         }}
       >
          {/* Top spacer container matching video height */}
          <div className="w-full min-h-[50vh] sm:min-h-full flex flex-col justify-between shrink-0 pointer-events-none">
             
             {/* Header */}
             <div className="w-full flex items-center justify-between p-4 pointer-events-auto">
               <h3 
                 onClick={() => navigate(`/track/${currentMedia.id}`)}
                 className="font-bold text-base text-white hover:underline cursor-pointer truncate mr-2 drop-shadow-md"
               >
                 {currentMedia.title}
               </h3>
               <div className="flex gap-3">
                 {isAdmin && (
                   <button onClick={handleDeleteMedia} className="text-zinc-300 hover:text-red-500 transition drop-shadow-md" title="Xóa bài hát này">
                      <Trash2 size={20} />
                   </button>
                 )}
                 <button className="text-zinc-300 hover:text-white transition drop-shadow-md"><MoreHorizontal size={20} /></button>
                 <button onClick={() => navigate('/now-playing')} className="text-zinc-300 hover:text-white transition drop-shadow-md" title="Mở rộng chế độ xem Đang phát">
                    <Maximize2 size={20} />
                 </button>
                 <button className="text-zinc-300 hover:text-white transition drop-shadow-md"><X size={20} /></button>
               </div>
             </div>

             {/* Overlaid Title and Action Buttons */}
             <div className="w-full p-4 flex items-end justify-between pointer-events-auto">
                <div className="flex flex-col overflow-hidden mr-2">
                  <h2 className="text-[24px] leading-[28.8px] font-bold text-white mb-1 hover:underline cursor-pointer truncate drop-shadow-lg">{currentMedia.title}</h2>
                  <div className="flex items-center gap-1">
                      <p 
                        className="text-zinc-200 font-medium hover:underline cursor-pointer text-[16px] leading-[22.4px] truncate drop-shadow-md"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentMedia?.artistId) navigate(`/artist/${currentMedia.artistId}`);
                        }}
                      >
                        {(currentMedia as any).artist?.name || currentMedia.artistName || currentMedia.description || 'Unknown Artist'}
                      </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0 pb-1">
                   {/* Share Button */}
                   <button 
                      onClick={() => setShowShareModal(true)}
                      className="text-zinc-200 hover:text-white hover:scale-105 transition" 
                      title="Chia sẻ"
                   >
                       <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12M8 7l4-4 4 4M20 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                   </button>
                   
                   {/* Add to Playlist / Liked Button */}
                   <button 
                      onClick={toggleFavorite}
                      className="text-zinc-200 hover:text-white hover:scale-105 transition" 
                      title={isFavorited ? "Đã thêm vào Bài hát đã thích" : "Thêm vào danh sách phát"}
                   >
                      {isFavorited ? (
                         <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="#1ed760"><path d="M12 21.922A9.922 9.922 0 1 0 12 2.078a9.922 9.922 0 0 0 0 19.844zM10.74 15.6l-4.14-4.14 1.06-1.06 3.08 3.08 6.42-6.42 1.06 1.06-7.48 7.48z"></path></svg>
                      ) : (
                         <svg role="img" height="24" width="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8M8 12h8" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                      )}
                   </button>
                </div>
             </div>
          </div>

       {/* Rest of the content */}
       <div className="px-4 pb-4 flex flex-col gap-4 bg-zinc-900 flex-1">
          {/* Giới thiệu nghệ sĩ / Info box */}
          <div 
            className="bg-zinc-800/80 hover:bg-zinc-800 transition rounded-xl overflow-hidden relative cursor-pointer flex flex-col shadow-xl"
            onClick={() => currentMedia?.artistId && navigate(`/artist/${currentMedia.artistId}`)}
          >
             {/* Large Cover Image */}
             <div className="h-48 w-full relative">
               <img src={getImageUrl(currentMedia.artistAvatarUrl)} className="w-full h-full object-cover" />
               <div className="absolute top-4 left-4 text-white font-bold text-base shadow-sm z-10">Giới thiệu về nghệ sĩ</div>
             </div>
             
             {/* Content Below Image */}
             <div className="p-4 flex flex-col gap-2 relative">
                {/* Name & Tick */}
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base hover:underline">{(currentMedia as any).artist?.name || currentMedia.artistName || currentMedia.description || 'Unknown Artist'}</h4>
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm" title="Verified Artist">
                    <svg height="10" width="10" viewBox="0 0 24 24" fill="currentColor"><path d="m10.814.5a1.658 1.658 0 0 1 2.372 0l2.512 2.572 3.595-.043a1.658 1.658 0 0 1 1.678 1.678l-.043 3.595 2.572 2.512c.667.65.667 1.722 0 2.372l-2.572 2.512.043 3.595a1.658 1.658 0 0 1-1.678 1.678l-3.595-.043-2.512 2.572a1.658 1.658 0 0 1-2.372 0l-2.512-2.572-3.595.043a1.658 1.658 0 0 1-1.678-1.678l.043-3.595L.5 13.186a1.658 1.658 0 0 1 0-2.372l2.572-2.512-.043-3.595a1.658 1.658 0 0 1 1.678-1.678l3.595.043L10.814.5zm6.584 9.12a1 1 0 0 0-1.414-1.413l-6.011 6.01-1.894-1.893a1 1 0 0 0-1.414 1.414l3.308 3.308 7.425-7.425z"></path></svg>
                  </div>
                </div>

                {/* Listeners & Follow Button */}
                <div className="flex items-center justify-between mb-1">
                  <p className="text-zinc-300 text-sm drop-shadow-md">86.906.547 người nghe hằng tháng</p>
                  {currentMedia?.artistId && (
                    <button 
                      onClick={handleToggleFollowArtist}
                      disabled={loadingFollow}
                      className={`text-xs font-bold border rounded-full px-4 py-1 transition ${
                        isFollowingArtist 
                          ? 'border-white text-white hover:border-zinc-400 hover:text-zinc-400' 
                          : 'border-zinc-400 text-white hover:border-white hover:scale-105'
                      }`}
                    >
                      {loadingFollow ? '...' : (isFollowingArtist ? 'Đang theo dõi' : 'Theo dõi')}
                    </button>
                  )}
                </div>

                {/* Bio */}
                <p className="text-sm text-zinc-300 line-clamp-3 drop-shadow-md">
                  {currentMedia.artistBio || "Chưa có thông tin giới thiệu về nghệ sĩ này."}
                </p>
             </div>
          </div>
       </div>
       </div>

      {showShareModal && currentMedia && (
        <ShareMediaModal
          mediaId={currentMedia.id}
          mediaType="Bài hát"
          mediaTitle={currentMedia.title}
          onClose={() => setShowShareModal(false)}
        />
      )}

    </div>
  );
};
