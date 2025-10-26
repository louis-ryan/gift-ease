import Stripe from 'stripe';
import { corsMiddleware, runMiddleware } from '../../utils/cors';
import dbConnect from '../../utils/dbConnect';
import Card from '../../models/Card';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    await runMiddleware(req, res, corsMiddleware);

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
      amount,
      recipientId,
      giftId,
      eventId,
      senderName,
      description,
      cardHTML,
      cardText,
      backgroundImage,
      overlayImages,
    } = req.body;

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
          eventId: eventId,
          senderName: senderName,
          description: description,
        },
      });

      // Save card data to database if provided
      if (cardHTML) {
        await dbConnect();
        const cardData = new Card({
          paymentIntentId: paymentIntent.id,
          giftId,
          eventId,
          senderName,
          cardHTML,
          cardText: cardText || '',
          backgroundImage: backgroundImage || '',
          overlayImages: overlayImages || [],
        });
        await cardData.save();
      }

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (err) {
      console.error('Error creating payment intent:', err);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
