import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  paymentIntentId: {
    type: String,
    required: true,
    unique: true,
  },
  giftId: {
    type: String,
    required: true,
  },
  eventId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  cardHTML: {
    type: String,
    required: true,
  },
  cardText: {
    type: String,
    default: '',
  },
  backgroundImage: {
    type: String,
    default: '',
  },
  overlayImages: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Card || mongoose.model('Card', CardSchema);
