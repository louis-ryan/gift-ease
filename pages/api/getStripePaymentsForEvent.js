import { corsMiddleware, runMiddleware } from '../../utils/cors';
import dbConnect from '../../utils/dbConnect';
import Payment from '../../models/Payment';
import Card from '../../models/Card';

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, corsMiddleware);

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { eventId } = req.query;

    try {
      await dbConnect();

      const payments = await Payment.find({ eventId }).lean();

      const paymentsWithCards = await Promise.all(
        payments.map(async (p) => {
          const cardData = await Card.findOne({ paymentIntentId: p.paymentIntentId });
          return {
            id: p.paymentIntentId,
            amount: p.amount,
            currency: p.currency || 'usd',
            // Older payments have no wishAmount; they were charged in the wish's currency
            wishAmount: p.wishAmount ?? p.amount,
            date: p.createdAt,
            giftId: p.giftId,
            eventId: p.eventId,
            status: 'succeeded',
            senderName: p.senderName,
            description: p.description,
            cardHTML: cardData ? cardData.cardHTML : null,
          };
        })
      );

      res.status(200).json({ payments: paymentsWithCards });
    } catch (err) {
      console.error('Error fetching payments:', err);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
