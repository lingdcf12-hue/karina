import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Track, PlayerState } from '../types/music';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';

interface MusicStore extends PlayerState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentView: 'home' | 'search' | 'library' | 'liked-songs' | 'queue' | 'playlist' | 'artist' | 'login' | 'register' | 'profile';
  setCurrentView: (view: 'home' | 'search' | 'library' | 'liked-songs' | 'queue' | 'playlist' | 'artist' | 'login' | 'register' | 'profile') => void;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  collection: any[];
  setCollection: (collection: any[]) => void;
  addFolder: (name: string) => void;
  addPlaylist: (name: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  renameCollectionItem: (id: string, name: string) => void;
  removeCollectionItem: (id: string) => void;
  updatePlaylist: (id: string, updates: { name?: string; description?: string; image_url?: string }) => Promise<void>;
  uploadPlaylistImage: (playlistId: string, file: File) => Promise<string | null>;
  togglePinPlaylist: (id: string) => Promise<void>;
  // Profile
  updateProfile: (updates: { name?: string; avatar_url?: string }) => Promise<void>;
  uploadProfileImage: (file: File) => Promise<string | null>;
  syncProfile: () => Promise<void>;
  // Spotify Specific
  likedTracks: Track[]; // full track objects
  toggleLike: (track: Track) => void;
  isFavPinned: boolean;
  dominantColor: string;
  setDominantColor: (color: string) => void;
  // Auth
  user: any | null;
  setUser: (user: any | null) => void;
  logout: () => void;
  guestPromptTrack: Track | null;
  setGuestPromptTrack: (track: Track | null) => void;
  // Database Actions
  fetchCollection: () => Promise<void>;
  // Actions
  setCurrentTrack: (track: Track) => void;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  setQueue: (tracks: Track[]) => void;
  clearQueue: () => void;
  setDuration: (duration: number) => void;
  // Layout
  sidebarExpanded: boolean;
  setSidebarExpanded: (expanded: boolean) => void;
  rightSidebarVisible: boolean;
  setRightSidebarVisible: (visible: boolean) => void;
}

export const useMusicStore = create<MusicStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      guestPromptTrack: null,
      searchQuery: '',
      currentView: 'home',
      selectedId: null,
      collection: [],
      currentTrack: null,
      isPlaying: false,
      volume: 80,
      progress: 0,
      duration: 0,
      queue: [],
      shuffle: false,
      repeat: 'off',
      likedTracks: [],
      dominantColor: '#121212',
      isFavPinned: false,
      sidebarExpanded: false,
      rightSidebarVisible: true,

      // Actions
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
      setGuestPromptTrack: (track) => set({ guestPromptTrack: track }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedId: (id) => set({ selectedId: id }),
      setCollection: (collection) => set({ collection }),
      
      addFolder: (name) => set((state) => ({ 
        collection: [
          { id: `folder-${Date.now()}`, name, type: 'Folder', image: 'folder', count: 0 }, 
          ...state.collection
        ] 
      })),

      fetchCollection: async () => {
        const currentUser = get().user;
        if (!currentUser) return;

        const { data: playlists, error } = await supabase
          .from('playlists')
          .select(`
            *,
            playlist_tracks (*)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching playlists:", error.message);
          return;
        }

        const { data: likedData, error: likedError } = await supabase
          .from('liked_tracks')
          .select('*')
          .order('created_at', { ascending: false });

        if (!likedError && likedData) {
          set({ likedTracks: likedData.map((d: any) => d.track_json) });
        }

        const formattedCollection = [
          { id: 'fav', name: 'Lagu yang Disukai', type: 'Playlist', image: 'heart', owner: currentUser.name, isPinned: get().isFavPinned },
          ...playlists.map((p: any) => ({
            id: p.id,
            name: p.name,
            type: 'Playlist',
            image: p.image_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150',
            description: p.description || '',
            isPinned: p.is_pinned || false,
            owner: currentUser.name,
            tracks: p.playlist_tracks?.map((pt: any) => pt.track_json) || [],
            count: p.playlist_tracks?.length || 0
          }))
        ];

        set({ collection: formattedCollection });
      },

      addPlaylist: async (name) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const { data, error } = await supabase
          .from('playlists')
          .insert([{ name, owner_id: currentUser.id }])
          .select()
          .single();

        if (error) {
          toast.error("Gagal membuat playlist: " + error.message);
          return;
        }

        const newPlaylist = {
          id: data.id,
          name: data.name,
          type: 'Playlist',
          image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=150',
          description: '',
          isPinned: false,
          owner: currentUser.name,
          tracks: [],
          count: 0
        };

        set((state) => ({ collection: [newPlaylist, ...state.collection] }));
        toast.success(`Playlist "${name}" berhasil dibuat!`);
      },

      addTrackToPlaylist: async (playlistId, track) => {
        const currentUser = get().user;
        if (!currentUser) return;

        const { error } = await supabase
          .from('playlist_tracks')
          .insert([{ 
            playlist_id: playlistId, 
            track_id: track.id, 
            track_json: track 
          }]);

        if (error) {
          toast.error("Gagal menambah lagu: " + error.message);
          return;
        }

        set((state) => ({
          collection: state.collection.map(item => {
            if (item.id === playlistId) {
              const tracks = item.tracks || [];
              return { ...item, tracks: [track, ...tracks], count: tracks.length + 1 };
            }
            return item;
          })
        }));
        toast.success(`Berhasil ditambahkan ke playlist!`);
      },

      removeTrackFromPlaylist: async (playlistId, trackId) => {
        const { error } = await supabase
          .from('playlist_tracks')
          .delete()
          .eq('playlist_id', playlistId)
          .eq('track_id', trackId);

        if (error) {
          toast.error("Gagal menghapus lagu: " + error.message);
          return;
        }

        set((state) => ({
          collection: state.collection.map(item => {
            if (item.id === playlistId) {
              const tracks = item.tracks.filter((t: Track) => t.id !== trackId);
              return { ...item, tracks, count: tracks.length };
            }
            return item;
          })
        }));
        toast.success("Berhasil dihapus dari playlist");
      },

      renameCollectionItem: (id, name) => set((state) => ({
        collection: state.collection.map(item => 
          item.id === id ? { ...item, name } : item
        )
      })),

      removeCollectionItem: (id) => set((state) => ({
        collection: state.collection.filter(item => item.id !== id)
      })),

      updatePlaylist: async (id, updates) => {
        const { error } = await supabase
          .from('playlists')
          .update(updates)
          .eq('id', id);

        if (error) {
          console.error("Supabase Error updatePlaylist:", error);
          if (error.code === '42703') {
            toast.error("Kolom 'description' atau 'image_url' belum ada di database.");
          } else {
            toast.error("Gagal memperbarui playlist: " + error.message);
          }
          return;
        }

        set((state) => ({
          collection: state.collection.map(item => 
            item.id === id ? { ...item, ...updates, image: updates.image_url || item.image } : item
          )
        }));
        toast.success("Playlist diperbarui");
      },

      uploadPlaylistImage: async (playlistId, file) => {
        const currentUser = get().user;
        if (!currentUser) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `${playlistId}-${Math.random()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('playlists')
          .upload(filePath, file);

        if (error) {
          console.error("Supabase Storage Error:", error);
          if (error.message.includes("bucket not found")) {
              toast.error("Bucket 'playlists' belum dibuat di Supabase Storage.");
          } else {
              toast.error("Gagal mengupload gambar: " + error.message);
          }
          return null;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('playlists')
          .getPublicUrl(filePath);

        return publicUrl;
      },

      togglePinPlaylist: async (id) => {
        const state = get();
        const playlist = state.collection.find(item => item.id === id);
        if (!playlist) return;

        const isPinned = !playlist.isPinned;

        if (id === 'fav') {
          set((state) => ({ 
            isFavPinned: isPinned,
            collection: state.collection.map(item => item.id === 'fav' ? { ...item, isPinned } : item)
          }));
          toast.success(isPinned ? "Lagu yang Disukai disematkan" : "Sematkan dilepas");
          return;
        }

        if (isPinned) {
          const pinnedCount = state.collection.filter(item => item.isPinned).length;
          if (pinnedCount >= 4) {
            toast.error("Maksimal 4 playlist yang dapat disematkan");
            return;
          }
        }

        const { error } = await supabase
          .from('playlists')
          .update({ is_pinned: isPinned })
          .eq('id', id);

        if (error) {
          console.error("Supabase Error togglePinPlaylist:", error);
          if (error.code === '42703') { // Undefined column
            toast.error("Kolom 'is_pinned' belum ada di database. Silakan jalankan script SQL.");
          } else {
            toast.error("Gagal menyematkan playlist: " + error.message);
          }
          return;
        }

        set((state) => ({
          collection: state.collection.map(item => 
            item.id === id ? { ...item, isPinned } : item
          )
        }));
        
        toast.success(isPinned ? "Playlist disematkan" : "Sematkan dilepas");
      },

      toggleLike: async (track) => {
        const currentUser = get().user;
        if (!currentUser) {
          set({ guestPromptTrack: track });
          return;
        }

        const isLiked = get().likedTracks.find(t => t.id === track.id);

        if (isLiked) {
          // Unlike
          const { error } = await supabase
            .from('liked_tracks')
            .delete()
            .eq('user_id', currentUser.id)
            .eq('track_id', track.id);

          if (!error) {
            set((state) => ({
              likedTracks: state.likedTracks.filter(t => t.id !== track.id)
            }));
            toast.success("Dihapus dari Lagu yang Disukai");
          }
        } else {
          // Like
          const { error } = await supabase
            .from('liked_tracks')
            .insert([{ 
              user_id: currentUser.id, 
              track_id: track.id, 
              track_json: track 
            }]);

          if (!error) {
            set((state) => ({
              likedTracks: [track, ...state.likedTracks]
            }));
            toast.success("Ditambahkan ke Lagu yang Disukai");
          } else if (error.code === '23505') {
            // Already exists (unique constraint)
            return;
          } else {
            toast.error("Gagal menyukai lagu: " + error.message);
          }
        }
      },

      setDominantColor: (color) => set({ dominantColor: color }),

      syncProfile: async () => {
        // Ambil user terbaru langsung dari auth session
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          set({ user: null });
          return;
        }

        // Ambil data dari tabel profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (profileError) {
          console.warn("⚠️ [Supabase] Database profiles belum terbaca.", profileError.message);
        } else {
          console.log("✅ [Supabase] Terhubung ke Database Profiles.");
        }

        const authMetadata = authUser.user_metadata || {};
        
        // Prioritas data: Database (Profiles) -> Auth Metadata -> Email
        const finalName = profile?.full_name || authMetadata.full_name || authMetadata.name || authUser.email?.split('@')[0];
        const finalAvatar = profile?.avatar_url || authMetadata.avatar_url || null;

        // AUTO-REPAIR: Jika di DB kosong/NULL tapi di Metadata ada isinya, kita sinkronkan sekarang juga!
        const needsRepair = !profile || (authMetadata.full_name && !profile.full_name) || (authMetadata.avatar_url && !profile.avatar_url);

        if (needsRepair) {
          console.log("🛠️ [Sync] Mendeteksi data kosong/NULL, melakukan Auto-Repair ke tabel profiles...");
          await supabase.from('profiles').upsert({
            id: authUser.id,
            full_name: finalName,
            avatar_url: finalAvatar,
            updated_at: new Date().toISOString()
          });
        }

        console.log("👤 [User] Profile loaded:", { finalName, hasAvatar: !!finalAvatar });

        set({ 
          user: { 
            id: authUser.id, 
            email: authUser.email,
            name: finalName,
            avatar_url: finalAvatar
          } 
        });
        
        get().fetchCollection();
      },

      updateProfile: async (updates) => {
        const state = get();
        const currentUser = state.user;
        if (!currentUser) return;

        // Sanitasi: Pastikan tidak menyimpan Blob URL ke database
        const cleanUpdates = { ...updates };
        if (cleanUpdates.avatar_url?.startsWith('blob:')) {
            console.warn("⚠️ [UpdateProfile] Menolak menyimpan Blob URL, mencari aslinya...");
            delete cleanUpdates.avatar_url;
        }

        // 1. Optimistic Update (Respons langsung di UI)
        set((state) => ({
          user: state.user ? {
            ...state.user,
            name: cleanUpdates.name ?? state.user.name,
            avatar_url: cleanUpdates.avatar_url ?? state.user.avatar_url
          } : null
        }));

        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) return;

          const userId = session.user.id;
          
          // Data untuk Auth (Metadata)
          const authData: any = {};
          if ('name' in cleanUpdates) {
            authData.name = cleanUpdates.name;
            authData.full_name = cleanUpdates.name;
          }
          if ('avatar_url' in cleanUpdates) authData.avatar_url = cleanUpdates.avatar_url;

          // Data untuk Tabel Database (Profiles)
          const dbData: any = { 
            id: userId, 
            updated_at: new Date().toISOString() 
          };
          if ('name' in cleanUpdates) dbData.full_name = cleanUpdates.name;
          if ('avatar_url' in cleanUpdates) dbData.avatar_url = cleanUpdates.avatar_url;

          console.log("⚡ [FastSync] Mengirim data valid ke Supabase...", dbData);

          // JALANKAN SERENTAK
          const [authResult, dbResult] = await Promise.all([
            supabase.auth.updateUser({ data: authData }),
            supabase.from('profiles').upsert(dbData, { onConflict: 'id' }).select()
          ]);

          if (authResult.error) throw authResult.error;
          if (dbResult.error) throw dbResult.error;

          console.log("✅ [FastSync] Sinkronasi Berhasil.");
          
          // 2. FORCE SYNC: Tarik data terbaru untuk memastikan persistensi
          await get().syncProfile();

        } catch (error: any) {
          console.error("❌ [FastSync] Error Krusial:", error.message);
          toast.error("Gagal sinkronasi ke database: " + error.message);
          throw error;
        }
      },

      uploadProfileImage: async (file) => {
        const currentUser = get().user;
        if (!currentUser) {
          console.error("❌ [Upload] User not found in store");
          return null;
        }

        // Sanitasi nama file
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;
        
        // Coba upload langsung ke root bucket 'profiles' atau folder 'avatars'
        // Kita gunakan folder 'avatars/' agar rapi sesuai screenshot kamu
        const filePath = `avatars/${fileName}`;

        console.log("📂 [Upload] Memulai upload ke profiles/avatars...", filePath);

        const { data, error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, file, {
            cacheControl: '3600',
            contentType: file.type || 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error("❌ [Upload] Storage Error:", uploadError);
          throw new Error(uploadError.message);
        }

        // Ambil Public URL
        const { data: { publicUrl } } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        console.log("✅ [Upload] Berhasil. URL:", publicUrl);
        return publicUrl;
      },

      setCurrentTrack: (track) => {
        if (!get().user && get().currentTrack) {
          // If they are guest and try to play a track (other than initial hydration), prompt them
          set({ guestPromptTrack: track });
          return;
        }
        set({
          currentTrack: track,
          duration: track.duration_ms / 1000,
          progress: 0,
          isPlaying: true,
        });
      },

      togglePlay: () => {
        if (!get().user && !get().isPlaying) {
          set({ guestPromptTrack: get().currentTrack });
          return;
        }
        set((state) => ({ isPlaying: !state.isPlaying }));
      },
      play: () => {
        if (!get().user) {
          set({ guestPromptTrack: get().currentTrack });
          return;
        }
        set({ isPlaying: true });
      },
      pause: () => set({ isPlaying: false }),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)) }),
      setProgress: (progress) => set({ progress }),

      nextTrack: () => {
        const { queue, currentTrack, shuffle, repeat } = get();
        if (queue.length === 0) return;

        // Jika repeat 'track' aktif, putar ulang lagu yang sama
        if (repeat === 'track' && currentTrack) {
          get().setCurrentTrack(currentTrack);
          return;
        }

        const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
        let nextIndex;

        if (shuffle) {
          // Pilih lagu random (selain yang sekarang jika memungkinkan)
          nextIndex = Math.floor(Math.random() * queue.length);
          if (queue.length > 1 && nextIndex === currentIndex) {
            nextIndex = (nextIndex + 1) % queue.length;
          }
        } else {
          nextIndex = currentIndex + 1;
        }

        // Logika Repeat All (Context) vs Off
        if (nextIndex >= queue.length) {
          if (repeat === 'context') {
            nextIndex = 0; // Ulang dari awal playlist
            get().setCurrentTrack(queue[nextIndex]);
          } else {
            // Berhenti atau Reset ke awal tapi Pause (atau biarkan di lagu terakhir)
            set({ isPlaying: false, progress: 0 });
          }
        } else {
          get().setCurrentTrack(queue[nextIndex]);
        }
      },

      previousTrack: () => {
        const { queue, currentTrack, progress } = get();
        if (progress > 3) {
          set({ progress: 0 });
          return;
        }
        if (queue.length > 0) {
          const currentIndex = queue.findIndex((t) => t.id === currentTrack?.id);
          const prevIndex =
              currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
          get().setCurrentTrack(queue[prevIndex]);
        }
      },

      toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

      toggleRepeat: () =>
        set((state) => ({
          repeat:
            state.repeat === 'off'
              ? 'context'
              : state.repeat === 'context'
              ? 'track'
              : 'off',
        })),

      addToQueue: (track) =>
        set((state) => ({ queue: [...state.queue, track] })),

      setQueue: (tracks) => set({ queue: tracks }),

      clearQueue: () => set({ queue: [] }),
      setDuration: (duration) => set({ duration }),

      setSidebarExpanded: (sidebarExpanded) => set({ sidebarExpanded }),
      setRightSidebarVisible: (rightSidebarVisible) => set({ rightSidebarVisible }),
    }),
    {
      name: 'spotify-music-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist certain pieces of state
      partialize: (state) => ({
        user: state.user ? {
          ...state.user,
          // Jangan simpan blob: URL ke localStorage karena akan mati/error saat refresh
          avatar_url: state.user.avatar_url?.startsWith('blob:') ? null : state.user.avatar_url
        } : null,
        collection: state.collection,
        likedTracks: state.likedTracks,
        volume: state.volume,
        isFavPinned: state.isFavPinned,
      }),
    }
  )
);

