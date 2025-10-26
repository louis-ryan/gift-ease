const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    maxlength: [40, 'Title cannot be more than 40 characters'],
  },
  currency: String,
  amount: String,
  price: {
    type: String,
    required: [true, 'Please add a price'],
  },
  description: {
    type: String,
    required: true,
    maxlength: [200, 'Description cannot be more than 200 characters'],
  },
  noteUrl: String,
  imageUrl: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.models.Note || mongoose.model('Note', NoteSchema);
