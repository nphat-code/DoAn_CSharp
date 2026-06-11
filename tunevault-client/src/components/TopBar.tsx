import { Home, Search, Bell, User, UserPlus, Upload, Plus, ShieldAlert } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { UploadModal } from './UploadModal';
import { AddArtistModal } from './AddArtistModal';
import { CreateAlbumModal } from './CreateAlbumModal';

export const TopBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddArtistModal, setShowAddArtistModal] = useState(false);
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="h-16 flex items-center justify-between -m-2 p-2">
      {/* Logo */}
      <div className="flex-1 min-w-0">
        <div className="text-2xl font-bold tracking-tighter text-white cursor-pointer">TuneVault</div>
      </div>

      {/* Center Controls (Home + Search) */}
      <div className="flex items-center justify-center gap-2 w-full max-w-xl px-2">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `w-12 h-12 flex items-center justify-center rounded-full bg-spotify-hover2 hover:scale-105 transition ${isActive ? 'text-white' : 'text-spotify-lighttext'}`
          }
        >
          <Home size={24} />
        </NavLink>
        <div className="flex-1 flex items-center bg-spotify-hover2 rounded-full h-12 px-4 group hover:bg-spotify-hover2/80 transition focus-within:bg-spotify-hover2 focus-within:ring-2 focus-within:ring-white">
          <Search size={22} className="text-zinc-400 group-focus-within:text-white mr-3" />
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Bạn muốn phát nội dung gì?" 
            className="bg-transparent border-none outline-none text-white w-full text-base placeholder-zinc-400 font-medium"
          />
          <div className="border-l border-zinc-600 pl-3 ml-2 flex items-center">
            <Search 
               size={20} 
               className="text-zinc-400 hover:text-white cursor-pointer" 
               onClick={() => {
                 if (query.trim() !== '') navigate(`/search?q=${encodeURIComponent(query)}`);
               }}
            />
          </div>
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

        <button className="text-zinc-400 hover:text-white transition">
          <Bell size={20} />
        </button>
        
        {/* User Profile or Auth Buttons */}
        {isAuthenticated ? (
          <div className="relative group" ref={menuRef}>
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-transparent hover:border-zinc-500 flex items-center justify-center cursor-pointer transition focus:outline-none overflow-hidden"
            >
               {user?.avatarUrl ? (
                 <img src={user.avatarUrl.startsWith('http') || user.avatarUrl.startsWith('data:') ? user.avatarUrl : `http://localhost:5183${user.avatarUrl}`} alt="Avatar" className="w-full h-full object-cover" />
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
            window.location.reload(); // Refresh to see newly uploaded media
          }}
        />
      )}

      {showAddArtistModal && (
        <AddArtistModal 
          onClose={() => setShowAddArtistModal(false)}
          onSuccess={() => {
            setShowAddArtistModal(false);
            window.location.reload(); // Refresh to see newly created artist
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
