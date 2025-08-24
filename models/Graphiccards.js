const mongoose = require("mongoose");

const GraphicCardSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  desc: { type: String, required: true },
  img: { type: String, required: true },
  category: { type: String, default: "graphic cards" }, 
  color: { type: String },
  price: { type: Number, required: true },
}, 
{ timestamps: true }
);

module.exports = mongoose.model("graphic-cards", GraphicCardSchema);
