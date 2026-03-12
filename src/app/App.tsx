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
import { AuthPage } from "./pages/AuthPage";
import { GuestPromptModal } from "./components/GuestPromptModal";
import { supabase } from "./utils/supabase";
import { Toaster, toast } from 'sonner';

export default function App() {
  const { currentView, setCurrentTrack, currentTrack, setUser, fetchCollection } = useMusicStore();

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
          // We set it but don't play yet to respect autoplay policy
          setCurrentTrack(tracks[0]);
          // Use a small hack to ensure isPlaying is false initially 
          // (setCurrentTrack sets it to true currently)
          useMusicStore.setState({ isPlaying: false });
        }
      })
      .catch(err => console.error("Initial track fetch failed:", err));

    // Supabase Auth Listener
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id, 
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
        });
        fetchCollection();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ 
          id: session.user.id, 
          email: session.user.email,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0]
        });
        fetchCollection();
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden select-none font-inter relative">
      {/* Auth Screen Overlay */}
      {(currentView === 'login' || currentView === 'register') && <AuthPage />}

      {/* Guest Prompt Modals */}
      <GuestPromptModal />

      {/* Top Navigation */}
      <TopBar />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 px-2 gap-2 pb-2">
        {/* Left Sidebar - Collections */}
        <div className="hidden md:flex h-full flex-shrink-0">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#121212] rounded-lg overflow-hidden relative">
          {renderContent()}
        </div>

        {/* Right Sidebar - Track Details (Desktop Only) */}
        <div className="hidden lg:flex h-full flex-shrink-0 bg-[#121212] rounded-lg overflow-hidden">
          <RightSidebar />
        </div>
      </div>

      {/* Music Player - Fixed Bottom */}
      <MusicPlayer />
      
      {/* Mobile Navigation */}
      <BottomNav />
      <Toaster position="bottom-right" theme="dark" richColors />
      
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
