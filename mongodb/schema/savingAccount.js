const mongoose = require('mongoose');

const savingAccountSchema = new mongoose.Schema({
  STK: {
    type: String,
    unique: true,
    required: true,
  },
  userID: {
    type: Number,
  },
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
  term: {
    type: Number,
    default: 0,
  },
  fromSTK: {
    type: String,
  },
});

module.exports = mongoose.model('SavingAccount', savingAccountSchema);
