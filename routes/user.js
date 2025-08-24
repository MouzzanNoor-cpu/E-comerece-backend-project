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

router.post('/signup', SignUp);
router.post('/signIn', SignIn);
router.get('/signIn/:userId', GetLoggedInUser);
router.get('/signInbyid/:id', GetUserByID);

router.post('/forget-password/send-email', forgetPasswordStepOne);
router.post('/forget-password/verify-code', forgetPasswordStepTwo);
router.post('/forget-password/reset-password/:userId', auth, resetPassword);
router.post('/logout', logout);

router.get('/usersall', auth, checkAdmin, GetAllUsers);
router.delete('/userdelete/:id', auth, checkAdmin, DeleteUser);
router.put('/useredit/:id', auth, checkAdmin, EditUser);

module.exports = router;
