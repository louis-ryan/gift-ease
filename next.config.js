require('dotenv').config();

module.exports = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
  },
  images: {
    domains: ['your-domain.com'], // Add domains you want to allow for Image Optimization
    formats: ['image/webp'],
  },
  reactStrictMode: true,
};
