import { MoreHorizontal, Plus, Heart, Share2, Search, X } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';

export function RightSidebar() {
  const { currentTrack, toggleLike, likedTracks } = useMusicStore();

  if (!currentTrack) return null;

  const isLiked = likedTracks.find(t => t.id === currentTrack.id);

  return (
    <div className="w-[380px] bg-[#121212] h-full flex flex-col p-4 overflow-hidden border-l border-[#282828] select-none">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-white text-lg font-bold truncate pr-4">{currentTrack.name}</h2>
        <div className="flex items-center gap-2">
            <button className="text-[#b3b3b3] hover:text-white transition-colors p-1.5 hover:bg-[#1f1f1f] rounded-full">
                <Share2 className="w-5 h-5" />
            </button>
            <button className="text-[#b3b3b3] hover:text-white transition-colors p-1.5 hover:bg-[#1f1f1f] rounded-full">
                <X className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
        {/* Main Cover */}
        <div className="relative group rounded-xl overflow-hidden shadow-2xl">
          <img 
            src={currentTrack.album.images[0].url} 
            alt={currentTrack.name} 
            className="w-full aspect-square object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl font-extrabold text-white mb-1 leading-tight drop-shadow-lg">
                {currentTrack.name}
            </h1>
            <p className="text-white font-bold opacity-90 drop-shadow-md">
                {currentTrack.artists.map(a => a.name).join(', ')}
            </p>
          </div>
        </div>

        {/* Artist About */}
        <div className="bg-[#181818] rounded-xl overflow-hidden shadow-xl">
           <div className="p-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-base">Tentang artis</h3>
           </div>
           <div className="relative h-64 w-full">
                <img 
                    src={currentTrack.album.images[0].url} 
                    alt="Artist Profile" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                    <p className="text-white text-3xl font-extrabold mb-1">{currentTrack.artists[0].name}</p>
                    <p className="text-[#b3b3b3] text-sm overflow-hidden line-clamp-2 max-w-[200px]">
                        {currentTrack.popularity}% Popularitas
                    </p>
                </div>
                <button className="absolute top-4 right-4 bg-[#1DB954] text-black px-4 py-1.5 rounded-full text-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                    Ikuti
                </button>
           </div>
           
           <div className="p-5 space-y-4">
             <div className="flex items-center gap-4 text-[#b3b3b3]">
                <button 
                  onClick={() => toggleLike(currentTrack)}
                  className={`transition-colors ${isLiked ? 'text-[#1DB954]' : 'hover:text-white'}`}
                >
                    <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>
                <button className="hover:text-white transition-colors">
                    <Plus className="w-6 h-6 border-2 border-current rounded-full p-0.5" />
                </button>
                <button className="hover:text-white transition-colors">
                    <MoreHorizontal className="w-6 h-6" />
                </button>
             </div>
             
             <div className="text-sm text-[#b3b3b3] space-y-3 leading-relaxed">
                Mendengarkan {currentTrack.name} dari album {currentTrack.album.name}. Artis {currentTrack.artists[0].name} sedang populer saat ini.
             </div>
           </div>
        </div>

        {/* Credit/Next Track */}
        <div className="bg-[#181818] rounded-xl p-5 shadow-xl">
            <h3 className="text-white font-bold mb-4">Kredit</h3>
            <div className="space-y-4">
                {currentTrack.artists.map(artist => (
                  <div key={artist.id}>
                      <p className="text-white text-sm font-bold">{artist.name}</p>
                      <p className="text-[#b3b3b3] text-xs underline cursor-pointer">Artis utama</p>
                  </div>
                ))}
                <div>
                    <p className="text-white text-sm font-bold">{currentTrack.album.name}</p>
                    <p className="text-[#b3b3b3] text-xs underline cursor-pointer">Album</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
