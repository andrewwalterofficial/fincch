const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  bankCode: {
    type: String,
    unique: true,
    required: true,
  },
  displayName: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Bank', bankSchema);
