import Stripe from 'stripe';
import dbConnect from '../../utils/dbConnect';
import User from '../../models/Account';
import { COUNTRY_BANK_FORMATS } from '../../countryBankFormats';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        await dbConnect();
        const { userId, email, phone, address, dob, country, bankAccount } = req.body;

        const countryConfig = COUNTRY_BANK_FORMATS[country];
        if (!countryConfig) {
            return res.status(400).json({
                success: false,
                message: 'Unsupported country'
            });
        }

        const account = await stripe.accounts.create({
            type: 'custom',
            email,
            country,
            business_type: 'individual',
            capabilities: {
                transfers: { requested: true },
                card_payments: { requested: true }
            },
            business_profile: {
                mcc: '5399',
                url: 'https://wishlistsundae.com',
                product_description: 'Receiving gifts and payments'
            },
            individual: {
                email,
                phone,
                address: {
                    ...address,
                    country
                },
                dob: {
                    day: parseInt(dob.day),
                    month: parseInt(dob.month),
                    year: parseInt(dob.year)
                }
            },
            tos_acceptance: {
                date: Math.floor(Date.now() / 1000),
                ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
            },
            external_account: countryConfig.createExternalAccount(bankAccount)
        });

        await User.findOneAndUpdate(
            { user: userId },
            {
                stripeAccountId: account.id,
                stripeAccountStatus: {
                    detailsSubmitted: true,
                    chargesEnabled: false,
                    payoutsEnabled: false
                }
            }
        );

        res.status(200).json({
            success: true,
            accountId: account.id
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}