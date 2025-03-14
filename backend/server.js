require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');
const multer = require('multer'); // Add multer for file uploads
const cloudinary = require('cloudinary').v2; // Add Cloudinary

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Serve static files (if needed)
app.use(express.static(path.join(__dirname, 'public')));

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to ReBook Database'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Email Transporter Setup
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Email credentials missing. Please set EMAIL_USER and EMAIL_PASS.');
} else {
  const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  emailTransporter.verify((error, success) => {
    if (error) {
      console.error('❌ Email transporter error:', error);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });

  // Make transporter available to routes
  app.locals.emailTransporter = emailTransporter;
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// OTP Store (Temporary)
const otpStore = {};

// Send OTP Route
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expiresAt: Date.now() + 15 * 60 * 1000 };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your ReBook Verification Code',
      html: `<h1>ReBook Email Verification</h1>
             <p>Your verification code is: <strong>${otp}</strong></p>
             <p>This code will expire in 15 minutes.</p>`
    };

    await app.locals.emailTransporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Verify OTP Route
app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const otpData = otpStore[email];

    if (!otpData) {
      return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
    }

    if (Date.now() > otpData.expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    delete otpStore[email];

    // Assuming you have a User model
    await User.findOneAndUpdate({ email }, { isVerified: true });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Serve index.html for frontend routes (excluding API routes)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌐 Visit http://localhost:${PORT} to access the application`);
});