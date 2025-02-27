const mongoose = require('mongoose');
const { TIME } = require('sequelize');

const donetransferSchema = new mongoose.Schema({
    receiverCountry: String,
    receiverBank: String,
    receiverName: String,
    receiverAccountNo: String,
    receiverSwiftCode: String,
    amount: Number,
    Description: String,
    senderAccountNo: String, // Add the senderAccountNo field
    createdDate: { type: Date, default: Date.now },
    transacttype: String,
});

module.exports = mongoose.model('DoneTransfer', donetransferSchema);
