import { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Mic2,
  ListMusic,
  Laptop2,
  Maximize2,
  CheckCircle2,
  MoreHorizontal,
  Heart,
  ChevronDown
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { formatTime } from '../utils/formatters';
import { FullScreenPlayer } from './FullScreenPlayer';

const TickerText = ({ text, className }: { text: string; className: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollAmount, setScrollAmount] = useState('0px');

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && textRef.current) {
        // Force wrap-max to measure the real width without truncation interference
        const originalWidth = textRef.current.style.width;
        textRef.current.style.width = 'max-content';
        const overflow = textRef.current.scrollWidth > containerRef.current.clientWidth;
        setIsOverflowing(overflow);
        if (overflow) {
          const amount = containerRef.current.clientWidth - textRef.current.scrollWidth - 12; // extra padding
          setScrollAmount(`${amount}px`);
        }
        textRef.current.style.width = originalWidth;
      }
    };
    
    checkOverflow();
    const timer = setTimeout(checkOverflow, 150);
    window.addEventListener('resize', checkOverflow);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [text]);

  return (
    <div 
      ref={containerRef} 
      className={`overflow-hidden relative w-full min-w-0 ${isOverflowing ? 'mask-fade-edges' : ''}`}
      style={{ '--scroll-amount': scrollAmount } as React.CSSProperties}
    >
      <div className={`flex whitespace-nowrap ${isOverflowing ? 'animate-marquee-ping-pong' : 'min-w-0 w-full'}`}>
        <span ref={textRef} className={`${className} ${isOverflowing ? 'w-max' : 'truncate block w-full'}`}>
          {text}
        </span>
      </div>
    </div>
  );
};

export function MusicPlayer() {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    repeat,
    shuffle,
    togglePlay,
    setVolume,
    setProgress,
    setDuration,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    pause,
    play,
    likedTracks,
    toggleLike,
    setDominantColor,
    currentView,
    setCurrentView,
  } = useMusicStore();

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioState, setAudioState] = useState('IDLE');
  const [player, setPlayer] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);

  // 1. Inisialisasi API YouTube
  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("YouTube API Ready");
      setIsReady(true);
    };

    if ((window as any).YT && (window as any).YT.Player) {
      setIsReady(true);
    }
  }, []);

  // 2. Buat atau Update Player
  useEffect(() => {
    if (!currentTrack || !isReady) return;

    if (!player) {
      const newPlayer = new (window as any).YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: currentTrack.id,
        playerVars: {
          'autoplay': 1,
          'controls': 0,
          'disablekb': 1,
          'fs': 0,
          'rel': 0,
          'origin': window.location.origin, // Kunci kestabilan
          'widget_referrer': window.location.origin
        },
        events: {
          'onReady': (event: any) => {
            setPlayer(event.target);
            setIsPlayerReady(true);
            setAudioState('READY');
            event.target.setVolume(volume);
            if (isPlaying) event.target.playVideo();
          },
          'onStateChange': (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
                setAudioState('PLAYING');
                setDuration(event.target.getDuration());
            }
            if (event.data === 2) setAudioState('PAUSED');
            if (event.data === 3) setAudioState('LOADING');
            if (event.data === 0) nextTrack(); // AUTO NEXT
          },
          'onError': (e: any) => {
              console.error("YT Player Error:", e.data);
              setAudioError("Gagal putar lagu ini. Mencoba lagu lain...");
              setTimeout(() => nextTrack(), 2000);
          }
        }
      });
    } else if (isPlayerReady) {
      setAudioState('LOADING');
      player.loadVideoById(currentTrack.id);
    }
  }, [currentTrack?.id, isReady, isPlayerReady]);

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
      }
    };
  }, [player]);

  // Sync Play/Pause
  useEffect(() => {
    if (!player || !isPlayerReady) return;
    try {
        if (isPlaying) player.playVideo();
        else player.pauseVideo();
    } catch (e) {
        console.warn("Player call failed (detached?):", e);
    }
  }, [isPlaying, player, isPlayerReady]);

  // Sync Volume
  useEffect(() => {
    if (player && isPlayerReady) {
        try {
            player.setVolume(isMuted ? 0 : volume);
        } catch (e) {}
    }
  }, [volume, isMuted, player, isPlayerReady]);

  // Progress Update
  useEffect(() => {
    if (!player || !isPlayerReady) return;
    const interval = setInterval(() => {
        try {
            if (player.getPlayerState() === (window as any).YT.PlayerState.PLAYING) {
                setProgress(player.getCurrentTime());
            }
        } catch (e) {}
    }, 500);
    return () => clearInterval(interval);
  }, [player, isPlayerReady]);

  const handleTogglePlay = () => {
    if (!currentTrack) return;
    togglePlay();
  };

  const handleNext = () => nextTrack();
  const handlePrevious = () => previousTrack();
  const handleVolumeToggle = () => {
    if (isMuted) { setVolume(previousVolume); setIsMuted(false); }
    else { setPreviousVolume(volume); setVolume(0); setIsMuted(true); }
  };
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (player && isFinite(newProgress)) {
        player.seekTo(newProgress, true);
        setProgress(newProgress);
    }
  };
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      switch (e.key.toLowerCase()) {
        case ' ': e.preventDefault(); handleTogglePlay(); break;
        case 'n': handleNext(); break;
        case 'p': handlePrevious(); break;
        case 'm': handleVolumeToggle(); break;
        case 'arrowright': if (player) player.seekTo(progress + 5, true); break;
        case 'arrowleft': if (player) player.seekTo(Math.max(0, progress - 5), true); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, player, progress]);

  const isLiked = currentTrack ? likedTracks.find(t => t.id === currentTrack.id) : null;
  const progressPercentage = (progress / (duration || 1)) * 100;

  // We always render the hidden player div so it stays in the DOM and doesn't detach the YouTube instance
  // but we hide the actual UI if there's no track.
  return (
    <div 
      className={`
        ${currentTrack ? 'flex' : 'hidden'}
        flex-col md:flex-row
        bg-black md:bg-black
        border-t border-white/5 md:border-[#121212]
        p-2 md:px-4 h-[64px] md:h-[90px]
        items-center justify-between select-none
        transition-all duration-300
        md:static fixed bottom-[64px] left-0 right-0 md:bottom-auto md:left-auto md:right-auto
        rounded-none
        bg-[#121212] border-t border-white/10 md:bg-black
        z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.5)]
      `}
      onClick={() => {
        // Entire bar opens fullscreen on mobile
        if (window.innerWidth < 768) setIsFullScreenOpen(true);
      }}
    >
      {/* Hidden Player Container - MUST ALWAYS BE PRESENT */}
      <div style={{ position: 'absolute', top: '-1000px', left: '-1000px' }}>
          <div id="youtube-player"></div>
      </div>
      
      {/* HUD Mini - hidden in production */}
      {false && (
        <div className="absolute -top-6 left-4 text-[9px] text-[#b3b3b3] bg-black/60 px-2 rounded-t hidden md:flex gap-2">
          <span>STATUS: <b className={audioState === 'PAUSED' ? 'text-yellow-500' : 'text-green-500'}>{audioState}</b></span>
          {audioError && <span className="text-red-400">| {audioError}</span>}
        </div>
      )}

      {/* Info Lagu (Kiri) */}
      <div 
        className="flex items-center gap-3 w-full md:w-[30%] min-w-0 md:pr-2 cursor-pointer md:cursor-default"
      >
        <img src={currentTrack?.album?.images[0]?.url} alt={currentTrack?.name} className="w-10 h-10 md:w-14 md:h-14 rounded object-cover shadow-lg shrink-0" />
        <div className="flex flex-col min-w-0 flex-1 overflow-hidden justify-center gap-[1px]">
          <TickerText text={currentTrack?.name || ''} className="text-white text-[13px] md:text-sm font-medium hover:underline cursor-pointer" />
          <div className="flex items-center gap-1.5 min-w-0">
             <span className="md:hidden w-3 h-3 text-[#1DB954] shrink-0">
                <svg viewBox="0 0 24 24" className="fill-current"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
             </span>
             <TickerText text={currentTrack?.artists?.map((a: any) => a.name).join(', ') || ''} className="text-[#b3b3b3] text-[11px] md:text-xs hover:text-white hover:underline cursor-pointer transition-colors" />
          </div>
        </div>
        
        {/* Mobile controls inside info area - stopPropagation to prevent fullscreen */}
        <div className="flex items-center gap-2 md:hidden shrink-0 ml-auto bg-[#121212] pl-2" onClick={(e) => e.stopPropagation()}>
            <button className="text-[#b3b3b3] hover:text-[#1DB954] transition-colors p-1">
               <Laptop2 className="w-5 h-5" />
            </button>
            <button onClick={() => toggleLike(currentTrack!)} className={`${isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3]'} p-1 transition-all`}>
                <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
            </button>
            <button onClick={handleTogglePlay} className="text-white p-1">
                {isPlaying ? <Pause className="w-7 h-7 fill-current" /> : <Play className="w-7 h-7 fill-current" />}
            </button>
        </div>
        
        {/* Desktop Like Button */}
        <div className="hidden md:flex items-center gap-4 shrink-0 px-2 ml-auto">
            <button onClick={() => toggleLike(currentTrack!)} className={`${isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3]'} transition-all`}>
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>
        </div>
      </div>

      {/* Kontrol (Tengah) - Sembunyikan di mobile */}
      <div className="hidden md:flex flex-col items-center max-w-[40%] w-full gap-2">
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleShuffle} 
            className={`relative ${shuffle ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <Shuffle className="w-5 h-5" />
            {shuffle && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1DB954] rounded-full" />
            )}
          </button>
          <button onClick={handlePrevious} className="text-[#b3b3b3] hover:text-white"><SkipBack className="w-6 h-6 fill-current" /></button>
          <button onClick={handleTogglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg">
            {isPlaying ? <Pause className="w-5 h-5 text-black fill-current" /> : <Play className="w-5 h-5 text-black fill-current ml-1" />}
          </button>
          <button onClick={handleNext} className="text-[#b3b3b3] hover:text-white"><SkipForward className="w-6 h-6 fill-current" /></button>
          <button 
            onClick={toggleRepeat} 
            className={`relative ${repeat !== 'off' ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
          >
            <Repeat className="w-5 h-5" />
            {repeat === 'track' && (
              <span className="absolute -top-1 -right-1 bg-black text-[#1DB954] text-[8px] font-bold w-3 h-3 flex items-center justify-center rounded-full border border-[#1DB954]">1</span>
            )}
            {repeat !== 'off' && (
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1DB954] rounded-full" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-2 w-full max-w-[622px]">
          <span className="text-[11px] text-[#b3b3b3] min-w-[35px] text-right">{formatTime(progress)}</span>
          <div className="relative flex-1 group h-1 flex items-center">
            <div className="absolute inset-0 bg-[#4d4d4d] rounded-full"></div>
            <div className="absolute inset-0 bg-white group-hover:bg-[#1DB954] rounded-full" style={{ width: `${progressPercentage}%` }} />
            <input type="range" min="0" max={duration || 0} value={progress} onChange={handleProgressChange} className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer z-10" />
            <div className="absolute w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 shadow-xl" style={{ left: `calc(${progressPercentage}% - 6px)` }} />
          </div>
          <span className="text-[11px] text-[#b3b3b3] min-w-[35px]">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume (Kanan) - Sembunyikan di mobile */}
      <div className="hidden md:flex items-center justify-end gap-3 w-[30%] min-w-0">
        <Mic2 className="w-4 h-4 text-[#b3b3b3]" />
        <ListMusic onClick={() => setCurrentView(currentView === 'queue' ? 'home' : 'queue')} className={`w-5 h-5 cursor-pointer ${currentView === 'queue' ? 'text-[#1DB954]' : 'text-[#b3b3b3]'}`} />
        <div className="flex items-center gap-2 group w-[100px]">
          <button onClick={handleVolumeToggle}>{volume === 0 || isMuted ? <VolumeX className="w-5 h-5 text-[#b3b3b3]" /> : <Volume2 className="w-5 h-5 text-[#b3b3b3]" />}</button>
          <div className="relative flex-1 h-1 flex items-center">
            <div className="absolute inset-0 bg-[#4d4d4d] rounded-full"></div>
            <div className="absolute inset-0 bg-white group-hover:bg-[#1DB954] rounded-full" style={{ width: `${volume}%` }} />
            <input type="range" min="0" max="100" value={volume} onChange={handleVolumeChange} className="absolute inset-0 w-full h-1 opacity-0 cursor-pointer z-10" />
          </div>
        </div>
        <Maximize2 className="w-4 h-4 text-[#b3b3b3]" />
      </div>

      <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-white/10 md:hidden overflow-hidden rounded-full mb-[2px]">
        <div className="h-full bg-white transition-all duration-300 rounded-full" style={{ width: `${progressPercentage}%` }} />
      </div>

      <FullScreenPlayer 
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
      />
    </div>
  );
}
