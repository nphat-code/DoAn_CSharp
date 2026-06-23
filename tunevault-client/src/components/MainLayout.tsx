import { useState, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { TopBar } from './TopBar';
import { RightPanel } from './RightPanel';
import { PlayerProvider, usePlayer } from '../context/PlayerContext';
import { NotificationProvider } from '../context/NotificationContext';
import { NowPlayingOverlay } from '../pages/NowPlaying';

export const MainLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [rightPanelWidth, setRightPanelWidth] = useState(420);
  
  const scrollRef = useRef<HTMLElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current && gradientRef.current) {
      gradientRef.current.style.transform = `translateY(-${scrollRef.current.scrollTop}px)`;
    }
  };

  const startResizeSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(200, startWidth + (moveEvent.clientX - startX)), 420);
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const startResizeRightPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(250, startWidth - (moveEvent.clientX - startX)), 420);
      setRightPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  return (
    <NotificationProvider>
      <PlayerProvider>
        {/* Nền đen toàn cục, áp dụng gap-2 cho toàn bộ giao diện */}
        <div className="h-screen w-full min-w-[900px] flex flex-col bg-spotify-base p-2 gap-2 text-white font-sans select-none overflow-x-auto">
          <TopBar />
          
          {/* Vùng thân gồm Sidebar - MainContent - RightPanel */}
          <div className="flex-1 flex overflow-hidden relative">
            <Sidebar 
              isCollapsed={isSidebarCollapsed} 
              onToggleCollapse={() => {
                setIsSidebarCollapsed(!isSidebarCollapsed);
                if (isSidebarExpanded) setIsSidebarExpanded(false);
              }}
              isExpanded={isSidebarExpanded}
              onToggleExpand={() => {
                setIsSidebarExpanded(!isSidebarExpanded);
                if (isSidebarCollapsed) setIsSidebarCollapsed(false);
              }}
              width={isSidebarExpanded ? undefined : sidebarWidth} 
            />
            
            {/* Resizer Sidebar */}
            {!isSidebarCollapsed && !isSidebarExpanded && (
              <div 
                onMouseDown={startResizeSidebar}
                className="w-2 cursor-col-resize z-50 flex-shrink-0 bg-transparent"
                title="Kéo để thay đổi kích thước"
              />
            )}
            
            <div 
              className={`bg-spotify-card rounded-lg overflow-hidden relative shadow-2xl transition-all duration-300 ${isSidebarExpanded ? 'w-0 opacity-0 min-w-0 p-0 m-0 border-none flex-none' : 'flex-1 min-w-[300px]'}`}
            >
              {isHome && (
                <div 
                  ref={gradientRef}
                  className="absolute top-0 left-0 w-full pointer-events-none z-0"
                  style={{
                    height: '320px',
                    backgroundImage: 'linear-gradient(to bottom, rgba(79, 70, 229, 0.8) 0%, transparent 100%)'
                  }}
                />
              )}

              <main 
                ref={scrollRef}
                id="main-scroll-container"
                onScroll={handleScroll}
                className="w-full h-full relative z-10 overflow-x-hidden overflow-y-auto scrollbar-hide"
                style={{ containerType: 'inline-size' }}
              >
                
               <div className="relative z-10 h-full">
                  <Outlet />
               </div>
              </main>
            </div>

            {/* Resizer RightPanel */}
            <div 
              onMouseDown={startResizeRightPanel}
              className="w-2 cursor-col-resize z-50 flex-shrink-0 bg-transparent"
              title="Kéo để thay đổi kích thước"
            />

            <RightPanel width={rightPanelWidth} />

            {/* Now Playing Overlay rendered unconditionally (it hides itself if not expanded) */}
            <NowPlayingOverlay />
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
