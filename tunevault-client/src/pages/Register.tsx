import { useState } from 'react';

import { authService } from '../services/authService';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({ username, email, password });
      // Đăng ký thành công và đã tự động lưu JWT -> chuyển về Home
      window.location.href = '/'; 
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
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

        <form onSubmit={handleRegister} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-white">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-white transition"
              placeholder="Nhập email"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-white">Tên đăng nhập (Username)</label>
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
              placeholder="Nhập password (ít nhất 6 ký tự)"
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-full mt-4 transition disabled:opacity-50"
          >
            {loading ? 'Đang đăng ký...' : 'ĐĂNG KÝ'}
          </button>
        </form>

        <p className="text-zinc-400 mt-6 text-sm">
          Bạn đã có tài khoản?{' '}
          <a href="/login" className="text-white font-bold hover:underline">
            Đăng nhập ngay
          </a>
        </p>
      </div>
    </div>
  );
};
