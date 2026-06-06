import { Home, Search, Bell, Download, User } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export const TopBar = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim() !== '') {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-2">
      {/* Logo */}
      <div className="w-1/4">
        <div className="text-2xl font-bold tracking-tighter text-white cursor-pointer">TuneVault</div>
      </div>

      {/* Center Controls (Home + Search) */}
      <div className="flex-1 flex items-center justify-center gap-2 max-w-2xl">
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
      <div className="flex shrink-0 items-center justify-end gap-4 relative">
        <button className="bg-white text-black text-sm font-bold px-4 py-1.5 rounded-full hover:scale-105 transition whitespace-nowrap hidden lg:block">
          Khám phá Premium
        </button>
        <button className="flex items-center gap-1 text-sm font-bold text-zinc-300 hover:text-white transition whitespace-nowrap hidden lg:flex">
          <Download size={16} />
          Cài đặt ứng dụng
        </button>
        <button className="text-zinc-400 hover:text-white transition">
          <Bell size={20} />
        </button>
        
        {/* User Profile Dropdown */}
        <div className="relative group">
          <button className="w-8 h-8 rounded-full bg-zinc-800 border-2 border-transparent hover:border-zinc-500 flex items-center justify-center cursor-pointer transition focus:outline-none">
             <User size={18} className="text-white" />
          </button>
          
          <div className="absolute right-0 mt-2 w-48 bg-zinc-800 rounded-md shadow-lg py-1 hidden group-focus-within:block group-hover:block z-50">
            <NavLink to="/profile" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white">Hồ sơ</NavLink>
            <a href="#" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white flex justify-between">Tài khoản <span className="text-xs">↗</span></a>
            <a href="#" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white flex justify-between">Nâng cấp lên Premium <span className="text-xs">↗</span></a>
            <a href="#" className="block px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700 hover:text-white">Cài đặt</a>
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
        </div>
      </div>
    </header>
  );
};
