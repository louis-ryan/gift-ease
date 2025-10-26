import dbConnect from '../../../utils/dbConnect';
import Event from '../../../models/Event';

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

    res.status(200).json({ success: true, eventData: event });
  } catch (error) {
    res.status(400).json({ success: false, error: error });
  }
};
