# 🌳 Project File Tree

```
spotify-clone/
│
├── 📁 src/
│   ├── 📁 app/
│   │   ├── 📁 components/
│   │   │   ├── 📁 ui/                          # Shadcn/ui base components
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   └── ... (other UI components)
│   │   │   │
│   │   │   ├── Sidebar.tsx                     # ⭐ Left navigation
│   │   │   ├── HomeGrid.tsx                    # ⭐ Main content grid
│   │   │   ├── MusicPlayer.tsx                 # ⭐ Bottom player bar
│   │   │   ├── SearchBar.tsx                   # ⭐ Search overlay
│   │   │   ├── TrackDetailsModal.tsx           # ⭐ Track info modal
│   │   │   └── LoadingSkeleton.tsx             # ⭐ Loading states
│   │   │
│   │   ├── 📁 store/
│   │   │   └── musicStore.ts                   # 🔥 Zustand global state
│   │   │
│   │   ├── 📁 types/
│   │   │   └── music.ts                        # 📘 TypeScript interfaces
│   │   │
│   │   ├── 📁 data/
│   │   │   └── mockData.ts                     # 🎵 Sample tracks & playlists
│   │   │
│   │   ├── 📁 utils/
│   │   │   ├── spotifyApi.ts                   # 🔌 Mock API functions
│   │   │   └── spotifyAuthGuide.ts             # 📖 API integration guide
│   │   │
│   │   ├── projectInfo.ts                      # ℹ️ Project metadata
│   │   └── App.tsx                             # 🚀 Main application
│   │
│   └── 📁 styles/
│       ├── fonts.css                           # 🔤 Font imports (Inter)
│       ├── theme.css                           # 🎨 Spotify color theme
│       ├── tailwind.css                        # 🌊 Tailwind config
│       └── index.css                           # 🌐 Global styles
│
├── 📄 README.md                                # 📚 Main documentation
├── 📄 DOCUMENTATION.md                         # 📖 Technical details
├── 📄 QUICKSTART.md                            # ⚡ Getting started
├── 📄 CHANGELOG.md                             # 📝 Version history
├── 📄 TREE.md                                  # 🌳 This file
│
├── 📄 .env.example                             # 🔐 Environment template
├── 📄 .gitignore                               # 🚫 Git ignore rules
│
├── 📄 package.json                             # 📦 Dependencies
├── 📄 vite.config.ts                           # ⚙️ Vite configuration
└── 📄 postcss.config.mjs                       # 🎨 PostCSS config

```

---

## 📂 Folder Descriptions

### `/src/app/components/`
**Purpose:** React components  
**Contents:**
- **Sidebar.tsx** - Left navigation with Home, Search, and Library
- **HomeGrid.tsx** - Main content area with Recently Played and Playlists
- **MusicPlayer.tsx** - Bottom player bar with controls
- **SearchBar.tsx** - Search overlay with real-time filtering
- **TrackDetailsModal.tsx** - Modal showing track details and queue
- **LoadingSkeleton.tsx** - Professional loading states
- **ui/** - Base UI components from shadcn/ui

**Lines of Code:** ~1,500
**Files:** 7 main components + UI library

---

### `/src/app/store/`
**Purpose:** Global state management  
**Contents:**
- **musicStore.ts** - Zustand store for player state

**State:**
```typescript
{
  currentTrack: Track | null
  isPlaying: boolean
  volume: number
  progress: number
  duration: number
  queue: Track[]
  shuffle: boolean
  repeat: 'off' | 'track' | 'context'
}
```

**Actions:** 12 functions for player control

---

### `/src/app/types/`
**Purpose:** TypeScript type definitions  
**Contents:**
- **music.ts** - Interfaces for Track, Album, Artist, Playlist, PlayerState

**Interfaces:** 6 main types
**Lines of Code:** ~60

---

### `/src/app/data/`
**Purpose:** Mock data for development  
**Contents:**
- **mockData.ts** - 6 sample tracks, 4 playlists, helper functions

**Data:**
- 6 tracks with album covers
- 4 curated playlists
- formatDuration() function
- formatTime() function

---

### `/src/app/utils/`
**Purpose:** Utility functions  
**Contents:**
- **spotifyApi.ts** - Mock API functions (8 functions)
- **spotifyAuthGuide.ts** - Complete API integration tutorial

**Functions:**
- fetchTracks()
- fetchPlaylists()
- searchMusic()
- getTrackById()
- getRecommendations()
- getUserTopTracks()
- getRecentlyPlayed()

---

### `/src/styles/`
**Purpose:** Styling and theming  
**Contents:**
- **fonts.css** - Inter font import from Google Fonts
- **theme.css** - Spotify Deep Dark color palette
- **tailwind.css** - Tailwind v4 configuration
- **index.css** - Global styles, scrollbar, selection

**Theme Colors:**
```css
--spotify-black: #000000
--spotify-dark: #121212
--spotify-card: #181818
--spotify-green: #1DB954
```

---

## 📊 Project Statistics

### Lines of Code
```
Components:     ~1,500 lines
Store:          ~100 lines
Types:          ~60 lines
Mock Data:      ~200 lines
Utils:          ~400 lines
Styles:         ~250 lines
Documentation:  ~2,000 lines
────────────────────────────
Total:          ~4,510 lines
```

### File Count
```
React Components:    7
TypeScript Files:    8
CSS Files:          4
Documentation:      5
Config Files:       4
────────────────────────
Total:              28 files
```

### Bundle Size (Estimated)
```
Production Build:   ~200 KB (gzipped)
Dependencies:       ~500 KB
Images (Unsplash):  External CDN
────────────────────────────────
Total Bundle:       ~700 KB
```

---

## 🎯 Component Tree

```
App.tsx
│
├── Sidebar
│   ├── Navigation (Home, Search)
│   ├── Library
│   └── Playlists List
│
├── HomeGrid / SearchBar (conditional)
│   ├── Header (Glassmorphism)
│   ├── Recently Played Grid
│   ├── Featured Playlists
│   └── Popular Tracks
│
└── MusicPlayer (fixed bottom)
    ├── Track Info
    ├── Player Controls
    │   ├── Shuffle
    │   ├── Previous
    │   ├── Play/Pause
    │   ├── Next
    │   └── Repeat
    ├── Progress Bar
    ├── Volume Control
    └── TrackDetailsModal (conditional)
        ├── Track Info
        ├── Album Details
        ├── Actions
        └── Queue List
```

---

## 🔗 Import Relationships

```
App.tsx
  ↓
  ├─→ Sidebar
  ├─→ HomeGrid
  │     ↓
  │     └─→ mockData
  │     └─→ musicStore
  │
  ├─→ SearchBar
  │     ↓
  │     └─→ mockData
  │     └─→ musicStore
  │
  ├─→ MusicPlayer
  │     ↓
  │     ├─→ musicStore
  │     └─→ TrackDetailsModal
  │           ↓
  │           └─→ musicStore
  │
  └─→ LoadingSkeleton
```

---

## 📦 Dependencies Graph

```
React 18.3.1
  ↓
  ├─→ Zustand 5.0 (State)
  ├─→ Lucide React (Icons)
  ├─→ Radix UI (Base Components)
  │
  ├─→ Tailwind CSS 4.1 (Styling)
  │     ↓
  │     └─→ @tailwindcss/vite
  │
  └─→ TypeScript (Type Safety)

Build Tool: Vite 6.3
Dev Server: http://localhost:5173
```

---

## 🚀 Build Output

```
dist/
├── assets/
│   ├── index-[hash].js      # Main bundle
│   ├── index-[hash].css     # Styles
│   └── vendor-[hash].js     # Dependencies
├── index.html               # Entry point
└── vite.svg                 # Favicon
```

---

## 📝 Documentation Files

1. **README.md** (Main)
   - Project overview
   - Feature list
   - Tech stack
   - API integration guide
   - Installation instructions

2. **DOCUMENTATION.md** (Technical)
   - Component details
   - State architecture
   - TypeScript types
   - API functions
   - Best practices

3. **QUICKSTART.md** (Tutorial)
   - 5-minute setup
   - Usage examples
   - Customization tips
   - Troubleshooting

4. **CHANGELOG.md** (History)
   - Version history
   - Features added
   - Bug fixes
   - Future roadmap

5. **TREE.md** (Structure)
   - This file
   - Project structure
   - File descriptions
   - Statistics

---

## 🎨 Asset Sources

**Images:**
- Unsplash API (via unsplash_tool)
- High-quality album covers
- CDN delivery (external)

**Fonts:**
- Google Fonts (Inter)
- Weights: 300, 400, 500, 600, 700, 800, 900

**Icons:**
- Lucide React
- SVG format
- Tree-shakeable

---

## 🔐 Environment Variables

```
.env (not committed)
.env.example (template)
  ├── VITE_SPOTIFY_CLIENT_ID
  ├── VITE_SPOTIFY_CLIENT_SECRET
  ├── VITE_REDIRECT_URI
  └── VITE_RAPIDAPI_KEY
```

---

**Last Updated:** March 9, 2026  
**Project Version:** 1.0.0  
**Total Files:** 28  
**Total Lines:** ~4,510
