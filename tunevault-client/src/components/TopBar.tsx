import { getImageUrl } from '../utils/imageUrl';
import { Search, Bell, User, UserPlus, Upload, Plus, ShieldAlert } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { UploadModal } from './UploadModal';
import { AddArtistModal } from './AddArtistModal';
import { CreateAlbumModal } from './CreateAlbumModal';
import { mediaService } from '../services/mediaService';
import type { SearchResultDto } from '../types';
import { useNotification } from '../context/NotificationContext';

export const TopBar = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isDropdownOpen, setIsDropdownOpen } = useNotification();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddArtistModal, setShowAddArtistModal] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [searchResults, setSearchResults] = useState<SearchResultDto | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const doSearch = async () => {
      if (!query.trim()) {
        setSearchResults(null);
        setShowDropdown(false);
        return;
      }
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const data = await mediaService.searchMedia(query, 1, 5); // Fetch top 5 results
        setSearchResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(doSearch, 300);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

  useEffect(() => {
    const loadUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      }
    };

    loadUser();

    // Lắng nghe sự kiện cập nhật hồ sơ từ Profile.tsx
    window.addEventListener('userUpdated', loadUser);
    return () => window.removeEventListener('userUpdated', loadUser);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      setShowDropdown(false);
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return '';
    // Đổi khoảng trắng thành 'T' để chuẩn format ISO 8601 (C# DateTime thường trả về dấu cách)
    let normalizedDate = dateStr.replace(' ', 'T');
    
    // Đảm bảo chuỗi ngày tháng được hiểu là UTC (thêm 'Z' nếu backend trả về thiếu)
    if (!normalizedDate.endsWith('Z')) {
      normalizedDate = `${normalizedDate}Z`;
    }
    
    const date = new Date(normalizedDate);
    
    // Nếu ngày không hợp lệ, trả về chuỗi gốc
    if (isNaN(date.getTime())) return dateStr;

    const now = new Date();
    
    // Tính toán khoảng thời gian (giây), tránh số âm nếu giờ server hơi lệch
    const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <header className="h-16 flex items-center justify-between -m-2 p-2">
      {/* Logo */}
      <div className="flex-1 min-w-0 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
          <div className="w-4 h-4 bg-black rounded-full" />
        </div>
        <div className="text-2xl font-bold tracking-tighter text-white hidden sm:block">TuneVault</div>
      </div>

      {/* Center Controls (Home + Search) */}
      <div className="flex items-center justify-center gap-2 w-full max-w-xl px-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `w-12 h-12 flex items-center justify-center rounded-full bg-spotify-hover2 hover:scale-105 transition ${isActive ? 'text-white' : 'text-spotify-lighttext'}`
          }
        >
          {({ isActive }) => 
            isActive ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M13.5 1.515a3 3 0 0 0-3 0L3 5.845a2 2 0 0 0-1 1.732V21a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7.577a2 2 0 0 0-1-1.732l-7.5-4.33z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z" />
              </svg>
            )
          }
        </NavLink>
        <div ref={searchContainerRef} className="flex-1 relative flex items-center bg-spotify-hover2 rounded-full h-12 px-4 group hover:bg-spotify-hover2/80 transition focus-within:bg-spotify-hover2 focus-within:ring-2 focus-within:ring-white">
          <Search size={22} className="text-zinc-400 group-focus-within:text-white mr-3" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => {
              if (query.trim() !== '') setShowDropdown(true);
            }}
            onKeyDown={handleSearch}
            placeholder="Bạn muốn phát nội dung gì?" 
            className="bg-transparent border-none outline-none text-white w-full text-base placeholder-zinc-400 font-medium"
          />
          <div className="border-l border-zinc-600 pl-3 ml-2 flex items-center">
            <Search 
               size={20} 
               className="text-zinc-400 hover:text-white cursor-pointer" 
               onClick={() => {
                 if (query.trim() !== '') {
                   setShowDropdown(false);
                   navigate(`/search?q=${encodeURIComponent(query)}`);
                 }
               }}
            />
          </div>
          
          {/* Live Search Dropdown */}
          {showDropdown && query.trim() !== '' && (
            <div className="absolute top-14 left-0 w-full bg-[#282828] rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 flex flex-col max-h-[70vh]">
              {isSearching && !searchResults ? (
                <div className="p-4 text-center text-zinc-400 text-sm">Đang tìm kiếm...</div>
              ) : searchResults ? (
                <div className="overflow-y-auto custom-scrollbar p-2">
                  {/* Tracks */}
                  {searchResults.tracks && searchResults.tracks.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2">Bài hát</h3>
                      <div className="flex flex-col">
                        {searchResults.tracks.slice(0, 3).map(track => (
                          <div 
                            key={track.id} 
                            onClick={() => { setShowDropdown(false); navigate(`/search?q=${encodeURIComponent(track.title)}`); }}
                            className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-md cursor-pointer transition"
                          >
                            <img src={track.coverUrl ? (getImageUrl(track.coverUrl)) : ''} alt="" className="w-10 h-10 object-cover rounded-sm bg-zinc-800" />
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-white text-sm font-medium truncate">{track.title}</span>
                              <span className="text-zinc-400 text-xs truncate">{track.artistName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Artists */}
                  {searchResults.artists && searchResults.artists.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2">Nghệ sĩ</h3>
                      <div className="flex flex-col">
                        {searchResults.artists.slice(0, 3).map(artist => (
                          <div 
                            key={artist.id} 
                            onClick={() => { setShowDropdown(false); navigate(`/search?q=${encodeURIComponent(artist.name)}`); }}
                            className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-md cursor-pointer transition"
                          >
                            <img src={artist.avatarUrl ? (getImageUrl(artist.avatarUrl)) : ''} alt="" className="w-10 h-10 object-cover rounded-full bg-zinc-800" />
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-white text-sm font-medium truncate">{artist.name}</span>
                              <span className="text-zinc-400 text-xs">Nghệ sĩ</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Playlists */}
                  {searchResults.playlists && searchResults.playlists.length > 0 && (
                    <div className="mb-2">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-2 mb-2">Playlist</h3>
                      <div className="flex flex-col">
                        {searchResults.playlists.slice(0, 3).map(playlist => (
                          <div 
                            key={playlist.id} 
                            onClick={() => { setShowDropdown(false); navigate(`/playlist/${playlist.id}`); }}
                            className="flex items-center gap-3 p-2 hover:bg-white/10 rounded-md cursor-pointer transition"
                          >
                            <img src={playlist.coverUrl ? (getImageUrl(playlist.coverUrl)) : ''} alt="" className="w-10 h-10 object-cover rounded-sm bg-zinc-800" />
                            <div className="flex flex-col overflow-hidden">
                              <span className="text-white text-sm font-medium truncate">{playlist.name}</span>
                              <span className="text-zinc-400 text-xs">Playlist</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!searchResults.tracks?.length && !searchResults.artists?.length && !searchResults.playlists?.length) && (
                    <div className="p-4 text-center text-zinc-400 text-sm">Không tìm thấy kết quả phù hợp</div>
                  )}

                  {(searchResults.tracks?.length > 0 || searchResults.artists?.length > 0 || searchResults.playlists?.length > 0) && (
                    <button 
                      onClick={() => { setShowDropdown(false); navigate(`/search?q=${encodeURIComponent(query)}`); }}
                      className="w-full text-center py-3 text-sm font-bold text-white hover:text-white hover:bg-white/5 rounded-b-xl border-t border-white/10 transition mt-2"
                    >
                      Xem tất cả kết quả
                    </button>
                  )}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex-1 flex items-center justify-end gap-4 relative min-w-0">

        {isAuthenticated && user?.role === 'Admin' && (
          <>
            <button 
              onClick={() => setShowAddArtistModal(true)}
              className="flex items-center gap-1 text-sm font-bold text-zinc-300 hover:text-white transition whitespace-nowrap hidden lg:flex"
            >
              <UserPlus size={16} />
              Thêm nghệ sĩ
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowCreateAlbumModal(true)}
                className="hidden md:flex items-center gap-2 bg-zinc-800 text-white px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition hover:bg-zinc-700"
              >
                <Plus size={18} />
                Tạo Album
              </button>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="hidden md:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:scale-105 transition"
              >
                <Upload size={18} />
                Tải lên
              </button>
            </div>
          </>
        )}

        <div className="relative" ref={notificationRef}>
          <button 
            className={`transition relative ${isDropdownOpen ? 'text-white' : 'text-zinc-400 hover:text-white'}`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-4 w-80 bg-zinc-800 rounded-xl shadow-2xl border border-white/10 overflow-hidden z-50 flex flex-col max-h-[400px]">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-white">Thông báo</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAllAsRead()}
                    className="text-xs text-zinc-400 hover:text-white transition"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                )}
              </div>
              <div className="overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-zinc-400 text-sm">
                    Không có thông báo nào
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id}
                      onClick={() => !notif.isRead && markAsRead(notif.id)}
                      className={`p-4 border-b border-white/5 cursor-pointer transition hover:bg-white/5 flex gap-3 ${notif.isRead ? 'opacity-70' : 'bg-white/5'}`}
                    >
                      <div className="mt-1">
                        {notif.type === 'Share' ? (
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Bell size={14} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-spotify-green/20 text-spotify-green flex items-center justify-center">
                            <Bell size={14} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${notif.isRead ? 'text-zinc-300' : 'text-white font-medium'}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-zinc-500 mt-1">
                          {formatRelativeTime(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 rounded-full bg-spotify-green self-center shrink-0"></div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile or Auth Buttons */}
        {isAuthenticated ? (
          <div className="relative group" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-transparent hover:border-zinc-500 flex items-center justify-center cursor-pointer transition focus:outline-none overflow-hidden"
            >
               {user?.avatarUrl ? (
                 <img src={getImageUrl(user.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <User size={18} className="text-white" />
               )}
            </button>
            
            {/* Tooltip */}
            {!isMenuOpen && (
              <div className="absolute -bottom-10 right-0 bg-[#282828] text-white text-sm font-bold px-3 py-1.5 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {user?.username || 'Hồ sơ'}
              </div>
            )}
            
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg py-1 z-50">
                <NavLink to="/profile" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white" onClick={() => setIsMenuOpen(false)}>Hồ sơ</NavLink>
                <NavLink to="/recent-history" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white" onClick={() => setIsMenuOpen(false)}>Gần đây</NavLink>
                {user?.role === 'Admin' && (
                  <NavLink to="/admin" className="block px-4 py-2 text-sm text-red-400 font-bold hover:bg-zinc-700 hover:text-red-300 flex items-center justify-between" onClick={() => setIsMenuOpen(false)}>
                    Quản trị hệ thống
                    <ShieldAlert size={14} />
                  </NavLink>
                )}
                <a href="#" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white flex justify-between" onClick={() => setIsMenuOpen(false)}>Tài khoản <span className="text-xs">↗</span></a>
                <a href="#" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white flex justify-between" onClick={() => setIsMenuOpen(false)}>Nâng cấp lên Premium <span className="text-xs">↗</span></a>
                <a href="#" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white" onClick={() => setIsMenuOpen(false)}>Cài đặt</a>
                <div className="border-t border-zinc-700 my-1"></div>
                <button 
                  onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 ml-4">
            <button 
              onClick={() => navigate('/register')}
              className="text-zinc-400 font-bold hover:text-white hover:scale-105 transition"
            >
              Đăng ký
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="bg-white text-black font-bold px-8 py-3 rounded-full hover:scale-105 transition"
            >
              Đăng nhập
            </button>
          </div>
        )}
      </div>

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            window.dispatchEvent(new Event('mediaUpdated'));
          }}
        />
      )}

      {showAddArtistModal && (
        <AddArtistModal 
          onClose={() => setShowAddArtistModal(false)}
          onSuccess={() => {
            setShowAddArtistModal(false);
            window.dispatchEvent(new Event('mediaUpdated'));
          }}
        />
      )}

      {showCreateAlbumModal && (
        <CreateAlbumModal 
          onClose={() => setShowCreateAlbumModal(false)}
        />
      )}
    </header>
  );
};
