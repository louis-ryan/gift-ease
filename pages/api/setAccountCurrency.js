import dbConnect from '../../utils/dbConnect';
import Account from '../../models/Account';

dbConnect();

export default async (req, res) => {
    if (req.method !== 'PUT' && req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { query: { id } } = req;

    try {
        const account = await Account.findByIdAndUpdate(
            id,
            { $set: { currency: req.body.currency } },
            {
                new: true,
                runValidators: true
            }
        );

        if (!account) {
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true, data: account });
    } catch (error) {
        console.error('Error details:', error);
        res.status(400).json({ success: false });
    }
}