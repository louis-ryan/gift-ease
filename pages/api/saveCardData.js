import dbConnect from '../../utils/dbConnect';
import Card from '../../models/Card';
import { corsMiddleware, runMiddleware } from '../../utils/cors';

export default async function handler(req, res) {
    try {
        await runMiddleware(req, res, corsMiddleware);

        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        await dbConnect();

        const { paymentIntentId, giftId, eventId, senderName, cardHTML, cardText, backgroundImage, overlayImages } = req.body;

        try {
            const cardData = new Card({
                paymentIntentId,
                giftId,
                eventId,
                senderName,
                cardHTML,
                cardText,
                backgroundImage,
                overlayImages
            });

            await cardData.save();

            res.status(200).json({ 
                success: true, 
                message: 'Card data saved successfully' 
            });
        } catch (err) {
            console.error('Error saving card data:', err);
            res.status(500).json({ error: 'Failed to save card data' });
        }
    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 