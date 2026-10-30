// Fallback for pages we can't read directly (bot-blocked, or the price only appears after
// JavaScript runs). Zyte API fetches the page through its own browsers/proxies and returns
// structured product fields, so it doesn't depend on each shop's markup.
// Docs: https://docs.zyte.com/zyte-api/usage/reference.html
// Only used when ZYTE_API_KEY is set; billed per request, so it runs only after the free
// direct fetch fails (see index.js) and results are cached.
import axios from 'axios';

export const zyteConfigured = () => Boolean(process.env.ZYTE_API_KEY);

async function requestZyte(url, extractFrom, timeoutMs) {
  const res = await axios.post(
    'https://api.zyte.com/v1/extract',
    { url, product: true, productOptions: { extractFrom } },
    {
      auth: { username: process.env.ZYTE_API_KEY, password: '' },
      timeout: timeoutMs,
      validateStatus: () => true,
    }
  );
  if (res.status !== 200 || !res.data?.product) {
    console.warn('Zyte extraction failed', { extractFrom, status: res.status, detail: res.data?.detail || res.data?.title });
    return null;
  }
  const p = res.data.product;
  return {
    title: p.name || '',
    description: p.description || '',
    image: p.mainImage?.url || p.images?.[0]?.url || '',
    priceText: p.price ? String(p.price) : '',
    // `currency` is an ISO code when Zyte can tell; `currencyRaw` is the symbol as shown
    currency: p.currency || '',
    currencyRaw: p.currencyRaw || '',
  };
}

// Tries the raw page first (in testing: Amazon ~4s, Lego ~8s, and cheaper), then a real
// browser (Amazon ~14s, more expensive) only if that found no price and there's time left.
export async function extractWithZyte(url, { timeoutMs }) {
  if (!zyteConfigured()) return null;
  const started = Date.now();

  const fromBody = await requestZyte(url, 'httpResponseBody', Math.min(timeoutMs, 12000)).catch((err) => {
    console.warn('Zyte request error', err.message);
    return null;
  });
  if (fromBody?.priceText) return fromBody;

  const remaining = timeoutMs - (Date.now() - started);
  if (remaining < 10000) return fromBody;
  const fromBrowser = await requestZyte(url, 'browserHtml', remaining).catch((err) => {
    console.warn('Zyte request error', err.message);
    return null;
  });
  return fromBrowser?.priceText ? fromBrowser : fromBody || fromBrowser;
}
