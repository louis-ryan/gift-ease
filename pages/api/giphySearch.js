import axios from 'axios';
import { corsMiddleware, runMiddleware } from '../../utils/cors';

// GIF search for the sender's message step. Proxied so GIPHY_API_KEY stays on the server.
// Without a key it answers { configured: false } and the sender app hides the GIF option.
export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const key = process.env.GIPHY_API_KEY;
  if (!key) return res.status(200).json({ configured: false, gifs: [] });

  const q = String(req.query.q || '').trim().slice(0, 50);
  try {
    const { data } = await axios.get(`https://api.giphy.com/v1/gifs/${q ? 'search' : 'trending'}`, {
      params: { api_key: key, q: q || undefined, limit: 18, rating: 'g', lang: 'en' },
      timeout: 5000,
    });
    const gifs = (data.data || [])
      .map((g) => ({
        id: g.id,
        title: g.title,
        // A small version for the picker, a medium one to attach
        previewUrl: g.images?.fixed_width_small?.url || g.images?.fixed_width?.url,
        url: g.images?.fixed_width?.url || g.images?.downsized?.url,
        width: Number(g.images?.fixed_width?.width) || 200,
        height: Number(g.images?.fixed_width?.height) || 200,
      }))
      .filter((g) => g.previewUrl && g.url);
    res.setHeader('Cache-Control', 'public, s-maxage=600');
    res.status(200).json({ configured: true, gifs });
  } catch (err) {
    console.error('Giphy search failed:', err.message);
    res.status(502).json({ configured: true, gifs: [], error: 'GIF search is unavailable right now' });
  }
}
