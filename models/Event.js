const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    unique: false,
    index: false,
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    maxlength: [100, 'Name cannot be more than 100 characters'],
  },
  uri: {
    type: String,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
    min: Date.now,
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
  },
  current: Boolean,
  imageUrl: String,
});

module.exports = mongoose.models.Event || mongoose.model('Event', EventSchema);
