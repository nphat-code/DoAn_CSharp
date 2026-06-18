import React, { useState, useEffect } from 'react';
import { X, Search, Check } from 'lucide-react';
import { shareService } from '../services/shareService';
import { profileService } from '../services/profileService';
import type { ProfileDto } from '../services/profileService';

interface ShareMediaModalProps {
  mediaId: string;
  mediaType: string;
  mediaTitle: string;
  onClose: () => void;
}

export const ShareMediaModal: React.FC<ShareMediaModalProps> = ({ mediaId, mediaType, mediaTitle, onClose }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<ProfileDto[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }
      setIsSearching(true);
      try {
        const result = await profileService.searchUsers(query);
        setUsers(result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    };
    const debounceTimeout = setTimeout(doSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  const handleShare = async () => {
    if (!selectedUserId) return;
    
    setIsSharing(true);
    try {
      await shareService.shareMedia({
        receiverId: selectedUserId,
        mediaId: mediaId,
        message: message.trim() || `Tôi muốn chia sẻ ${mediaType} "${mediaTitle}" với bạn!`
      });
      setSuccessMsg('Chia sẻ thành công!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error(error);
      alert('Đã có lỗi xảy ra khi chia sẻ!');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
      <div className="bg-[#282828] rounded-xl p-6 w-full max-w-md flex flex-col shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
        >
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-white mb-2">Chia sẻ đến...</h2>
        <p className="text-sm text-zinc-400 mb-4 truncate">Bạn đang chia sẻ {mediaType === 'Playlist' ? 'Playlist' : 'Bài hát'}: <strong className="text-white">{mediaTitle}</strong></p>
        
        {successMsg ? (
          <div className="py-12 flex flex-col items-center justify-center text-green-500 gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check size={32} />
            </div>
            <p className="text-lg font-bold">{successMsg}</p>
          </div>
        ) : (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm người dùng..."
                className="w-full bg-white/10 text-white text-sm rounded-md py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-white/20 transition placeholder-zinc-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto max-h-[250px] custom-scrollbar mb-4 bg-black/20 rounded-md border border-white/5 p-2">
              {isSearching ? (
                <div className="text-center text-zinc-400 text-sm py-8">Đang tìm...</div>
              ) : users.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {users.map(u => (
                    <div 
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${selectedUserId === u.id ? 'bg-spotify-green/20 border border-spotify-green/50' : 'hover:bg-white/10 border border-transparent'}`}
                    >
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl.startsWith('http') ? u.avatarUrl : u.avatarUrl?.startsWith('http') ? u.avatarUrl : `https://tunevault-api.onrender.com${u.avatarUrl}`} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-bold uppercase">
                          {u.username.charAt(0)}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">{u.username}</span>
                        <span className="text-zinc-400 text-xs truncate max-w-[200px]">{u.email}</span>
                      </div>
                      {selectedUserId === u.id && (
                        <Check size={16} className="text-spotify-green ml-auto" />
                      )}
                    </div>
                  ))}
                </div>
              ) : query.trim() !== '' ? (
                <div className="text-center text-zinc-400 text-sm py-8">Không tìm thấy người dùng</div>
              ) : (
                <div className="text-center text-zinc-500 text-sm py-8">Hãy nhập tên người dùng để tìm kiếm</div>
              )}
            </div>

            <div className="mb-6">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 block">Lời nhắn (tuỳ chọn)</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Thêm lời nhắn..."
                className="w-full bg-white/10 text-white text-sm rounded-md p-3 outline-none focus:ring-2 focus:ring-white/20 transition resize-none h-20 placeholder-zinc-500"
              />
            </div>

            <button 
              disabled={!selectedUserId || isSharing}
              onClick={handleShare}
              className="w-full bg-spotify-green hover:bg-spotify-lightgreen text-black font-bold py-3 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
