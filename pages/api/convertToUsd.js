// pages/api/convertToUsd.js
import axios from 'axios';

// Cache exchange rates to avoid excessive API calls
let exchangeRatesCache = {
    rates: {},
    timestamp: 0,
    expiryTime: 3600000 // 1 hour in milliseconds
};

/**
 * Fetches current exchange rates from European Central Bank (free, no API key)
 */
async function getExchangeRates() {
    const currentTime = Date.now();

    // Check if cache is still valid
    if (currentTime - exchangeRatesCache.timestamp < exchangeRatesCache.expiryTime) {
        return exchangeRatesCache.rates;
    }

    try {
        // Using European Central Bank's exchange rate API (free, no API key required)
        const response = await axios.get('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml');

        if (response.data) {
            // Parse the XML response
            const xmlData = response.data;
            const rates = {};

            // Add EUR rate (since ECB rates are all relative to EUR)
            rates['EUR'] = 1;

            // Extract rates from XML using regex
            const currencyRegex = /currency='([A-Z]+)' rate='([0-9.]+)'/g;
            let match;

            while ((match = currencyRegex.exec(xmlData)) !== null) {
                const currency = match[1];
                const rate = parseFloat(match[2]);
                rates[currency] = rate;
            }

            // Convert from EUR base to USD base
            // First, check if USD rate exists
            if (!rates['USD']) {
                throw new Error('USD rate not found in ECB data');
            }

            // Calculate all rates relative to USD
            const usdToEurRate = rates['USD'];
            const ratesRelativeToUSD = {};

            for (const [currency, rateToEur] of Object.entries(rates)) {
                // For each currency, convert its EUR rate to USD rate
                ratesRelativeToUSD[currency] = rateToEur / usdToEurRate;
            }

            // USD to USD is always 1
            ratesRelativeToUSD['USD'] = 1;

            // Update cache
            exchangeRatesCache = {
                rates: ratesRelativeToUSD,
                timestamp: currentTime,
                expiryTime: exchangeRatesCache.expiryTime
            };

            return ratesRelativeToUSD;
        } else {
            throw new Error('Failed to fetch exchange rates');
        }
    } catch (error) {
        console.error('Exchange rate API error:', error);

        // If cache exists but expired, still use it as fallback
        if (Object.keys(exchangeRatesCache.rates).length > 0) {
            console.log('Using expired exchange rate cache as fallback');
            return exchangeRatesCache.rates;
        }

        // If all else fails, provide a minimal fallback with major currencies
        return {
            'USD': 1,
            'EUR': 0.91,
            'GBP': 0.77,
            'JPY': 148.85,
            'CAD': 1.35,
            'AUD': 1.48,
            'CHF': 0.88,
            'CNY': 7.21
        };
    }
}

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
            return res.status(400).json({ error: 'Amount and currency are required' });
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
                exchangeRate: 1
            });
        }

        // Get current exchange rates
        const rates = await getExchangeRates();

        // Check if we have the rate for the requested currency
        if (!rates[currency]) {
            return res.status(400).json({ error: `Exchange rate not available for ${currency}` });
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
            exchangeRate: exchangeRate
        });

    } catch (error) {
        console.error('Conversion error:', error);
        res.status(500).json({ error: 'Failed to convert currency' });
    }
}