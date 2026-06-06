import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { PlayerBar } from './PlayerBar';
import { TopBar } from './TopBar';
import { RightPanel } from './RightPanel';
import { PlayerProvider } from '../context/PlayerContext';
import { NotificationProvider } from '../context/NotificationContext';

export const MainLayout = () => {
  return (
    <NotificationProvider>
      <PlayerProvider>
        {/* Nền đen toàn cục, áp dụng gap-2 cho toàn bộ giao diện */}
        <div className="h-screen w-full flex flex-col bg-spotify-base p-2 gap-2 text-white font-sans select-none">
          <TopBar />
          
          {/* Vùng thân gồm Sidebar - MainContent - RightPanel */}
          <div className="flex-1 flex overflow-hidden gap-2">
            <Sidebar />
            
            <main className="flex-1 bg-spotify-card rounded-lg overflow-y-auto relative shadow-2xl">
              {/* Gradient header background overlay */}
              <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-indigo-800/40 via-spotify-card/80 to-spotify-card pointer-events-none z-0"></div>

              {/* Header Tabs cho Home */}
              <div className="sticky top-0 z-20 bg-black/20 backdrop-blur-xl px-6 py-4 flex gap-2 border-b border-transparent">
                 <button className="px-4 py-1.5 bg-white text-black font-semibold text-sm rounded-full transition">Tất cả</button>
                 <button className="px-4 py-1.5 bg-zinc-800/80 text-white hover:bg-zinc-700 font-semibold text-sm rounded-full transition">Nhạc</button>
                 <button className="px-4 py-1.5 bg-zinc-800/80 text-white hover:bg-zinc-700 font-semibold text-sm rounded-full transition">Podcast</button>
              </div>
               
               <div className="p-6 pt-2 relative z-10">
                  <Outlet />
               </div>
            </main>

            <RightPanel />
          </div>

          {/* Fixed PlayerBar */}
          <div className="w-full rounded-lg overflow-hidden shrink-0">
            <PlayerBar />
          </div>
        </div>
      </PlayerProvider>
    </NotificationProvider>
  );
};
