require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const nodemailer = require('nodemailer');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static files from the public directory (one level back from server.js)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Initialize Email Transporter Early
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Email credentials missing. Please set EMAIL_USER and EMAIL_PASS environment variables.');
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
      console.error('Email transporter error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });

  // Make the transporter available to all routes
  app.locals.emailTransporter = emailTransporter;
}

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to ReBook Database'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Route for the root URL - redirect to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Catch-all route to handle client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});

//Sign Up Page and verification
// Add these to your existing requires at the top of server.js

const crypto = require('crypto');

// Add this middleware setup if you don't already have it
app.use(express.urlencoded({ extended: true }));

// Create a collection to store OTPs (you can also use Redis or another store)
const otpStore = {};

// Add these routes to your existing routes section
app.post('/api/auth/send-otp', async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }
  
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration time (15 minutes)
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000  // 15 minutes from now
    };
    
    // Send email with OTP
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your ReBook Verification Code',
      html: `<h1>ReBook Email Verification</h1>
             <p>Your verification code is: <strong>${otp}</strong></p>
             <p>This code will expire in 15 minutes.</p>`
    };
    
    await transporter.sendMail(mailOptions);
    
    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return res.status(500).json({ message: 'Failed to send OTP' });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }
  
  try {
    // Check if OTP exists and is valid
    const otpData = otpStore[email];
    
    if (!otpData) {
      return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
    }
    
    if (Date.now() > otpData.expiresAt) {
      // Clean up expired OTP
      delete otpStore[email];
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    
    if (otpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP is valid, clean up
    delete otpStore[email];
    
    // Update user account to "verified" status in your database
    // This depends on your User model, but might look like:
    await User.findOneAndUpdate({ email }, { isVerified: true });
    
    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
});

// Add this after your mongoose connection setup
// Email transporter setup
let emailTransporter;
try {
  // Check if environment variables are defined before creating the transporter
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Email credentials missing. Please set EMAIL_USER and EMAIL_PASS environment variables.');
    // You might want to set a flag or use a fallback mechanism here
  } else {
    emailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    // Verify the transporter connection
    emailTransporter.verify(function(error, success) {
      if (error) {
        console.error('Email transporter error:', error);
      } else {
        console.log('Email server is ready to send messages');
      }
    });
    
    // Make transporter available to routes
    app.locals.emailTransporter = emailTransporter;
  }
} catch (err) {
  console.error('Failed to set up email transporter:', err);
}