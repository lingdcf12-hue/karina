import { useState, useEffect } from 'react';
import { 
  Settings, 
  MoreHorizontal, 
  Pencil, 
  Copy, 
  CheckCircle2, 
  Clock3,
  LogOut,
  Camera
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { formatTime } from '../utils/formatters';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, likedTracks, setCurrentTrack, setQueue, logout, setCurrentView } = useMusicStore();
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // For demo purposes, we use liked tracks as "top tracks"
    // In a real app, this would be a separate API call
    fetch('/api/tracks')
      .then(res => res.json())
      .then(tracks => {
        setTopTracks(tracks.slice(0, 5));
      })
      .catch(err => console.error(err));
  }, []);

  if (!user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Silakan masuk untuk melihat profil</h2>
        <button 
          onClick={() => setCurrentView('login')}
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Masuk
        </button>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link profil disalin ke papan klip');
    setShowMenu(false);
  };

  const handleUpdateProfile = () => {
    setIsEditing(true);
    // Simulate API update
    setTimeout(() => {
      useMusicStore.setState({ 
        user: { ...user, name: newName } 
      });
      setIsEditing(false);
      setShowEditModal(false);
      toast.success('Profil berhasil diperbaharui');
    }, 1000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-[#404040] via-[#121212] to-[#121212] scrollbar-none pb-24">
      {/* Header Section */}
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="flex items-end gap-6">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] bg-[#282828] flex items-center justify-center">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl md:text-7xl font-bold text-white/20 uppercase">{user.name?.[0]}</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-bold uppercase tracking-wider text-white">Profil</span>
            <h1 className="text-4xl md:text-8xl font-black tracking-tight text-white mb-2">{user.name}</h1>
            <div className="flex items-center gap-1.5 text-[14px] font-bold text-white/80">
              <span className="hover:underline cursor-pointer">1 Pengikut</span>
              <span className="text-[6px] opacity-50">•</span>
              <span className="hover:underline cursor-pointer">6 Mengikuti</span>
            </div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-4 mt-2">
          <button className="text-white/60 hover:text-white transition-colors p-1">
            <Settings className="w-6 h-6" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`p-1 transition-colors ${showMenu ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              <MoreHorizontal className="w-7 h-7" />
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute left-0 mt-2 w-56 bg-[#282828] border border-white/5 shadow-2xl rounded-md overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                  <button 
                    onClick={() => { setShowEditModal(true); setShowMenu(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-[14px] font-medium text-white/90 hover:bg-white/10 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit profil
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className="w-full flex items-center gap-3 px-3 py-3 text-[14px] font-medium text-white/90 hover:bg-white/10 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    Salin link ke profil
                  </button>
                  <div className="h-[1px] bg-white/5 mx-3 my-1" />
                  <button 
                    onClick={() => { logout(); setCurrentView('home'); }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-[14px] font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-6 md:px-8 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[20px] md:text-2xl font-black text-white tracking-tight">Track teratas bulan ini</h2>
            <p className="text-[13px] font-bold text-white/50 tracking-tight">Hanya bisa dilihat kamu</p>
          </div>
          <button className="text-[13px] font-black uppercase text-white/60 hover:text-white tracking-widest transition-colors">
            Tampilkan semua
          </button>
        </div>

        {/* Tracks List */}
        <div className="flex flex-col mb-12">
          {topTracks.map((track, index) => {
            const isLiked = likedTracks.find(t => t.id === track.id);
            return (
              <div 
                key={track.id}
                onClick={() => {
                  setCurrentTrack(track);
                  setQueue(topTracks);
                }}
                className="group flex items-center gap-4 py-2 px-3 -mx-3 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="w-4 text-center text-[#b3b3b3] text-sm tabular-nums font-bold group-hover:hidden">
                  {index + 1}
                </span>
                <div className="hidden group-hover:flex w-4 items-center justify-center text-white">
                   <div className="w-2.5 h-2.5 border-y-2 border-r-2 border-current rotate-[-45deg] ml-1" style={{ borderLeft: '0' }} />
                </div>

                <div className="relative w-10 h-10 md:w-12 md:h-12 shrink-0">
                  <img src={track.album.images[0].url} alt={track.name} className="w-full h-full object-cover rounded" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-[15px] font-semibold truncate tracking-tight">{track.name}</p>
                  <p className="text-[#b3b3b3] text-[13px] font-medium truncate tracking-tight">
                    {track.artists.map((a: any) => a.name).join(', ')}
                  </p>
                </div>

                <div className="hidden md:block flex-1 min-w-0 px-4">
                  <p className="text-[#b3b3b3] text-[13px] font-medium truncate hover:text-white transition-colors">{track.album.name}</p>
                </div>

                <div className="flex items-center gap-4 md:gap-8">
                  {isLiked && <CheckCircle2 className="w-4 h-4 text-[#1DB954]" />}
                  <span className="text-[#b3b3b3] text-[13px] font-medium tabular-nums w-10 text-right">
                    {formatTime(track.duration_ms / 1000)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#282828] rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-white mb-6">Detail profil</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group w-32 h-32 rounded-full overflow-hidden bg-[#333] shadow-xl">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-white/10 uppercase">
                      {user.name?.[0]}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-8 h-8 text-white mb-1" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Ganti foto</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-1">Nama</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full bg-[#3e3e3e] border-none rounded-lg py-3 px-4 text-white focus:ring-1 focus:ring-white/20 transition-shadow outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 text-[14px] font-bold text-white hover:scale-105 transition-transform"
                >
                  Batal
                </button>
                <button 
                  onClick={handleUpdateProfile}
                  disabled={isEditing || !newName.trim()}
                  className="bg-white text-black px-8 py-2.5 rounded-full text-[14px] font-bold hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                >
                  {isEditing ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
            
            <p className="text-[10px] text-white/30 mt-8 text-center px-4">
              Dengan melanjutkan, kamu setuju untuk memberikan akses ke gambar yang kamu pilih. Jangan upload konten yang melanggar hak cipta.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
