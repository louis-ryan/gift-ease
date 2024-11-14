import Stripe from 'stripe';
import cors from 'cors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize CORS middleware
const corsMiddleware = cors({
    origin: ['http://localhost:3001', 'https://gift-easy-sender.vercel.app'], // Add your frontend origin
    methods: ['GET', 'POST', 'OPTIONS'],    // Allow POST and OPTIONS (for preflight)
    allowedHeaders: ['Content-Type'],  // Allow Content-Type header
    credentials: true,                 // Allow credentials
});

// Wrapper to make CORS middleware work with Next.js API routes
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req, res) {
    // Run the CORS middleware first
    await runMiddleware(req, res, corsMiddleware);

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { giftId, eventId } = req.query;

    try {
        const payments = await stripe.paymentIntents.list({
            // Filter by metadata if you stored giftId in metadata
            // expand: ['data.transfer'] // Uncomment to include transfer details
        });

        const successfulPayments = payments.data.filter(payment =>
            payment.status === 'succeeded' &&
            payment.metadata.eventId === eventId // Assuming you stored giftId in metadata
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
}