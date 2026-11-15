import dbConnect from '../../../utils/dbConnect';
import Event from '../../../models/Event';
import Note from '../../../models/Note';
import Account from '../../../models/Account';
import Payment from '../../../models/Payment';
import Rsvp from '../../../models/Rsvp';
import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';

dbConnect();

export default withApiAuthRequired(async (req, res) => {
  const {
    query: { id },
  } = req;

  try {
    const session = await getSession(req, res);
    const event = await Event.findById(id);
    // Only the giftee who owns the event can delete it
    if (!event || event.user !== session?.user?.sub) {
      return res.status(404).json({ success: false, error: 'Event not found.' });
    }
    // Keep the payment records (they're financial history) but remove what senders
    // shared with the giftee: contact details, messages, photos and GIFs
    await Payment.updateMany(
      { eventId: String(id) },
      { $unset: { contactMethod: 1, contactValue: 1, message: 1, description: 1, photoUrls: 1, gifUrl: 1 } }
    );
    // Guest replies are personal details too
    await Rsvp.deleteMany({ eventId: String(id) });
    const deletedEvent = await Event.deleteOne({ _id: id });
    const deletedWishes = await Note.deleteMany({ event: id });
    if (!deletedEvent) {
      return res
        .status(400)
        .json({ success: false, error: 'Event not deleted.' });
    }
    const eventsFromUser = await Event.find({ user: event.user });
    // Their only event: no current event, so the dashboard offers to make a new one
    const mostRecent = eventsFromUser[eventsFromUser.length - 1] || null;
    await Account.updateOne({ user: event.user }, { currentEventStr: mostRecent ? String(mostRecent._id) : '' });
    const eventToMakeCurrent = mostRecent;

    res.status(200).json({
      success: true,
      data: eventToMakeCurrent,
      message: `You deleted the event with id: ${id} and ${deletedWishes.deletedCount} wishes`,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
});
