const express = require("express");
const Affiliateauth = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Affiliateuser = require("../Models/Affiliateuser");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_here";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "30d";

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: "support@genzz.casino",
        pass: "ohko fimw bite vvnp",
  }
});

// Helper functions
const isValidBangladeshiPhone = (phone) => /^01[3-9]\d{8}$/.test(phone);
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Generate 6-digit OTP
const generateOTP = () => crypto.randomInt(100000, 999999).toString();

// Send OTP Email
const sendOTPEmail = async (email, name, otp) => {
  try {
    const mailOptions = {
      from:"support@genzz.casino",
      to: email,
      subject: 'Your OTP for Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Email Verification</h2>
          <p>Hello ${name},</p>
          <p>Your OTP for email verification is:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes. Please do not share this code with anyone.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Your Affiliate Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};

// Register Route
Affiliateauth.post("/register", async (req, res) => {
  try {
    const { fullName, email, phone, password, confirmPassword, paymentMethod, paymentDetails } = req.body;

    // Validation
    if (!fullName || !email || !phone || !password || !confirmPassword || !paymentMethod || !paymentDetails) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (!isValidBangladeshiPhone(phone)) {
      return res.status(400).json({ success: false, message: "Invalid Bangladeshi phone number" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const existingUser = await Affiliateuser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Create new user
    const newUser = new AffiliateUser({
      fullName,
      email,
      phone,
      password,
      paymentMethod,
      paymentDetails
    });

    // Generate and save OTP
    const otp = generateOTP();
    newUser.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      verified: false
    };

    await newUser.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, fullName, otp);
    } catch (error) {
      console.error("OTP email failed:", error);
      // Continue even if email fails
    }

    // Generate token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Response data
    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      balance: newUser.balance,
      referralCode: newUser.referralCode,
      isVerified: newUser.isVerified
    };

    res.status(201).json({
      success: true,
      message: "Registration successful. Please check your email for verification OTP.",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, message: "Server error during registration" });
  }
});

// Request OTP Route
Affiliateauth.post("/request-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await AffiliateUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if OTP attempts exceeded
    if (user.otpBlockExpires && user.otpBlockExpires > Date.now()) {
      const remainingTime = Math.ceil((user.otpBlockExpires - Date.now()) / (1000 * 60));
      return res.status(429).json({ 
        success: false, 
        message: `Too many OTP attempts. Try again in ${remainingTime} minutes.` 
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      verified: false
    };

    await user.save();

    // Send OTP email
    await sendOTPEmail(email, user.fullName, otp);

    res.json({
      success: true,
      message: "OTP sent to your email"
    });

  } catch (error) {
    console.error("OTP request error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to send OTP" 
    });
  }
});

// Verify OTP Route
Affiliateauth.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await AffiliateUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if OTP attempts exceeded
    if (user.otpBlockExpires && user.otpBlockExpires > Date.now()) {
      const remainingTime = Math.ceil((user.otpBlockExpires - Date.now()) / (1000 * 60));
      return res.status(429).json({ 
        success: false, 
        message: `Too many OTP attempts. Try again in ${remainingTime} minutes.` 
      });
    }

    // Check if OTP exists and not expired
    if (!user.otp || !user.otp.code || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired or not found. Please request a new one." });
    }

    // Verify OTP
    if (user.otp.code !== otp) {
      user.otpAttempts += 1;
      
      // Block after 5 failed attempts for 1 hour
      if (user.otpAttempts >= 5) {
        user.otpBlockExpires = new Date(Date.now() + 60 * 60 * 1000);
      }
      
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    // Mark as verified
    user.otp.verified = true;
    user.isVerified = true;
    user.otpAttempts = 0;
    user.otpBlockExpires = undefined;
    await user.save();
    
    // Generate new token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        balance: user.balance,
        referralCode: user.referralCode,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "OTP verification failed" 
    });
  }
});

// Login Route (unchanged from previous)
Affiliateauth.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await AffiliateUser.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    user.lastLogin = Date.now();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const userResponse = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      balance: user.balance,
      referralCode: user.referralCode,
      isVerified: user.isVerified
    };

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userResponse
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login" });
  }
});


module.exports = Affiliateauth;