const jwt = require("jsonwebtoken");
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const cart = require("../models/Cart");
const mongoose = require("mongoose");
const express = require("express");
const createError = require("../Utiles/createError");
const salt = bcrypt.genSaltSync(10);
const isProduction = process.env.NODE_ENV === "production";

const createSeller = async (req, res, next) => {
  const { error } = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    password: Joi.string().min(3).required(),
  }).validate(req.body);

  if (error) return next(createError(400, error.details[0].message));

  try {
    const { username, email, phone, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return next(createError(400, "Email already exists"));

    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      phone,
      password: hash,
      isSeller: true,
    });

    const createdUser = await newUser.save();

    const token = jwt.sign(
      {
        userId: createdUser._id,
        email: createdUser.email,
        isSeller: createdUser.isSeller,
      },
      process.env.SECRET_KEY || "your_fallback_secret_key",
      { expiresIn: "1h" }
    );

    return res
      .status(200)
      .json({ success: true, userData: createdUser, token });
  } catch (err) {
    return next(err);
  }
};

const SignInSeller = async (req, res, next) => {
  const { error } = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required(),
  }).validate(req.body);

  if (error) return next(createError(400, error.details[0].message));

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(createError(400, "Wrong credentials!"));

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return next(createError(400, "Wrong credentials!"));

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      userData: user,
    });
  } catch (err) {
    next(err);
  }
};

// const GetLoggedInUser = async (req, res, next) => {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//         return res.status(400).json({ success: false, message: 'Invalid user ID format' });
//     }

//     try {
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//         const userWithoutPassword = { ...user.toObject() };
//         delete userWithoutPassword.password;

//         return res.status(200).json({ success: true, userData: userWithoutPassword });
//     } catch (err) {
//         return next(err);
//     }
// };

// const forgetPasswordStepOne = async (req, res, next) => {
//     const { error } = Joi.object({
//         email: Joi.string().email().required()
//     }).validate(req.body);

//     if (error) return next(createError(400, error.details[0].message));

//     try {
//         const user = await User.findOne({ email: req.body.email });
//         if (!user) return next(createError(404, 'User not found'));

//         const otp = Math.floor(1000 + Math.random() * 9000);
//         return res.status(200).json({ success: true, message: "OTP generated successfully", otp });
//     } catch (err) {
//         return next(err);
//     }
// };

// const forgetPasswordStepTwo = async (req, res, next) => {
//     const { error } = Joi.object({
//         otp: Joi.number().required(),
//     }).validate(req.body);

//     if (error) return next(createError(400, error.details[0].message));

//     try {
//         const { otp } = req.body;
//         if (otp) {
//             return res.status(200).json({ success: true, message: "OTP verified" });
//         } else {
//             return next(createError(400, "Wrong OTP"));
//         }
//     } catch (err) {
//         return next(err);
//     }
// };
// const resetPassword = async (req, res, next) => {
//     const { error } = Joi.object({
//         password: Joi.string().min(3).required(),
//         confirmpassword: Joi.string().min(3).valid(Joi.ref('password')).required(),
//     }).validate(req.body);

//     if (error) {
//         return next(createError(400, error.details[0].message));
//     }

//     try {
//         const { password } = req.body;
//         const salt = bcrypt.genSaltSync(10);
//         const hash = bcrypt.hashSync(password, salt);

//         const userId = req.params.userId;

//         const user = await User.findOneAndUpdate(
//             { _id: userId },
//             { password: hash },
//             { new: true }
//         );
//         console.log('Updated User:', user);

//         if (user) {
//             return res.status(200).json({ success: true, message: "Password reset successfully" });
//         } else {
//             return next(createError(400, "User not found"));
//         }
//     } catch (err) {
//         console.error('Error during password reset:', err.message);
//         return next(createError(500, 'An error occurred while resetting the password'));
//     }
// };

// const logout = async (req, res, next) => {
//     res.clearCookie("accessToken", {
//         sameSite: "none",
//         secure: isProduction,
//     })
//     .status(200)
//     .send("User has been logged out.");
// };

const getSellerById = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid user ID format" });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving user", error: error.message });
  }
};

const shopsList = async (req, res, next) => {
  try {
    const shops = await User.where({
      isSeller: true,
    });

    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "No shops found" });
    }

    // Map through the array and remove password from each user
    const shopsWithoutPassword = shops.map((shop) => {
      const shopObject = shop.toObject();
      delete shopObject.password;
      return shopObject;
    });

    return res.status(200).json({ shops: shopsWithoutPassword });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving shops", error: error.message });
  }
};
const getShopById = async (req, res, next) => {
  const { id } = req.params; // Get the seller ID from the URL parameter

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid shop ID format" });
  }

  try {
    const shop = await User.findById(id); // Fetch the user/shop by ID

    if (!shop || !shop.isSeller) {
      return res.status(404).json({ message: "Shop not found or not a seller" });
    }

    // Remove the password field for security
    const shopWithoutPassword = { ...shop.toObject() };
    delete shopWithoutPassword.password;

    return res.status(200).json({ shop: shopWithoutPassword }); // Return the shop data
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error retrieving shop", error: error.message });
  }
};

module.exports = {
  createSeller,
  SignInSeller,
  getSellerById,
  shopsList,
  getShopById,
};
