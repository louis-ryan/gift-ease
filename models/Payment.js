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
  // The sender's personal touch (see models/PendingGiftMessage.js). `message` is plain text
  // with **bold** / _italic_ markers, rendered by utils/giftMessage.js, never as HTML
  message: { type: String },
  photoUrls: { type: [String], default: undefined },
  gifUrl: { type: String },
  // How the giftee can say thank you. Only returned to the giftee, never on public routes
  contactMethod: { type: String, enum: ['whatsapp', 'email'] },
  contactValue: { type: String },
  thankedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
