import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import Payment from '../../models/Payment';
import { getGifteeAccount } from '../../utils/gifteeAccount';

// The logged-in giftee's payments, with fees, messages and senders' contact details.
// This is the only route that returns those; the event and gift routes are public.
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const account = await getGifteeAccount(req, res);
    if (!account?.stripeAccountId) return res.status(200).json({ payments: [] });

    const filter = { recipientId: account.stripeAccountId };
    if (req.query.eventId) filter.eventId = String(req.query.eventId);
    if (req.query.giftId) filter.giftId = String(req.query.giftId);
    const payments = await Payment.find(filter).sort({ createdAt: -1 }).lean();

    res.status(200).json({
      payments: payments.map((p) => ({
        id: p.paymentIntentId,
        amount: p.amount,
        currency: p.currency || 'usd',
        // Older payments have no wishAmount; they were charged in the wish's currency
        wishAmount: p.wishAmount ?? p.amount,
        platformFee: p.platformFee || 0,
        processingFee: p.processingFee || 0,
        totalFee: p.totalFee || 0,
        netAmount: Math.round((p.amount - (p.totalFee || 0)) * 100) / 100,
        date: p.createdAt,
        giftId: p.giftId,
        eventId: p.eventId,
        status: 'succeeded',
        senderName: p.senderName,
        // Older payments stored the message as `description`
        message: p.message || p.description || '',
        photoUrls: p.photoUrls || [],
        gifUrl: p.gifUrl || '',
        contactMethod: p.contactMethod || null,
        contactValue: p.contactValue || null,
        thankedAt: p.thankedAt || null,
      })),
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
}

export default withApiAuthRequired(handler);
