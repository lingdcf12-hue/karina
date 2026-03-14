import { Play, Clock3, Heart, MoreHorizontal, Trash2, ListPlus, PlusCircle } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { Track } from '../types/music';
import { formatDuration } from '../utils/formatters';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuSeparator
} from "../components/ui/dropdown-menu";
import { toast } from 'sonner';

export function LikedSongsPage() {
  const { likedTracks, setCurrentTrack, toggleLike, addToQueue, collection, addPlaylist, addTrackToPlaylist, setQueue } = useMusicStore();
  const tracks = likedTracks;
  const playlists = collection.filter(item => item.type === 'Playlist' && item.id !== 'fav');

  const handleTrackClick = (track: Track) => {
    setQueue(tracks);
    setCurrentTrack(track);
  };

  const handleAddToNewPlaylist = (track: Track) => {
    const name = prompt("Masukkan nama playlist baru:", "Playlist Baru");
    if (name) {
      addPlaylist(name);
      toast.success(`Playlist "${name}" dibuat. Silakan tambahkan lagu lagi.`);
    }
  };

  const handlePlayLiked = () => {
    if (tracks.length > 0) {
      setQueue(tracks);
      setCurrentTrack(tracks[0]);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#450af5] to-[#121212] flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-8 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6 mt-8 md:mt-12 bg-black/20 text-center md:text-left">
        <div className="w-40 h-40 md:w-52 md:h-52 bg-gradient-to-br from-[#450af5] to-[#c4efd9] shadow-2xl flex items-center justify-center rounded">
          <Heart className="w-20 h-20 md:w-24 md:h-24 text-white fill-current" />
        </div>
        <div className="flex flex-col gap-2">
            <span className="text-white text-xs font-bold uppercase tracking-wider">Playlist</span>
            <h1 className="text-4xl md:text-8xl font-black text-white leading-tight">Lagu yang Disukai</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                <div className="w-6 h-6 rounded-full bg-[#3d3d3d] flex items-center justify-center overflow-hidden">
                    <span className="text-[10px] text-white">B</span>
                </div>
                <span className="text-white text-sm font-bold">Bagas</span>
                <span className="text-white text-sm opacity-70">• {tracks.length} lagu</span>
            </div>
        </div>
      </div>

      <div className="flex-1 bg-black/30 backdrop-blur-md p-8 pt-6 pb-32">
        {/* Actions Bar */}
        <div className="flex items-center gap-8 mb-8">
            <button 
                onClick={handlePlayLiked}
                disabled={tracks.length === 0}
                className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
                <Play className="w-7 h-7 text-black fill-current ml-1" />
            </button>
            <MoreHorizontal className="w-8 h-8 text-[#b3b3b3] hover:text-white cursor-pointer" />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[16px_1fr_minmax(120px,auto)] md:grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-[#b3b3b3] text-xs font-medium uppercase tracking-wider mb-4">
            <span className="hidden md:block">#</span>
            <div className="md:hidden flex items-center justify-center"><Heart className="w-4 h-4" /></div>
            <span>Judul</span>
            <span className="hidden md:block">Album</span>
            <div className="flex justify-end pr-4 md:pr-8">
                <Clock3 className="w-4 h-4" />
            </div>
        </div>

        {/* Tracks List */}
        {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#b3b3b3]">
                <Heart className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xl font-bold text-white mb-2">Lagu-lagu yang kamu sukai akan muncul di sini</p>
                <p>Temukan lagu baru lewat Pencarian.</p>
            </div>
        ) : (
            <div className="flex flex-col">
                {tracks.map((track, index) => (
                    <div 
                        key={track.id}
                        onClick={() => handleTrackClick(track)}
                        className="grid grid-cols-[16px_1fr_minmax(120px,auto)] md:grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded-md hover:bg-white/10 group transition-colors cursor-pointer items-center"
                    >
                        <span className="text-[#b3b3b3] text-sm group-hover:hidden hidden md:block">{index + 1}</span>
                        <Play className="w-3.5 h-3.5 text-white fill-current hidden group-hover:block" />
                        
                        <div className="flex items-center gap-3 min-w-0">
                            <img src={track.album.images[0].url} alt={track.name} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                            <div className="flex flex-col min-w-0">
                                <span className="text-white font-medium truncate">{track.name}</span>
                                <span className="text-xs text-[#b3b3b3] group-hover:text-white truncate">{track.artists.map(a => a.name).join(', ')}</span>
                            </div>
                        </div>

                        <span className="text-sm text-[#b3b3b3] group-hover:text-white truncate hidden md:block">{track.album.name}</span>

                        <div className="flex items-center justify-end gap-4 pr-4 relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                                className="text-[#1DB954] transition-all"
                            >
                                <Heart className="w-4 h-4 fill-current" />
                            </button>
                            <span className="text-xs text-[#b3b3b3] min-w-[32px]">{formatDuration(track.duration_ms)}</span>

                            <div className="relative">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button 
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-[#b3b3b3] hover:text-white md:opacity-0 md:group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <MoreHorizontal className="w-5 h-5" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56 bg-[#282828] border-[#3e3e3e] text-white">
                                        <DropdownMenuItem onClick={() => {
                                            addToQueue(track);
                                            toast.success("Ditambahkan ke antrean");
                                        }}>
                                            <ListPlus className="mr-2 h-4 w-4" />
                                            <span>Tambah ke antrean</span>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuSeparator className="bg-[#3e3e3e]" />
                                        
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <PlusCircle className="mr-2 h-4 w-4" />
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

                                        <DropdownMenuSeparator className="bg-[#3e3e3e]" />
                                        
                                        <DropdownMenuItem 
                                            className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
                                            onClick={() => {
                                                toggleLike(track);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Hapus dari lagu yang disukai</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
