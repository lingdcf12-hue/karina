import { useRef, useEffect, useState } from 'react';
import { MoreHorizontal, Plus, Heart, Share2, X, Disc3, Globe } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';

/* ── Auto-Marquee component ───────────────────────────────────── */
interface MarqueeTextProps {
  text: string;
  className?: string;
}

function MarqueeText({ text, className = '' }: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollAmount, setScrollAmount] = useState('0px');

  useEffect(() => {
    const check = () => {
      if (containerRef.current && textRef.current) {
        const originalWidth = textRef.current.style.width;
        textRef.current.style.width = 'max-content';
        const overflow = textRef.current.scrollWidth > containerRef.current.clientWidth;
        setIsOverflowing(overflow);
        if (overflow) {
          const amount = containerRef.current.clientWidth - textRef.current.scrollWidth - 10;
          setScrollAmount(`${amount}px`);
        }
        textRef.current.style.width = originalWidth;
      }
    };
    check();
    const t = setTimeout(check, 150);
    window.addEventListener('resize', check);
    return () => { clearTimeout(t); window.removeEventListener('resize', check); };
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
}

/* ── RightSidebar ─────────────────────────────────────────────── */
export function RightSidebar() {
  const { currentTrack, toggleLike, likedTracks, setRightSidebarVisible } = useMusicStore();

  const isLiked = currentTrack ? likedTracks.find(t => t.id === currentTrack.id) : false;

  // Always render the 300px container — never return null — so both sidebars stay symmetric
  if (!currentTrack) {
    return (
      <div className="w-full h-full flex flex-col relative">
        <div className="bg-[#121212] rounded-lg p-3 flex-1 flex flex-col overflow-hidden select-none">
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#282828] flex items-center justify-center">
              <Disc3 className="w-8 h-8 text-[#535353]" />
            </div>
            <p className="text-[#535353] text-[13px] font-semibold leading-relaxed">
              Pilih lagu untuk melihat detail di sini
            </p>
          </div>
          
          {/* ── Standardized Footer ── */}
          <div className="px-5 pt-4 pb-7 flex flex-col gap-6 w-full flex-shrink-0 mt-auto bg-[#121212] border-t border-white/10 z-10">
            <div className="flex flex-wrap gap-x-4 gap-y-3 text-[11px] text-[#b3b3b3] font-medium leading-relaxed">
              <a href="#" className="hover:text-white transition-colors">Hukum</a>
              <a href="#" className="hover:text-white transition-colors">Pusat Keamanan &amp; Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition-colors">Cookie</a>
              <a href="#" className="hover:text-white transition-colors">Tentang Iklan</a>
              <a href="#" className="hover:text-white transition-colors">Aksesibilitas</a>
            </div>
            <button className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full border border-[#878787] text-white text-sm font-bold hover:scale-105 hover:border-white transition-all">
              <Globe className="w-4 h-4" />
              Bahasa Indonesia
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="bg-[#121212] rounded-lg p-3 flex-1 flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 flex-shrink-0 min-w-0">
        <div className="flex-1 min-w-0 pr-2">
          <MarqueeText
            text={currentTrack.album.name || currentTrack.name}
            className="text-white text-sm font-bold"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="text-[#b3b3b3] hover:text-white transition-colors hover:scale-105 p-1">
            <MoreHorizontal className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setRightSidebarVisible(false)}
            className="text-[#b3b3b3] hover:text-white transition-colors hover:scale-105 p-1 rounded-full bg-black/20 hover:bg-black/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-6 custom-scrollbar">

        {/* ── Album Art Card ── */}
        <div className="px-3">
          <div className="relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow w-full aspect-square">
            <img
              src={currentTrack.album.images[0].url}
              alt={currentTrack.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex items-start justify-between mt-3 gap-2">
            <div className="flex flex-col min-w-0 flex-1">
              <MarqueeText
                text={currentTrack.name}
                className="text-white text-[20px] font-extrabold font-inter leading-tight hover:underline cursor-pointer"
              />
              <MarqueeText
                text={currentTrack.artists.map(a => a.name).join(', ')}
                className="text-[#b3b3b3] text-sm font-medium mt-0.5 hover:underline cursor-pointer"
              />
            </div>
            <button
              onClick={() => toggleLike(currentTrack)}
              className="flex-shrink-0 text-[#b3b3b3] hover:scale-105 transition-transform p-1 mt-1"
            >
              {isLiked ? (
                <div className="w-5 h-5 rounded-full bg-[#1DB954] text-black flex items-center justify-center">
                   <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M9.998 16.5c-.26 0-.51-.1-.71-.29l-4-4a.999.999 0 111.41-1.41l3.3 3.3 8.29-8.3a.999.999 0 011.41 1.41l-9 9c-.2.2-.45.29-.7.29z"/></svg>
                </div>
              ) : (
                <Plus className="w-6 h-6 border-2 border-[#b3b3b3] hover:border-white hover:text-white rounded-full p-0.5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Tentang Artis ── */}
        <div className="mx-4 bg-[#242424] rounded-xl overflow-hidden relative group">
          <div className="relative h-40 w-full cursor-pointer overflow-hidden">
            <img
              src={currentTrack.album.images[0].url}
              alt={`${currentTrack.artists[0].name} profile`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark overlay specifically for Image 2 style */}
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute top-4 left-4 bg-black/40 px-2 py-1 rounded text-white text-[13px] font-bold">
              Tentang artis
            </div>
          </div>

          <div className="p-4 flex flex-col gap-2">
            <div className="flex justify-between items-center mb-1">
               <span className="text-white font-bold text-[15px] hover:underline cursor-pointer">
                 {currentTrack.artists[0].name}
               </span>
               <button className="text-xs font-bold text-white px-3 py-1.5 rounded-full border border-[#878787] hover:scale-105 hover:border-white transition-all">
                 Ikuti
               </button>
            </div>
            <div className="text-[#b3b3b3] text-[13px] flex items-center justify-between">
              <span>{Math.floor(currentTrack.popularity * 10000).toLocaleString('id-ID')} pendengar bulanan</span>
            </div>
            <p className="text-[#b3b3b3] text-[13px] leading-relaxed mt-2 line-clamp-3">
              Kariernya dimulai dengan hits <span className="text-white font-medium">{currentTrack.name}</span> dari <span className="text-white font-medium">{currentTrack.album.name}</span>.
            </p>
          </div>
        </div>

        {/* ── Kredit ── */}
        <div className="mx-4 bg-[#242424] rounded-xl p-4">
          <div className="flex items-centerjustify-between mb-4">
            <h3 className="text-white font-bold text-[15px]">Kredit</h3>
            <span className="text-[#b3b3b3] text-xs font-bold hover:text-white hover:underline cursor-pointer">Tampilkan semua</span>
          </div>
          <div className="space-y-4">
            {currentTrack.artists.map(artist => (
              <div key={artist.id} className="flex items-center justify-between group">
                <div className="min-w-0 pr-4 flex flex-col">
                  <MarqueeText
                    text={artist.name}
                    className="text-white text-[15px] font-bold hover:underline cursor-pointer"
                  />
                  <p className="text-[#b3b3b3] text-[13px] font-medium">Artis utama</p>
                </div>
                <button className="text-xs font-bold text-white px-3 py-1.5 rounded-full border border-[#878787] hover:scale-105 hover:border-white transition-all">
                 Ikuti
               </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Standardized Footer ── */}
      <div className="px-5 pt-4 pb-7 flex flex-col gap-6 w-full flex-shrink-0 mt-auto bg-[#121212] border-t border-white/10 z-10">
        <div className="flex flex-wrap gap-x-4 gap-y-3 text-[11px] text-[#b3b3b3] font-medium leading-relaxed">
          <a href="#" className="hover:text-white transition-colors">Hukum</a>
          <a href="#" className="hover:text-white transition-colors">Pusat Keamanan &amp; Privasi</a>
          <a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a>
          <a href="#" className="hover:text-white transition-colors">Cookie</a>
          <a href="#" className="hover:text-white transition-colors">Tentang Iklan</a>
          <a href="#" className="hover:text-white transition-colors">Aksesibilitas</a>
        </div>
        <button className="flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full border border-[#878787] text-white text-sm font-bold hover:scale-105 hover:border-white transition-all">
          <Globe className="w-4 h-4" />
          Bahasa Indonesia
        </button>
      </div>
    </div>
    </div>
  );
}
