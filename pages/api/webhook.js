import Stripe from 'stripe';
import { buffer } from 'micro';
import dbConnect from '../../utils/dbConnect';
import User from '../../models/Account';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    let event;
    try {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);


    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).json({ error: err.message });
    }

    try {
        await dbConnect();

        if (event.type === 'account.updated') {
            const account = event.data.object;

            // Find user before update
            const existingUser = await User.findOne({ stripeAccountId: account.id });

            // Update user
            const updatedUser = await User.findOneAndUpdate(
                { stripeAccountId: account.id },
                {
                    'stripeAccountStatus.detailsSubmitted': account.details_submitted,
                    'stripeAccountStatus.chargesEnabled': account.charges_enabled,
                    'stripeAccountStatus.payoutsEnabled': account.payouts_enabled,
                    'stripeAccountStatus.lastUpdated': new Date()
                },
                { new: true }
            );

            console.log('User updated:', {
                userId: updatedUser?._id,
                newStatus: updatedUser?.stripeAccountStatus
            });
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Error processing webhook:', err);
        // Still return 200 to acknowledge receipt
        res.status(200).json({
            received: true,
            error: err.message
        });
    }
}