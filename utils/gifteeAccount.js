import { getSession } from '@auth0/nextjs-auth0';
import dbConnect from './dbConnect';
import Account from '../models/Account';
import Event from '../models/Event';

// For routes wrapped in withApiAuthRequired: the logged-in giftee's Account, or null.
// Use this instead of trusting an account or Stripe ID sent by the client.
export async function getGifteeAccount(req, res) {
  const session = await getSession(req, res);
  if (!session?.user?.sub) return null;
  await dbConnect();
  return Account.findOne({ user: session.user.sub });
}

// The event, if it belongs to the logged-in giftee
export async function getOwnEvent(account, eventId) {
  if (!account || !eventId) return null;
  try {
    return await Event.findOne({ _id: eventId, user: account.user });
  } catch {
    return null; // malformed id
  }
}
