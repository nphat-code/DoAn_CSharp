import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PlaylistDetail } from './pages/PlaylistDetail';
import { Profile } from './pages/Profile';
import { Search } from './pages/Search';
import { Favorites } from './pages/Favorites';
import { AlbumDetail } from './pages/AlbumDetail';
import { NowPlaying } from './pages/NowPlaying';
import { TrackDetail } from './pages/TrackDetail';
import { UserProfile } from './pages/UserProfile';
import { AdminDashboard } from './pages/AdminDashboard';
import { SharedWithMe } from './pages/SharedWithMe';
import { RecentHistory } from './pages/RecentHistory';
import { ArtistDetail } from './pages/ArtistDetail';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-white mb-4">{title}</h1>
    <p className="text-zinc-400">Trang này đang trong quá trình phát triển.</p>
  </div>
);

function App() {
  // Kiểm tra xem đã có token trong localStorage chưa
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        
        {/* Main Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="library" element={isAuthenticated ? <Placeholder title="Library" /> : <Navigate to="/login" />} />
          <Route path="favorites" element={isAuthenticated ? <Favorites /> : <Navigate to="/login" />} />
          <Route path="shared-with-me" element={isAuthenticated ? <SharedWithMe /> : <Navigate to="/login" />} />
          <Route path="playlist/:id" element={isAuthenticated ? <PlaylistDetail /> : <Navigate to="/login" />} />
          <Route path="album/:id" element={isAuthenticated ? <AlbumDetail /> : <Navigate to="/login" />} />
          <Route path="artist/:id" element={isAuthenticated ? <ArtistDetail /> : <Navigate to="/login" />} />
          <Route path="track/:id" element={isAuthenticated ? <TrackDetail /> : <Navigate to="/login" />} />
          <Route path="share-inbox" element={isAuthenticated ? <Placeholder title="Share Inbox" /> : <Navigate to="/login" />} />
          <Route path="recent-history" element={isAuthenticated ? <RecentHistory /> : <Navigate to="/login" />} />
          <Route path="notifications" element={isAuthenticated ? <Placeholder title="Notifications" /> : <Navigate to="/login" />} />
          <Route path="profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="user/:id" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
          <Route path="admin" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="now-playing" element={isAuthenticated ? <NowPlaying /> : <Navigate to="/login" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
