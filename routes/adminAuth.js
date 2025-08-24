// routes/adminAuth.js
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const createError = require("../Utiles/createError");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ✅ Admin Login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return next(createError(404, "User not found"));

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(createError(400, "Invalid credentials"));

    // Check if admin
    if (!user.isAdmin) return next(createError(403, "Access denied, not an admin"));

    // Create JWT
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Admin login successful",
      token,
      user: { id: user._id, email: user.email, username: user.username, isAdmin: user.isAdmin }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
