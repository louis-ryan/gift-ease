import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import Payment from '../../models/Payment';
import { getGifteeAccount, getOwnEvent } from '../../utils/gifteeAccount';

// The giftee's thank-you tools for one of their events:
//   GET  ?eventId=          → { message }
//   PUT  { eventId, message } → saves the thank-you message
//   POST { eventId, paymentIds, thanked } → marks senders as thanked (or not)
// The thank-yous themselves are sent from the giftee's own WhatsApp or email app.
async function handler(req, res) {
  const eventId = req.method === 'GET' ? req.query.eventId : req.body?.eventId;
  const account = await getGifteeAccount(req, res);
  const event = await getOwnEvent(account, eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  try {
    if (req.method === 'GET') {
      return res.status(200).json({ message: event.thankYouMessage || '' });
    }

    if (req.method === 'PUT') {
      event.thankYouMessage = String(req.body.message || '').slice(0, 1000);
      await event.save();
      return res.status(200).json({ message: event.thankYouMessage });
    }

    if (req.method === 'POST') {
      const ids = Array.isArray(req.body.paymentIds) ? req.body.paymentIds.map(String) : [];
      const thankedAt = req.body.thanked ? new Date() : null;
      // Only this event's payments to this giftee
      await Payment.updateMany(
        { paymentIntentId: { $in: ids }, eventId: String(event._id), recipientId: account.stripeAccountId },
        thankedAt ? { $set: { thankedAt } } : { $unset: { thankedAt: 1 } }
      );
      return res.status(200).json({ thankedAt });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Thank-you route error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}

export default withApiAuthRequired(handler);
