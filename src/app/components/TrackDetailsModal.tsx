import { useMusicStore } from '../store/musicStore';
import { X, Play, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { formatDuration } from '../utils/formatters';

interface TrackDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackDetailsModal({ isOpen, onClose }: TrackDetailsModalProps) {
  const { currentTrack, queue, setCurrentTrack } = useMusicStore();

  if (!isOpen || !currentTrack) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181818] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#181818] border-b border-white/10 p-4 flex items-center justify-between">
          <h2 className="text-white text-xl font-bold">Now Playing</h2>
          <button
            onClick={onClose}
            className="text-[#b3b3b3] hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Track */}
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            <img
              src={currentTrack.album.images[0].url}
              alt={currentTrack.name}
              className="w-full md:w-80 h-80 object-cover rounded-lg shadow-2xl"
            />
            <div className="flex-1">
              <h3 className="text-white text-3xl font-bold mb-2">
                {currentTrack.name}
              </h3>
              <p className="text-[#b3b3b3] text-lg mb-4">
                {currentTrack.artists.map((a) => a.name).join(', ')}
              </p>
              <p className="text-[#b3b3b3] mb-6">
                Album: {currentTrack.album.name}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 mb-6">
                <div>
                  <p className="text-[#b3b3b3] text-sm">Duration</p>
                  <p className="text-white font-semibold">
                    {formatDuration(currentTrack.duration_ms)}
                  </p>
                </div>
                <div>
                  <p className="text-[#b3b3b3] text-sm">Release Date</p>
                  <p className="text-white font-semibold">
                    {new Date(currentTrack.album.release_date).getFullYear()}
                  </p>
                </div>
                <div>
                  <p className="text-[#b3b3b3] text-sm">Popularity</p>
                  <p className="text-white font-semibold">
                    {currentTrack.popularity}/100
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button className="bg-[#1DB954] text-black px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2">
                  <Play className="w-4 h-4" fill="currentColor" />
                  Play
                </button>
                <button className="border border-white/20 text-white px-6 py-3 rounded-full font-semibold hover:border-white/40 transition-colors flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Save
                </button>
                <button className="text-[#b3b3b3] hover:text-white transition-colors p-3">
                  <Share2 className="w-5 h-5" />
                </button>
                <button className="text-[#b3b3b3] hover:text-white transition-colors p-3">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Queue */}
          <div>
            <h3 className="text-white text-xl font-bold mb-4">Next in Queue</h3>
            <div className="space-y-2">
              {queue.slice(0, 10).map((track, index) => (
                <button
                  key={track.id}
                  onClick={() => setCurrentTrack(track)}
                  className="flex items-center gap-4 p-3 rounded hover:bg-[#282828] transition-colors w-full group"
                >
                  <span className="text-[#b3b3b3] text-sm min-w-[20px]">
                    {index + 1}
                  </span>
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
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#b3b3b3] hover:text-white">
                    <Play className="w-4 h-4" fill="currentColor" />
                  </button>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
