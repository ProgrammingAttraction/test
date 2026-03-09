const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const withdrawalSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Withdrawal amount is required'],
    min: [500, 'Minimum withdrawal amount is 500'] // Example minimum
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['bkash', 'nagad', 'rocket', 'bank', 'crypto']
  },
  paymentDetails: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'processed'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: Date,
  transactionId: String,
  adminNote: String
});

const referralSchema = new mongoose.Schema({
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateUser',
    required: true
  },
  commissionAmount: {
    type: Number,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 5 // Example multi-level referral (5 levels max)
  },
  earnedAt: {
    type: Date,
    default: Date.now
  }
});

const otpSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  }
});

const AffiliateUserSchema = new mongoose.Schema({
  // Basic Info
  fullName: { 
    type: String, 
    required: [true, 'Full name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^01[3-9]\d{8}$/.test(v);
      },
      message: 'Invalid Bangladeshi phone number'
    }
  },
  password: {
    type: String,
    required: true,
    select: false
  },

  // Payment Info
  paymentMethod: { 
    type: String, 
    required: true,
    enum: ['bkash', 'nagad', 'rocket', 'bank', 'crypto']
  },
  paymentDetails: { 
    type: String, 
    required: true
  },

  // Financials
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  pendingWithdrawal: {
    type: Number,
    default: 0
  },

  // Withdrawals
  withdrawals: [withdrawalSchema],

  // Referral System
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AffiliateUser'
  },
  referrals: [referralSchema],
  referralCount: {
    type: Number,
    default: 0
  },

  // OTP Verification
  otp: otpSchema,
  otpAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  otpBlockExpires: {
    type: Date,
    select: false
  },

  // Account Status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for available balance (balance - pending withdrawals)
AffiliateUserSchema.virtual('availableBalance').get(function() {
  return this.balance - this.pendingWithdrawal;
});

// Pre-save hooks
AffiliateUserSchema.pre('save', async function(next) {
  // Hash password
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }

  // Generate referral code if new user
  if (this.isNew && !this.referralCode) {
    this.referralCode = generateReferralCode(this.fullName);
  }

  this.updatedAt = Date.now();
  next();
});

// Instance methods
AffiliateUserSchema.methods = {
  comparePassword: async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },

  generateAuthToken: function() {
    return jwt.sign(
      { id: this._id, email: this.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  },

  requestWithdrawal: async function(amount, paymentMethod, paymentDetails) {
    if (amount > this.availableBalance) {
      throw new Error('Insufficient balance');
    }

    this.pendingWithdrawal += amount;
    this.withdrawals.push({
      amount,
      paymentMethod,
      paymentDetails,
      status: 'pending'
    });

    await this.save();
    return this;
  },

  generateOTP: async function() {
    // Check if OTP attempts exceeded
    if (this.otpBlockExpires && this.otpBlockExpires > Date.now()) {
      const remainingTime = Math.ceil((this.otpBlockExpires - Date.now()) / (1000 * 60));
      throw new Error(`Too many OTP attempts. Try again in ${remainingTime} minutes.`);
    }

    // Generate 6-digit OTP
    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiration

    this.otp = {
      code: otpCode,
      expiresAt: expiresAt,
      verified: false
    };

    await this.save();
    return otpCode;
  },

  sendOTPEmail: async function() {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'Your App <noreply@yourapp.com>',
      to: this.email,
      subject: 'Your OTP for Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a4a4a;">Email Verification</h2>
          <p>Hello ${this.fullName},</p>
          <p>Your OTP for email verification is:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
            ${this.otp.code}
          </div>
          <p>This OTP will expire in 10 minutes. Please do not share this code with anyone.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Your Affiliate Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
  },

  verifyOTP: async function(otpCode) {
    // Check if OTP attempts exceeded
    if (this.otpBlockExpires && this.otpBlockExpires > Date.now()) {
      const remainingTime = Math.ceil((this.otpBlockExpires - Date.now()) / (1000 * 60));
      throw new Error(`Too many OTP attempts. Try again in ${remainingTime} minutes.`);
    }

    // Check if OTP exists and not expired
    if (!this.otp || !this.otp.code || this.otp.expiresAt < new Date()) {
      throw new Error('OTP expired or not found. Please request a new one.');
    }

    // Verify OTP
    if (this.otp.code !== otpCode) {
      this.otpAttempts += 1;
      
      // Block after 5 failed attempts for 1 hour
      if (this.otpAttempts >= 5) {
        this.otpBlockExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour block
      }
      
      await this.save();
      throw new Error('Invalid OTP code');
    }

    // Mark as verified
    this.otp.verified = true;
    this.isVerified = true;
    this.otpAttempts = 0;
    this.otpBlockExpires = undefined;
    await this.save();
    
    return true;
  }
};

// Static methods
AffiliateUserSchema.statics = {
  findByEmail: function(email) {
    return this.findOne({ email }).select('+password');
  }
};

// Helper function to generate referral code
function generateReferralCode(name) {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${name.substring(0, 3)}${randomNum}`.toUpperCase();
}


module.exports = mongoose.model('AffiliateUser', AffiliateUserSchema);