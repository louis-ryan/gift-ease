import dbConnect from '../../utils/dbConnect';
import Card from '../../models/Card';
import { corsMiddleware, runMiddleware } from '../../utils/cors';

export default async function handler(req, res) {
    try {
        await runMiddleware(req, res, corsMiddleware);

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        if (req.method !== 'GET') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        await dbConnect();

        const { paymentIntentId, giftId } = req.query;

        try {
            let cardData;
            
            if (paymentIntentId) {
                // Get card data by payment intent ID
                cardData = await Card.findOne({ paymentIntentId });
            } else if (giftId) {
                // Get all card data for a specific gift
                cardData = await Card.find({ giftId }).sort({ createdAt: -1 });
            } else {
                return res.status(400).json({ error: 'Either paymentIntentId or giftId is required' });
            }

            res.status(200).json({ 
                success: true, 
                data: cardData 
            });
        } catch (err) {
            console.error('Error retrieving card data:', err);
            res.status(500).json({ error: 'Failed to retrieve card data' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 