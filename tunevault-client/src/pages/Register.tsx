import { useState } from 'react';
import { authService } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';

export const Register = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation state
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
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[734px] bg-black p-8 sm:p-24 rounded-xl flex flex-col items-center">
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

              <div className="w-full max-w-[324px] flex justify-center">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      setLoading(true);
                      if (credentialResponse.credential) {
                        await authService.googleLogin(credentialResponse.credential);
                        window.location.href = '/';
                      }
                    } catch (err: any) {
                      setError(err.response?.data?.message || "Lỗi đăng ký bằng Google.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  onError={() => {
                    setError("Đăng ký Google thất bại.");
                  }}
                  shape="pill"
                  theme="filled_black"
                  width="324"
                  text="signup_with"
                />
              </div>
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
