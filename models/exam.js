const mongoose = require('mongoose');

const examSchema = mongoose.Schema({
  examCode: {
    type: String,
    unique: true,
    required: true,
  },

  contentExam: {
    type: String,
    required: true,
  },

  dateAdded: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Exam', examSchema);
