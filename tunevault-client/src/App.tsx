import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PlaylistDetail } from './pages/PlaylistDetail';

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
        
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Placeholder title="Search" />} />
          <Route path="library" element={<Placeholder title="Library" />} />
          <Route path="playlist/:id" element={<PlaylistDetail />} />
          <Route path="share-inbox" element={<Placeholder title="Share Inbox" />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="profile" element={<Placeholder title="Profile" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
