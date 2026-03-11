import { useState, useRef, useEffect } from 'react';
import { 
  Library, Plus, Search, List, ArrowRight, Music, Users, FolderOpen, 
  Trash2, Edit3, Share2, Pin, Globe, UserPlus, XCircle, ChevronRight, ListPlus,
  Check, Menu, LayoutGrid, Grid2X2
} from 'lucide-react';
import { mockPlaylists, mockTracks } from '../data/mockData';
import { useMusicStore } from '../store/musicStore';
import { toast } from 'sonner';
import { EditPlaylistModal } from '../components/EditPlaylistModal';

export function Sidebar() {
  const { 
    collection, 
    setCollection, 
    addFolder, 
    addPlaylist, 
    renameCollectionItem, 
    setSelectedId,
    togglePinPlaylist,
    removeCollectionItem,
    likedTracks,
    setCurrentView,
    user,
    isFavPinned // Added isFavPinned here
  } = useMusicStore();
  
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Baru diputar');
  const [viewMode, setViewMode] = useState('list'); // 'compact', 'list', 'grid', 'large-grid'
  const [localSearch, setLocalSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, itemId: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Initialize collection if empty ONLY after checking localStorage
  useEffect(() => {
    // We give a small delay to let Zustand hydrate if it hasn't yet, 
    // or we check if there's anything in the store.
    // If collection is still empty after first render, we populate it.
    if (collection.length === 0) {
      const initial = [
        { id: 'fav', name: 'Lagu yang Disukai', type: 'Playlist', image: 'heart' },
        ...mockPlaylists.map(pl => ({ ...pl, type: 'Playlist', owner: pl.owner.display_name })),
        ...mockTracks.slice(0, 5).map(t => ({ id: t.id, name: t.artists[0].name, type: 'Artis', image: t.album.images[0].url }))
      ];
      setCollection(initial);
    }
  }, []);

  const filteredCollection = collection.filter(item => 
    item.name.toLowerCase().includes(localSearch.toLowerCase())
  );

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setIsSortMenuOpen(false);
      }
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setContextMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, itemId: id });
  };

  const handleAddFolder = () => {
    const name = prompt("Masukkan nama folder:", "Folder Baru");
    if (name) {
      addFolder(name);
      toast.success(`Folder "${name}" dibuat`);
    }
    setIsMenuOpen(false);
  };

  const handleAddPlaylist = () => {
    const name = prompt("Masukkan nama playlist:", "Playlist Baru");
    if (name) {
      addPlaylist(name);
      toast.success(`Playlist "${name}" dibuat`);
    }
    setIsMenuOpen(false);
  };

  const handleRename = (id: string) => {
    const item = collection.find(i => i.id === id);
    if (!item) return;
    const newName = prompt(`Ubah nama "${item.name}" menjadi:`, item.name);
    if (newName && newName !== item.name) {
      renameCollectionItem(id, newName);
      toast.success(`Nama diubah menjadi "${newName}"`);
    }
  };

  const getMenuOptions = (itemId: string) => {
    const item = collection.find(i => i.id === itemId);
    const isPlaylist = item?.type === 'Playlist';
    const isFav = itemId === 'fav';

    const options = [
      { icon: <ListPlus className="w-5 h-5" />, label: "Tambahkan ke antrean" },
      { 
        icon: <Edit3 className="w-5 h-5" />, 
        label: "Edit detail", 
        action: (id: string) => setEditingPlaylistId(id),
        hidden: !isPlaylist || isFav
      },
      { 
        icon: <Trash2 className="w-5 h-5 text-red-500" />, 
        label: "Hapus", 
        action: (id: string) => {
          if (id === 'fav') return;
          removeCollectionItem(id);
          toast.success("Item dihapus dari koleksi");
        }, 
        divider: true,
        hidden: isFav
      },
      { icon: <Music className="w-5 h-5" />, label: "Buat playlist", action: () => handleAddPlaylist() },
      { icon: <Plus className="w-5 h-5" />, label: "Buat folder", action: () => handleAddFolder(), divider: true },
      { icon: <Globe className="w-5 h-5" />, label: "Jadikan publik", hidden: !isPlaylist || isFav },
      { icon: <UserPlus className="w-5 h-5" />, label: "Undang kolaborator", hidden: !isPlaylist || isFav },
      { icon: <XCircle className="w-5 h-5" />, label: "Kecualikan dari profil seleramu", divider: true, hidden: !isPlaylist || isFav },
      { icon: <FolderOpen className="w-5 h-5" />, label: "Pindahkan ke folder", sub: true, hidden: isFav },
      { 
        icon: <Pin className={`w-5 h-5 ${item?.isPinned ? 'text-[#1DB954] fill-[#1DB954]' : ''}`} />, 
        label: item?.isPinned ? "Lepas sematan" : "Sematkan",
        action: (id: string) => togglePinPlaylist(id),
        hidden: !isPlaylist
      },
      { icon: <Share2 className="w-5 h-5" />, label: "Bagikan", sub: true },
    ];

    return options.filter(opt => !opt.hidden);
  };

  const sortOptions = ["Baru diputar", "Baru Ditambahkan", "Abjad", "Kreator"];
  const viewOptions = [
    { id: 'compact', icon: <Menu className="w-5 h-5" /> },
    { id: 'list', icon: <List className="w-5 h-5" /> },
    { id: 'grid', icon: <LayoutGrid className="w-5 h-5" /> },
    { id: 'large-grid', icon: <Grid2X2 className="w-5 h-5" /> }
  ];

  return (
    <div className="w-[300px] bg-[#000000] h-full flex flex-col gap-2 p-2 relative">
      {/* Library Section */}
      <div className="bg-[#121212] rounded-lg p-3 flex-1 overflow-hidden flex flex-col relative">
        <div className="flex items-center justify-between mb-4 px-2 pt-1 relative">
          <button className="flex items-center gap-2 text-[#b3b3b3] hover:text-white transition-colors group">
            <Library className="w-6 h-6" />
            <span className="font-bold">Koleksi Kamu</span>
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`text-[#b3b3b3] hover:text-white transition-colors p-1.5 hover:bg-[#1f1f1f] rounded-full ${isMenuOpen ? 'text-white' : ''}`}
            >
              <Plus className="w-5 h-5" />
            </button>
            <button className="text-[#b3b3b3] hover:text-white transition-colors p-1.5 hover:bg-[#1f1f1f] rounded-full">
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* + Click Menu */}
            {isMenuOpen && (
              <div 
                ref={menuRef}
                className="absolute top-10 right-0 w-[240px] bg-[#282828] shadow-[0_8px_16px_rgba(0,0,0,0.5)] rounded-md p-1 z-50 border border-[#3e3e3e] flex flex-col gap-1"
              >
                <button 
                  onClick={user ? handleAddPlaylist : () => setCurrentView('register')}
                  className="flex items-center gap-3 p-3 hover:bg-[#3e3e3e] transition-colors rounded-sm text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#b3b3b3] group-hover:text-white">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Playlist</p>
                    <p className="text-[#b3b3b3] text-xs">Buat playlist berisi lagu atau episode</p>
                  </div>
                </button>
                <div className="h-[1px] bg-[#3e3e3e] my-1 mx-2"></div>
                <button 
                  onClick={user ? handleAddFolder : () => setCurrentView('register')}
                  className="flex items-center gap-3 p-3 hover:bg-[#3e3e3e] transition-colors rounded-sm text-left group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center text-[#b3b3b3] group-hover:text-white">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">Folder</p>
                    <p className="text-[#b3b3b3] text-xs">Atur playlist-mu</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Content Based on Auth State */}
        {!user ? (
          <div className="flex-1 overflow-y-auto space-y-6 flex flex-col pb-4 custom-scrollbar">
            <div className="flex flex-col gap-4 flex-1">
              <div className="bg-[#242424] rounded-lg p-5 flex flex-col items-start gap-4">
                <div>
                  <h3 className="text-white font-bold text-base mb-1">Buat playlist pertamamu</h3>
                  <p className="text-sm text-[#b3b3b3]">Caranya mudah, kami akan membantumu</p>
                </div>
                <button onClick={() => setCurrentView('register')} className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:scale-105 transition-transform">
                  Buat playlist
                </button>
              </div>
              
              <div className="bg-[#242424] rounded-lg p-5 flex flex-col items-start gap-4">
                <div>
                  <h3 className="text-white font-bold text-base mb-1">Ayo cari beberapa podcast untuk diikuti</h3>
                  <p className="text-sm text-[#b3b3b3]">Kami akan mengabarimu jika ada episode baru</p>
                </div>
                <button onClick={() => setCurrentView('register')} className="bg-white text-black px-4 py-1.5 rounded-full text-sm font-bold hover:scale-105 transition-transform">
                  Telusuri podcast
                </button>
              </div>
            </div>

            {/* Sidebar Footer for Guests */}
            <div className="px-2 pb-6 flex flex-col gap-6 w-full">
              <div className="flex flex-wrap gap-x-4 gap-y-3 text-[11px] text-[#b3b3b3]">
                <a href="#" className="hover:underline">Hukum</a>
                <a href="#" className="hover:underline">Pusat Keamanan &amp; Privasi</a>
                <a href="#" className="hover:underline">Kebijakan Privasi</a>
                <a href="#" className="hover:underline">Cookie</a>
                <a href="#" className="hover:underline">Tentang Iklan</a>
                <a href="#" className="hover:underline">Aksesibilitas</a>
              </div>
              <button className="flex items-center gap-1 w-fit px-3 py-1.5 rounded-full border border-[#878787] text-white text-sm font-bold hover:scale-105 hover:border-white transition-all">
                <Globe className="w-4 h-4" />
                Bahasa Indonesia
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
        <div className="flex items-center gap-2 mb-4 px-2 overflow-x-auto scrollbar-none">
          <button className="px-3 py-1.5 bg-[#2a2a2a] text-white rounded-full text-xs font-bold hover:bg-[#3d3d3d] transition-colors whitespace-nowrap">
            Playlist
          </button>
          <button className="px-3 py-1.5 bg-[#2a2a2a] text-white rounded-full text-xs font-bold hover:bg-[#3d3d3d] transition-colors whitespace-nowrap">
            Artis
          </button>
        </div>

        {/* Search and Sort */}
        <div className="flex items-center justify-between px-2 mb-2 flex-shrink-0 relative">
          <div className="flex items-center flex-1">
            <button 
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="text-[#b3b3b3] hover:text-white p-2 hover:bg-[#1f1f1f] rounded-full transition-colors"
            >
                <Search className="w-4 h-4" />
            </button>
            {isSearchVisible && (
                <input 
                    autoFocus
                    type="text"
                    placeholder="Cari dalam koleksi"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    className="bg-[#2a2a2a] text-white text-xs px-2 py-1 rounded outline-none w-full ml-2 animate-in fade-in slide-in-from-left-2 duration-200"
                />
            )}
          </div>
          {!isSearchVisible && (
          <button 
            onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
            className="flex items-center gap-1 text-[#b3b3b3] hover:text-white transition-colors group"
          >
            <span className={`text-sm font-medium ${isSortMenuOpen ? 'text-white' : ''}`}>{sortBy}</span>
            <List className="w-4 h-4" />
          </button>
          )}

          {/* Sort & View Menu */}
          {isSortMenuOpen && (
            <div 
              ref={sortMenuRef}
              className="absolute top-8 right-0 w-[240px] bg-[#282828] shadow-[0_8px_32px_rgba(0,0,0,0.7)] rounded-md py-4 z-50 border border-[#3e3e3e] flex flex-col"
            >
              <div className="px-3 mb-2">
                <p className="text-[#b3b3b3] text-[11px] font-bold uppercase tracking-wider">Urutkan menurut</p>
              </div>
              <div className="flex flex-col mb-4">
                {sortOptions.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => { setSortBy(opt); setIsSortMenuOpen(false); }}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-[#3e3e3e] transition-colors text-left"
                  >
                    <span className={`text-sm font-medium ${sortBy === opt ? 'text-[#1DB954]' : 'text-white'}`}>{opt}</span>
                    {sortBy === opt && <Check className="w-5 h-5 text-[#1DB954]" />}
                  </button>
                ))}
              </div>
              
              <div className="h-[1px] bg-[#3e3e3e] mb-4"></div>
              
              <div className="px-3 mb-2">
                <p className="text-[#b3b3b3] text-[11px] font-bold uppercase tracking-wider">Lihat dalam tampilan</p>
              </div>
              <div className="flex items-center justify-around px-2 pt-1">
                {viewOptions.map(view => (
                  <button 
                    key={view.id}
                    onClick={() => { setViewMode(view.id); setIsSortMenuOpen(false); }}
                    className={`p-2.5 rounded-md transition-all ${viewMode === view.id ? 'bg-[#3e3e3e] text-[#1DB954] shadow-inner' : 'text-[#b3b3b3] hover:bg-[#3e3e3e] hover:text-white'}`}
                  >
                    {view.icon}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* List Content */}
        <div className={`flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar ${viewMode === 'grid' || viewMode === 'large-grid' ? 'grid grid-cols-2 gap-2 space-y-0' : ''}`}>
          {filteredCollection.map((item: any) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'fav') {
                    setCurrentView('liked-songs');
                } else {
                    setSelectedId(item.id);
                    setCurrentView('playlist');
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, item.id)}
              className={`flex items-center gap-3 p-2 rounded-md hover:bg-[#1a1a1a] transition-all w-full group text-left relative ${
                viewMode === 'compact' ? 'py-1' : (viewMode === 'grid' || viewMode === 'large-grid' ? 'flex-col items-center p-3 text-center' : '')
              }`}
            >
              {item.image === 'heart' ? (
                <div className={`${viewMode === 'compact' ? 'w-8 h-8' : (viewMode === 'large-grid' ? 'w-full aspect-square' : 'w-12 h-12')} bg-gradient-to-br from-[#450af5] to-[#8e8ee5] rounded flex items-center justify-center flex-shrink-0 shadow-lg`}>
                   <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                     <path d="M12.12 4.474c-.732-.832-1.957-1.424-3.52-1.424-2.583 0-4.6 2.083-4.6 4.704 0 3.328 3.018 5.759 7.6 10.22 4.582-4.461 7.6-6.892 7.6-10.22 0-2.621-2.017-4.704-4.6-4.704-1.563 0-2.788.592-3.48 1.424z"/>
                   </svg>
                </div>
              ) : item.image === 'folder' ? (
                <div className={`${viewMode === 'compact' ? 'w-8 h-8' : (viewMode === 'large-grid' ? 'w-full aspect-square' : 'w-12 h-12')} bg-[#282828] rounded flex items-center justify-center flex-shrink-0 group-hover:bg-[#333]`}>
                  <FolderOpen className="w-6 h-6 text-[#b3b3b3]" />
                </div>
              ) : (
                <img
                  src={item.image || (item.images && item.images[0].url)}
                  alt={item.name}
                  className={`flex-shrink-0 object-cover ${item.type === 'Artis' ? 'rounded-full' : 'rounded'} ${
                    viewMode === 'compact' ? 'w-8 h-8' : (viewMode === 'large-grid' ? 'w-full aspect-square' : 'w-12 h-12')
                  }`}
                />
              )}
              <div className={`flex-1 min-w-0 ${viewMode === 'grid' || viewMode === 'large-grid' ? 'w-full mt-1' : ''}`}>
                <p className={`text-white text-sm font-semibold truncate ${item.id === 'fav' ? 'text-[#1DB954]' : ''}`}>
                  {item.name}
                </p>
                {viewMode !== 'compact' && (
                  <div className={`flex items-center gap-1 ${viewMode === 'grid' || viewMode === 'large-grid' ? 'justify-center' : ''}`}>
                    {item.isPinned && <Pin className="w-3.5 h-3.5 text-[#1DB954] fill-[#1DB954] -rotate-45" />}
                    {item.type === 'Artis' && <span className="text-[#1DB954]">📌</span>}
                    <p className="text-xs text-[#b3b3b3] truncate">
                      {item.type} • {item.id === 'fav' ? `${likedTracks.length} lagu` : (item.count !== undefined ? `${item.count} lagu` : item.owner || 'Yunshan')}
                    </p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
          </>
        )}
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div 
          ref={contextMenuRef}
          style={{ 
            top: Math.min(contextMenu.y, window.innerHeight - 450), 
            left: contextMenu.x 
          }}
          className="fixed w-[260px] bg-[#282828] shadow-[0_16px_32px_rgba(0,0,0,0.5)] rounded-sm p-1 z-[100] border border-[#3e3e3e]/50 py-1 flex flex-col"
        >
          {getMenuOptions(contextMenu.itemId).map((opt, i) => (
            <div key={i}>
              <button 
                onClick={() => {
                  if (opt.action) opt.action(contextMenu.itemId);
                  setContextMenu(null);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-[#3e3e3e] transition-colors rounded-sm text-left group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#b3b3b3] group-hover:text-white">{opt.icon}</span>
                  <span className="text-white text-[13px] font-medium">{opt.label}</span>
                </div>
                {opt.sub && <ChevronRight className="w-4 h-4 text-[#b3b3b3]" />}
              </button>
              {opt.divider && <div className="h-[1px] bg-[#3e3e3e] my-1 mx-2"></div>}
            </div>
          ))}
        </div>
      )}

      {/* Edit Detail Modal */}
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
