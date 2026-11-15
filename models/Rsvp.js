const mongoose = require('mongoose');

// A guest's reply to an invitation. Written by the public sender app (pages/api/rsvp.js),
// read only by the giftee who owns the event (pages/api/rsvps.js).
const RsvpSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, index: true },
    name: { type: String, required: true, maxlength: 100 },
    attending: { type: Boolean, required: true },
    // People in this reply, including the guest themselves. 0 when not attending
    guests: { type: Number, min: 0, max: 10, default: 1 },
    email: { type: String, maxlength: 200 },
    dietary: { type: String, maxlength: 200 },
    message: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Rsvp || mongoose.model('Rsvp', RsvpSchema);
