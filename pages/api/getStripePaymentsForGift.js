import Stripe from 'stripe';
import { corsMiddleware, runMiddleware } from '../../utils/cors';
import dbConnect from '../../utils/dbConnect';
import Card from '../../models/Card';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, corsMiddleware);

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { giftId } = req.query;

    try {
      await dbConnect();

      const payments = await stripe.paymentIntents.list({
        // Filter by metadata if you stored giftId in metadata
        // expand: ['data.transfer'] // Uncomment to include transfer details
      });

      const successfulPayments = payments.data.filter(
        (payment) =>
          payment.status === 'succeeded' && payment.metadata.giftId === giftId // Assuming you stored giftId in metadata
      );

      const totalPaid =
        successfulPayments.reduce((sum, payment) => sum + payment.amount, 0) /
        100; // Convert from cents to dollars

      // Fetch card data for each payment
      const paymentsWithCards = await Promise.all(
        successfulPayments.map(async (payment) => {
          const cardData = await Card.findOne({ paymentIntentId: payment.id });
          return {
            id: payment.id,
            amount: payment.amount / 100,
            date: payment.created,
            giftId: payment.metadata.giftId,
            eventId: payment.metadata.eventId,
            status: payment.status,
            senderName: payment.metadata.senderName,
            description: payment.metadata.description,
            gifUrl: payment.metadata.gifUrl,
            cardHTML: cardData ? cardData.cardHTML : null,
          };
        })
      );

      res.status(200).json({
        payments: paymentsWithCards,
        totalPaid,
      });
    } catch (err) {
      console.error('Error fetching payments:', err);
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
