# ⚡ Quick Start Guide - Spotify Clone

## 🚀 Memulai dalam 5 Menit

### 1. Clone & Install
```bash
# Clone repository
git clone <your-repo-url>
cd spotify-clone

# Install dependencies
npm install
```

### 2. Jalankan Development Server
```bash
npm run dev
```

Buka browser di `http://localhost:5173` 🎉

---

## 🎯 Fitur yang Bisa Langsung Dicoba

### ✅ Yang Sudah Bekerja:
1. **Home Page** - Lihat recently played & playlists
2. **Search** - Klik icon search di sidebar
3. **Play Music** - Klik tombol play pada track atau album
4. **Music Player** - Kontrol di bagian bawah:
   - Play/Pause
   - Skip forward/backward
   - Adjust volume
   - Progress bar (drag untuk skip)
   - Shuffle & Repeat modes
5. **Track Details** - Klik album cover di player atau icon maximize
6. **Queue** - Lihat next tracks di modal details

---

## 🎨 Komponen Utama

### 1. **Sidebar** (Kiri)
- Home navigation
- Search button
- Library dengan playlists
- Liked Songs shortcut

### 2. **Main Content** (Tengah)
- Recently Played grid
- Featured Playlists
- Popular Tracks
- Hover untuk lihat play button

### 3. **Player Bar** (Bawah)
- Current track info
- Playback controls
- Volume slider
- Track details button

### 4. **Search Overlay**
- Real-time search
- Browse categories
- Filter by track/artist/album

---

## 📂 File Penting

```
src/app/
├── App.tsx                     # ⭐ Main entry point
├── components/
│   ├── Sidebar.tsx            # Navigation
│   ├── HomeGrid.tsx           # Content grid
│   ├── MusicPlayer.tsx        # Player controls
│   ├── SearchBar.tsx          # Search feature
│   └── TrackDetailsModal.tsx  # Track info modal
├── store/
│   └── musicStore.ts          # ⭐ Global state (Zustand)
├── data/
│   └── mockData.ts            # Sample data
└── types/
    └── music.ts               # TypeScript types
```

---

## 🎵 Cara Menggunakan State Management

```typescript
// Di komponen manapun
import { useMusicStore } from './store/musicStore';

function MyComponent() {
  const { 
    currentTrack,    // Track yang sedang dimainkan
    isPlaying,       // Status play/pause
    togglePlay,      // Toggle play/pause
    setCurrentTrack  // Set track baru
  } = useMusicStore();
  
  // Contoh: Play track
  const handlePlay = () => {
    setCurrentTrack(myTrack);
  };
  
  return (
    <button onClick={handlePlay}>
      {isPlaying ? 'Pause' : 'Play'}
    </button>
  );
}
```

---

## 🎨 Kustomisasi Theme

Edit `/src/styles/theme.css`:

```css
:root {
  /* Ganti warna sesuai selera */
  --spotify-green: #1DB954;        /* Warna utama */
  --spotify-dark: #121212;         /* Background */
  --spotify-card: #181818;         /* Card color */
}
```

---

## 📝 Menambah Data Mock

Edit `/src/app/data/mockData.ts`:

```typescript
export const mockTracks: Track[] = [
  {
    id: '7',
    name: 'Your Song Title',
    artists: [{ id: 'a6', name: 'Artist Name' }],
    album: {
      id: 'alb6',
      name: 'Album Name',
      images: [{ 
        url: 'your-image-url',
        height: 640,
        width: 640 
      }],
      release_date: '2024-01-01',
      total_tracks: 12,
    },
    duration_ms: 210000,  // 3:30
    preview_url: null,
    explicit: false,
    popularity: 85,
  },
  // ... tracks lainnya
];
```

---

## 🔧 Tips Development

### Hot Reload
File akan otomatis reload saat disimpan. Jika tidak:
```bash
# Restart dev server
Ctrl + C
npm run dev
```

### Debug State
Install Redux DevTools untuk monitor Zustand:
```typescript
// Tambahkan di musicStore.ts
import { devtools } from 'zustand/middleware';

export const useMusicStore = create(
  devtools((set, get) => ({
    // ... your store
  }))
);
```

### Console Logs
Tambahkan di store actions untuk debug:
```typescript
setCurrentTrack: (track) => {
  console.log('Playing:', track.name);
  set({ currentTrack: track });
},
```

---

## 🐛 Troubleshooting

### ❌ Player tidak muncul?
**Solusi:** Pastikan ada track yang dipilih
```typescript
// Cek di browser console
useMusicStore.getState().currentTrack
```

### ❌ Search tidak bekerja?
**Solusi:** Cek mockData sudah diimport
```typescript
// Di SearchBar.tsx
console.log('Mock tracks:', mockTracks);
```

### ❌ Styling berantakan?
**Solusi:** 
```bash
# Clear browser cache
Ctrl + Shift + R (hard reload)

# Atau restart dev server
npm run dev
```

### ❌ TypeScript errors?
**Solusi:**
```bash
# Check TypeScript
npx tsc --noEmit
```

---

## 🚀 Next Steps

### Level 1: Basic Customization
- [ ] Ganti warna theme
- [ ] Tambah lebih banyak mock data
- [ ] Ubah font ke Circular/Montserrat

### Level 2: Add Features
- [ ] Liked songs functionality
- [ ] Create playlist
- [ ] Dark/Light mode toggle
- [ ] User profile page

### Level 3: API Integration
- [ ] Setup Spotify Developer Account
- [ ] Implement OAuth
- [ ] Replace mock API dengan real API
- [ ] Handle authentication

### Level 4: Advanced
- [ ] Audio visualization
- [ ] Lyrics display
- [ ] Social sharing
- [ ] Collaborative playlists
- [ ] PWA features

---

## 📚 Resources

**Learn More:**
- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

**Need Help?**
- Check `README.md` untuk dokumentasi lengkap
- Check `DOCUMENTATION.md` untuk detail teknis
- Check `spotifyAuthGuide.ts` untuk API integration

---

## 🎉 Happy Coding!

Aplikasi sudah siap untuk dikembangkan lebih lanjut. Mulai dengan eksplorasi kode, modifikasi styling, atau langsung jump ke API integration!

**Pro Tips:**
- Gunakan React DevTools untuk inspect components
- Enable Zustand DevTools untuk monitor state
- Experiment dengan Tailwind classes
- Read the source code - it's well commented!

---

**Version:** 1.0.0  
**Last Updated:** March 9, 2026  
**Built with:** ❤️ + ☕ + 🎵
