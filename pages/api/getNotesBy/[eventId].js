import dbConnect from '../../../utils/dbConnect';
import Note from '../../../models/Note';

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
    query: { eventId },
  } = req;

  try {
    const notes = await Note.find({ event: eventId });

    if (!notes) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, noteData: notes });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
};
