const mongoose = require('mongoose');

const bonusSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  bonusCode: {
    type: String,
    uppercase: true,
    trim: true
  },
  bonusType: {
    type: String,
    enum: ['welcome', 'deposit', 'reload', 'cashback', 'free_spin', 'special', 'manual'],
    default: 'deposit'
  },
  // NEW: Balance distribution type
  balanceType: {
    type: String,
    enum: ['bonus_balance', 'cash_balance'],
    default: 'bonus_balance'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  percentage: {
    type: Number,
    min: 0,
    default: 0
  },
  minDeposit: {
    type: Number,
    default: 0
  },
  maxBonus: {
    type: Number,
    default: null
  },
  wageringRequirement: {
    type: Number,
    default: 0
  },
  // UPDATED: Validity with infinite option
  validityType: {
    type: String,
    enum: ['days', 'hours', 'infinite'],
    default: 'days'
  },
  validityValue: {
    type: Number,
    min: 0,
    default: 30
  },
  // NEW: For backward compatibility
  validityDays: {
    type: Number,
    default: 30
  },
  // NEW: Games category field
  gamesCategory: [{
    type: String,
    default: ['all']
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active'
  },
  // NEW: Bonus distribution type
  distributionType: {
    type: String,
    enum: ['public', 'private', 'single_user'],
    default: 'public'
  },
  // NEW: For single-user bonuses
  assignedUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'claimed', 'expired', 'cancelled'],
      default: 'pending'
    },
    claimedAt: Date,
    // UPDATED: Individual user validity
    userValidityType: {
      type: String,
      enum: ['days', 'hours', 'infinite', 'inherit'],
      default: 'inherit'
    },
    userValidityValue: {
      type: Number,
      min: 0,
      default: null
    },
    expiresAt: Date,
    notes: String
  }],
  // NEW: Maximum number of users who can claim this bonus
  maxClaims: {
    type: Number,
    default: null
  },
  // NEW: Track claims count
  claimCount: {
    type: Number,
    default: 0
  },
  // NEW: Is bonus reusable by same user
  reusable: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for bonus code and distribution type
bonusSchema.index({ bonusCode: 1, distributionType: 1 });

// Generate bonus code if not provided and not single_user type
bonusSchema.pre('save', function(next) {
  if (!this.bonusCode && this.distributionType !== 'single_user') {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.bonusCode = code;
  }
  next();
});

// Helper method to calculate expiry date
bonusSchema.methods.calculateExpiry = function(claimedAt = new Date()) {
  if (this.validityType === 'infinite') {
    return null; // No expiry
  }
  
  const expiryDate = new Date(claimedAt);
  
  if (this.validityType === 'days') {
    expiryDate.setDate(expiryDate.getDate() + this.validityValue);
  } else if (this.validityType === 'hours') {
    expiryDate.setHours(expiryDate.getHours() + this.validityValue);
  }
  
  return expiryDate;
};

// Helper method to check if bonus is expired for a user
bonusSchema.methods.isExpiredForUser = function(userId) {
  if (this.validityType === 'infinite') {
    return false;
  }
  
  const userAssignment = this.assignedUsers.find(
    assignment => assignment.userId.toString() === userId.toString()
  );
  
  if (!userAssignment || !userAssignment.claimedAt) {
    return false; // Not claimed yet
  }
  
  if (userAssignment.expiresAt) {
    return new Date() > userAssignment.expiresAt;
  }
  
  // Calculate expiry if not stored
  const expiryDate = this.calculateExpiry(userAssignment.claimedAt);
  return expiryDate ? new Date() > expiryDate : false;
};

// Virtual for backward compatibility
bonusSchema.virtual('expiryDate').get(function() {
  if (this.validityType === 'infinite') return null;
  return this.calculateExpiry();
});

const Bonus = mongoose.model('Bonus', bonusSchema);

module.exports = Bonus;