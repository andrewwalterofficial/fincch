const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  userID: Number,
  identityTypes: Number,
  identity: String,
  beginDate: Date,
  image: String,
  isActive: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model('Customer', customerSchema);
