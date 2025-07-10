const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error('Gmail services connection failed:', error);
  } else {
    console.log('Gmail configured properly and ready to send emails');
  }
});

const sendOtpToEmail = async (email, otp) => {
  try {
    if (!email || !otp) {
      throw new Error('Email and OTP are required');
    }

    const html = `
      <div style="font-family: Arial, sans-serif; background: #f0f8ff; padding: 30px 0;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          <tr>
            <td align="center" style="padding: 20px 30px 10px 30px;">
              <img src="https://res.cloudinary.com/dumnhwuld/image/upload/logotag2_iyi7s7.png" alt="LinkUp Logo" style="width: 280px; height: auto; margin-bottom: 10px;" />
              <h2 style="color: #0077b6; margin: 10px 0 0;">OTP Verification</h2>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 30px;">
              <p style="font-size: 16px; color: #333; margin: 0;">Hi there,</p>
              <p style="font-size: 16px; color: #333;">Your one-time password (OTP) to verify your LinkUp account is:</p>
              <div style="background: #caf0f8; color: #03045e; padding: 15px 30px; display: inline-block; border-radius: 8px; font-size: 24px; letter-spacing: 4px; font-weight: bold; margin: 20px 0;">
                ${otp}
              </div>
              <p style="font-size: 15px; color: #555;"><strong>This OTP is valid for the next 5 minutes.</strong> Please do not share this code with anyone.</p>
              <p style="font-size: 15px; color: #555;">If you didn't request this OTP, please ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 30px;">
              <p style="margin: 0; font-size: 15px; color: #333;">Thanks & Regards,<br/>LinkUp Security Team</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="border-top: 1px solid #ddd; padding: 20px;">
              <small style="color: #999;">This is an automated message. Please do not reply.</small>
            </td>
          </tr>
        </table>
      </div>
    `;

    const mailOptions = {
      from: `"LinkUp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your LinkUp Verification Code',
      html: html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    return {
      success: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send OTP email: ${error.message}`);
  }
};

module.exports = { sendOtpToEmail };
