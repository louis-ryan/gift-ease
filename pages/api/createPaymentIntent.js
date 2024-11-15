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

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, recipientId, giftId, eventId } = req.body;

  try {
    // Calculate fees
    const platformFeePercent = 0.01; // 1%
    const platformFee = Math.round(amount * platformFeePercent * 100); // Convert to cents
    const amountInCents = Math.round(amount * 100);

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: recipientId, // The connected account ID
      },
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        giftAmount: amount,
        platformFee: platformFee / 100, // Convert back to dollars for readability
        recipientId: recipientId,
        giftId: giftId,
        eventId: eventId
      }
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error('Error creating payment intent:', err);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
}