const mongoose = require('mongoose');

const exchangeRateSchema = new mongoose.Schema({
  rate: {
    type: String,
  },
  displayName: {
    type: String,
  },
});

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);
