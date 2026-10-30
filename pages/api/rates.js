import { corsMiddleware, runMiddleware } from '../../utils/cors';
import { getExchangeRates } from '../../utils/exchangeRates';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';

// Public exchange rates (ECB, units per 1 USD) for the supported currencies. Used to show
// approximate equivalents ("≈ $54"); payments themselves are always converted server-side.
export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const all = await getExchangeRates();
  const rates = Object.fromEntries(
    SUPPORTED_CURRENCIES.map((c) => c.toUpperCase()).filter((c) => all[c]).map((c) => [c, all[c]])
  );
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).json({ base: 'USD', rates });
}
