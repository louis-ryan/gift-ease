import dbConnect from '../../utils/dbConnect';
import Event from '../../models/Event';

dbConnect();

export default async (req, res) => {
    try {
        const events = await Event.find({}, 'uri');
        const uris = events.map(event => event.uri);
        res.status(200).json({ success: true, data: uris });
    } catch (error) {
        res.status(400).json({ success: false, error });
    }
}