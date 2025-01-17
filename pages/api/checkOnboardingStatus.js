import Stripe from 'stripe';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
    try {
      const { accountId } = req.query;
      const account = await stripe.accounts.retrieve(accountId, {
        expand: ['external_accounts']
      });
  
      res.status(200).json({
        isEnabled: account.charges_enabled,
        isDetailsSubmitted: account.details_submitted,
        payoutsEnabled: account.payouts_enabled,
        payoutSchedule: account.settings?.payouts?.schedule,
        payoutRestrictions: account.payouts_disabled_reason,
        requirements: {
          currentlyDue: account.requirements?.currently_due || [],
          pendingVerification: account.requirements?.pending_verification || [],
          eventuallyDue: account.requirements?.eventually_due || [],
          disabled_reason: account.requirements?.disabled_reason,
          past_due: account.requirements?.past_due || []
        },
        capabilities: account.capabilities,
        bankAccounts: account.external_accounts?.data.map(bank => ({
            last4: bank.last4,
            status: bank.status,
            bank_name: bank.bank_name,
            currency: bank.currency,
            validation_type: bank.validation_type
        })),
        created_at: new Date(account.created * 1000).toISOString()
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error checking onboarding status' });
    }
  }