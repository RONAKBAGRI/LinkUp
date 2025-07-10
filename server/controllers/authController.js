const User = require("../models/user");
const { sendOtpToEmail } = require("../service/emailService");
const otpGenerate = require("../utils/otpGenerator");
const response = require("../utils/responseHandler");
const twilioService = require("../service/twilioService");
const generateToken = require("../utils/generateToken");

// Step-1 Send OTP
const sendOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email } = req.body;
  const otp = otpGenerate();
  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  let user;

  try {
    if (email) {
      user = await User.findOne({ email });
      
      if (!user) {
        user = new User({ email });
      }

      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;
      await user.save();
      await sendOtpToEmail(email, otp);
      return response(res, 200, 'OTP sent to your email', { email });
    }

    if (!phoneNumber || !phoneSuffix) {
      return response(res, 400, 'Phone number and phone suffix are required');
    }

    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
    user = await User.findOne({ phoneNumber: fullPhoneNumber });

    if (!user) {
      user = new User({ phoneNumber: fullPhoneNumber });
    }

    user.phoneOtp = otp;
    user.phoneOtpExpiry = expiry;
    await twilioService.sendOtpToPhoneNumber(fullPhoneNumber);
    await user.save();
    return response(res, 200, 'OTP sent successfully', { phoneNumber: fullPhoneNumber });

  } catch (error) {
    console.error(error);
    return response(res, 500, 'Internal server error');
  }
};

// Step-2 Verify OTP
const verifyOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email, otp } = req.body;

  try {
    let user;
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return response(res, 404, 'User not found');
      }

      const now = new Date();
      if (!user.emailOtp || 
          String(user.emailOtp) !== String(otp) || 
          now > new Date(user.emailOtpExpiry)) {
        return response(res, 400, 'Invalid or expired OTP');
      }

      user.isVerified = true;
      user.emailOtp = null;
      user.emailOtpExpiry = null;
      await user.save();
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, 'Phone number and phone suffix are required');
      }

      const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
      user = await User.findOne({ phoneNumber: fullPhoneNumber });
      if (!user) {
        return response(res, 404, 'User not found');
      }

      const result = await twilioService.verifyOtp(fullPhoneNumber, otp);
      if (result.status !== 'approved') {
        return response(res, 400, 'Invalid OTP');
      }

      user.isVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);
    res.cookie('auth_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
    });

    return response(res, 200, 'OTP verified successfully', { token, user });

  } catch (error) {
    console.error(error);
    return response(res, 500, 'Internal server error');
  }
};

module.exports = {
  sendOtp,
  verifyOtp
};