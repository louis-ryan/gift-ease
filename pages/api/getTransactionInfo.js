import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { accountId } = req.query;
    
    // Get the balance for the connected account to see pending amounts
    const balance = await stripe.balance.retrieve({
      stripeAccount: accountId
    });

    // Get pending payouts
    const payouts = await stripe.payouts.list({
      status: 'pending',
      limit: 100
    }, {
      stripeAccount: accountId
    });

    // Get recent transfers to this account
    const transfers = await stripe.transfers.list({
      destination: accountId,
      limit: 100,
      expand: ['data.destination_payment']
    });

    const response = {
      pending_balance: balance.pending.map(fund => ({
        amount: fund.amount,
        currency: fund.currency,
        estimated_arrival: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)) // Estimate 7 days
      })),
      available_balance: balance.available.map(fund => ({
        amount: fund.amount,
        currency: fund.currency
      })),
      pending_payouts: payouts.data.map(payout => ({
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        arrival_date: payout.arrival_date,
        status: payout.status
      })),
      recent_transfers: transfers.data.map(transfer => ({
        id: transfer.id,
        amount: transfer.amount,
        currency: transfer.currency,
        created: transfer.created,
        description: transfer.description,
        metadata: transfer.metadata,
        status: transfer.status
      }))
    };

    res.status(200).json({
      success: true,
      ...response
    });

  } catch (error) {
    console.error('Error fetching balance and payout data:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({ 
        message: 'Invalid account ID or permissions issue',
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      message: 'Error fetching balance and payout data',
      error: error.message
    });
  }
}