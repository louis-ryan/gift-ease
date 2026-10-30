import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractFromHtml } from '../extract.js';
import {
  parsePrice, detectCurrency, cleanTitle, cleanImageUrl, cleanDescription,
} from '../normalize.js';
import * as fx from './fixtures.mjs';

// Same steps as finalize() in index.js, without the network
function run(html, pageUrl) {
  const { hostname } = new URL(pageUrl);
  const result = extractFromHtml(html, hostname);
  if (result.blocked) return { blocked: true };
  if (!result.isProduct) return { notProduct: true };
  const { raw } = result;
  return {
    title: cleanTitle(raw.title, { hostname, siteName: raw.siteName }),
    price: parsePrice(raw.priceText),
    currency: detectCurrency({ explicit: raw.currency, priceText: raw.priceText, hostname }),
    imageUrl: cleanImageUrl(raw.image, pageUrl),
    description: cleanDescription(raw.description),
  };
}

test('JSON-LD in @graph with several offers takes the lowest price', () => {
  const p = run(fx.shopifyJsonLd, 'https://oakandhearth.com/products/throw');
  assert.equal(p.title, 'Linen Throw & Cushion Set');
  assert.equal(p.price, 79);
  assert.equal(p.currency, 'EUR');
  assert.equal(p.imageUrl, 'https://cdn.shopify.com/s/files/1/products/throw.jpg?v=1');
  assert.equal(p.description, 'Soft, washed linen. Made in Portugal.');
});

test('microdata with European formatting', () => {
  const p = run(fx.microdataEu, 'https://kuechenwelt.de/kaffee');
  assert.equal(p.title, 'Siebträger Kaffeemaschine Deluxe');
  assert.equal(p.price, 1299);
  assert.equal(p.currency, 'EUR');
  assert.equal(p.imageUrl, 'https://kuechenwelt.de/img/kaffee-gross.jpg');
});

test('ProductGroup takes the price from its variants', () => {
  const p = run(fx.productGroup, 'https://shop.example/merino');
  assert.equal(p.price, 65);
  assert.equal(p.currency, 'GBP');
  assert.equal(p.imageUrl, 'https://shop.example/merino.jpg');
});

test('Amazon rules: title, local price and largest image', () => {
  const p = run(fx.amazon, 'https://www.amazon.de/dp/B08KTZ8249');
  assert.equal(p.title, 'Kindle Paperwhite (16 GB)');
  assert.equal(p.price, 169.99);
  assert.equal(p.currency, 'EUR');
  assert.equal(p.imageUrl, 'https://m.media-amazon.com/images/I/61abc.jpg');
  assert.equal(p.description, 'Glare-free display. Waterproof');
});

test('Open Graph and product meta tags only', () => {
  const p = run(fx.openGraphOnly, 'https://www.ikea.com/gb/en/p/vase');
  assert.equal(p.title, 'Ceramic Vase');
  assert.equal(p.price, 24.99);
  assert.equal(p.currency, 'GBP');
  assert.equal(p.imageUrl, 'https://www.ikea.com/images/vase.jpg');
  assert.equal(p.description, 'Hand-glazed stoneware vase.');
});

test('captcha pages are reported as blocked', () => {
  assert.deepEqual(run(fx.captcha, 'https://www.walmart.com/ip/1'), { blocked: true });
});

test('pages that are not products are recognised, even with prices on them', () => {
  assert.deepEqual(run(fx.notAProduct, 'https://shop.example/about'), { notProduct: true });
  assert.deepEqual(run(fx.homepageWithPrices, 'https://www.johnlewis.com/'), { notProduct: true });
});

test('Cloudflare challenge pages are reported as blocked', () => {
  assert.deepEqual(run(fx.cloudflare, 'https://www.lego.com/en-gb/product/x'), { blocked: true });
});
