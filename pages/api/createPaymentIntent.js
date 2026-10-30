import Stripe from 'stripe';
import { corsMiddleware, runMiddleware } from '../../utils/cors';
import dbConnect from '../../utils/dbConnect';
import Card from '../../models/Card';
import Note from '../../models/Note';
import Event from '../../models/Event';
import Account from '../../models/Account';
import { convertCurrency } from '../../utils/exchangeRates';
import { wishCurrency } from '../../utils/wishGoal';
import { SUPPORTED_CURRENCIES, toMinorUnits } from '../../utils/currency';
import { calculateFees, MIN_GIFT } from '../../utils/fees';

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
      amount: rawAmount,
      giftId,
      senderName,
      description,
      cardHTML,
      cardText,
      backgroundImage,
      overlayImages,
      currency = 'usd',
    } = req.body;

    const chargeCurrency = currency.toLowerCase();
    if (!SUPPORTED_CURRENCIES.includes(chargeCurrency)) {
      return res.status(400).json({ error: `Unsupported currency: ${currency}` });
    }

    const amount = parseFloat(rawAmount);
    if (!(amount >= MIN_GIFT[chargeCurrency])) {
      return res.status(400).json({
        error: `The minimum gift is ${MIN_GIFT[chargeCurrency]} ${chargeCurrency.toUpperCase()}`,
      });
    }

    try {
      await dbConnect();

      // Work out who gets paid from the wish itself, never from the client:
      // wish -> event -> giftee's account -> their Stripe connected account
      const note = await Note.findById(giftId).lean();
      if (!note) return res.status(404).json({ error: 'This wish no longer exists' });
      const event = await Event.findById(note.event).lean();
      if (!event) return res.status(404).json({ error: 'This wishlist no longer exists' });
      const account = await Account.findOne({ user: event.user }).lean();
      if (!account?.stripeAccountId) {
        return res.status(400).json({ error: "This wishlist can't receive payments yet" });
      }
      const recipientId = account.stripeAccountId;
      const eventId = String(event._id);

      // Record what this contribution is worth in the wish's own currency, at today's
      // rate, so progress towards the goal adds up whatever currency senders pay in
      const goalCurrency = wishCurrency(note);
      const wishAmount = await convertCurrency(amount, chargeCurrency, goalCurrency);

      // The sender pays exactly `amount`. Our 2% and the estimated Stripe fee come out of
      // the giftee's share as the application fee (see utils/fees.js)
      const { platformFee, processingFee, totalFee } = calculateFees(amount, chargeCurrency);

      const idempotencyKey = req.headers['idempotency-key'];

      // Create a PaymentIntent, charged in the currency the sender chose
      const paymentIntent = await stripe.paymentIntents.create(
        {
          amount: toMinorUnits(amount, chargeCurrency),
          currency: chargeCurrency,
          application_fee_amount: toMinorUnits(totalFee, chargeCurrency),
          transfer_data: {
            destination: recipientId,
          },
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            giftAmount: amount,
            platformFee: platformFee,
            processingFee: processingFee,
            recipientId: recipientId,
            giftId: giftId,
            eventId: eventId,
            senderName: senderName,
            // Stripe caps metadata values at 500 characters
            description: (description || '').slice(0, 500),
            wishAmount: wishAmount,
            wishCurrency: goalCurrency.toLowerCase(),
          },
        },
        idempotencyKey ? { idempotencyKey } : undefined
      );

      // Save card data to database if provided
      if (cardHTML) {
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
      if (err.name === 'CastError') {
        return res.status(404).json({ error: 'This wish no longer exists' });
      }
      // Stripe's validation messages are safe and useful to show (e.g. amount below the minimum)
      if (err.type === 'StripeInvalidRequestError') {
        return res.status(400).json({ error: err.message });
      }
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
