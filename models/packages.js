const mongoose = require("mongoose");

const PackageSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  desc: { type: String, required: true },
  img: { type: String, required: true },
  category: { type: String, default: "packages" }, 
  color: { type: String },
  price: { type: Number, required: true },
}, 
{ timestamps: true }
);

module.exports = mongoose.model("packages", PackageSchema);
