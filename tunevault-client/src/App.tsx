import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/MainLayout';
import { Home } from './pages/Home';

const Placeholder = ({ title }: { title: string }) => <h1 className="text-3xl font-bold text-white">{title}</h1>;

function App() {
  // Demo protected route logic (mocked)
  const isAuthenticated = true; // Sẽ tích hợp check JWT thật ở bài sau

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Placeholder title="Login Page" />} />
        
        {/* Protected Routes */}
        <Route path="/" element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}>
          <Route index element={<Home />} />
          <Route path="search" element={<Placeholder title="Search" />} />
          <Route path="library" element={<Placeholder title="Library" />} />
          <Route path="playlist/:id" element={<Placeholder title="Playlist Detail" />} />
          <Route path="share-inbox" element={<Placeholder title="Share Inbox" />} />
          <Route path="notifications" element={<Placeholder title="Notifications" />} />
          <Route path="profile" element={<Placeholder title="Profile" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
