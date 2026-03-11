/**
 * PANDUAN INTEGRASI SPOTIFY WEB API
 * ===================================
 * 
 * File ini berisi panduan lengkap untuk mengintegrasikan Spotify Web API
 * ke dalam aplikasi Spotify Clone ini.
 */

// ========================================
// STEP 1: SETUP SPOTIFY DEVELOPER ACCOUNT
// ========================================

/**
 * 1. Kunjungi https://developer.spotify.com/dashboard
 * 2. Login dengan akun Spotify Anda
 * 3. Klik "Create an App"
 * 4. Isi form:
 *    - App Name: "My Spotify Clone"
 *    - App Description: "A Spotify web player clone"
 *    - Redirect URI: "http://localhost:5173/callback"
 * 5. Simpan Client ID dan Client Secret
 */

// ========================================
// STEP 2: INSTALL DEPENDENCIES
// ========================================

/**
 * Install packages yang diperlukan:
 * npm install axios
 * npm install @types/spotify-web-api-js (optional, untuk type definitions)
 */

// ========================================
// STEP 3: SETUP ENVIRONMENT VARIABLES
// ========================================

/**
 * Buat file .env di root folder:
 * 
 * VITE_SPOTIFY_CLIENT_ID=your_client_id_here
 * VITE_SPOTIFY_CLIENT_SECRET=your_client_secret_here
 * VITE_REDIRECT_URI=http://localhost:5173/callback
 */

// ========================================
// STEP 4: IMPLEMENTASI OAUTH 2.0 FLOW
// ========================================

import axios from 'axios';

// Konfigurasi
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-library-read',
  'user-library-modify',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'streaming',
];

// Generate Authorization URL
export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '),
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
};

// Exchange Code for Access Token
export const getAccessToken = async (code: string) => {
  const response = await axios.post(
    TOKEN_ENDPOINT,
    new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  
  return response.data;
};

// Refresh Access Token
export const refreshAccessToken = async (refreshToken: string) => {
  const response = await axios.post(
    TOKEN_ENDPOINT,
    new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
  
  return response.data;
};

// ========================================
// STEP 5: CREATE AXIOS INSTANCE
// ========================================

// Create Spotify API instance
const spotifyApi = axios.create({
  baseURL: 'https://api.spotify.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to every request
spotifyApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('spotify_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
spotifyApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('spotify_refresh_token');
      if (refreshToken) {
        try {
          const { access_token } = await refreshAccessToken(refreshToken);
          localStorage.setItem('spotify_access_token', access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return spotifyApi(originalRequest);
        } catch (refreshError) {
          // Redirect to login
          window.location.href = getAuthUrl();
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// ========================================
// STEP 6: API FUNCTIONS
// ========================================

// Search for tracks
export const searchTracks = async (query: string, limit = 20) => {
  const response = await spotifyApi.get('/search', {
    params: {
      q: query,
      type: 'track',
      limit,
    },
  });
  return response.data.tracks.items;
};

// Get user's playlists
export const getUserPlaylists = async () => {
  const response = await spotifyApi.get('/me/playlists');
  return response.data.items;
};

// Get featured playlists
export const getFeaturedPlaylists = async () => {
  const response = await spotifyApi.get('/browse/featured-playlists');
  return response.data.playlists.items;
};

// Get track details
export const getTrack = async (id: string) => {
  const response = await spotifyApi.get(`/tracks/${id}`);
  return response.data;
};

// Get user's top tracks
export const getUserTopTracks = async (limit = 20) => {
  const response = await spotifyApi.get('/me/top/tracks', {
    params: { limit },
  });
  return response.data.items;
};

// Get recommendations
export const getRecommendations = async (seedTracks: string[]) => {
  const response = await spotifyApi.get('/recommendations', {
    params: {
      seed_tracks: seedTracks.join(','),
      limit: 20,
    },
  });
  return response.data.tracks;
};

// Get currently playing track
export const getCurrentlyPlaying = async () => {
  const response = await spotifyApi.get('/me/player/currently-playing');
  return response.data;
};

// Play track
export const playTrack = async (uris: string[], position = 0) => {
  await spotifyApi.put('/me/player/play', {
    uris,
    position_ms: position,
  });
};

// Pause playback
export const pausePlayback = async () => {
  await spotifyApi.put('/me/player/pause');
};

// Skip to next
export const skipToNext = async () => {
  await spotifyApi.post('/me/player/next');
};

// Skip to previous
export const skipToPrevious = async () => {
  await spotifyApi.post('/me/player/previous');
};

// Set volume
export const setVolume = async (volumePercent: number) => {
  await spotifyApi.put('/me/player/volume', null, {
    params: { volume_percent: volumePercent },
  });
};

// ========================================
// STEP 7: CREATE AUTH COMPONENT
// ========================================

/**
 * Buat komponen Login untuk handle OAuth flow:
 * 
 * import { useEffect } from 'react';
 * import { useNavigate } from 'react-router-dom';
 * import { getAuthUrl, getAccessToken } from './utils/spotifyAuth';
 * 
 * export function Login() {
 *   const navigate = useNavigate();
 * 
 *   const handleLogin = () => {
 *     window.location.href = getAuthUrl();
 *   };
 * 
 *   return (
 *     <button onClick={handleLogin}>
 *       Login with Spotify
 *     </button>
 *   );
 * }
 * 
 * // Callback component
 * export function Callback() {
 *   const navigate = useNavigate();
 * 
 *   useEffect(() => {
 *     const code = new URLSearchParams(window.location.search).get('code');
 *     if (code) {
 *       getAccessToken(code).then(({ access_token, refresh_token }) => {
 *         localStorage.setItem('spotify_access_token', access_token);
 *         localStorage.setItem('spotify_refresh_token', refresh_token);
 *         navigate('/');
 *       });
 *     }
 *   }, [navigate]);
 * 
 *   return <div>Loading...</div>;
 * }
 */

// ========================================
// STEP 8: UPDATE MUSIC STORE
// ========================================

/**
 * Update store untuk menggunakan real API:
 * 
 * import { searchTracks, playTrack, pausePlayback } from '../utils/spotifyAuth';
 * 
 * // Di dalam store actions:
 * setCurrentTrack: async (track) => {
 *   set({ currentTrack: track, isPlaying: true });
 *   await playTrack([track.uri]);
 * },
 * 
 * togglePlay: async () => {
 *   const { isPlaying } = get();
 *   if (isPlaying) {
 *     await pausePlayback();
 *   } else {
 *     await playTrack([get().currentTrack.uri]);
 *   }
 *   set({ isPlaying: !isPlaying });
 * },
 */

// ========================================
// ADDITIONAL NOTES
// ========================================

/**
 * PENTING:
 * 1. Jangan commit .env file ke Git
 * 2. Simpan token di localStorage atau secure storage
 * 3. Implement proper error handling
 * 4. Test dengan different network conditions
 * 5. Handle rate limiting (429 errors)
 * 
 * ALTERNATIVE - RAPIDAPI:
 * Jika tidak ingin setup OAuth, gunakan RapidAPI:
 * - Shazam Core API: https://rapidapi.com/apidojo/api/shazam-core
 * - Deezer API: https://rapidapi.com/deezerdevs/api/deezer-1
 * 
 * Lebih simple, tapi fitur terbatas dan ada rate limit.
 */

export {};
