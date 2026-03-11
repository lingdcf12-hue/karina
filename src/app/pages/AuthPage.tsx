import { useState } from 'react';
import { useMusicStore } from '../store/musicStore';
import { Mail, Lock, User as UserIcon, X, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';

export function AuthPage() {
  const { currentView, setCurrentView, setUser, fetchCollection } = useMusicStore();
  const isLogin = currentView === 'login';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login Flow
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        // Supabase stores user metadata natively
        const userName = data.user.user_metadata?.name || email.split('@')[0];
        setUser({ id: data.user.id, name: userName, email: data.user.email });
        fetchCollection();
        toast.success(`Selamat datang kembali, ${userName}!`);
        setCurrentView('home');
      } else {
        // Register Flow
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
            }
          }
        });

        if (error) throw error;
        
        toast.success('Pendaftaran berhasil! Silahkan masuk dengan akun barumu.');
        setCurrentView('login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat autentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || `Gagal masuk dengan ${provider}`);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
      
      {/* Fake Spotify Logo */}
      <div className="absolute top-8 left-8 flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
            <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.49 17.3c-.22.36-.68.47-1.05.25-2.98-1.82-6.73-2.23-11.14-1.22-.4.09-.81-.15-.9-.54-.09-.4.15-.81.54-.9 4.83-1.1 9-0.63 12.3 1.39.36.22.48.68.25 1.05zm1.46-3.26c-.28.45-.88.6-1.33.32-3.41-2.09-8.61-2.7-12.63-1.48-.51.16-1.05-.13-1.21-.64-.16-.51.13-1.05.64-1.21 4.59-1.39 10.33-0.7 14.22 1.68.45.28.6.88.32 1.33zm.13-3.39c-4.09-2.43-10.83-2.65-14.73-1.47-.63.19-1.29-.17-1.48-.8-.19-.63.17-1.29.8-1.48 4.47-1.36 11.91-1.1 16.59 1.68.56.33.74 1.05.41 1.61-.33.56-1.05.74-1.61.41z"/>
        </svg>
        <span className="text-xl font-bold font-inter tracking-tighter">Spotify</span>
      </div>

      {/* Close Button Top Right */}
      <button 
        onClick={() => setCurrentView('home')}
        className="absolute top-8 right-8 w-10 h-10 bg-[#242424] hover:bg-[#333] rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors"
        title="Kembali"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="w-full max-w-[500px] bg-gradient-to-b from-[#121212] to-black sm:bg-[#121212] px-14 py-16 sm:rounded-xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-10 text-center tracking-tighter">
          {isLogin ? 'Masuk ke Spotify' : 'Mendaftar untuk mulai mendengarkan'}
        </h1>
        
        {/* Social Logins */}
        <div className="w-full flex flex-col gap-3 mb-8">
          <button 
            onClick={() => handleSocialLogin('google')}
            className="w-full h-12 rounded-full border border-[#727272] hover:border-white flex items-center px-8 transition-all relative group"
          >
            <svg viewBox="0 0 48 48" className="w-5 h-5 absolute left-8">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
            <span className="w-full text-center font-bold text-sm">Lanjutkan dengan Google</span>
          </button>

          <button 
            onClick={() => handleSocialLogin('facebook')}
            className="w-full h-12 rounded-full border border-[#727272] hover:border-white flex items-center px-8 transition-all relative group"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 absolute left-8 fill-[#1877F2]">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"></path>
            </svg>
            <span className="w-full text-center font-bold text-sm">Lanjutkan dengan Facebook</span>
          </button>
        </div>

        <div className="w-full flex items-center gap-4 mb-8">
          <div className="flex-1 h-[1px] bg-[#292929]"></div>
          <span className="text-xs font-bold text-[#a7a7a7]">Atau</span>
          <div className="flex-1 h-[1px] bg-[#292929]"></div>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold">Nama Profil</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b3b3b3]" />
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan profilmu"
                  className="w-full bg-[#121212] text-white border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded-[4px] h-12 pl-10 pr-4 outline-none transition-all placeholder-[#727272]"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Email atau nama pengguna</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b3b3b3]" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email atau nama pengguna"
                required
                className="w-full bg-[#121212] text-white border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded-[4px] h-12 pl-10 pr-4 outline-none transition-all placeholder-[#727272]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Kata Sandi</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b3b3b3]" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kata Sandi"
                required
                className="w-full bg-[#121212] text-white border border-[#727272] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded-[4px] h-12 pl-10 pr-4 outline-none transition-all placeholder-[#727272]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-8 w-full h-12 rounded-full bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#1db954]/50 disabled:cursor-not-allowed text-black font-bold text-lg transition-transform hover:scale-[1.04] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {isLogin ? 'Masuk' : 'Mendaftar'}
          </button>
        </form>

        <div className="w-full h-[1px] bg-[#2a2a2a] my-8"></div>

        <p className="text-[#a7a7a7]">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <button 
            type="button"
            onClick={() => setCurrentView(isLogin ? 'register' : 'login')}
            className="text-white hover:text-[#1DB954] font-bold underline transition-colors"
          >
            {isLogin ? 'Mendaftar di Spotify' : 'Masuk di sini'}
          </button>
        </p>
      </div>
    </div>
  );
}
