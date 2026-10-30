// Currencies senders can pay in (must match the picker in gift-easy-sender's pages/for/[id]/index.js)
export const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp', 'jpy', 'cad', 'aud', 'chf', 'cny'];

// Stripe amounts are in the currency's smallest unit; these currencies have no minor unit
// https://docs.stripe.com/currencies#zero-decimal
const ZERO_DECIMAL_CURRENCIES = ['jpy'];

const minorUnitFactor = (currency) =>
  ZERO_DECIMAL_CURRENCIES.includes(currency.toLowerCase()) ? 1 : 100;

export const toMinorUnits = (amount, currency) => Math.round(amount * minorUnitFactor(currency));

export const fromMinorUnits = (amount, currency) => amount / minorUnitFactor(currency);
