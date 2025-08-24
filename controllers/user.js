const jwt = require('jsonwebtoken');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const cart = require('../models/Cart')
const mongoose = require('mongoose');
const express = require('express');
const createError = require('../Utiles/createError');
const salt = bcrypt.genSaltSync(10);
const isProduction = process.env.NODE_ENV === 'production';


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

        const userExists = await User.findOne({ email });
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
            // add other user fields you want to send
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

const forgetPasswordStepOne = async (req, res, next) => {
    const { error } = Joi.object({
        email: Joi.string().email().required()
    }).validate(req.body);

    if (error) return next(createError(400, error.details[0].message));

    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return next(createError(404, 'User not found'));

        const otp = Math.floor(1000 + Math.random() * 9000);
        return res.status(200).json({ success: true, message: "OTP generated successfully", otp });
    } catch (err) {
        return next(err);
    }
};

const forgetPasswordStepTwo = async (req, res, next) => {
    const { error } = Joi.object({
        otp: Joi.number().required(),
    }).validate(req.body);

    if (error) return next(createError(400, error.details[0].message));

    try {
        const { otp } = req.body;
        if (otp) {
            return res.status(200).json({ success: true, message: "OTP verified" });
        } else {
            return next(createError(400, "Wrong OTP"));
        }
    } catch (err) {
        return next(err);
    }
};
const resetPassword = async (req, res, next) => {
    const { error } = Joi.object({
        password: Joi.string().min(3).required(),
        confirmpassword: Joi.string().min(3).valid(Joi.ref('password')).required(),
    }).validate(req.body);

    if (error) {
        return next(createError(400, error.details[0].message));
    }

    try {
        const { password } = req.body;
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const userId = req.params.userId;

        const user = await User.findOneAndUpdate(
            { _id: userId },
            { password: hash },
            { new: true }
        );
        console.log('Updated User:', user);

        if (user) {
            return res.status(200).json({ success: true, message: "Password reset successfully" });
        } else {
            return next(createError(400, "User not found"));
        }
    } catch (err) {
        console.error('Error during password reset:', err.message);
        return next(createError(500, 'An error occurred while resetting the password'));
    }
};


const logout = async (req, res, next) => {
    res.clearCookie("accessToken", {
        sameSite: "none",
        secure: isProduction,
    })
        .status(200)
        .send("User has been logged out.");
};

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
        // Fetch all users from the database
        const users = await User.find();

       
        return res.status(200).json (users);
    } catch (error) {
        // Handle errors and return a 500 response
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
