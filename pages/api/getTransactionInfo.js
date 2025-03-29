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
    const payments = await stripe.paymentIntents.list({
      limit: 100,
      expand: ['data.latest_charge']
    });

    console.log(`Total payments found: ${payments.data.length}`);

    // Add debugging to see what metadata exists
    if (payments.data.length > 0) {
      console.log("Sample payment metadata:", payments.data[0].metadata);
      console.log("Sample payment structure:", {
        id: payments.data[0].id,
        status: payments.data[0].status,
        hasMetadata: !!payments.data[0].metadata,
        metadataKeys: payments.data[0].metadata ? Object.keys(payments.data[0].metadata) : []
      });
    }

    // More robust filtering that:
    // 1. Checks if metadata exists
    // 2. Safely accesses properties
    // 3. Handles different possible metadata field names
    const accountPayments = payments.data.filter(payment => {
      // Skip payments without metadata
      if (!payment.metadata) {
        console.log(`Payment ${payment.id} has no metadata`);
        return false;
      }

      // Check various possible field names for connected account ID
      const connectedAccountField = payment.metadata.connectedAccountId ||
        payment.metadata.connected_account_id ||
        payment.metadata.account_id ||
        payment.metadata.accountId;

      const matchesAccount = connectedAccountField === accountId;

      // If we're filtering by event ID, check various possible field names
      let matchesEvent = true;
      if (eventId) {
        const eventIdField = payment.metadata.eventId ||
          payment.metadata.event_id ||
          payment.metadata.event;
        matchesEvent = eventIdField === eventId;
      }

      // Only filter by success if we want to
      const statusMatch = payment.status === 'succeeded';

      const isMatch = matchesAccount && matchesEvent && statusMatch;

      // Debug logging for why payments were filtered out
      if (!isMatch) {
        console.log(`Payment ${payment.id} filtered out:`, {
          hasConnectedAccountId: !!connectedAccountField,
          connectedAccountMatches: matchesAccount,
          eventMatches: matchesEvent,
          statusMatches: statusMatch
        });
      }

      return isMatch;
    });

    console.log(`Filtered to ${accountPayments.length} payments for account ${accountId}`);

    // If no payments were found with the strict filter, try a more lenient approach
    let recent_transactions = [];

    if (accountPayments.length === 0) {
      console.log("No payments found with strict filtering, trying lenient filtering...");

      // Option 1: Try without the connectedAccountId check
      const lenientPayments = payments.data.filter(payment =>
        payment.status === 'succeeded' &&
        (!eventId ||
          (payment.metadata &&
            (payment.metadata.eventId === eventId || payment.metadata.event_id === eventId))
        )
      );

      console.log(`Found ${lenientPayments.length} payments with lenient filtering`);

      // Map payment intents to the format expected by the frontend
      recent_transactions = lenientPayments
        .filter(payment => payment.metadata?.recipientId === accountId)
        .map(payment => {
          const charge = payment.latest_charge;
          return {
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            created: payment.created,
            description: payment.metadata ?
              `Event: ${payment.metadata.eventId || payment.metadata.event_id || 'Unknown'}, Gift: ${payment.metadata.giftId || payment.metadata.gift_id || 'Unknown'}` :
              'Payment',
            status: payment.status,
            payment_method: charge?.payment_method_details?.type || 'unknown',
            metadata: payment.metadata || {}
          };
        });
    } else {
      // Use the original strict filtering if it worked
      recent_transactions = accountPayments
        .filter(payment => payment.metadata?.recipientId === accountId)
        .map(payment => {
          const charge = payment.latest_charge;
          return {
            id: payment.id,
            amount: payment.amount,
            currency: payment.currency,
            created: payment.created,
            description: `Event: ${payment.metadata.eventId || payment.metadata.event_id || 'Unknown'}, Gift: ${payment.metadata.giftId || payment.metadata.gift_id || 'Unknown'}`,
            status: payment.status,
            payment_method: charge?.payment_method_details?.type || 'unknown',
            metadata: payment.metadata
          };
        });
    }

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

    // If we still have no transactions, add debugging info
    if (recent_transactions.length === 0) {
      response.debug_info = {
        total_payments_found: payments.data.length,
        account_id_searched_for: accountId,
        event_id_searched_for: eventId || 'none',
        strict_filter_results: accountPayments.length,
        payment_statuses: payments.data.map(p => p.status).reduce((acc, status) => {
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {})
      };
    }

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