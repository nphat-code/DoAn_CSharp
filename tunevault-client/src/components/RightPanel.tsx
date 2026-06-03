import { usePlayer } from '../context/PlayerContext';
import { MoreHorizontal, X } from 'lucide-react';

export const RightPanel = () => {
  const { currentMedia } = usePlayer();

  if (!currentMedia) {
    return (
      <div className="w-[300px] lg:w-[350px] bg-zinc-900 rounded-lg hidden xl:flex flex-col p-4 items-center justify-center text-zinc-500 font-medium">
        Phát một bài hát để xem chi tiết
      </div>
    );
  }

  return (
    <div className="w-[300px] lg:w-[350px] bg-zinc-900 rounded-lg hidden xl:flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-4 pb-2">
        <h3 className="font-bold text-base text-white">Đang phát</h3>
        <div className="flex gap-2">
          <button className="text-zinc-400 hover:text-white transition"><MoreHorizontal size={20} /></button>
          <button className="text-zinc-400 hover:text-white transition"><X size={20} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pt-2">
        <div className="w-full aspect-square bg-zinc-800 rounded-lg shadow-xl mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-1 leading-tight">{currentMedia.title}</h2>
        <p className="text-zinc-400 font-medium mb-6 hover:underline cursor-pointer inline-block">Tên Nghệ Sĩ</p>

        {/* Giới thiệu nghệ sĩ / Info box */}
        <div className="bg-zinc-800/80 rounded-lg p-4 mb-4">
           <h4 className="font-bold text-white mb-3">Giới thiệu về nghệ sĩ</h4>
           <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-zinc-700 shadow-md"></div>
              <span className="font-semibold text-white hover:underline cursor-pointer">Tên Nghệ Sĩ</span>
           </div>
           <p className="text-sm text-zinc-400 font-medium line-clamp-3">
             Thông tin mô tả về nghệ sĩ tham gia thực hiện bài hát này...
           </p>
        </div>
      </div>
    </div>
  );
};
