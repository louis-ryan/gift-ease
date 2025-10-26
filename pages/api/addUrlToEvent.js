import dbConnect from '../../utils/dbConnect';
import Event from '../../models/Event';

dbConnect();

export default async (req, res) => {
  const {
    query: { id },
  } = req;
  const imageUrl = req.body;

  try {
    // First check if the event exists and log it
    const eventExists = await Event.findById(id);

    if (!eventExists) {
      return res
        .status(404)
        .json({ success: false, message: 'Event not found' });
    }

    // Update the event with the new imageUrl
    const event = await Event.findByIdAndUpdate(
      id,
      { $set: { imageUrl: imageUrl } }, // Use $set to ensure the field is added
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Update error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
};
