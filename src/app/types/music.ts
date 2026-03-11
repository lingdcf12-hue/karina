// TypeScript Types untuk Spotify Clone
// Struktur ini mengikuti format Spotify Web API

export interface Track {
  id: string;
  name: string;
  artists: Artist[];
  album: Album;
  duration_ms: number;
  preview_url: string | null;
  explicit: boolean;
  popularity: number;
}

export interface Artist {
  id: string;
  name: string;
  images?: Image[];
  genres?: string[];
}

export interface Album {
  id: string;
  name: string;
  images: Image[];
  release_date: string;
  total_tracks: number;
}

export interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Playlist {
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

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Track[];
  shuffle: boolean;
  repeat: 'off' | 'track' | 'context';
}
