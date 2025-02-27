const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  from: String,
  to: String,
  fromUser: Number,
  toUser: Number,
  type: Number,
  date: {
    type: Date,
    default: Date.now,
  },
  seen: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
