const mongoose = require('mongoose');

const userRequestSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: Number,
    required: true,
  },
});

userRequestSchema.statics.findAll = async function () {
  return this.find(); // Example query, adjust as needed
};

module.exports = mongoose.model('UserRequest', userRequestSchema);
