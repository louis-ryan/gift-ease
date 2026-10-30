import dbConnect from '../../../utils/dbConnect';
import Note from '../../../models/Note';
import { withUsdPrice } from '../../../utils/wishPrice';

dbConnect();

export default async (req, res) => {
  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'GET':
      try {
        const note = await Note.findById(id);

        if (!note) {
          return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: note });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case 'PUT':
      try {
        const existing = await Note.findById(id);
        if (!existing) {
          return res.status(400).json({ success: false });
        }

        // Keep the USD price in step with the goal amount, in the wish's own currency
        const update = await withUsdPrice(req.body, req.body.currency || existing.currency);
        const note = await Note.findByIdAndUpdate(id, update, {
          new: true,
          runValidators: true,
        });

        res.status(200).json({ success: true, data: note });
      } catch (error) {
        res.status(400).json({ success: false, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deletedNote = await Note.deleteOne({ _id: id });

        if (!deletedNote) {
          return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
};
