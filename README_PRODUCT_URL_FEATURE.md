# Product URL Auto-Population Feature

## 🎯 Overview

This feature allows users to automatically populate their wish form by simply pasting a product URL from supported retailers. The system will extract the product title, price, and image, then auto-fill the form fields.

## ✨ Features

- **Supported Retailers**: Amazon, Target, Walmart, Best Buy, Home Depot, Lowe's
- **Auto-Population**: Title, price, and product image
- **Fallback Support**: Manual entry still available if URL fetching fails
- **Error Handling**: Clear error messages for unsupported sites or network issues
- **Responsive Design**: Works on mobile and desktop

## 🔧 Technical Implementation

### Backend API: `/api/fetchProductDetails`

- **Method**: POST
- **Input**: `{ url: "product_url" }`
- **Output**: `{ success: true, data: { title, price, imageUrl, currency } }`

### Web Scraping Strategy

1. **URL Validation**: Checks if the URL is from a supported retailer
2. **HTML Fetching**: Uses axios with proper User-Agent headers
3. **Data Extraction**: Uses cheerio to parse HTML and extract product data
4. **Data Cleaning**: Removes extra whitespace and formats prices
5. **Error Handling**: Graceful fallbacks for network issues or parsing failures

### Supported Selectors

#### Amazon

- Title: `#productTitle`, `h1.a-size-large`
- Price: `.a-price-whole`, `.a-price .a-offscreen`
- Image: `#landingImage`, `.imgTagWrapper img`

#### Target

- Title: `[data-test="product-title"]`
- Price: `[data-test="product-price"]`, `.styles__PriceText`
- Image: `[data-test="product-image"] img`

#### Walmart

- Title: `[data-testid="product-title"]`
- Price: `[data-testid="price-wrap"] .price-characteristic`
- Image: `[data-testid="product-image"] img`

## 🚀 Usage

1. **Enter Product URL**: Paste a product URL from a supported retailer
2. **Click "Fetch Details"**: The system will attempt to extract product information
3. **Review & Edit**: Auto-populated fields can be manually edited if needed
4. **Complete Form**: Fill in description and submit

## ⚠️ Limitations & Considerations

### Technical Limitations

- **Site Structure Changes**: Retailers may change their HTML structure
- **Rate Limiting**: Some sites may block frequent requests
- **JavaScript Content**: Dynamic content may not be captured
- **Robots.txt**: Respects website crawling policies

### Legal Considerations

- **Terms of Service**: Some sites prohibit scraping
- **Rate Limiting**: Implemented to avoid overwhelming servers
- **User Agent**: Proper identification in requests

### Reliability Factors

- **Network Issues**: Timeout handling for slow responses
- **Data Quality**: Price formatting varies between retailers
- **Image URLs**: Relative vs absolute URL handling

## 🔄 Future Enhancements

### Phase 2 Improvements

- **More Retailers**: Add support for additional stores
- **Better Price Parsing**: Handle currency symbols and formatting
- **Image Optimization**: Resize and compress product images
- **Caching**: Cache successful requests to improve performance
- **Fallback Strategies**: Multiple selector attempts for better reliability

### Advanced Features

- **Product Reviews**: Extract and display product ratings
- **Availability Check**: Verify if product is in stock
- **Price History**: Track price changes over time
- **Alternative Products**: Suggest similar items

## 🛠️ Installation

The feature requires the `cheerio` dependency:

```bash
npm install cheerio
```

## 📝 Error Messages

- **"URL not from a supported retailer"**: Site not in supported list
- **"Could not extract product information"**: Parsing failed
- **"Could not reach the website"**: Network connectivity issue
- **"Request timed out"**: Server response too slow

## 🎨 UI/UX Design

- **Green "Fetch Details" button**: Indicates success/action
- **Loading states**: Clear feedback during processing
- **Success/Error messages**: Color-coded feedback
- **Responsive layout**: Works on all screen sizes
- **Accessibility**: Proper labels and keyboard navigation

## 🔒 Security Considerations

- **Input Validation**: URL format and domain checking
- **Request Headers**: Proper User-Agent to avoid blocking
- **Error Handling**: No sensitive data exposure in error messages
- **Rate Limiting**: Prevents abuse of the scraping service

This feature significantly improves the user experience by reducing manual data entry while maintaining the flexibility of manual form completion when needed.
