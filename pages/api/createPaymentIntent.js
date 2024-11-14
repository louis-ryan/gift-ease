import Stripe from 'stripe';
import cors from 'cors';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: ['http://localhost:3001', 'https://gift-easy-sender.vercel.app'], // Add your frontend origin
  methods: ['POST', 'OPTIONS'],      // Allow POST and OPTIONS (for preflight)
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

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, recipientId } = req.body;

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
        recipientId: recipientId
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