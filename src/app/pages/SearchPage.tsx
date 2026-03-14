import { useEffect, useState } from 'react';
import { Play, CheckCircle2, MoreHorizontal, ChevronRight, Heart, PlusCircle, Search, X } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { formatDuration } from '../utils/formatters';
import { Track } from '../types/music';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "../components/ui/dropdown-menu";
import { toast } from 'sonner';

export function SearchPage() {
  const { 
    searchQuery,
    setCurrentTrack,
    addToQueue,
    queue,
    likedTracks,
    toggleLike,
    collection,
    addTrackToPlaylist,
    addPlaylist,
    setSearchQuery
  } = useMusicStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  const playlists = collection.filter(item => item.type === 'Playlist' && item.id !== 'fav');

  useEffect(() => {
    if (!searchQuery) {
        setTracks([]);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    const handler = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          setTracks(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching tracks:', err);
          setLoading(false);
        });
    }, 500); // Tunggu 500ms setelah user berhenti mengetik
    
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handlePlayTrack = (track: Track) => {
    tracks.forEach((t) => {
      if (!queue.find((q) => q.id === t.id)) {
        addToQueue(t);
      }
    });
    setCurrentTrack(track);
  };

  const topResult = tracks[0];

  const handleAddToNewPlaylist = (track: Track) => {
    const name = prompt("Masukkan nama playlist baru:", "Playlist Baru");
    if (name) {
      addPlaylist(name);
      // We need the ID of the newly created playlist. 
      // Since it's pseudo-sync in Zustand, we might need a better way to get the ID.
      // For now, let's just toast that it was created and ask them to add again.
      toast.success(`Playlist "${name}" dibuat. Silakan tambahkan lagu lagi.`);
    }
  };

  const categories = [
    'Lagu', 'Album', 'Playlist', 'Artis', 'Podcast & Acara', 'Profil', 'Genre & Suasana'
  ];

  if (loading && searchQuery) {
    return <div className="flex-1 flex items-center justify-center text-white">Searching...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] p-4 md:p-8 pb-32">
      {/* Mobile Search Bar - Only visible on small screens */}
      <div className="md:hidden sticky top-0 z-20 bg-[#121212] pb-4 -mx-4 px-4">
        <h1 className="text-2xl font-bold text-white mb-4">Cari</h1>
        <div className="relative group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#121212] transition-colors pointer-events-none">
            <Search className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Apa yang ingin kamu putar?"
            className="w-full h-12 bg-white text-black pl-11 pr-12 rounded-lg text-sm font-bold placeholder-[#757575] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#757575] hover:text-black p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
      {/* Search Filters */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-none">
        <button className="px-3 py-1 bg-white text-black rounded-full text-sm font-medium">Semua</button>
        {categories.map(cat => (
          <button key={cat} className="px-3 py-1 bg-[#232323] text-white rounded-full text-sm font-medium hover:bg-[#2a2a2a] transition-colors whitespace-nowrap">
            {cat}
          </button>
        ))}
        <button className="p-1 bg-[#232323] text-white rounded-full hover:bg-[#2a2a2a]">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {searchQuery ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Result */}
            <div>
            <h2 className="text-2xl font-bold text-white mb-4">Hasil teratas</h2>
            {topResult ? (
                <div className="bg-[#181818] hover:bg-[#282828] p-5 rounded-lg transition-all group relative">
                <img 
                    src={topResult.album.images[0].url} 
                    alt={topResult.name}
                    className="w-24 h-24 rounded-md shadow-2xl mb-4 object-cover" 
                />
                <h3 className="text-3xl font-bold text-white mb-1">{topResult.name}</h3>
                <p className="text-sm text-[#b3b3b3]">
                    Lagu • <span className="text-white hover:underline cursor-pointer">{topResult.artists[0].name}</span>
                </p>
                
                <button 
                    onClick={() => handlePlayTrack(topResult)}
                    className="absolute right-6 bottom-6 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 transform hover:scale-105"
                >
                    <Play className="w-6 h-6 text-black fill-current ml-1" />
                </button>
                </div>
            ) : (
                <div className="text-[#b3b3b3]">Tidak ada hasil untuk "{searchQuery}"</div>
            )}
            </div>

            {/* Songs List */}
            <div>
            <h2 className="text-2xl font-bold text-white mb-4">Lagu</h2>
            <div className="space-y-1">
                {tracks.slice(0, 10).map((track) => {
                const isLiked = likedTracks.find(t => t.id === track.id);
                return (
                <div 
                    key={track.id}
                    onClick={() => handlePlayTrack(track)}
                    className="flex items-center gap-3 p-2 rounded-md hover:bg-[#2a2a2a] group transition-colors cursor-pointer"
                >
                    <div className="relative w-10 h-10 flex-shrink-0">
                    <img src={track.album.images[0].url} alt={track.name} className="w-full h-full rounded object-cover" />
                    <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-current" />
                    </div>
                    </div>
                    <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{track.name}</p>
                    <p className="text-xs text-[#b3b3b3] group-hover:text-white truncate">
                        {track.artists.map(a => a.name).join(', ')}
                    </p>
                    </div>
                    <div className="flex items-center gap-4 pr-2">
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                        className={`transition-all duration-200 ${isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3] opacity-0 group-hover:opacity-100'}`}
                    >
                        <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <span className="text-xs text-[#b3b3b3] min-w-[32px]">{formatDuration(track.duration_ms)}</span>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-[#282828] border-[#3e3e3e] text-white">
                        <DropdownMenuItem onClick={() => handlePlayTrack(track)}>
                          <Play className="mr-2 h-4 w-4" />
                          <span>Putar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addToQueue(track)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          <span>Tambahkan ke antrean</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-[#3e3e3e]" />
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <span>Tambahkan ke playlist</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuPortal>
                            <DropdownMenuSubContent className="bg-[#282828] border-[#3e3e3e] text-white ml-2">
                              <DropdownMenuItem onClick={() => handleAddToNewPlaylist(track)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                <span>Playlist baru</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-[#3e3e3e]" />
                              {playlists.map(pl => (
                                <DropdownMenuItem key={pl.id} onClick={() => {
                                  addTrackToPlaylist(pl.id, track);
                                  toast.success(`Ditambahkan ke "${pl.name}"`);
                                }}>
                                  <span>{pl.name}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuSubContent>
                          </DropdownMenuPortal>
                        </DropdownMenuSub>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    </div>
                </div>
                );
                })}
            </div>
            </div>
        </div>
      ) : (
          <div className="mt-4">
              <h2 className="text-2xl font-bold text-white mb-6">Jelajahi Semua</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                  {[
                      { name: 'Pop', color: '#8d67ab', img: 'https://images.unsplash.com/photo-1514525253361-bee87380cf40?w=300' },
                      { name: 'Hip-Hop', color: '#ba5d07', img: 'https://images.unsplash.com/photo-1546707012-c46675f72716?w=300' },
                      { name: 'Rock', color: '#e91429', img: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300' },
                      { name: 'Indie', color: '#608108', img: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?w=300' },
                      { name: 'Podcast', color: '#e13300', img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=300' },
                      { name: 'Fokus', color: '#503750', img: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=300' },
                  ].map(cat => (
                      <div key={cat.name} className="aspect-square p-4 rounded-lg cursor-pointer hover:scale-[1.02] transition-all overflow-hidden relative shadow-lg" style={{ backgroundColor: cat.color }}>
                          <h3 className="text-xl font-bold text-white z-10 relative">{cat.name}</h3>
                          <img 
                            src={cat.img} 
                            alt={cat.name} 
                            className="absolute -right-4 -bottom-4 w-24 h-24 rotate-25 shadow-2xl opacity-80"
                          />
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
}
