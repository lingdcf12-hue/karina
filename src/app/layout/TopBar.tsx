import { useState } from 'react';
import { Home, Search, X, Bell, Users, MonitorDown } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';

export function TopBar() {
  const { searchQuery, setSearchQuery, currentView, setCurrentView, user, logout } = useMusicStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="h-14 flex items-center px-4 gap-2 bg-black w-full min-w-0 flex-shrink-0 z-50">
      {/* Left Area: Avatar (Mobile) or Logo (Desktop) */}
      <div className="flex items-center">
        {user ? (
          /* Mobile Avatar - on the left */
          <div className="relative md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-8 h-8 rounded-full overflow-hidden bg-[#535353] border border-white/10"
            >
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.email}&backgroundColor=535353&textColor=ffffff`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </button>
            {isMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsMenuOpen(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-48 bg-[#282828] rounded shadow-2xl overflow-hidden z-20 border border-[#3e3e3e] py-1">
                  <div className="p-3 text-sm border-b border-[#3e3e3e]">
                    <p className="font-bold text-white truncate">{user.name}</p>
                    <p className="text-[#a7a7a7] text-xs truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await supabase.auth.signOut();
                      logout();
                      setCurrentView('home');
                      toast.success('Kamu telah berhasil keluar.');
                    }}
                    className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#e8e8e8] hover:bg-[#3e3e3e] hover:text-white transition-colors"
                  >
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          /* Spotify Logo - Desktop or Guest Mobile */
          <div
            onClick={() => setCurrentView('home')}
            className="w-9 h-9 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform text-white"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.49 17.3c-.22.36-.68.47-1.05.25-2.98-1.82-6.73-2.23-11.14-1.22-.4.09-.81-.15-.9-.54-.09-.4.15-.81.54-.9 4.83-1.1 9-0.63 12.3 1.39.36.22.48.68.25 1.05zm1.46-3.26c-.28.45-.88.6-1.33.32-3.41-2.09-8.61-2.7-12.63-1.48-.51.16-1.05-.13-1.21-.64-.16-.51.13-1.05.64-1.21 4.59-1.39 10.33-0.7 14.22 1.68.45.28.6.88.32 1.33zm.13-3.39c-4.09-2.43-10.83-2.65-14.73-1.47-.63.19-1.29-.17-1.48-.8-.19-.63.17-1.29.8-1.48 4.47-1.36 11.91-1.1 16.59 1.68.56.33.74 1.05.41 1.61-.33.56-1.05.74-1.61.41z"/>
            </svg>
          </div>
        )}
        
        {/* Desktop Logo (always visible on md+) if we showed avatar on mobile */}
        {user && (
          <div
            onClick={() => setCurrentView('home')}
            className="w-9 h-9 hidden md:flex items-center justify-center cursor-pointer hover:scale-105 transition-transform text-white ml-2"
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current">
              <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.49 17.3c-.22.36-.68.47-1.05.25-2.98-1.82-6.73-2.23-11.14-1.22-.4.09-.81-.15-.9-.54-.09-.4.15-.81.54-.9 4.83-1.1 9-0.63 12.3 1.39.36.22.48.68.25 1.05zm1.46-3.26c-.28.45-.88.6-1.33.32-3.41-2.09-8.61-2.7-12.63-1.48-.51.16-1.05-.13-1.21-.64-.16-.51.13-1.05.64-1.21 4.59-1.39 10.33-0.7 14.22 1.68.45.28.6.88.32 1.33zm.13-3.39c-4.09-2.43-10.83-2.65-14.73-1.47-.63.19-1.29-.17-1.48-.8-.19-.63.17-1.29.8-1.48 4.47-1.36 11.91-1.1 16.59 1.68.56.33.74 1.05.41 1.61-.33.56-1.05.74-1.61.41z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Center: Home Button + Search Bar */}
      <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
        <div className="flex items-center gap-2 w-full max-w-[600px] mx-auto hidden md:flex">
          {/* Home Button */}
          <button
            onClick={() => setCurrentView('home')}
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-[#1c1c1c] hover:scale-105 hover:bg-[#2a2a2a] ${
              currentView === 'home' ? 'text-white' : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            <Home className="w-[22px] h-[22px]" strokeWidth={2} />
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#b3b3b3] group-focus-within:text-white transition-colors pointer-events-none">
              <Search className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setCurrentView('search')}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'search') setCurrentView('search');
              }}
              placeholder="Apa yang ingin kamu putar?"
              className="w-full h-10 bg-[#1c1c1c] hover:bg-[#282828] focus:bg-[#282828] text-white pl-11 pr-12 rounded-full text-sm font-medium border-2 border-transparent focus:border-white transition-all placeholder-[#a7a7a7] outline-none"
            />
            {/* Divider + Browse icon */}
            <div className="absolute right-[40px] top-1/2 -translate-y-1/2 h-5 w-[1px] bg-[#404040] hidden md:block" />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white hidden md:block transition-colors">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M15 15.5c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/><path d="M1.5 10.885c0-4.329 3.195-7.839 7.135-7.839 3.94 0 7.135 3.51 7.135 7.839 0 3.148-2.324 5.823-5.383 7.21l1.433 1.91c.242.324.069.785-.326.862l-1.63.32a.487.487 0 01-.132.018c-.201 0-.392-.124-.467-.322l-.715-1.897c-.366.015-.74.024-1.119.024-3.94 0-7.135-3.51-7.135-7.839zm7.135-6.339c-3.111 0-5.635 2.47-5.635 5.5s2.524 5.5 5.635 5.5c.312 0 .618-.026.918-.076a.75.75 0 01.815.422l.478 1.27 1.03-1.374a.75.75 0 01.528-.275c2.193-.245 3.87-2.146 3.87-4.467 0-3.03-2.524-5.5-5.635-5.5zM22.5 10c0-1.921-1.043-3.593-2.59-4.503a.75.75 0 10-.765 1.289c1.07.636 1.855 1.83 1.855 3.214 0 1.385-.785 2.578-1.855 3.214a.75.75 0 10.765 1.289A5.236 5.236 0 0022.5 10z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-1.5">
        {!user ? (
          <>
            {/* Guest: Premium + Daftar + Masuk */}
            <button className="hidden lg:block text-white font-bold text-[13px] px-4 py-1.5 rounded-full border border-white/40 hover:border-white hover:scale-105 transition-all whitespace-nowrap">
              Jelajahi Premium
            </button>
            <button
              onClick={() => setCurrentView('register')}
              className="text-[#b3b3b3] hover:text-white font-bold text-[13px] px-4 py-2 hover:scale-105 transition-all whitespace-nowrap"
            >
              Daftar
            </button>
            <button
              onClick={() => setCurrentView('login')}
              className="bg-white text-black text-[13px] font-bold rounded-full px-6 py-2 hover:scale-105 transition-transform whitespace-nowrap"
            >
              Masuk
            </button>
          </>
        ) : (
          <>
            {/* Logged in: Premium + Pasang Aplikasi + Bell + Friends + Avatar */}
            {/* Jelajahi Premium — putih isi, teks hitam (persis screenshot) */}
            <button className="hidden lg:flex items-center justify-center px-4 h-8 bg-white text-black text-[13px] font-bold rounded-full hover:bg-gray-100 hover:scale-105 transition-all shrink-0">
              Jelajahi Premium
            </button>
            {/* Pasang Aplikasi — ikon MonitorDown + teks */}
            <button className="hidden lg:flex items-center gap-1.5 px-2 h-8 text-white hover:text-gray-200 text-[13px] font-semibold transition-all hover:scale-105 shrink-0">
              <MonitorDown className="w-[15px] h-[15px]" strokeWidth={2} />
              Pasang Aplikasi
            </button>
            <button className="text-[#b3b3b3] hover:text-white transition-colors hover:scale-105 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 shrink-0">
              <Bell className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>
            <button className="hidden md:flex text-[#b3b3b3] hover:text-white transition-colors hover:scale-105 w-8 h-8 items-center justify-center rounded-full hover:bg-white/10 shrink-0">
              <Users className="w-[18px] h-[18px]" strokeWidth={2} />
            </button>

            {/* User Avatar — Desktop Only */}
            <div className="relative ml-1 shrink-0 hidden md:block">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-8 h-8 rounded-full overflow-hidden hover:scale-105 transition-all ring-2 ring-transparent hover:ring-white/30 bg-[#535353]"
              >
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.email}&backgroundColor=535353&textColor=ffffff`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </button>
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#282828] rounded shadow-2xl overflow-hidden z-20 border border-[#3e3e3e] py-1">
                    <div className="p-3 text-sm border-b border-[#3e3e3e]">
                      <p className="font-bold text-white truncate">{user.name}</p>
                      <p className="text-[#a7a7a7] text-xs truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={async () => {
                        setIsMenuOpen(false);
                        await supabase.auth.signOut();
                        logout();
                        setCurrentView('home');
                        toast.success('Kamu telah berhasil keluar.');
                      }}
                      className="w-full text-left px-4 py-3 text-[13px] font-medium text-[#e8e8e8] hover:bg-[#3e3e3e] hover:text-white transition-colors"
                    >
                      Keluar
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
