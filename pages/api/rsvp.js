import { corsMiddleware, runMiddleware } from '../../utils/cors';
import dbConnect from '../../utils/dbConnect';
import Event from '../../models/Event';
import Rsvp from '../../models/Rsvp';
import { isRegistryOnly } from '../../utils/invitationDesign';

// Public: a guest replies to an invitation from the sender app.
// POST { uri, name, attending, guests, email?, dietary?, message? }
const text = (v, max) =>
  typeof v === 'string'
    ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim().slice(0, max)
    : '';

export default async function handler(req, res) {
  await runMiddleware(req, res, corsMiddleware);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { uri } = req.body || {};
  const name = text(req.body?.name, 100);
  const attending = req.body?.attending;
  if (!name) return res.status(400).json({ error: 'Please add your name' });
  if (typeof attending !== 'boolean') return res.status(400).json({ error: 'Please say whether you can come' });

  const guests = attending ? Math.round(Number(req.body?.guests)) : 0;
  if (attending && !(guests >= 1 && guests <= 10)) {
    return res.status(400).json({ error: 'Please choose how many of you are coming' });
  }

  const email = text(req.body?.email, 200);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please check the email address' });
  }

  try {
    await dbConnect();
    const event = await Event.findOne({ uri: String(uri || '') }).lean();
    if (!event) return res.status(404).json({ error: 'This invitation no longer exists' });
    if (event.rsvpEnabled === false || isRegistryOnly(event)) return res.status(400).json({ error: 'This invitation isn’t taking RSVPs' });
    // Deadline is a whole day: replies are open until the end of it (UTC + a day of slack)
    if (event.rsvpDeadline && Date.now() > new Date(event.rsvpDeadline).getTime() + 48 * 60 * 60 * 1000) {
      return res.status(400).json({ error: 'RSVPs for this invitation have closed' });
    }

    await Rsvp.create({
      eventId: String(event._id),
      name,
      attending,
      guests,
      email: email || undefined,
      dietary: attending ? text(req.body?.dietary, 200) || undefined : undefined,
      message: text(req.body?.message, 500) || undefined,
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('RSVP error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
