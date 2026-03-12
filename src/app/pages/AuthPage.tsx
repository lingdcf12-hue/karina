import { useState, useEffect } from 'react';
import { useMusicStore } from '../store/musicStore';
import { Mail, Lock, User as UserIcon, X, Loader2, Music2 } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';

// Koleksi artwork album untuk tampilan kiri
const ALBUM_ARTS = [
  'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
  'https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5',
  'https://i.scdn.co/image/ab67616d0000b2733d98a0ae7c78a3a9babaf8af',
  'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22870b9f542d938',
  'https://i.scdn.co/image/ab67616d0000b273b46f74097655d7f353caab14',
  'https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268',
  'https://i.scdn.co/image/ab67616d0000b2731ae8bf6d4f7e9f5e8e6f4e27',
  'https://i.scdn.co/image/ab67616d0000b2734e0362c225863f6ae2432651',
  'https://i.scdn.co/image/ab67616d0000b273450fc6bb3f3f38c981b8ba37',
];

function AlbumGrid() {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Mosaic Grid */}
      <div
        className="grid gap-2 w-full h-full"
        style={{
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
        }}
      >
        {ALBUM_ARTS.map((src, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg"
            style={{
              animation: `float-${i % 3} ${4 + (i % 3)}s ease-in-out infinite alternate`,
            }}
          >
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${i * 17}/200/200`;
              }}
            />
          </div>
        ))}
      </div>

      {/* Dark Overlay dengan gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#121212] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Overlay Teks Tengah */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center mb-4 shadow-2xl shadow-[#1DB954]/40">
          <Music2 className="w-7 h-7 text-black" />
        </div>
        <h2 className="text-3xl font-extrabold text-white leading-tight tracking-tighter drop-shadow-lg">
          Mulai<br />mendengarkan<br />dengan akun<br />Spotify gratis
        </h2>
        <p className="mt-4 text-sm text-white/70 max-w-[200px]">
          Jutaan lagu. Tanpa kartu kredit.
        </p>
      </div>
    </div>
  );
}

export function AuthPage() {
  const { currentView, setCurrentView, setUser, fetchCollection, guestPromptTrack, setGuestPromptTrack } = useMusicStore();
  const isLogin = currentView === 'login';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const userName = data.user.user_metadata?.name || email.split('@')[0];
        setUser({ id: data.user.id, name: userName, email: data.user.email });
        fetchCollection();
        toast.success(`Selamat datang kembali, ${userName}!`);
        // Jika ada guestPromptTrack, bersihkan setelah login
        if (guestPromptTrack) setGuestPromptTrack(null);
        setCurrentView('home');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name || email.split('@')[0] } }
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
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || `Gagal masuk dengan ${provider}`);
    }
  };

  const switchView = (view: 'login' | 'register') => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentView(view);
      setAnimating(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">

      {/* ── Inject CSS Animations ── */}
      <style>{`
        @keyframes float-0 { from { transform: translateY(0px) scale(1); } to { transform: translateY(-8px) scale(1.02); } }
        @keyframes float-1 { from { transform: translateY(0px) scale(1); } to { transform: translateY(6px) scale(0.98); } }
        @keyframes float-2 { from { transform: translateY(0px) scale(1); } to { transform: translateY(-4px) scale(1.01); } }
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeSlideOut { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-20px); } }
        .auth-form-enter { animation: fadeSlideIn 0.25s ease forwards; }
        .auth-form-exit { animation: fadeSlideOut 0.2s ease forwards; }
      `}</style>

      {/* ── Logo (top-left) ── */}
      <div
        className="absolute top-6 left-8 flex items-center gap-2 cursor-pointer z-10 group"
        onClick={() => setCurrentView('home')}
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current group-hover:scale-110 transition-transform">
          <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.49 17.3c-.22.36-.68.47-1.05.25-2.98-1.82-6.73-2.23-11.14-1.22-.4.09-.81-.15-.9-.54-.09-.4.15-.81.54-.9 4.83-1.1 9-0.63 12.3 1.39.36.22.48.68.25 1.05zm1.46-3.26c-.28.45-.88.6-1.33.32-3.41-2.09-8.61-2.7-12.63-1.48-.51.16-1.05-.13-1.21-.64-.16-.51.13-1.05.64-1.21 4.59-1.39 10.33-0.7 14.22 1.68.45.28.6.88.32 1.33zm.13-3.39c-4.09-2.43-10.83-2.65-14.73-1.47-.63.19-1.29-.17-1.48-.8-.19-.63.17-1.29.8-1.48 4.47-1.36 11.91-1.1 16.59 1.68.56.33.74 1.05.41 1.61-.33.56-1.05.74-1.61.41z"/>
        </svg>
        <span className="text-xl font-bold tracking-tighter hidden sm:block">Spotify</span>
      </div>

      {/* ── Close Button (top-right) ── */}
      <button
        onClick={() => {
          if (guestPromptTrack) setGuestPromptTrack(null);
          setCurrentView('home');
        }}
        className="absolute top-6 right-6 z-10 w-10 h-10 bg-[#242424] hover:bg-[#333] rounded-full flex items-center justify-center text-[#b3b3b3] hover:text-white transition-all hover:scale-110 shadow-lg"
        title="Kembali"
      >
        <X className="w-5 h-5" />
      </button>

      {/* ── Main Card ── */}
      <div className="w-full max-w-[920px] mx-4 bg-[#222222] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl shadow-black/60 min-h-[540px]">


        {/* ── Left Panel: Album Grid Visual ── */}
        <div className="hidden md:block w-[45%] flex-shrink-0 bg-[#181818] relative">
          <AlbumGrid />
        </div>

        {/* ── Right Panel: Auth Form ── */}
        <div className="flex-1 bg-[#282828] flex flex-col items-center justify-center p-8 sm:p-10 lg:p-12 overflow-y-auto">

          {/* Title */}
          <h1 className={`text-2xl sm:text-3xl font-extrabold text-white text-center tracking-tighter mb-7 leading-tight ${animating ? 'auth-form-exit' : 'auth-form-enter'}`}>
            {isLogin ? 'Masuk ke Spotify' : 'Daftar untuk mulai mendengarkan'}
          </h1>

          <div className={`w-full max-w-[340px] flex flex-col gap-0 ${animating ? 'auth-form-exit' : 'auth-form-enter'}`}>

            {/* ── Social Logins ── */}
            <div className="flex flex-col gap-2.5 mb-6">
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full h-11 rounded-full border border-[#727272] hover:border-white flex items-center px-5 transition-all relative group hover:bg-white/5"
              >
                <svg viewBox="0 0 48 48" className="w-5 h-5 absolute left-5">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  <path fill="none" d="M0 0h48v48H0z"/>
                </svg>
                <span className="w-full text-center font-bold text-sm">Lanjutkan dengan Google</span>
              </button>

              <button
                onClick={() => handleSocialLogin('facebook')}
                className="w-full h-11 rounded-full border border-[#727272] hover:border-white flex items-center px-5 transition-all relative group hover:bg-white/5"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 absolute left-5 fill-[#1877F2]">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="w-full text-center font-bold text-sm">Lanjutkan dengan Facebook</span>
              </button>
            </div>

            {/* ── Divider ── */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-[#3a3a3a]" />
              <span className="text-xs font-bold text-[#a7a7a7]">Atau</span>
              <div className="flex-1 h-px bg-[#3a3a3a]" />
            </div>

            {/* ── Form ── */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#d9d9d9] uppercase tracking-wide">Nama Profil</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727272]" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama profilmu"
                      className="w-full bg-[#333] text-white border border-[#3e3e3e] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded-md h-11 pl-9 pr-4 text-sm outline-none transition-all placeholder-[#727272]"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#d9d9d9] uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727272]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email atau nama pengguna"
                    required
                    className="w-full bg-[#333] text-white border border-[#3e3e3e] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded-md h-11 pl-9 pr-4 text-sm outline-none transition-all placeholder-[#727272]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#d9d9d9] uppercase tracking-wide">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#727272]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kata Sandi"
                    required
                    className="w-full bg-[#333] text-white border border-[#3e3e3e] hover:border-white focus:border-white focus:ring-1 focus:ring-white rounded-md h-11 pl-9 pr-4 text-sm outline-none transition-all placeholder-[#727272]"
                  />
                </div>
              </div>

              {/* ── Submit Button ── */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 w-full h-12 rounded-full bg-[#1DB954] hover:bg-[#1ed760] disabled:bg-[#1db954]/50 disabled:cursor-not-allowed text-black font-extrabold text-base transition-all hover:scale-[1.03] active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-[#1DB954]/20"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLogin ? 'Masuk' : 'Daftar Gratis'}
              </button>
            </form>

            {/* ── Divider ── */}
            <div className="h-px bg-[#3a3a3a] my-6" />

            {/* ── Switch View ── */}
            <p className="text-center text-sm text-[#a7a7a7]">
              {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
              <button
                type="button"
                onClick={() => switchView(isLogin ? 'register' : 'login')}
                className="text-white hover:text-[#1DB954] font-bold underline underline-offset-2 transition-colors"
              >
                {isLogin ? 'Daftar di Spotify' : 'Masuk di sini'}
              </button>
            </p>

          </div>
        </div>
      </div>
    </div>
  );
}
