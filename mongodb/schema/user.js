const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  accountNumber: Number,
  acctBalance: Number,
  firstName: {
    type: String,
    // unique: true,
  },
  Lastname: {
    type: String,
    // unique: true,
  },
  email: {
    type: String,
    // unique: true,
  },

  phoneNumber: Number,
  dob: Date,
  nationalid:{
    type: Number,

  },
  profilepicture:{
    type: String,

  },
  gender: String,
country: String,
  state: String,
  city: String,
  address: String,
  Zipcode: Number,
  AccountType: String,
  BeneficiaryLegalName: String,
  BeneficiaryOccupation: String,
  BeneficiaryEmailAddress: String,
  BeneficiaryPhoneNumber: Number,
  BeneficiaryResidentialAddress: String,
  RelationshipwithBeneficiary: String,
  BeneficiaryAge: String,


  password: String,
  permission: {
    type: Number,
    default: 0,
  },
  tranfer: {
    type: Boolean,
    default: true,
  },
  phoneCode: String,
  isActive: {
    type: Number,
    default: 0,
  },
  token: String,
  forgotCode: String,


});
userSchema.virtual('formattedAcctBalance').get(function () {
  // Use the 'toLocaleString' method to format the acctBalance field with commas
  return this.acctBalance.toLocaleString();
});

module.exports = mongoose.model('User', userSchema);
