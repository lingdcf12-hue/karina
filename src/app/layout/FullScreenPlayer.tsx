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
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-[#1a213a] via-[#121212] to-[#121212] text-white flex flex-col p-6 animate-in slide-in-from-bottom duration-500 ease-out">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-10 pt-4">
        <button onClick={onClose} className="p-2 -ml-2 text-white">
          <ChevronDown className="w-8 h-8" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b3b3b3]">Memutar dari koleksi kamu</span>
          <span className="text-[13px] font-bold truncate max-w-[220px]">Lagu yang Disukai</span>
        </div>
        <button className="p-2 -mr-2 text-white">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Album Art */}
      <div className="flex-1 flex items-center justify-center mb-10">
        <div className="w-full aspect-square shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg overflow-hidden transition-transform duration-500 active:scale-95">
          <img 
            src={currentTrack.album.images[0].url} 
            alt={currentTrack.name}
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/* Song Info */}
      <div className="flex flex-col mb-6 px-1">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex flex-col gap-0.5">
            <h1 className="text-2xl font-black tracking-tight truncate">{currentTrack.name}</h1>
            <p className="text-[#b3b3b3] text-[15px] font-semibold truncate">
                {currentTrack.artists.map(a => a.name).join(', ')}
            </p>
          </div>
          <button onClick={() => toggleLike(currentTrack)} className="shrink-0 transition-all active:scale-125">
            {isLiked ? (
                <CheckCircle2 className="w-8 h-8 text-[#1DB954] fill-current" />
            ) : (
                <Heart className="w-8 h-8 text-[#b3b3b3]" />
            )}
          </button>
        </div>
      </div>

      {/* Seekbar */}
      <div className="flex flex-col gap-2 mb-8 px-1">
        <div className="relative w-full h-1 bg-white/20 rounded-full group">
           <div className="absolute top-0 left-0 h-full bg-white rounded-full" style={{ width: `${progressPercentage}%` }} />
           <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg" style={{ left: `calc(${progressPercentage}% - 6px)` }} />
           <input 
             type="range" 
             min="0" 
             max={duration || 0} 
             value={progress} 
             step="0.1"
             onChange={(e) => setProgress(parseFloat(e.target.value))}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
           />
        </div>
        <div className="flex items-center justify-between text-[#b3b3b3] text-[11px] font-semibold tabular-nums">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-between mb-10">
        <button onClick={toggleShuffle} className={`${shuffle ? 'text-[#1DB954]' : 'text-white'} transition-colors`}>
          <Shuffle className="w-6 h-6" />
        </button>
        <button onClick={previousTrack} className="text-white active:scale-90 transition-transform">
          <SkipBack className="w-10 h-10 fill-current" />
        </button>
        <button 
          onClick={togglePlay}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-xl active:scale-95 transition-transform"
        >
          {isPlaying ? <Pause className="w-9 h-9 fill-current" /> : <Play className="w-9 h-9 fill-current ml-1" />}
        </button>
        <button onClick={nextTrack} className="text-white active:scale-90 transition-transform">
          <SkipForward className="w-10 h-10 fill-current" />
        </button>
        <button onClick={toggleRepeat} className={`${repeat !== 'off' ? 'text-[#1DB954]' : 'text-white'} transition-colors relative`}>
          <Repeat className="w-6 h-6" />
          {repeat === 'track' && <span className="absolute -top-2 -right-2 text-[8px] font-bold">1</span>}
        </button>
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between mb-8 px-1">
        <button className="text-[#1DB954] flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Laptop2 className="w-5 h-5" />
          <span className="text-[11px] font-bold uppercase tracking-widest leading-none">Web Player (Chrome)</span>
        </button>
        <div className="flex items-center gap-7">
          <button className="text-white opacity-70 hover:opacity-100 transition-opacity"><Share2 className="w-6 h-6" /></button>
          <button className="text-white opacity-70 hover:opacity-100 transition-opacity"><ListMusic className="w-6 h-6" /></button>
        </div>
      </div>

      {/* Lyrics Box Preview */}
      <div className="mt-auto bg-[#3e50b4] rounded-2xl p-6 relative overflow-hidden flex flex-col">
         <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-black tracking-tight">Pratinjau lirik</h3>
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                <ChevronDown className="w-4 h-4 rotate-180" />
            </div>
         </div>
         <div className="flex flex-col gap-1.5 overflow-hidden">
            <p className="text-[26px] font-black text-white/40 leading-tight">Something's different about you,</p>
            <p className="text-[26px] font-black text-white leading-tight">I can feel it</p>
         </div>
         {/* Artistic background blur/gradient */}
         <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#5c69ff] blur-[60px] opacity-40 -mb-10 -mr-10" />
      </div>
    </div>
  );
}
