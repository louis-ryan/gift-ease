import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  paymentIntentId: { type: String, required: true, unique: true },
  giftId: { type: String, required: true },
  eventId: { type: String, required: true },
  recipientId: { type: String },
  senderName: { type: String },
  description: { type: String },
  amount: { type: Number, required: true }, // in major units of `currency` (e.g. euros, not cents)
  currency: { type: String, default: 'usd' }, // lowercase ISO code, as Stripe returns it
  wishAmount: { type: Number }, // the contribution converted into the wish's currency, for goal progress
  wishCurrency: { type: String },
  // Fees deducted from what the giftee receives, in `currency` (the sender never sees these)
  platformFee: { type: Number },
  processingFee: { type: Number }, // estimated Stripe fee, see utils/fees.js
  totalFee: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
