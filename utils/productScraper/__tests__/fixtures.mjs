// Trimmed-down copies of the structures real shops use, so extraction can be tested offline.
// When a shop's markup breaks the scraper, add a fixture for it here.

// Shopify-style: JSON-LD inside @graph, several offers, size-suffixed CDN image
export const shopifyJsonLd = `<!doctype html><html><head>
<title>Linen Throw – Oak &amp; Hearth</title>
<meta property="og:site_name" content="Oak &amp; Hearth">
<meta property="og:image" content="https://cdn.shopify.com/s/files/1/products/throw_400x400.jpg?v=1">
<script type="application/ld+json">
{"@context":"https://schema.org","@graph":[
  {"@type":"Organization","name":"Oak & Hearth"},
  {"@type":"Product","name":"Linen Throw &amp; Cushion Set","description":"<p>Soft, washed linen.</p>\n<p>Made in Portugal.</p>",
   "image":["https://cdn.shopify.com/s/files/1/products/throw_800x.jpg?v=1"],
   "offers":[{"@type":"Offer","price":"89.00","priceCurrency":"EUR"},{"@type":"Offer","price":"79.00","priceCurrency":"EUR"}]}
]}
</script></head><body><h1>Linen Throw</h1></body></html>`;

// European formatting in microdata only, no JSON-LD
export const microdataEu = `<html><head><title>Kaffeemaschine | Küchenwelt</title></head><body>
<div itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">Siebträger Kaffeemaschine Deluxe</h1>
  <img itemprop="image" src="/img/kaffee-gross.jpg">
  <div itemprop="offers" itemscope itemtype="https://schema.org/Offer">
    <span itemprop="price" content="1299.00">1.299,00 €</span>
    <meta itemprop="priceCurrency" content="EUR">
  </div>
  <p itemprop="description">Für perfekten Espresso.</p>
</div></body></html>`;

// ProductGroup with variants: the price lives on the variants
export const productGroup = `<html><head><script type="application/ld+json">
{"@context":"https://schema.org","@type":"ProductGroup","name":"Merino Jumper","image":{"@type":"ImageObject","url":"https://shop.example/merino.jpg"},
 "hasVariant":[{"@type":"Product","name":"Merino Jumper - M","offers":{"@type":"Offer","price":65,"priceCurrency":"GBP"}}]}
</script></head><body></body></html>`;

// Amazon: no JSON-LD; title, .a-offscreen price and data-a-dynamic-image map
export const amazon = `<html><head><title>Amazon.de: Kindle Paperwhite : Amazon Devices</title></head><body>
<span id="productTitle">   Kindle Paperwhite (16 GB)   </span>
<div id="corePrice_feature_div"><span class="a-price"><span class="a-offscreen">169,99&nbsp;€</span></span></div>
<img id="landingImage" src="https://m.media-amazon.com/images/I/61abc._AC_SX300_.jpg"
  data-a-dynamic-image='{"https://m.media-amazon.com/images/I/61abc._AC_SX300_.jpg":[300,300],"https://m.media-amazon.com/images/I/61abc._AC_SL1500_.jpg":[1500,1500]}'>
<div id="feature-bullets"><ul><li>Glare-free display</li><li>Waterproof</li></ul></div>
</body></html>`;

// Only Open Graph / product meta tags
export const openGraphOnly = `<html><head>
<title>Ceramic Vase - IKEA</title>
<meta property="og:title" content="Ceramic Vase - IKEA">
<meta property="og:image" content="//www.ikea.com/images/vase.jpg">
<meta property="product:price:amount" content="24.99">
<meta property="product:price:currency" content="GBP">
<meta name="description" content="Hand-glazed stoneware vase.">
</head><body></body></html>`;

export const captcha = `<html><head><title>Robot or human?</title></head><body>
<form action="/errors/validateCaptcha"></form></body></html>`;

// Nothing product-like at all
export const notAProduct = `<html><head><title>About us</title></head><body><p>We love gifts.</p></body></html>`;

// A homepage with prices on it: must not be mistaken for a product
export const homepageWithPrices = `<html><head><title>Never Knowingly Undersold | John Lewis</title>
<meta property="og:type" content="website"></head><body>
<h1>Never Knowingly Undersold</h1><div class="product-card"><span class="price">£179.00</span></div></body></html>`;

export const cloudflare = `<html><head><title>Just a moment...</title></head><body><form id="challenge-form"></form></body></html>`;
