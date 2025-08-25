const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isSeller: { type: Boolean, default: false },

  // OTP-related fields
  otp: { type: String },
  otpExpires: { type: Date },
  otpVerified: { type: Boolean, default: false }, 

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
