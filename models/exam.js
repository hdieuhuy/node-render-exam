const mongoose = require('mongoose');

const examSchema = mongoose.Schema({
  examCode: {
    type: String,
    unique: true,
    required: true,
  },

  contentsExams: {
    type: Buffer,
    required: true,
  },

  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', examSchema);
