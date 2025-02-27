const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");

const router = express.Router();

// In-memory OTP store (consider using Redis in production)
const otpStore = {};

// Email sending function (properly defined to work with req parameter)
async function sendVerificationEmail(req, email, otp) {
  try {
    // Get the transporter from app.locals
    const transporter = req.app.locals.emailTransporter;

    if (!transporter) {
      console.error("Email transporter not available");
      return false;
    }

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your ReBook Verification Code",
      html: `<h1>ReBook Email Verification</h1>
             <p>Your verification code is: <strong>${otp}</strong></p>
             <p>This code will expire in 15 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
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
      isVerified: false,
    });

    await user.save();

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP with expiration (15 minutes)
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000,
    };

    // Use the helper function to send email
    const emailSent = await sendVerificationEmail(req, email, otp);

    res.status(201).json({
      message: "User registered successfully",
      requiresVerification: true,
      testOtp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (err) {
    console.error("Registration error:", err);
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
        requiresVerification: true,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Login error:", err);
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
      userId: user._id,
    });
  } catch (error) {
    console.error("OTP verification error:", error);
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
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    // Use the helper function to send email
    const emailSent = await sendVerificationEmail(req, email, otp);

    if (emailSent) {
      return res.status(200).json({
        message: "OTP sent successfully",
        testOtp: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    } else {
      return res.status(500).json({ message: "Failed to send OTP" });
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Send Reset Link (OTP) - ADD THIS ROUTE!
router.post("/send-reset-link", async (req, res) => {
  console.log("Received password reset request:", req.body); // Debugging log
  
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
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    };
    
    // Send email with OTP
    const emailSent = await sendVerificationEmail(req, email, otp);
    
    if (emailSent) {
      return res.status(200).json({
        message: "Password reset OTP sent successfully",
        testOtp: process.env.NODE_ENV === "development" ? otp : undefined,
      });
    } else {
      return res.status(500).json({ message: "Failed to send password reset OTP" });
    }
  } catch (error) {
    console.error("Send reset link error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

// Reset Password - Verify OTP & Update Password - FIX THIS ROUTE!
router.post("/reset-password", async (req, res) => {
  console.log("Received password reset request:", req.body); // Debugging log

  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    console.log("Missing required fields");
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    console.log(`Checking OTP for email: ${email}`);
    const otpData = otpStore[email];

    if (!otpData) {
      console.log("OTP not found or expired");
      return res.status(400).json({
        message: "OTP not found or expired. Please request a new one."
      });
    }

    if (Date.now() > otpData.expiresAt) {
      console.log("OTP expired");
      delete otpStore[email];
      return res.status(400).json({ 
        message: "OTP has expired. Please request a new one." 
      });
    }

    if (otpData.otp !== otp) {
      console.log("Invalid OTP entered");
      return res.status(400).json({ message: "Invalid OTP" });
    }

    delete otpStore[email]; // OTP is valid, remove it

    console.log("Finding user...");
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    console.log("Hashing new password...");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log("Password reset successful");
    return res.status(200).json({ 
      message: "Password reset successfully. Please log in." 
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update user details route
router.post("/update-details", async (req, res) => {
  const { userId, mobileNumber, newPassword } = req.body;
  
  // Validate inputs
  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }
  
  // Make sure at least one field to update is provided
  if (!mobileNumber && !newPassword) {
    return res.status(400).json({ message: "At least one field to update is required" });
  }
  
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Create update object
    const updateObj = {};
    
    // Update mobile number if provided
    if (mobileNumber) {
      updateObj.whatsapp = mobileNumber;
    }
    
    // Update password if provided
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateObj.password = hashedPassword;
    }
    
    // Update the user
    await User.findByIdAndUpdate(userId, updateObj);
    
    return res.status(200).json({ message: "Details updated successfully" });
  } catch (error) {
    console.error("Update details error:", error);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;