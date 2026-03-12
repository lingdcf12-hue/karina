import { Home, Search, X, Bell, Users, Download, User as UserIcon } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';

export function TopBar() {
  const { searchQuery, setSearchQuery, currentView, setCurrentView, user, logout } = useMusicStore();

  return (
    <div className="h-16 flex items-center justify-between px-6 gap-4 bg-black">
      {/* Logo & Navigation */}
      <div className="flex items-center gap-2">
        <div 
            onClick={() => setCurrentView('home')}
            className="w-8 h-8 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
        >
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-white fill-current">
                <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.49 17.3c-.22.36-.68.47-1.05.25-2.98-1.82-6.73-2.23-11.14-1.22-.4.09-.81-.15-.9-.54-.09-.4.15-.81.54-.9 4.83-1.1 9-0.63 12.3 1.39.36.22.48.68.25 1.05zm1.46-3.26c-.28.45-.88.6-1.33.32-3.41-2.09-8.61-2.7-12.63-1.48-.51.16-1.05-.13-1.21-.64-.16-.51.13-1.05.64-1.21 4.59-1.39 10.33-0.7 14.22 1.68.45.28.6.88.32 1.33zm.13-3.39c-4.09-2.43-10.83-2.65-14.73-1.47-.63.19-1.29-.17-1.48-.8-.19-.63.17-1.29.8-1.48 4.47-1.36 11.91-1.1 16.59 1.68.56.33.74 1.05.41 1.61-.33.56-1.05.74-1.61.41z"/>
            </svg>
        </div>
      </div>

      {/* Center Navigation & Search */}
      <div className="flex-1 max-w-[500px] flex items-center gap-2">
        <button 
            onClick={() => setCurrentView('home')}
            className={`hidden md:flex w-12 h-12 rounded-full items-center justify-center transition-all ${currentView === 'home' ? 'bg-[#1f1f1f] text-white' : 'bg-[#1f1f1f] text-[#b3b3b3] hover:text-white'}`}
        >
          <Home className="w-6 h-6" />
        </button>
        
        <div className="relative flex-1 group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#b3b3b3] group-focus-within:text-white transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setCurrentView('search')}
            onChange={(e) => {
                setSearchQuery(e.target.value);
                if (currentView !== 'search') setCurrentView('search');
            }}
            placeholder="Apa yang ingin kamu dengar?"
            className="w-full h-10 md:h-12 bg-[#1f1f1f] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-white pl-10 md:pl-12 pr-10 md:pr-12 rounded-full text-xs md:text-sm border-none focus:ring-2 focus:ring-white transition-all placeholder-[#757575]"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          )}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-[1px] bg-[#333] hidden md:block"></div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-[#b3b3b3] hover:text-white hidden md:block">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M15 15.5c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"/><path d="M1.5 10.885c0-4.329 3.195-7.839 7.135-7.839 3.94 0 7.135 3.51 7.135 7.839 0 3.148-2.324 5.823-5.383 7.21l1.433 1.91c.242.324.069.785-.326.862l-1.63.32a.487.487 0 01-.132.018c-.201 0-.392-.124-.467-.322l-.715-1.897c-.366.015-.74.024-1.119.024-3.94 0-7.135-3.51-7.135-7.839zm7.135-6.339c-3.111 0-5.635 2.47-5.635 5.5s2.524 5.5 5.635 5.5c.312 0 .618-.026.918-.076a.75.75 0 01.815.422l.478 1.27 1.03-1.374a.75.75 0 01.528-.275c2.193-.245 3.87-2.146 3.87-4.467 0-3.03-2.524-5.5-5.635-5.5zM22.5 10c0-1.921-1.043-3.593-2.59-4.503a.75.75 0 10-.765 1.289c1.07.636 1.855 1.83 1.855 3.214 0 1.385-.785 2.578-1.855 3.214a.75.75 0 10.765 1.289A5.236 5.236 0 0022.5 10z"/></svg>
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {!user ? (
          <>
            <button 
              onClick={() => setCurrentView('register')}
              className="text-[#b3b3b3] hover:text-white font-bold text-base hover:scale-105 transition-all mr-3"
            >
              Daftar
            </button>
            <button 
              onClick={() => setCurrentView('login')}
              className="px-8 py-3 bg-white text-black text-base font-bold rounded-full hover:scale-105 transition-transform"
            >
              Masuk
            </button>
          </>
        ) : (
          <>
            <button className="hidden lg:flex items-center gap-1 px-3 py-1 bg-white text-black text-sm font-bold rounded-full hover:scale-105 transition-transform">
              <Download className="w-4 h-4" />
              Pasang Aplikasi
            </button>
            <button className="text-[#b3b3b3] hover:text-white transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#1DB954] rounded-full border-2 border-black"></span>
            </button>
            <button className="hidden md:block text-[#b3b3b3] hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </button>
            
            {/* User Profile Dropdown */}
            <div className="relative group cursor-pointer">
              <button className="bg-[#1f1f1f] p-1.5 rounded-full hover:scale-105 transition-transform focus:outline-none">
                <div className="w-7 h-7 rounded-full bg-[#3d3d3d] flex items-center justify-center overflow-hidden">
                  <UserIcon className="w-5 h-5 text-[#b3b3b3]" />
                </div>
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#282828] rounded-[4px] shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100]">
                <div className="p-3 text-sm border-b border-[#3e3e3e]">
                  <p className="font-bold text-white truncate">{user.name}</p>
                  <p className="text-[#a7a7a7] text-xs truncate">{user.email}</p>
                </div>
                <button 
                  onClick={async () => {
                     await supabase.auth.signOut();
                     logout();
                     setCurrentView('home');
                     toast.success('Kamu telah berhasil keluar.');
                  }}
                  className="w-full text-left px-4 py-3 text-sm font-semibold text-[#e8e8e8] hover:bg-[#3e3e3e] transition-colors"
                >
                  Keluar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
