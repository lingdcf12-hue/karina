import { useState, useEffect, useRef } from 'react';
import { X, Pencil, Trash2 } from 'lucide-react';
import { useMusicStore } from '../store/musicStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from "./ui/dialog";
import { toast } from 'sonner';

export function EditPlaylistModal({ isOpen, onClose, playlistId }: { isOpen: boolean, onClose: () => void, playlistId: string }) {
  const { collection, updatePlaylist, uploadPlaylistImage } = useMusicStore();
  const playlist = collection.find(item => item.id === playlistId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (playlist) {
      setName(playlist.name || '');
      setDescription(playlist.description || '');
      setImageUrl(playlist.image || '');
    }
  }, [playlist, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setIsUploading(true);
    const publicUrl = await uploadPlaylistImage(playlistId, file);
    setIsUploading(false);

    if (publicUrl) {
      setImageUrl(publicUrl);
      toast.success("Foto berhasil diunggah!");
    }
  };

  const handleRemovePhoto = () => {
    setImageUrl('https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300');
    toast.success("Foto dilepas (default)");
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Nama playlist tidak boleh kosong");
      return;
    }
    
    // We only send updates for fields that exist in the database.
    // Assuming image_url is the correct column based on fetchCollection.
    // If description is missing, Supabase will return a 400.
    await updatePlaylist(playlistId, { 
      name, 
      description, 
      image_url: imageUrl 
    });
    onClose();
  };

  if (!playlist) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#282828] border-none text-white max-w-[524px] p-6 shadow-2xl">
        <DialogHeader className="flex flex-row items-center justify-between mb-4">
          <div className="flex flex-col">
            <DialogTitle className="text-2xl font-bold">Edit detail</DialogTitle>
            <DialogDescription className="sr-only">
              Ubah detail playlist seperti nama, deskripsi, dan gambar sampul.
            </DialogDescription>
          </div>
          <button onClick={onClose} className="text-[#b3b3b3] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </DialogHeader>

        <div className="flex gap-4">
          {/* Image Editor */}
          <div className="flex flex-col gap-2">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group w-48 h-48 flex-shrink-0 shadow-2xl cursor-pointer"
            >
              <img 
                src={imageUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300'} 
                alt="Cover" 
                className={`w-full h-full object-cover rounded shadow-lg transition-opacity ${isUploading ? 'opacity-30' : ''}`}
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                <Pencil className="w-12 h-12 mb-2 text-white" />
                <span className="text-sm font-bold text-white">Pilih foto</span>
              </div>
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {imageUrl && imageUrl !== 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300' && (
                <button 
                  onClick={handleRemovePhoto}
                  className="flex items-center gap-2 text-xs text-[#b3b3b3] hover:text-white mt-1 w-fit transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Hapus foto
                </button>
            )}
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="space-y-1">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama"
                className="w-full bg-[#3e3e3e] border-none rounded p-3 text-sm focus:ring-1 focus:ring-white/20 outline-none"
              />
            </div>
            <div className="space-y-1 flex-1">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tambahkan deskripsi opsional"
                className="w-full h-full bg-[#3e3e3e] border-none rounded p-3 text-sm focus:ring-1 focus:ring-white/20 outline-none resize-none min-h-[120px]"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end mt-6">
          <button 
            onClick={handleSave}
            className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
          >
            Simpan
          </button>
        </div>

        <p className="text-[11px] text-[#b3b3b3] mt-4 font-bold">
          Dengan melanjutkan, berarti kamu setuju untuk memberi Spotify akses ke gambar yang kamu pilih untuk di-upload. Pastikan kamu memiliki hak untuk meng-upload gambar.
        </p>
      </DialogContent>
    </Dialog>
  );
}
