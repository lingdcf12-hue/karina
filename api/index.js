import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// THE "GHOST PROXY" - VERSI FINAL (SERVER-SIDE STREAMING)
// Ini adalah cara paling ampuh. Server Vercel kamu yang akan mendownload lagu 
// dan "menyuapi" browser kamu. Tidak akan ada lagi masalah IP-Lock atau Blokir ISP.
app.get('/api/stream', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send("ID diperlukan");

    const pipedInstances = [
        'https://pipedapi.kavin.rocks',
        'https://api.piped.victr.me',
        'https://pipedapi.moomoo.me',
        'https://pipedapi.lunar.icu'
    ];

    console.log(`📡 [Backend] Proxying stream for: ${videoId}`);

    for (const instance of pipedInstances) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); 

            const response = await fetch(`${instance}/streams/${videoId}`, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) continue;
            const data = await response.json();

            // Ambil Bitrate terendah tapi format M4A (biar hemat kuota server & stabil)
            const audioStream = data.audioStreams?.find(s => s.format === 'M4A') || data.audioStreams?.[0];
            
            if (audioStream && audioStream.url) {
                console.log(`✅ [Backend] Streaming started via ${instance}`);
                
                // Fetch konten audio asli dari Google/Piped
                const audioRes = await fetch(audioStream.url);
                
                if (!audioRes.ok) continue;

                // BERIKAN KE BROWSER SECARA LANGSUNG (PROXYING)
                // Set Header yang benar
                res.setHeader('Content-Type', 'audio/mpeg');
                // Berikan info ukuran jika ada
                if (audioRes.headers.get('content-length')) {
                    res.setHeader('Content-Length', audioRes.headers.get('content-length'));
                }
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Cache-Control', 'public, max-age=3600');

                // Pipe data (Gunakan ReadableStream)
                const reader = audioRes.body.getReader();
                
                // Keep-alive connection
                req.on('close', () => {
                   reader.cancel();
                });

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    res.write(value);
                }
                
                res.end();
                return;
            }
        } catch (e) {
            console.warn(`⚠️ [Backend] Gagal via ${instance}`);
        }
    }

    // TERAKHIR: JIKA SEMUA GAGAL, REDIRECT KE YEW TU BE (SEBAGAI CADANGAN DARURAT)
    return res.redirect(302, `https://yewtu.be/latest_version?id=${videoId}&itag=140`);
});

// SEARCH & TRACKS
app.get('/api/search', async (req, res) => {
    try {
        const { Innertube, UniversalCache } = await import('youtubei.js');
        const yt = await Innertube.create({ generate_session_locally: true, cache: new UniversalCache(false) });
        const query = req.query.q || 'Top Hits Indonesia';
        const search = await yt.search(query, { type: 'video' });
        
        res.json(search.videos.map(v => ({
            id: v.id,
            name: v.title?.text || 'Unknown',
            artists: [{ id: v.author?.id || 'id', name: v.author?.name || 'Unknown' }],
            album: { id: v.id, name: 'YouTube Music', images: [{ url: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` }] },
            duration_ms: (v.duration?.seconds || 180) * 1000,
            preview_url: `/api/stream?id=${v.id}`
        })));
    } catch (e) { res.status(500).json([]); }
});

app.get('/api/tracks', async (req, res) => {
    try {
        const themes = [
          'Spotify Viral Indonesia 2025',
          'Lagu Pop Indonesia hits',
          'Indie Indonesia terbaru',
          'Lagu Slow Indonesia santai',
          'Top Hits Indonesia 2025',
          'Dangdut Koplo terbaru',
          'Lagu Galau Indonesia',
          'Hip Hop Indonesia terbaru',
          'Lagu Akustik Cover Indonesia'
        ];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        
        const { Innertube, UniversalCache } = await import('youtubei.js');
        const yt = await Innertube.create({ generate_session_locally: true, cache: new UniversalCache(false) });
        const search = await yt.search(randomTheme, { type: 'video' });
        
        res.json(search.videos.slice(0, 15).map(v => ({
            id: v.id,
            name: v.title?.text || 'Unknown',
            artists: [{ id: v.author?.id || 'id', name: v.author?.name || 'Unknown' }],
            album: { id: v.id, name: 'Rekomendasi Untukmu', images: [{ url: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` }] },
            duration_ms: (v.duration?.seconds || 180) * 1000,
            preview_url: `/api/stream?id=${v.id}`
        })));
    } catch (e) { res.json([]); }
});

export default app;

if (process.env.NODE_ENV !== 'production') {
    app.listen(3005, () => console.log("🚀 API LOCAL READY"));
}
