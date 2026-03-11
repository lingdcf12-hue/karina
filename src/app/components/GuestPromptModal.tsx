import { useMusicStore } from '../store/musicStore';

export function GuestPromptModal() {
  const { guestPromptTrack, setGuestPromptTrack, setCurrentView } = useMusicStore();

  if (!guestPromptTrack) return null;

  return (
    <div className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[850px] bg-[#222222] rounded-2xl flex flex-col md:flex-row overflow-hidden shadow-2xl">
        
        {/* Close button outside or top right? Let's put a subtle close button or click overlay */}
        <button 
          onClick={() => setGuestPromptTrack(null)}
          className="absolute top-4 right-4 text-[#a7a7a7] hover:text-white p-2 z-10"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current"><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/></svg>
        </button>

        {/* Left Side: Track Image */}
        <div className="w-full md:w-1/2 p-10 flex justify-center items-center bg-[#282828]">
          <img 
            src={guestPromptTrack.album?.images[0]?.url || (guestPromptTrack as any).image} 
            alt={guestPromptTrack.name} 
            className="w-full max-w-[320px] aspect-square object-cover rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* Right Side: Content */}
        <div className="w-full md:w-1/2 p-10 flex flex-col items-center justify-center text-center bg-[#282828]">
          <h2 className="text-3xl font-extrabold text-white mb-10 leading-snug tracking-tighter">
            Mulai<br />
            mendengarkan<br />
            dengan akun Spotify<br />
            gratis
          </h2>

          <div className="flex flex-col gap-4 w-full max-w-[250px]">
            <button 
              onClick={() => {
                setGuestPromptTrack(null);
                setCurrentView('register');
              }}
              className="w-full py-3.5 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold text-base rounded-full hover:scale-105 transition-all"
            >
              Daftar gratis
            </button>

            <button 
              onClick={() => {
                setGuestPromptTrack(null);
              }}
              className="w-full py-3.5 border border-[#878787] hover:border-white text-white font-bold text-base rounded-full hover:scale-105 transition-all"
            >
              Download app
            </button>
          </div>

          <p className="mt-8 text-sm text-[#a7a7a7]">
            Sudah punya akun?{' '}
            <button 
              onClick={() => {
                setGuestPromptTrack(null);
                setCurrentView('login');
              }}
              className="text-white hover:underline font-bold"
            >
              Masuk
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
