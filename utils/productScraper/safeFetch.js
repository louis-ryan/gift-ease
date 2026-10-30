// Fetches a user-supplied URL without letting it reach our own infrastructure (SSRF):
// only http(s), only public IP addresses (checked on the address actually connected to,
// so DNS tricks don't get around it), every redirect re-checked, and the response capped.
import dns from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import net from 'node:net';
import axios from 'axios';

const MAX_REDIRECTS = 5;
const MAX_BYTES = 3 * 1024 * 1024;

export class ScrapeError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

// Private, loopback, link-local (incl. cloud metadata 169.254.169.254), CGNAT and reserved ranges
export function isPrivateAddress(ip) {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return (
      lower === '::' || lower === '::1' ||
      lower.startsWith('fc') || lower.startsWith('fd') || // unique local
      lower.startsWith('fe8') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb') || // link-local
      lower.startsWith('ff') // multicast
    );
  }
  return true;
}

// Used by the HTTP agents, so the check applies to the address the socket really connects to
function safeLookup(hostname, options, callback) {
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    const blocked = addresses.find((a) => isPrivateAddress(a.address));
    if (blocked) {
      return callback(new ScrapeError('blocked_address', `Refusing to fetch private address for ${hostname}`));
    }
    if (options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
}

const httpAgent = new http.Agent({ lookup: safeLookup });
const httpsAgent = new https.Agent({ lookup: safeLookup });

export function assertFetchableUrl(url) {
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new ScrapeError('invalid_url', 'Only http and https links are supported');
  }
  if (url.username || url.password) {
    throw new ScrapeError('invalid_url', 'Links with credentials are not supported');
  }
  // IP literals skip DNS lookup, so check them here
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && isPrivateAddress(host)) {
    throw new ScrapeError('blocked_address', 'Refusing to fetch a private address');
  }
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) {
    throw new ScrapeError('blocked_address', 'Refusing to fetch a private address');
  }
}

function detectCharset(contentType, bytes) {
  const fromHeader = /charset=["']?([\w-]+)/i.exec(contentType || '');
  if (fromHeader) return fromHeader[1];
  const head = Buffer.from(bytes.slice(0, 4096)).toString('latin1');
  const fromMeta = /<meta[^>]+charset=["']?([\w-]+)/i.exec(head);
  return fromMeta ? fromMeta[1] : 'utf-8';
}

function decode(bytes, charset) {
  try {
    return new TextDecoder(charset).decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Upgrade-Insecure-Requests': '1',
};

// Returns { status, html, finalUrl }. Non-2xx statuses are returned, not thrown, so the
// caller can tell bot-blocking (403/429/503) apart from a missing page (404).
export async function fetchHtml(rawUrl, { timeoutMs = 6000, acceptLanguage = 'en-US,en;q=0.9', json = false } = {}) {
  let url = new URL(rawUrl);
  const deadline = Date.now() + timeoutMs;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    assertFetchableUrl(url);
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new ScrapeError('timeout', 'The store took too long to respond');

    let res;
    try {
      res = await axios.get(url.href, {
        headers: { ...BROWSER_HEADERS, 'Accept-Language': acceptLanguage, ...(json ? { Accept: 'application/json' } : {}) },
        httpAgent,
        httpsAgent,
        maxRedirects: 0,
        timeout: remaining,
        responseType: 'arraybuffer',
        maxContentLength: MAX_BYTES,
        validateStatus: () => true,
      });
    } catch (err) {
      // safeLookup's refusal arrives wrapped in an AxiosError
      if (err instanceof ScrapeError) throw err;
      if (err.cause instanceof ScrapeError) throw err.cause;
      if (err.code === 'blocked_address') throw new ScrapeError('blocked_address', 'Refusing to fetch a private address');
      if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
        throw new ScrapeError('timeout', 'The store took too long to respond');
      }
      if (err.code === 'ENOTFOUND' || err.code === 'EAI_AGAIN') {
        throw new ScrapeError('not_found', 'Could not reach that website. Please check the link.');
      }
      if (/maxContentLength/i.test(err.message)) {
        throw new ScrapeError('too_large', 'That page is too large to read');
      }
      console.warn('Product page fetch failed', url.hostname, err.code, err.message);
      throw new ScrapeError('network', 'Could not load that page. Please try again or enter the details manually.');
    }

    if (res.status >= 300 && res.status < 400 && res.headers.location) {
      url = new URL(res.headers.location, url);
      continue;
    }

    const contentType = res.headers['content-type'] || '';
    if (res.status < 300 && contentType && !(json ? /json|javascript/i : /html|xml/i).test(contentType)) {
      throw new ScrapeError('not_html', "That link doesn't point to a web page");
    }

    const bytes = new Uint8Array(res.data);
    return { status: res.status, html: decode(bytes, detectCharset(contentType, bytes)), finalUrl: url.href };
  }
  throw new ScrapeError('too_many_redirects', 'That link redirects too many times');
}

// Same safety rules, for small JSON endpoints (e.g. Shopify's /products/<handle>.js)
export async function fetchJson(rawUrl, options = {}) {
  const { status, html } = await fetchHtml(rawUrl, { ...options, json: true });
  if (status >= 300) return null;
  try {
    return JSON.parse(html);
  } catch {
    return null;
  }
}
