import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { TopBar } from './TopBar';
import { RightPanel } from './RightPanel';
import { PlayerProvider, usePlayer } from '../context/PlayerContext';
import { NotificationProvider } from '../context/NotificationContext';

export const MainLayout = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isProfile = location.pathname.startsWith('/profile');

  return (
    <NotificationProvider>
      <PlayerProvider>
        {/* Nền đen toàn cục, áp dụng gap-2 cho toàn bộ giao diện */}
        <div className="h-screen w-full flex flex-col bg-spotify-base p-2 gap-2 text-white font-sans select-none">
          <TopBar />
          
          {/* Vùng thân gồm Sidebar - MainContent - RightPanel */}
          <div className="flex-1 flex overflow-hidden gap-2">
            <Sidebar isExpanded={isSidebarExpanded} onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)} />
            
            <main className={`${isSidebarExpanded ? 'w-0 opacity-0 p-0 m-0' : 'flex-1'} bg-spotify-card rounded-lg overflow-x-hidden overflow-y-auto relative shadow-2xl transition-all duration-300`}>
                
              {isHome && (
                <>
                  {/* Gradient header background overlay */}
                  <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-800/40 via-spotify-card/80 to-spotify-card pointer-events-none z-0"></div>

                  {/* Header Tabs cho Home */}
                  <div className="sticky top-0 z-20 bg-black/20 backdrop-blur-xl px-6 py-4 flex gap-2 border-b border-transparent">
                    <button className="px-4 py-1.5 bg-white text-black font-semibold text-sm rounded-full transition">Tất cả</button>
                    <button className="px-4 py-1.5 bg-zinc-800/80 text-white hover:bg-zinc-700 font-semibold text-sm rounded-full transition">Nhạc</button>
                    <button className="px-4 py-1.5 bg-zinc-800/80 text-white hover:bg-zinc-700 font-semibold text-sm rounded-full transition">Podcast</button>
                  </div>
                </>
              )}
               
               <div className={`${isProfile ? '' : 'p-6 pt-2'} relative z-10 h-full`}>
                  <Outlet />
               </div>
              </main>

            <RightPanel />
          </div>

          {/* Fixed PlayerBar */}
          <div className="w-full shrink-0 relative z-50">
            <PlayerBar />
          </div>

          {/* Login Modal */}
          <LoginModal />
        </div>
      </PlayerProvider>
    </NotificationProvider>
  );
};

const LoginModal = () => {
  const { showLoginModal, setShowLoginModal } = usePlayer();
  const navigate = useNavigate();
  
  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-zinc-900 rounded-xl p-8 max-w-md w-full flex flex-col items-center animate-in fade-in zoom-in duration-200">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
          <div className="w-8 h-8 bg-black rounded-full" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Bắt đầu nghe bằng tài khoản TuneVault miễn phí</h2>
        <button 
          onClick={() => {
            setShowLoginModal(false);
            navigate('/register');
          }}
          className="w-full bg-white text-black font-bold py-3 rounded-full mt-6 hover:scale-105 transition"
        >
          Đăng ký miễn phí
        </button>
        <button 
          onClick={() => {
            setShowLoginModal(false);
            navigate('/login');
          }}
          className="w-full border border-zinc-500 text-white font-bold py-3 rounded-full mt-3 hover:border-white transition"
        >
          Đăng nhập
        </button>
        <button 
          onClick={() => setShowLoginModal(false)}
          className="text-zinc-400 font-bold mt-6 hover:text-white transition"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};
