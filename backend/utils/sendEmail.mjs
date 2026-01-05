import nodemailer from 'nodemailer';

const sendEmail = async (to, subject, text) => {
  let transporter;

  // Use Ethereal test email in development if SMTP not configured
  if (process.env.SMTP_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  } else {
    // Fallback to Ethereal test account for development
    console.log('📧 Using Ethereal test email (SMTP not configured in .env)');
    
    // Create test account (in production, would use pre-created credentials)
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.warn('⚠️  Failed to create Ethereal test account, using mock transporter');
      // Fallback: just mock the send without actual email
      transporter = {
        sendMail: async (opts) => {
          console.log('📧 Mock email sent to:', opts.to);
          console.log('   Subject:', opts.subject);
          return { messageId: 'mock-' + Date.now() };
        }
      };
    }
  }

  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@momentvibe.test',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
    if (process.env.NODE_ENV === 'development' && info.messageUrl) {
      console.log('📧 Email preview URL:', info.messageUrl);
    }
    return { success: true, info };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    // Non-blocking in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️  Email failed but continuing (dev mode)');
      return { success: false, error: error.message };
    }
    throw new Error('Error sending email');
  }
};

export default sendEmail;