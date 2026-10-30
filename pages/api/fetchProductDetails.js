import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import dbConnect from '../../utils/dbConnect';
import ProductLookup from '../../models/ProductLookup';
import { scrapeProduct, canonicalizeUrl, ScrapeError } from '../../utils/productScraper/index.js';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';
import { convertCurrency } from '../../utils/exchangeRates';

// The direct fetch (up to 8s) plus the optional Zyte fallback can take longer than
// Vercel's default function timeout
export const config = { maxDuration: 30 };

const STATUS_FOR = {
  invalid_url: 400,
  blocked_address: 400,
  not_found: 400,
  not_html: 400,
  page_not_found: 422,
  blocked: 422,
  no_product: 422,
  timeout: 504,
};

// Wishes can only be in SUPPORTED_CURRENCIES. A product priced in anything else (SEK, PLN…)
// is converted into the wish's currency, and the original price is reported so the form can say so.
async function inWishCurrency(product, targetCurrency) {
  const currency = product.currency?.toLowerCase();
  if (!product.price || !currency || SUPPORTED_CURRENCIES.includes(currency)) return product;

  const target = SUPPORTED_CURRENCIES.includes(String(targetCurrency).toLowerCase())
    ? String(targetCurrency).toUpperCase()
    : 'USD';
  try {
    const converted = await convertCurrency(product.price, product.currency, target);
    return { ...product, price: converted, currency: target, originalPrice: product.price, originalCurrency: product.currency };
  } catch {
    return { ...product, price: null, currency: null, originalPrice: product.price, originalCurrency: product.currency,
      missing: [...new Set([...(product.missing || []), 'price'])] };
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, targetCurrency } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Please paste a product link' });
  }

  let cacheKey;
  try {
    cacheKey = canonicalizeUrl(url);
  } catch {
    return res.status(400).json({ error: "That doesn't look like a valid link" });
  }

  const started = Date.now();
  const domain = new URL(cacheKey).hostname;
  try {
    await dbConnect();
    let product;
    let source;

    const cached = await ProductLookup.findOne({ url: cacheKey }).lean();
    if (cached) {
      ({ product } = cached);
      source = 'cache';
    } else {
      ({ product, source } = await scrapeProduct(url, {
        acceptLanguage: req.headers['accept-language'],
        budgetMs: 25000,
      }));
      await ProductLookup.updateOne(
        { url: cacheKey },
        { $set: { product, source, createdAt: new Date() } },
        { upsert: true }
      ).catch((err) => console.warn('Product lookup cache write failed', err.message));
    }

    const data = await inWishCurrency(product, targetCurrency);
    // One line per lookup, so failure rates per shop can be watched in the Vercel logs
    console.info(JSON.stringify({
      event: 'product_lookup', domain, ok: true, source, missing: data.missing, ms: Date.now() - started,
    }));
    return res.status(200).json({ success: true, data: { ...data, source } });
  } catch (err) {
    const code = err instanceof ScrapeError ? err.code : 'error';
    console.info(JSON.stringify({ event: 'product_lookup', domain, ok: false, code, ms: Date.now() - started }));
    if (err instanceof ScrapeError) {
      return res.status(STATUS_FOR[err.code] || 422).json({ error: err.message, code });
    }
    console.error('Error fetching product details:', err);
    return res.status(500).json({ error: 'Failed to fetch product details. Please try again or enter them manually.' });
  }
}

export default withApiAuthRequired(handler);
