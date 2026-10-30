import { toMinorUnits, fromMinorUnits } from './currency';

// Fees are deducted from what the giftee receives; senders only ever see the amount they chose.
// Everything here is taken as the Stripe Connect application fee, so it must cover both the
// platform's cut and the Stripe processing fee that Stripe charges the platform on destination charges.

export const PLATFORM_FEE_PERCENT = 0.02;

// Estimate of Stripe's processing fee. Stripe's real fee depends on the card (domestic,
// international, Amex) and currency conversion, and isn't known until after the charge, so
// this deliberately sits at or above standard card pricing. Tune it against the fees shown in
// the Stripe dashboard.
const STRIPE_FEE_PERCENT = 0.029;
const STRIPE_FEE_FIXED = {
  usd: 0.3, eur: 0.25, gbp: 0.2, jpy: 40, cad: 0.3, aud: 0.3, chf: 0.3, cny: 2,
};

// Smallest gift accepted, so fees stay a small share of each contribution.
// Mirrored in gift-easy-sender's pages/for/[id]/index.js for the form check.
export const MIN_GIFT = {
  usd: 5, eur: 5, gbp: 5, jpy: 500, cad: 5, aud: 5, chf: 5, cny: 30,
};

// All amounts in major units (euros, not cents), rounded to the currency's smallest unit
export function calculateFees(amount, currency) {
  const cur = currency.toLowerCase();
  const round = (value) => fromMinorUnits(toMinorUnits(value, cur), cur);

  const platformFee = round(amount * PLATFORM_FEE_PERCENT);
  const processingFee = round(amount * STRIPE_FEE_PERCENT + STRIPE_FEE_FIXED[cur]);
  const totalFee = round(platformFee + processingFee);

  return { platformFee, processingFee, totalFee, netAmount: round(amount - totalFee) };
}
