import { Play, Trash2, ListMusic, MoreHorizontal } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { formatDuration } from '../utils/formatters';

export function QueuePage() {
  const { queue, currentTrack, setCurrentTrack, clearQueue } = useMusicStore();

  const handleClearQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearQueue();
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#121212] p-8 pb-32 flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-8">Antrean</h1>
        
        {/* Currently Playing Section */}
        <section className="mb-10">
            <h2 className="text-[#b3b3b3] text-sm font-bold mb-4">Sedang diputar</h2>
            {currentTrack ? (
                <div className="flex items-center gap-4 p-2 rounded-md hover:bg-white/5 group transition-colors">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <img src={currentTrack.album.images[0].url} alt={currentTrack.name} className="w-full h-full rounded object-cover shadow-lg" />
                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                            <Play className="w-5 h-5 text-white fill-current" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[#1DB954] font-bold text-base truncate">{currentTrack.name}</p>
                        <p className="text-sm text-[#b3b3b3] group-hover:text-white truncate">
                            {currentTrack.artists.map(a => a.name).join(', ')}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 pr-4">
                        <span className="text-xs text-[#b3b3b3]">{formatDuration(currentTrack.duration_ms)}</span>
                    </div>
                </div>
            ) : (
                <p className="text-[#b3b3b3] text-sm italic">Tidak ada lagu yang diputar</p>
            )}
        </section>

        {/* Next in Queue Section */}
        <section>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#b3b3b3] text-sm font-bold">Berikutnya di Antrean</h2>
                {queue.length > 0 && (
                    <button 
                        onClick={handleClearQueue}
                        className="text-xs font-bold text-[#b3b3b3] hover:text-white hover:underline transition-colors border border-[#333] px-3 py-1 rounded-full"
                    >
                        Bersihkan antrean
                    </button>
                )}
            </div>

            {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-[#282828] rounded-xl text-[#b3b3b3]">
                    <ListMusic className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Antrean kosong. Tambahkan lagu sekarang!</p>
                </div>
            ) : (
                <div className="flex flex-col space-y-1">
                    {queue.map((track, index) => (
                        <div 
                            key={`${track.id}-${index}`}
                            onClick={() => setCurrentTrack(track)}
                            className="flex items-center gap-4 p-2 rounded-md hover:bg-white/5 group transition-colors cursor-pointer"
                        >
                            <span className="w-4 text-center text-sm text-[#b3b3b3] group-hover:hidden">{index + 1}</span>
                            <Play className="w-4 h-4 text-white fill-current hidden group-hover:block" />
                            
                            <img src={track.album.images[0].url} alt={track.name} className="w-10 h-10 rounded object-cover" />
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{track.name}</p>
                                <p className="text-xs text-[#b3b3b3] group-hover:text-white truncate">
                                    {track.artists.map(a => a.name).join(', ')}
                                </p>
                            </div>
                            <div className="flex items-center gap-6 pr-4">
                                <span className="text-xs text-[#b3b3b3] min-w-[32px]">{formatDuration(track.duration_ms)}</span>
                                <button className="text-[#b3b3b3] hover:text-white opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
      </div>
    </div>
  );
}
