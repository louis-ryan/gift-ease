import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  paymentIntentId: { type: String, required: true, unique: true },
  giftId: { type: String, required: true },
  eventId: { type: String, required: true },
  recipientId: { type: String },
  senderName: { type: String },
  description: { type: String },
  amount: { type: Number, required: true }, // in dollars
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
