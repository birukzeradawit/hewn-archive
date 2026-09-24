const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Send email verification
async function sendVerificationEmail(email, username, verificationToken) {
  const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: `"HEWN Tech" <${process.env.EMAIL_USER || 'noreply@hewntech.com'}>`,
    to: email,
    subject: 'Verify Your HEWN Tech Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b4513 0%, #654321 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">HEWN Tech</h1>
          <p style="color: #f0efe9; margin: 10px 0 0;">Heritage, Knowledge, Technology</p>
        </div>
        <div style="background: #faf8f5; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #d4c4a8;">
          <h2 style="color: #2c2c2e;">Welcome to HEWN Tech, ${username}!</h2>
          <p style="color: #6e6e73;">Thank you for creating an account. Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #8e8e93; font-size: 14px;">This link will expire in 24 hours.</p>
          <p style="color: #6e6e73;">If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #d4c4a8; margin: 30px 0;">
          <p style="color: #8e8e93; font-size: 12px;">© 2024 HEWN Tech. All rights reserved.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log('Verification email sent to:', email);
}

// Send password reset email
async function sendPasswordResetEmail(email, resetToken) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"HEWN Tech" <${process.env.EMAIL_USER || 'noreply@hewntech.com'}>`,
    to: email,
    subject: 'Reset Your HEWN Tech Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #8b4513 0%, #654321 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">HEWN Tech</h1>
          <p style="color: #f0efe9; margin: 10px 0 0;">Heritage, Knowledge, Technology</p>
        </div>
        <div style="background: #faf8f5; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #d4c4a8;">
          <h2 style="color: #2c2c2e;">Password Reset Request</h2>
          <p style="color: #6e6e73;">We received a request to reset your password. Click the button below to reset it:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #8b4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #8e8e93; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #6e6e73;">If you didn't request a password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #d4c4a8; margin: 30px 0;">
          <p style="color: #8e8e93; font-size: 12px;">© 2024 HEWN Tech. All rights reserved.</p>
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log('Password reset email sent to:', email);
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  transporter
};