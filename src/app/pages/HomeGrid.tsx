import { useEffect, useState } from 'react';
import { Play, Heart, MoreHorizontal, PlusCircle } from 'lucide-react';
import { mockPlaylists } from '../data/mockData';
import { useMusicStore } from '../store/musicStore';
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

export function HomeGrid() {
  const { 
    setCurrentTrack, 
    addToQueue, 
    queue, 
    likedTracks, 
    toggleLike, 
    dominantColor,
    collection,
    addTrackToPlaylist,
    addPlaylist
  } = useMusicStore();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Semua');

  const playlists = collection.filter(item => item.type === 'Playlist' && item.id !== 'fav');

  useEffect(() => {
    fetch('/api/tracks')
      .then((res) => res.json())
      .then((data) => {
        setTracks(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching tracks:', err);
        setLoading(false);
      });
  }, []);

  const filters = ['Semua', 'Musik', 'Mengikuti', 'Podcast', 'Live Events'];

  const handlePlayTrack = (track: Track) => {
    tracks.forEach((t) => {
      if (!queue.find((q) => q.id === t.id)) {
        addToQueue(t);
      }
    });
    setCurrentTrack(track);
  };

  const handleAddToNewPlaylist = (track: Track) => {
    const name = prompt("Masukkan nama playlist baru:", "Playlist Baru");
    if (name) {
      addPlaylist(name);
      toast.success(`Playlist "${name}" dibuat.`);
    }
  };

  const recentlyPlayed = tracks.slice(0, 8);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#1DB954] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#b3b3b3]">Memuat lagu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pb-32 relative">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `linear-gradient(to bottom, ${dominantColor}66 0%, ${dominantColor}22 30%, #121212 60%)`
        }}
      />

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-10 bg-[#121212]/90 backdrop-blur-md pb-3 pt-4 px-4 md:px-6">
        <div className="flex items-center gap-2 flex-wrap">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                activeFilter === filter
                  ? 'bg-white text-black scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 relative z-0 mt-4 space-y-10">

        {/* ─── Recently Played Grid ─── */}
        <section>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {recentlyPlayed.map((track) => (
              <div
                key={track.id}
                className="flex items-center bg-white/10 hover:bg-white/20 rounded-md transition-all duration-200 overflow-hidden group cursor-pointer"
                style={{ height: '64px' }}
                onClick={() => handlePlayTrack(track)}
              >
                {/* Album Art */}
                <img
                  src={track.album.images[0].url}
                  alt={track.name}
                  className="h-full w-16 flex-shrink-0 object-cover"
                />

                {/* Track Name */}
                <div className="flex-1 px-3 min-w-0">
                  <p className="text-white text-sm font-bold leading-tight line-clamp-2">
                    {track.name}
                  </p>
                </div>

                {/* Play Button */}
                <div className="pr-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div
                    className="w-9 h-9 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                    onClick={(e) => { e.stopPropagation(); handlePlayTrack(track); }}
                  >
                    <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Dibuat Untuk (Playlists) ─── */}
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-xs font-semibold text-[#b3b3b3] uppercase tracking-widest mb-1">
                Dibuat Untuk
              </p>
              <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
                Yunshan
              </h2>
            </div>
            <button className="text-sm text-[#b3b3b3] hover:text-white transition-colors font-semibold tracking-wide flex-shrink-0">
              Tampilkan semua
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {mockPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-[#181818] p-3 rounded-lg hover:bg-[#282828] transition-all duration-300 cursor-pointer group flex flex-col"
              >
                {/* Cover Art */}
                <div className="relative mb-3">
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="w-full aspect-square object-cover rounded-md shadow-lg"
                  />
                  <button
                    onClick={() => handlePlayTrack(playlist.tracks[0])}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-2 group-hover:translate-y-0"
                  >
                    <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
                  </button>
                </div>

                {/* Info */}
                <h3 className="text-white text-sm font-semibold mb-1 truncate">
                  {playlist.name}
                </h3>
                <p className="text-xs text-[#b3b3b3] line-clamp-2 leading-relaxed flex-1">
                  {playlist.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── Lagu Populer ─── */}
        <section className="pb-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white">Lagu Populer</h2>
            <button className="text-sm text-[#b3b3b3] hover:text-white transition-colors font-semibold flex-shrink-0">
              Tampilkan semua
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {tracks.map((track) => {
              const isLiked = likedTracks.find(t => t.id === track.id);
              return (
                <div
                  key={track.id}
                  className="bg-[#181818] p-3 rounded-lg hover:bg-[#282828] transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  {/* Cover Art */}
                  <div className="relative mb-3">
                    <img
                      src={track.album.images[0].url}
                      alt={track.name}
                      className="w-full aspect-square object-cover rounded-md shadow-lg"
                    />
                    <button
                      onClick={() => handlePlayTrack(track)}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-2 group-hover:translate-y-0"
                    >
                      <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
                    </button>
                  </div>

                  {/* Info Row */}
                  <div className="flex items-start justify-between gap-1 flex-1">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white text-sm font-semibold mb-0.5 truncate leading-tight">
                        {track.name}
                      </h3>
                      <p className="text-xs text-[#b3b3b3] truncate">
                        {track.artists.map((a) => a.name).join(', ')}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                        className={`p-1 rounded-full transition-all duration-200 ${
                          isLiked
                            ? 'text-[#1DB954]'
                            : 'text-[#b3b3b3] md:opacity-0 md:group-hover:opacity-100'
                        }`}
                        title={isLiked ? 'Hapus dari Likes' : 'Suka'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                      </button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 rounded-full text-[#b3b3b3] hover:text-white md:opacity-0 md:group-hover:opacity-100 transition-all duration-200"
                            title="Opsi lainnya"
                          >
                            <MoreHorizontal className="w-4 h-4" />
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
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
