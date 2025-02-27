const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  country: String,
  bank: String,
  name: String,
  accounttno: String,
  swiftcode: String

});

module.exports = mongoose.model('Transfer', transferSchema);
