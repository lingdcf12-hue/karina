# 🎵 Spotify Clone - Boilerplate Profesional

Aplikasi web streaming musik yang dibangun dengan React.js, TypeScript, Tailwind CSS, dan Zustand untuk state management. Boilerplate ini mengikuti best practices dan siap untuk integrasi dengan Spotify Web API atau RapidAPI.

## 📁 Struktur Folder Proyek

```
src/
├── app/
│   ├── components/
│   │   ├── ui/                    # Komponen UI dasar (shadcn/ui)
│   │   ├── Sidebar.tsx            # Navigasi sidebar
│   │   ├── HomeGrid.tsx           # Grid konten utama
│   │   ├── MusicPlayer.tsx        # Player bar dengan kontrol lengkap
│   │   ├── SearchBar.tsx          # Fitur pencarian
│   │   └── LoadingSkeleton.tsx    # Loading state profesional
│   ├── store/
│   │   └── musicStore.ts          # Zustand global state management
│   ├── types/
│   │   └── music.ts               # TypeScript interfaces
│   ├── data/
│   │   └── mockData.ts            # Mock data untuk development
│   ├── utils/
│   │   └── spotifyApi.ts          # API utility functions
│   └── App.tsx                    # Main component
├── styles/
│   ├── fonts.css                  # Font imports (Inter)
│   ├── theme.css                  # Spotify color theme
│   └── tailwind.css               # Tailwind base
└── ...
```

## 🎨 Desain & Estetika

### Spotify Deep Dark Theme
- **Background Utama**: `#121212`
- **Sidebar**: `#000000`
- **Cards**: `#181818`
- **Aksen**: `#1DB954` (Spotify Green)
- **Hover State**: `#1ed760`

### Font
- **Primary**: Inter (Google Font)
- **Alternatif**: Circular (Spotify original), Montserrat

### Layout
1. **Sidebar Kiri**: Navigasi & Library
2. **Main Content**: Grid lagu/playlist dengan glassmorphism header
3. **Player Bar**: Sticky bottom dengan kontrol lengkap

## 🚀 Fitur Utama

### ✅ Sudah Diimplementasikan
- [x] Music Player dengan kontrol lengkap (Play, Pause, Skip, Volume)
- [x] Progress Bar interaktif
- [x] Shuffle & Repeat modes
- [x] Search Bar dengan filtering real-time
- [x] Skeleton Loading profesional
- [x] Global State Management dengan Zustand
- [x] Responsive Design
- [x] Hover effects & smooth transitions
- [x] TypeScript untuk type safety

### 🔄 State Management (Zustand)

```typescript
// Contoh penggunaan store
import { useMusicStore } from './store/musicStore';

const { 
  currentTrack, 
  isPlaying, 
  togglePlay, 
  nextTrack 
} = useMusicStore();
```

**Store Actions:**
- `setCurrentTrack(track)` - Set lagu saat ini
- `togglePlay()` - Toggle play/pause
- `setVolume(volume)` - Atur volume (0-100)
- `nextTrack()` / `previousTrack()` - Navigasi lagu
- `toggleShuffle()` / `toggleRepeat()` - Mode shuffle & repeat
- `addToQueue(track)` - Tambah ke queue

## 🔌 Integrasi API

### 1. Spotify Web API (Recommended)

**Setup:**
1. Daftar di [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Buat aplikasi baru
3. Dapatkan Client ID & Client Secret
4. Implementasi OAuth 2.0 Authorization Code Flow

**Contoh Kode:**
```typescript
// src/app/utils/spotifyApi.ts

import axios from 'axios';

const spotifyApi = axios.create({
  baseURL: 'https://api.spotify.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk token
spotifyApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotify_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetch tracks
export const fetchTracks = async (query?: string) => {
  const response = await spotifyApi.get('/search', {
    params: {
      q: query || 'trending',
      type: 'track',
      limit: 20,
    },
  });
  return response.data.tracks.items;
};
```

### 2. RapidAPI (Alternatif)

**API Options:**
- **Shazam Core API**: `https://rapidapi.com/apidojo/api/shazam-core`
- **Deezer API**: `https://rapidapi.com/deezerdevs/api/deezer-1`

**Contoh Implementasi:**
```typescript
const options = {
  method: 'GET',
  url: 'https://shazam-core.p.rapidapi.com/v1/search/multi',
  params: { query: 'blinding lights' },
  headers: {
    'X-RapidAPI-Key': 'YOUR_API_KEY_HERE',
    'X-RapidAPI-Host': 'shazam-core.p.rapidapi.com'
  }
};

const response = await axios.request(options);
```

## 🛠️ Teknologi Stack

- **Framework**: React 18.3.1
- **TypeScript**: Type-safe development
- **State Management**: Zustand 5.0
- **Styling**: Tailwind CSS 4.1
- **Icons**: Lucide React
- **UI Components**: Radix UI (shadcn/ui)
- **Build Tool**: Vite 6.3

## 📦 Instalasi

```bash
# Install dependencies
npm install

# Install additional packages jika diperlukan
npm install axios  # Untuk API calls
```

## 🎯 Cara Menjalankan

```bash
# Development mode
npm run dev

# Build untuk production
npm run build
```

## 🔐 Environment Variables

Buat file `.env` di root folder:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
VITE_RAPIDAPI_KEY=your_rapidapi_key_here
```

## 🎨 Customisasi Theme

Edit `/src/styles/theme.css` untuk mengubah warna:

```css
:root {
  --spotify-black: #000000;
  --spotify-dark: #121212;
  --spotify-card: #181818;
  --spotify-green: #1DB954;
  --spotify-green-hover: #1ed760;
  /* ... */
}
```

## 📝 TypeScript Types

**Track Interface:**
```typescript
interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  preview_url: string | null;
  explicit: boolean;
  popularity: number;
}
```

Lihat `/src/app/types/music.ts` untuk interface lengkap.

## 🎵 Mock Data

Mock data tersedia di `/src/app/data/mockData.ts` untuk development tanpa API.

## 🚀 Fitur Lanjutan (TODO)

- [ ] OAuth Authentication dengan Spotify
- [ ] Playlist Management (Create, Edit, Delete)
- [ ] User Profile & Liked Songs
- [ ] Audio Visualization
- [ ] Lyrics Display
- [ ] Download untuk Offline Play
- [ ] Social Sharing
- [ ] Collaborative Playlists

## 🎨 Komponen Utama

### 1. Sidebar.tsx
Navigasi sidebar dengan library playlists

### 2. MusicPlayer.tsx  
Player bar dengan kontrol lengkap:
- Play/Pause toggle
- Skip forward/backward
- Volume control
- Progress bar
- Shuffle & Repeat

### 3. HomeGrid.tsx
Grid konten dengan sections:
- Recently Played
- Made for You
- Popular Tracks

### 4. SearchBar.tsx
Search dengan filtering real-time dan browse categories

## 📄 License

MIT License - Feel free to use for personal or commercial projects.

## 👨‍💻 Developer Notes

**Clean Code Principles:**
- Modular component structure
- Type-safe dengan TypeScript
- Reusable utility functions
- Consistent naming conventions
- Commented code untuk clarity

**Performance Optimizations:**
- Lazy loading untuk images
- Debounced search
- Memoized components (jika perlu)
- Optimized re-renders

---

**Created with ❤️ for aspiring music streaming developers**
