// Turns raw scraped values into clean wish fields. Pure functions, covered by normalize.test.mjs.

export const TITLE_MAX = 40; // Note.title maxlength
export const DESCRIPTION_MAX = 1000; // Note.description maxlength

// ── Price ───────────────────────────────────────────────────────────────────

// Parses the first price in a string, whatever the local format:
// "1.299,00 €", "£1,299.00", "¥12,800", "CHF 1'299.–", "1 299,00 kr", "$24.99 - $39.99", 1299
export function parsePrice(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) && raw > 0 ? raw : null;

  const match = String(raw).match(/\d[\d.,'’\s\u00A0\u202F]*/);
  if (!match) return null;
  let s = match[0].replace(/[\s\u00A0\u202F'’]/g, '').replace(/[.,]+$/, '');

  const lastDot = s.lastIndexOf('.');
  const lastComma = s.lastIndexOf(',');
  let decimalSep = null;

  if (lastDot !== -1 && lastComma !== -1) {
    decimalSep = lastDot > lastComma ? '.' : ',';
  } else {
    const sep = lastDot !== -1 ? '.' : lastComma !== -1 ? ',' : null;
    if (sep) {
      const occurrences = s.split(sep).length - 1;
      const digitsAfter = s.length - s.lastIndexOf(sep) - 1;
      // One separator followed by 1–2 digits is a decimal point; followed by 3 it's thousands
      if (occurrences === 1 && digitsAfter !== 3) decimalSep = sep;
    }
  }

  if (decimalSep) {
    const thousandsSep = decimalSep === '.' ? ',' : '.';
    s = s.split(thousandsSep).join('').replace(decimalSep, '.');
  } else {
    s = s.replace(/[.,]/g, '');
  }

  const value = parseFloat(s);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null;
}

// ── Currency ────────────────────────────────────────────────────────────────

const TLD_CURRENCY = [
  ['.co.uk', 'GBP'], ['.uk', 'GBP'],
  ['.co.jp', 'JPY'], ['.jp', 'JPY'],
  ['.com.au', 'AUD'], ['.au', 'AUD'],
  ['.co.nz', 'NZD'], ['.nz', 'NZD'],
  ['.ca', 'CAD'], ['.ch', 'CHF'], ['.cn', 'CNY'],
  ['.se', 'SEK'], ['.dk', 'DKK'], ['.no', 'NOK'], ['.pl', 'PLN'], ['.cz', 'CZK'], ['.in', 'INR'],
  ...['.de', '.fr', '.it', '.es', '.nl', '.be', '.at', '.ie', '.pt', '.fi', '.gr', '.lu', '.sk', '.si', '.ee', '.lv', '.lt']
    .map((tld) => [tld, 'EUR']),
];

export function currencyForHost(hostname = '') {
  const host = hostname.toLowerCase();
  const hit = TLD_CURRENCY.find(([tld]) => host.endsWith(tld));
  return hit ? hit[1] : null;
}

// Symbol checks run longest-first so "US$" / "C$" win over "$"
const SYMBOLS = [
  [/US\$|USD/i, 'USD'], [/C\$|CA\$|CAD/i, 'CAD'], [/A\$|AU\$|AUD/i, 'AUD'], [/NZ\$|NZD/i, 'NZD'],
  [/€|EUR/i, 'EUR'], [/£|GBP/i, 'GBP'], [/CHF|Fr\./, 'CHF'], [/円|JPY/, 'JPY'], [/CNY|RMB|元/, 'CNY'],
  [/zł|PLN/i, 'PLN'], [/₹|INR/, 'INR'], [/Kč|CZK/, 'CZK'], [/SEK/, 'SEK'], [/DKK/, 'DKK'], [/NOK/, 'NOK'],
];

// Best guess at an ISO currency code: an explicit code from structured data wins, then
// symbols in the price text, then the shop's country domain. "$" and "¥" alone are
// ambiguous, so they lean on the domain (".ca" → CAD, ".cn" → CNY).
export function detectCurrency({ explicit, priceText, hostname } = {}) {
  if (explicit && /^[A-Za-z]{3}$/.test(String(explicit).trim())) return String(explicit).trim().toUpperCase();

  const text = priceText ? String(priceText) : '';
  const fromHost = currencyForHost(hostname);
  for (const [pattern, code] of SYMBOLS) {
    if (pattern.test(text)) return code;
  }
  if (/kr/i.test(text) && ['SEK', 'DKK', 'NOK'].includes(fromHost)) return fromHost;
  if (text.includes('¥')) return fromHost === 'CNY' ? 'CNY' : 'JPY';
  if (text.includes('$')) return ['CAD', 'AUD', 'NZD'].includes(fromHost) ? fromHost : 'USD';
  return fromHost;
}

// ── Text ────────────────────────────────────────────────────────────────────

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

export function decodeEntities(text = '') {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z#0-9]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? m);
}

export function cleanText(text = '') {
  return decodeEntities(String(text).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function truncate(text, max) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

// Strips shop names and SEO tails: "Amazon.co.uk: Kindle Paperwhite : Amazon Devices",
// "Poäng Armchair - IKEA", "Linen Throw | John Lewis & Partners"
export function cleanTitle(title, { hostname = '', siteName = '' } = {}) {
  let t = cleanText(title);
  if (!t) return '';
  const brandWord = hostname.replace(/^www\./, '').split('.')[0].toLowerCase();
  const isShopName = (part) => {
    const p = part.toLowerCase();
    return (brandWord && p.includes(brandWord)) || (siteName && p.includes(siteName.toLowerCase()));
  };

  if (/amazon/i.test(hostname)) {
    t = t.replace(/^Amazon(\.[a-z.]+)?\s*:\s*/i, '').replace(/\s:\s[^:]*$/, '');
  }
  // Drop a leading or trailing segment that is just the shop's name
  const parts = t.split(/\s+[|–—-]\s+/);
  if (parts.length > 1 && isShopName(parts[parts.length - 1])) parts.pop();
  if (parts.length > 1 && isShopName(parts[0])) parts.shift();
  t = parts.join(' - ');

  return truncate(t, TITLE_MAX);
}

export function cleanDescription(text) {
  return truncate(cleanText(text), DESCRIPTION_MAX);
}

// ── Images ──────────────────────────────────────────────────────────────────

const JUNK_IMAGE = /sprite|logo|placeholder|pixel|spacer|blank\.|transparent|1x1|favicon/i;

// Absolute URL for the largest version of the image, or '' if it looks like junk
export function cleanImageUrl(raw, baseUrl) {
  if (!raw || typeof raw !== 'string') return '';
  const trimmed = raw.trim();
  if (trimmed.startsWith('data:')) return '';
  let url;
  try {
    url = new URL(trimmed, baseUrl);
  } catch {
    return '';
  }
  if (!['http:', 'https:'].includes(url.protocol)) return '';
  if (JUNK_IMAGE.test(url.pathname) || /\.svg$/i.test(url.pathname)) return '';
  url.protocol = 'https:';

  // Amazon: "…/I/71abc._AC_SX300_SY300_.jpg" → original size "…/I/71abc.jpg"
  if (/media-amazon\.com|images-amazon\.com|ssl-images-amazon\.com/.test(url.hostname)) {
    url.pathname = url.pathname.replace(/\._[^/]*_\.(jpe?g|png|webp)$/i, '.$1');
  }
  // Shopify: "…/products/kayak_400x400.jpg?v=1" → "…/products/kayak.jpg?v=1"
  if (/cdn\.shopify\.com|\/cdn\/shop\//.test(url.href)) {
    url.pathname = url.pathname.replace(/_(\d+x\d*|\d*x\d+|small|medium|large|grande|compact)(?=\.[a-z]+$)/i, '');
    url.searchParams.delete('width');
    url.searchParams.delete('height');
  }
  return url.href;
}

// ── URLs ────────────────────────────────────────────────────────────────────

const TRACKING_PARAMS = /^(utm_|gclid|gbraid|wbraid|fbclid|msclkid|mc_[ce]id|_ga|igshid|ref$|ref_|tag$|linkCode|linkId|camp$|creative|psc$|th$|smid$|spm$|srsltid|pd_rd_|pf_rd_|content-id|crid$|sprefix$|dib|qid$|sr$|keywords$)/i;

// Canonical URL used both for fetching and as the cache key: no tracking parameters or
// fragment, and Amazon links reduced to their product ID (/dp/<ASIN>)
export function canonicalizeUrl(raw) {
  const url = new URL(String(raw).trim());
  url.hash = '';
  url.hostname = url.hostname.toLowerCase();

  if (/(^|\.)amazon\.[a-z.]+$/.test(url.hostname)) {
    const asin = url.pathname.match(/\/(?:dp|gp\/product|gp\/aw\/d|exec\/obidos\/asin)\/([A-Z0-9]{10})/i);
    if (asin) return `https://${url.hostname}/dp/${asin[1].toUpperCase()}`;
  }
  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMS.test(key)) url.searchParams.delete(key);
  }
  return url.href;
}
