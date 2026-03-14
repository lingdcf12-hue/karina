import express from 'express';
import cors from 'cors';
import { Innertube, UniversalCache } from 'youtubei.js';

const app = express();
const port = 3005;

app.use(cors());
app.use(express.json());

let ytInstance = null;

// Fungsi pintar untuk mendapatkan atau membuat instance YouTube
async function getYt() {
  if (ytInstance) return ytInstance;
  
  try {
    console.log('⏳ Sedang membangun mesin YouTube...');
    ytInstance = await Innertube.create({
        cache: new UniversalCache(false),
        generate_session_locally: true
    });
    console.log('✅ DATABASE YOUTUBE SIAP (MODE ANTI-BLOKIR V13)');
    return ytInstance;
  } catch (e) {
    console.error("❌ Gagal bangunkan mesin:", e.message);
    return null;
  }
}

// Jalankan inisialisasi di awal untuk mempercepat standby
getYt();

// 1. ENGINE PENCARIAN
app.get('/api/search', async (req, res) => {
  const yt = await getYt();
  if (!yt) return res.status(503).json([]);
  
  const query = req.query.q || 'Top Hits Indonesia';
  try {
    console.log(`🔍 Mencari Lagu: ${query}`);
    const search = await yt.search(query, { type: 'video' });
    const videos = search.videos.slice(0, 15);

    // Pastikan pakai HTTPS di Vercel agar tidak diblokir browser HP
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;

    res.json(videos.map(v => ({
      id: v.id,
      name: v.title.text,
      artists: [{ id: v.author.id, name: v.author.name }],
      album: {
        id: v.id,
        name: 'YouTube Music Global',
        images: [{ url: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` }],
        release_date: 'Baru',
        total_tracks: 1,
      },
      duration_ms: (v.duration?.seconds || 180) * 1000,
      preview_url: `${baseUrl}/api/stream?id=${v.id}`, 
      explicit: false,
      popularity: 100,
    })));
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json([]);
  }
});

// 2. ENGINE STREAMING PIPI (Sangat Stabil)
app.get('/api/stream', async (req, res) => {
  const yt = await getYt();
  if (!yt) return res.status(503).send("Server belum siap");
  
  const videoId = req.query.id;
  if (!videoId) return res.status(400).send("ID diperlukan");

  try {
    console.log(`🎬 Mendapatkan URL Audio Langsung: ${videoId}`);
    
    const info = await yt.getBasicInfo(videoId);
    const audioFormat = info.chooseFormat({ type: 'audio', quality: 'best' });
    
    if (audioFormat && audioFormat.decipher) {
        // Redirect browser langsung ke server GoogleVideo untuk dapat fitur Chunk, Seeking, dan No Vercel Limit!
        const directUrl = audioFormat.decipher(yt.session.player);
        return res.redirect(directUrl);
    } else {
        return res.status(404).send("Stream URL tidak ditemukan");
    }

  } catch (error) {
    console.error("❌ Gagal Saluran:", error.message);
    res.status(500).send("Gagal");
  }
});

app.get('/api/tracks', async (req, res) => {
    const yt = await getYt();
    if (!yt) return res.json([]);
    
    try {
        const search = await yt.search('New Songs Indonesia 2025', { type: 'video' });
        const videos = search.videos.slice(0, 12);

        const protocol = req.headers['x-forwarded-proto'] || 'http';
        const host = req.headers.host;
        const baseUrl = `${protocol}://${host}`;

        res.json(videos.map(v => ({
            id: v.id,
            name: v.title.text,
            artists: [{ id: v.author.id, name: v.author.name }],
            album: {
                id: v.id,
                name: 'Koleksi Untukmu',
                images: [{ url: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` }],
                release_date: 'TOP HITS',
                total_tracks: 1,
            },
            duration_ms: (v.duration?.seconds || 180) * 1000,
            preview_url: `${baseUrl}/api/stream?id=${v.id}`,
            explicit: false,
            popularity: 100,
        })));
    } catch (e) {
        res.json([]);
    }
});

// Export for Vercel
export default app;

// Only listen if not running as a Vercel function
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`🚀 SPOTIFY CLONE V13 STANDBY ON PORT ${port}!`);
  });
}
