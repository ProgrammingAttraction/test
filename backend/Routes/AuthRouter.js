const { signup, login, profile_update, adminlogin } = require('../Controllers/AuthController');
const ensureAuthenticated = require('../Middlewares/Auth');
const { signupValidation, loginValidation } = require('../Middlewares/AuthValidation');
const multer = require("multer")
const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require("../Models/User");
const { v4: uuidv4 } = require('uuid');
const admin_model = require('../Models/Adminmodel');
const nodemailer = require("nodemailer");
const geoip = require('geoip-lite'); // For IP geolocation
const useragent=require("useragent");
const LoginHistoryModel = require('../Models/LoginHistoryModel');
const Support = require('../Models/Supportmodel');
const axios=require("axios")
// File upload configuration
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/images")
    },
    filename: function(req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
});
const uploadimage = multer({ storage: storage });

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "support@genzz.casino",
        pass: "otzq xvpe fokg vcbq",
    },
});

// Generate random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Generate random 8-character username
const generateUsername = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let username = '';
    for (let i = 0; i < 8; i++) {
        username += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return username;
};

/**
 * @route POST /auth/login
 * @desc User login with email and password
 */
// router.post('/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Validate input
//         if (!email || !password) {
//             return res.status(400).json({ 
//                 success: false,
//                 message: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন" // Email and password are required
//             });
//         }

//         // Find user by email only
//         const user = await UserModel.findOne({ 
//             email: email,
//             status: "active" 
//         }).select('+password'); // Explicitly select password field

//         if (!user) {
//             return res.status(401).json({ 
//                 success: false,
//                 message: "ইমেইল বা পাসওয়ার্ড ভুল" // Email or password is wrong
//             });
//         }

//         // Check if user is one-click user trying to use password login
//         if (user.isOneClickUser) {
//             return res.status(401).json({
//                 success: false,
//                 message: "এক ক্লিক অ্যাকাউন্ট। দয়া করে এক ক্লিক লগইন ব্যবহার করুন" // One-click account, please use one-click login
//             });
//         }

//         // Verify password exists and is a string
//         if (!user.password || typeof user.password !== 'string') {
//             console.error('Invalid password format for user:', user._id);
//             return res.status(500).json({
//                 success: false,
//                 message: "সিস্টেম ত্রুটি। দয়া পরে আবার চেষ্টা করুন" // System error, please try again
//             });
//         }

//         // Verify password is not empty
//         if (password.trim() === '') {
//             return res.status(400).json({
//                 success: false,
//                 message: "পাসওয়ার্ড প্রয়োজন" // Password is required
//             });
//         }

//         // Verify password
//         const isPassEqual = await bcrypt.compare(password, user.password);
//         if (!isPassEqual) {
//             return res.status(401).json({ 
//                 success: false,
//                 message: "ইমেইল এবং পাসওয়ার্ড মেলেনি" // Email and password didn't match
//             });
//         }

//         // Generate JWT Token
//         const token = jwt.sign(
//             { 
//                 userId: user._id,
//                 email: user.email,
//                 role: user.role 
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         // Track login activity
//         const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//         const geo = geoip.lookup(ip);
//         const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";
        
//         await UserModel.findByIdAndUpdate(user._id, {
//             $push: {
//                 loginHistory: { 
//                     ipAddress: ip, 
//                     device: req.useragent.platform, 
//                     browser: req.useragent.browser,
//                     location 
//                 }
//             },
//             $inc: { login_count: 1 },
//             last_login: new Date()
//         });

//         // Return user data without sensitive information
//         const userData = user.toObject();
//         delete userData.password;
//         delete userData.otp;
//         delete userData.resetPasswordToken;

//         res.status(200).json({
//             success: true,
//             message: "সফলভাবে লগইন করা হয়েছে", // Login successful
//             token,
//             user: userData
//         });

//     } catch (err) {
//         console.error('Login error:', err);
//         res.status(500).json({
//             success: false,
//             message: "সার্ভার সমস্যা হয়েছে" // Server problem
//         });
//     }
// });


/**
 * @route POST /auth/login
 * @desc User login with email and password
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন" // Email and password are required
            });
        }

        // Find user by email only
        const user = await UserModel.findOne({ 
            email: email,
            status: "active" 
        }).select('+password'); // Explicitly select password field

        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "ইমেইল বা পাসওয়ার্ড ভুল" // Email or password is wrong
            });
        }

        // Check if user is one-click user trying to use password login
        if (user.isOneClickUser) {
            return res.status(401).json({
                success: false,
                message: "এক ক্লিক অ্যাকাউন্ট। দয়া করে এক ক্লিক লগইন ব্যবহার করুন" // One-click account, please use one-click login
            });
        }

        // Verify password exists and is a string
        if (!user.password || typeof user.password !== 'string') {
            console.error('Invalid password format for user:', user._id);
            return res.status(500).json({
                success: false,
                message: "সিস্টেম ত্রুটি। দয়া পরে আবার চেষ্টা করুন" // System error, please try again
            });
        }

        // Verify password is not empty
        if (password.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "পাসওয়ার্ড প্রয়োজন" // Password is required
            });
        }

        // Verify password
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(401).json({ 
                success: false,
                message: "ইমেইল এবং পাসওয়ার্ড মেলেনি" // Email and password didn't match
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { 
                userId: user._id,
                email: user.email,
                role: user.role 
            },
            process.env.JWT_SECRET,
        );

        // Get device information
        const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        const agent = useragent.parse(req.headers['user-agent']);
        const geo = geoip.lookup(ip);
        const location = geo ? `${geo.city}, ${geo.country}` : "Unknown";

        // Create login history record
        const loginHistory = new LoginHistoryModel({
            userId: user._id,
            name:user.username,
            email: user.email,
            ipAddress: ip,
            device: agent.device.toString() || "Unknown",
            browser: agent.toAgent(),
            os: agent.os.toString(),
            location: location
        });

        await loginHistory.save();

        // Update user's last login and increment login count
        await UserModel.findByIdAndUpdate(user._id, {
            $inc: { login_count: 1 },
            last_login: new Date()
        });

        // Return user data without sensitive information
        const userData = user.toObject();
        delete userData.password;
        delete userData.otp;
        delete userData.resetPasswordToken;

        res.status(200).json({
            success: true,
            message: "সফলভাবে লগইন করা হয়েছে", // Login successful
            token,
            user: userData
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});
/**
 * @route POST /auth/oneclick-login
 * @desc One-click login/registration
 */
router.post('/oneclick-login', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username || username.length < 4) {
            return res.status(400).json({
                success: false,
                message: "ব্যবহারকারীর নাম কমপক্ষে ৪ অক্ষর হতে হবে" // Username must be at least 4 characters
            });
        }

        // Check if user exists
        let user = await UserModel.findOne({ username });

        if (!user) {
            // Create new one-click user
            user = new UserModel({
                username,
                isOneClickUser: true,
                player_id: 'PL' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                referralCode: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                status: 'active',
                balance: 0,
                currency: 'BDT'
            });

            await user.save();
        }

        // Generate token (same as regular login)
        const token = jwt.sign(
            { 
                userId: user._id,
                username: user.username,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return user data
        const userData = user.toObject();
        delete userData.password;
        delete userData.otp;

        res.status(200).json({
            success: true,
            message: user.isOneClickUser ? "সফলভাবে লগইন করা হয়েছে" : "সফলভাবে এক ক্লিকে নিবন্ধন করা হয়েছে", // Login successful / One-click registration successful
            token,
            user: userData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});

/**
 * @route POST /auth/signup
 * @desc User registration
 */
/**
 * @route POST /auth/signup
 * @desc User registration with referral tracking
 */
// router.post('/signup', async (req, res) => {
//     try {
//         const { email, password, referralCode } = req.body;

//         // Basic validation
//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "ইমেইল প্রয়োজন" // Email is required
//             });
//         }

//         if (!password || password.length < 6) {
//             return res.status(400).json({
//                 success: false,
//                 message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" // Password must be at least 6 characters
//             });
//         }

//         // Check if email already exists
//         const existingUser = await UserModel.findOne({ email });
//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 message: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে" // Email is already in use
//             });
//         }

//         // Generate random username
//         let username;
//         let usernameExists = true;
//         let attempts = 0;
        
//         while (usernameExists && attempts < 10) {
//             username = generateUsername();
//             const user = await UserModel.findOne({ username });
//             usernameExists = !!user;
//             attempts++;
//         }

//         if (usernameExists) {
//             return res.status(500).json({
//                 success: false,
//                 message: "ব্যবহারকারীর নাম তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন" // Problem generating username
//             });
//         }

//         // Check referral code if provided
//         let referrer = null;
//         if (referralCode) {
//             referrer = await UserModel.findOne({ referralCode });
//             if (!referrer) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "অবৈধ রেফারেল কোড" // Invalid referral code
//                 });
//             }
//         }

//         // Generate numeric player ID (8 digits)
//         const player_id = Math.floor(10000000 + Math.random() * 90000000);

//         // Create new user
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new UserModel({
//             username,
//             email,
//             password:hashedPassword,
//             player_id, // This will be a numeric ID like 12345678
//             referralCode: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
//             status: 'active',
//             balance: 0,
//             currency: 'BDT',
//             language: 'bn',
//             referredBy: referrer ? referrer._id : null
//         });

//         await newUser.save();

//         // Update referrer's information if referral code was used
//         if (referrer) {
//             await UserModel.findByIdAndUpdate(referrer._id, {
//                 $inc: { referralCount: 1 },
//                 $push: { 
//                     referralUsers: {
//                         user: newUser._id,
//                         earnedAmount: 0
//                     },
//                     referralTracking: {
//                         referralCodeUsed: referralCode,
//                         referredUser: newUser._id
//                     }
//                 }
//             });
//         }

//         // Generate token
//         const token = jwt.sign(
//             { 
//                 userId: newUser._id,
//                 username: newUser.username,
//                 role: newUser.role 
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         // Return user data without sensitive information
//         const userData = newUser.toObject();
//         delete userData.password;
//         delete userData.otp;

//         res.status(201).json({
//             success: true,
//             message: "সফলভাবে নিবন্ধন করা হয়েছে", // Registration successful
//             token,
//             user: userData,
//             referredBy: referrer ? referrer.username : null
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             success: false,
//             message: "সার্ভার সমস্যা হয়েছে" // Server problem
//         });
//     }
// });

// router.post('/signup', async (req, res) => {
//     try {
//         const { email, password, referralCode, clickId } = req.body;

//         // Basic validation
//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "ইমেইল প্রয়োজন" // Email is required
//             });
//         }

//         if (!password || password.length < 6) {
//             return res.status(400).json({
//                 success: false,
//                 message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" // Password must be at least 6 characters
//             });
//         }

//         // Check if email already exists
//         const existingUser = await UserModel.findOne({ email });
//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 message: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে" // Email is already in use
//             });
//         }

//         // Generate random username
//         let username;
//         let usernameExists = true;
//         let attempts = 0;
        
//         while (usernameExists && attempts < 10) {
//             username = generateUsername();
//             const user = await UserModel.findOne({ username });
//             usernameExists = !!user;
//             attempts++;
//         }

//         if (usernameExists) {
//             return res.status(500).json({
//                 success: false,
//                 message: "ব্যবহারকারীর নাম তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন" // Problem generating username
//             });
//         }

//         // Check referral code if provided
//         let referrer = null;
//         if (referralCode) {
//             referrer = await UserModel.findOne({ referralCode });
//             if (!referrer) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "অবৈধ রেফারেল কোড" // Invalid referral code
//                 });
//             }
//         }

//         // Generate numeric player ID (8 digits)
//         const player_id = Math.floor(10000000 + Math.random() * 90000000);

//         // Create new user
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new UserModel({
//             username,
//             email,
//             password: hashedPassword,
//             player_id, // This will be a numeric ID like 12345678
//             referralCode: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
//             status: 'active',
//             balance: 0,
//             currency: 'BDT',
//             language: 'bn',
//             referredBy: referrer ? referrer._id : null,
//             clickId: clickId || '' // Add clickId field, empty string if not provided
//         });

//         await newUser.save();

//         // Update referrer's information if referral code was used
//         if (referrer) {
//             await UserModel.findByIdAndUpdate(referrer._id, {
//                 $inc: { referralCount: 1 },
//                 $push: { 
//                     referralUsers: {
//                         user: newUser._id,
//                         earnedAmount: 0
//                     },
//                     referralTracking: {
//                         referralCodeUsed: referralCode,
//                         referredUser: newUser._id
//                     }
//                 }
//             });
//         }

//         // Generate token
//         const token = jwt.sign(
//             { 
//                 userId: newUser._id,
//                 username: newUser.username,
//                 role: newUser.role 
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         // Return user data without sensitive information
//         const userData = newUser.toObject();
//         delete userData.password;
//         delete userData.otp;

//         res.status(201).json({
//             success: true,
//             message: "সফলভাবে নিবন্ধন করা হয়েছে", // Registration successful
//             token,
//             user: userData,
//             referredBy: referrer ? referrer.username : null,
//             clickId: clickId || null // Return clickId in response for confirmation
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             success: false,
//             message: "সার্ভার সমস্যা হয়েছে" // Server problem
//         });
//     }
// });

// router.post('/signup', async (req, res) => {
//     try {
//         const { email, password, referralCode, clickId } = req.body;
//         console.log(req.body)
        
//         // Basic validation
//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "ইমেইল প্রয়োজন" // Email is required
//             });
//         }

//         if (!password || password.length < 6) {
//             return res.status(400).json({
//                 success: false,
//                 message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" // Password must be at least 6 characters
//             });
//         }

//         // Check if email already exists
//         const existingUser = await UserModel.findOne({ email });
//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 message: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে" // Email is already in use
//             });
//         }

//         // Generate random username
//         let username;
//         let usernameExists = true;
//         let attempts = 0;
        
//         while (usernameExists && attempts < 10) {
//             username = generateUsername();
//             const user = await UserModel.findOne({ username });
//             usernameExists = !!user;
//             attempts++;
//         }

//         if (usernameExists) {
//             return res.status(500).json({
//                 success: false,
//                 message: "ব্যবহারকারীর নাম তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন" // Problem generating username
//             });
//         }

//         // Check referral code if provided
//         let referrer = null;
//         if (referralCode) {
//             referrer = await UserModel.findOne({ referralCode });
//             if (!referrer) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "অবৈধ রেফারেল কোড" // Invalid referral code
//                 });
//             }
//         }

//         // Generate numeric player ID (8 digits)
//         const player_id = Math.floor(10000000 + Math.random() * 90000000);

//         // Create new user
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new UserModel({
//             username,
//             email,
//             password: hashedPassword,
//             player_id, // This will be a numeric ID like 12345678
//             referralCode: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
//             status: 'active',
//             balance: 0,
//             currency: 'BDT',
//             language: 'bn',
//             referredBy: referrer ? referrer._id : null,
//             clickId: clickId || '' // Add clickId field, empty string if not provided
//         });

//         await newUser.save();

//         // Update referrer's information if referral code was used
//         if (referrer) {
//              // Calculate referral commission: (Total Deposit - Total Withdrawal - Current Balance) × 25%
//             const netLoss = (referrer.lifetime_deposit) - 
//                           ( referrer.lifetime_withdraw) - 
//                           referrer.balance;
            
//             referralCommission = Math.max(0, netLoss * 0.25); // Only positive commissions
            
//             // Round to 2 decimal places
//             referralCommission = Math.round(referralCommission * 100) / 100;

//             // Update referrer's balance and referral information
//             const referrerBalanceBefore = referrer.balance;
            
//             if (referralCommission > 0) {
//                 referrer.referralEarnings += referralCommission;
                
//                 // Add to transaction history for referrer
//                 referrer.transactionHistory.push({
//                     type: 'bonus',
//                     amount: referralCommission,
//                     balanceBefore: referrerBalanceBefore,
//                     balanceAfter: referrer.balance,
//                     description: `Referral commission from ${newUser.username} (25% of net loss)`,
//                     referenceId: `REFCOMM-${Date.now()}`,
//                     createdAt: new Date()
//                 });

//                 // Create referral income record for referrer
//                 const referralIncomeRecord = {
//                     referredUser: newUser._id,
//                     commissionAmount: referralCommission,
//                     calculation: {
//                         totalDeposit: newUser.total_deposit + newUser.lifetime_deposit,
//                         totalWithdrawal: newUser.total_withdraw + newUser.lifetime_withdraw,
//                         currentBalance: newUser.balance,
//                         netLoss: netLoss,
//                         commissionRate: 0.25
//                     },
//                     status: 'credited',
//                     creditedAt: new Date()
//                 };

//                 // Add to referral tracking with commission details
//                 await UserModel.findByIdAndUpdate(referrer._id, {
//                     $inc: { 
//                         referralCount: 1,
//                         balance: referralCommission,
//                         referralEarnings: referralCommission
//                     },
//                     $push: { 
//                         referralUsers: {
//                             user: newUser._id,
//                             joinedAt: new Date(),
//                             earnedAmount: referralCommission
//                         },
//                         referralTracking: {
//                             referralCodeUsed: referralCode,
//                             referredUser: newUser._id,
//                             commissionEarned: referralCommission,
//                             commissionCalculation: {
//                                 totalDeposit: newUser.total_deposit + newUser.lifetime_deposit,
//                                 totalWithdrawal: newUser.total_withdraw + newUser.lifetime_withdraw,
//                                 currentBalance: newUser.balance,
//                                 netLoss: netLoss,
//                                 commissionRate: 0.25
//                             },
//                             timestamp: new Date()
//                         }
//                     }
//                 });
//             } else {
//                 // No commission but still track the referral
//                 await UserModel.findByIdAndUpdate(referrer._id, {
//                     $inc: { referralCount: 1 },
//                     $push: { 
//                         referralUsers: {
//                             user: newUser._id,
//                             joinedAt: new Date(),
//                             earnedAmount: 0
//                         },
//                         referralTracking: {
//                             referralCodeUsed: referralCode,
//                             referredUser: newUser._id,
//                             commissionEarned: 0,
//                             commissionCalculation: {
//                                 totalDeposit: newUser.total_deposit + newUser.lifetime_deposit,
//                                 totalWithdrawal: newUser.total_withdraw + newUser.lifetime_withdraw,
//                                 currentBalance: newUser.balance,
//                                 netLoss: netLoss,
//                                 commissionRate: 0.25
//                             },
//                             timestamp: new Date()
//                         }
//                     }
//                 });
//             }

//         }

//         // Generate token
//         const token = jwt.sign(
//             { 
//                 userId: newUser._id,
//                 username: newUser.username,
//                 role: newUser.role 
//             },
//             process.env.JWT_SECRET,
//         );

//         // 🔥 CONVERSION TRACKING - Send conversion data to Bemob
//         let conversionTracked = false;
//         let conversionError = null;
//         let conversionResponse = null;
        
//         if (clickId) {
//             try {
//                 // Set parameters for Bemob postback
//                 const cid = clickId; // Required - Click ID
//                 const payout = 0; // Optional - Payout amount
//                 const txid = newUser._id.toString(); // Optional - Transaction ID (using user ID)
//                 const status = 'approved'; // Optional - Status (approved, rejected, pending)
                
//                 // Construct the Bemob postback URL
//                 const conversionUrl = `https://0yn0v.bemobtrcks.com/postback?cid=${cid}&payout=${payout}&txid=${txid}&status=${status}`;
                
//                 console.log(`Tracking conversion with URL: ${conversionUrl}`);
                
//                 // Make GET request to Bemob postback URL
//                 const resp = await axios.get(conversionUrl, {
//                     headers: {
//                         'User-Agent': 'YourApp/1.0',
//                         'Accept': '*/*'
//                     },
//                     timeout: 10000 // 10 second timeout
//                 });
                
//                 console.log("Bemob response status:", resp.status);
//                 console.log("Bemob response data:", resp.data);
                
//                 conversionTracked = true;
//                 conversionResponse = resp.data;
//                 console.log(`Conversion successfully tracked for clickId: ${clickId}`);
                
//             } catch (convError) {
//                 conversionError = convError.message;
//                 console.error('Failed to track conversion:', convError.message);
//                 // Log more details for debugging
//                 if (convError.response) {
//                     console.error('Bemob response error:', convError.response.status, convError.response.data);
//                 }
//             }
//         }

//         // Return user data without sensitive information
//         const userData = newUser.toObject();
//         delete userData.password;
//         delete userData.otp;

//         res.status(201).json({
//             success: true,
//             message: "সফলভাবে নিবন্ধন করা হয়েছে", // Registration successful
//             token,
//             user: userData,
//             referredBy: referrer ? referrer.username : null,
//             clickId: clickId || null,
//             conversionTracked: conversionTracked,
//             conversionResponse: conversionResponse,
//             conversionError: conversionError // Include error info for debugging
//         });

//     } catch (err) {
//         console.error('Signup error:', err);
//         res.status(500).json({
//             success: false,
//             message: "সার্ভার সমস্যা হয়েছে" // Server problem
//         });
//     }
// });


// router.post('/signup', async (req, res) => {
//     try {
//         const { email, password, referralCode, clickId } = req.body;

//         // Basic validation
//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "ইমেইল প্রয়োজন" // Email is required
//             });
//         }

//         if (!password || password.length < 6) {
//             return res.status(400).json({
//                 success: false,
//                 message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" // Password must be at least 6 characters
//             });
//         }

//         // Check if email already exists
//         const existingUser = await UserModel.findOne({ email });
//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 message: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে" // Email is already in use
//             });
//         }

//         // Generate random username
//         let username;
//         let usernameExists = true;
//         let attempts = 0;
        
//         while (usernameExists && attempts < 10) {
//             username = generateUsername();
//             const user = await UserModel.findOne({ username });
//             usernameExists = !!user;
//             attempts++;
//         }

//         if (usernameExists) {
//             return res.status(500).json({
//                 success: false,
//                 message: "ব্যবহারকারীর নাম তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন" // Problem generating username
//             });
//         }

//         // Check referral code if provided
//         let referrer = null;
//         if (referralCode) {
//             referrer = await UserModel.findOne({ referralCode });
//             if (!referrer) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "অবৈধ রেফারেল কোড" // Invalid referral code
//                 });
//             }
//         }

//         // Generate numeric player ID (8 digits)
//         const player_id = Math.floor(10000000 + Math.random() * 90000000);

//         // Create new user
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new UserModel({
//             username,
//             email,
//             password: hashedPassword,
//             player_id, // This will be a numeric ID like 12345678
//             referralCode: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
//             status: 'active',
//             balance: 0,
//             currency: 'BDT',
//             language: 'bn',
//             referredBy: referrer ? referrer._id : null,
//             clickId: clickId || '' // Add clickId field, empty string if not provided
//         });

//         await newUser.save();

//         // Update referrer's information if referral code was used
//         if (referrer) {
//             await UserModel.findByIdAndUpdate(referrer._id, {
//                 $inc: { referralCount: 1 },
//                 $push: { 
//                     referralUsers: {
//                         user: newUser._id,
//                         earnedAmount: 0
//                     },
//                     referralTracking: {
//                         referralCodeUsed: referralCode,
//                         referredUser: newUser._id
//                     }
//                 }
//             });
//         }

//         // Generate token
//         const token = jwt.sign(
//             { 
//                 userId: newUser._id,
//                 username: newUser.username,
//                 role: newUser.role 
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );
//      // Post conversion data to tracking URL if clickId is present
//     if (clickId) {
//     try {
//         const conversionUrl = `https://0yn0v.bemobtrcks.com/postback?cid=${clickId}&status=success&txid=${newUser._id}&payout=`;
        
//         await axios.get(conversionUrl, {
//             timeout: 5000, // 5 second timeout
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//             }
//         });
        
//         console.log(`Conversion tracked successfully for clickId: ${clickId}`);
//     } catch (conversionError) {
//         console.error('Error tracking conversion:', conversionError.message);
//         // Don't fail the registration if conversion tracking fails
//         // Just log the error and continue
//     }
// }
//         // Return user data without sensitive information
//         const userData = newUser.toObject();
//         delete userData.password;
//         delete userData.otp;

//         res.status(201).json({
//             success: true,
//             message: "সফলভাবে নিবন্ধন করা হয়েছে", // Registration successful
//             token,
//             user: userData,
//             referredBy: referrer ? referrer.username : null,
//             clickId: clickId || null // Return clickId in response for confirmation
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             success: false,
//             message: "সার্ভার সমস্যা হয়েছে" // Server problem
//         });
//     }
// });
router.post('/signup', async (req, res) => {
    try {
        const { email, password, referralCode, clickId, affiliateCode, mobile, currency } = req.body;
        console.log(req.body);

        // Basic validation
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "ইমেইল প্রয়োজন"
            });
        }

        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে"
            });
        }

        // Validate mobile number if provided
        if (mobile && !/^01[0-9]{9}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message: "সঠিক মোবাইল নম্বর দিন (বাংলাদেশি ১১ ডিজিটের নম্বর)"
            });
        }

        // Check if email already exists
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে"
            });
        }

        // Check if mobile already exists (if provided)
        if (mobile) {
            const existingMobile = await UserModel.findOne({ phone: mobile });
            if (existingMobile) {
                return res.status(409).json({
                    success: false,
                    message: "এই মোবাইল নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে"
                });
            }
        }

        // Generate random username
        let username;
        let usernameExists = true;
        let attempts = 0;
        
        while (usernameExists && attempts < 10) {
            username = generateUsername();
            const user = await UserModel.findOne({ username });
            usernameExists = !!user;
            attempts++;
        }

        if (usernameExists) {
            return res.status(500).json({
                success: false,
                message: "ব্যবহারকারীর নাম তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন"
            });
        }

        // Check referral code if provided
        let referrer = null;
        if (referralCode) {
            referrer = await UserModel.findOne({ referralCode });
            if (!referrer) {
                return res.status(400).json({
                    success: false,
                    message: "অবৈধ রেফারেল কোড"
                });
            }
        }

        // Generate numeric player ID (8 digits)
        const player_id = Math.floor(10000000 + Math.random() * 90000000).toString();

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with all fields
        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            phone: mobile || undefined, // Map mobile from frontend to phone in model
            player_id,
            referralCode: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            status: 'active',
            balance: 0,
            currency: currency || 'BDT',
            language: 'bn',
            referredBy: referrer ? referrer._id : null,
            clickId: clickId || '',
            affiliateCode: affiliateCode || '',
            // Set default values for required fields
            isOneClickUser: false,
            role: 'user',
            first_login: true,
            login_count: 0,
            total_deposit: 0,
            total_withdraw: 0,
            total_bet: 0,
            total_wins: 0,
            total_loss: 0,
            net_profit: 0,
            depositamount: 0,
            waigeringneed: 0,
            lifetime_deposit: 0,
            lifetime_withdraw: 0,
            lifetime_bet: 0,
            totalWagered: 0,
            weeklybetamount: 0,
            monthlybetamount: 0,
            waigergamecategory: [],
            withdrawalCountToday: 0,
            withdrawalBanned: false,
            rating: 0,
            notes: [],
            levelInfo: {
                currentLevel: {
                    name: 'Bronze',
                    threshold: 0,
                    achievedAt: new Date()
                },
                levelUpBonuses: [],
                lifetimeLevels: []
            },
            bonusInfo: {
                firstDepositBonusClaimed: false,
                activeBonuses: [],
                bonusWageringTotal: 0,
                cancelledBonuses: []
            },
            weeklyBonus: {
                totalBet: 0,
                bonusAmount: 0,
                status: 'expired'
            },
            monthlyBonus: {
                totalBet: 0,
                bonusAmount: 0,
                status: 'expired'
            },
            bonusHistory: [],
            notificationPreferences: {
                email: true,
                sms: false,
                push: true
            },
            themePreference: 'dark',
            isEmailVerified: false,
            kycStatus: 'unverified',
            kycSubmitted: false,
            kycCompleted: false,
            kycVerifications: [],
            kycResubmissionCount: 0,
            kycSubmissionHistory: [],
            kycDocuments: [],
            kycRejectedCount: 0,
            kycRejections: [],
            isPhoneVerified: false,
            referralEarnings: 0,
            referralCount: 0,
            referralUsers: [],
            referralTracking: [],
            referralDebt: 0,
            betHistory: [],
            profitLossHistory: [],
            depositHistory: [],
            withdrawHistory: [],
            transactionHistory: [],
            bonusActivityLogs: []
        });

        await newUser.save();

        // Update referrer's information if referral code was used
        if (referrer) {
            await UserModel.findByIdAndUpdate(referrer._id, {
                $inc: { referralCount: 1 },
                $push: { 
                    referralUsers: {
                        user: newUser._id,
                        earnedAmount: 0,
                        joinedAt: new Date()
                    },
                    referralTracking: {
                        referralCodeUsed: referralCode,
                        referredUser: newUser._id,
                        timestamp: new Date()
                    }
                }
            });
        }

        // Generate token
        const token = jwt.sign(
            { 
                userId: newUser._id,
                username: newUser.username,
                role: newUser.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Post conversion data to tracking URL if affiliateCode is present
        if (affiliateCode) {
            try {
                const conversionUrl = `https://backend.affilinkly.com/api/postback?cid=${affiliateCode}&status=success&txid=${newUser._id}&payout=`;
                
                await axios.get(conversionUrl, {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                console.log(`Conversion tracked successfully for affiliateCode: ${affiliateCode}`);
            } catch (conversionError) {
                console.error('Error tracking conversion:', conversionError.message);
            }
        }
        // Also track clickId if present (for backward compatibility)
        else if (clickId) {
            try {
                const conversionUrl = `https://0yn0v.bemobtrcks.com/postback?cid=${clickId}&status=success&txid=${newUser._id}&payout=`;
                
                await axios.get(conversionUrl, {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                
                console.log(`Conversion tracked successfully for clickId: ${clickId}`);
            } catch (conversionError) {
                console.error('Error tracking conversion:', conversionError.message);
            }
        }

        // Return user data without sensitive information
        const userData = newUser.toObject();
        delete userData.password;
        delete userData.otp;
        delete userData.transactionPassword;
        delete userData.moneyTransferPassword;
        delete userData.twoFactorSecret;
        delete userData.resetPasswordToken;
        delete userData.resetPasswordExpires;
        delete userData.passwordHistory;

        res.status(201).json({
            success: true,
            message: "সফলভাবে নিবন্ধন করা হয়েছে",
            token,
            user: userData,
            referredBy: referrer ? referrer.username : null,
            clickId: clickId || null,
            affiliateCode: affiliateCode || null
        });

    } catch (err) {
        console.error('Signup error:', err);
        
        // Handle duplicate key errors
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern)[0];
            if (field === 'email') {
                return res.status(409).json({
                    success: false,
                    message: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে"
                });
            } else if (field === 'phone') {
                return res.status(409).json({
                    success: false,
                    message: "এই মোবাইল নম্বরটি ইতিমধ্যে ব্যবহৃত হয়েছে"
                });
            } else if (field === 'username') {
                return res.status(409).json({
                    success: false,
                    message: "এই ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে"
                });
            }
        }
        
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে"
        });
    }
});


// router.post('/signup', async (req, res) => {
//     try {
//         const { email, password, referralCode, clickId } = req.body;

//         // Basic validation
//         if (!email) {
//             return res.status(400).json({
//                 success: false,
//                 message: "ইমেইল প্রয়োজন" // Email is required
//             });
//         }

//         if (!password || password.length < 6) {
//             return res.status(400).json({
//                 success: false,
//                 message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" // Password must be at least 6 characters
//             });
//         }

//         // Check if email already exists
//         const existingUser = await UserModel.findOne({ email });
//         if (existingUser) {
//             return res.status(409).json({
//                 success: false,
//                 message: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে" // Email is already in use
//             });
//         }

//         // Generate random username
//         let username;
//         let usernameExists = true;
//         let attempts = 0;
        
//         while (usernameExists && attempts < 10) {
//             username = generateUsername();
//             const user = await UserModel.findOne({ username });
//             usernameExists = !!user;
//             attempts++;
//         }

//         if (usernameExists) {
//             return res.status(500).json({
//                 success: false,
//                 message: "ব্যবহারকারীর নাম তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন" // Problem generating username
//             });
//         }

//         // Check referral code if provided
//         let referrer = null;
//         if (referralCode) {
//             referrer = await UserModel.findOne({ referralCode });
//             if (!referrer) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "অবৈধ রেফারেল কোড" // Invalid referral code
//                 });
//             }
//         }

//         // Generate numeric player ID (8 digits)
//         const player_id = Math.floor(10000000 + Math.random() * 90000000);

//         // Create new user
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const newUser = new UserModel({
//             username,
//             email,
//             password: hashedPassword,
//             player_id, // This will be a numeric ID like 12345678
//             referralCode: 'REF' + Math.random().toString(36).substr(2, 6).toUpperCase(),
//             status: 'active',
//             balance: 0,
//             currency: 'BDT',
//             language: 'bn',
//             referredBy: referrer ? referrer._id : null,
//             clickId: clickId || '' // Add clickId field, empty string if not provided
//         });

//         await newUser.save();

//         // Update referrer's information if referral code was used
//         if (referrer) {
//             await UserModel.findByIdAndUpdate(referrer._id, {
//                 $inc: { referralCount: 1 },
//                 $push: { 
//                     referralUsers: {
//                         user: newUser._id,
//                         earnedAmount: 0
//                     },
//                     referralTracking: {
//                         referralCodeUsed: referralCode,
//                         referredUser: newUser._id
//                     }
//                 }
//             });
//         }

//         // Generate token
//         const token = jwt.sign(
//             { 
//                 userId: newUser._id,
//                 username: newUser.username,
//                 role: newUser.role 
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: '24h' }
//         );

//         // Post conversion data to tracking URL if clickId is present
//         if (clickId) {
//             try {
//                 const conversionUrl = `https://bdl4m.bemobtrcks.com/conversion.txt?cid=${clickId}&status=success&txid=${newUser._id}`;
                
//                 await axios.get(conversionUrl, {
//                     timeout: 5000, // 5 second timeout
//                     headers: {
//                         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//                     }
//                 });
                
//                 console.log(`Conversion tracked successfully for clickId: ${clickId}`);
//             } catch (conversionError) {
//                 console.error('Error tracking conversion:', conversionError.message);
//                 // Don't fail the registration if conversion tracking fails
//                 // Just log the error and continue
//             }
//         }

//         // Return user data without sensitive information
//         const userData = newUser.toObject();
//         delete userData.password;
//         delete userData.otp;

//         res.status(201).json({
//             success: true,
//             message: "সফলভাবে নিবন্ধন করা হয়েছে", // Registration successful
//             token,
//             user: userData,
//             referredBy: referrer ? referrer.username : null,
//             clickId: clickId || null, // Return clickId in response for confirmation
//             conversionTracked: !!clickId // Indicate if conversion was tracked
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             success: false,
//             message: "সার্ভার সমস্যা হয়েছে" // Server problem
//         });
//     }
// });

/**
 * @route POST /auth/request-password-reset
 * @desc Request password reset OTP
 */
router.post('/request-password-reset', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "ইমেইল প্রয়োজন" // Email is required
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "এই ইমেইলটি দিয়ে কোন ব্যবহারকারী খুঁজে পাওয়া যায়নি" // No user found with this email
            });
        }

        // Generate OTP
        const otpCode = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

        // Save OTP to user
        user.otp = {
            code: otpCode,
            expiresAt: otpExpiry,
            purpose: 'password-reset',
            verified: false
        };
        await user.save();

        // Send OTP via email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'পাসওয়ার্ড রিসেট OTP',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">পাসওয়ার্ড রিসেট অনুরোধ</h2>
                    <p>আপনার পাসওয়ার্ড রিসেট করার জন্য OTP কোড:</p>
                    <h3 style="background: #f4f4f4; padding: 10px; display: inline-block;">${otpCode}</h3>
                    <p>এই কোডটি ৫ মিনিটের মধ্যে ব্যবহার করুন।</p>
                    <p>যদি আপনি এই অনুরোধটি না করে থাকেন, তাহলে এই ইমেইলটি উপেক্ষা করুন।</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "OTP ইমেইলে পাঠানো হয়েছে", // OTP sent to email
            email: user.email // Return masked email for display
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});

/**
 * @route POST /auth/verify-reset-otp
 * @desc Verify password reset OTP
 */
router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "ইমেইল এবং OTP প্রয়োজন" // Email and OTP are required
            });
        }

        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" // User not found
            });
        }

        // Check if OTP exists and is for password reset
        if (!user.otp || user.otp.purpose !== 'password-reset') {
            return res.status(400).json({
                success: false,
                message: "অবৈধ OTP অনুরোধ" // Invalid OTP request
            });
        }

        // Check if OTP is expired
        if (user.otp.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "OTP এর মেয়াদ শেষ হয়ে গেছে" // OTP has expired
            });
        }

        // Verify OTP
        if (user.otp.code !== otp) {
            return res.status(400).json({
                success: false,
                message: "ভুল OTP কোড" // Wrong OTP code
            });
        }

        // Mark OTP as verified
        user.otp.verified = true;
        await user.save();

        // Generate a temporary token for password reset (valid for 10 minutes)
        const resetToken = jwt.sign(
            { userId: user._id, purpose: 'password-reset' },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        res.status(200).json({
            success: true,
            message: "OTP সফলভাবে যাচাই করা হয়েছে", // OTP verified successfully
            resetToken
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});

/**
 * @route POST /auth/reset-password
 * @desc Reset password after OTP verification
 */
router.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        if (!resetToken || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "রিসেট টোকেন এবং নতুন পাসওয়ার্ড প্রয়োজন" // Reset token and new password are required
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "অবৈধ বা মেয়াদোত্তীর্ণ টোকেন" // Invalid or expired token
            });
        }

        // Check token purpose
        if (decoded.purpose !== 'password-reset') {
            return res.status(401).json({
                success: false,
                message: "অবৈধ টোকেন উদ্দেশ্য" // Invalid token purpose
            });
        }

        // Find user
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" // User not found
            });
        }

        // Check if OTP was verified
        if (!user.otp || !user.otp.verified || user.otp.purpose !== 'password-reset') {
            return res.status(400).json({
                success: false,
                message: "OTP যাচাই করা হয়নি" // OTP not verified
            });
        }

        // Check password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" // Password must be at least 6 characters
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear OTP
        user.password = hashedPassword;
        user.otp = undefined;
        await user.save();

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'আপনার পাসওয়ার্ড পরিবর্তন করা হয়েছে',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে</h2>
                    <p>আপনার অ্যাকাউন্টের পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।</p>
                    <p>যদি আপনি এই পরিবর্তনটি না করে থাকেন, তাহলে দয়া করে আমাদের সাথে যোগাযোগ করুন।</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে" // Password reset successfully
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});

/**
 * @route POST /auth/change-password
 * @desc Change password (for authenticated users)
 */
router.post('/change-password', ensureAuthenticated, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.userId;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "বর্তমান এবং নতুন পাসওয়ার্ড প্রয়োজন" // Current and new password are required
            });
        }

        // Find user
        const user = await UserModel.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" // User not found
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "বর্তমান পাসওয়ার্ড ভুল" // Current password is wrong
            });
        }

        // Check if new password is same as current
        if (currentPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: "নতুন পাসওয়ার্ড বর্তমান পাসওয়ার্ডের মতোই" // New password is same as current
            });
        }

        // Check password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" // Password must be at least 6 characters
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        user.password = hashedPassword;
        user.lastPasswordChange = new Date();
        await user.save();

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'আপনার পাসওয়ার্ড পরিবর্তন করা হয়েছে',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4CAF50;">পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে</h2>
                    <p>আপনার অ্যাকাউন্টের পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।</p>
                    <p>যদি আপনি এই পরিবর্তনটি না করে থাকেন, তাহলে দয়া করে আমাদের সাথে যোগাযোগ করুন।</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে" // Password changed successfully
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});

/**
 * @route POST /auth/admin-login
 * @desc Admin login
 */
router.post('/admin-login', loginValidation, adminlogin);

/**
 * @route POST /auth/admin-registration
 * @desc Admin registration
 */
router.post('/admin-registration', async (req, res) => {
    try {
        const { name, role, email, password } = req.body;

        const admin = await admin_model.findOne({ email });
        if (admin) {
            return res.status(400).json({ 
                success: false,
                message: "অ্যাডমিন ইতিমধ্যে বিদ্যমান" // Admin already exists
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = new admin_model({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newAdmin.save();

        res.status(201).json({
            success: true,
            message: "অ্যাডমিন সফলভাবে তৈরি করা হয়েছে" // Admin created successfully
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});
// ------------check-admin-found-or-not--------------------
router.get("/admin-info/:id",async(req,res)=>{
    try {
        const admininfo=await admin_model.findById({_id:req.params.id});
        if(!admininfo){
               return res.send({success:false,message:"Admin did not find!"})
        }
        console.log(admininfo)
        res.send({success:true,data:admininfo})
    } catch (error) {
        console.log(error)
    }
})
/**
 * @route PUT /auth/update-profile
 * @desc Update user profile
 */
router.put("/update-profile", ensureAuthenticated, uploadimage.single('avatar'), profile_update);

/**
 * @route PUT /auth/update-user-balance/:id
 * @desc Update user balance (admin only)
 */
router.put("/update-user-balance/:id", ensureAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" // User not found
            });
        }

        user.balance += req.body.amount;
        await user.save();

        res.json({
            success: true,
            message: "ব্যবহারকারীর ব্যালেন্স আপডেট করা হয়েছে", // User balance updated
            newBalance: user.balance
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});

/**
 * @route GET /auth/user/:id
 * @desc Get user details
 */
router.get("/user/:id", ensureAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.id)
            .select('-password -otp -resetPasswordToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" // User not found
            });
        }

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});
/**
 * @route GET /auth/check-referral-code/:code
 * @desc Check if referral code exists
 */

router.get('/check-referral-code/:code', async (req, res) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "রেফারেল কোড প্রয়োজন" // Referral code is required
            });
        }

        // Find user by referral code
        const referrer = await UserModel.findOne({ 
            referralCode: code,
            status: 'active' // Only consider active users
        }).select('username email avatar referralCount referralEarnings');

        if (!referrer) {
            return res.json({
                success: false,
                message: "অবৈধ রেফারেল কোড", // Invalid referral code
                exists: false
            });
        }

        res.status(200).json({
            success: true,
            message: "রেফারেল কোড বৈধ", // Valid referral code
            exists: true,
            referrer: {
                username: referrer.username,
                email: referrer.email,
                avatar: referrer.avatar,
                referralCount: referrer.referralCount,
                referralEarnings: referrer.referralEarnings
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});

router.post('/support-signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
         console.log(req.body)
        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "নাম, ইমেইল এবং পাসওয়ার্ড প্রয়োজন" // Name, email and password are required
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে" // Password must be at least 6 characters
            });
        }

        // Check if email already exists
        const existingSupport = await Support.findOne({ email });
        if (existingSupport) {
            return res.status(409).json({
                success: false,
                message: "এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে" // Email is already in use
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new support admin
        const newSupport = new Support({
            name,
            email,
            password: hashedPassword,
        });

        await newSupport.save();

        // Return data without sensitive information
        const supportData = newSupport.toObject();
        delete supportData.password;

        res.status(201).json({
            success: true,
            message: "সাপোর্ট অ্যাডমিন সফলভাবে তৈরি করা হয়েছে", // Support admin created successfully
            support: supportData
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});

/**
 * @route POST /auth/support-login
 * @desc Support admin login
 */
router.post('/support-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন" // Email and password are required
            });
        }

        // Find support admin by email
        const supportAdmin = await Support.findOne({ 
            email: email,
            status: 'active' 
        }).select('+password'); // Explicitly select password field

        if (!supportAdmin) {
            return res.status(401).json({ 
                success: false,
                message: "ইমেইল বা পাসওয়ার্ড ভুল" // Email or password is wrong
            });
        }

        // Verify password
        const isPassEqual = await bcrypt.compare(password, supportAdmin.password);
        if (!isPassEqual) {
            return res.status(401).json({ 
                success: false,
                message: "ইমেইল এবং পাসওয়ার্ড মেলেনি" // Email and password didn't match
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { 
                userId: supportAdmin._id,
                email: supportAdmin.email,
                role: supportAdmin.role,
                isAdmin: true
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Update last login
        await Support.findByIdAndUpdate(supportAdmin._id, {
            last_login: new Date()
        });

        // Return data without sensitive information
        const supportData = supportAdmin.toObject();
        delete supportData.password;

        res.status(200).json({
            success: true,
            message: "সফলভাবে লগইন করা হয়েছে", // Login successful
            token,
            support: supportData
        });

    } catch (err) {
        console.error('Support login error:', err);
        res.status(500).json({
            success: false,
            message: "সার্ভার সমস্যা হয়েছে" // Server problem
        });
    }
});
module.exports = router;