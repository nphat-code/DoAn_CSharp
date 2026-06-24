import { useState, useRef } from 'react';
import { authService } from '../services/authService';

export const Login = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleNextStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStep(2);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleLoginOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('Tính năng đăng nhập bằng OTP đang được phát triển. Vui lòng đăng nhập bằng mật khẩu.');
  };

  const handleLoginPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login({ email, password });
      window.location.href = '/'; 
    } catch (err: any) {
      console.error(err);
      setError('Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản/mật khẩu!');
    } finally {
      setLoading(false);
    }
  };

  // Helper to mask email (e.g. n***@g***.com)
  const maskEmail = (email: string) => {
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const maskedName = name.length > 2 ? name[0] + '*'.repeat(name.length - 2) + name[name.length - 1] : name;
    const [domainName, tld] = domain.split('.');
    const maskedDomain = domainName.length > 1 ? domainName[0] + '*'.repeat(domainName.length - 1) : domainName;
    return `${maskedName}@${maskedDomain}.${tld || ''}`;
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[734px] bg-black p-8 sm:p-24 rounded-xl flex flex-col items-center">
        {step !== 2 && (
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-black rounded-full" />
          </div>
        )}
        
        {step === 1 && (
          <>
            <h1 className="text-3xl sm:text-5xl font-bold text-white mb-12 tracking-tighter text-center">Chào mừng bạn trở lại</h1>
            
            <form onSubmit={handleNextStep1} className="w-full flex flex-col gap-4 items-center">
              <div className="flex flex-col gap-2 w-full max-w-[324px]">
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

              <button 
                type="submit" 
                disabled={!email}
                className="w-full max-w-[324px] bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 text-black font-bold py-3.5 rounded-full mt-4 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                Tiếp tục
              </button>
            </form>

            <div className="w-full max-w-[324px] flex items-center my-6">
              <div className="flex-1 border-t border-zinc-800"></div>
              <span className="px-3 text-zinc-400 text-sm">hoặc</span>
              <div className="flex-1 border-t border-zinc-800"></div>
            </div>

            <div className="w-full max-w-[324px] flex flex-col gap-3">
              <button type="button" className="w-full border border-zinc-500 hover:border-white text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-3 transition">
                Tiếp tục với Số điện thoại
              </button>
              <button type="button" className="w-full border border-zinc-500 hover:border-white text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-3 transition">
                Tiếp tục với Google
              </button>
              <button type="button" className="w-full border border-zinc-500 hover:border-white text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-3 transition">
                Tiếp tục với Facebook
              </button>
              <button type="button" className="w-full border border-zinc-500 hover:border-white text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-3 transition">
                Tiếp tục với Apple
              </button>
            </div>

            <div className="w-full max-w-[450px] border-t border-zinc-800 my-8"></div>

            <p className="text-zinc-400 mt-2 text-base font-medium">
              Bạn chưa có tài khoản?{' '}
              <a href="/register" className="text-white font-bold hover:text-[#1ed760] underline">
                Đăng ký ngay
              </a>
            </p>
          </>
        )}

        {step === 2 && (
          <div className="w-full max-w-[450px] flex flex-col items-center">
            <button onClick={() => setStep(1)} className="text-zinc-400 hover:text-white mb-6 flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-800 self-start transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <h2 className="text-3xl font-bold text-white mb-8 text-center leading-tight">
              Nhập mã chúng tôi đã gửi tới {maskEmail(email)}
            </h2>

            {error && (
              <div className="w-full max-w-[324px] bg-red-500/20 border border-red-500 text-red-500 text-sm p-3 rounded-md mb-6 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginOtp} className="flex flex-col items-center w-full">
              <div className="flex gap-2 justify-center mb-6 w-full">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 bg-[#121212] border border-zinc-500 text-white text-center text-xl rounded-[4px] hover:border-white focus:outline-none focus:ring-2 focus:ring-white transition"
                    required
                  />
                ))}
              </div>

              <button type="button" className="text-white hover:text-[#1ed760] font-bold text-sm mb-8 transition border border-zinc-500 px-4 py-2 rounded-full hover:border-white">
                Gửi lại mã
              </button>

              <button 
                type="submit" 
                disabled={otp.some(d => d === '')}
                className="w-full max-w-[324px] bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 text-black font-bold py-3.5 rounded-full transition disabled:opacity-50 disabled:hover:scale-100"
              >
                Tiếp theo
              </button>

              <button 
                type="button"
                onClick={() => {
                  setError('');
                  setStep(3);
                }}
                className="mt-8 text-white hover:text-[#1ed760] font-bold transition"
              >
                Đăng nhập bằng mật khẩu
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="w-full max-w-[324px] flex flex-col items-center">
            <button onClick={() => setStep(2)} className="text-zinc-400 hover:text-white mb-6 flex items-center justify-center w-10 h-10 rounded-full hover:bg-zinc-800 self-start transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <h2 className="text-3xl font-bold text-white mb-8 text-center">Đăng nhập bằng mật khẩu</h2>

            {error && (
              <div className="w-full bg-red-500/20 border border-red-500 text-red-500 text-sm p-3 rounded-md mb-6 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLoginPassword} className="flex flex-col gap-4 w-full">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-white">Email</label>
                <input 
                  type="email" 
                  value={email}
                  disabled
                  className="bg-[#2a2a2a] border border-zinc-500 text-zinc-400 p-3.5 rounded-[4px] w-full cursor-not-allowed"
                />
              </div>

              <div className="flex flex-col gap-2">
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
                disabled={loading || !password}
                className="w-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 text-black font-bold py-3.5 rounded-full mt-6 transition disabled:opacity-50 disabled:hover:scale-100"
              >
                {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
