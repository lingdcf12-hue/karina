import { Track, Playlist } from '../types/music';

// Mock Data - Simulating Spotify API Response
export const mockTracks: Track[] = [
  {
    id: 's1',
    name: 'Say Yes To Heaven',
    artists: [{ id: 'ldr1', name: 'Lana Del Rey' }],
    album: {
      id: 'alb_ldr',
      name: 'Say Yes To Heaven',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=640',
          height: 640,
          width: 640,
        },
      ],
      release_date: '2023-05-19',
      total_tracks: 1,
    },
    duration_ms: 209000,
    preview_url: null,
    explicit: false,
    popularity: 98,
  },
  {
    id: '1',
    name: 'Blinding Lights',
    artists: [{ id: 'a1', name: 'The Weeknd' }],
    album: {
      id: 'alb1',
      name: 'After Hours',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1761682704492-b7ed11edfda7?w=640',
          height: 640,
          width: 640,
        },
      ],
      release_date: '2020-03-20',
      total_tracks: 14,
    },
    duration_ms: 200040,
    preview_url: null,
    explicit: false,
    popularity: 95,
  },
  {
    id: '2',
    name: 'Starboy',
    artists: [
      { id: 'a1', name: 'The Weeknd' },
      { id: 'a2', name: 'Daft Punk' },
    ],
    album: {
      id: 'alb2',
      name: 'Starboy',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1771012788591-a1c7e6763e5e?w=640',
          height: 640,
          width: 640,
        },
      ],
      release_date: '2016-11-25',
      total_tracks: 18,
    },
    duration_ms: 230453,
    preview_url: null,
    explicit: true,
    popularity: 92,
  },
  {
    id: '3',
    name: 'Levitating',
    artists: [{ id: 'a3', name: 'Dua Lipa' }],
    album: {
      id: 'alb3',
      name: 'Future Nostalgia',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1712945382945-8bdfe31d4335?w=640',
          height: 640,
          width: 640,
        },
      ],
      release_date: '2020-03-27',
      total_tracks: 11,
    },
    duration_ms: 203064,
    preview_url: null,
    explicit: false,
    popularity: 90,
  },
  {
    id: '4',
    name: 'Save Your Tears',
    artists: [{ id: 'a1', name: 'The Weeknd' }],
    album: {
      id: 'alb1',
      name: 'After Hours',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1594328082907-cd93c1c518d2?w=640',
          height: 640,
          width: 640,
        },
      ],
      release_date: '2020-03-20',
      total_tracks: 14,
    },
    duration_ms: 215626,
    preview_url: null,
    explicit: false,
    popularity: 94,
  },
  {
    id: '5',
    name: 'Heat Waves',
    artists: [{ id: 'a4', name: 'Glass Animals' }],
    album: {
      id: 'alb4',
      name: 'Dreamland',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1637191173577-e9e8f1081396?w=640',
          height: 640,
          width: 640,
        },
      ],
      release_date: '2020-08-07',
      total_tracks: 16,
    },
    duration_ms: 238805,
    preview_url: null,
    explicit: false,
    popularity: 93,
  },
  {
    id: '6',
    name: 'Take Five',
    artists: [{ id: 'a5', name: 'Dave Brubeck' }],
    album: {
      id: 'alb5',
      name: 'Time Out',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1630492096725-d256050e7993?w=640',
          height: 640,
          width: 640,
        },
      ],
      release_date: '1959-12-14',
      total_tracks: 7,
    },
    duration_ms: 324000,
    preview_url: null,
    explicit: false,
    popularity: 88,
  },
];

export const mockPlaylists: Playlist[] = [
  {
    id: 'pl1',
    name: 'Today\'s Top Hits',
    description: 'Ed Sheeran is on top of the Hottest 50!',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1761682704492-b7ed11edfda7?w=640',
        height: 640,
        width: 640,
      },
    ],
    tracks: mockTracks.slice(0, 3),
    owner: {
      id: 'spotify',
      display_name: 'Spotify',
    },
  },
  {
    id: 'pl2',
    name: 'RapCaviar',
    description: 'New music from Kendrick Lamar, Travis Scott, and more',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1637191173577-e9e8f1081396?w=640',
        height: 640,
        width: 640,
      },
    ],
    tracks: mockTracks.slice(2, 5),
    owner: {
      id: 'spotify',
      display_name: 'Spotify',
    },
  },
  {
    id: 'pl3',
    name: 'Chill Vibes',
    description: 'Kick back to the best new and recent chill hits',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1712945382945-8bdfe31d4335?w=640',
        height: 640,
        width: 640,
      },
    ],
    tracks: mockTracks.slice(1, 4),
    owner: {
      id: 'spotify',
      display_name: 'Spotify',
    },
  },
  {
    id: 'pl4',
    name: 'Jazz Classics',
    description: 'The essential jazz standards',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1630492096725-d256050e7993?w=640',
        height: 640,
        width: 640,
      },
    ],
    tracks: [mockTracks[5]],
    owner: {
      id: 'spotify',
      display_name: 'Spotify',
    },
  },
];

