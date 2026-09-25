const nodemailer = require('nodemailer');

async function testEmail() {
  console.log('🧪 Testing email configuration...\n');
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'biruk5063@gmail.com',
        pass: process.env.EMAIL_PASSWORD || 'awzfvaggjbqnotee'
      }
    });
    
    // Test the connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send a test email
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'biruk5063@gmail.com',
      to: 'biruk5063@gmail.com',
      subject: 'HEWN Archive Email Test',
      text: 'This is a test email from your HEWN Archive system. Email configuration is working correctly!',
      html: '<p>This is a test email from your HEWN Archive system. Email configuration is working correctly!</p>'
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Error details:', error);
  }
}

require('dotenv').config();
testEmail();