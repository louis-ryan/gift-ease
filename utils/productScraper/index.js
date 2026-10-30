// Product lookup for "paste a product link" on the new-wish form.
// Free direct fetch + structured-data extraction first; the paid Zyte fallback only when
// that is blocked, times out, or comes back without a title, price or image.
import { fetchHtml, fetchJson, ScrapeError, assertFetchableUrl } from './safeFetch.js';
import { extractFromHtml } from './extract.js';
import { extractWithZyte, zyteConfigured } from './zyte.js';
import {
  parsePrice, detectCurrency, cleanTitle, cleanDescription, cleanImageUrl, canonicalizeUrl,
} from './normalize.js';

export { ScrapeError, canonicalizeUrl };

const REQUIRED = ['title', 'price', 'imageUrl'];

// Errors that a second attempt through Zyte can't fix
const FINAL_ERRORS = ['invalid_url', 'blocked_address', 'page_not_found', 'not_html', 'not_found'];

function finalize(raw, pageUrl) {
  const { hostname } = new URL(pageUrl);
  const price = parsePrice(raw.priceText);
  const product = {
    title: cleanTitle(raw.title, { hostname, siteName: raw.siteName }),
    price,
    currency: price
      ? detectCurrency({ explicit: raw.currency, priceText: `${raw.priceText} ${raw.currencyRaw || ''}`, hostname })
      : null,
    imageUrl: cleanImageUrl(raw.image, pageUrl),
    description: cleanDescription(raw.description),
  };
  product.missing = REQUIRED.filter((f) => !product[f]);
  return product;
}

// Shopify serves every product as JSON at /products/<handle>.js, with prices in cents.
// Used when a Shopify page renders its price with JavaScript (common for themes and
// out-of-stock items), which saves a paid fallback request.
async function shopifyPrice(pageUrl, { timeoutMs, acceptLanguage }) {
  const url = new URL(pageUrl);
  const handle = url.pathname.match(/\/products\/([^/?#.]+)/);
  if (!handle) return null;
  const prefix = url.pathname.slice(0, url.pathname.indexOf('/products/'));
  try {
    const data = await fetchJson(`${url.origin}${prefix}/products/${handle[1]}.js`, { timeoutMs, acceptLanguage });
    const cents = data?.price_min ?? data?.price;
    return typeof cents === 'number' && cents > 0
      ? { price: cents / 100, image: data.featured_image || '' }
      : null;
  } catch {
    return null;
  }
}

// Fills gaps in the direct result from the fallback. Price and currency move together.
function combine(primary, fallback) {
  if (!primary) return fallback;
  const out = { ...primary };
  for (const field of ['title', 'imageUrl', 'description']) {
    if (!out[field] && fallback[field]) out[field] = fallback[field];
  }
  if (!out.price && fallback.price) {
    out.price = fallback.price;
    out.currency = fallback.currency;
  }
  out.missing = REQUIRED.filter((f) => !out[f]);
  return out;
}

// Returns { product, source }. Throws ScrapeError with a user-facing message when nothing usable is found.
export async function scrapeProduct(rawUrl, { acceptLanguage, budgetMs = 20000 } = {}) {
  let url;
  try {
    url = canonicalizeUrl(rawUrl);
    assertFetchableUrl(new URL(url));
  } catch (err) {
    if (err instanceof ScrapeError) throw err;
    throw new ScrapeError('invalid_url', "That doesn't look like a valid link");
  }

  const started = Date.now();
  let direct = null;
  let blocked = false;
  let notProduct = false;
  let failure = null;
  let finalUrl = url;

  try {
    // Leave time for the fallback when there is one
    const page = await fetchHtml(url, { timeoutMs: zyteConfigured() ? 6000 : 8000, acceptLanguage });
    finalUrl = page.finalUrl;
    if (page.status === 404 || page.status === 410) {
      throw new ScrapeError('page_not_found', 'That product page could not be found. Please check the link.');
    }
    if (page.status >= 400) {
      blocked = true; // 403/429/503 are almost always bot protection
    } else {
      const result = extractFromHtml(page.html, new URL(finalUrl).hostname);
      if (result.blocked) blocked = true;
      else if (!result.isProduct) notProduct = true; // may be a JavaScript-rendered page: Zyte can tell
      else {
        direct = finalize(result.raw, finalUrl);
        if (!direct.price && result.shopify) {
          const fromShopify = await shopifyPrice(finalUrl, { timeoutMs: 3000, acceptLanguage });
          if (fromShopify) {
            const raw = {
              ...result.raw,
              priceText: String(fromShopify.price),
              currency: result.raw.currency || result.shopifyCurrency,
              image: result.raw.image || fromShopify.image,
            };
            direct = finalize(raw, finalUrl);
          }
        }
      }
    }
  } catch (err) {
    if (!(err instanceof ScrapeError) || FINAL_ERRORS.includes(err.code)) throw err;
    failure = err; // timeout or network trouble: worth trying the fallback
  }

  if (direct && direct.missing.length === 0) return { product: direct, source: 'direct' };

  const remaining = budgetMs - (Date.now() - started);
  if (zyteConfigured() && remaining > 3000) {
    try {
      const raw = await extractWithZyte(finalUrl, { timeoutMs: remaining });
      if (raw) {
        const product = combine(direct, finalize(raw, finalUrl));
        if (product.title) return { product, source: direct ? 'direct+zyte' : 'zyte' };
      }
    } catch (err) {
      console.warn('Zyte fallback error', err.message);
    }
  }

  if (direct?.title) return { product: direct, source: 'direct' };
  if (blocked) {
    throw new ScrapeError('blocked', 'This store blocked automatic lookup. Please enter the product details manually.');
  }
  if (failure) throw failure;
  if (notProduct) {
    throw new ScrapeError('no_product', "That link doesn't look like a product page. Please check it, or enter the details manually.");
  }
  throw new ScrapeError('no_product', "We couldn't find product details on that page. Please enter them manually.");
}
