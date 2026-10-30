// pages/api/convertToUsd.js
import { getExchangeRates } from '../../utils/exchangeRates';

export default async function handler(req, res) {
  // Set CORS headers to allow cross-origin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency } = req.body;

    if (!amount || !currency) {
      return res
        .status(400)
        .json({ error: 'Amount and currency are required' });
    }

    // Validate amount is a number
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ error: 'Amount must be a valid number' });
    }

    // No conversion needed if already USD
    if (currency === 'USD') {
      return res.json({
        originalAmount: numericAmount,
        originalCurrency: currency,
        usdAmount: Math.round(numericAmount), // Round to nearest whole dollar
        exchangeRate: 1,
      });
    }

    // Get current exchange rates
    const rates = await getExchangeRates();

    // Check if we have the rate for the requested currency
    if (!rates[currency]) {
      return res
        .status(400)
        .json({ error: `Exchange rate not available for ${currency}` });
    }

    // Convert to USD
    const exchangeRate = rates[currency];
    const exactUsdAmount = numericAmount / exchangeRate;

    // Round to nearest whole dollar (for your specific requirement)
    const roundedUsdAmount = Math.round(exactUsdAmount);

    res.status(200).json({
      originalAmount: numericAmount,
      originalCurrency: currency,
      usdAmount: roundedUsdAmount, // Rounded to nearest whole dollar
      exactUsdAmount: exactUsdAmount, // Also provide the exact amount for reference
      exchangeRate: exchangeRate,
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({ error: 'Failed to convert currency' });
  }
}
