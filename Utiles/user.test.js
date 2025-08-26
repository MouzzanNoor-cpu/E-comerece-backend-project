const { forgetPasswordStepOne } = require('../controllers/user');
const User = require('../models/User');
const nodemailer = require('nodemailer');

jest.mock('../models/User');
jest.mock('nodemailer');

describe('forgetPasswordStepOne', () => {
  let req, res, next, mockUser, sendMailMock;

  beforeEach(() => {
    req = { body: { email: 'test@example.com' } };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();

    mockUser = {
      email: 'test@example.com',
      save: jest.fn().mockResolvedValue(true)
    };
    User.findOne.mockResolvedValue(mockUser);

    sendMailMock = jest.fn().mockResolvedValue(true);
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
    //require('../controllers/user').transporter = { sendMail: sendMailMock };
  });

  it('should send OTP email if user exists', async () => {
    await forgetPasswordStepOne(req, res, next);

    expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    expect(mockUser.otp).toBeDefined();
    expect(mockUser.otpExpires).toBeDefined();
    expect(mockUser.otpVerified).toBe(false);
    expect(mockUser.save).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, message: "OTP sent to your email." });
  });

  it('should call next with error if user not found', async () => {
    User.findOne.mockResolvedValue(null);
    await forgetPasswordStepOne(req, res, next);

    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.status).toBe(404);
    expect(error.message).toBe('User not found');
  });
});