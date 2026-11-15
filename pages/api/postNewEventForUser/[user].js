import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import Event from '../../../models/Event';
import Account from '../../../models/Account';
import { getGifteeAccount } from '../../../utils/gifteeAccount';
import { cleanInvitation, slugify } from '../../../utils/invitation';

// POST { name, uri, date, eventType?, hostNames?, theme? } → a new invitation for the
// logged-in giftee, made their current event. The [user] in the path is ignored: the
// owner always comes from the session.
async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const account = await getGifteeAccount(req, res);
  if (!account) return res.status(401).json({ success: false, error: 'Please log in again' });

  const body = req.body || {};
  const { update, error } = cleanInvitation({
    name: body.name,
    date: body.date,
    eventType: body.eventType || 'wedding',
    hostNames: body.hostNames || '',
    theme: body.theme || 'classic',
  });
  if (error) return res.status(400).json({ success: false, error: { errors: { name: { message: error } } } });

  const uri = slugify(body.uri);
  if (!uri) {
    return res.status(400).json({ success: false, error: { errors: { uri: { message: 'Please choose a link' } } } });
  }
  if (await Event.exists({ uri })) {
    return res.status(400).json({ success: false, error: { errors: { uri: { message: 'This link is already taken' } } } });
  }

  try {
    const event = await Event.create({
      ...update,
      user: account.user,
      uri,
      current: true,
      rsvpEnabled: true,
      // The registry is an optional add-on, offered from the dashboard
      registryEnabled: false,
    });
    await Account.updateOne({ _id: account._id }, { currentEventStr: event._id });
    return res.status(200).json({ success: true, data: event, message: 'New Event posted' });
  } catch (err) {
    console.error('postNewEvent error:', err);
    return res.status(400).json({ success: false, error: { errors: { name: { message: 'Could not create the invitation' } } } });
  }
}

export default withApiAuthRequired(handler);
