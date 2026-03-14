import { useState, useEffect } from 'react';
import { 
  ChevronDown, 
  MoreHorizontal, 
  Heart, 
  Shuffle, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Pause, 
  Play, 
  Laptop2, 
  Share2, 
  ListMusic,
  CheckCircle2
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { formatTime } from '../utils/formatters';

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FullScreenPlayer({ isOpen, onClose }: FullScreenPlayerProps) {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    togglePlay,
    nextTrack,
    previousTrack,
    shuffle,
    repeat,
    toggleShuffle,
    toggleRepeat,
    setProgress,
    likedTracks,
    toggleLike,
    dominantColor
  } = useMusicStore();

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Browser/Android back button support
  useEffect(() => {
    if (isOpen) {
      // Push a state so pressing back will trigger popstate
      window.history.pushState({ fullscreenPlayer: true }, '');
      
      const handlePopState = () => {
        onClose();
      };
      
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [isOpen, onClose]);

  // Swipe to close logic
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientY);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientY);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    const isSwipeDown = distance > 100;
    if (isSwipeDown) {
      // Go back in history instead of just calling onClose, to keep history clean
      window.history.back();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!isOpen || !currentTrack) return null;

  const isLiked = likedTracks.find(t => t.id === currentTrack.id);
  const progressPercentage = (progress / (duration || 1)) * 100;

  // Use a fallback if dominantColor is not set or is black
  const bgColor = (dominantColor === '#121212' || !dominantColor) ? '#1a213a' : dominantColor;

  return (
    <div 
      className="fixed inset-0 z-[100] text-white flex flex-col overflow-hidden select-none animate-in slide-in-from-bottom duration-500 ease-out"
      style={{
        background: `linear-gradient(to bottom, ${bgColor} 0%, #121212 100%)`
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mesh Gradient Overlay for extra aesthetic */}
      <div className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{
          background: `radial-gradient(circle at 20% 30%, ${bgColor} 0%, transparent 50%), 
                     radial-gradient(circle at 80% 70%, ${bgColor} 0%, transparent 50%)`
        }} 
      />

      <div className="relative flex-1 flex flex-col h-full max-w-md mx-auto w-full justify-between py-6 px-6">
        {/* Top Header */}
        <div className="flex items-center justify-between shrink-0 mb-4">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 text-white active:scale-90 transition-transform hover:bg-white/10 rounded-full">
            <ChevronDown className="w-8 h-8" />
          </button>
          <div className="flex flex-col items-center flex-1 min-w-0 px-4">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 mb-0.5">MEMUTAR DARI KOLEKSI KAMU</span>
            <span className="text-[13px] font-bold truncate w-full text-center">Lagu yang Disukai</span>
          </div>
          <button className="p-2 -mr-2 text-white hover:bg-white/10 rounded-full">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Album Art Container - Dynamic sizing */}
        <div className="flex-1 flex items-center justify-center min-h-0 my-8 py-4">
          <div className="w-full aspect-square max-h-[42vh] shadow-[0_30px_90px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden active:scale-[0.98] transition-transform duration-500">
            <img 
              src={currentTrack.album.images[0].url} 
              alt={currentTrack.name}
              className="w-full h-full object-cover scale-105" 
            />
          </div>
        </div>

        {/* Bottom Section: Info, Progress, Controls */}
        <div className="shrink-0 flex flex-col">
          {/* Song Info */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="min-w-0">
              <h1 className="text-[24px] font-black tracking-tight truncate leading-tight mb-1">{currentTrack.name}</h1>
              <p className="text-white/70 text-[16px] font-medium truncate">
                  {currentTrack.artists.map(a => a.name).join(', ')}
              </p>
            </div>
            <button 
              onClick={() => toggleLike(currentTrack)} 
              className="shrink-0 transition-all active:scale-125 p-1"
            >
              {isLiked ? (
                  <CheckCircle2 className="w-8 h-8 text-[#1DB954] fill-current" />
              ) : (
                  <Heart className="w-8 h-8 text-white/60" />
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex flex-col gap-1.5 mb-8">
            <div className="relative w-full h-1 group cursor-pointer flex items-center">
              <div className="absolute inset-x-0 h-1 bg-white/20 rounded-full" />
              <div className="absolute top-0 left-0 h-1 bg-white rounded-full" style={{ width: `${progressPercentage}%` }} />
              <div 
                className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-lg" 
                style={{ left: `calc(${progressPercentage}% - 7px)` }} 
              />
              <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                value={progress} 
                step="0.1"
                onChange={(e) => setProgress(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-4 -top-1.5 opacity-0 cursor-pointer z-10" 
              />
            </div>
            <div className="flex items-center justify-between text-white/50 text-[11px] font-bold tabular-nums tracking-wider">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Player Controls */}
          <div className="flex items-center justify-between mb-10 px-0.5">
            <button onClick={toggleShuffle} className={`${shuffle ? 'text-[#1DB954]' : 'text-white/60'} transition-colors relative`}>
              <Shuffle className="w-6 h-6" />
              {shuffle && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1DB954] rounded-full" />}
            </button>
            <button onClick={previousTrack} className="text-white active:scale-90 transition-transform">
              <SkipBack className="w-9 h-9 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-[72px] h-[72px] bg-white rounded-full flex items-center justify-center text-black shadow-2xl active:scale-90 transition-transform shrink-0"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button onClick={nextTrack} className="text-white active:scale-90 transition-transform">
              <SkipForward className="w-9 h-9 fill-current" />
            </button>
            <button onClick={toggleRepeat} className={`${repeat !== 'off' ? 'text-[#1DB954]' : 'text-white/60'} transition-colors relative`}>
              <Repeat className="w-6 h-6" />
              {repeat !== 'off' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1DB954] rounded-full" />}
              {repeat === 'track' && <span className="absolute -top-1.5 -right-1.5 bg-[#121212] text-[#1DB954] text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-[#1DB954]">1</span>}
            </button>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between mb-8">
            <button className="text-[#1DB954] flex items-center gap-2 active:scale-95 transition-transform">
              <Laptop2 className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Web Player (Chrome)</span>
            </button>
            <div className="flex items-center gap-7 text-white/70">
              <button className="active:scale-90 transition-transform hover:text-white"><Share2 className="w-5 h-5" /></button>
              <button className="active:scale-90 transition-transform hover:text-white"><ListMusic className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {/* Lyrics Preview Card */}
        <div 
          className="rounded-2xl p-6 relative overflow-hidden flex flex-col shrink-0 min-h-[160px] cursor-pointer group active:scale-[0.98] transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${bgColor} 0%, #3e50b4 100%)`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[13px] font-black tracking-tighter uppercase">Pratinjau lirik</h3>
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                <ChevronDown className="w-4 h-4 rotate-180" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[22px] font-black text-white/40 leading-tight tracking-tight">Something's different about you,</p>
            <p className="text-[22px] font-black text-white leading-tight tracking-tight">I can feel it</p>
          </div>
          {/* Decorative glass elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[40px] rounded-full -mt-16 -mr-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/20 blur-[30px] rounded-full -mb-12 -ml-12" />
        </div>
      </div>
    </div>
  );
}
