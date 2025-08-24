// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product"); 
const Order = require("../models/Order");
const Seller = require("../models/seller");
const { auth } = require("../Middleware/auth");
const checkAdmin = require("../Middleware/checkAdmin");


// ✅ Get all users
router.get("/users", auth, checkAdmin, async (req, res, next) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// ✅ Get all products
router.get("/products", auth, checkAdmin, async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

// ✅ Get all orders
router.get("/orders", auth, checkAdmin, async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user").populate("products.product");
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// ✅ Get all sellers
router.get("/sellers", auth, checkAdmin, async (req, res, next) => {
  try {
    const sellers = await Seller.find();
    res.json(sellers);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
