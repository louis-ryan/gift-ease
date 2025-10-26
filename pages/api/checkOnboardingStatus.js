import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { accountId } = req.query;
    const account = await stripe.accounts.retrieve(accountId);

    // Add these specific checks
    const payoutSchedule = account.settings?.payouts?.schedule;
    const payoutRestrictions = account.payouts_disabled_reason;

    res.status(200).json({
      isEnabled: account.charges_enabled,
      isDetailsSubmitted: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
      payoutSchedule,
      payoutRestrictions,
      requirements: {
        currentlyDue: account.requirements?.currently_due || [],
        pendingVerification: account.requirements?.pending_verification || [],
        eventuallyDue: account.requirements?.eventually_due || [],
        disabled_reason: account.requirements?.disabled_reason,
        past_due: account.requirements?.past_due || [],
      },
      capabilities: account.capabilities,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error checking onboarding status' });
  }
}
