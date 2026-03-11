# 📋 STRUKTUR PROYEK & DOKUMENTASI

## 🗂️ Folder Structure

```
spotify-clone/
│
├── src/
│   ├── app/
│   │   ├── components/          # React Components
│   │   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   │   ├── Sidebar.tsx     # Left sidebar navigation
│   │   │   ├── HomeGrid.tsx    # Main content grid
│   │   │   ├── MusicPlayer.tsx # Bottom player bar
│   │   │   ├── SearchBar.tsx   # Search functionality
│   │   │   └── LoadingSkeleton.tsx # Loading states
│   │   │
│   │   ├── store/              # State Management
│   │   │   └── musicStore.ts   # Zustand store
│   │   │
│   │   ├── types/              # TypeScript Types
│   │   │   └── music.ts        # Track, Album, Artist interfaces
│   │   │
│   │   ├── data/               # Mock Data
│   │   │   └── mockData.ts     # Sample tracks & playlists
│   │   │
│   │   ├── utils/              # Utility Functions
│   │   │   ├── spotifyApi.ts   # API functions (mock)
│   │   │   └── spotifyAuthGuide.ts # Integration guide
│   │   │
│   │   └── App.tsx             # Main application
│   │
│   └── styles/                 # Styling
│       ├── fonts.css           # Font imports
│       ├── theme.css           # Spotify theme colors
│       ├── tailwind.css        # Tailwind config
│       └── index.css           # Global styles
│
├── README.md                   # Main documentation
└── package.json                # Dependencies
```

## 🎯 Komponen Detail

### 1. **Sidebar.tsx**
**Purpose:** Navigasi utama aplikasi
**Features:**
- Home & Search navigation
- Library section
- Playlist list dengan scroll
- Liked Songs shortcut

**Props:**
```typescript
interface SidebarProps {
  onSearch: () => void;
}
```

---

### 2. **MusicPlayer.tsx**
**Purpose:** Kontrol pemutaran musik
**Features:**
- Play/Pause toggle
- Skip forward/backward
- Progress bar (draggable)
- Volume control
- Shuffle & Repeat modes
- Track info display

**State:** Menggunakan `useMusicStore()`

---

### 3. **HomeGrid.tsx**
**Purpose:** Menampilkan konten utama
**Sections:**
- Recently Played (6 items)
- Made for You playlists
- Popular Tracks grid

**Features:**
- Hover animations
- Play button on hover
- Glassmorphism header

---

### 4. **SearchBar.tsx**
**Purpose:** Fitur pencarian
**Features:**
- Real-time filtering
- Search by track/artist/album
- Browse categories
- Close button

**Props:**
```typescript
interface SearchBarProps {
  onClose: () => void;
}
```

---

### 5. **LoadingSkeleton.tsx**
**Purpose:** Loading state saat fetch data
**Features:**
- Skeleton cards
- Matches actual layout
- Smooth transitions

---

## 🔧 State Management (Zustand)

### Store: `musicStore.ts`

**State:**
```typescript
{
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Track[];
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
}
```

**Actions:**
```typescript
setCurrentTrack(track)    // Set current playing track
togglePlay()              // Toggle play/pause
play()                    // Start playing
pause()                   // Pause playing
setVolume(volume)         // Set volume (0-100)
setProgress(progress)     // Set progress in seconds
nextTrack()               // Skip to next
previousTrack()           // Back to previous
toggleShuffle()           // Toggle shuffle mode
toggleRepeat()            // Cycle repeat modes
addToQueue(track)         // Add track to queue
clearQueue()              // Clear entire queue
```

---

## 📊 TypeScript Types

### Track
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

### Artist
```typescript
interface Artist {
  id: string;
  name: string;
  images?: Image[];
  genres?: string[];
}
```

### Album
```typescript
interface Album {
  id: string;
  name: string;
  images: Image[];
  release_date: string;
  total_tracks: number;
}
```

### Playlist
```typescript
interface Playlist {
  id: string;
  name: string;
  description: string;
  images: Image[];
  tracks: Track[];
  owner: {
    id: string;
    display_name: string;
  };
}
```

---

## 🎨 Tema & Styling

### Colors (dari theme.css)
```css
--spotify-black: #000000        /* Sidebar background */
--spotify-dark: #121212         /* Main background */
--spotify-card: #181818         /* Card background */
--spotify-green: #1DB954        /* Primary accent */
--spotify-green-hover: #1ed760  /* Hover state */
--spotify-text: #ffffff         /* Primary text */
--spotify-text-muted: #b3b3b3   /* Secondary text */
--spotify-gray: #282828         /* Secondary bg */
```

### Font
```css
font-family: 'Inter', sans-serif;
font-weight: 400 | 500 | 600 | 700
```

---

## 🔌 API Integration

### Mock Functions (Current)
File: `src/app/utils/spotifyApi.ts`

```typescript
fetchTracks(query?)           // Get tracks
fetchPlaylists()              // Get playlists
searchMusic(query, type)      // Search
getTrackById(id)              // Get single track
getRecommendations(seedId)    // Get recommendations
getUserTopTracks()            // Get top tracks
getRecentlyPlayed()           // Get recent plays
```

### Real API Integration
Lihat file: `src/app/utils/spotifyAuthGuide.ts`

**Steps:**
1. Setup Spotify Developer Account
2. Get Client ID & Secret
3. Implement OAuth 2.0
4. Replace mock functions
5. Handle authentication

---

## 🎵 Mock Data

File: `src/app/data/mockData.ts`

**Includes:**
- 6 sample tracks dengan album covers dari Unsplash
- 4 sample playlists
- Helper functions:
  - `formatDuration(ms)` - Format durasi (3:45)
  - `formatTime(seconds)` - Format waktu (1:23)

---

## 🚀 Deployment Checklist

- [ ] Replace mock API dengan real Spotify API
- [ ] Implement OAuth authentication
- [ ] Setup environment variables
- [ ] Add error handling
- [ ] Optimize images
- [ ] Add SEO meta tags
- [ ] Setup CDN untuk assets
- [ ] Enable PWA features (optional)
- [ ] Add analytics
- [ ] Performance testing

---

## 🐛 Debugging Tips

### Common Issues:

**1. Player not working:**
- Check if currentTrack is set in store
- Verify queue is populated
- Check browser console for errors

**2. Search not showing results:**
- Verify mockTracks data is imported
- Check filter logic in SearchBar
- Console log filtered results

**3. Styling issues:**
- Clear browser cache
- Check Tailwind classes
- Verify theme.css is loaded

**4. State not updating:**
- Check Zustand store actions
- Verify component is using store hook
- Add console logs in actions

---

## 📚 Learning Resources

**Spotify Web API:**
- Docs: https://developer.spotify.com/documentation/web-api
- Console: https://developer.spotify.com/console

**Zustand:**
- Docs: https://github.com/pmndrs/zustand
- Tutorial: https://zustand-demo.pmnd.rs

**Tailwind CSS:**
- Docs: https://tailwindcss.com
- Cheatsheet: https://nerdcave.com/tailwind-cheat-sheet

**TypeScript:**
- Handbook: https://www.typescriptlang.org/docs
- React + TS: https://react-typescript-cheatsheet.netlify.app

---

## 💡 Best Practices

1. **Component Organization:**
   - Keep components small and focused
   - Use composition over inheritance
   - Extract reusable logic to custom hooks

2. **State Management:**
   - Keep store flat and normalized
   - Use actions for all state updates
   - Avoid duplicating state

3. **TypeScript:**
   - Always define interfaces
   - Avoid `any` type
   - Use strict mode

4. **Performance:**
   - Lazy load components
   - Memoize expensive computations
   - Optimize re-renders

5. **Accessibility:**
   - Add ARIA labels
   - Keyboard navigation
   - Semantic HTML

---

**Last Updated:** March 9, 2026
**Version:** 1.0.0
