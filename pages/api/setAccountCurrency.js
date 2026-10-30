import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import { getGifteeAccount } from '../../utils/gifteeAccount';
import { SUPPORTED_CURRENCIES } from '../../utils/currency';

// Saves the logged-in giftee's default currency (the starting currency for new wishes
// and the one received amounts are also shown in). Existing wishes keep their own currency.
async function handler(req, res) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const currency = String(req.body?.currency || '').toUpperCase();
  if (!SUPPORTED_CURRENCIES.includes(currency.toLowerCase())) {
    return res.status(400).json({ success: false, error: 'Unsupported currency' });
  }
  try {
    const account = await getGifteeAccount(req, res);
    if (!account) return res.status(404).json({ success: false, error: 'Account not found' });
    account.currency = currency;
    await account.save();
    res.status(200).json({ success: true, data: { currency } });
  } catch (error) {
    console.error('Error saving account currency:', error);
    res.status(500).json({ success: false, error: 'Could not save your currency' });
  }
}

export default withApiAuthRequired(handler);
