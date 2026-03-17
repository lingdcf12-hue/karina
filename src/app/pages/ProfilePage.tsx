import { useState, useEffect } from 'react';
import { 
  Settings, 
  MoreHorizontal, 
  Pencil, 
  Copy, 
  CheckCircle2, 
  Clock3,
  LogOut,
  Camera,
  X,
  Trash2
} from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { formatTime } from '../utils/formatters';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '../components/ui/dialog';
import { toast } from 'sonner';

export function ProfilePage() {
  const { user, likedTracks, setCurrentTrack, setQueue, logout, setCurrentView, updateProfile, uploadProfileImage } = useMusicStore();
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState(user?.name || '');
  const [isEditing, setIsEditing] = useState(false);

  // Sync internal state when user data changes (e.g. from server)
  useEffect(() => {
    if (user?.name) setNewName(user.name);
  }, [user?.name, showEditModal]);

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

  // State untuk menyimpan file yang dipilih tapi belum diupload
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Fungsi Pembantu: Kompres Gambar agar Upload Kilat
  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 400; // Ukuran pas untuk profil (Spotify style)
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Fallback ke file asli jika gagal
            }
          }, 'image/jpeg', 0.8); // Kualitas 80% (Bagus & Sangat Ringan)
        };
      };
    });
  };

  // State untuk menyimpan URL yang sudah diupload ke storage (Background Upload)
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdateProfile = async () => {
    if (!newName.trim()) return;
    
    // Jika masih ada upload yang berjalan, tunggu sebentar atau beri peringatan
    if (isUploading) {
      toast.info("Sedang menyiapkan foto, tunggu sebentar...");
      return;
    }

    setIsEditing(true);

    try {
      // Gunakan URL yang sudah diupload (background) atau URL lama
      const finalAvatarUrl = uploadedAvatarUrl || user?.avatar_url || '';

      console.log("🚀 [Save] Menyimpan data profil lengkap ke Supabase...");
      
      // Close modal early for better UX (Optimistic approach)
      setShowEditModal(false);
      
      await updateProfile({ 
        name: newName, 
        avatar_url: finalAvatarUrl 
      });
      
      setPendingFile(null);
      setUploadedAvatarUrl(null);
      toast.success('Profil berhasil diperbaharui!');
    } catch (error: any) {
      console.error("❌ [Save] Gagal total:", error.message);
      toast.error('Gagal memperbaharui profil: ' + error.message);
    } finally {
      setIsEditing(false);
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB');
      return;
    }

    // 1. Tampilkan preview lokal instan
    const localUrl = URL.createObjectURL(file);
    useMusicStore.setState((state) => ({
      user: state.user ? { ...state.user, avatar_url: localUrl } : null
    }));

    setPendingFile(file);
    setIsUploading(true);

    // 2. LANGSUNG UPLOAD DI BACKGROUND (Sambil user mikir/ketik nama)
    try {
      console.log("🚀 [Background] Memulai kompresi & upload...");
      const compressed = await compressImage(file);
      const url = await uploadProfileImage(compressed);
      
      if (url) {
        setUploadedAvatarUrl(url);
        console.log("✅ [Background] Upload selesai:", url);
      }
    } catch (err: any) {
      console.error("❌ [Background] Upload gagal:", err.message);
      toast.error("Gagal mengunggah foto di latar belakang.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-[#404040] via-[#121212] to-[#121212] scrollbar-none pb-24">
      {/* Header Section */}
      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 text-center sm:text-left">
          <div 
            className="relative group shrink-0 cursor-pointer"
            onClick={() => setShowEditModal(true)}
          >
            <div className="w-40 h-40 md:w-48 md:h-48 aspect-square rounded-full overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)] bg-[#282828] flex items-center justify-center relative shrink-0 border-4 border-white/5">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.name} 
                  className="w-full h-full object-cover object-center" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#535353] to-[#282828]">
                  <span className="text-6xl md:text-7xl font-bold text-white/20 uppercase select-none">{user.name?.[0]}</span>
                </div>
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                <Pencil className="w-8 h-8 text-white mb-2" />
                <span className="text-[12px] font-bold text-white uppercase tracking-wider">Ubah foto</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 w-full">
            <span className="text-[12px] font-bold uppercase tracking-wider text-white">Profil</span>
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black tracking-tight text-white mb-2 truncate max-w-full">{user.name}</h1>
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

      {/* Edit Profile Modal - Playlist Style */}
      <Dialog open={showEditModal} onOpenChange={(open) => !open && setShowEditModal(false)}>
        <DialogContent className="bg-[#282828] border-none text-white max-w-[524px] p-6 shadow-2xl">
          {/* Aesthetic Close Button */}
          <button
            onClick={() => setShowEditModal(false)}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white transition-all duration-200 hover:scale-110 hover:shadow-[0_0_12px_rgba(255,255,255,0.2)] group z-10"
            aria-label="Tutup"
          >
            <X className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          </button>

          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="text-2xl font-bold">Edit detail profil</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Left: Round Avatar Editor */}
            <div className="flex flex-col items-center md:items-start gap-2">
              <div 
                onClick={() => (document.getElementById('profile-file-input') as HTMLInputElement)?.click()}
                className="relative group w-40 h-40 md:w-48 md:h-48 aspect-square flex-shrink-0 shadow-2xl cursor-pointer rounded-full overflow-hidden border-4 border-black/20"
              >
                {user.avatar_url ? (
                  <img 
                    src={user.avatar_url} 
                    alt="" 
                    className={`w-full h-full object-cover object-center transition-opacity ${isEditing ? 'opacity-30' : ''}`} 
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-[#333] text-5xl font-black text-white/10 uppercase transition-opacity ${isEditing ? 'opacity-30' : ''}`}>
                    {user.name?.[0]}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-10 h-10 mb-2 text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Pilih foto</span>
                </div>

                {isEditing && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
                
                <input 
                  id="profile-file-input"
                  type="file" 
                  accept="image/*" 
                  onChange={handleProfileImageChange}
                  className="hidden" 
                />
              </div>

              {user.avatar_url && (
                <button 
                  onClick={async () => {
                    await updateProfile({ avatar_url: '' });
                    toast.success('Foto dihapus');
                  }}
                  className="flex items-center gap-2 text-xs text-[#b3b3b3] hover:text-white mt-1 w-fit transition-colors px-1 h-8"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus foto
                </button>
              )}
            </div>

            {/* Right: Name Form */}
            <div className="flex flex-col gap-4 flex-1 w-full pt-2">
              <div className="space-y-1.5 focus-within:z-10 relative">
                <label className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-1 absolute -top-2.5 left-2 bg-[#282828] px-1 z-20">Nama Tampilan</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nama kamu"
                  className="w-full bg-[#3e3e3e] border border-transparent focus:border-white/20 rounded p-3 pt-4 text-sm outline-none transition-all placeholder-white/20"
                />
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed px-1">
                Gunakan nama asli atau nama panggungmu. Ini akan tampil di profil dan setiap playlist yang kamu buat.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end mt-6">
            <button 
              onClick={handleUpdateProfile}
              disabled={isEditing || !newName.trim()}
              className="bg-white text-black px-10 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 min-w-[140px]"
            >
              {isEditing ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>

          <p className="text-[10px] text-white/30 mt-4 leading-normal">
            Dengan melanjutkan, kamu setuju untuk memberikan akses ke gambar yang kamu pilih. Pastikan kamu memiliki hak untuk mengunggah gambar tersebut.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
