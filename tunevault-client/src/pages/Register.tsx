import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const Register = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    const clientId = "932955180439-i4m5vahs6rsecc4go5ubn09uso4485oe.apps.googleusercontent.com";
    const redirectUri = `${window.location.origin}/register`;
    const scope = "email profile";
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=select_account`;
    window.location.href = url;
  };

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const token = params.get('access_token');
      if (token) {
        setLoading(true);
        authService.googleLogin(token).then(() => {
          window.history.replaceState(null, '', window.location.pathname);
          window.location.href = '/';
        }).catch(err => {
          window.history.replaceState(null, '', window.location.pathname);
          setError(err.response?.data?.message || "Lỗi đăng ký bằng Google.");
          setLoading(false);
        });
      }
    }
  }, []);

  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumberOrSpecial = /[^a-zA-Z\s]/.test(password);
  const hasMinLength = password.length >= 10;
  const isPasswordValid = hasLetter && hasNumberOrSpecial && hasMinLength;

  const handleNextStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError('');
    setLoading(true);
    try {
      const exists = await authService.checkEmail(email);
      if (exists) {
        setError('Địa chỉ email này đã được liên kết với một tài khoản hiện có. Để tiếp tục, vui lòng đăng nhập.');
      } else {
        setStep(2);
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi kiểm tra email.');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPasswordValid) {
      setStep(3);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setError('');
    setLoading(true);

    try {
      await authService.register({ username, email, password });
      window.location.href = '/'; 
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center p-4 overflow-y-auto">
      <div className="w-full max-w-[734px] bg-black p-8 sm:p-24 rounded-xl flex flex-col items-center my-auto">
        {step === 1 && (
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-black rounded-full" />
          </div>
        )}
        
        {step === 1 && (
          <>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-12 tracking-tighter text-center">Đăng ký để bắt đầu nghe</h1>
            
            {error && (
              <div className="w-full max-w-[324px] bg-red-500/20 border border-red-500 text-red-500 text-sm p-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleNextStep1} className="w-full flex flex-col gap-4 items-center">
              <div className="flex flex-col gap-2 w-full max-w-[324px]">
                <label className="text-sm font-bold text-white">Địa chỉ email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-[#121212] border border-zinc-500 text-white p-3.5 rounded-[4px] hover:border-white focus:outline-none focus:ring-2 focus:ring-white transition w-full"
                  placeholder="name@domain.com"
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !email}
                className="w-full max-w-[324px] bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 text-black font-bold py-3.5 rounded-full mt-4 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Đang tải...' : 'Tiếp theo'}
              </button>

              <div className="w-full max-w-[324px] flex items-center my-6">
                <div className="flex-1 border-t border-zinc-800"></div>
                <span className="px-3 text-zinc-400 text-sm">hoặc</span>
                <div className="flex-1 border-t border-zinc-800"></div>
              </div>

              <button type="button" onClick={handleGoogleLogin} className="w-full max-w-[324px] border border-zinc-500 hover:border-white text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-3 transition disabled:opacity-50">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>
                )}
                Đăng ký bằng Google
              </button>
            </form>

            <div className="w-full max-w-[450px] border-t border-zinc-800 my-8"></div>

            <p className="text-zinc-400 mt-2 text-base font-medium">
              Bạn đã có tài khoản?{' '}
              <a href="/login" className="text-white font-bold hover:text-[#1ed760] underline">
                Đăng nhập tại đây
              </a>
            </p>
          </>
        )}

        {step === 2 && (
          <div className="w-full max-w-[324px] flex flex-col">
            <div className="w-full bg-zinc-800 h-1 mb-6 rounded-full overflow-hidden">
              <div className="bg-[#1ed760] h-full w-1/3"></div>
            </div>
            <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-white mb-6 flex items-center gap-2 self-start">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <p className="text-zinc-400 text-sm font-bold mb-1">Bước 1/2</p>
            <h2 className="text-2xl font-bold text-white mb-6">Tạo mật khẩu</h2>

            <form onSubmit={handleNextStep2} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Mật khẩu</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="bg-[#121212] border border-zinc-500 text-white p-3.5 rounded-[4px] hover:border-white focus:outline-none focus:ring-2 focus:ring-white transition w-full"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-2 text-sm text-zinc-400 flex flex-col gap-2">
                <p className="font-bold text-white">Mật khẩu của bạn phải có ít nhất:</p>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border ${hasLetter ? 'bg-[#1ed760] border-[#1ed760]' : 'border-zinc-500'}`}></div>
                  <span>1 chữ cái</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border ${hasNumberOrSpecial ? 'bg-[#1ed760] border-[#1ed760]' : 'border-zinc-500'}`}></div>
                  <span>1 chữ số hoặc ký tự đặc biệt (ví dụ: # ? ! &)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full border ${hasMinLength ? 'bg-[#1ed760] border-[#1ed760]' : 'border-zinc-500'}`}></div>
                  <span>10 ký tự</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={!isPasswordValid}
                className="w-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 text-black font-bold py-3.5 rounded-full mt-6 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                Tiếp theo
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-[324px] flex flex-col">
            <div className="w-full bg-zinc-800 h-1 mb-6 rounded-full overflow-hidden">
              <div className="bg-[#1ed760] h-full w-2/3"></div>
            </div>
            <button onClick={() => setStep(2)} className="text-zinc-400 hover:text-white mb-6 flex items-center gap-2 self-start">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <p className="text-zinc-400 text-sm font-bold mb-1">Bước 2/2</p>
            <h2 className="text-2xl font-bold text-white mb-6">Cho chúng tôi biết về bạn</h2>
            
            {error && (
              <div className="w-full bg-red-500/20 border border-red-500 text-red-500 text-sm p-3 rounded-md mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Tên</label>
                <p className="text-sm text-zinc-400 mb-1">Tên này sẽ xuất hiện trên hồ sơ của bạn</p>
                <input 
                  type="text" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  minLength={3}
                  maxLength={50}
                  className="bg-[#121212] border border-zinc-500 text-white p-3.5 rounded-[4px] hover:border-white focus:outline-none focus:ring-2 focus:ring-white transition w-full"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !username}
                className="w-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 text-black font-bold py-3.5 rounded-full mt-6 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
