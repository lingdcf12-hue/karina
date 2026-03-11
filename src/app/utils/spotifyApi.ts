import { Track, Playlist, Artist } from '../types/music';
import { mockTracks, mockPlaylists } from '../data/mockData';

/**
 * Spotify API Utility Functions
 * 
 * CATATAN INTEGRASI API:
 * File ini berisi mock functions yang mensimulasikan Spotify Web API.
 * Untuk integrasi dengan API real, Anda perlu:
 * 
 * 1. Spotify Web API:
 *    - Daftar di https://developer.spotify.com/dashboard
 *    - Dapatkan Client ID dan Client Secret
 *    - Implementasi OAuth 2.0 Authorization Code Flow
 *    - Endpoint: https://api.spotify.com/v1/
 * 
 * 2. RapidAPI (Alternatif):
 *    - Daftar di https://rapidapi.com/
 *    - Subscribe ke Shazam Core API atau Deezer API
 *    - Gunakan X-RapidAPI-Key untuk authentikasi
 * 
 * Contoh implementasi real:
 * 
 * const fetchTracks = async (query: string) => {
 *   const response = await fetch(
 *     `https://api.spotify.com/v1/search?q=${query}&type=track&limit=20`,
 *     {
 *       headers: {
 *         'Authorization': `Bearer ${accessToken}`,
 *       },
 *     }
 *   );
 *   const data = await response.json();
 *   return data.tracks.items;
 * };
 */

// Simulasi delay network
const simulateNetworkDelay = (ms: number = 500) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock API: Fetch Tracks
export const fetchTracks = async (query?: string): Promise<Track[]> => {
  await simulateNetworkDelay();
  
  if (query) {
    return mockTracks.filter(
      (track) =>
        track.name.toLowerCase().includes(query.toLowerCase()) ||
        track.artists.some((artist) =>
          artist.name.toLowerCase().includes(query.toLowerCase())
        )
    );
  }
  
  return mockTracks;
};

// Mock API: Fetch Playlists
export const fetchPlaylists = async (): Promise<Playlist[]> => {
  await simulateNetworkDelay();
  return mockPlaylists;
};

// Mock API: Fetch Featured Playlists
export const fetchFeaturedPlaylists = async (): Promise<Playlist[]> => {
  await simulateNetworkDelay();
  return mockPlaylists;
};

// Mock API: Search
export const searchMusic = async (
  query: string,
  type: 'track' | 'artist' | 'album' = 'track'
): Promise<Track[]> => {
  await simulateNetworkDelay();
  
  return mockTracks.filter((track) => {
    const searchLower = query.toLowerCase();
    switch (type) {
      case 'track':
        return track.name.toLowerCase().includes(searchLower);
      case 'artist':
        return track.artists.some((artist) =>
          artist.name.toLowerCase().includes(searchLower)
        );
      case 'album':
        return track.album.name.toLowerCase().includes(searchLower);
      default:
        return false;
    }
  });
};

// Mock API: Get Track by ID
export const getTrackById = async (id: string): Promise<Track | null> => {
  await simulateNetworkDelay();
  return mockTracks.find((track) => track.id === id) || null;
};

// Mock API: Get Recommendations
export const getRecommendations = async (
  seedTrackId: string
): Promise<Track[]> => {
  await simulateNetworkDelay();
  // Simulasi rekomendasi dengan shuffle tracks
  return [...mockTracks].sort(() => Math.random() - 0.5).slice(0, 5);
};

// Mock API: Get User's Top Tracks
export const getUserTopTracks = async (): Promise<Track[]> => {
  await simulateNetworkDelay();
  return mockTracks.slice(0, 10);
};

// Mock API: Get Recently Played
export const getRecentlyPlayed = async (): Promise<Track[]> => {
  await simulateNetworkDelay();
  return mockTracks.slice(0, 6);
};

/**
 * CONTOH INTEGRASI REAL API:
 * 
 * // 1. Setup Axios instance untuk Spotify API
 * import axios from 'axios';
 * 
 * const spotifyApi = axios.create({
 *   baseURL: 'https://api.spotify.com/v1',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 * });
 * 
 * // 2. Interceptor untuk menambahkan access token
 * spotifyApi.interceptors.request.use((config) => {
 *   const token = localStorage.getItem('spotify_access_token');
 *   if (token) {
 *     config.headers.Authorization = `Bearer ${token}`;
 *   }
 *   return config;
 * });
 * 
 * // 3. Implementasi real fetch
 * export const fetchTracks = async (query?: string): Promise<Track[]> => {
 *   try {
 *     const response = await spotifyApi.get('/search', {
 *       params: {
 *         q: query || 'trending',
 *         type: 'track',
 *         limit: 20,
 *       },
 *     });
 *     return response.data.tracks.items;
 *   } catch (error) {
 *     console.error('Error fetching tracks:', error);
 *     throw error;
 *   }
 * };
 */
