import { Home, Search, Bell, Download, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const TopBar = () => {
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
            `w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800 hover:scale-105 transition ${isActive ? 'text-white' : 'text-zinc-400'}`
          }
        >
          <Home size={24} />
        </NavLink>
        <div className="flex-1 flex items-center bg-zinc-800 rounded-full h-12 px-4 group hover:bg-zinc-700/80 transition focus-within:bg-zinc-800 focus-within:ring-2 focus-within:ring-white">
          <Search size={22} className="text-zinc-400 group-focus-within:text-white mr-3" />
          <input 
            type="text" 
            placeholder="Bạn muốn phát nội dung gì?" 
            className="bg-transparent border-none outline-none text-white w-full text-base placeholder-zinc-400 font-medium"
          />
          <div className="border-l border-zinc-600 pl-3 ml-2 flex items-center">
            <Search size={20} className="text-zinc-400 hover:text-white cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex shrink-0 items-center justify-end gap-4">
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
        <div 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
          className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center cursor-pointer hover:bg-red-500 hover:text-white transition group"
          title="Đăng xuất"
        >
           <User size={18} />
        </div>
      </div>
    </header>
  );
};
