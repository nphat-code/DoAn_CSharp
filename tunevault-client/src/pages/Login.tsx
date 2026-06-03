import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ username, password });
      // Đăng nhập thành công -> chuyển về Home
      window.location.href = '/'; 
    } catch (err: any) {
      console.error(err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-xl shadow-2xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-8 tracking-tighter">TuneVault</h1>
        
        {error && (
          <div className="w-full bg-red-500/20 border border-red-500 text-red-500 text-sm p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-white">Tài khoản</label>
            <input 
              type="text" 
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white transition"
              placeholder="Nhập username"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-white">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white transition"
              placeholder="Nhập password"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-full mt-4 transition disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
          </button>
        </form>
      </div>
    </div>
  );
};
