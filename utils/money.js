// Client-safe money helpers for the giftee app

// Intl picks the right decimals per currency (2 for EUR/USD, 0 for JPY)
export const formatMoney = (amount, currency = 'USD', options = {}) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (currency || 'USD').toUpperCase(),
    ...options,
  }).format(amount || 0);

// Whole units for goals and previews ("€120"), but keeps cents when there are any
export const formatGoal = (amount, currency = 'USD') => {
  const n = parseFloat(amount) || 0;
  return formatMoney(n, currency, Number.isInteger(n) ? { maximumFractionDigits: 0, minimumFractionDigits: 0 } : {});
};

// rates are units per 1 USD (from /api/rates). Returns null when a rate is missing
export const convertWithRates = (amount, from, to, rates) => {
  const f = (from || 'USD').toUpperCase();
  const t = (to || 'USD').toUpperCase();
  if (f === t) return amount;
  if (!rates?.[f] || !rates?.[t]) return null;
  return (amount / rates[f]) * rates[t];
};

export const sameCurrency = (a, b) => (a || 'USD').toUpperCase() === (b || 'USD').toUpperCase();
