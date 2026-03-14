import { Home, Search, Library, User } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';

export function BottomNav() {
  const { currentView, setCurrentView } = useMusicStore();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Cari', icon: Search },
    { id: 'library', label: 'Koleksi', icon: Library },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <div className="md:hidden h-16 bg-gradient-to-t from-black to-black/90 backdrop-blur-lg border-t border-white/5 flex items-center justify-around px-2 relative">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = 
          (item.id === 'home' && (currentView === 'home' || currentView === 'playlist')) ||
          (item.id === 'search' && currentView === 'search') ||
          (item.id === 'library' && (currentView === 'library' || currentView === 'liked-songs'));

        return (
          <button
            key={item.id}
            onClick={() => {
                if (item.id === 'profile') {
                    if (!useMusicStore.getState().user) setCurrentView('login');
                }
                else setCurrentView(item.id as any);
            }}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-white' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
