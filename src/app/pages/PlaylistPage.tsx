import { Play, Clock3, Heart, MoreHorizontal, Music, Trash2, ListPlus, PlusCircle } from 'lucide-react';
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
import { EditPlaylistModal } from '../components/EditPlaylistModal';
import { useState } from 'react';

export function PlaylistPage() {
  const { collection, selectedId, setCurrentTrack, toggleLike, likedTracks, addToQueue, removeTrackFromPlaylist, addTrackToPlaylist, addPlaylist, setQueue } = useMusicStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const playlist = collection.find(item => item.id === selectedId);
  const otherPlaylists = collection.filter(item => item.type === 'Playlist' && item.id !== 'fav' && item.id !== selectedId);

  const handleAddToNewPlaylist = (track: Track) => {
    const name = prompt("Masukkan nama playlist baru:", "Playlist Baru");
    if (name) {
      addPlaylist(name);
      toast.success(`Playlist "${name}" dibuat. Silakan tambahkan lagu lagi.`);
    }
  };
  
  if (!playlist) return <div className="flex-1 flex items-center justify-center text-white">Playlist tidak ditemukan</div>;

  const tracks: Track[] = playlist.tracks || [];

  const handlePlayPlaylist = () => {
    if (tracks.length > 0) {
      setQueue(tracks);
      setCurrentTrack(tracks[0]);
    }
  };

  const handleTrackClick = (track: Track) => {
    setQueue(tracks);
    setCurrentTrack(track);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-[#282828] to-[#121212] flex flex-col">
      {/* Header */}
      <div 
        onClick={() => setIsEditModalOpen(true)}
        className="p-8 pb-6 flex items-end gap-6 mt-12 bg-black/20 hover:bg-black/30 transition-colors cursor-pointer group"
      >
        <div className="w-52 h-52 bg-[#282828] shadow-2xl flex items-center justify-center rounded overflow-hidden relative">
          {playlist.image === 'folder' ? (
              <Music className="w-24 h-24 text-[#b3b3b3]" />
          ) : (
              <img src={playlist.image || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300'} alt={playlist.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <PlusCircle className="w-12 h-12 text-white" />
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
            <span className="text-white text-xs font-bold uppercase tracking-wider">{playlist.type}</span>
            <h1 className="text-5xl md:text-8xl font-black text-white truncate max-w-4xl">{playlist.name}</h1>
            {playlist.description && (
                <p className="text-[#b3b3b3] text-sm mt-2 line-clamp-2">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 mt-4">
                <span className="text-white text-sm font-bold">{playlist.owner || 'Saya'}</span>
                <span className="text-white text-sm opacity-70">• {tracks.length} lagu</span>
            </div>
        </div>
      </div>

      <div className="flex-1 bg-black/30 backdrop-blur-md p-8 pt-6">
        {/* Actions Bar */}
        <div className="flex items-center gap-8 mb-8">
            <button 
                onClick={handlePlayPlaylist}
                disabled={tracks.length === 0}
                className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl disabled:opacity-50 disabled:hover:scale-100"
            >
                <Play className="w-7 h-7 text-black fill-current ml-1" />
            </button>
            <MoreHorizontal className="w-8 h-8 text-[#b3b3b3] hover:text-white cursor-pointer" />
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 border-b border-white/10 text-[#b3b3b3] text-xs font-medium uppercase tracking-wider mb-4">
            <span>#</span>
            <span>Judul</span>
            <span>Album</span>
            <div className="flex justify-end pr-8">
                <Clock3 className="w-4 h-4" />
            </div>
        </div>

        {/* Tracks List */}
        {tracks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-[#b3b3b3]">
                <Music className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xl font-bold text-white mb-2">Belum ada lagu di playlist ini</p>
                <p>Mulai cari lagu favoritmu!</p>
            </div>
        ) : (
            <div className="flex flex-col">
                {tracks.map((track, index) => {
                    const isLiked = likedTracks.find(t => t.id === track.id);
                    return (
                        <div 
                            key={track.id}
                            onClick={() => handleTrackClick(track)}
                            className="grid grid-cols-[16px_4fr_3fr_minmax(120px,1fr)] gap-4 px-4 py-2 rounded-md hover:bg-white/10 group transition-colors cursor-pointer items-center"
                        >
                            <span className="text-[#b3b3b3] text-sm group-hover:hidden">{index + 1}</span>
                            <Play className="w-3.5 h-3.5 text-white fill-current hidden group-hover:block" />
                            
                            <div className="flex items-center gap-3">
                                <img src={track.album.images[0].url} alt={track.name} className="w-10 h-10 rounded object-cover" />
                                <div className="flex flex-col">
                                    <span className="text-white font-medium truncate">{track.name}</span>
                                    <span className="text-xs text-[#b3b3b3] group-hover:text-white">{track.artists.map(a => a.name).join(', ')}</span>
                                </div>
                            </div>

                            <span className="text-sm text-[#b3b3b3] group-hover:text-white truncate">{track.album.name}</span>

                             <div className="flex items-center justify-end gap-4 pr-4 relative">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                                    className={`transition-all ${isLiked ? 'text-[#1DB954]' : 'text-[#b3b3b3] opacity-0 group-hover:opacity-100'}`}
                                >
                                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                                </button>
                                <span className="text-xs text-[#b3b3b3] min-w-[32px]">{formatDuration(track.duration_ms)}</span>
                                
                                <div className="relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button 
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
                                                        {otherPlaylists.map(pl => (
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
                                                    if (selectedId) removeTrackFromPlaylist(selectedId, track.id);
                                                }}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Hapus dari playlist</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>
      {selectedId && (
        <EditPlaylistModal 
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          playlistId={selectedId}
        />
      )}
    </div>
  );
}
