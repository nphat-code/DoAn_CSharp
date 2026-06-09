import { usePlayer } from '../context/PlayerContext';
import { MoreHorizontal, X, Trash2 } from 'lucide-react';
import { mediaService } from '../services/mediaService';

export const RightPanel = () => {
  const { currentMedia, mediaRef } = usePlayer();

  if (!currentMedia) {
    return (
      <div className="w-[360px] lg:w-[420px] bg-zinc-900 rounded-lg hidden xl:flex flex-col p-4 items-center justify-center text-zinc-500 font-medium">
        Phát một bài hát để xem chi tiết
      </div>
    );
  }

  const handleDeleteMedia = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa bài này vĩnh viễn khỏi hệ thống không? Hành động này không thể hoàn tác.")) {
      try {
        await mediaService.deleteMedia(currentMedia.id);
        alert("Đã xóa bài hát thành công!");
        window.location.reload(); // Tải lại trang để cập nhật danh sách
      } catch (error) {
        alert("Lỗi khi xóa. Bạn chỉ có thể xóa bài hát do chính mình tải lên.");
      }
    }
  };

  const currentUserStr = localStorage.getItem('user');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
  const isUploader = currentUser && currentMedia.uploaderId === currentUser.userId;

  const getImageUrl = (url: string | undefined | null) => {
    if (!url) return "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62"; // Fallback Ed Sheeran image
    if (url.startsWith('http')) return url;
    return `http://localhost:5183${url}`;
  };

  return (
    <div className="w-[360px] lg:w-[420px] bg-zinc-900 rounded-lg hidden xl:flex flex-col overflow-hidden relative">
      <div className="flex items-center justify-between p-4 pb-2 z-10">
        <h3 className="font-bold text-base text-white hover:underline cursor-pointer truncate mr-2">{currentMedia.title}</h3>
        <div className="flex gap-3">
          {isUploader && (
            <button onClick={handleDeleteMedia} className="text-zinc-400 hover:text-red-500 transition" title="Xóa bài hát này">
               <Trash2 size={20} />
            </button>
          )}
          <button className="text-zinc-400 hover:text-white transition"><MoreHorizontal size={20} /></button>
          <button className="text-zinc-400 hover:text-white transition"><X size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Cover Image or Video */}
        <div className="w-full aspect-square bg-zinc-800 rounded-lg shadow-2xl mb-4 overflow-hidden relative flex items-center justify-center">
           {currentMedia.mediaType === 'Video' ? (
             <video 
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={`http://localhost:5183/api/media/${currentMedia.id}/stream`}
                className="w-full h-full object-contain bg-black"
                playsInline
             />
           ) : (
             <img src="https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62" alt="Cover" className="w-full h-full object-cover" />
           )}
        </div>
        
        {/* Title and Artist */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white mb-1 leading-tight hover:underline cursor-pointer">{currentMedia.title}</h2>
            <p className="text-zinc-400 font-medium hover:underline cursor-pointer inline-block text-base">{currentMedia.artistName || currentMedia.description || 'Unknown Artist'}</p>
          </div>
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-black mt-1 shadow-sm" title="Verified Artist">
            <svg height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="m10.814.5a1.658 1.658 0 0 1 2.372 0l2.512 2.572 3.595-.043a1.658 1.658 0 0 1 1.678 1.678l-.043 3.595 2.572 2.512c.667.65.667 1.722 0 2.372l-2.572 2.512.043 3.595a1.658 1.658 0 0 1-1.678 1.678l-3.595-.043-2.512 2.572a1.658 1.658 0 0 1-2.372 0l-2.512-2.572-3.595.043a1.658 1.658 0 0 1-1.678-1.678l.043-3.595L.5 13.186a1.658 1.658 0 0 1 0-2.372l2.572-2.512-.043-3.595a1.658 1.658 0 0 1 1.678-1.678l3.595.043L10.814.5zm6.584 9.12a1 1 0 0 0-1.414-1.413l-6.011 6.01-1.894-1.893a1 1 0 0 0-1.414 1.414l3.308 3.308 7.425-7.425z"></path></svg>
          </div>
        </div>

          {/* Giới thiệu nghệ sĩ / Info box */}
          <div className="bg-zinc-800 hover:bg-zinc-700 transition rounded-lg overflow-hidden relative cursor-pointer flex flex-col">
             {/* Large Cover Image */}
             <div className="h-48 w-full relative">
               <img src={getImageUrl(currentMedia.artistAvatarUrl)} className="w-full h-full object-cover" />
               <div className="absolute top-4 left-4 text-white font-bold text-base shadow-sm z-10">Giới thiệu về nghệ sĩ</div>
             </div>
             
             {/* Content Below Image */}
             <div className="p-4 flex flex-col gap-2 relative">
                {/* Name & Tick */}
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-base hover:underline">{currentMedia.artistName || currentMedia.description || 'Unknown Artist'}</h4>
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-sm" title="Verified Artist">
                    <svg height="10" width="10" viewBox="0 0 24 24" fill="currentColor"><path d="m10.814.5a1.658 1.658 0 0 1 2.372 0l2.512 2.572 3.595-.043a1.658 1.658 0 0 1 1.678 1.678l-.043 3.595 2.572 2.512c.667.65.667 1.722 0 2.372l-2.572 2.512.043 3.595a1.658 1.658 0 0 1-1.678 1.678l-3.595-.043-2.512 2.572a1.658 1.658 0 0 1-2.372 0l-2.512-2.572-3.595.043a1.658 1.658 0 0 1-1.678-1.678l.043-3.595L.5 13.186a1.658 1.658 0 0 1 0-2.372l2.572-2.512-.043-3.595a1.658 1.658 0 0 1 1.678-1.678l3.595.043L10.814.5zm6.584 9.12a1 1 0 0 0-1.414-1.413l-6.011 6.01-1.894-1.893a1 1 0 0 0-1.414 1.414l3.308 3.308 7.425-7.425z"></path></svg>
                  </div>
                </div>

                {/* Listeners & Follow Button */}
                <div className="flex items-center justify-between mb-1">
                  <p className="text-zinc-400 text-sm">86.906.547 người nghe hằng tháng</p>
                  <button className="text-white text-xs font-bold border border-zinc-500 rounded-full px-4 py-1 hover:border-white hover:scale-105 transition">
                    Theo dõi
                  </button>
                </div>

                {/* Bio */}
                <p className="text-sm text-zinc-400 line-clamp-3">
                  {currentMedia.artistBio || "Chưa có thông tin giới thiệu về nghệ sĩ này."}
                </p>
             </div>
          </div>
      </div>
    </div>
  );
};
