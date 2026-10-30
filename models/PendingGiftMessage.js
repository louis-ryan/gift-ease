import mongoose from 'mongoose';

// The sender's message, photos, GIF and contact details, saved when the PaymentIntent is
// created and moved onto the Payment by the webhook once the payment succeeds. Kept out of
// Stripe metadata (500-character limit, and no need to give Stripe the contact details).
// Abandoned payments never succeed, so their rows are deleted automatically after 7 days.
const PendingGiftMessageSchema = new mongoose.Schema({
  paymentIntentId: { type: String, required: true, unique: true },
  message: String,
  photoUrls: { type: [String], default: undefined },
  gifUrl: String,
  contactMethod: { type: String, enum: ['whatsapp', 'email'] },
  contactValue: String,
  createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 24 * 7 },
});

export default mongoose.models.PendingGiftMessage ||
  mongoose.model('PendingGiftMessage', PendingGiftMessageSchema);
