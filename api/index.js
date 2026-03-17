import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// Global Innertube instance for reuse
let yt;

const initYouTube = async () => {
    if (yt) return yt;
    try {
        const { Innertube, UniversalCache } = await import('youtubei.js');
        yt = await Innertube.create({ 
            generate_session_locally: true, 
            cache: new UniversalCache(false) 
        });
        console.log("✅ [Youtube] Innertube initialized");
        return yt;
    } catch (e) {
        console.error("❌ [Youtube] Initialization failed:", e.message);
        return null;
    }
};

// THE "GHOST PROXY" - VERSI FINAL (SERVER-SIDE STREAMING)
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

            const audioStream = data.audioStreams?.find(s => s.format === 'M4A') || data.audioStreams?.[0];
            
            if (audioStream && audioStream.url) {
                console.log(`✅ [Backend] Streaming started via ${instance}`);
                
                const audioRes = await fetch(audioStream.url);
                if (!audioRes.ok) continue;

                res.setHeader('Content-Type', 'audio/mpeg');
                if (audioRes.headers.get('content-length')) {
                    res.setHeader('Content-Length', audioRes.headers.get('content-length'));
                }
                res.setHeader('Accept-Ranges', 'bytes');
                res.setHeader('Cache-Control', 'public, max-age=3600');

                const reader = audioRes.body.getReader();
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

    return res.redirect(302, `https://yewtu.be/latest_version?id=${videoId}&itag=140`);
});

// SEARCH & TRACKS
app.get('/api/search', async (req, res) => {
    try {
        const client = await initYouTube();
        if (!client) throw new Error("YouTube client not ready");

        const query = req.query.q || 'Top Hits Indonesia';
        const search = await client.search(query, { type: 'video' });
        
        res.json(search.videos.map(v => ({
            id: v.id,
            name: v.title?.text || 'Unknown',
            artists: [{ id: v.author?.id || 'id', name: v.author?.name || 'Unknown' }],
            album: { id: v.id, name: 'YouTube Music', images: [{ url: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` }] },
            duration_ms: (v.duration?.seconds || 180) * 1000,
            preview_url: `/api/stream?id=${v.id}`
        })));
    } catch (e) { 
        console.error("❌ [Search] Error:", e.message);
        res.status(500).json([]); 
    }
});

app.get('/api/tracks', async (req, res) => {
    try {
        const themes = [
          'Spotify Viral Indonesia 2025',
          'Lagu Pop Indonesia hits',
          'Indie Indonesia terbaru',
          'Lagu Slow Indonesia santai',
          'Top Hits Indonesia 2025',
          'Lagu Galau Indonesia',
          'Lagu Akustik Cover Indonesia'
        ];
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        
        const client = await initYouTube();
        if (!client) throw new Error("YouTube client not ready");

        const search = await client.search(randomTheme, { type: 'video' });
        
        res.json(search.videos.slice(0, 15).map(v => ({
            id: v.id,
            name: v.title?.text || 'Unknown',
            artists: [{ id: v.author?.id || 'id', name: v.author?.name || 'Unknown' }],
            album: { id: v.id, name: 'Rekomendasi Untukmu', images: [{ url: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` }] },
            duration_ms: (v.duration?.seconds || 180) * 1000,
            preview_url: `/api/stream?id=${v.id}`
        })));
    } catch (e) { 
        console.error("❌ [Tracks] Error:", e.message);
        res.json([]); 
    }
});

export default app;

if (process.env.NODE_ENV !== 'production') {
    const port = 3005;
    app.listen(port, () => {
        console.log(`🚀 API LOCAL READY ON PORT ${port}`);
        // Prerender YouTube client
        initYouTube();
    });
}
