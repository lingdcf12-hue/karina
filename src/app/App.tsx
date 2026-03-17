import { useEffect } from "react";
import { Sidebar } from "./layout/Sidebar";
import { SearchPage } from "./pages/SearchPage";
import { MusicPlayer } from "./layout/MusicPlayer";
import { TopBar } from "./layout/TopBar";
import { RightSidebar } from "./layout/RightSidebar";
import { BottomNav } from "./layout/BottomNav";
import { useMusicStore } from "./store/musicStore";

import { HomeGrid } from "./pages/HomeGrid";
import { LikedSongsPage } from "./pages/LikedSongsPage";
import { QueuePage } from "./pages/QueuePage";
import { PlaylistPage } from "./pages/PlaylistPage";
import { LibraryPage } from "./pages/LibraryPage";
import { ProfilePage } from "./pages/ProfilePage";
import { AuthPage } from "./pages/AuthPage";
import { GuestPromptModal } from "./components/GuestPromptModal";
import { supabase } from "./utils/supabase";
import { Toaster, toast } from 'sonner';

export default function App() {
  const { currentView, setCurrentTrack, currentTrack, setUser, fetchCollection, sidebarExpanded, rightSidebarVisible } = useMusicStore();

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomeGrid />;
      case 'search':
        return <SearchPage />;
      case 'liked-songs':
        return <LikedSongsPage />;
      case 'queue':
        return <QueuePage />;
      case 'playlist':
        return <PlaylistPage />;
      case 'library':
        return <LibraryPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomeGrid />;
    }
  };

  useEffect(() => {
    // Initial fetch to set a default track so player is visible
    fetch('/api/tracks')
      .then(res => res.json())
      .then(tracks => {
        if (tracks.length > 0 && !currentTrack) {
          setCurrentTrack(tracks[0]);
          useMusicStore.setState({ isPlaying: false });
        }
      })
      .catch(err => console.error("Initial track fetch failed:", err));

    const { syncProfile } = useMusicStore.getState();

    // 1. Validasi Sesi yang Ada
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncProfile();
      } else {
        setUser(null);
      }
    });

    // 2. Monitor Perubahan Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
          await syncProfile();
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // 3. TAB FOCUS SYNC: Refresh data when user switches back to this tab
    const handleFocus = () => {
      syncProfile();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden select-none font-inter relative">
      {/* Auth Screen Overlay */}
      {(currentView === 'login' || currentView === 'register') && <AuthPage />}

      <Toaster position="bottom-right" theme="dark" richColors />
      <GuestPromptModal />

      {/* Top Navigation */}
      <TopBar />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 px-0 md:px-2 gap-0 md:gap-2 pb-0 md:pb-2">
        {/* Left Sidebar - Collections */}
        <div 
          className="hidden lg:flex flex-shrink-0 h-full transition-all duration-300 ease-in-out"
          style={{ width: sidebarExpanded ? '420px' : '240px' }}
        >
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#121212] rounded-none md:rounded-lg overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Right Sidebar - Track Details */}
        {rightSidebarVisible && (
          <div className="hidden xl:flex w-[300px] flex-shrink-0 h-full animate-in slide-in-from-right duration-300">
            <RightSidebar />
          </div>
        )}
      </div>

      <MusicPlayer />
      <BottomNav />
      
      {/* Custom Styles Injection */}
      <style>{`
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #444;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
