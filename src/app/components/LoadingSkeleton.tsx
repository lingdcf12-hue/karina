import { Skeleton } from './ui/skeleton';

export function LoadingSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-10 bg-gradient-to-b from-[#1a1a1a] to-[#121212]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-8 py-4">
          <Skeleton className="h-9 w-48 bg-[#282828]" />
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Recently Played Skeleton */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-[#181818] rounded overflow-hidden"
              >
                <Skeleton className="w-20 h-20 bg-[#282828]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-[#282828]" />
                  <Skeleton className="h-3 w-24 bg-[#282828]" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Playlists Skeleton */}
        <section className="mb-10">
          <Skeleton className="h-8 w-48 mb-6 bg-[#282828]" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-[#181818] p-4 rounded-lg">
                <Skeleton className="w-full aspect-square rounded-lg mb-4 bg-[#282828]" />
                <Skeleton className="h-4 w-full mb-2 bg-[#282828]" />
                <Skeleton className="h-3 w-3/4 bg-[#282828]" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
