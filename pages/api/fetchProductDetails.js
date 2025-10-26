import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL
    let parsedUrl;
    try {
      parsedUrl = new URL(url);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Check if URL is from a supported retailer (for optimized scraping)
    const supportedDomains = [
      'amazon.com',
      'amazon.co.uk',
      'amazon.ca',
      'amazon.de',
      'amazon.fr',
      'amazon.it',
      'amazon.es',
      'amazon.co.jp',
      'target.com',
      'walmart.com',
      'bestbuy.com',
      'homedepot.com',
      'lowes.com',
      'etsy.com',
      'wayfair.com',
      'ikea.com',
      'zara.com',
      'h&m.com',
      'uniqlo.com',
      'asos.com',
      'zalando.com',
      'bol.com',
      'fnac.com',
      'mediamarkt.de',
      'saturn.de',
      'elcorteingles.es',
      'carrefour.fr',
      'auchan.fr',
      'leclerc.fr',
      'castorama.fr',
      'leroymerlin.fr',
      'brico-depot.fr',
      'bricorama.fr',
      'manomano.fr',
      'cdiscount.com',
      'rakuten.fr',
      'fnac-darty.com',
      'boulanger.com',
      'darty.com',
      'rue-du-commerce.com',
      'ldlc.com',
      'materiel.net',
      'topachat.com',
      'grosbill.com',
      'materiel.net',
      'ldlc.com',
      'topachat.com',
      'grosbill.com',
      'materiel.net',
      'ldlc.com',
      'topachat.com',
      'grosbill.com',
    ];

    const domain = parsedUrl.hostname.toLowerCase();
    const isSupported = supportedDomains.some((supported) =>
      domain.includes(supported)
    );

    // Fetch the webpage
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    let productData = {
      title: '',
      price: '',
      imageUrl: '',
      description: '',
      currency: 'USD',
    };

    // Domain-specific optimized selectors (for better accuracy)
    if (domain.includes('amazon')) {
      productData.title =
        $('[data-automation-id="product-title"]').text().trim() ||
        $('#productTitle').text().trim() ||
        $('h1.a-size-large').text().trim() ||
        $('h1.a-size-base-plus').text().trim();

      productData.price =
        $('.a-price-whole').first().text().trim() ||
        $('.a-price .a-offscreen').first().text().trim() ||
        $('[data-automation-id="product-price"]').text().trim() ||
        $('.a-price .a-price-symbol + .a-price-whole').text().trim();

      productData.imageUrl =
        $('#landingImage').attr('src') ||
        $('.imgTagWrapper img').first().attr('src') ||
        $('[data-automation-id="product-image"] img').attr('src') ||
        $('.a-dynamic-image').first().attr('src');

      productData.description =
        $('#productDescription').text().trim() ||
        $('#feature-bullets').text().trim() ||
        $('.a-expander-content').text().trim() ||
        $('[data-automation-id="product-description"]').text().trim() ||
        $('.a-section.a-spacing-medium.a-spacing-top-small').text().trim();
    } else if (domain.includes('target')) {
      productData.title =
        $('[data-test="product-title"]').text().trim() ||
        $('h1[data-test="product-title"]').text().trim();

      productData.price =
        $('[data-test="product-price"]').text().trim() ||
        $('.styles__PriceText').text().trim();

      productData.imageUrl =
        $('[data-test="product-image"] img').attr('src') ||
        $('.styles__ProductImage img').first().attr('src');

      productData.description =
        $('[data-test="product-description"]').text().trim() ||
        $('.styles__ProductDescription').text().trim() ||
        $('.product-description').text().trim();
    } else if (domain.includes('walmart')) {
      productData.title =
        $('[data-testid="product-title"]').text().trim() ||
        $('h1').first().text().trim();

      productData.price =
        $('[data-testid="price-wrap"] .price-characteristic').text().trim() ||
        $('.price-characteristic').text().trim();

      productData.imageUrl =
        $('[data-testid="product-image"] img').attr('src') ||
        $('.product-image img').first().attr('src');

      productData.description =
        $('[data-testid="product-description"]').text().trim() ||
        $('.product-description').text().trim() ||
        $('.description').text().trim();
    } else {
      // Universal domain-agnostic scraping strategy
      productData = await extractUniversalProductData($, url, domain);
    }

    // Clean up the data
    productData.title = productData.title.replace(/\s+/g, ' ').trim();
    productData.price = productData.price.replace(/[^\d.,]/g, '').trim();
    productData.description = productData.description
      .replace(/\s+/g, ' ')
      .trim();

    // Convert relative image URLs to absolute
    if (productData.imageUrl && !productData.imageUrl.startsWith('http')) {
      productData.imageUrl = new URL(productData.imageUrl, url).href;
    }

    // Validate that we got some data
    if (!productData.title && !productData.price) {
      return res.status(400).json({
        error:
          'Could not extract product information from this URL. Please try a different product page or enter details manually.',
      });
    }

    res.status(200).json({
      success: true,
      data: productData,
    });
  } catch (error) {
    console.error('Error fetching product details:', error);

    if (error.code === 'ENOTFOUND') {
      return res
        .status(400)
        .json({
          error:
            'Could not reach the website. Please check the URL and try again.',
        });
    }

    if (error.code === 'ECONNABORTED') {
      return res
        .status(400)
        .json({ error: 'Request timed out. Please try again.' });
    }

    res.status(500).json({
      error:
        'Failed to fetch product details. Please try again or enter details manually.',
    });
  }
}

// Universal product data extraction function
async function extractUniversalProductData($, url, domain) {
  let productData = {
    title: '',
    price: '',
    imageUrl: '',
    description: '',
    currency: 'USD',
  };

  // Universal title extraction strategies
  const titleSelectors = [
    // Common e-commerce title selectors
    'h1[class*="title"]',
    'h1[class*="product"]',
    'h1[class*="name"]',
    '[class*="product-title"]',
    '[class*="product-name"]',
    '[class*="item-title"]',
    '[class*="product-heading"]',
    '[data-test*="title"]',
    '[data-testid*="title"]',
    '[data-automation*="title"]',
    // Generic selectors
    'h1',
    '.title',
    '.product-title',
    '.product-name',
    '.item-title',
    // Meta tags as fallback
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
    'title',
  ];

  for (const selector of titleSelectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = element.attr('content') || element.text().trim();
      if (text && text.length > 3 && text.length < 200) {
        productData.title = text;
        break;
      }
    }
  }

  // Universal price extraction strategies
  const priceSelectors = [
    // Common price selectors
    '[class*="price"]',
    '[class*="cost"]',
    '[class*="amount"]',
    '[data-test*="price"]',
    '[data-testid*="price"]',
    '[data-automation*="price"]',
    // Currency-specific selectors
    '[class*="euro"]',
    '[class*="dollar"]',
    '[class*="pound"]',
    '[class*="yen"]',
    // Generic price patterns
    '.price',
    '.cost',
    '.amount',
    '.value',
    // Structured data
    '[itemprop="price"]',
    '[data-price]',
    // Common price containers
    '.product-price',
    '.item-price',
    '.price-container',
    '.price-wrapper',
  ];

  for (const selector of priceSelectors) {
    const elements = $(selector);
    for (let i = 0; i < elements.length; i++) {
      const element = $(elements[i]);
      const text = element.text().trim();

      // Look for price patterns (numbers with currency symbols)
      const priceMatch = text.match(/[\$€£¥₹₽₩₪₦₨₫₴₸₺₼₾₿]?\s*[\d,]+\.?\d*/);
      if (priceMatch && priceMatch[0].length > 0) {
        productData.price = priceMatch[0];
        break;
      }
    }
    if (productData.price) break;
  }

  // Universal description extraction strategies
  const descriptionSelectors = [
    // Common description selectors
    '[class*="description"]',
    '[class*="details"]',
    '[class*="summary"]',
    '[class*="overview"]',
    '[data-test*="description"]',
    '[data-testid*="description"]',
    '[data-automation*="description"]',
    // Generic description selectors
    '.description',
    '.product-description',
    '.item-description',
    '.product-details',
    '.item-details',
    '.product-summary',
    '.item-summary',
    '.product-overview',
    '.item-overview',
    // Structured data
    '[itemprop="description"]',
    '[data-description]',
    // Common description containers
    '.product-info',
    '.item-info',
    '.product-content',
    '.item-content',
    // Specific e-commerce patterns
    '.product-features',
    '.item-features',
    '.product-benefits',
    '.item-benefits',
    '.product-highlights',
    '.item-highlights',
    // Meta tags
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
    // Common text content areas
    '.content',
    '.main-content',
    '.product-content',
    '.item-content',
    // Bullet points and lists
    'ul[class*="features"]',
    'ul[class*="benefits"]',
    'ul[class*="highlights"]',
    'ol[class*="features"]',
    'ol[class*="benefits"]',
    'ol[class*="highlights"]',
  ];

  for (const selector of descriptionSelectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const text = element.text().trim();
      if (text && text.length > 10 && text.length < 1000) {
        // Clean up the description
        let cleanText = text
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/\n+/g, ' ') // Replace newlines with spaces
          .replace(/\t+/g, ' ') // Replace tabs with spaces
          .trim();

        // Limit description length
        if (cleanText.length > 500) {
          cleanText = cleanText.substring(0, 500) + '...';
        }

        productData.description = cleanText;
        break;
      }
    }
  }

  // Universal image extraction strategies
  const imageSelectors = [
    // Common product image selectors
    '[class*="product-image"]',
    '[class*="item-image"]',
    '[class*="product-photo"]',
    '[class*="product-img"]',
    '[data-test*="image"]',
    '[data-testid*="image"]',
    '[data-automation*="image"]',
    // Generic image selectors
    '.product-image img',
    '.item-image img',
    '.product-photo img',
    '.product-img img',
    // Structured data
    '[itemprop="image"]',
    // Meta tags
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    // Common gallery selectors
    '.gallery img',
    '.product-gallery img',
    '.image-gallery img',
    // Generic fallback
    'img[src*="product"]',
    'img[src*="item"]',
    'img[alt*="product"]',
    'img[alt*="item"]',
  ];

  for (const selector of imageSelectors) {
    const element = $(selector).first();
    if (element.length > 0) {
      const src = element.attr('src') || element.attr('data-src');
      if (src && src.length > 10) {
        productData.imageUrl = src;
        break;
      }
    }
  }

  // Currency detection based on domain or content
  const currencyMap = {
    'amazon.co.uk': 'GBP',
    'amazon.de': 'EUR',
    'amazon.fr': 'EUR',
    'amazon.it': 'EUR',
    'amazon.es': 'EUR',
    'amazon.co.jp': 'JPY',
    'fnac.com': 'EUR',
    'carrefour.fr': 'EUR',
    'auchan.fr': 'EUR',
    'leclerc.fr': 'EUR',
    'castorama.fr': 'EUR',
    'leroymerlin.fr': 'EUR',
    'brico-depot.fr': 'EUR',
    'bricorama.fr': 'EUR',
    'manomano.fr': 'EUR',
    'cdiscount.com': 'EUR',
    'rakuten.fr': 'EUR',
    'fnac-darty.com': 'EUR',
    'boulanger.com': 'EUR',
    'darty.com': 'EUR',
    'rue-du-commerce.com': 'EUR',
    'ldlc.com': 'EUR',
    'materiel.net': 'EUR',
    'topachat.com': 'EUR',
    'grosbill.com': 'EUR',
    'mediamarkt.de': 'EUR',
    'saturn.de': 'EUR',
    'elcorteingles.es': 'EUR',
    'zara.com': 'EUR',
    'h&m.com': 'EUR',
    'uniqlo.com': 'JPY',
    'asos.com': 'GBP',
    'zalando.com': 'EUR',
    'bol.com': 'EUR',
    'ikea.com': 'EUR',
  };

  // Detect currency from domain
  for (const [siteDomain, currency] of Object.entries(currencyMap)) {
    if (domain.includes(siteDomain)) {
      productData.currency = currency;
      break;
    }
  }

  // Fallback currency detection from price content
  if (productData.price) {
    if (productData.price.includes('€')) productData.currency = 'EUR';
    else if (productData.price.includes('£')) productData.currency = 'GBP';
    else if (productData.price.includes('¥')) productData.currency = 'JPY';
    else if (productData.price.includes('₹')) productData.currency = 'INR';
    else if (productData.price.includes('₽')) productData.currency = 'RUB';
    else if (productData.price.includes('₩')) productData.currency = 'KRW';
    else if (productData.price.includes('₪')) productData.currency = 'ILS';
    else if (productData.price.includes('₦')) productData.currency = 'NGN';
    else if (productData.price.includes('₨')) productData.currency = 'PKR';
    else if (productData.price.includes('₫')) productData.currency = 'VND';
    else if (productData.price.includes('₴')) productData.currency = 'UAH';
    else if (productData.price.includes('₸')) productData.currency = 'KZT';
    else if (productData.price.includes('₺')) productData.currency = 'TRY';
    else if (productData.price.includes('₼')) productData.currency = 'AZN';
    else if (productData.price.includes('₾')) productData.currency = 'GEL';
    else if (productData.price.includes('₿')) productData.currency = 'BTC';
  }

  return productData;
}
