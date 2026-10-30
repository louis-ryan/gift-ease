// Pulls product fields out of a page, most reliable source first:
//   1. JSON-LD structured data (schema.org Product/Offer, what shops publish for Google Shopping)
//   2. Microdata (itemprop="price" …)
//   3. Site-specific rules, only for big shops that publish little structured data (Amazon)
//   4. Open Graph / product meta tags
//   5. Heuristics (first <h1>, price-looking elements)
// Each source returns raw candidates; mergeCandidates() picks per field. Covered by extract.test.mjs.
import * as cheerio from 'cheerio';

const typeIncludes = (node, type) => {
  const t = node?.['@type'];
  return Array.isArray(t) ? t.some((x) => String(x).toLowerCase() === type) : String(t || '').toLowerCase() === type;
};

// Flattens arrays, @graph containers and nested mainEntity/hasVariant into a list of nodes
function flattenJsonLd(data, out = []) {
  if (!data || typeof data !== 'object') return out;
  if (Array.isArray(data)) {
    data.forEach((d) => flattenJsonLd(d, out));
    return out;
  }
  out.push(data);
  if (data['@graph']) flattenJsonLd(data['@graph'], out);
  if (data.mainEntity) flattenJsonLd(data.mainEntity, out);
  if (data.hasVariant) flattenJsonLd(data.hasVariant, out);
  return out;
}

function parseJsonLdBlock(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Some shops emit raw newlines/tabs inside strings, which strict JSON rejects
    try {
      return JSON.parse(text.replace(/[\u0000-\u001F]+/g, ' '));
    } catch {
      return null;
    }
  }
}

function firstImage(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (Array.isArray(image)) return firstImage(image[0]);
  return image.url || image.contentUrl || '';
}

// Lowest-priced offer that has a price, from Offer, AggregateOffer or arrays of either
function bestOffer(offers) {
  const list = flattenJsonLd(offers).filter((o) => typeIncludes(o, 'offer') || typeIncludes(o, 'aggregateoffer') || o.price || o.lowPrice);
  const priced = list
    .map((o) => {
      const spec = Array.isArray(o.priceSpecification) ? o.priceSpecification[0] : o.priceSpecification;
      return {
        price: o.price ?? o.lowPrice ?? spec?.price ?? null,
        currency: o.priceCurrency ?? spec?.priceCurrency ?? null,
      };
    })
    .filter((o) => o.price !== null && o.price !== '' && !Number.isNaN(parseFloat(String(o.price).replace(',', '.'))));
  priced.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  return priced[0] || null;
}

export function extractJsonLd($) {
  const nodes = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const parsed = parseJsonLdBlock($(el).contents().text());
    if (parsed) flattenJsonLd(parsed, nodes);
  });

  const products = nodes.filter((n) => typeIncludes(n, 'product') || typeIncludes(n, 'productgroup'));
  if (!products.length) return null;

  // The price may sit on a variant of a ProductGroup, while the name, image and description
  // sit on the group itself, so take the price from whichever has offers and fill the rest
  // from the group (or the first product that has the field)
  const group = products.find((p) => typeIncludes(p, 'productgroup'));
  const withOffer = products.find((p) => bestOffer(p.offers));
  const offer = withOffer ? bestOffer(withOffer.offers) : null;
  const ordered = [group, withOffer, ...products].filter(Boolean);
  const field = (get) => ordered.map(get).find(Boolean) || '';
  return {
    title: field((p) => p.name),
    description: field((p) => p.description),
    image: field((p) => firstImage(p.image)),
    priceText: offer ? String(offer.price) : '',
    currency: offer?.currency || '',
  };
}

export function extractMicrodata($) {
  const scope = $('[itemtype*="schema.org/Product" i]').first();
  if (!scope.length) return null;
  const prop = (name) => {
    const el = scope.find(`[itemprop="${name}"]`).first();
    if (!el.length) return '';
    return el.attr('content') || el.attr('src') || el.attr('href') || el.text();
  };
  return {
    title: prop('name'),
    description: prop('description'),
    image: prop('image'),
    priceText: prop('price') || prop('lowPrice'),
    currency: prop('priceCurrency'),
  };
}

// Amazon publishes almost no structured data, so it keeps a small set of selectors
function extractAmazon($) {
  let image = $('#landingImage').attr('data-old-hires') || '';
  if (!image) {
    // data-a-dynamic-image maps image URL → [width, height]; take the largest
    try {
      const sizes = JSON.parse($('#landingImage, #imgBlkFront').first().attr('data-a-dynamic-image') || '{}');
      image = Object.entries(sizes).sort((a, b) => b[1][0] * b[1][1] - a[1][0] * a[1][1])[0]?.[0] || '';
    } catch {
      image = '';
    }
  }
  const bullets = $('#feature-bullets li').map((_, li) => $(li).text().trim()).get().filter(Boolean);
  return {
    title: $('#productTitle').text(),
    description: $('#productDescription').text().trim() || bullets.join('. '),
    image: image || $('#landingImage').attr('src') || '',
    priceText:
      $('#corePrice_feature_div .a-offscreen').first().text() ||
      $('#corePriceDisplay_desktop_feature_div .a-offscreen').first().text() ||
      $('.a-price .a-offscreen').first().text(),
    currency: '',
  };
}

export function extractSiteSpecific($, hostname) {
  if (/(^|\.)amazon\.[a-z.]+$/.test(hostname)) return extractAmazon($);
  return null;
}

export function extractMeta($) {
  const meta = (...names) => {
    for (const n of names) {
      const v = $(`meta[property="${n}"], meta[name="${n}"], meta[itemprop="${n}"]`).first().attr('content');
      if (v) return v;
    }
    return '';
  };
  return {
    title: meta('og:title', 'twitter:title') || $('title').first().text(),
    description: meta('og:description', 'twitter:description', 'description'),
    image: meta('og:image:secure_url', 'og:image', 'og:image:url', 'twitter:image', 'twitter:image:src') ||
      $('link[rel="image_src"]').attr('href') || '',
    priceText: meta('product:price:amount', 'og:price:amount', 'product:sale_price:amount', 'twitter:data1'),
    currency: meta('product:price:currency', 'og:price:currency', 'product:sale_price:currency'),
    siteName: meta('og:site_name', 'application-name'),
  };
}

export function extractHeuristics($) {
  const priceEl = $('[class*="price" i], [id*="price" i], [data-testid*="price" i]')
    .filter((_, el) => /\d/.test($(el).text()) && $(el).text().trim().length < 40)
    .first();
  const mainImg = $('main img, [class*="product" i] img, [id*="product" i] img').first();
  return {
    title: $('h1').first().text(),
    description: '',
    image: mainImg.attr('data-src') || mainImg.attr('src') || '',
    priceText: priceEl.text(),
    currency: '',
  };
}

const BOT_CHECK = /robot or human|captcha|access denied|are you a robot|verify you are human|unusual traffic|pardon our interruption|request blocked|attention required|just a moment|checking your browser/i;

export function looksBlocked($) {
  return (
    BOT_CHECK.test($('title').first().text()) ||
    $('form[action*="validateCaptcha"], #captcha-form, .g-recaptcha, [data-sitekey], #px-captcha, #challenge-form').length > 0
  );
}

// Picks each field from the first source that has it. Price and currency are taken as a
// pair from the same source, so a price is never matched with another source's currency.
export function mergeCandidates(sources) {
  const present = sources.filter(Boolean);
  const pick = (field) => present.map((s) => s[field]).find((v) => v && String(v).trim()) || '';
  const priced = present.find((s) => s.priceText && /\d/.test(String(s.priceText)));
  return {
    title: pick('title'),
    description: pick('description'),
    image: pick('image'),
    priceText: priced ? String(priced.priceText) : '',
    currency: priced?.currency || pick('currency'),
    siteName: pick('siteName'),
  };
}

// Returns { blocked } for bot-check pages, { isProduct: false } for pages that aren't a
// product (homepage, category page, a JavaScript shell), else { isProduct: true, raw }.
// A page only counts as a product when it says so (structured data, product meta tags, or
// a site rule matched); otherwise any page's <title> and stray prices would be "found".
export function extractFromHtml(html, hostname) {
  const $ = cheerio.load(html);
  if (looksBlocked($)) return { blocked: true };

  const jsonLd = extractJsonLd($);
  const microdata = extractMicrodata($);
  const site = extractSiteSpecific($, hostname);
  const meta = extractMeta($);
  const ogType = $('meta[property="og:type"]').attr('content') || '';
  const isProduct = Boolean(
    jsonLd || microdata || (site && site.title.trim()) || /product/i.test(ogType) || meta.priceText
  );
  if (!isProduct) return { blocked: false, isProduct: false };

  // Heuristics only fill gaps on a page already known to be a product
  const raw = mergeCandidates([jsonLd, microdata, site, meta, extractHeuristics($)]);
  // Shopify shops (a large share of small shops) expose product data as JSON; see index.js
  const shopify = /cdn\.shopify\.com|Shopify\.shop\s*=|\/cdn\/shop\//.test(html);
  const shopifyCurrency = (html.match(/Shopify\.currency\s*=\s*\{[^}]*"active"\s*:\s*"([A-Z]{3})"/) || [])[1] || '';
  return { blocked: false, isProduct: true, raw, shopify, shopifyCurrency };
}
