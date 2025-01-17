import Stripe from 'stripe';
import dbConnect from '../../utils/dbConnect';
import User from '../../models/Account';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();
        
        const { stripeAccountId, user } = req.body;
        
        // Debug logs
        console.log('Looking for user:', user);
        
        // First find the user to verify the data
        const userDoc = await User.findOne({ user: user });
        console.log('Found user document:', userDoc);
        
        if (!userDoc || !userDoc.stripeAccountId) {
            return res.status(404).json({ 
                message: 'No Stripe account found for this user',
                debug: { 
                    userFound: !!userDoc,
                    stripeAccountId: userDoc?.stripeAccountId,
                    searchedFor: user
                }
            });
        }

        // Delete the account in Stripe
        await stripe.accounts.del(stripeAccountId);
        
        // Update the user document
        await User.findOneAndUpdate(
            { user: user },
            { 
                $unset: { stripeAccountId: "" },
                stripeAccountStatus: {
                    detailsSubmitted: false,
                    chargesEnabled: false,
                    payoutsEnabled: false,
                }
            }
        );

        res.status(200).json({ 
            success: true, 
            message: 'Stripe account successfully deleted' 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message,
            debug: { error: error.toString() }
        });
    }
}