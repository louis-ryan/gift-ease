import Stripe from 'stripe';
import dbConnect from '../../utils/dbConnect';
import User from '../../models/Account';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();
        
        const { userId, email } = req.body;
        console.log('Received request with:', { userId, email, baseUrl });

        let user = await User.findOne({ _id: userId });
        console.log('Found user:', user ? 'yes' : 'no');
        
        let stripeAccountId;

        try {
            if (user?.stripeAccountId) {
                console.log('Using existing Stripe account:', user.stripeAccountId);
                stripeAccountId = user.stripeAccountId;
            } else {
                console.log('Creating new minimal Stripe account...');
                
                const account = await stripe.accounts.create({
                    type: 'express',  // Changed from 'standard'
                    email: email,
                    business_type: 'individual',
                    capabilities: {
                        transfers: { requested: true },
                        card_payments: { requested: true }
                    }
                });
                
                stripeAccountId = account.id;

                await User.findOneAndUpdate(
                    { _id: userId },
                    {
                        stripeAccountId: account.id,
                        stripeAccountStatus: {
                            detailsSubmitted: false,
                            chargesEnabled: false,
                            payoutsEnabled: false,
                        }
                    }
                );
            }

            const formattedBaseUrl = baseUrl.startsWith('http') ? baseUrl : `http://${baseUrl}`;
            console.log('Formatted base URL:', formattedBaseUrl);

            // Create account link with minimal collection
            const accountLink = await stripe.accountLinks.create({
                account: stripeAccountId,
                refresh_url: `${formattedBaseUrl}/onboarding/refresh`,
                return_url: `${formattedBaseUrl}/onboarding/success`,
                type: 'account_onboarding',
                collect: 'currently_due',
                payment_method_collection: 'none'  // This might help skip some business fields
            });
            
            console.log('Account link created:', accountLink.url);
            return res.status(200).json({ url: accountLink.url });

        } catch (stripeError) {
            console.error('Stripe API Error:', stripeError);
            return res.status(500).json({ 
                message: 'Error with Stripe API',
                details: stripeError.message
            });
        }

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ 
            message: 'Server error occurred',
            details: error.message
        });
    }
}