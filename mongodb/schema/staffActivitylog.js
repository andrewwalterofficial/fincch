const mongoose = require('mongoose');

const staffActivityLogSchema = new mongoose.Schema({
  staffID: Number,
  message: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('StaffActivityLog', staffActivityLogSchema);
