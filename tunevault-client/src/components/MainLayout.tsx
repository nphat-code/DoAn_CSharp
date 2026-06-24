import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { TopBar } from './TopBar';
import { RightPanel } from './RightPanel';
import { PlayerProvider, usePlayer } from '../context/PlayerContext';
import { NotificationProvider } from '../context/NotificationContext';
import { NowPlayingOverlay } from '../pages/NowPlaying';

export const MainLayout = () => {
  const MIN_SIDEBAR_WIDTH = 280;
  const MIN_RIGHT_PANEL_WIDTH = 280;
  const MIN_CENTER_WIDTH = 450;
  const IDEAL_CENTER_WIDTH = 700;
  const COLLAPSED_SIDEBAR_WIDTH = 72;
  const CRITICAL_WIDTH = MIN_CENTER_WIDTH + MIN_SIDEBAR_WIDTH + MIN_RIGHT_PANEL_WIDTH;

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < CRITICAL_WIDTH);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [preferredSidebarWidth, setPreferredSidebarWidth] = useState(420);
  const [preferredRightPanelWidth, setPreferredRightPanelWidth] = useState(420);

  const [sidebarWidth, setSidebarWidth] = useState(420);
  const [rightPanelWidth, setRightPanelWidth] = useState(420);
  const [isResizing, setIsResizing] = useState(false);
  
  const scrollRef = useRef<HTMLElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const prevWidthRef = useRef(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const currentWindowWidth = windowWidth;

    let willBeCollapsed = isSidebarCollapsed;
    if (currentWindowWidth < CRITICAL_WIDTH && prevWidthRef.current >= CRITICAL_WIDTH) {
      setIsSidebarCollapsed(true);
      willBeCollapsed = true;
    } else if (currentWindowWidth >= CRITICAL_WIDTH && prevWidthRef.current < CRITICAL_WIDTH) {
      setIsSidebarCollapsed(false);
      willBeCollapsed = false;
    }

    if (willBeCollapsed) {
      const availableForRight = currentWindowWidth - MIN_CENTER_WIDTH - COLLAPSED_SIDEBAR_WIDTH;
      setSidebarWidth(MIN_SIDEBAR_WIDTH);
      setRightPanelWidth(Math.max(MIN_RIGHT_PANEL_WIDTH, Math.min(preferredRightPanelWidth, availableForRight)));
    } else {
      let availableSides = currentWindowWidth - IDEAL_CENTER_WIDTH;
      if (availableSides >= preferredSidebarWidth + preferredRightPanelWidth) {
        setSidebarWidth(preferredSidebarWidth);
        setRightPanelWidth(preferredRightPanelWidth);
      } else {
        const totalPref = preferredSidebarWidth + preferredRightPanelWidth;
        let newSw = (preferredSidebarWidth / totalPref) * availableSides;
        let newRw = (preferredRightPanelWidth / totalPref) * availableSides;

        if (newSw < MIN_SIDEBAR_WIDTH) newSw = MIN_SIDEBAR_WIDTH;
        if (newRw < MIN_RIGHT_PANEL_WIDTH) newRw = MIN_RIGHT_PANEL_WIDTH;

        setSidebarWidth(newSw);
        setRightPanelWidth(newRw);
      }
    }
    
    prevWidthRef.current = currentWindowWidth;
  }, [windowWidth, preferredSidebarWidth, preferredRightPanelWidth, isSidebarCollapsed]);

  useEffect(() => {
    if (isSidebarExpanded) {
      setIsSidebarExpanded(false);
    }
  }, [location.pathname]);

  const handleScroll = () => {
    if (scrollRef.current && gradientRef.current) {
      gradientRef.current.style.transform = `translateY(-${scrollRef.current.scrollTop}px)`;
    }
  };

  const startResizeSidebar = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = preferredSidebarWidth;
    setIsResizing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(MIN_SIDEBAR_WIDTH, startWidth + (moveEvent.clientX - startX)), 500);
      setPreferredSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      setIsResizing(false);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    document.body.style.cursor = 'col-resize';
  };

  const startResizeRightPanel = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = preferredRightPanelWidth;
    setIsResizing(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const newWidth = Math.min(Math.max(MIN_RIGHT_PANEL_WIDTH, startWidth - (moveEvent.clientX - startX)), 500);
      setPreferredRightPanelWidth(newWidth);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = 'default';
      setIsResizing(false);
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
            {/* Wrapper cho Sidebar để xử lý hiệu ứng mở rộng (overlay lên trên MainContent) */}
            <div 
              className={`${isResizing ? '' : 'transition-all duration-300'} flex-shrink-0 overflow-hidden ${isSidebarExpanded ? 'absolute top-0 bottom-0 left-0 z-40' : 'relative h-full'}`}
              style={{ 
                width: isSidebarExpanded ? `calc(100% - ${rightPanelWidth}px - 8px)` : (isSidebarCollapsed ? '72px' : `${sidebarWidth}px`),
                minWidth: isSidebarCollapsed ? '72px' : '280px'
              }}
            >
              <div 
                className="h-full"
                style={isSidebarExpanded ? { width: `calc(100vw - ${rightPanelWidth + 24}px)` } : { width: '100%' }}
              >
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
                />
              </div>
            </div>

            {/* Placeholder giữ chỗ khi Sidebar thành absolute để không làm co giật layout */}
            {isSidebarExpanded && (
              <div 
                className="flex-none transition-all duration-300"
                style={{ width: isSidebarCollapsed ? '72px' : `${sidebarWidth}px` }}
              />
            )}
            
            {/* Resizer Sidebar */}
            {!isSidebarCollapsed && !isSidebarExpanded && (
              <div 
                onMouseDown={startResizeSidebar}
                className="w-2 cursor-col-resize z-50 flex-shrink-0 bg-transparent"
                title="Kéo để thay đổi kích thước"
              />
            )}
            
            <div 
              className={`bg-spotify-card rounded-lg overflow-hidden relative shadow-2xl transition-opacity duration-300 flex-1 min-w-[300px] ${isSidebarExpanded ? 'opacity-0 pointer-events-none' : ''}`}
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
