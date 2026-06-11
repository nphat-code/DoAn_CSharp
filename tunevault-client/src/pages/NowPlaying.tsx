import { usePlayer } from '../context/PlayerContext';
import { useNavigate } from 'react-router-dom';
import { Minimize2, MoreHorizontal, User, Music } from 'lucide-react';

export const NowPlaying = () => {
  const { currentMedia, mediaRef } = usePlayer();
  const navigate = useNavigate();

  if (!currentMedia) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#004A4E] text-white">
        <p>Không có bài hát nào đang phát.</p>
        <button onClick={() => navigate(-1)} className="ml-4 underline">Quay lại</button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-black overflow-hidden flex flex-col items-center justify-center">
      
      {/* Background/Video Layer */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        {currentMedia.mediaType === 'Video' ? (
          <video 
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={`http://localhost:5183/api/media/${currentMedia.id}/stream`}
            className="w-full h-full object-contain"
            playsInline
          />
        ) : currentMedia.coverUrl ? (
           <img src={`http://localhost:5183${currentMedia.coverUrl}`} alt="Cover" className="w-full h-full object-contain" />
        ) : (
           <img src="https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62" alt="Cover" className="w-full h-full object-contain" />
        )}
      </div>

      {/* Header Overlay */}
      <div className="absolute top-0 left-0 w-full flex items-center justify-between p-6 z-10 bg-gradient-to-b from-black/80 to-transparent">
        <h2 className="text-white font-bold text-lg hover:underline cursor-pointer drop-shadow-lg">
          {currentMedia.description || "Đang phát"}
        </h2>
        <div className="flex items-center gap-4 text-zinc-300">
          <button className="hover:text-white transition drop-shadow-lg"><Music size={24} /></button>
          <button className="hover:text-white transition drop-shadow-lg"><User size={24} /></button>
          <button className="hover:text-white transition drop-shadow-lg"><MoreHorizontal size={24} /></button>
          <button 
            onClick={() => navigate(-1)} 
            className="hover:text-white transition ml-4 bg-black/40 p-2 rounded-full backdrop-blur-md"
            title="Thu nhỏ"
          >
            <Minimize2 size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
