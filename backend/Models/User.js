const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

// Configuration
const SALT_WORK_FACTOR = 10;
const PASSWORD_MIN_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const BONUS_CONFIG = {
  BONUS_EXPIRY_DAYS: 30,
  SPECIAL_BONUS_EXPIRY_DAYS: 7,
  FIRST_DEPOSIT_BONUS_RATE: 0.03,
  SPECIAL_BONUS_RATE: 1.5,
  WAGERING_REQUIREMENT: 30,
  DEPOSIT_WAGERING_REQUIREMENT: 3,
  MINIMUM_REMAINING_WAGER: 1,
  WITHDRAWAL_COMMISSION_RATE: 0.2,
  NEW_USER_ACCOUNT_AGE_DAYS: 3,
  MIN_DEPOSIT_AMOUNT: 100,
  MAX_DEPOSIT_AMOUNT: 30000,
  MIN_WITHDRAWAL_AMOUNT: 300,
  MAX_WITHDRAWALS_PER_DAY: 3,
  DAILY_WITHDRAWAL_LIMIT: 50000
};

// Level configuration
const LEVEL_CONFIG = {
  BRONZE: { name: 'Bronze', threshold: 0, bonus: 0 },
  SILVER: { name: 'Silver', threshold: 10000, bonus: 50 },
  GOLD: { name: 'Gold', threshold: 50000, bonus: 100 },
  PLATINUM: { name: 'Platinum', threshold: 200000, bonus: 500 },
  DIAMOND: { name: 'Diamond', threshold: 1000000, bonus: 1000 }
};

// Bonus Activity Log Schema
const bonusActivitySchema = new Schema({
    bonusType: {
        type: String,
        required: true
    },
    bonusAmount: {
        type: Number,
        required: true
    },
    depositAmount: {
        type: Number,
        required: true
    },
    activatedAt: {
        type: Date,
        default: Date.now
    },
    cancelledAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        default: 'active'
    }
});

// User Schema
const UserSchema = new Schema({
    // ========== BASIC INFORMATION ==========
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        minlength: 4,
        trim: true,
        match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores']
    },
    password: {
        type: String,
        required: function() { return !this.isOneClickUser; },
        select: false,
        minlength: PASSWORD_MIN_LENGTH
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10,15}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },
    avatar: {
        type: String,
        default: "https://images.5943920202.com//TCG_PROD_IMAGES/B2C/01_PROFILE/PROFILE/0.png"
    },
    clickId:{
        type: String,
    },

    // ========== ACCOUNT INFORMATION ==========
    player_id: {
        type: String,
        required: true,
        unique: true
    },
    isOneClickUser: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['user', 'agent', 'admin', 'super_admin'],
        default: "user"
    },
    status: {
        type: String,
        enum: ['active', 'banned', 'deactivated', 'pending'],
        default: 'active'
    },
   
    language: {
        type: String,
        enum: ['en', 'bn', 'hi', 'ar'],
        default: 'bn'
    },
    first_login: {
        type: Boolean,
        default: true
    },
    last_login: {
        type: Date
    },
    login_count: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
  affiliateCode: {
        type: String,
        default: ""
    },
    // ========== FINANCIAL INFORMATION ==========
    currency: {
        type: String,
        default: "BDT"
    },
    balance: {
        type: Number,
        default: 10
    },
    bonusBalance: {
        type: Number,
        default: 0,
        min: 0
    },
    total_deposit: {
        type: Number,
        default: 0,
        min: 0
    },
    total_withdraw: {
        type: Number,
        default: 0,
        min: 0
    },
    total_bet: {
        type: Number,
        default: 0,
        min: 0
    },
    total_wins: {
        type: Number,
        default: 0,
        min: 0
    },
    total_loss: {
        type: Number,
        default: 0,
        min: 0
    },
    net_profit: {
        type: Number,
        default: 0
    },
      depositamount:{
      type: Number,
           default: 0,
    },
    waigeringneed:{
       type: Number,
           default: 0,
    },
    lifetime_deposit: {
        type: Number,
        default: 0
    },
    lifetime_withdraw: {
        type: Number,
        default: 0
    },
    lifetime_bet: {
        type: Number,
        default: 0
    },
    totalWagered: {
        type: Number,
        default: 0
    },
     weeklybetamount:{
        type: Number,
        default: 0
    },
     monthlybetamount:{
        type: Number,
        default: 0
    },
    waigergamecategory: {
    type: [String],
    default: []
    },
    dailyWithdrawalLimit: {
        type: Number,
        default: BONUS_CONFIG.DAILY_WITHDRAWAL_LIMIT
    },
    withdrawalCountToday: {
        type: Number,
        default: 0
    },
    lastWithdrawalDate: {
        type: Date
    },
    reason: {
        type: String,
        default: "BDT"
    },
    withdrawalBanned: {
        type: Boolean,
        default: false
    },
    withdrawalBanReason: {
        type: String,
        default: ""
    },
    withdrawalBanDate: {
        type: Date,
        default: null
    },
    withdrawalUnbanDate: {
        type: Date,
        default: null
    },
dateOfBirth:{
     type: Date,
        default: null
},
    // ========== SIMPLE RATING & NOTES ==========
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    notes: [{
        note: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        createdBy: {
            type: String,
            default: "Admin"
        }
    }],
    // ========== BONUS INFORMATION ==========
    levelInfo: {
        currentLevel: {
            name: {
                type: String,
                default: 'Bronze'
            },
            threshold: {
                type: Number,
                default: 0
            },
            achievedAt: {
                type: Date,
                default: Date.now
            }
        },
        levelUpBonuses: [{
            levelName: String,
            levelThreshold: Number,
            bonusAmount: Number,
            claimedAt: Date,
            status: {
                type: String,
                enum: ['available', 'claimed'],
                default: 'available'
            }
        }],
        lifetimeLevels: [{
            levelName: String,
            achievedAt: Date,
            bonusClaimed: Boolean
        }]
    },
    bonusInfo: {
        firstDepositBonusClaimed: {
            type: Boolean,
            default: false
        },
        activeBonuses: [{
            bonusType: {
                type: String,
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            originalAmount: {
                type: Number,
                required: true
            },
            wageringRequirement: {
                type: Number,
                required: true,
                default: BONUS_CONFIG.WAGERING_REQUIREMENT
            },
            wageringTarget: {
                type: Number,
                default: 0
            },
            depositAmount: {
                type: Number,
                default: 0
            },
            amountWagered: {
                type: Number,
                default: 0
            },
            createdAt: {
                type: Date,
                default: Date.now
            },
            expiresAt: {
                type: Date,
                default: function() {
                    const date = new Date();
                    date.setDate(date.getDate() + BONUS_CONFIG.BONUS_EXPIRY_DAYS);
                    return date;
                }
            },
            status: {
                type: String,
                enum: ['active', 'completed', 'expired', 'cancelled'],
                default: 'active'
            },
            addedToMainBalance: {
                type: Boolean,
                default: false
            }
        }],
        bonusWageringTotal: {
            type: Number,
            default: 0
        },
        cancelledBonuses: [{
            bonusType: String,
            amount: Number,
            penaltyApplied: Number,
            cancelledAt: Date
        }]
    },
    weeklyBonus: {
        totalBet: { type: Number, default: 0 },
        bonusAmount: { type: Number, default: 0 },
        lastClaimed: { type: Date },
        nextAvailable: { type: Date },
        status: {
            type: String,
            enum: ['available', 'claimed', 'expired'],
            default: 'expired'
        }
    },
    monthlyBonus: {
        totalBet: { type: Number, default: 0 },
        bonusAmount: { type: Number, default: 0 },
        lastClaimed: { type: Date },
        nextAvailable: { type: Date },
        status: {
            type: String,
            enum: ['available', 'claimed', 'expired'],
            default: 'expired'
        }
    },
    bonusHistory: [{
        type: { type: String},
        amount: Number,
        totalBet: Number,
        claimedAt: { type: Date, default: Date.now },
        status: { type: String }
    }],

    // ========== SECURITY ==========
    transactionPassword: {
        type: String,
    },
    moneyTransferPassword: {
        type: String,
        select: false
    },
    isMoneyTransferPasswordSet: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiresAt: Date,
        purpose: String,
        verified: { type: Boolean, default: false }
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: String,
    passwordHistory: [{
        password: String,
        changedAt: Date
    }],
    lastPasswordChange: Date,

    // ========== ACTIVITY TRACKING ==========
    loginHistory: [{
        ipAddress: String,
        device: String,
        userAgent: String,
        location: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    deviceTokens: [{
        token: String,
        deviceType: String,
        lastUsed: Date
    }],

    // ========== PREFERENCES ==========
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        push: { type: Boolean, default: true }
    },
    themePreference: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'dark'
    },

    // ========== VERIFICATION ==========
    // ========== VERIFICATION ==========
isEmailVerified: {
    type: Boolean,
    default: false
},
kycStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected',"Not Started"],
    default: 'unverified'
},
kycSubmitted: {  // <-- NEW FIELD: Tracks if KYC has been submitted
    type: Boolean,
    default: false
},
kycCompleted: {  // <-- NEW FIELD: Tracks if KYC is fully completed
    type: Boolean,
    default: false
},
// ========== KYC VERIFICATION ==========
kycVerifications: [{
    sessionId: String,
    workflowId: String,
    sessionToken: String,
    verificationUrl: String,
    status: {
        type: String,
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: Date,
    verifiedAt: Date,
    rejectedAt: Date,
    webhookType: String,
    decision: Schema.Types.Mixed, // Store the entire decision object
    metadata: Schema.Types.Mixed, // Store metadata from webhook
    callbackData: Schema.Types.Mixed, // Raw callback data
    verificationDetails: {
        aml_screenings: Schema.Types.Mixed,
        face_matches: Schema.Types.Mixed,
        id_verifications: Schema.Types.Mixed,
        ip_analyses: Schema.Types.Mixed,
        liveness_checks: Schema.Types.Mixed,
        reviews: Schema.Types.Mixed
    }
}],
kycResubmissionCount: {
    type: Number,
    default: 0,
    min: 0
},
kycSubmissionHistory: [{
    submittedAt: Date,
    status: String,
    decision: Schema.Types.Mixed,
    sessionId: String
}],
kycDocuments: [{
    documentType: String,
    frontImage: String,
    backImage: String,
    status: String,
    submittedAt: Date,
    verifiedAt: Date
}],
kycRejectedCount: {  // <-- NEW FIELD: Counts how many times KYC was rejected
    type: Number,
    default: 0,
    min: 0
},
kycRejections: [{  // <-- NEW FIELD: Stores rejection history
    rejectedAt: {
        type: Date,
        default: Date.now
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reason: String,
    previousStatus: String
}],
// ========== KYC PERSONAL INFORMATION ==========
kycInfo: {
    fullLegalName: {
        type: String,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function(v) {
                // Ensure user is at least 18 years old
                const today = new Date();
                const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                return v <= minAgeDate;
            },
            message: 'You must be at least 18 years old'
        }
    },
    voterIdNumber: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[A-Za-z0-9]{10,20}$/.test(v);
            },
            message: 'Please enter a valid Voter ID number'
        }
    },
    nationality: {
        type: String,
        default: 'Bangladeshi'
    },
    permanentAddress: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        district: String,
        postalCode: String
    },
    presentAddress: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        district: String,
        postalCode: String
    },
    isSameAsPermanent: {
        type: Boolean,
        default: false
    },
    submittedAt: {
        type: Date
    },
    verifiedAt: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String
    }
},
// ========== EMAIL VERIFICATION OTP ==========
emailVerificationOTP: {
    code: String,
    expiresAt: Date,
    attempts: {
        type: Number,
        default: 0,
        max: 5
    },
    lastSentAt: Date
},
    isPhoneVerified: {
        type: Boolean,
        default: false
    },

    // ========== REFERRAL SYSTEM ==========
    referralCode: {
        type: String,
        unique: true,
        sparse: true
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    
    referralEarnings: {
        type: Number,
        default: 0
    },
    referralCount: {
        type: Number,
        default: 0
    },
    referralUsers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        earnedAmount: {
            type: Number,
            default: 0
        }
    }],
    referralTracking: [{
        referralCodeUsed: String,
        referredUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    referralDebt: {
        type: Number,
        default: 0,
        min: 0
    },

    // ========== TRANSACTION HISTORIES ==========
    betHistory: [{
        betAmount: { type: Number, required: true },
        betResult: { type: String, required: true },
        transaction_id: { type: String, required: true },
        game_id: { type: String, required: true },
        bet_time: { type: Date, required: true },
        status: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
    }],
    profitLossHistory: [{
        type: { type: String, enum: ['profit', 'loss'], required: true },
        amount: Number,
        reason: String,
        date: { type: Date, default: Date.now }
    }],
depositHistory: [{
    method: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: BONUS_CONFIG.MIN_DEPOSIT_AMOUNT
    },
    status: { 
        type: String, 
        enum: ['pending', 'completed', 'failed', 'cancelled'], 
        default: 'pending' 
    },
    transactionId: String,
    bonusApplied: {
        type: Boolean,
        default: false
    },
    bonusType: {
        type: String,
        default: 'none'
    },
    bonusAmount: {
        type: Number,
        default: 0
    },
    bonusCode: {
        type: String,
        default: ''
    },
    // NEW: Bonus ID for dynamic bonuses
    bonusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bonus',
        default: null
    },
    // NEW: Balance type for bonuses
    balanceType: {
        type: String,
        enum: ['bonus_balance', 'cash_balance'],
        default: 'bonus_balance'
    },
    // NEW: Bonus name for display
    bonusName: {
        type: String,
        default: ''
    },
    // NEW: Bonus percentage
    bonusPercentage: {
        type: Number,
        default: 0
    },
    // NEW: Maximum bonus amount
    bonusMaxAmount: {
        type: Number,
        default: null
    },
    wageringRequirement: {
        type: Number,
        default: 0
    },
    // NEW: Game category for bonus validation
    gameCategory: {
        type: String,
        default: null
    },
    // NEW: Track if bonus was added to main balance
    bonusAddedToMainBalance: {
        type: Boolean,
        default: false
    },
    orderId: String,
    paymentUrl: String,
    paymentId: String,
    externalPaymentId: String,
    userIdentifyAddress: String,
    playerbalance: Number,
    processedAt: Date,
    completedAt: Date,
    waigergamecategory: {
        type: [String],
        default: []
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
}],
    withdrawHistory: [{
        method: {
            type: String,
            enum: ['bkash', 'nagad', 'rocket', 'bank'],
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: BONUS_CONFIG.MIN_WITHDRAWAL_AMOUNT
        },
        netAmount: {
            type: Number,
            required: true
        },
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'rejected', 'cancelled'],
            default: 'pending'
        },
        accountNumber: {
            type: String,
            required: true
        },
        transactionId: String,
        orderId: String,
        bonusCancelled: {
            type: Boolean,
            default: false
        },
        bonusPenalty: {
            type: Number,
            default: 0
        },
        commissionApplied: {
            type: Boolean,
            default: false
        },
        commissionAmount: {
            type: Number,
            default: 0
        },
        processedAt: Date,
        completedAt: Date,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    transactionHistory: [{
        type: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        balanceBefore: {
            type: Number,
        },
        balanceAfter: {
            type: Number,
        },
        description: String,
        referenceId: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    bonusActivityLogs: [bonusActivitySchema]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.transactionPassword;
            delete ret.moneyTransferPassword;
            delete ret.twoFactorSecret;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpires;
            delete ret.otp;
            delete ret.passwordHistory;
            return ret;
        }
    }
});

// ========== VIRTUALS ==========
UserSchema.virtual('formattedBalance').get(function() {
    return this.balance;
});

UserSchema.virtual('accountAgeInDays').get(function() {
    return Math.floor((new Date() - new Date(this.createdAt)) / (1000 * 60 * 60 * 24));
});

UserSchema.virtual('isNewUser').get(function() {
    return this.accountAgeInDays < BONUS_CONFIG.NEW_USER_ACCOUNT_AGE_DAYS;
});

UserSchema.virtual('availableBalance').get(function() {
    let available = this.balance || 0;
    if (this.bonusBalance > 0) return 0;
    return available;
});

UserSchema.virtual('withdrawableAmount').get(function() {
    let amount = this.balance || 0;
    
    if (this.bonusBalance > 0) return 0;
    
    const requiredWager = this.total_deposit * BONUS_CONFIG.DEPOSIT_WAGERING_REQUIREMENT;
    const completedWager = this.totalWagered || 0;
    const remainingWager = Math.max(0, requiredWager - completedWager);
    const minRequired = this.total_deposit * BONUS_CONFIG.MINIMUM_REMAINING_WAGER;
    
    if (remainingWager > minRequired) {
        return amount * (1 - BONUS_CONFIG.WITHDRAWAL_COMMISSION_RATE);
    }
    
    return amount;
});

UserSchema.virtual('wageringStatus').get(function() {
    const required = this.total_deposit * BONUS_CONFIG.DEPOSIT_WAGERING_REQUIREMENT;
    const completed = this.totalWagered || 0;
    const remaining = Math.max(0, required - completed);
    const minRequired = this.total_deposit * BONUS_CONFIG.MINIMUM_REMAINING_WAGER;
    
    return {
        required,
        completed,
        remaining,
        minRequired,
        isCompleted: remaining <= minRequired,
        commissionRate: remaining > minRequired ? BONUS_CONFIG.WITHDRAWAL_COMMISSION_RATE : 0
    };
});

// ========== PRE-SAVE HOOKS ==========
UserSchema.pre('save', async function(next) {
    if (!this.player_id) {
        this.player_id = 'PL' + Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    if (!this.referralCode) {
        this.referralCode = 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase();
    }

    // if (this.isModified('password')) {
    //     const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    //     this.password = await bcrypt.hash(this.password, salt);
        
    //     if (this.passwordHistory) {
    //         this.passwordHistory.push({
    //             password: this.password,
    //             changedAt: new Date()
    //         });
    //     } else {
    //         this.passwordHistory = [{
    //             password: this.password,
    //             changedAt: new Date()
    //         }];
    //     }
        
    //     if (this.passwordHistory.length > 5) {
    //         this.passwordHistory = this.passwordHistory.slice(-5);
    //     }
        
    //     this.lastPasswordChange = new Date();
    // }

    if (this.isModified('lastWithdrawalDate')) {
        const today = new Date().toDateString();
        const lastWithdrawalDay = this.lastWithdrawalDate ? new Date(this.lastWithdrawalDate).toDateString() : null;
        
        if (!lastWithdrawalDay || today !== lastWithdrawalDay) {
            this.withdrawalCountToday = 0;
        }
    }
    next();
});

// ========== WITHDRAWAL METHODS ==========
UserSchema.methods.canWithdraw = function(amount) {
    if (this.bonusBalance > 0) {
        return {
            canWithdraw: false,
            reason: "Active bonus balance must be cleared first"
        };
    }
    
    if (amount > this.balance) {
        return {
            canWithdraw: false,
            reason: "Insufficient balance"
        };
    }
    
    const status = this.wageringStatus;
    
    if (status.remaining > status.minRequired) {
        return {
            canWithdraw: true,
            reason: "Withdrawal allowed with 20% commission",
            commission: amount * BONUS_CONFIG.WITHDRAWAL_COMMISSION_RATE,
            netAmount: amount * (1 - BONUS_CONFIG.WITHDRAWAL_COMMISSION_RATE)
        };
    }
    
    return {
        canWithdraw: true,
        reason: "Withdrawal allowed",
        commission: 0,
        netAmount: amount
    };
};

// ========== BONUS SYSTEM METHODS ==========
UserSchema.methods.isEligibleForFirstDepositBonus = function() {
    return !this.bonusInfo.firstDepositBonusClaimed && this.total_deposit === 0;
};

UserSchema.methods.isEligibleForSpecialBonus = function() {
    const isNewUser = this.accountAgeInDays < BONUS_CONFIG.NEW_USER_ACCOUNT_AGE_DAYS;
    const hasNoActiveBonuses = this.bonusInfo.activeBonuses.length === 0;
    return isNewUser && hasNoActiveBonuses && (this.total_deposit === 0 || this.total_deposit < BONUS_CONFIG.MAX_DEPOSIT_AMOUNT);
};

UserSchema.methods.calculateBonusAmount = function(depositAmount, bonusType) {
    if (bonusType === 'first_deposit') {
        return depositAmount * BONUS_CONFIG.FIRST_DEPOSIT_BONUS_RATE;
    } else if (bonusType === 'special_bonus') {
        return depositAmount * BONUS_CONFIG.SPECIAL_BONUS_RATE;
    }
    return 0;
};

UserSchema.methods.getAvailableBonusOffers = function() {
    const offers = [];
    
    if (this.isEligibleForFirstDepositBonus()) {
        offers.push({
            type: 'first_deposit',
            name: 'First Deposit Bonus (3%)',
            description: 'Get 3% extra bonus on your first deposit',
            rate: BONUS_CONFIG.FIRST_DEPOSIT_BONUS_RATE
        });
    }
    
    if (this.isEligibleForSpecialBonus()) {
        offers.push({
            type: 'special_bonus',
            name: 'Special 150% Bonus',
            description: 'Get 150% bonus with 30x wagering requirement',
            rate: BONUS_CONFIG.SPECIAL_BONUS_RATE,
            wageringRequirement: BONUS_CONFIG.WAGERING_REQUIREMENT
        });
    }
    
    return offers;
};

// ========== DEPOSIT METHODS ==========
UserSchema.methods.createDeposit = async function({ method, amount, bonusType = 'none' }) {
    if (amount < BONUS_CONFIG.MIN_DEPOSIT_AMOUNT || amount > BONUS_CONFIG.MAX_DEPOSIT_AMOUNT) {
        throw new Error(`Deposit amount must be between ${BONUS_CONFIG.MIN_DEPOSIT_AMOUNT} and ${BONUS_CONFIG.MAX_DEPOSIT_AMOUNT} BDT`);
    }

    if (bonusType !== 'none') {
        if (bonusType === 'first_deposit' && !this.isEligibleForFirstDepositBonus()) {
            throw new Error('Not eligible for first deposit bonus');
        }
        if (bonusType === 'special_bonus' && !this.isEligibleForSpecialBonus()) {
            throw new Error('Not eligible for special bonus');
        }
    }

    const deposit = {
        method,
        amount,
        status: 'pending',
        bonusType,
        orderId: `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    this.depositHistory.push(deposit);
    await this.save();
    return deposit;
};

UserSchema.methods.completeDeposit = async function(orderId, transactionId) {
    const deposit = this.depositHistory.find(d => d.orderId === orderId && d.status === 'pending');
    
    if (!deposit) {
        throw new Error('Pending deposit not found');
    }

    let bonusAmount = 0;
    let addToMainBalance = false;
    
    if (deposit.bonusType !== 'none') {
        bonusAmount = this.calculateBonusAmount(deposit.amount, deposit.bonusType);
        addToMainBalance = deposit.bonusType === 'first_deposit';
    }

    deposit.status = 'completed';
    deposit.transactionId = transactionId;
    deposit.completedAt = new Date();
    deposit.bonusAmount = bonusAmount;
    deposit.bonusApplied = bonusAmount > 0;

    // this.balance += deposit.amount;
    this.total_deposit += deposit.amount;

    if (bonusAmount > 0) {
        const isSpecial = deposit.bonusType === 'special_bonus';
        const expiryDays = isSpecial ? BONUS_CONFIG.SPECIAL_BONUS_EXPIRY_DAYS : BONUS_CONFIG.BONUS_EXPIRY_DAYS;
        const expiresAt = new Date(new Date().getTime() + expiryDays * 24 * 60 * 60 * 1000);
        
        const multiplier = isSpecial ? 30 : 1; // For first_deposit, minimal wagering, adjust as needed
        const wageringTarget = deposit.amount * multiplier;

        this.bonusInfo.activeBonuses.push({
            bonusType: deposit.bonusType,
            amount: bonusAmount,
            originalAmount: bonusAmount,
            wageringRequirement: multiplier,
            wageringTarget: wageringTarget,
            depositAmount: deposit.amount,
            amountWagered: 0,
            createdAt: new Date(),
            expiresAt: expiresAt,
            status: 'active',
            addedToMainBalance: addToMainBalance
        });

        if (addToMainBalance) {
            this.balance += bonusAmount;
        } else {
            this.bonusBalance += bonusAmount;
        }

        // Log bonus activity
        this.bonusActivityLogs.push({
            bonusType: deposit.bonusType,
            bonusAmount: bonusAmount,
            depositAmount: deposit.amount,
            activatedAt: new Date()
        });

        if (deposit.bonusType === 'first_deposit' && !this.bonusInfo.firstDepositBonusClaimed) {
            this.bonusInfo.firstDepositBonusClaimed = true;
        }
    }

    this.transactionHistory.push({
        type: 'deposit',
        amount: deposit.amount,
        balanceBefore: this.balance - deposit.amount,
        balanceAfter: this.balance,
        description: `Deposit via ${deposit.method}`,
        referenceId: transactionId
    });

    await this.save();
    return deposit;
};

// ========== BONUS WAGERING METHODS ==========
UserSchema.methods.handleExpiredBonuses = async function() {
    let changed = false;

    for (let i = this.bonusInfo.activeBonuses.length - 1; i >= 0; i--) {
        const bonus = this.bonusInfo.activeBonuses[i];
        if (bonus.status === 'active' && new Date() > bonus.expiresAt) {
            changed = true;
            const cancelledAmount = bonus.amount;
            bonus.status = 'expired';

            if (!bonus.addedToMainBalance) {
                this.bonusBalance -= cancelledAmount;
            }

            this.bonusInfo.cancelledBonuses.push({
                bonusType: bonus.bonusType,
                amount: cancelledAmount,
                penaltyApplied: 0,
                cancelledAt: new Date()
            });

            this.bonusActivityLogs.push({
                bonusType: bonus.bonusType,
                bonusAmount: cancelledAmount,
                depositAmount: bonus.depositAmount,
                cancelledAt: new Date(),
                status: 'expired'
            });

            this.transactionHistory.push({
                type: 'bonus_expired',
                amount: -cancelledAmount,
                balanceBefore: this.balance,
                balanceAfter: this.balance,
                description: `Bonus expired: ${bonus.bonusType}`,
                referenceId: `EXP-${Date.now()}`,
                createdAt: new Date()
            });
        }
    }

    this.bonusInfo.activeBonuses = this.bonusInfo.activeBonuses.filter(b => b.status === 'active');

    if (changed) {
        await this.save();
    }
};

UserSchema.methods.applyBetToWagering = async function(amount) {
    await this.handleExpiredBonuses();

    this.totalWagered += amount;
    // this.total_bet += amount;

    let changed = false;
};

UserSchema.methods.cancelBonusWithPenalty = async function() {
    if (this.bonusBalance <= 0) {
        throw new Error('No active bonus to cancel');
    }

    const penaltyAmount = this.bonusBalance * 1.5;
    
    if (this.balance < penaltyAmount) {
        throw new Error('Insufficient balance to pay penalty');
    }

    this.balance -= penaltyAmount;
    
    // Cancel the bonus and log the activity
    const cancelledBonus = this.bonusInfo.activeBonuses.map(bonus => {
        bonus.status = 'cancelled';
        this.bonusActivityLogs.push({
            bonusType: bonus.bonusType,
            bonusAmount: bonus.amount,
            depositAmount: bonus.originalAmount,
            activatedAt: bonus.createdAt,
            cancelledAt: new Date(),
            status: 'cancelled'
        });
        return bonus;
    });

    this.bonusBalance = 0;
    
    this.transactionHistory.push({
        type: 'penalty',
        amount: penaltyAmount,
        balanceBefore: this.balance + penaltyAmount,
        balanceAfter: this.balance,
        description: 'Bonus cancellation penalty',
        referenceId: `PEN-${Date.now()}`
    });

    await this.save();
    return penaltyAmount;
};

// ========== REFERRAL BONUS METHOD ==========
UserSchema.methods.applyReferralBonus = async function(depositAmount, session) {
    if (!this.referredBy) return { applied: false, referralBonus: 0 };

    const referrer = await this.model('User').findById(this.referredBy).session(session);
    if (!referrer) {
        console.warn(`Referrer not found for user ${this._id}`);
        return { applied: false, referralBonus: 0 };
    }

    // Calculate referral bonus: (Total Deposit - Total Withdrawal - Current Balance) × 25%
    const netLoss = (this.total_deposit + depositAmount) - this.total_withdraw - this.balance;
    const referralBonus = Math.round(netLoss * 0.25 * 100) / 100; // Round to 2 decimal places

    if (Math.abs(referralBonus) < 0.01) {
        return { applied: false, referralBonus: 0 }; // Skip tiny bonuses
    }

    const referrerBalanceBefore = referrer.balance;
    let debt = 0;

    if (referralBonus > 0) {
        // Positive bonus: credit referrer
        referrer.balance += referralBonus;
        referrer.referralEarnings += referralBonus;
    } else if (referrer.balance >= Math.abs(referralBonus)) {
        // Negative bonus: deduct from referrer
        referrer.balance += referralBonus; // referralBonus is negative
        referrer.referralEarnings += referralBonus;
    } else {
        // Insufficient balance: set to 0 and track debt
        debt = Math.abs(referralBonus) - referrer.balance;
        referrer.referralEarnings -= referrer.balance;
        referrer.balance = 0;
        referrer.referralDebt = (referrer.referralDebt || 0) + debt;
    }

    // Update referral tracking
    const referralUserIndex = referrer.referralUsers.findIndex(
        ref => ref.user && ref.user.toString() === this._id.toString()
    );

    if (referralUserIndex !== -1) {
        referrer.referralUsers[referralUserIndex].earnedAmount += referralBonus;
    } else {
        referrer.referralUsers.push({
            user: this._id,
            joinedAt: new Date(),
            earnedAmount: referralBonus
        });
    }

    // Log transaction for referrer
    referrer.transactionHistory.push({
        type: referralBonus > 0 ? 'bonus' : 'penalty',
        amount: Math.abs(referralBonus),
        balanceBefore: referrerBalanceBefore,
        balanceAfter: referrer.balance,
        description: referralBonus > 0
            ? `Referral bonus from ${this.username}'s deposit (25% of net loss)`
            : `Referral penalty from ${this.username}'s activity (25% of net gain)`,
        referenceId: `REF-${Date.now()}`,
        createdAt: new Date()
    });

    // Log transaction for referred user
    this.transactionHistory.push({
        type: 'bonus',
        amount: 0,
        balanceBefore: this.balance,
        balanceAfter: this.balance,
        description: referralBonus > 0
            ? `Your activity generated referral bonus for ${referrer.username}`
            : `Your activity resulted in referral penalty for ${referrer.username}`,
        referenceId: `REF-${Date.now()}`,
        createdAt: new Date()
    });

    return { applied: true, referralBonus, debt };
};

// ========== STATIC METHODS ==========
UserSchema.statics.oneClickRegister = async function(username) {
    const existingUser = await this.findOne({ username });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    return this.create({
        username,
        isOneClickUser: true,
        player_id: 'PL' + Math.random().toString(36).substr(2, 8).toUpperCase()
    });
};

UserSchema.statics.findByCredentials = async function(username, password) {
    const user = await this.findOne({ username }).select('+password');
    if (!user) {
        throw new Error('Invalid login credentials');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error('Invalid login credentials');
    }

    return user;
};

UserSchema.statics.findByEmailOrPhone = async function(emailOrPhone) {
    return this.findOne({
        $or: [
            { email: emailOrPhone },
            { phone: emailOrPhone }
        ]
    });
};

// // Weekly bonus calculation and check
// UserSchema.methods.calculateWeeklyBonus = function() {
//     const now = new Date();
//     const lastSunday = new Date(now);
//     lastSunday.setDate(now.getDate() - now.getDay()); // Set to last Sunday
//     lastSunday.setHours(0, 0, 0, 0);
    
//     // Check if we're in a new week and reset if needed
//     if (!this.weeklyBonus.lastClaimed || this.weeklyBonus.lastClaimed < lastSunday) {
//         this.weeklyBonus.totalBet = 0;
//         this.weeklyBonus.bonusAmount = 0;
//         this.weeklyBonus.status = 'expired';
//     }
    
//     // Calculate bonus based on total bet (0.5%)
//     const bonusAmount = this.weeklyBonus.totalBet * 0.005;
//     this.weeklyBonus.bonusAmount = bonusAmount;
    
//     // Set next available date (next Sunday)
//     const nextSunday = new Date(lastSunday);
//     nextSunday.setDate(lastSunday.getDate() + 7);
//     this.weeklyBonus.nextAvailable = nextSunday;
    
//     return bonusAmount;
// };

// // Monthly bonus calculation and check
// UserSchema.methods.calculateMonthlyBonus = function() {
//     const now = new Date();
//     const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
//     // Check if we're in a new month and reset if needed
//     if (!this.monthlyBonus.lastClaimed || this.monthlyBonus.lastClaimed < firstDayOfMonth) {
//         this.monthlyBonus.totalBet = 0;
//         this.monthlyBonus.bonusAmount = 0;
//         this.monthlyBonus.status = 'expired';
//     }
    
//     // Calculate bonus based on total bet (0.2%)
//     const bonusAmount = this.monthlyBonus.totalBet * 0.002;
//     this.monthlyBonus.bonusAmount = bonusAmount;
    
//     // Set next available date (first day of next month)
//     const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
//     this.monthlyBonus.nextAvailable = firstDayNextMonth;
    
//     return bonusAmount;
// };

// // Check if bonus is available
// UserSchema.methods.checkBonusAvailability = function() {
//     const now = new Date();
    
//     // Weekly bonus check
//     if (this.weeklyBonus.nextAvailable && now >= this.weeklyBonus.nextAvailable) {
//         this.weeklyBonus.status = 'available';
//     }
    
//     // Monthly bonus check
//     if (this.monthlyBonus.nextAvailable && now >= this.monthlyBonus.nextAvailable) {
//         this.monthlyBonus.status = 'available';
//     }
    
//     return {
//         weekly: this.weeklyBonus.status === 'available',
//         monthly: this.monthlyBonus.status === 'available'
//     };
// };
// Updated Weekly Bonus calculation and check
UserSchema.methods.calculateWeeklyBonus = function() {
    const now = new Date();
    
    // Get next Tuesday
    const getNextTuesday = () => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday, etc.
        
        let daysUntilTuesday;
        if (dayOfWeek <= 2) {
            daysUntilTuesday = 2 - dayOfWeek;
        } else {
            daysUntilTuesday = 2 + (7 - dayOfWeek);
        }
        
        const nextTuesday = new Date(today);
        nextTuesday.setDate(today.getDate() + daysUntilTuesday);
        nextTuesday.setHours(0, 0, 0, 0);
        return nextTuesday;
    };

    // Check if we're in a new week and reset if needed
    const nextTuesday = getNextTuesday();
    if (!this.weeklyBonus.lastClaimed || this.weeklyBonus.lastClaimed < new Date(nextTuesday - 7 * 24 * 60 * 60 * 1000)) {
        this.weeklyBonus.totalBet = 0;
        this.weeklyBonus.bonusAmount = 0;
        this.weeklyBonus.status = 'expired';
    }
    
    // Calculate bonus based on total bet (0.5%)
    const bonusAmount = this.weeklyBonus.totalBet * 0.005;
    this.weeklyBonus.bonusAmount = bonusAmount;
    
    // Set next available date (next Tuesday)
    this.weeklyBonus.nextAvailable = nextTuesday;
    
    return bonusAmount;
};

// Updated Monthly Bonus calculation and check
UserSchema.methods.calculateMonthlyBonus = function() {
    const now = new Date();
    
    // Get next 4th day of month
    const getNext4thDay = () => {
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        let next4thDay;
        
        if (currentDay < 4) {
            next4thDay = new Date(currentYear, currentMonth, 4);
        } else {
            next4thDay = new Date(currentYear, currentMonth + 1, 4);
        }
        
        next4thDay.setHours(0, 0, 0, 0);
        return next4thDay;
    };

    // Check if we're in a new month and reset if needed
    const next4thDay = getNext4thDay();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (!this.monthlyBonus.lastClaimed || this.monthlyBonus.lastClaimed < firstDayOfMonth) {
        this.monthlyBonus.totalBet = 0;
        this.monthlyBonus.bonusAmount = 0;
        this.monthlyBonus.status = 'expired';
    }
    
    // Calculate bonus based on total bet (0.2%)
    const bonusAmount = this.monthlyBonus.totalBet * 0.002;
    this.monthlyBonus.bonusAmount = bonusAmount;
    
    // Set next available date (next 4th day of month)
    this.monthlyBonus.nextAvailable = next4thDay;
    
    return bonusAmount;
};
// ========== EMAIL VERIFICATION METHODS ==========

// Generate email verification OTP
UserSchema.methods.generateEmailVerificationOTP = function() {
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    this.emailVerificationOTP = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
        attempts: 0,
        lastSentAt: new Date()
    };
    
    return otp;
};

// Verify email OTP
UserSchema.methods.verifyEmailOTP = function(otpCode) {
    const otp = this.emailVerificationOTP;
    
    // Check if OTP exists
    if (!otp || !otp.code) {
        return { success: false, message: "No OTP found. Please request a new one." };
    }
    
    // Check if OTP is expired
    if (new Date() > new Date(otp.expiresAt)) {
        return { success: false, message: "OTP has expired. Please request a new one." };
    }
    
    // Check max attempts
    if (otp.attempts >= 5) {
        return { success: false, message: "Too many failed attempts. Please request a new OTP." };
    }
    
    // Verify OTP
    if (otp.code !== otpCode) {
        // Increment attempts
        this.emailVerificationOTP.attempts += 1;
        return { 
            success: false, 
            message: "Invalid OTP code. Please try again.",
            attemptsRemaining: 5 - this.emailVerificationOTP.attempts 
        };
    }
    
    // OTP is valid
    this.isEmailVerified = true;
    this.emailVerificationOTP = {}; // Clear OTP after successful verification
    
    return { success: true, message: "Email verified successfully!" };
};

// Check if email verification OTP is valid
UserSchema.methods.isEmailVerificationOTPValid = function() {
    const otp = this.emailVerificationOTP;
    
    if (!otp || !otp.code) {
        return false;
    }
    
    // Check if OTP is expired
    if (new Date() > new Date(otp.expiresAt)) {
        return false;
    }
    
    // Check max attempts
    if (otp.attempts >= 5) {
        return false;
    }
    
    return true;
};

// Resend email verification OTP
UserSchema.methods.resendEmailVerificationOTP = function() {
    // Check if we can resend (minimum 60 seconds between requests)
    const lastSent = this.emailVerificationOTP?.lastSentAt;
    const now = new Date();
    
    if (lastSent && (now - new Date(lastSent)) < 60000) {
        return { 
            success: false, 
            message: "Please wait 60 seconds before requesting a new OTP" 
        };
    }
    
    const otp = this.generateEmailVerificationOTP();
    return { success: true, otp: otp };
};
// Updated Check if bonus is available
UserSchema.methods.checkBonusAvailability = function() {
    const now = new Date();
    
    // Weekly bonus check - available every Tuesday
    const isTuesday = now.getDay() === 2; // 2 = Tuesday
    
    if (isTuesday && this.weeklyBonus.totalBet > 0) {
        this.weeklyBonus.status = 'available';
    } else {
        this.weeklyBonus.status = 'expired';
    }
    
    // Monthly bonus check - available every 4th day of month
    const is4thDay = now.getDate() === 4;
    
    if (is4thDay && this.monthlyBonus.totalBet > 0) {
        this.monthlyBonus.status = 'available';
    } else {
        this.monthlyBonus.status = 'expired';
    }
    
    return {
        weekly: this.weeklyBonus.status === 'available',
        monthly: this.monthlyBonus.status === 'available'
    };
};

// Claim weekly bonus
UserSchema.methods.claimWeeklyBonus = async function() {
    if (this.weeklyBonus.status !== 'available') {
        throw new Error('Weekly bonus is not available');
    }
    
    const bonusAmount = this.weeklyBonus.bonusAmount;
    this.balance += bonusAmount;
    this.weeklyBonus.status = 'claimed';
    this.weeklyBonus.lastClaimed = new Date();
    
    // Add to bonus history
    this.bonusHistory.push({
        type: 'weekly',
        amount: bonusAmount,
        totalBet: this.weeklyBonus.totalBet,
        claimedAt: new Date(),
        status: 'claimed'
    });
    
    // Add transaction record
    this.transactionHistory.push({
        type: 'bonus',
        amount: bonusAmount,
        balanceBefore: this.balance - bonusAmount,
        balanceAfter: this.balance,
        description: 'Weekly bonus claim',
        referenceId: `WB-${Date.now()}`,
        createdAt: new Date()
    });
    
    await this.save();
    return bonusAmount;
};

// Claim monthly bonus
UserSchema.methods.claimMonthlyBonus = async function() {
    if (this.monthlyBonus.status !== 'available') {
        throw new Error('Monthly bonus is not available');
    }
    
    const bonusAmount = this.monthlyBonus.bonusAmount;
    this.balance += bonusAmount;
    this.monthlyBonus.status = 'claimed';
    this.monthlyBonus.lastClaimed = new Date();
    
    // Add to bonus history
    this.bonusHistory.push({
        type: 'monthly',
        amount: bonusAmount,
        totalBet: this.monthlyBonus.totalBet,
        claimedAt: new Date(),
        status: 'claimed'
    });
    
    // Add transaction record
    this.transactionHistory.push({
        type: 'bonus',
        amount: bonusAmount,
        balanceBefore: this.balance - bonusAmount,
        balanceAfter: this.balance,
        description: 'Monthly bonus claim',
        referenceId: `MB-${Date.now()}`,
        createdAt: new Date()
    });
    
    await this.save();
    return bonusAmount;
};

// Calculate user's current level and check for level ups
UserSchema.methods.calculateCurrentLevel = function() {
    const lifetimeDeposit = this.lifetime_bet || 0;
    
    let currentLevel = LEVEL_CONFIG.BRONZE;
    let nextLevel = LEVEL_CONFIG.SILVER;
    
    // Find current level based on lifetime deposit
    const levels = Object.values(LEVEL_CONFIG);
    for (let i = levels.length - 1; i >= 0; i--) {
        if (lifetimeDeposit >= levels[i].threshold) {
            currentLevel = levels[i];
            nextLevel = i < levels.length - 1 ? levels[i + 1] : null;
            break;
        }
    }
    
    return {
        currentLevel,
        nextLevel,
        lifetimeDeposit,
        progressPercentage: nextLevel ?
            Math.min(100, Math.round(((lifetimeDeposit - currentLevel.threshold) /
                (nextLevel.threshold - currentLevel.threshold)) * 100)) : 100
    };
};

// Check for level ups and add available bonuses
UserSchema.methods.checkLevelUp = function() {
    const levelData = this.calculateCurrentLevel();
    const currentLevelName = levelData.currentLevel.name;
    
    // Check if user has leveled up
    if (this.levelInfo.currentLevel.name !== currentLevelName) {
        // User has leveled up!
        const previousLevel = this.levelInfo.currentLevel;
        
        // Update current level
        this.levelInfo.currentLevel = {
            name: currentLevelName,
            threshold: levelData.currentLevel.threshold,
            achievedAt: new Date()
        };
        
        // Add level to lifetime levels
        this.levelInfo.lifetimeLevels.push({
            levelName: currentLevelName,
            achievedAt: new Date(),
            bonusClaimed: false
        });
        
        // Add level up bonus if available
        if (levelData.currentLevel.bonus > 0) {
            this.levelInfo.levelUpBonuses.push({
                levelName: currentLevelName,
                levelThreshold: levelData.currentLevel.threshold,
                bonusAmount: levelData.currentLevel.bonus,
                status: 'available'
            });
        }
        
        return {
            leveledUp: true,
            fromLevel: previousLevel.name,
            toLevel: currentLevelName,
            bonusAvailable: levelData.currentLevel.bonus > 0,
            bonusAmount: levelData.currentLevel.bonus
        };
    }
    
    return { leveledUp: false };
};

// Claim level up bonus
UserSchema.methods.claimLevelUpBonus = async function(levelName) {
    const bonusIndex = this.levelInfo.levelUpBonuses.findIndex(
        bonus => bonus.levelName === levelName && bonus.status === 'available'
    );
    
    if (bonusIndex === -1) {
        throw new Error('No available bonus found for this level');
    }
    
    const bonus = this.levelInfo.levelUpBonuses[bonusIndex];
    
    // Add bonus to balance
    this.balance += bonus.bonusAmount;
    
    // Update bonus status
    this.levelInfo.levelUpBonuses[bonusIndex].status = 'claimed';
    this.levelInfo.levelUpBonuses[bonusIndex].claimedAt = new Date();
    
    // Update lifetime levels record
    const levelIndex = this.levelInfo.lifetimeLevels.findIndex(
        level => level.levelName === levelName && !level.bonusClaimed
    );
    if (levelIndex !== -1) {
        this.levelInfo.lifetimeLevels[levelIndex].bonusClaimed = true;
    }
    
    // Add transaction record
    this.transactionHistory.push({
        type: 'bonus',
        amount: bonus.bonusAmount,
        balanceBefore: this.balance - bonus.bonusAmount,
        balanceAfter: this.balance,
        description: `Level up bonus - ${levelName} level`,
        referenceId: `LEVELBONUS-${Date.now()}`,
        createdAt: new Date()
    });
    
    await this.save();
    
    return {
        level: levelName,
        bonusAmount: bonus.bonusAmount,
        newBalance: this.balance
    };
};

// Get available level up bonuses
UserSchema.methods.getAvailableLevelBonuses = function() {
    return this.levelInfo.levelUpBonuses.filter(bonus => bonus.status === 'available');
};
// ========== KYC METHODS ==========

// Add a new KYC verification session
UserSchema.methods.addKYCVerification = function(sessionData) {
    if (!this.kycVerifications) {
        this.kycVerifications = [];
    }
    
    const verification = {
        sessionId: sessionData.session_id,
        workflowId: sessionData.workflow_id,
        sessionToken: sessionData.session_token,
        verificationUrl: sessionData.url || `https://verify.didit.me/session/${sessionData.session_token}`,
        status: 'unverified',
        createdAt: new Date(),
        ...sessionData
    };
    
    this.kycVerifications.push(verification);
    this.kycStatus = 'unverified';
    this.kycSubmitted = true;
    
    return verification;
};

// Update KYC verification status from webhook
UserSchema.methods.updateKYCVerification = function(sessionId, webhookData) {
    const verification = this.kycVerifications.find(v => v.sessionId === sessionId);
    
    if (!verification) {
        throw new Error('Verification session not found');
    }
    
    // Update verification
    verification.status = webhookData.status || webhookData.decision?.status || 'processing';
    verification.updatedAt = new Date();
    verification.webhookType = webhookData.webhook_type;
    verification.decision = webhookData.decision;
    verification.metadata = webhookData.metadata;
    verification.callbackData = webhookData;
    
    // Store verification details
    if (webhookData.decision) {
        verification.verificationDetails = {
            aml_screenings: webhookData.decision.aml_screenings,
            face_matches: webhookData.decision.face_matches,
            id_verifications: webhookData.decision.id_verifications,
            ip_analyses: webhookData.decision.ip_analyses,
            liveness_checks: webhookData.decision.liveness_checks,
            reviews: webhookData.decision.reviews
        };
    }
    
    // Update user KYC status based on decision
    if (verification.status === 'Approved' || webhookData.status === 'Approved') {
        this.kycStatus = 'verified';
        this.kycCompleted = true;
        verification.verifiedAt = new Date();
        this.kycInfo = this.kycInfo || {};
        this.kycInfo.verifiedAt = new Date();
        this.kycInfo.verificationMethod = 'didit';
        this.kycInfo.verificationDetails = verification.verificationDetails;
        
        // Add to submission history
        this.kycSubmissionHistory.push({
            submittedAt: verification.createdAt,
            status: 'verified',
            decision: webhookData.decision,
            sessionId: sessionId
        });
    } 
    else if (verification.status === 'Rejected' || webhookData.status === 'Rejected') {
        this.kycStatus = 'rejected';
        verification.rejectedAt = new Date();
        this.kycInfo = this.kycInfo || {};
        this.kycInfo.rejectionReason = webhookData.decision?.rejectionReason || 'Verification rejected';
        this.kycRejectedCount = (this.kycRejectedCount || 0) + 1;
        
        // Track rejection
        this.kycRejections = this.kycRejections || [];
        this.kycRejections.push({
            rejectedAt: new Date(),
            sessionId: sessionId,
            reason: webhookData.decision?.rejectionReason || 'Verification rejected',
            previousStatus: this.kycStatus
        });
        
        // Add to submission history
        this.kycSubmissionHistory.push({
            submittedAt: verification.createdAt,
            status: 'rejected',
            decision: webhookData.decision,
            sessionId: sessionId
        });
    }
    
    return verification;
};

// Check if user can resubmit KYC
UserSchema.methods.canResubmitKYC = function() {
    if (this.kycStatus === 'verified') {
        return { canResubmit: false, reason: 'KYC is already verified' };
    }
    
    if (this.kycRejectedCount >= 3) {
        return { 
            canResubmit: false, 
            reason: 'Maximum rejection limit reached. Please contact support.',
            maxReached: true 
        };
    }
    
    return { canResubmit: true };
};

// Get latest KYC verification
UserSchema.methods.getLatestKYCVerification = function() {
    if (!this.kycVerifications || this.kycVerifications.length === 0) {
        return null;
    }
    
    return this.kycVerifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
};

// Check KYC status
UserSchema.methods.getKYCStatus = function() {
    const latestVerification = this.getLatestKYCVerification();
    
    return {
        kycStatus: this.kycStatus,
        emailVerified: this.isEmailVerified,
        kycSubmitted: this.kycSubmitted,
        kycCompleted: this.kycCompleted,
        kycRejectedCount: this.kycRejectedCount || 0,
        kycResubmissionCount: this.kycResubmissionCount || 0,
        latestVerification: latestVerification ? {
            sessionId: latestVerification.sessionId,
            status: latestVerification.status,
            createdAt: latestVerification.createdAt,
            updatedAt: latestVerification.updatedAt
        } : null,
        canSubmitKYC: this.isEmailVerified && (this.kycStatus === 'unverified' || (this.kycStatus === 'rejected' && this.kycRejectedCount < 3)),
        remainingAttempts: Math.max(0, 3 - (this.kycRejectedCount || 0))
    };
};
// Password verification method
UserSchema.methods.verifyPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};
// Add this method to your UserSchema
UserSchema.methods.verifyTransactionPassword = async function(password) {
    if (!this.transactionPassword) {
        return false;
    }
    return await bcrypt.compare(password, this.transactionPassword);
};
const User = mongoose.model('User', UserSchema);
module.exports = User;

