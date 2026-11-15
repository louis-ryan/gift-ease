const mongoose = require('mongoose');

// An Event is an invitation (free), optionally with a gift registry of wishes (Notes).
// The invitation fields are validated by utils/invitation.js before they get here.
const ScheduleItemSchema = new mongoose.Schema(
  {
    time: { type: String, maxlength: 5 }, // "HH:MM", optional
    title: { type: String, maxlength: 80 },
  },
  { _id: false }
);

const EventSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: false,
    index: false,
  },
  // Title for the giftee's dashboard, the browser tab and link previews ("Sam & Alex's Wedding")
  name: {
    type: String,
    required: [true, 'Please add a name'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  uri: {
    type: String,
    unique: true,
  },
  // The day itself, stored as UTC midnight from a "YYYY-MM-DD" input. Format with
  // timeZone: 'UTC' so it shows the same day everywhere. Not-in-the-past is checked
  // when creating or changing it (utils/invitation.js), not here, so old events can
  // still be edited
  date: {
    type: Date,
    required: true,
  },
  // The invitation's message to guests
  description: {
    type: String,
    maxlength: [1000, 'Message cannot be more than 1000 characters'],
  },
  current: Boolean,
  imageUrl: String,

  // ── Invitation ──
  eventType: { type: String, enum: ['wedding', 'engagement', 'party', 'other'], default: 'wedding' },
  hostNames: { type: String, maxlength: 100 }, // "Sam & Alex"; falls back to name
  inviteLine: { type: String, maxlength: 160 }, // overrides the default line for the event type
  startTime: { type: String, maxlength: 5 }, // "HH:MM" local to the venue; empty = all day
  venueName: { type: String, maxlength: 120 },
  venueAddress: { type: String, maxlength: 300 },
  schedule: { type: [ScheduleItemSchema], default: undefined },
  dressCode: { type: String, maxlength: 80 },
  theme: { type: String, default: 'classic' },
  rsvpEnabled: { type: Boolean, default: true },
  rsvpDeadline: Date,

  // ── Gift registry (optional add-on) ──
  // Events from before invitations have no value here: they were registries, so
  // treat undefined as on (see utils/invitation.js registryEnabled())
  registryEnabled: Boolean,
  registryNote: { type: String, maxlength: 300 },

  // The giftee's thank-you message for senders, saved so they can come back to it
  thankYouMessage: {
    type: String,
    maxlength: [1000, 'Thank-you message cannot be more than 1000 characters'],
  },
});

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);
