import dbConnect from '../../../utils/dbConnect';
import Event from '../../../models/Event';
import Account from '../../../models/Account';
import { registryEnabled } from '../../../utils/invitation';

dbConnect();

export default async (req, res) => {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const {
    query: { uri },
  } = req;

  try {
    const event = await Event.findOne({ uri: uri });

    if (!event) {
      return res.status(400).json({ success: false });
    }

    // The giftee's default currency, so the sender page can open in it. Nothing else
    // from the account is exposed on this public route
    const account = await Account.findOne(
      { user: event.user },
      { currency: 1, stripeAccountId: 1, accountSetupComplete: 1 }
    ).lean();
    // Public route: leave out the giftee's login ID and their private thank-you draft
    const { user, thankYouMessage, ...publicEvent } = event.toObject();
    // Guests only see the gift registry when the giftee has turned it on and can be paid
    publicEvent.registryEnabled = registryEnabled(event);
    const registryOpen = publicEvent.registryEnabled && !!account?.stripeAccountId && !!account?.accountSetupComplete;
    res.status(200).json({
      success: true,
      eventData: publicEvent,
      gifteeCurrency: account?.currency || 'USD',
      registryOpen,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
};
