import { useState } from 'react';

import { authService } from '../services/authService';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
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
      <div className="w-full max-w-[734px] bg-black p-8 sm:p-24 rounded-xl flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
          <div className="w-8 h-8 bg-black rounded-full" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-12 tracking-tighter text-center">Đăng nhập vào TuneVault</h1>
        
        {error && (
          <div className="w-full bg-red-500/20 border border-red-500 text-red-500 text-sm p-3 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-2 w-full max-w-[324px] self-center">
            <label className="text-sm font-bold text-white">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-[#121212] border border-zinc-500 text-white p-3.5 rounded-[4px] hover:border-white focus:outline-none focus:ring-2 focus:ring-white transition w-full"
              placeholder="Nhập email của bạn"
              required
            />
          </div>

          <div className="flex flex-col gap-2 w-full max-w-[324px] self-center">
            <label className="text-sm font-bold text-white">Mật khẩu</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-[#121212] border border-zinc-500 text-white p-3.5 rounded-[4px] hover:border-white focus:outline-none focus:ring-2 focus:ring-white transition w-full"
              placeholder="Mật khẩu"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full max-w-[324px] self-center bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 text-black font-bold py-3.5 rounded-full mt-8 transition disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="w-full max-w-[450px] border-t border-zinc-800 my-8"></div>

        <p className="text-zinc-400 mt-2 text-base font-medium">
          Bạn chưa có tài khoản?{' '}
          <a href="/register" className="text-white font-bold hover:text-[#1ed760] underline">
            Đăng ký TuneVault
          </a>
        </p>
      </div>
    </div>
  );
};
