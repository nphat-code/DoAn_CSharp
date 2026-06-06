import { usePlayer } from '../context/PlayerContext';
import { MoreHorizontal, X, Trash2 } from 'lucide-react';
import { mediaService } from '../services/mediaService';

export const RightPanel = () => {
  const { currentMedia, mediaRef } = usePlayer();

  if (!currentMedia) {
    return (
      <div className="w-[300px] lg:w-[350px] bg-zinc-900 rounded-lg hidden xl:flex flex-col p-4 items-center justify-center text-zinc-500 font-medium">
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

  return (
    <div className="w-[300px] lg:w-[350px] bg-zinc-900 rounded-lg hidden xl:flex flex-col overflow-hidden relative">
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
            <p className="text-zinc-400 font-medium hover:underline cursor-pointer inline-block text-base">James Arthur</p>
          </div>
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-black mt-1 shadow-sm" title="Verified Artist">
            <svg height="16" width="16" viewBox="0 0 24 24" fill="currentColor"><path d="m10.814.5a1.658 1.658 0 0 1 2.372 0l2.512 2.572 3.595-.043a1.658 1.658 0 0 1 1.678 1.678l-.043 3.595 2.572 2.512c.667.65.667 1.722 0 2.372l-2.572 2.512.043 3.595a1.658 1.658 0 0 1-1.678 1.678l-3.595-.043-2.512 2.572a1.658 1.658 0 0 1-2.372 0l-2.512-2.572-3.595.043a1.658 1.658 0 0 1-1.678-1.678l.043-3.595L.5 13.186a1.658 1.658 0 0 1 0-2.372l2.572-2.512-.043-3.595a1.658 1.658 0 0 1 1.678-1.678l3.595.043L10.814.5zm6.584 9.12a1 1 0 0 0-1.414-1.413l-6.011 6.01-1.894-1.893a1 1 0 0 0-1.414 1.414l3.308 3.308 7.425-7.425z"></path></svg>
          </div>
        </div>

        {/* Giới thiệu nghệ sĩ / Info box */}
        <div className="bg-zinc-800 rounded-lg overflow-hidden relative group cursor-pointer">
           <div className="h-24 bg-zinc-700 w-full relative">
             <img src="https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62" className="w-full h-full object-cover blur-sm opacity-50" />
             <div className="absolute top-3 left-4 text-white font-bold text-base shadow-sm">Giới thiệu về nghệ sĩ</div>
           </div>
           <div className="p-4 pt-10 relative">
              <div className="absolute -top-10 left-4 w-16 h-16 rounded-full bg-zinc-600 shadow-xl overflow-hidden border-2 border-zinc-800">
                <img src="https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62" className="w-full h-full object-cover" />
              </div>
              <h4 className="font-bold text-white text-base hover:underline">James Arthur</h4>
              <p className="text-zinc-400 text-sm mt-1 mb-3">12,345,678 người nghe hàng tháng</p>
              <p className="text-sm text-zinc-300 font-medium line-clamp-3">
                James Andrew Arthur là một ca sĩ và nhạc sĩ người Anh. Anh trở nên nổi tiếng sau khi giành chiến thắng trong loạt phim thứ chín của The X Factor vào năm 2012...
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
