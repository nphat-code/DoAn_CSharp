import { getImageUrl } from '../utils/imageUrl';
import React, { useEffect, useState } from 'react';
import { shareService } from '../services/shareService';
import type { MediaShareDto } from '../services/shareService';
import { Play, Music, Users, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayer } from '../context/PlayerContext';
import { mediaService } from '../services/mediaService';

export const SharedWithMe: React.FC = () => {
  const [shares, setShares] = useState<MediaShareDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'with-me' | 'by-me'>('with-me');
  const navigate = useNavigate();
  const { playMediaList } = usePlayer();

  useEffect(() => {
    const fetchShares = async () => {
      setLoading(true);
      try {
        const data = activeTab === 'with-me' 
          ? await shareService.getSharedWithMe()
          : await shareService.getSharedByMe();
        setShares(data);
      } catch (error) {
        console.error('Error fetching shared media:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchShares();
  }, [activeTab]);

  const handlePlay = async (share: MediaShareDto) => {
    const type = share.mediaType.toLowerCase();
    if (type === 'playlist' || type === 'album') {
      navigate(`/${type}/${share.mediaItemId}`);
    } else {
      try {
        const allMedia = await mediaService.getAllMedia();
        const trackToPlay = allMedia.find(m => m.id === share.mediaItemId);
        if (trackToPlay) {
          playMediaList([trackToPlay], 0);
        } else {
          alert("Không tìm thấy bài hát. Có thể nó đã bị xóa.");
        }
      } catch (err) {
        console.error("Lỗi phát nhạc:", err);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-6 mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Users className="text-spotify-green" size={32} />
          Trung tâm chia sẻ
        </h1>
        
        <div className="flex items-center gap-4 border-b border-white/10 pb-1">
          <button 
            onClick={() => setActiveTab('with-me')}
            className={`pb-2 px-2 font-bold transition-all ${activeTab === 'with-me' ? 'text-spotify-green border-b-2 border-spotify-green' : 'text-zinc-400 hover:text-white'}`}
          >
            Được chia sẻ với tôi
          </button>
          <button 
            onClick={() => setActiveTab('by-me')}
            className={`pb-2 px-2 font-bold transition-all ${activeTab === 'by-me' ? 'text-spotify-green border-b-2 border-spotify-green' : 'text-zinc-400 hover:text-white'}`}
          >
            Tôi đã chia sẻ
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-6 text-white text-center">Đang tải...</div>
      ) : shares.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Music size={64} className="text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Chưa có gì ở đây</h2>
          <p className="text-zinc-400 max-w-sm">
            {activeTab === 'with-me' 
              ? 'Hiện tại chưa có ai chia sẻ bài hát hoặc danh sách phát nào với bạn.'
              : 'Bạn chưa chia sẻ bài hát hay danh sách phát nào cho ai cả.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
          {shares.map(share => (
            <div key={share.id} className="bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition group cursor-pointer" onClick={() => handlePlay(share)}>
              <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-3">
                {share.senderAvatarUrl ? (
                  <img src={getImageUrl(share.senderAvatarUrl)} className="w-8 h-8 rounded-full object-cover" alt="" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                    {share.senderName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs text-zinc-400">
                    {activeTab === 'with-me' ? 'Được chia sẻ bởi' : 'Đã chia sẻ cho'}
                  </p>
                  <p className="text-sm font-bold text-white">{share.senderName}</p>
                </div>
              </div>

              <div className="relative aspect-square w-full mb-4 shadow-lg rounded-md overflow-hidden bg-zinc-800">
                {share.mediaCoverUrl ? (
                  <img src={getImageUrl(share.mediaCoverUrl)} className="w-full h-full object-cover" alt="" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <Music size={48} />
                  </div>
                )}
                <div className="absolute right-2 bottom-2 w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center text-black opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-xl z-10">
                  <Play size={24} className="ml-1 fill-black" />
                </div>
              </div>

              <h3 className="font-bold text-white mb-1 truncate text-lg">{share.mediaTitle}</h3>
              <p className="text-sm text-zinc-400 mb-3 capitalize">{share.mediaType}</p>

              {share.message && (
                <div className="bg-white/5 rounded-md p-3 flex items-start gap-2 mt-2">
                  <MessageCircle size={14} className="text-spotify-green mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-zinc-300 italic line-clamp-2">"{share.message}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
