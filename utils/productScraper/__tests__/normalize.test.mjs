import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parsePrice, detectCurrency, cleanTitle, cleanDescription, cleanImageUrl, canonicalizeUrl, TITLE_MAX,
} from '../normalize.js';

test('parsePrice handles local number formats', () => {
  const cases = [
    ['1.299,00 €', 1299], ['£1,299.00', 1299], ['¥12,800', 12800], ["CHF 1'299.–", 1299],
    ['1 299,00 kr', 1299], ['12,99 €', 12.99], ['$24.99 - $39.99', 24.99], ['89.00', 89],
    ['1299.0', 1299], ['US$ 1,050', 1050], ['1.299', 1299], [65, 65], ['€ 1.050,50', 1050.5],
  ];
  for (const [input, expected] of cases) assert.equal(parsePrice(input), expected, `parsePrice(${JSON.stringify(input)})`);
});

test('parsePrice rejects non-prices', () => {
  for (const input of ['', 'Free', null, undefined, 0, -5, 'Out of stock']) assert.equal(parsePrice(input), null);
});

test('detectCurrency prefers explicit codes, then symbols, then the domain', () => {
  assert.equal(detectCurrency({ explicit: 'eur', priceText: '$5' }), 'EUR');
  assert.equal(detectCurrency({ priceText: '£20' }), 'GBP');
  assert.equal(detectCurrency({ priceText: '20 €' }), 'EUR');
  assert.equal(detectCurrency({ priceText: '$20', hostname: 'www.example.ca' }), 'CAD');
  assert.equal(detectCurrency({ priceText: '$20', hostname: 'shop.com.au' }), 'AUD');
  assert.equal(detectCurrency({ priceText: '$20', hostname: 'shop.com' }), 'USD');
  assert.equal(detectCurrency({ priceText: 'C$20', hostname: 'shop.com' }), 'CAD');
  assert.equal(detectCurrency({ priceText: '¥3000', hostname: 'shop.cn' }), 'CNY');
  assert.equal(detectCurrency({ priceText: '¥3000', hostname: 'shop.co.jp' }), 'JPY');
  assert.equal(detectCurrency({ priceText: '299 kr', hostname: 'shop.se' }), 'SEK');
  assert.equal(detectCurrency({ priceText: '49.99', hostname: 'www.amazon.de' }), 'EUR');
  assert.equal(detectCurrency({ priceText: '49.99', hostname: 'example.com' }), null);
});

test('cleanTitle strips shop names and fits the wish title limit', () => {
  assert.equal(cleanTitle('Ceramic Vase - IKEA', { hostname: 'www.ikea.com' }), 'Ceramic Vase');
  assert.equal(cleanTitle('Linen Throw | Oak &amp; Hearth', { hostname: 'oakandhearth.com', siteName: 'Oak & Hearth' }), 'Linen Throw');
  assert.equal(cleanTitle('Amazon.de: Kindle Paperwhite : Amazon Devices', { hostname: 'www.amazon.de' }), 'Kindle Paperwhite');
  const long = cleanTitle('Extra Large Handwoven Seagrass Storage Basket with Handles', { hostname: 'x.com' });
  assert.ok(long.length <= TITLE_MAX, long);
  assert.ok(long.endsWith('…'));
});

test('cleanDescription strips HTML and entities', () => {
  assert.equal(cleanDescription('<p>Soft &amp; warm.</p>\n<p>Made in Portugal.</p>'), 'Soft & warm. Made in Portugal.');
});

test('cleanImageUrl resolves, upgrades and filters images', () => {
  assert.equal(cleanImageUrl('/img/a.jpg', 'https://shop.example/p/1'), 'https://shop.example/img/a.jpg');
  assert.equal(cleanImageUrl('//cdn.example/a.jpg', 'https://shop.example/'), 'https://cdn.example/a.jpg');
  assert.equal(
    cleanImageUrl('https://m.media-amazon.com/images/I/61abc._AC_SX300_SY300_.jpg', 'https://amazon.de'),
    'https://m.media-amazon.com/images/I/61abc.jpg'
  );
  assert.equal(
    cleanImageUrl('https://cdn.shopify.com/s/files/1/products/throw_400x400.jpg?v=1&width=400', 'https://x'),
    'https://cdn.shopify.com/s/files/1/products/throw.jpg?v=1'
  );
  assert.equal(cleanImageUrl('https://shop.example/logo.png', 'https://shop.example'), '');
  assert.equal(cleanImageUrl('data:image/png;base64,AAA', 'https://shop.example'), '');
  assert.equal(cleanImageUrl('javascript:alert(1)', 'https://shop.example'), '');
});

test('canonicalizeUrl removes tracking and reduces Amazon links to /dp/ASIN', () => {
  assert.equal(
    canonicalizeUrl('https://www.amazon.co.uk/Kindle-Paperwhite/dp/B08KTZ8249/ref=sr_1_1?keywords=kindle&qid=1&tag=aff-21'),
    'https://www.amazon.co.uk/dp/B08KTZ8249'
  );
  assert.equal(canonicalizeUrl('https://www.amazon.com/gp/product/b08ktz8249?psc=1'), 'https://www.amazon.com/dp/B08KTZ8249');
  assert.equal(
    canonicalizeUrl('https://Shop.Example/p/vase?utm_source=ig&color=blue&fbclid=x#reviews'),
    'https://shop.example/p/vase?color=blue'
  );
});
