const mongoose = require("mongoose");


const MailSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    newsletter: { type: Boolean, unique: false}
  }
);

module.exports = mongoose.model("Mail", MailSchema);
