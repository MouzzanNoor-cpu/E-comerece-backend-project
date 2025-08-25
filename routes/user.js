const express = require('express');
const {
  SignUp,
  SignIn,
  GetLoggedInUser,
  GetUserByID,
  forgetPasswordStepOne,
  forgetPasswordStepTwo,
  resetPassword,
  logout,
  GetAllUsers,
  EditUser,
  DeleteUser
} = require('../controllers/user');

const { auth } = require('../Middleware/auth');
const checkAdmin = require('../Middleware/checkAdmin');

const router = express.Router();

// Public routes
router.post('/signup', SignUp);
router.post('/signin', SignIn); // lowercase 'signin' for consistency
router.get('/signin/:userId', GetLoggedInUser);
router.get('/user/:id', GetUserByID); // renamed for clarity

// Forget password flow
router.post('/forget-password/send-email', forgetPasswordStepOne);
router.post('/forget-password/verify-code', forgetPasswordStepTwo);
router.post('/forget-password/reset-password', resetPassword); // no :userId param, user identified by email in body or token

// Authenticated routes
router.post('/logout', logout);

// Admin protected routes
router.get('/users', auth, checkAdmin, GetAllUsers);
router.delete('/user/:id', auth, checkAdmin, DeleteUser);
router.put('/user/:id', auth, checkAdmin, EditUser);

module.exports = router;
