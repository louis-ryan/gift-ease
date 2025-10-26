import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { accountId } = req.body;

  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/account?setup=complete`,
      type: 'account_onboarding',
      collect: 'eventually_due', // This focuses on collecting remaining requirements
    });

    res.status(200).json({ url: accountLink.url });
  } catch (error) {
    console.error('Error creating account link:', error);
    res.status(500).json({ message: 'Error creating account link' });
  }
}
