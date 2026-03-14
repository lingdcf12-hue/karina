import { Play, Clock3, Heart, MoreHorizontal, Music, Trash2, ListPlus, PlusCircle, Shuffle } from 'lucide-react';
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
      toast.success(`Playlist "${name}" dibuat.`);
    }
  };
  
  if (!playlist) return (
    <div className="flex-1 flex items-center justify-center text-white flex-col gap-3">
      <Music className="w-16 h-16 text-[#b3b3b3] opacity-30" />
      <p className="text-[#b3b3b3]">Playlist tidak ditemukan</p>
    </div>
  );

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

  // Hitung total durasi
  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration_ms || 0), 0);
  const totalMins = Math.floor(totalDuration / 60000);

  return (
    <div className="flex-1 overflow-y-auto flex flex-col bg-[#121212]">

      {/* ── Hero Header ── */}
      <div className="relative">
        {/* Blurred Background */}
        <div className="absolute inset-0 overflow-hidden">
          {playlist.image && playlist.image !== 'folder' && (
            <img
              src={playlist.image}
              alt=""
              className="w-full h-full object-cover blur-xl scale-110 opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-[#181818]/80 to-[#121212]" />
        </div>

        {/* Header Content */}
        <div
          className="relative p-6 md:p-8 pt-12 flex flex-col sm:flex-row items-start sm:items-end gap-6 cursor-pointer group"
          onClick={() => setIsEditModalOpen(true)}
        >
          {/* Playlist Cover */}
          <div className="w-44 h-44 md:w-52 md:h-52 bg-[#282828] shadow-2xl flex items-center justify-center rounded-lg overflow-hidden flex-shrink-0 relative">
            {playlist.image === 'folder' || !playlist.image ? (
              <Music className="w-24 h-24 text-[#b3b3b3]" />
            ) : (
              <img
                src={playlist.image}
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            )}
            {/* Edit overlay */}
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
              <PlusCircle className="w-10 h-10 text-white" />
              <span className="text-white text-sm font-semibold">Edit foto</span>
            </div>
          </div>

          {/* Playlist Info */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <span className="text-white text-xs font-bold uppercase tracking-widest">
              {playlist.type}
            </span>
            <h1
              className="text-white font-black leading-none truncate"
              style={{ fontSize: 'clamp(1.8rem, 5vw, 4.5rem)' }}
              title={playlist.name}
            >
              {playlist.name}
            </h1>
            {playlist.description && (
              <p className="text-[#b3b3b3] text-sm line-clamp-2 mt-1 max-w-xl">
                {playlist.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-white text-sm font-bold">{playlist.owner || 'Saya'}</span>
              <span className="text-[#b3b3b3] text-sm">•</span>
              <span className="text-[#b3b3b3] text-sm">{tracks.length} lagu</span>
              {totalMins > 0 && (
                <>
                  <span className="text-[#b3b3b3] text-sm">•</span>
                  <span className="text-[#b3b3b3] text-sm">sekitar {totalMins} menit</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Actions Bar ── */}
      <div className="px-6 md:px-8 py-5 flex items-center gap-6">
        <button
          onClick={handlePlayPlaylist}
          disabled={tracks.length === 0}
          className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#1DB954]/30 disabled:opacity-40 disabled:hover:scale-100"
        >
          <Play className="w-7 h-7 text-black fill-current ml-1" />
        </button>
        <button
          disabled={tracks.length === 0}
          className="text-[#b3b3b3] hover:text-white transition-colors disabled:opacity-30"
          title="Acak playlist"
        >
          <Shuffle className="w-6 h-6" />
        </button>
        <button className="text-[#b3b3b3] hover:text-white transition-colors">
          <MoreHorizontal className="w-7 h-7" />
        </button>
      </div>

      {/* ── Track Table ── */}
      <div className="px-4 md:px-6 pb-32">
        {/* Table Header */}
        <div className="gap-4 px-4 py-2 border-b border-white/10 mb-1 md:grid hidden"
          style={{ gridTemplateColumns: '16px 1fr 1fr 80px 48px' }}
        >
          <span className="text-[#b3b3b3] text-xs font-medium uppercase tracking-wider text-center">#</span>
          <span className="text-[#b3b3b3] text-xs font-medium uppercase tracking-wider">Judul</span>
          <span className="text-[#b3b3b3] text-xs font-medium uppercase tracking-wider hidden md:block">Album</span>
          <div className="flex justify-center">
            <Clock3 className="w-4 h-4 text-[#b3b3b3]" />
          </div>
          <span />
        </div>

        {/* Mobile Header Surrogate */}
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-white/10 mb-2">
           <span className="text-[#b3b3b3] text-xs font-medium uppercase tracking-wider">Lagu</span>
           <Clock3 className="w-4 h-4 text-[#b3b3b3]" />
        </div>

        {/* Empty State */}
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[#b3b3b3] mt-8">
            <Music className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-bold text-white mb-2">Playlist ini masih kosong</p>
            <p className="text-sm">Cari lagu favoritmu dan tambahkan di sini!</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {tracks.map((track, index) => {
              const isLiked = likedTracks.find(t => t.id === track.id);
              return (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track)}
                  className="grid gap-2 md:gap-4 px-2 md:px-4 py-2 rounded-md hover:bg-white/10 group transition-colors cursor-pointer items-center grid-cols-[auto_1fr_auto] md:grid-cols-[32px_1fr_1fr_80px_48px]"
                >
                  {/* Index / Play Icon - Hidden on mobile */}
                  <div className="hidden md:flex items-center justify-center">
                    <span className="text-[#b3b3b3] text-sm group-hover:hidden">{index + 1}</span>
                    <Play className="w-4 h-4 text-white fill-current hidden group-hover:block" />
                  </div>

                  {/* Title + Artist */}
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={track.album.images[0].url}
                      alt={track.name}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate leading-tight">
                        {track.name}
                      </p>
                      <p className="text-xs text-[#b3b3b3] group-hover:text-white truncate transition-colors">
                        {track.artists.map(a => a.name).join(', ')}
                      </p>
                    </div>
                  </div>

                  {/* Album Name */}
                  <p className="text-sm text-[#b3b3b3] group-hover:text-white truncate hidden md:block transition-colors">
                    {track.album.name}
                  </p>

                  {/* Duration */}
                  <p className="text-xs text-[#b3b3b3] text-center">
                    {formatDuration(track.duration_ms)}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                      className={`p-1.5 rounded-full transition-all ${
                        isLiked
                          ? 'text-[#1DB954]'
                          : 'text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    </button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-full text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56 bg-[#282828] border-[#3e3e3e] text-white shadow-2xl">
                        <DropdownMenuItem onClick={() => { addToQueue(track); toast.success("Ditambahkan ke antrean"); }}>
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
                          className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                          onClick={() => {
                            if (selectedId) removeTrackFromPlaylist(selectedId, track.id);
                            toast.success("Lagu dihapus dari playlist");
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Hapus dari playlist</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
