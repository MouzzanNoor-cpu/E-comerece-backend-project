const mongoose = require("mongoose");

const ShopSchema = new mongoose.Schema(
  {
    shopName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    zipCode: { type: String, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

const Shop = mongoose.model("Shop", ShopSchema);
module.exports = Shop;
