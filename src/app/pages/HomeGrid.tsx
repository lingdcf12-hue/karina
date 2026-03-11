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

  const playlists = collection.filter(item => item.type === 'Playlist' && item.id !== 'fav');

  useEffect(() => {
    fetch('http://localhost:3005/api/tracks')
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat pagi";
    if (hour < 18) return "Selamat siang";
    return "Selamat malam";
  };

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

  const recentlyPlayed = tracks.slice(0, 6);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-white">Memuat lagu...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto pb-24 relative">
      {/* Background Gradient */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
            background: `linear-gradient(to bottom, ${dominantColor}55, #121212 40%)`
        }}
      />

      {/* Header with Glassmorphism Effect */}
      <div className="sticky top-0 z-10 bg-[#121212]/30 backdrop-blur-md border-b border-white/5">
        <div className="px-8 py-4">
          <h1 className="text-3xl font-bold text-white">{getGreeting()}</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6 relative z-0">
        {/* Recently Played */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyPlayed.map((track) => {
              const isLiked = likedTracks.find(t => t.id === track.id);
              return (
              <div
                key={track.id}
                className="flex items-center gap-4 bg-[#181818]/60 hover:bg-[#282828] rounded transition-all duration-300 overflow-hidden group relative"
              >
                <button
                    className="flex flex-1 items-center gap-4 text-left"
                    onClick={() => handlePlayTrack(track)}
                >
                    <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="w-20 h-20 object-cover"
                    />
                    <div className="flex-1 pr-2 min-w-0">
                    <p className="text-white font-semibold truncate">
                        {track.name}
                    </p>
                    <p className="text-sm text-[#b3b3b3] truncate">
                        {track.artists.map((a) => a.name).join(', ')}
                    </p>
                    </div>
                </button>
                
                <div className="flex items-center gap-2 pr-4 relative">
                    <button 
                        onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                        className={`transition-all duration-200 ${isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3] opacity-0 group-hover:opacity-100'}`}
                    >
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </button>
                    <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform group-hover:translate-y-0 translate-y-2">
                        <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" onClick={() => handlePlayTrack(track)} />
                    </div>
                </div>
              </div>
              );
            })}
          </div>
        </section>

        {/* Playlists Section */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Dibuat untuk Kamu</h2>
            <button className="text-sm text-[#b3b3b3] hover:text-white transition-colors font-semibold">
              Tampilkan semua
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {mockPlaylists.map((playlist) => (
              <div
                key={playlist.id}
                className="bg-[#181818]/60 p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 cursor-pointer group"
              >
                <div className="relative mb-4">
                  <img
                    src={playlist.images[0].url}
                    alt={playlist.name}
                    className="w-full aspect-square object-cover rounded-lg shadow-xl"
                  />
                  <button
                    onClick={() => handlePlayTrack(playlist.tracks[0])}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0"
                  >
                    <Play
                      className="w-5 h-5 text-black ml-0.5"
                      fill="currentColor"
                    />
                  </button>
                </div>
                <h3 className="text-white font-semibold mb-2 truncate">
                  {playlist.name}
                </h3>
                <p className="text-sm text-[#b3b3b3] line-clamp-2">
                  {playlist.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Tracks */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Lagu Populer</h2>
            <button className="text-sm text-[#b3b3b3] hover:text-white transition-colors font-semibold">
              Tampilkan semua
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {tracks.map((track) => {
              const isLiked = likedTracks.find(t => t.id === track.id);
              return (
              <div
                key={track.id}
                className="bg-[#181818]/60 p-4 rounded-lg hover:bg-[#282828] transition-all duration-300 cursor-pointer group"
              >
                <div className="relative mb-4">
                  <img
                    src={track.album.images[0].url}
                    alt={track.name}
                    className="w-full aspect-square object-cover rounded-lg shadow-xl"
                  />
                  <button
                    onClick={() => handlePlayTrack(track)}
                    className="absolute bottom-2 right-2 w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-2xl transform translate-y-2 group-hover:translate-y-0"
                  >
                    <Play
                      className="w-5 h-5 text-black ml-0.5"
                      fill="currentColor"
                    />
                  </button>
                </div>
                <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                        <h3 className="text-white font-semibold mb-1 truncate text-sm">
                        {track.name}
                        </h3>
                        <p className="text-xs text-[#b3b3b3] truncate">
                        {track.artists.map((a) => a.name).join(', ')}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                          onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                          className={`transition-all duration-200 mt-1 ${isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3] hover:text-white'}`}
                      >
                          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button 
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#b3b3b3] hover:text-white mt-1"
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
              </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
