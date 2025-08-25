const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const mongoose = require('mongoose');
const createError = require('../Utiles/createError');
const nodemailer = require('nodemailer');

const salt = bcrypt.genSaltSync(10);
const isProduction = process.env.NODE_ENV === 'production';

// Setup nodemailer transporter (configure with your SMTP details)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: process.env.SMTP_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
});

// ================== USER AUTH ====================

const SignUp = async (req, res, next) => {
  const { error } = Joi.object({
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    password: Joi.string().min(3).required(),
    isAdmin: Joi.boolean(),
  }).validate(req.body);

  if (error) return next(createError(400, error.details[0].message));

  try {
    const { username, email, phone, password, isAdmin } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) return next(createError(400, 'Email already exists'));

    const hash = bcrypt.hashSync(password, salt);

    const newUser = new User({
      username,
      email: email.toLowerCase(),
      phone,
      password: hash,
      isAdmin: isAdmin || false,
    });

    const createdUser = await newUser.save();

    const token = jwt.sign(
      { userId: createdUser._id, email: createdUser.email, isAdmin: createdUser.isAdmin },
      process.env.SECRET_KEY || 'your_fallback_secret_key',
      { expiresIn: '1h' }
    );

    return res.status(200).json({ success: true, userData: createdUser, token });
  } catch (err) {
    return next(err);
  }
};

const SignIn = async (req, res, next) => {
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

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin || false
      },
      process.env.SECRET_KEY,
      { expiresIn: '24h' }
    );

    // Remove password from user object before sending
    const userWithoutPassword = {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin || false,
      isSeller: user.isSeller || false,
    };

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      userData: userWithoutPassword,
      token: token
    });
  } catch (err) {
    next(err);
  }
};

const GetLoggedInUser = async (req, res, next) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    return res.status(200).json({ success: true, userData: userWithoutPassword });
  } catch (err) {
    return next(err);
  }
};

// ================== FORGET PASSWORD FLOW ====================

// Step 1: Generate OTP and send to verified email
const forgetPasswordStepOne = async (req, res, next) => {
  const { error } = Joi.object({
    email: Joi.string().email().required()
  }).validate(req.body);

  if (error) return next(createError(400, error.details[0].message));

  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(createError(404, 'User not found'));

    // Generate 6-digit OTP string
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiry 10 minutes from now
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // Save OTP data in user document
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.otpVerified = false;
    await user.save();

    // Send OTP email
    const mailOptions = {
      from: process.env.SMTP_USER || 'your-email@example.com',
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "OTP sent to your email." });
  } catch (err) {
    return next(err);
  }
};

// Step 2: Verify OTP
const forgetPasswordStepTwo = async (req, res, next) => {
  const { error } = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  }).validate(req.body);

  if (error) return next(createError(400, error.details[0].message));

  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(createError(404, "User not found"));

    if (!user.otp || !user.otpExpires) {
      return next(createError(400, "OTP not requested or expired"));
    }

    if (user.otpExpires < new Date()) {
      // Expired OTP — clear fields
      user.otp = null;
      user.otpExpires = null;
      user.otpVerified = false;
      await user.save();
      return next(createError(400, "OTP expired"));
    }

    if (user.otp !== otp) {
      return next(createError(400, "Invalid OTP"));
    }

    // OTP verified successfully
    user.otpVerified = true;
    await user.save();

    return res.status(200).json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    return next(err);
  }
};

// Step 3: Reset password only if OTP verified
const resetPassword = async (req, res, next) => {
  const { error } = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(3).required(),
    confirmpassword: Joi.string().min(3).valid(Joi.ref('password')).required(),
  }).validate(req.body);

  if (error) {
    return next(createError(400, error.details[0].message));
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return next(createError(404, "User not found"));

    if (!user.otpVerified) {
      return next(createError(400, "OTP verification required before resetting password"));
    }

    // Hash new password
    const hash = bcrypt.hashSync(password, salt);

    // Update password and clear OTP fields
    user.password = hash;
    user.otp = null;
    user.otpExpires = null;
    user.otpVerified = false;

    await user.save();

    return res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    return next(createError(500, 'An error occurred while resetting the password'));
  }
};

// ================== LOGOUT ====================
const logout = async (req, res, next) => {
  res.clearCookie("accessToken", {
    sameSite: "none",
    secure: isProduction,
  })
    .status(200)
    .send("User has been logged out.");
};

// ================== USER MANAGEMENT ====================

const GetUserByID = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid user ID format' });
  }

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userWithoutPassword = { ...user.toObject() };
    delete userWithoutPassword.password;

    return res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving user', error: error.message });
  }
};

const GetAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving users', error: error.message });
  }
};

const EditUser = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID format' });
  }

  const { error } = Joi.object({
    username: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    isAdmin: Joi.boolean().optional(),
  }).validate(req.body);

  if (error) return next(createError(400, error.details[0].message));

  try {
    const updates = req.body;

    if (updates.email) {
      updates.email = updates.email.toLowerCase();
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(createError(404, 'User not found'));
    }

    const userWithoutPassword = { ...updatedUser.toObject() };
    delete userWithoutPassword.password;

    return res.status(200).json({ success: true, message: 'User updated successfully', user: userWithoutPassword });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

const DeleteUser = async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user ID format' });
  }

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return next(createError(404, 'User not found'));
    }

    return res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return next(createError(500, error.message));
  }
};

module.exports = {
  SignUp,
  SignIn,
  GetLoggedInUser,
  forgetPasswordStepOne,
  forgetPasswordStepTwo,
  resetPassword,
  logout,
  GetUserByID,
  GetAllUsers,
  EditUser,
  DeleteUser,
};
