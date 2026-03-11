import { useState } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';
import { Track } from '../types/music';
import { mockTracks } from '../data/mockData';
import { formatDuration } from '../utils/formatters';
import { useMusicStore } from '../store/musicStore';

interface SearchBarProps {
  onClose: () => void;
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { setCurrentTrack, queue, addToQueue } = useMusicStore();

  const filteredTracks = searchQuery
    ? mockTracks.filter(
        (track) =>
          track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          track.artists.some((artist) =>
            artist.name.toLowerCase().includes(searchQuery.toLowerCase())
          ) ||
          track.album.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handlePlayTrack = (track: Track) => {
    // Clear and add all tracks to queue
    const allTracks = [...mockTracks];
    allTracks.forEach((t) => {
      if (!queue.find((q) => q.id === t.id)) {
        addToQueue(t);
      }
    });
    setCurrentTrack(track);
  };

  return (
    <div className="fixed inset-0 bg-[#121212] z-40 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-white text-2xl font-bold">Search</h1>
          <button
            onClick={onClose}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b3b3b3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full bg-[#242424] text-white pl-12 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-white placeholder-[#b3b3b3]"
            autoFocus
          />
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Songs</h2>
            {filteredTracks.length > 0 ? (
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handlePlayTrack(track)}
                    className="flex items-center gap-4 p-2 rounded hover:bg-[#282828] transition-colors w-full group"
                  >
                    <img
                      src={track.album.images[0].url}
                      alt={track.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="text-white font-medium">{track.name}</p>
                      <p className="text-sm text-[#b3b3b3]">
                        {track.artists.map((a) => a.name).join(', ')}
                      </p>
                    </div>
                    <span className="text-sm text-[#b3b3b3]">
                      {formatDuration(track.duration_ms)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[#b3b3b3]">No results found for "{searchQuery}"</p>
            )}
          </div>
        )}

        {/* Browse All Categories */}
        {!searchQuery && (
          <div>
            <h2 className="text-white text-xl font-bold mb-4">Browse All</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: 'Pop', color: 'from-pink-500 to-purple-500' },
                { name: 'Hip-Hop', color: 'from-orange-500 to-red-500' },
                { name: 'Rock', color: 'from-blue-500 to-indigo-500' },
                { name: 'Jazz', color: 'from-green-500 to-teal-500' },
                { name: 'Electronic', color: 'from-cyan-500 to-blue-500' },
                { name: 'Classical', color: 'from-yellow-500 to-orange-500' },
                { name: 'R&B', color: 'from-purple-500 to-pink-500' },
                { name: 'Indie', color: 'from-teal-500 to-green-500' },
              ].map((category) => (
                <div
                  key={category.name}
                  className="bg-gradient-to-br aspect-square rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    backgroundImage: `linear-gradient(to bottom right, ${category.color})`,
                  }}
                >
                  <h3 className="text-white text-xl font-bold">
                    {category.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
