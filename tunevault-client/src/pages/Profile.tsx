import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileService, type ProfileDto } from '../services/profileService';
import { playlistService, type PlaylistDto } from '../services/playlistService';
import { mediaService } from '../services/mediaService';
import type { MediaItemDto } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { Settings, MoreHorizontal, Play, Edit2, X, Pencil, Link as LinkIcon } from 'lucide-react';

export const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileDto | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [bioInput, setBioInput] = useState('');
  const [topTracks, setTopTracks] = useState<MediaItemDto[]>([]);
  const [topArtists, setTopArtists] = useState<{ name: string, avatarUrl: string }[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { playMedia } = usePlayer();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await profileService.getProfile();
      setProfile(data);
      setAvatarUrlInput(data.avatarUrl || '');
      setUsernameInput(data.username || '');
      setBioInput(data.bio || '');

      const userPlaylists = await playlistService.getUserPlaylists();
      setPlaylists(userPlaylists);

      const allMedia = await mediaService.getAllMedia();
      setTopTracks(allMedia.slice(0, 4));

      const artistsMap = new Map();
      allMedia.forEach(m => {
        if (m.artistName && !artistsMap.has(m.artistName)) {
          artistsMap.set(m.artistName, m.artistAvatarUrl || "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62");
        }
      });
      setTopArtists(Array.from(artistsMap.entries()).map(([name, avatarUrl]) => ({ name, avatarUrl })).slice(0, 4));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveProfile = async () => {
    try {
      await profileService.updateProfile({ username: usernameInput, avatarUrl: avatarUrlInput, bio: bioInput });
      setProfile(prev => prev ? { ...prev, username: usernameInput, avatarUrl: avatarUrlInput, bio: bioInput } : null);

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.username = usernameInput;
        user.avatarUrl = avatarUrlInput;
        user.bio = bioInput;
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('userUpdated'));
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ:", error);
      alert("Cập nhật hồ sơ thất bại!");
    }
  };

  const formatDuration = (timeString: string | undefined) => {
    if (!timeString) return "0:00";
    if (timeString.includes(":")) {
      const parts = timeString.split(":");
      if (parts.length >= 2) {
        const min = parseInt(parts[1], 10);
        const sec = parseFloat(parts[2] || "0");
        return `${min}:${Math.floor(sec).toString().padStart(2, '0')}`;
      }
    }
    return timeString;
  };

  if (loading) return <div className="text-zinc-400 p-8 h-full bg-[#121212]">Đang tải thông tin...</div>;
  if (!profile) return <div className="text-zinc-400 p-8 h-full bg-[#121212]">Không thể tải thông tin cá nhân.</div>;

  return (
    <div className="flex flex-col h-full bg-[#121212] overflow-y-auto">
      {/* Header */}
      <div
        className="flex flex-col md:flex-row items-end gap-6 px-6 pb-6 bg-gradient-to-b from-[#535353] to-[#181818] text-white shrink-0 relative z-10"
        style={{ height: 'clamp(225.9px, 30cqw, 380px)', minHeight: '225.9px' }}
      >

        {/* Avatar */}
        <div
          className="rounded-full overflow-hidden shadow-[0_4px_60px_rgba(0,0,0,0.5)] relative group flex-shrink-0 bg-[#282828]"
          style={{ width: 'clamp(150px, 22cqw, 230px)', height: 'clamp(150px, 22cqw, 230px)' }}
        >
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl.startsWith('http') || profile.avatarUrl.startsWith('data:') ? profile.avatarUrl : profile.avatarUrl?.startsWith('http') ? profile.avatarUrl : `https://tunevault-api.onrender.com${profile.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-zinc-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 md:w-20 md:h-20 opacity-50">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                </svg>
              </span>
            </div>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="text-white w-6 h-6 md:w-8 md:h-8 mb-1" />
            <span className="text-white font-semibold text-[10px] md:text-xs">Chọn ảnh</span>
          </button>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center min-w-0 flex-1 w-full md:w-auto text-center md:text-left">
          <span className="text-sm font-bold tracking-wider mb-2 hidden md:block">Hồ sơ</span>
          <h1
            className="font-black mb-2 tracking-tighter break-words w-full leading-tight cursor-pointer line-clamp-2"
            style={{ fontSize: 'clamp(48px, 8cqw, 108px)', lineHeight: '1.1' }}
            onClick={() => setIsEditing(true)}
            title="Chỉnh sửa hồ sơ"
          >
            {profile.username}
          </h1>
          {profile.bio && (
            <p className="text-zinc-200 mt-2 text-sm md:text-base font-medium max-w-2xl">
              {profile.bio}
            </p>
          )}
          <div className="flex items-center justify-center md:justify-start text-sm text-zinc-300 font-semibold mt-3">
            <span>{playlists.length} danh sách phát công khai</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 bg-gradient-to-b from-[#181818]/80 to-[#121212] flex-1">

        {/* Actions */}
        <div className="flex items-center gap-6 mb-8 text-zinc-400">
          <button className="hover:text-white transition-colors">
            <Settings size={32} />
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`${isMenuOpen ? 'text-white' : ''} hover:text-white transition-colors`}
            >
              <MoreHorizontal size={32} />
            </button>

            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-[#282828] rounded-md shadow-xl py-1 z-50 text-sm font-medium">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-left"
                >
                  <Pencil size={18} />
                  <span>Chỉnh sửa hồ sơ</span>
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    navigator.clipboard.writeText(window.location.href);
                    alert('Đã sao chép đường liên kết!');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-left"
                >
                  <LinkIcon size={18} />
                  <span>Sao chép đường liên kết đến hồ sơ</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nghệ sĩ hàng đầu tháng này */}
        {topArtists.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-1 hover:underline cursor-pointer inline-block">Nghệ sĩ hàng đầu tháng này</h2>
            <p className="text-sm text-zinc-400 mb-6">Chỉ hiển thị với bạn</p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-y-3 -mx-6">
              {topArtists.map((artist, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer flex flex-col items-center overflow-hidden"
                >
                  <div className="relative w-full aspect-square mb-3 shadow-lg rounded-full bg-zinc-800 shrink-0">
                    <img src={artist.avatarUrl.startsWith('http') || artist.avatarUrl.startsWith('data:') ? artist.avatarUrl : artist.avatarUrl?.startsWith('http') ? artist.avatarUrl : `https://tunevault-api.onrender.com${artist.avatarUrl}`} alt={artist.name} className="w-full h-full object-cover rounded-full" />
                    {/* Play button overlay */}
                    <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black hover:bg-green-400 hover:scale-105 shadow-xl">
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full">
                    <h3 className="text-white font-bold truncate w-full text-left">{artist.name}</h3>
                    <p className="text-sm text-zinc-400 truncate w-full text-left mt-1">Nghệ sĩ</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bản nhạc hàng đầu tháng này */}
        {topTracks.length > 0 && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1 hover:underline cursor-pointer inline-block">Bản nhạc hàng đầu tháng này</h2>
                <p className="text-sm text-zinc-400">Chỉ hiển thị với bạn</p>
              </div>
              <button className="text-zinc-400 text-sm font-bold hover:underline">Hiện tất cả</button>
            </div>
            <div className="flex flex-col">
              {topTracks.map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 px-4 py-2 hover:bg-white/10 rounded-md group cursor-pointer"
                  onClick={() => playMedia(track)}
                >
                  <div className="w-6 text-center text-zinc-400 group-hover:hidden">{index + 1}</div>
                  <div className="w-6 text-center text-white hidden group-hover:flex items-center justify-center">
                    <Play size={16} fill="currentColor" />
                  </div>
                  <img
                    src={track.coverUrl ? (track.coverUrl.startsWith('http') || track.coverUrl.startsWith('data:') ? track.coverUrl : track.coverUrl?.startsWith('http') ? track.coverUrl : `https://tunevault-api.onrender.com${track.coverUrl}`) : "https://i.scdn.co/image/ab67616d0000b27341ea2ea7ea8a5be92d3c1f62"}
                    alt={track.title}
                    className="w-10 h-10 rounded shadow"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate group-hover:underline">{track.title}</h4>
                    <p className="text-sm text-zinc-400 truncate hover:underline inline-block">{track.artistName || 'Unknown Artist'}</p>
                  </div>
                  <div className="hidden md:block flex-1 text-sm text-zinc-400 truncate hover:underline">
                    {/* Fake album name if we don't have one */}
                    {track.description || track.title}
                  </div>
                  <div className="text-sm text-zinc-400 w-12 text-right">
                    {formatDuration(track.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Playlists Section */}
        {playlists.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">Playlist Công khai</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {playlists.map(playlist => (
                <div 
                  key={playlist.id} 
                  className="bg-[#181818] p-3 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer flex flex-col items-center overflow-hidden"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="relative w-full aspect-square mb-4 shadow-lg rounded-md bg-zinc-800 shrink-0">
                    {playlist.coverUrl ? (
                      <img src={playlist.coverUrl.startsWith('http') || playlist.coverUrl.startsWith('data:') ? playlist.coverUrl : playlist.coverUrl?.startsWith('http') ? playlist.coverUrl : `https://tunevault-api.onrender.com${playlist.coverUrl}`} alt={playlist.name} className="w-full h-full object-cover rounded-md" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800 rounded-md">
                        <span className="text-4xl text-zinc-500">🎵</span>
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute right-2 bottom-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button 
                        className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-black hover:bg-green-400 hover:scale-105 shadow-xl"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/playlist/${playlist.id}`);
                        }}
                      >
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </button>
                    </div>
                  </div>
                  <div className="w-full">
                    <h3 className="text-white font-bold truncate w-full text-left mb-1">{playlist.name}</h3>
                    <p className="text-sm text-zinc-400 truncate w-full text-left">Của {profile.username}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile Details Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-[#282828] rounded-xl w-full max-w-[500px] relative flex flex-col p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Chi tiết hồ sơ</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="text-zinc-400 hover:text-white transition-colors p-1 bg-transparent hover:bg-white/10 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 mb-4">
              {/* Avatar Box inside modal */}
              <div className="w-40 h-40 rounded-full overflow-hidden shadow-[0_4px_60px_rgba(0,0,0,0.5)] relative group bg-[#181818] flex-shrink-0 mx-auto sm:mx-0">
                {avatarUrlInput ? (
                  <img src={avatarUrlInput.startsWith('http') || avatarUrlInput.startsWith('data:') ? avatarUrlInput : avatarUrlInput?.startsWith('http') ? avatarUrlInput : `https://tunevault-api.onrender.com${avatarUrlInput}`} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-zinc-500">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-20 h-20 opacity-50">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                      </svg>
                    </span>
                  </div>
                )}
                {/* Visual overlay */}
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div
                    className="flex flex-col items-center justify-center cursor-pointer flex-1 w-full pt-2 hover:underline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <span className="text-white font-medium text-sm mb-1">Chọn ảnh</span>
                    <Edit2 className="text-white w-10 h-10" />
                  </div>
                  {avatarUrlInput && (
                    <div
                      className="cursor-pointer pb-4 w-full flex justify-center hover:underline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAvatarUrlInput('');
                      }}
                    >
                      <span className="text-white font-medium text-sm">Xóa ảnh</span>
                    </div>
                  )}
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setAvatarUrlInput(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="relative">
                  <label className="absolute -top-2 left-3 bg-[#282828] px-1 text-xs font-bold text-white z-10">Tên</label>
                  <input
                    type="text"
                    value={usernameInput}
                    onChange={e => setUsernameInput(e.target.value)}
                    className="w-full bg-[#3E3E3E] text-white px-4 py-3 rounded-md focus:outline-none focus:bg-[#4E4E4E] transition-colors font-medium border border-transparent hover:border-zinc-500 relative z-0"
                  />
                </div>

                <div className="relative mt-6">
                  <label className="absolute -top-2 left-3 bg-[#282828] px-1 text-xs font-bold text-white z-10">Tiểu sử</label>
                  <textarea
                    value={bioInput}
                    onChange={e => setBioInput(e.target.value)}
                    rows={3}
                    placeholder="Giới thiệu đôi nét về bạn..."
                    className="w-full bg-[#3E3E3E] text-white px-4 py-3 rounded-md focus:outline-none focus:bg-[#4E4E4E] transition-colors font-medium border border-transparent hover:border-zinc-500 relative z-0 resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleSaveProfile}
                className="bg-white text-black font-bold py-3 px-8 rounded-full hover:scale-105 hover:bg-zinc-100 transition shadow-md"
              >
                Lưu
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-medium mt-6 text-center sm:text-left leading-relaxed">
              Bằng cách tiếp tục, bạn đồng ý cho phép TuneVault truy cập vào hình ảnh bạn đã chọn để tải lên. Vui lòng đảm bảo bạn có quyền tải lên hình ảnh.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

