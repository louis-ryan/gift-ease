import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import Event from '../../../models/Event';
import { getGifteeAccount, getOwnEvent } from '../../../utils/gifteeAccount';
import { cleanInvitation } from '../../../utils/invitation';

// PUT { ...invitation fields } → saves the logged-in giftee's invitation.
// Only whitelisted fields (utils/invitation.js) are accepted; the link (uri) can't change
// here because guests may already have it.
async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ success: false, error: 'Method not allowed' });

  const account = await getGifteeAccount(req, res);
  const event = await getOwnEvent(account, req.query.id);
  if (!event) return res.status(404).json({ success: false, error: 'Event not found' });

  const { update, error } = cleanInvitation(req.body, event);
  if (error) return res.status(400).json({ success: false, error });

  try {
    const saved = await Event.findByIdAndUpdate(event._id, { $set: update }, { new: true, runValidators: true });
    return res.status(200).json({ success: true, data: saved });
  } catch (err) {
    console.error('updateEvent error:', err);
    return res.status(400).json({ success: false, error: 'Could not save the invitation' });
  }
}

export default withApiAuthRequired(handler);
