import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
    rightSidebarVisible,
    setRightSidebarVisible,
  } = useMusicStore();

  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [audioState, setAudioState] = useState('IDLE');
  const [isFullScreenOpen, setIsFullScreenOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // LOGIKA BARU: YouTube IFrame Engine (Hampir mustahil diblokir)
  useEffect(() => {
    // Load YouTube IFrame API
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log("✅ [AudioEngine] YouTube IFrame API Ready");
    };

    const unsub = useMusicStore.subscribe((state) => {
      const trackId = state.currentTrack?.id;
      
      // Init Player jika belum ada
      if (!ytPlayerRef.current && (window as any).YT && (window as any).YT.Player) {
        ytPlayerRef.current = new (window as any).YT.Player('yt-player-hidden', {
          height: '0',
          width: '0',
          videoId: trackId || '',
          playerVars: {
            'autoplay': 0,
            'controls': 0,
            'disablekb': 1,
            'fs': 0,
            'rel': 0,
            'showinfo': 0,
            'iv_load_policy': 3
          },
          events: {
            'onReady': (event: any) => {
              console.log("🎵 [AudioEngine] Player Ready");
              if (state.isPlaying && trackId) {
                event.target.playVideo();
              }
            },
            'onStateChange': async (event: any) => {
              // 0 = ended (Musik Selesai)
              if (event.data === 0) {
                const state = useMusicStore.getState();
                const oldId = state.currentTrack?.id;
                
                // Coba pindah ke lagu berikutnya di queue
                state.nextTrack();
                
                // JIKA QUEUE KOSONG ATAU HABIS (Lagu tidak berubah)
                // Kita ambil rekomendasi baru dari API
                setTimeout(async () => {
                  const newState = useMusicStore.getState();
                  if (newState.currentTrack?.id === oldId && state.repeat === 'off') {
                    console.log("📡 [AudioEngine] Queue habis, mencari rekomendasi baru...");
                    try {
                      const res = await fetch('/api/tracks');
                      const tracks = await res.json();
                      if (tracks && tracks.length > 0) {
                        // Ambil lagu pertama yang bukan lagu sekarang
                        const nextRec = tracks.find((t: any) => t.id !== oldId) || tracks[0];
                        newState.setCurrentTrack(nextRec);
                      }
                    } catch (e) {
                      console.error("Gagal ambil rekomendasi:", e);
                    }
                  }
                }, 500);
              }
              if (event.data === 1) setAudioState('PLAYING');
              if (event.data === 2) setAudioState('PAUSED');
              if (event.data === 3) setAudioState('LOADING');
            },
            'onError': () => {
              setAudioState('ERROR');
              setAudioError("Gagal memutar lagu. YouTube memblokir akses.");
            }
          }
        });
      }

      // Handle Track Change
      if (trackId && ytPlayerRef.current && ytPlayerRef.current.loadVideoById) {
        const currentId = ytPlayerRef.current.getVideoData?.()?.video_id;
        if (trackId !== currentId) {
          console.log(`🎵 [AudioEngine] Memutar via YouTube: ${state.currentTrack?.name}`);
          ytPlayerRef.current.loadVideoById(trackId);
          if (!state.isPlaying) ytPlayerRef.current.pauseVideo();
        }
      }

      // Handle Play/Pause
      if (ytPlayerRef.current && ytPlayerRef.current.playVideo) {
        if (state.isPlaying) {
          ytPlayerRef.current.playVideo();
        } else {
          ytPlayerRef.current.pauseVideo();
        }
      }

      // Handle Volume
      if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
        ytPlayerRef.current.setVolume(state.volume * 100);
      }
    });

    // Progress Tracker for YouTube
    progressIntervalRef.current = setInterval(() => {
      if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
        const currentTime = ytPlayerRef.current.getCurrentTime();
        const totalDuration = ytPlayerRef.current.getDuration();
        
        if (totalDuration > 0) {
          // Update local state for UI responsiveness
          const state = useMusicStore.getState();
          // Kita gunakan setProgress dari store agar UI Spotify terupdate
          (state as any).setProgress?.(currentTime);
          if (state.currentTrack) {
            // Jika durasi di store berbeda dengan asli YT, kita bisa update (opsional)
            if (state.duration !== totalDuration) {
              (state as any).setDuration?.(totalDuration);
            }
          }
        }
      }
    }, 500);

    return () => {
      unsub();
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Sync Initial Setup & Handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // init volume
    audio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume / 100));

    // Handle initial track on mount if any
    if (currentTrack && !audio.src) {
       const trackUrl = currentTrack.preview_url || `/api/stream?id=${currentTrack.id}`;
       audio.src = trackUrl;
       audio.load();
       if (isPlaying) audio.play().catch(() => {});
    }

    const handleTimeUpdate = () => useMusicStore.getState().setProgress(audio.currentTime);
    const handleLoadedMetadata = () => {
      setAudioState('READY');
      if (audio.duration && isFinite(audio.duration)) {
        useMusicStore.getState().setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
        // Sync trigger next track to maintain background playback!
        useMusicStore.getState().nextTrack();
    };
    const handlePlay = () => setAudioState('PLAYING');
    const handlePause = () => setAudioState('PAUSED');
    const handleWaiting = () => setAudioState('LOADING');
    const handlePlaying = () => setAudioState('PLAYING');
    const handleError = (e: Event) => {
      // Ignore empty src errors
      if (!audio.src || audio.src === window.location.href) return;
      console.error("Audio Error:", e);
      setAudioError("Gagal streaming lagu. Mencoba berikutnya...");
      setTimeout(() => useMusicStore.getState().nextTrack(), 2000);
    };

    // Fast event listeners directly attached
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Sync Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume / 100));
    }
  }, [volume, isMuted]);

  // Setup Media Session API (Natively supported by standard Audio)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.name,
      artist: currentTrack.artists?.map((a: any) => a.name).join(', '),
      album: currentTrack.album?.name || 'YouTube Music',
      artwork: [
        { src: currentTrack.album?.images[0]?.url || '', sizes: '512x512', type: 'image/jpeg' },
        { src: currentTrack.album?.images[1]?.url || '', sizes: '300x300', type: 'image/jpeg' },
        { src: currentTrack.album?.images[2]?.url || '', sizes: '64x64', type: 'image/jpeg' },
      ]
    });

    const handlers = [
        ['play', () => useMusicStore.getState().play()],
        ['pause', () => useMusicStore.getState().pause()],
        ['previoustrack', () => useMusicStore.getState().previousTrack()],
        ['nexttrack', () => useMusicStore.getState().nextTrack()],
        ['stop', () => useMusicStore.getState().pause()],
        ['seekto', (details: any) => { 
            if (details.seekTime !== undefined) {
                if (ytPlayerRef.current?.seekTo) {
                   ytPlayerRef.current.seekTo(details.seekTime, true);
                }
                if (audioRef.current) audioRef.current.currentTime = details.seekTime;
                useMusicStore.getState().setProgress(details.seekTime);
            }
        }]
    ];

    for (const [action, handler] of handlers) {
        try {
            navigator.mediaSession.setActionHandler(action as any, handler as any);
        } catch (error) {}
    }

    return () => {
        for (const [action] of handlers) {
            try { navigator.mediaSession.setActionHandler(action as any, null); } catch(e) {}
        }
    };
  }, [currentTrack]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }
  }, [isPlaying]);

  useEffect(() => {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && duration > 0 && isFinite(progress)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: 1,
          position: Math.max(0, Math.min(progress, duration))
        });
      } catch (e) {}
    }
  }, [progress, duration]);

  const handleTogglePlay = () => {
    if (!currentTrack) return;
    // Gesture unlock for iOS Safari to guarantee playback permission
    if (audioRef.current && audioRef.current.paused && audioRef.current.src) {
        audioRef.current.play().catch(() => {});
    }
    togglePlay();
  };

  const handleNext = () => {
    const state = useMusicStore.getState();
    const oldId = state.currentTrack?.id;
    state.nextTrack();
    
    // Jika manual klik next tapi queue kosong, cari rekomendasi
    setTimeout(async () => {
      const newState = useMusicStore.getState();
      if (newState.currentTrack?.id === oldId) {
        setAudioState('LOADING');
        try {
          const res = await fetch('/api/tracks');
          const tracks = await res.json();
          if (tracks.length > 0) {
            // PICK RANDOM: Biar rekomendasinya gak itu-itu aja
            const randomIndex = Math.floor(Math.random() * tracks.length);
            const nextRec = tracks[randomIndex];
            newState.setCurrentTrack(nextRec);
          }
        } catch (e) {}
      }
    }, 100);
  };
  
  const handlePrevious = () => {
    previousTrack();
  };
  const handleVolumeToggle = () => {
    if (isMuted) { setVolume(previousVolume); setIsMuted(false); }
    else { setPreviousVolume(volume); setVolume(0); setIsMuted(true); }
  };
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    if (isFinite(newProgress)) {
        // PERINTAH YOUTUBE: Lompat ke detik klik
        if (ytPlayerRef.current && ytPlayerRef.current.seekTo) {
          ytPlayerRef.current.seekTo(newProgress, true);
        }
        // Sync audio legacy
        if (audioRef.current) audioRef.current.currentTime = newProgress;
        
        // Update Visual Langsung
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
        case 'arrowright': 
          const forwardTime = progress + 5;
          if (ytPlayerRef.current?.seekTo) {
            ytPlayerRef.current.seekTo(forwardTime, true);
          } else if (audioRef.current) {
            audioRef.current.currentTime = forwardTime;
          }
          setProgress(forwardTime);
          break;
        case 'arrowleft': 
          const backTime = Math.max(0, progress - 5);
          if (ytPlayerRef.current?.seekTo) {
            ytPlayerRef.current.seekTo(backTime, true);
          } else if (audioRef.current) {
            audioRef.current.currentTime = backTime;
          }
          setProgress(backTime);
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentTrack, progress]);

  const isLiked = currentTrack ? likedTracks.find(t => t.id === currentTrack.id) : null;
  const progressPercentage = (progress / (duration || 1)) * 100;

  // We always render the hidden player div so it stays in the DOM and doesn't detach the YouTube instance
  // but we hide the actual UI if there's no track.
  return (
    <>
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
      {/* HUD Mini - hidden in production */}
      {false && (
        <div className="absolute -top-6 left-4 text-[9px] text-[#b3b3b3] bg-black/60 px-2 rounded-t hidden md:flex gap-2">

          <span>STATUS: <b className={audioState === 'PAUSED' ? 'text-yellow-500' : 'text-green-500'}>{audioState}</b></span>
          {audioError && <span className="text-red-400">| {audioError}</span>}
        </div>
      )}

      {/* Info Lagu (Kiri) */}
      <div 
        onClick={() => {
          if (window.innerWidth >= 768) setRightSidebarVisible(true);
        }}
        className="flex items-center gap-3 w-full md:w-[30%] min-w-0 md:pr-2 cursor-pointer"
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
        <button 
          onClick={() => setRightSidebarVisible(!rightSidebarVisible)}
          title="Tampilan Sedang Diputar"
          className={`transition-all hover:scale-110 active:scale-95 ${rightSidebarVisible ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute bottom-0 left-2 right-2 h-[3px] bg-white/10 md:hidden overflow-hidden rounded-full mb-[2px]">
        <div className="h-full bg-white transition-all duration-300 rounded-full" style={{ width: `${progressPercentage}%` }} />
      </div>
    </div>

    {/* Portal: render FullScreenPlayer at document.body level so it covers EVERYTHING */}
    {createPortal(
      <FullScreenPlayer 
        isOpen={isFullScreenOpen}
        onClose={() => setIsFullScreenOpen(false)}
      />,
      document.body
    )}

    {/* ===== HIDDEN AUDIO ELEMENT COMPULSORY FOR MOBILE BACKGROUND PLAY ===== */}
    {/* YouTube Hidden Engine */}
    <div id="yt-player-hidden" style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none', opacity: 0 }}></div>
    
    {/* Hidden Audio Element for Legacy Compatibility */}
    <audio ref={audioRef} className="hidden" playsInline preload="auto" />
    </>
  );
}
