import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.victr.me',
    'https://pipedapi.moomoo.me',
    'https://pipedapi.lunar.icu'
];

const fetchWithFallback = async (path, timeout = 5000) => {
    for (const instance of PIPED_INSTANCES) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(`${instance}${path}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            if (response.ok) return response;
        } catch (e) {
            console.warn(`⚠️ [Piped] Gagal via ${instance}: ${e.message}`);
        }
    }
    return null;
};

const mapPipedVideo = (v) => {
    const id = v.url?.replace('watch?v=', '') || v.videoId || '';
    return {
        id,
        name: v.title || 'Unknown',
        artists: [{ id: 'yt', name: v.uploaderName || 'Unknown' }],
        album: {
            id,
            name: 'YouTube',
            images: [{ url: v.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg` }]
        },
        duration_ms: (v.duration || 180) * 1000,
        preview_url: `/api/stream?id=${id}`
    };
};

// SEARCH
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q || 'Top Hits Indonesia';
        console.log(`🔍 [Search] Query: ${query}`);

        const response = await fetchWithFallback(`/search?q=${encodeURIComponent(query)}&filter=videos`);
        if (!response) throw new Error('Semua instance Piped gagal');

        const data = await response.json();
        const results = (data.items || []).slice(0, 20).map(mapPipedVideo);

        res.json(results);
    } catch (e) {
        console.error('❌ [Search] Error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// TRACKS (Home recommendations)
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
        console.log(`🎵 [Tracks] Theme: ${randomTheme}`);

        const response = await fetchWithFallback(`/search?q=${encodeURIComponent(randomTheme)}&filter=videos`);
        if (!response) throw new Error('Semua instance Piped gagal');

        const data = await response.json();
        const results = (data.items || []).slice(0, 15).map(mapPipedVideo);

        res.json(results);
    } catch (e) {
        console.error('❌ [Tracks] Error:', e.message);
        res.json([]);
    }
});

// STREAM PROXY
app.get('/api/stream', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).send('ID diperlukan');

    console.log(`📡 [Stream] Proxying: ${videoId}`);

    try {
        const response = await fetchWithFallback(`/streams/${videoId}`, 6000);
        if (!response) {
            return res.redirect(302, `https://yewtu.be/latest_version?id=${videoId}&itag=140`);
        }

        const data = await response.json();
        const audioStream = data.audioStreams?.find(s => s.format === 'M4A') || data.audioStreams?.[0];

        if (!audioStream?.url) {
            return res.redirect(302, `https://yewtu.be/latest_version?id=${videoId}&itag=140`);
        }

        const audioRes = await fetch(audioStream.url);
        if (!audioRes.ok) {
            return res.redirect(302, `https://yewtu.be/latest_version?id=${videoId}&itag=140`);
        }

        res.setHeader('Content-Type', 'audio/mpeg');
        if (audioRes.headers.get('content-length')) {
            res.setHeader('Content-Length', audioRes.headers.get('content-length'));
        }
        res.setHeader('Accept-Ranges', 'bytes');
        res.setHeader('Cache-Control', 'public, max-age=3600');

        const reader = audioRes.body.getReader();
        req.on('close', () => reader.cancel());

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
        }

        res.end();
    } catch (e) {
        console.error('❌ [Stream] Error:', e.message);
        return res.redirect(302, `https://yewtu.be/latest_version?id=${videoId}&itag=140`);
    }
});

// Vercel serverless handler
export default function handler(req, res) {
    return app(req, res);
}

// Local dev server
if (process.env.NODE_ENV !== 'production') {
    const port = 3005;
    app.listen(port, () => {
        console.log(`🚀 API LOCAL READY ON PORT ${port}`);
    });
}
