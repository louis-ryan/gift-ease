import Stripe from 'stripe';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const { accountId, eventId } = req.query;
    
    if (!accountId) {
      return res.status(400).json({ 
        message: 'Missing accountId parameter'
      });
    }
    
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

    // Fetch payments from Stripe that match this account's transactions
    // Use the metadata.connectedAccountId to filter for this specific account
    const payments = await stripe.paymentIntents.list({
      limit: 100,
      expand: ['data.latest_charge']
    });

    // Filter payments for this specific account and event (if provided)
    const accountPayments = payments.data.filter(payment => {
      const matchesAccount = payment.metadata.connectedAccountId === accountId;
      const matchesEvent = eventId ? payment.metadata.eventId === eventId : true;
      return matchesAccount && matchesEvent && payment.status === 'succeeded';
    });

    // Map payment intents to the format expected by the frontend
    const recent_transactions = accountPayments.map(payment => {
      const charge = payment.latest_charge;
      return {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        created: payment.created,
        description: `Event: ${payment.metadata.eventId || 'Unknown'}, Gift: ${payment.metadata.giftId || 'Unknown'}`,
        status: payment.status,
        payment_method: charge?.payment_method_details?.type || 'unknown',
        metadata: {
          giftId: payment.metadata.giftId,
          eventId: payment.metadata.eventId
        }
      };
    });

    const response = {
      pending_balance: balance.pending.map(fund => ({
        amount: fund.amount,
        currency: fund.currency,
        estimated_arrival: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))
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
      recent_transactions
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