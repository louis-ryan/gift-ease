import Stripe from 'stripe';
import cors from 'cors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const allowedOrigins = [
    'http://localhost:3001',
    'https://gift-easy-sender.vercel.app',
    'https://the-registry-web.site'
];

// Initialize CORS middleware
const corsMiddleware = cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, origin);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Origin',
        'Accept',
        'Authorization'
    ],
    exposedHeaders: ['Content-Type'],
    credentials: true,
});

// Modified middleware wrapper
function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        // Explicitly set CORS headers for preflight
        if (req.method === 'OPTIONS') {
            const origin = req.headers.origin;
            if (allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin);
                res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin');
                res.setHeader('Access-Control-Allow-Credentials', 'true');
                res.status(200).end();
                return resolve();
            }
        }

        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

export default async function handler(req, res) {

    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

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