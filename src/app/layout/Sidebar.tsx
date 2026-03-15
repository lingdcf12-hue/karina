import { useState, useRef, useEffect } from 'react';
import {
  Plus, Search, List, Music, FolderOpen,
  Trash2, Edit3, Share2, Pin, Globe, UserPlus, XCircle, ChevronRight, ListPlus,
  Check, Menu, LayoutGrid, Grid2X2, Maximize2, Minimize2
} from 'lucide-react';
import { mockPlaylists, mockTracks } from '../data/mockData';
import { useMusicStore } from '../store/musicStore';
import { toast } from 'sonner';
import { EditPlaylistModal } from '../components/EditPlaylistModal';

/* ── Library SVG icon (matches Spotify exactly) ──────────────── */
function LibraryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden>
      <path d="M3 22a1 1 0 01-1-1V3a1 1 0 012 0v18a1 1 0 01-1 1zM15.5 2.134A1 1 0 0014 3v18a1 1 0 001.5.866l7-4a1 1 0 000-1.732l-7-4zM9 3a1 1 0 012 0v18a1 1 0 01-2 0V3z"/>
    </svg>
  );
}

/* ── Auto-Marquee ────────────────────────────────────────────── */
function MarqueeText({ text, className = '' }: { text: string; className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [scrollAmount, setScrollAmount] = useState('0px');

  useEffect(() => {
    const check = () => {
      if (containerRef.current && textRef.current) {
        const orig = textRef.current.style.width;
        textRef.current.style.width = 'max-content';
        const over = textRef.current.scrollWidth > containerRef.current.clientWidth;
        setIsOverflowing(over);
        if (over) setScrollAmount(`${containerRef.current.clientWidth - textRef.current.scrollWidth - 10}px`);
        textRef.current.style.width = orig;
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
        <span ref={textRef} className={`${className} ${isOverflowing ? 'w-max' : 'truncate block w-full'}`}>{text}</span>
      </div>
    </div>
  );
}

export function Sidebar() {
  const {
    collection, setCollection, addFolder, addPlaylist,
    setSelectedId, togglePinPlaylist, removeCollectionItem,
    likedTracks, setCurrentView, user, currentView, selectedId, currentTrack,
    sidebarExpanded, setSidebarExpanded
  } = useMusicStore();

  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Baru diputar');
  const [viewMode, setViewMode] = useState('list');
  const [localSearch, setLocalSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; itemId: string } | null>(null);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Initialize collection
  useEffect(() => {
    if (collection.length === 0) {
      const initial = [
        { id: 'fav', name: 'Lagu yang Disukai', type: 'Playlist', image: 'heart' },
        ...mockPlaylists.map(pl => ({ ...pl, type: 'Playlist', owner: pl.owner?.display_name || 'Kamu' })),
        ...mockTracks.slice(0, 5).map(t => ({ id: t.id, name: t.artists[0].name, type: 'Artis', image: t.album.images[0].url }))
      ];
      setCollection(initial);
    }
  }, []);

  const filteredCollection = collection.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(localSearch.toLowerCase());
    const matchFilter = activeFilter === null || item.type === activeFilter;
    return matchSearch && matchFilter;
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false);
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) setIsSortMenuOpen(false);
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) setContextMenu(null);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId: id });
  };

  const handleAddFolder = () => {
    const name = prompt('Masukkan nama folder:', 'Folder Baru');
    if (name) { addFolder(name); toast.success(`Folder "${name}" dibuat`); }
    setIsMenuOpen(false);
  };

  const handleAddPlaylist = () => {
    const name = prompt('Masukkan nama playlist:', 'Playlist Baru');
    if (name) { addPlaylist(name); toast.success(`Playlist "${name}" dibuat`); }
    setIsMenuOpen(false);
  };

  const getMenuOptions = (itemId: string) => {
    const item = collection.find(i => i.id === itemId);
    const isPlaylist = item?.type === 'Playlist';
    const isFav = itemId === 'fav';
    return [
      { icon: <ListPlus className="w-5 h-5" />, label: 'Tambahkan ke antrean' },
      { icon: <Edit3 className="w-5 h-5" />, label: 'Edit detail', action: (id: string) => setEditingPlaylistId(id), hidden: !isPlaylist || isFav },
      { icon: <Trash2 className="w-5 h-5 text-red-500" />, label: 'Hapus', action: (id: string) => { if (id !== 'fav') { removeCollectionItem(id); toast.success('Item dihapus'); } }, divider: true, hidden: isFav },
      { icon: <Music className="w-5 h-5" />, label: 'Buat playlist', action: () => handleAddPlaylist() },
      { icon: <Plus className="w-5 h-5" />, label: 'Buat folder', action: () => handleAddFolder(), divider: true },
      { icon: <Globe className="w-5 h-5" />, label: 'Jadikan publik', hidden: !isPlaylist || isFav },
      { icon: <UserPlus className="w-5 h-5" />, label: 'Undang kolaborator', hidden: !isPlaylist || isFav },
      { icon: <XCircle className="w-5 h-5" />, label: 'Kecualikan dari profil seleramu', divider: true, hidden: !isPlaylist || isFav },
      { icon: <FolderOpen className="w-5 h-5" />, label: 'Pindahkan ke folder', sub: true, hidden: isFav },
      { icon: <Pin className={`w-5 h-5 ${item?.isPinned ? 'text-[#1DB954] fill-[#1DB954]' : ''}`} />, label: item?.isPinned ? 'Lepas sematan' : 'Sematkan', action: (id: string) => togglePinPlaylist(id), hidden: !isPlaylist },
      { icon: <Share2 className="w-5 h-5" />, label: 'Bagikan', sub: true },
    ].filter(o => !o.hidden);
  };

  const sortOptions = ['Baru diputar', 'Baru Ditambahkan', 'Abjad', 'Kreator'];
  const viewOptions = [
    { id: 'compact', icon: <Menu className="w-4 h-4" /> },
    { id: 'list', icon: <List className="w-4 h-4" /> },
    { id: 'grid', icon: <LayoutGrid className="w-4 h-4" /> },
    { id: 'large-grid', icon: <Grid2X2 className="w-4 h-4" /> },
  ];
  const isGrid = viewMode === 'grid' || viewMode === 'large-grid';

  // Determine if an item is "active" (selected/currently viewed)
  const getIsActive = (item: any) => {
    if (item.id === 'fav') return currentView === 'liked-songs';
    return item.id === selectedId && currentView === 'playlist';
  };

  // Determine if an item is "playing" (current track belongs to this playlist/artist)
  const getIsPlaying = (item: any) => {
    if (!currentTrack) return false;
    if (item.type === 'Artis') return currentTrack.artists?.some((a: any) => a.name === item.name);
    return false; // For simplicity – could be expanded
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="bg-[#121212] rounded-lg flex-1 flex flex-col">

        {/* ══════════════════════════════════════════
            HEADER: Koleksi Kamu
        ══════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 flex-shrink-0">
          <button className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors group">
            <LibraryIcon />
            <span className="font-bold text-[15px] leading-none">Koleksi Kamu</span>
          </button>

          <div className="flex items-center gap-0.5">
            {/* "+" Add button */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(v => !v)}
                title="Buat playlist atau folder"
                className={`flex items-center justify-center w-8 h-8 rounded-full text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f] transition-all ${isMenuOpen ? 'text-white bg-[#1f1f1f]' : ''}`}
              >
                <Plus className="w-5 h-5" />
              </button>

              {isMenuOpen && (
                <div className="absolute top-10 right-0 w-[220px] bg-[#282828] shadow-[0_12px_32px_rgba(0,0,0,0.8)] rounded-md p-1 z-[100] border border-white/10 flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150">
                  <button onClick={user ? handleAddPlaylist : () => setCurrentView('register')}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#3e3e3e] transition-colors rounded-sm text-left group">
                    <div className="w-9 h-9 rounded-full bg-[#333] flex items-center justify-center text-[#b3b3b3] group-hover:text-white flex-shrink-0">
                      <Music className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white text-[13px] font-semibold leading-tight">Playlist</p>
                      <p className="text-[#b3b3b3] text-xs leading-tight mt-0.5">Buat playlist berisi lagu</p>
                    </div>
                  </button>
                  <div className="h-[1px] bg-[#3e3e3e] mx-2 my-0.5" />
                  <button onClick={user ? handleAddFolder : () => setCurrentView('register')}
                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-[#3e3e3e] transition-colors rounded-sm text-left group">
                    <div className="w-9 h-9 rounded-full bg-[#333] flex items-center justify-center text-[#b3b3b3] group-hover:text-white flex-shrink-0">
                      <FolderOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-white text-[13px] font-semibold leading-tight">Folder</p>
                      <p className="text-[#b3b3b3] text-xs leading-tight mt-0.5">Kelompokkan playlist-mu</p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Expand icon */}
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              title={sidebarExpanded ? "Perkecil" : "Perluas"}
              className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${
                sidebarExpanded ? 'text-white bg-[#1f1f1f]' : 'text-[#b3b3b3] hover:text-white hover:bg-[#1f1f1f]'
              }`}
            >
              {sidebarExpanded ? (
                <Minimize2 className="w-[18px] h-[18px]" />
              ) : (
                <Maximize2 className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            FILTER CHIPS — only when logged in
        ══════════════════════════════════════════ */}
        {user && (
          <div className="flex items-center gap-2 px-4 pb-2 overflow-x-auto scrollbar-none flex-shrink-0">
            {['Playlist', 'Artis'].map(f => (
              <button
                key={f}
                onClick={() => setActiveFilter(activeFilter === f ? null : f)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap select-none ${
                  activeFilter === f
                    ? 'bg-white text-black'
                    : 'bg-[#2a2a2a] text-white hover:bg-[#3d3d3d]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════
            SCROLLABLE BODY
        ══════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 flex flex-col">

          {/* ── GUEST VIEW ── */}
          {!user && (
            <div className="flex flex-col gap-2 px-2 pt-1 pb-3">
              <div className="bg-[#242424] rounded-lg p-4 flex flex-col items-start gap-3">
                <div>
                  <p className="text-white font-bold text-sm">Buat playlist pertamamu</p>
                  <p className="text-[#b3b3b3] text-[12px] mt-0.5">Caranya mudah, kami akan membantumu</p>
                </div>
                <button onClick={() => setCurrentView('register')}
                  className="bg-white text-black px-4 py-1.5 rounded-full text-[13px] font-bold hover:scale-105 transition-transform">
                  Buat playlist
                </button>
              </div>
              <div className="bg-[#242424] rounded-lg p-4 flex flex-col items-start gap-3">
                <div>
                  <p className="text-white font-bold text-sm">Ikuti beberapa podcast</p>
                  <p className="text-[#b3b3b3] text-[12px] mt-0.5">Kami akan terus meng-update episode terbaru untukmu</p>
                </div>
                <button onClick={() => setCurrentView('register')}
                  className="bg-white text-black px-4 py-1.5 rounded-full text-[13px] font-bold hover:scale-105 transition-transform">
                  Jelajahi podcast
                </button>
              </div>
            </div>
          )}

          {/* ── USER VIEW ── */}
          {user && (
            <div className="flex flex-col flex-1 min-h-0">

              {/* Search + Sort row (hidden by default, only search icon shows) */}
              <div className="flex items-center justify-between px-4 pb-1 flex-shrink-0 relative">
                <div className="flex items-center flex-1 min-w-0">
                  <button
                    onClick={() => { setIsSearchVisible(v => !v); if (isSearchVisible) setLocalSearch(''); }}
                    className="text-[#b3b3b3] hover:text-white p-1.5 hover:bg-[#1f1f1f] rounded-full transition-colors flex-shrink-0"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {isSearchVisible && (
                    <input
                      autoFocus
                      type="text"
                      placeholder="Cari dalam koleksi"
                      value={localSearch}
                      onChange={e => setLocalSearch(e.target.value)}
                      className="bg-[#2a2a2a] text-white text-xs px-2 py-1 rounded outline-none w-full ml-1.5"
                    />
                  )}
                </div>
                {!isSearchVisible && (
                  <div className="relative flex-shrink-0" ref={sortMenuRef}>
                    <button
                      onClick={() => setIsSortMenuOpen(v => !v)}
                      className="flex items-center gap-1 text-[#b3b3b3] hover:text-white transition-colors"
                    >
                      <span className={`text-xs font-semibold ${isSortMenuOpen ? 'text-white' : ''}`}>{sortBy}</span>
                      <List className="w-[14px] h-[14px]" />
                    </button>

                    {isSortMenuOpen && (
                      <div className="absolute top-8 right-0 w-[240px] bg-[#282828] shadow-[0_12px_32px_rgba(0,0,0,0.8)] rounded-md py-2 z-[100] border border-white/10 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                        <div className="py-2 flex flex-col">
                        <p className="text-[#b3b3b3] text-[10px] font-bold uppercase tracking-wider px-4 mb-2">Urutkan menurut</p>
                        {sortOptions.map(opt => (
                          <button key={opt} onClick={() => { setSortBy(opt); setIsSortMenuOpen(false); }}
                            className="flex items-center justify-between px-4 py-2.5 hover:bg-[#3e3e3e] transition-colors text-left">
                            <span className={`text-sm font-medium ${sortBy === opt ? 'text-[#1DB954]' : 'text-white'}`}>{opt}</span>
                            {sortBy === opt && <Check className="w-4 h-4 text-[#1DB954]" />}
                          </button>
                        ))}
                        <div className="h-[1px] bg-[#3e3e3e] my-3" />
                        <p className="text-[#b3b3b3] text-[10px] font-bold uppercase tracking-wider px-4 mb-2">Lihat dalam tampilan</p>
                        <div className="flex items-center gap-1 px-3">
                          {viewOptions.map(v => (
                            <button key={v.id} onClick={() => { setViewMode(v.id); setIsSortMenuOpen(false); }}
                              className={`p-2 rounded-md transition-all ${viewMode === v.id ? 'bg-[#3e3e3e] text-[#1DB954]' : 'text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'}`}>
                              {v.icon}
                            </button>
                          ))}
                        </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Collection List Items ── */}
              <div className={`pb-4 ${isGrid ? 'grid grid-cols-2 gap-1 px-2' : 'flex flex-col'}`}>
                {filteredCollection.map((item: any) => {
                  const isActive = getIsActive(item);
                  const isPlaying = getIsPlaying(item);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === 'fav') { setCurrentView('liked-songs'); }
                        else { setSelectedId(item.id); setCurrentView('playlist'); }
                      }}
                      onContextMenu={e => handleContextMenu(e, item.id)}
                      className={`flex items-center gap-3 w-full text-left transition-all group relative rounded-md ${
                        isGrid ? 'flex-col items-center p-3 text-center' :
                        viewMode === 'compact' ? 'px-2 py-1' : 'px-2 py-2'
                      } ${isActive ? 'bg-[#2a2a2a]' : 'hover:bg-[#1a1a1a]'}`}
                    >
                      {/* ── Thumbnail ── */}
                      {item.image === 'heart' ? (
                        <div className={`bg-gradient-to-br from-[#450af5] to-[#8e8ee5] rounded flex items-center justify-center flex-shrink-0 shadow-md ${
                          viewMode === 'compact' ? 'w-8 h-8' : isGrid ? 'w-full aspect-square' : 'w-12 h-12'
                        }`}>
                          <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] text-white fill-current">
                            <path d="M12.12 4.474c-.732-.832-1.957-1.424-3.52-1.424-2.583 0-4.6 2.083-4.6 4.704 0 3.328 3.018 5.759 7.6 10.22 4.582-4.461 7.6-6.892 7.6-10.22 0-2.621-2.017-4.704-4.6-4.704-1.563 0-2.788.592-3.48 1.424z"/>
                          </svg>
                        </div>
                      ) : item.image === 'folder' ? (
                        <div className={`bg-[#282828] rounded flex items-center justify-center flex-shrink-0 group-hover:bg-[#333] ${
                          viewMode === 'compact' ? 'w-8 h-8' : isGrid ? 'w-full aspect-square' : 'w-12 h-12'
                        }`}>
                          <FolderOpen className="w-5 h-5 text-[#b3b3b3]" />
                        </div>
                      ) : (
                        <img
                          src={item.image || item.images?.[0]?.url}
                          alt={item.name}
                          className={`flex-shrink-0 object-cover shadow-md ${
                            item.type === 'Artis' ? 'rounded-full' : 'rounded'
                          } ${viewMode === 'compact' ? 'w-8 h-8' : isGrid ? 'w-full aspect-square' : 'w-12 h-12'}`}
                        />
                      )}

                      {/* ── Text ── */}
                      <div className={`flex-1 min-w-0 ${isGrid ? 'w-full mt-1' : ''}`}>
                        <MarqueeText
                          text={item.name}
                          className={`text-[13px] font-semibold leading-tight ${isActive ? 'text-[#1DB954]' : 'text-white'}`}
                        />
                        {viewMode !== 'compact' && (
                          <div className={`flex items-center gap-1 mt-0.5 ${isGrid ? 'justify-center' : ''}`}>
                            {/* Green dot = item is active/playing */}
                            {(isActive || isPlaying) && (
                              <span className="text-[#1DB954] text-[10px] leading-none flex-shrink-0">●</span>
                            )}
                            {item.isPinned && !isActive && (
                              <Pin className="w-2.5 h-2.5 text-[#1DB954] fill-[#1DB954] -rotate-45 flex-shrink-0" />
                            )}
                            <MarqueeText
                              text={`${item.type}${item.id === 'fav'
                                ? ` • ${likedTracks.length} lagu`
                                : item.owner ? ` • ${item.owner}` : ''
                              }`}
                              className="text-[11px] text-[#b3b3b3] leading-tight"
                            />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════ */}
        <div className="px-4 pt-3 pb-5 flex flex-col gap-4 flex-shrink-0 border-t border-white/10">
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-[10px] text-[#b3b3b3] font-medium">
            {['Hukum', 'Pusat Keamanan & Privasi', 'Kebijakan Privasi', 'Cookie', 'Tentang Iklan', 'Aksesibilitas'].map(t => (
              <a key={t} href="#" className="hover:text-white transition-colors">{t}</a>
            ))}
          </div>
          <button className="flex items-center gap-1.5 w-fit px-3 py-1 rounded-full border border-[#727272] text-white text-xs font-bold hover:scale-105 hover:border-white transition-all">
            <Globe className="w-3.5 h-3.5" />
            Bahasa Indonesia
          </button>
        </div>
      </div>

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{ top: Math.min(contextMenu.y, window.innerHeight - 420), left: contextMenu.x }}
          className="fixed w-[260px] bg-[#282828] shadow-[0_16px_32px_rgba(0,0,0,0.5)] rounded-sm p-1 z-[100] border border-[#3e3e3e]/50 flex flex-col"
        >
          {getMenuOptions(contextMenu.itemId).map((opt, i) => (
            <div key={i}>
              <button
                onClick={() => { if (opt.action) opt.action(contextMenu.itemId); setContextMenu(null); }}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#3e3e3e] transition-colors rounded-sm text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#b3b3b3] group-hover:text-white">{opt.icon}</span>
                  <span className="text-white text-[13px] font-medium">{opt.label}</span>
                </div>
                {opt.sub && <ChevronRight className="w-4 h-4 text-[#b3b3b3]" />}
              </button>
              {opt.divider && <div className="h-[1px] bg-[#3e3e3e] my-1 mx-2" />}
            </div>
          ))}
        </div>
      )}

      {/* ── Edit Playlist Modal ── */}
      {editingPlaylistId && (
        <EditPlaylistModal
          isOpen={!!editingPlaylistId}
          onClose={() => setEditingPlaylistId(null)}
          playlistId={editingPlaylistId}
        />
      )}
    </div>
  );
}
