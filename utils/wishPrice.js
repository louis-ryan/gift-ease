import { convertCurrency } from './exchangeRates';

// Adds the USD `price` for a wish being created or edited, if its amount is being set
export async function withUsdPrice(fields, currency = fields.currency) {
  if (fields.amount === undefined || fields.amount === '') return fields;
  const usd = await convertCurrency(parseFloat(fields.amount), currency || 'USD', 'USD');
  return { ...fields, price: String(usd) };
}
