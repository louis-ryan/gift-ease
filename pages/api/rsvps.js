import { withApiAuthRequired } from '@auth0/nextjs-auth0';
import Rsvp from '../../models/Rsvp';
import { getGifteeAccount, getOwnEvent } from '../../utils/gifteeAccount';

// The giftee's guest replies for one of their events:
//   GET    ?eventId=        → { rsvps, totals }
//   DELETE ?eventId=&id=    → removes one reply (e.g. a duplicate)
async function handler(req, res) {
  const account = await getGifteeAccount(req, res);
  const event = await getOwnEvent(account, req.query.eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  const eventId = String(event._id);

  try {
    if (req.method === 'GET') {
      const rsvps = await Rsvp.find({ eventId }).sort({ createdAt: -1 }).lean();
      const yes = rsvps.filter((r) => r.attending);
      const totals = {
        replies: rsvps.length,
        attendingReplies: yes.length,
        attendingPeople: yes.reduce((s, r) => s + (r.guests || 1), 0),
        declined: rsvps.length - yes.length,
      };
      return res.status(200).json({ rsvps, totals });
    }
    if (req.method === 'DELETE') {
      await Rsvp.deleteOne({ _id: req.query.id, eventId });
      return res.status(200).json({ success: true });
    }
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('rsvps error:', error);
    return res.status(400).json({ error: 'Could not load replies' });
  }
}

export default withApiAuthRequired(handler);
