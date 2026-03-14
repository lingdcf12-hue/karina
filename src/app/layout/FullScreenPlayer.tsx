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
    toggleLike
  } = useMusicStore();

  if (!isOpen || !currentTrack) return null;

  const isLiked = likedTracks.find(t => t.id === currentTrack.id);
  const progressPercentage = (progress / (duration || 1)) * 100;

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#1a213a] via-[#121212] to-[#121212] text-white flex flex-col p-5 animate-in slide-in-from-bottom duration-500 ease-out overflow-hidden">
      <div className="flex-1 flex flex-col h-full max-w-md mx-auto w-full justify-between py-2">
        {/* Top Header */}
        <div className="flex items-center justify-between shrink-0">
          <button onClick={onClose} className="p-2 -ml-2 text-white active:scale-90 transition-transform">
            <ChevronDown className="w-8 h-8" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">Memutar dari koleksi kamu</span>
            <span className="text-[12px] font-bold truncate max-w-[200px]">Lagu yang Disukai</span>
          </div>
          <button className="p-2 -mr-2 text-white">
            <MoreHorizontal className="w-6 h-6" />
          </button>
        </div>

        {/* Album Art - Flexible height */}
        <div className="flex-1 flex items-center justify-center min-h-0 my-4">
          <div className="w-full aspect-square max-w-[85vh] max-h-[40vh] shadow-[0_20px_60px_rgba(0,0,0,0.7)] rounded-xl overflow-hidden active:scale-95 transition-transform duration-500">
            <img 
              src={currentTrack.album.images[0].url} 
              alt={currentTrack.name}
              className="w-full h-full object-cover" 
            />
          </div>
        </div>

        {/* Info, Seekbar, Controls Wrapper */}
        <div className="shrink-0 flex flex-col">
          {/* Song Info */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight truncate leading-tight">{currentTrack.name}</h1>
              <p className="text-[#b3b3b3] text-[16px] font-semibold truncate opacity-80">
                  {currentTrack.artists.map(a => a.name).join(', ')}
              </p>
            </div>
            <button onClick={() => toggleLike(currentTrack)} className="shrink-0 transition-all active:scale-125 p-1">
              {isLiked ? (
                  <CheckCircle2 className="w-8 h-8 text-[#1DB954] fill-current" />
              ) : (
                  <Heart className="w-8 h-8 text-[#b3b3b3]" />
              )}
            </button>
          </div>

          {/* Seekbar */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="relative w-full h-1 bg-white/20 rounded-full group cursor-pointer">
              <div className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100" style={{ width: `${progressPercentage}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" style={{ left: `calc(${progressPercentage}% - 6px)` }} />
              <input 
                type="range" 
                min="0" 
                max={duration || 0} 
                value={progress} 
                step="0.1"
                onChange={(e) => setProgress(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
              />
            </div>
            <div className="flex items-center justify-between text-[#b3b3b3] text-[10px] font-bold tabular-nums">
              <span>{formatTime(progress)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between mb-8 px-1">
            <button onClick={toggleShuffle} className={`${shuffle ? 'text-[#1DB954]' : 'text-white'} transition-colors`}>
              <Shuffle className="w-6 h-6" />
            </button>
            <button onClick={previousTrack} className="text-white active:scale-90 transition-transform">
              <SkipBack className="w-10 h-10 fill-current" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-xl active:scale-95 transition-transform shrink-0"
            >
              {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button onClick={nextTrack} className="text-white active:scale-90 transition-transform">
              <SkipForward className="w-10 h-10 fill-current" />
            </button>
            <button onClick={toggleRepeat} className={`${repeat !== 'off' ? 'text-[#1DB954]' : 'text-white'} transition-colors relative`}>
              <Repeat className="w-6 h-6" />
              {repeat === 'track' && <span className="absolute -top-1 -right-1 bg-[#121212] text-[#1DB954] text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full border border-[#1DB954]">1</span>}
            </button>
          </div>

          {/* Device and Share */}
          <div className="flex items-center justify-between mb-6 px-1">
            <button className="text-[#1DB954] flex items-center gap-2">
              <Laptop2 className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Web Player (Chrome)</span>
            </button>
            <div className="flex items-center gap-6">
              <button className="text-white opacity-60 hover:opacity-100 transition-opacity"><Share2 className="w-5 h-5" /></button>
              <button className="text-white opacity-60 hover:opacity-100 transition-opacity"><ListMusic className="w-5 h-5" /></button>
            </div>
          </div>
        </div>

        {/* Lyrics Box Preview */}
        <div className="bg-[#3e50b4] rounded-2xl p-5 relative overflow-hidden flex flex-col shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-black tracking-tight">Pratinjau lirik</h3>
            <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            </div>
          </div>
          <div className="flex flex-col gap-1 overflow-hidden">
            <p className="text-[20px] font-black text-white/40 leading-tight">Something's different about you,</p>
            <p className="text-[20px] font-black text-white leading-tight">I can feel it</p>
          </div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-[#5c69ff] blur-[50px] opacity-40 -mb-8 -mr-8" />
        </div>
      </div>
    </div>
  );
}
