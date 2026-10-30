import Payment from '../models/Payment';
import PendingGiftMessage from '../models/PendingGiftMessage';
import { fromMinorUnits } from './currency';

// Writes the Payment for a succeeded PaymentIntent. Called by the Stripe webhook (the source
// of truth) and by /api/confirmPayment, so a sender returning from checkout sees their gift
// counted even if the webhook hasn't arrived yet. Safe to call more than once.
export async function recordPayment(intent) {
  if (intent.status !== 'succeeded' || !intent.metadata?.giftId) return null;

  // The sender's message, photos, GIF and contact details, saved by createPaymentIntent
  const pending = await PendingGiftMessage.findOne({ paymentIntentId: intent.id }).lean();
  const extras = pending
    ? {
        message: pending.message || undefined,
        photoUrls: pending.photoUrls?.length ? pending.photoUrls : undefined,
        gifUrl: pending.gifUrl || undefined,
        contactMethod: pending.contactMethod || undefined,
        contactValue: pending.contactValue || undefined,
      }
    : {};

  const payment = await Payment.findOneAndUpdate(
    { paymentIntentId: intent.id },
    {
      paymentIntentId: intent.id,
      giftId: intent.metadata.giftId,
      eventId: intent.metadata.eventId,
      recipientId: intent.metadata.recipientId,
      senderName: intent.metadata.senderName,
      // Older payments carried the message in metadata; newer ones in `extras`
      description: intent.metadata.description,
      ...extras,
      amount: fromMinorUnits(intent.amount, intent.currency),
      currency: intent.currency,
      // Contribution in the wish's currency, worked out when the payment was created
      wishAmount: intent.metadata.wishAmount ? parseFloat(intent.metadata.wishAmount) : undefined,
      wishCurrency: intent.metadata.wishCurrency,
      // Fees deducted from the giftee's share. The application fee is the authoritative
      // total; metadata says how it splits between our cut and the Stripe estimate
      platformFee: intent.metadata.platformFee ? parseFloat(intent.metadata.platformFee) : undefined,
      processingFee: intent.metadata.processingFee ? parseFloat(intent.metadata.processingFee) : undefined,
      totalFee: fromMinorUnits(intent.application_fee_amount || 0, intent.currency),
    },
    { upsert: true, new: true }
  );
  if (pending) await PendingGiftMessage.deleteOne({ _id: pending._id });
  return payment;
}
