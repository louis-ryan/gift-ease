import Stripe from 'stripe';
import { corsMiddleware, runMiddleware } from '../../utils/cors'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    try {
        await runMiddleware(req, res, corsMiddleware);

        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        const { accountId } = req.query;

        try {
            const payments = await stripe.paymentIntents.list({
                // Filter by metadata if you stored giftId in metadata
                // expand: ['data.transfer'] // Uncomment to include transfer details
            });

            const successfulPayments = payments.data.filter(payment =>
                payment.status === 'succeeded' &&
                payment.metadata.recipientId === accountId
            );

            const totalPaid = successfulPayments.reduce((sum, payment) =>
                sum + payment.amount, 0
            ) / 100; // Convert from cents to dollars

            res.status(200).json({
                payments: successfulPayments.map(payment => ({
                    id: payment.id,
                    amount: payment.amount / 100,
                    date: payment.created,
                    giftId: payment.metadata.giftId,
                    eventId: payment.metadata.eventId,
                    status: payment.status,
                    // Add other fields you need
                })),
                totalPaid
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