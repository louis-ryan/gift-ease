import Stripe from 'stripe';
import { corsMiddleware, runMiddleware } from '../../utils/cors';
import dbConnect from '../../utils/dbConnect';
import { recordPayment } from '../../utils/recordPayment';
import { fromMinorUnits } from '../../utils/currency';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Called by the sender's success page. Asks Stripe for the payment's real status and, if it
// succeeded, records it straight away rather than waiting for the webhook, so the sender's
// gift shows in the wish's progress as soon as they go back to the wishlist.
// Returns only what the sender already knows (status, amount, currency).
export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware);
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { paymentIntentId } = req.query;
  if (typeof paymentIntentId !== 'string' || !/^pi_[A-Za-z0-9]+$/.test(paymentIntentId)) {
    return res.status(400).json({ error: 'Invalid payment' });
  }

  try {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.status === 'succeeded') {
      await dbConnect();
      await recordPayment(intent);
    }
    res.status(200).json({
      status: intent.status,
      giftId: intent.metadata?.giftId,
      amount: fromMinorUnits(intent.amount, intent.currency),
      currency: intent.currency,
    });
  } catch (err) {
    if (err.type === 'StripeInvalidRequestError') return res.status(404).json({ error: 'Payment not found' });
    console.error('Error confirming payment:', err);
    res.status(500).json({ error: 'Could not check the payment' });
  }
}
