import Stripe from 'stripe';
import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getGifteeAccount } from '../../utils/gifteeAccount';
import { fromMinorUnits } from '../../utils/currency';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// The logged-in giftee's payout picture from Stripe. Connected accounts are paid out
// automatically on Stripe's schedule, so there's nothing to "request": this just shows
// what's on its way (pending), what's about to go out (available) and the next payout.
async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const account = await getGifteeAccount(req, res);
    if (!account?.stripeAccountId) return res.status(200).json({ connected: false });
    const opts = { stripeAccount: account.stripeAccountId };

    const [balance, payouts, stripeAccount] = await Promise.all([
      stripe.balance.retrieve(opts),
      stripe.payouts.list({ limit: 5 }, opts),
      stripe.accounts.retrieve(account.stripeAccountId),
    ]);

    const toMajor = (list) =>
      list.filter((b) => b.amount !== 0).map((b) => ({ amount: fromMinorUnits(b.amount, b.currency), currency: b.currency }));
    const upcoming = payouts.data.find((p) => ['pending', 'in_transit'].includes(p.status));
    const last = payouts.data.find((p) => p.status === 'paid');
    const describe = (p) =>
      p && { amount: fromMinorUnits(p.amount, p.currency), currency: p.currency, arrivalDate: p.arrival_date * 1000, status: p.status };
    const bank = stripeAccount.external_accounts?.data?.[0];

    res.status(200).json({
      connected: true,
      payoutsEnabled: stripeAccount.payouts_enabled,
      schedule: stripeAccount.settings?.payouts?.schedule || null,
      available: toMajor(balance.available),
      pending: toMajor(balance.pending),
      upcomingPayout: describe(upcoming) || null,
      lastPayout: describe(last) || null,
      bankLast4: bank?.last4 || null,
      bankName: bank?.bank_name || null,
    });
  } catch (err) {
    console.error('Error fetching payout status:', err);
    res.status(500).json({ error: 'Could not load payout details' });
  }
}

export default withApiAuthRequired(handler);
