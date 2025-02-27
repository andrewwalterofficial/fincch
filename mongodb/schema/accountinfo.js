const mongoose = require('mongoose');

const accountInfoSchema = new mongoose.Schema({
  STK: {
    type: String,
    required: true,
    unique: true,
  },
  displayName: String,
  userID: String,
  balance: {
    type: Number,
    default: 0,
  },
  currencyUnit: {
    type: String,
    default: 'USD',
  },
  beginDate: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Number,
    default: 0,
  },
  bankCode: {
    type: String,
    default: 'ARG',
  },
  limit: {
    type: Number,
    default: 5000,
  },
  isDefault: Boolean,
});

module.exports = mongoose.model('AccountInfo', accountInfoSchema);
