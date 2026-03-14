import { useState, useRef, useEffect } from 'react';
import { 
  Plus, Search, List, Music, FolderOpen, 
  ChevronRight, ListPlus, Check, Menu, LayoutGrid, Grid2X2,
  Trash2, Edit3, Pin, Globe, UserPlus, XCircle
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { toast } from 'sonner';
import { EditPlaylistModal } from '../components/EditPlaylistModal';

function LibraryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" aria-hidden>
      <path d="M3 22a1 1 0 01-1-1V3a1 1 0 012 0v18a1 1 0 01-1 1zM15.5 2.134A1 1 0 0014 3v18a1 1 0 001.5.866l7-4a1 1 0 000-1.732l-7-4zM9 3a1 1 0 012 0v18a1 1 0 01-2 0V3z"/>
    </svg>
  );
}

export function LibraryPage() {
  const {
    collection, addFolder, addPlaylist,
    setSelectedId, togglePinPlaylist, removeCollectionItem,
    likedTracks, setCurrentView, user, selectedId
  } = useMusicStore();

  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Baru diputar');
  const [viewMode, setViewMode] = useState('list');
  const [localSearch, setLocalSearch] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const sortMenuRef = useRef<HTMLDivElement>(null);

  const filteredCollection = collection.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(localSearch.toLowerCase());
    const matchFilter = activeFilter === null || item.type === activeFilter;
    return matchSearch && matchFilter;
  });

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) setIsSortMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddPlaylist = () => {
    const name = prompt('Masukkan nama playlist:', 'Playlist Baru');
    if (name) { addPlaylist(name); toast.success(`Playlist "${name}" dibuat`); }
  };

  const handleAddFolder = () => {
    const name = prompt('Masukkan nama folder:', 'Folder Baru');
    if (name) { addFolder(name); toast.success(`Folder "${name}" dibuat`); }
  };

  const sortOptions = ['Baru diputar', 'Baru Ditambahkan', 'Abjad', 'Kreator'];
  const viewOptions = [
    { id: 'compact', icon: <Menu className="w-4 h-4" /> },
    { id: 'list', icon: <List className="w-4 h-4" /> },
    { id: 'grid', icon: <LayoutGrid className="w-4 h-4" /> },
  ];
  const isGrid = viewMode === 'grid';

  return (
    <div className="flex-1 flex flex-col bg-[#121212] overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-6 flex items-center justify-between bg-[#121212] z-20 border-b border-white/5">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#535353] md:hidden">
                {user ? (
                   <img
                     src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name || user.email}&backgroundColor=535353&textColor=ffffff`}
                     alt="Avatar"
                     className="w-full h-full object-cover"
                   />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                        <LibraryIcon />
                    </div>
                )}
            </div>
            <h1 className="text-2xl font-bold text-white">Koleksi Kamu</h1>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setIsSearchVisible(!isSearchVisible)}
                className="p-2 text-[#b3b3b3] hover:text-white transition-colors"
            >
                <Search className="w-6 h-6" />
            </button>
            <button 
                onClick={handleAddPlaylist}
                className="p-2 text-[#b3b3b3] hover:text-white transition-colors"
            >
                <Plus className="w-7 h-7" />
            </button>
        </div>
      </div>

      {/* Search Bar - Expanded */}
      {isSearchVisible && (
        <div className="px-4 py-2 bg-[#121212] border-b border-white/5">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#b3b3b3]" />
                <input 
                    autoFocus
                    type="text"
                    placeholder="Cari dalam koleksi"
                    value={localSearch}
                    onChange={e => setLocalSearch(e.target.value)}
                    className="w-full bg-[#2a2a2a] text-white text-sm pl-10 pr-4 py-2 rounded-md outline-none focus:ring-1 focus:ring-white/20"
                />
            </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-none bg-[#121212]">
        {['Playlist', 'Artis', 'Album', 'Podcast & Acara'].map(f => (
            <button
                key={f}
                onClick={() => setActiveFilter(activeFilter === f ? null : f)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                    activeFilter === f
                        ? 'bg-[#1DB954] text-black'
                        : 'bg-[#2a2a2a] text-white hover:bg-[#3d3d3d]'
                }`}
            >
                {f}
            </button>
        ))}
      </div>

      {/* Secondary Controls */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#121212]">
        <div className="relative" ref={sortMenuRef}>
            <button 
                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                className="flex items-center gap-1 text-[#b3b3b3] hover:text-white transition-colors text-xs font-bold"
            >
                <List className="w-4 h-4" />
                {sortBy}
            </button>
            {isSortMenuOpen && (
                <div className="absolute top-8 left-0 w-48 bg-[#282828] shadow-2xl rounded-md py-2 z-50 border border-[#3e3e3e]">
                    {sortOptions.map(opt => (
                        <button key={opt} onClick={() => { setSortBy(opt); setIsSortMenuOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-sm ${sortBy === opt ? 'text-[#1DB954]' : 'text-white'} hover:bg-[#3e3e3e]`}>
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
        <div className="flex items-center gap-2">
            {viewOptions.map(v => (
                <button 
                    key={v.id} 
                    onClick={() => setViewMode(v.id)}
                    className={`p-1.5 rounded-md transition-all ${viewMode === v.id ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
                >
                    {v.icon}
                </button>
            ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-24">
        {!user && (
            <div className="flex flex-col gap-4 p-4 mt-4">
                 <div className="bg-[#242424] rounded-lg p-5">
                    <p className="text-white font-bold mb-1">Buat playlist pertamamu</p>
                    <p className="text-[#b3b3b3] text-sm mb-4">Caranya mudah, kami akan membantumu</p>
                    <button onClick={() => setCurrentView('register')} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm tracking-tight hover:scale-105 transition-all">Buat playlist</button>
                </div>
                <div className="bg-[#242424] rounded-lg p-5">
                    <p className="text-white font-bold mb-1">Ikuti beberapa podcast</p>
                    <p className="text-[#b3b3b3] text-sm mb-4">Kami akan terus meng-update episode terbaru untukmu</p>
                    <button onClick={() => setCurrentView('register')} className="bg-white text-black px-5 py-2 rounded-full font-bold text-sm tracking-tight hover:scale-105 transition-all">Jelajahi podcast</button>
                </div>
            </div>
        )}

        {user && (
            <div className={isGrid ? "grid grid-cols-2 sm:grid-cols-3 gap-2" : "flex flex-col gap-1"}>
                {/* Liked Songs Tile (Always first) */}
                <div 
                    onClick={() => setCurrentView('liked-songs')}
                    className={`flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer transition-all ${isGrid ? 'flex-col items-center text-center' : ''}`}
                >
                    <div className={`bg-gradient-to-br from-[#450af5] to-[#8e8ee5] rounded flex items-center justify-center flex-shrink-0 shadow-lg ${isGrid ? 'w-full aspect-square' : 'w-16 h-16'}`}>
                        <Music className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate">Lagu yang Disukai</p>
                        <p className="text-[#b3b3b3] text-sm truncate">Playlist • {likedTracks.length} lagu</p>
                    </div>
                </div>

                {filteredCollection.filter(item => item.id !== 'fav').map(item => {
                    const isActive = selectedId === item.id;
                    return (
                        <div 
                            key={item.id}
                            onClick={() => { setSelectedId(item.id); setCurrentView('playlist'); }}
                            className={`flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer transition-all ${isGrid ? 'flex-col items-center text-center' : ''}`}
                        >
                            <div className={`bg-[#282828] rounded flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden ${isGrid ? 'w-full aspect-square' : 'w-16 h-16'}`}>
                                {item.image && item.image !== 'folder' ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                    <FolderOpen className="w-8 h-8 text-[#b3b3b3]" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`font-bold truncate ${isActive ? 'text-[#1DB954]' : 'text-white'}`}>{item.name}</p>
                                <p className="text-[#b3b3b3] text-sm truncate">{item.type} • {item.owner || 'Kamu'}</p>
                            </div>
                        </div>
                    );
                })}

                {/* Create New Playlist Tile */}
                <div 
                    onClick={handleAddPlaylist}
                    className={`flex items-center gap-3 p-2 rounded-md hover:bg-white/5 cursor-pointer transition-all group ${isGrid ? 'flex-col items-center text-center' : ''}`}
                >
                    <div className={`bg-[#282828] rounded flex items-center justify-center flex-shrink-0 border border-dashed border-white/20 group-hover:border-white/40 shadow-lg ${isGrid ? 'w-full aspect-square' : 'w-16 h-16'}`}>
                        <Plus className="w-8 h-8 text-[#b3b3b3] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate">Tambah Playlist Baru</p>
                        <p className="text-[#b3b3b3] text-sm truncate">Buat koleksi baru</p>
                    </div>
                </div>
            </div>
        )}
      </div>

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
