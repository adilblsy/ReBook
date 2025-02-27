const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require('crypto');

const router = express.Router();

// In-memory OTP store (consider using Redis in production)
const otpStore = {};

// Email sending function (assuming you've set up the transporter in server.js)
async function sendVerificationEmail(email, otp) {
  try {
    // Get the transporter from the app
    const transporter = req.app.get('emailTransporter');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your ReBook Verification Code',
      html: `<h1>ReBook Email Verification</h1>
             <p>Your verification code is: <strong>${otp}</strong></p>
             <p>This code will expire in 15 minutes.</p>`
    };
    
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, whatsapp, password } = req.body;

  if (!email.endsWith("@rit.ac.in")) {
    return res
      .status(400)
      .json({ message: "Only college emails are allowed!" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new User({ 
      name, 
      email, 
      whatsapp, 
      password: hashedPassword,
      isVerified: false 
    });
    
    await user.save();
    
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (15 minutes)
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000
    };
    
    // Send verification email using the transporter available via app.locals
    const transporter = req.app.locals.emailTransporter;
    
    if (transporter) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your ReBook Verification Code',
          html: `<h1>ReBook Email Verification</h1>
                 <p>Your verification code is: <strong>${otp}</strong></p>
                 <p>This code will expire in 15 minutes.</p>`
        };
        
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Continue even if email sending fails
      }
    } else {
      console.error('Email transporter not available');
    }
    
    res.status(201).json({ 
      message: "User registered successfully", 
      requiresVerification: true,
      testOtp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: "Error registering user" });
  }
});


// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    
    // Check if user is verified (optional - you can allow login before verification)
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: "Email not verified", 
        requiresVerification: true 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: "Server error" });
  }
});

// Verify OTP Route
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }
  
  try {
    // Check if OTP exists and is valid
    const otpData = otpStore[email];
    
    if (!otpData) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }
    
    if (Date.now() > otpData.expiresAt) {
      // Clean up expired OTP
      delete otpStore[email];
      return res.status(400).json({ message: "OTP has expired" });
    }
    
    if (otpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    
    // OTP is valid, clean up
    delete otpStore[email];
    
    // Mark user as verified
    await User.findOneAndUpdate({ email }, { isVerified: true });
    
    // Generate a token for automatic login
    const user = await User.findOne({ email });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    
    return res.status(200).json({ 
      message: "Email verified successfully",
      token,
      userId: user._id
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Resend OTP Route
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes
    };
    
    // Send email
    const transporter = req.app.locals.emailTransporter;
    
    if (transporter) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Your ReBook Verification Code',
          html: `<h1>ReBook Email Verification</h1>
                 <p>Your verification code is: <strong>${otp}</strong></p>
                 <p>This code will expire in 15 minutes.</p>`
        };
        
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({ 
          message: "OTP sent successfully",
          testOtp: process.env.NODE_ENV === 'development' ? otp : undefined
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        return res.status(500).json({ message: "Failed to send OTP" });
      }
    } else {
      console.error('Email transporter not available');
      return res.status(500).json({ message: "Email service unavailable" });
    }
  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;