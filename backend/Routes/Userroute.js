const express=require("express");
const UserModel = require("../Models/User");
const transaction_model = require("../Models/Transactionmodel");
const Withdrawmodel = require("../Models/Withdrawmodel");
const ensureAuthenticated = require("../Middlewares/Auth");
const user_route=express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../Models/User");
const axios= require("axios");
const GameHistory = require("../Models/Gameslogs");
const GameSession = require("../Models/GameSession");
const mongoose=require("mongoose");
const SpinWheelHistory = require("../Models/SpinWheelHistory");
const Bonus=require("../Models/Bonus");
const LEVEL_CONFIG = {
  BRONZE: { name: 'Bronze', threshold: 0, bonus: 0 },
  SILVER: { name: 'Silver', threshold: 10000, bonus: 500 },
  GOLD: { name: 'Gold', threshold: 30000, bonus: 1500 },
  PLATINUM: { name: 'Platinum', threshold: 100000, bonus: 5000 },
  DIAMOND: { name: 'Diamond', threshold: 500000, bonus: 25000 }
};
const BONUS_CONFIG = {
  BONUS_EXPIRY_DAYS: 30,
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

// ----------------- Update Username -----------------
user_route.put("/update-username", ensureAuthenticated, async (req, res) => {
    try {
        const { userId, newUsername, password } = req.body;

        // ইনপুট ভ্যালিডেশন
        if (!newUsername || !password) {
            return res.status(400).json({
                success: false,
                message: "নতুন ইউজারনেম এবং পাসওয়ার্ড অবশ্যই প্রয়োজন"
            });
        }

        // ইউজারনেম ফরম্যাট ভ্যালিডেশন
        if (!/^[a-zA-Z0-9_]{4,20}$/.test(newUsername)) {
            return res.status(400).json({
                success: false,
                message: "ইউজারনেম অবশ্যই ৪-২০ ক্যারেক্টারের হতে হবে এবং শুধুমাত্র ইংরেজি অক্ষর, সংখ্যা এবং আন্ডারস্কোর ব্যবহার করা যাবে"
            });
        }

        // পাসওয়ার্ড সহ ইউজার খুঁজুন
        const user = await UserModel.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ইউজার খুঁজে পাওয়া যায়নি"
            });
        }

        // পাসওয়ার্ড ভেরিফাই করুন
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "পাসওয়ার্ড ভুল হয়েছে"
            });
        }

        // নতুন ইউজারনেম ইতিমধ্যে আছে কিনা চেক করুন
        const existingUser = await UserModel.findOne({ username: newUsername });
        if (existingUser && existingUser._id.toString() !== userId) {
            return res.status(400).json({
                success: false,
                message: "এই ইউজারনেম ইতিমধ্যে নেওয়া হয়েছে"
            });
        }

        // ইউজারনেম আপডেট করুন
        const oldUsername = user.username;
        user.username = newUsername;
        await user.save();

        res.status(200).json({
            success: true,
            message: "ইউজারনেম সফলভাবে আপডেট হয়েছে",
            data: {
                oldUsername,
                newUsername
            }
        });

    } catch (error) {
        console.error("ইউজারনেম আপডেট করতে সমস্যা:", error);
        res.status(500).json({
            success: false,
            message: "ইউজারনেম আপডেট করতে ব্যর্থ হয়েছে",
            error: error.message
        });
    }
});
// -------------------------refer-balance-transfrer-to-main-balance-------------------
user_route.put("/transfer-refer-balance-to-main-balance",async(req,res)=>{
    try {
        const { userId } = req.body;

        // ইউজার খুঁজুন
        const user = await UserModel.findById({_id:userId});  
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ইউজার খুঁজে পাওয়া যায়নি"
            });
        }
        // রেফারেল ব্যালেন্স চেক করুন
        console.log(user)
        if (user.referralEarnings <= 999) {
            return res.status(400).json({
                success: false,
                message: "রেফারেল ব্যালেন্স শূন্য বা নেতিবাচক"
            });
        }
        // রেফারেল ব্যালেন্স থেকে মেইন ব্যালেন্সে ট্রান্সফার করুন
        user.balance += user.referralEarnings;
        user.referralEarnings = 0; // রেফারেল ব্যালেন্স শূন্য করুন
        user.total_bet=0;
        await user.save();
        res.send({
            success: true,
            message: "রেফারেল ব্যালেন্স সফলভাবে মেইন ব্যালেন্সে ট্রান্সফার হয়েছে",
            data: {
                balance: user.balance,
                referralEarnings: user.referralEarnings
            }
        });
    } catch (error) {
     console.log(error)
}});
// --------------------------------user-information-----------------------
user_route.get("/user-information/:id",ensureAuthenticated,async(req,res)=>{
  try {
    const userinfo=await User.findById({_id:req.params.id})
    if(!userinfo){
       return res.send({success:false,message:"User did not find!"})
    }
    res.send({success:true,data:userinfo})
  } catch (error) {
    console.log(error)
  }
})
// -------------------------after-play-------------------------------
user_route.put("/after-play-minus-balance",ensureAuthenticated,async(req,res)=>{
    try {
        const {betAmount,player_id}=req.body;
        console.log(req.body)
        const find_user=await UserModel.findOne({player_id:player_id});
        if(!find_user){
            return res.send({success:false,message:"User did not find!"})
        }
        // const update_user_balance=await UserModel.findByIdAndUpdate({_id:find_user._id});
        find_user.balance-=betAmount;
        res.send({success:true,message:"Ok"})
        find_user.save();
    } catch (err) {
        console.log(err)
    }
});
// ==================== EMAIL VERIFICATION ROUTES ====================

// Send email verification OTP
user_route.post("/send-email-verification-otp", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if email is already verified
        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Generate OTP
        const otp = user.generateEmailVerificationOTP();
        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
   user: "support@genzz.casino",
        pass: "rpsu nvzi yqai wdwc",
            },
        });

        const mailOptions = {
            from: "Genzz Casino Support <support@genzz.casino>",
            to: user.email,
            subject: "Verify Your Email - Genzz Casino",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #4A90E2; text-align: center;">Email Verification - Genzz Casino</h2>
                    <p>Hello ${user.username},</p>
                    <p>Please use the following OTP to verify your email address:</p>
                    <p style="text-align: center; font-size: 18px; font-weight: bold; color: #333;">Your OTP Code:</p>
                    <div style="text-align: center; font-size: 24px; font-weight: bold; color: #4A90E2; padding: 10px; border: 2px dashed #4A90E2; display: inline-block; margin: auto;">
                        ${otp}
                    </div>
                    <p style="text-align: center; font-size: 14px; color: #555;">
                        This OTP is valid for 10 minutes. Do not share this code with anyone.
                    </p>
                    <p><strong>Security Tip:</strong> This OTP will expire after 10 minutes or 5 failed attempts.</p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                    <p style="margin-top: 20px; font-size: 14px; color: #777;">
                        Best Regards,<br>
                        <strong>Genzz Casino Support Team</strong>
                    </p>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Error sending email verification OTP:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to send verification email"
                });
            }
            
            res.json({
                success: true,
                message: "Email verification OTP sent successfully",
                data: {
                    email: user.email,
                    expiresIn: "10 minutes",
                    attemptsRemaining: 5
                }
            });
        });

    } catch (error) {
        console.error("Email verification OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send email verification OTP"
        });
    }
});

// Verify email with OTP
user_route.post("/verify-email-otp", ensureAuthenticated, async (req, res) => {
    try {
        const { userId, otpCode } = req.body;

        if (!userId || !otpCode) {
            return res.status(400).json({
                success: false,
                message: "User ID and OTP code are required"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Verify OTP
        const verificationResult = await user.verifyEmailOTP(otpCode);
        
        if (!verificationResult.success) {
            await user.save(); // Save to update attempt count
            return res.status(400).json({
                success: false,
                message: verificationResult.message,
                attemptsRemaining: verificationResult.attemptsRemaining
            });
        }

        await user.save();

        res.json({
            success: true,
            message: "Email verified successfully!",
            data: {
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                verifiedAt: new Date()
            }
        });

    } catch (error) {
        console.error("Email verification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify email"
        });
    }
});

// Check email verification status
user_route.get("/check-email-verification/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: {
                email: user.email,
                isEmailVerified: user.isEmailVerified,
                hasPendingOTP: user.isEmailVerificationOTPValid(),
                lastSentAt: user.emailVerificationOTP?.lastSentAt,
                attempts: user.emailVerificationOTP?.attempts || 0
            }
        });

    } catch (error) {
        console.error("Check email verification error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check email verification status"
        });
    }
});

// ==================== KYC SUBMISSION ROUTES ====================

// Submit KYC information
user_route.post("/submit-kyc", ensureAuthenticated, async (req, res) => {
    try {
        const { 
            userId,
            fullLegalName,
            dateOfBirth,
            voterIdNumber,
            nationality = 'Bangladeshi',
            permanentAddress,
            presentAddress,
            isSameAsPermanent = false
        } = req.body;

        // Validate required fields
        if (!userId || !fullLegalName || !dateOfBirth || !voterIdNumber) {
            return res.status(400).json({
                success: false,
                message: "Full legal name, date of birth, and voter ID number are required"
            });
        }

        // Validate email is verified
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email before submitting KYC"
            });
        }

        // Check if KYC is already submitted
        if (user.kycStatus !== 'unverified') {
            return res.status(400).json({
                success: false,
                message: `KYC is already ${user.kycStatus}. Cannot submit again.`
            });
        }

        // Prepare KYC data
        const kycData = {
            fullLegalName: fullLegalName.trim(),
            dateOfBirth: new Date(dateOfBirth),
            voterIdNumber: voterIdNumber.trim(),
            nationality: nationality,
            permanentAddress: permanentAddress || {},
            submittedAt: new Date()
        };

        // Handle present address
        if (isSameAsPermanent && permanentAddress) {
            kycData.presentAddress = { ...permanentAddress };
            kycData.isSameAsPermanent = true;
        } else if (presentAddress) {
            kycData.presentAddress = presentAddress;
            kycData.isSameAsPermanent = false;
        }

        // Update user KYC info
        user.kycInfo = kycData;
        user.kycStatus = 'pending';


        await user.save();

        res.status(200).json({
            success: true,
            message: "KYC information submitted successfully for verification",
            data: {
                kycStatus: user.kycStatus,
                submittedAt: user.kycInfo.submittedAt,
                fullLegalName: user.kycInfo.fullLegalName,
                voterIdNumber: user.kycInfo.voterIdNumber
            }
        });

    } catch (error) {
        console.error("KYC submission error:", error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: "KYC validation failed",
                errors: errors
            });
        }

        res.status(500).json({
            success: false,
            message: "Failed to submit KYC information",
            error: error.message
        });
    }
});

// Upload KYC documents
// Add at the top with other imports
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BonusHistory = require("../Models/BonusHistoryModel");

// Configure multer storage
// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
const uploadDir = '/tmp/kyc-documents'; // or C:\temp\ on Windows
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'kyc-' + uniqueSuffix + ext);
  }
});

// File filter to accept ALL file types
const fileFilter = (req, file, cb) => {
  // Accept all file types by always returning true
  cb(null, true);
};

// Configure multer with no file size limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: Infinity, // No file size limit
    files: 5 // Optional: You can still limit number of files if needed
  }
});

// Update the existing KYC document upload route to use multer
user_route.post("/upload-kyc-documents", ensureAuthenticated, upload.array('documents', 2), async (req, res) => {
  try {
    const { 
      userId,
      documentType // 'voter_id', 'passport', 'driving_license', 'national_id'
    } = req.body;

    console.log('Upload KYC request:', { userId, documentType, files: req.files });

    if (!userId || !documentType || !req.files || req.files.length === 0) {
      // Clean up uploaded files if validation fails
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({
        success: false,
        message: "User ID, document type, and at least one document file are required"
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      // Clean up uploaded files if user not found
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if KYC is submitted
    if (user.kycStatus === 'unverified') {
      // Clean up uploaded files
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({
        success: false,
        message: "Please submit KYC information first before uploading documents"
      });
    }

    // Process uploaded files
    const frontImage = req.files[0] ? `/public/kyc-documents/${req.files[0].filename}` : null;
    const backImage = req.files[1] ? `/public/kyc-documents/${req.files[1].filename}` : null;

    // Check if document already exists
    const existingDocIndex = user.kycDocuments.findIndex(
      doc => doc.documentType === documentType
    );

    const documentData = {
      documentType: documentType,
      frontImage: frontImage,
      backImage: backImage,
      status: 'pending',
      submittedAt: new Date()
    };

    if (existingDocIndex !== -1) {
      // Update existing document - clean up old files first
      const oldDoc = user.kycDocuments[existingDocIndex];
      if (oldDoc.frontImage && fs.existsSync(`.${oldDoc.frontImage}`)) {
        fs.unlinkSync(`.${oldDoc.frontImage}`);
      }
      if (oldDoc.backImage && fs.existsSync(`.${oldDoc.backImage}`)) {
        fs.unlinkSync(`.${oldDoc.backImage}`);
      }
      
      user.kycDocuments[existingDocIndex] = documentData;
    } else {
      // Add new document
      user.kycDocuments.push(documentData);
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `${documentType.replace('_', ' ').toUpperCase()} document uploaded successfully`,
      data: {
        documentType: documentType,
        frontImage: frontImage,
        backImage: backImage,
        status: 'pending',
        submittedAt: new Date()
      }
    });

  } catch (error) {
    console.error("KYC document upload error:", error);
    
    // Clean up uploaded files on error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to upload KYC documents",
      error: error.message
    });
  }
});
// Combined KYC submission with document upload
// Combined KYC submission with document upload - FIXED VERSION
user_route.post("/submit-kyc-with-documents", ensureAuthenticated, 
  upload.array('documents', 2), 
  async (req, res) => {
    try {
      const { 
        userId,
        fullLegalName,
        dateOfBirth,
        voterIdNumber,
        nationality = 'Bangladeshi',
        permanentAddress,
        presentAddress,
        isSameAsPermanent = false,
        documentType = 'voter_id'
      } = req.body;

      console.log('Combined KYC submission:', { 
        userId, 
        fullLegalName, 
        documentType, 
        files: req.files,
        kycStatus: 'resubmission' // Added for debugging
      });

      // Parse address objects from JSON strings
      let parsedPermanentAddress = {};
      let parsedPresentAddress = {};
      
      try {
        if (permanentAddress) {
          parsedPermanentAddress = typeof permanentAddress === 'string' 
            ? JSON.parse(permanentAddress) 
            : permanentAddress;
        }
        
        if (presentAddress) {
          parsedPresentAddress = typeof presentAddress === 'string' 
            ? JSON.parse(presentAddress) 
            : presentAddress;
        }
      } catch (parseError) {
        console.error('Error parsing address JSON:', parseError);
        // Clean up uploaded files if parsing fails
        if (req.files) {
          req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
        return res.status(400).json({
          success: false,
          message: "Invalid address format"
        });
      }

      // Validate required fields
      if (!userId || !fullLegalName || !dateOfBirth || !voterIdNumber) {
        // Clean up uploaded files if validation fails
        if (req.files) {
          req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
        return res.status(400).json({
          success: false,
          message: "Full legal name, date of birth, and voter ID number are required"
        });
      }

      // Validate email is verified
      const user = await UserModel.findById(userId);
      if (!user) {
        // Clean up uploaded files if user not found
        if (req.files) {
          req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      if (!user.isEmailVerified) {
        // Clean up uploaded files
        if (req.files) {
          req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
        return res.status(400).json({
          success: false,
          message: "Please verify your email before submitting KYC"
        });
      }

      // Check if KYC is already verified
      if (user.kycStatus === 'verified') {
        // Clean up uploaded files
        if (req.files) {
          req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
        return res.status(400).json({
          success: false,
          message: "KYC is already verified. Cannot submit again."
        });
      }

      // Check if user has reached maximum rejection attempts (3)
      if (user.kycRejectedCount >= 3) {
        // Clean up uploaded files
        if (req.files) {
          req.files.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
        }
        return res.status(400).json({
          success: false,
          message: "Maximum KYC rejection limit (3) reached. You cannot submit KYC again. Please contact support.",
          maxReached: true,
          kycRejectedCount: user.kycRejectedCount
        });
      }

      // Prepare KYC data with parsed addresses
      const kycData = {
        fullLegalName: fullLegalName.trim(),
        dateOfBirth: new Date(dateOfBirth),
        voterIdNumber: voterIdNumber.trim(),
        nationality: nationality,
        permanentAddress: parsedPermanentAddress,
        submittedAt: new Date(),
        documentType: documentType,
        previousStatus: user.kycStatus, // Store previous status for history
        resubmissionCount: user.kycStatus === 'rejected' ? (user.kycResubmissionCount || 0) + 1 : 0
      };

      // Handle present address
      const isSameAsPermBool = isSameAsPermanent === 'true' || isSameAsPermanent === true;
      
      if (isSameAsPermBool && parsedPermanentAddress && Object.keys(parsedPermanentAddress).length > 0) {
        kycData.presentAddress = { ...parsedPermanentAddress };
        kycData.isSameAsPermanent = true;
      } else if (parsedPresentAddress && Object.keys(parsedPresentAddress).length > 0) {
        kycData.presentAddress = parsedPresentAddress;
        kycData.isSameAsPermanent = false;
      } else {
        kycData.presentAddress = { ...parsedPermanentAddress };
        kycData.isSameAsPermanent = true;
      }

      // Clear previous rejection info if resubmitting
      if (user.kycStatus === 'rejected') {
        kycData.rejectionReason = undefined;
        kycData.rejectedAt = undefined;
        kycData.rejectedByAdmin = undefined;
        kycData.allowResubmission = undefined;
      }

      console.log('Parsed KYC Data:', {
        fullLegalName: kycData.fullLegalName,
        dateOfBirth: kycData.dateOfBirth,
        voterIdNumber: kycData.voterIdNumber,
        permanentAddress: kycData.permanentAddress,
        presentAddress: kycData.presentAddress,
        isSameAsPermanent: kycData.isSameAsPermanent,
        previousStatus: kycData.previousStatus,
        resubmissionCount: kycData.resubmissionCount
      });

      // Update user KYC info
      const previousStatus = user.kycStatus;
      user.kycInfo = kycData;
      user.kycStatus = 'pending';
      user.kycSubmitted = true;
      user.kycCompleted = false;
      
      // Update resubmission count if applicable
      if (previousStatus === 'rejected') {
        user.kycResubmissionCount = (user.kycResubmissionCount || 0) + 1;
      }

      // Process uploaded files if any
      if (req.files && req.files.length > 0) {
        const frontImage = req.files[0] ? `/uploads/kyc-documents/${req.files[0].filename}` : null;
        const backImage = req.files[1] ? `/uploads/kyc-documents/${req.files[1].filename}` : null;

        const documentData = {
          documentType: documentType,
          frontImage: frontImage,
          backImage: backImage,
          status: 'pending',
          submittedAt: new Date(),
          submissionNumber: (user.kycDocuments?.length || 0) + 1,
          isResubmission: previousStatus === 'rejected',
          previousSubmissionId: previousStatus === 'rejected' && user.kycDocuments?.length > 0 
            ? user.kycDocuments[user.kycDocuments.length - 1]._id 
            : null
        };

        // Add document
        if (!user.kycDocuments) {
          user.kycDocuments = [];
        }
        user.kycDocuments.push(documentData);
      }

      // Add note for resubmission if applicable
      if (previousStatus === 'rejected') {
        const resubmissionNote = {
          note: `KYC resubmitted by user after rejection. Resubmission count: ${kycData.resubmissionCount}. Previous rejection reason: ${user.kycInfo?.rejectionReason || 'Not specified'}`,
          createdAt: new Date(),
          createdBy: 'user'
        };
        if (!user.notes) {
          user.notes = [];
        }
        user.notes.push(resubmissionNote);
        
        console.log(`User ${userId} resubmitting KYC. Resubmission count: ${kycData.resubmissionCount}`);
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: previousStatus === 'rejected' 
          ? "KYC resubmitted successfully for verification" 
          : "KYC information and documents submitted successfully for verification",
        data: {
          kycStatus: user.kycStatus,
          submittedAt: user.kycInfo.submittedAt,
          fullLegalName: user.kycInfo.fullLegalName,
          voterIdNumber: user.kycInfo.voterIdNumber,
          hasDocuments: user.kycDocuments.length > 0,
          isResubmission: previousStatus === 'rejected',
          resubmissionCount: kycData.resubmissionCount || 0,
          kycRejectedCount: user.kycRejectedCount || 0,
          remainingAttempts: Math.max(0, 3 - (user.kycRejectedCount || 0)),
          documentId: user.kycDocuments && user.kycDocuments.length > 0 
            ? user.kycDocuments[user.kycDocuments.length - 1]._id 
            : null
        }
      });

    } catch (error) {
      console.error("Combined KYC submission error:", error);
      
      // Clean up uploaded files on error
      if (req.files) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: "KYC validation failed",
          errors: errors
        });
      }

      // Handle duplicate voter ID
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "This voter ID number is already registered with another account"
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to submit KYC information and documents",
        error: error.message
      });
    }
  }
);
// Add a new route to delete KYC document
user_route.delete("/delete-kyc-document/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const { documentType } = req.body;

    if (!userId || !documentType) {
      return res.status(400).json({
        success: false,
        message: "User ID and document type are required"
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const documentIndex = user.kycDocuments.findIndex(
      doc => doc.documentType === documentType
    );

    if (documentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Document not found"
      });
    }

    // Delete the files from server
    const document = user.kycDocuments[documentIndex];
    if (document.frontImage && fs.existsSync(`.${document.frontImage}`)) {
      fs.unlinkSync(`.${document.frontImage}`);
    }
    if (document.backImage && fs.existsSync(`.${document.backImage}`)) {
      fs.unlinkSync(`.${document.backImage}`);
    }

    // Remove document from array
    user.kycDocuments.splice(documentIndex, 1);

    await user.save();

    res.status(200).json({
      success: true,
      message: "KYC document deleted successfully"
    });

  } catch (error) {
    console.error("Delete KYC document error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete KYC document",
      error: error.message
    });
  }
});

// Add a route to get KYC document URLs
user_route.get("/kyc-documents/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        kycDocuments: user.kycDocuments,
        kycStatus: user.kycStatus
      }
    });

  } catch (error) {
    console.error("Get KYC documents error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get KYC documents"
    });
  }
});

// Add a route to serve KYC document files
user_route.get("/kyc-document-file/:filename", ensureAuthenticated, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'uploads', 'kyc-documents', filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found"
      });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error("Serve KYC file error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to serve file"
    });
  }
});

// Get KYC status
user_route.get("/kyc-status/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                kycStatus: user.kycStatus,
                emailVerified: user.isEmailVerified,
                kycInfo: user.kycInfo,
                kycDocuments: user.kycDocuments,
                canSubmitKYC: user.isEmailVerified && user.kycStatus === 'unverified',
                lastUpdated: user.kycInfo?.submittedAt
            }
        });

    } catch (error) {
        console.error("Get KYC status error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get KYC status"
        });
    }
});

// ==================== ADMIN KYC ROUTES ====================

// Admin: Get all pending KYC submissions
user_route.get("/admin/kyc/pending", ensureAuthenticated, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin privileges required."
            });
        }

        const pendingKYC = await UserModel.find({
            kycStatus: 'pending'
        })
        .select('username email player_id kycInfo kycDocuments createdAt')
        .sort({ 'kycInfo.submittedAt': 1 });

        res.status(200).json({
            success: true,
            data: pendingKYC,
            count: pendingKYC.length
        });

    } catch (error) {
        console.error("Admin KYC pending error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending KYC submissions"
        });
    }
});

// Admin: Verify KYC
user_route.put("/admin/kyc/verify", ensureAuthenticated, async (req, res) => {
    try {
        const { adminId, userId, approved, rejectionReason } = req.body;

        // Validate
        if (!adminId || !userId || approved === undefined) {
            return res.status(400).json({
                success: false,
                message: "Admin ID, User ID, and approval status are required"
            });
        }

        // Check if admin exists and has permission
        const admin = await UserModel.findById(adminId);
        if (!admin || (admin.role !== 'admin' && admin.role !== 'super_admin')) {
            return res.status(403).json({
                success: false,
                message: "Admin privileges required"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.kycStatus !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `KYC is already ${user.kycStatus}`
            });
        }

        if (approved) {
            // Approve KYC
            user.kycStatus = 'verified';
            user.kycInfo.verifiedAt = new Date();
            user.kycInfo.verifiedBy = adminId;
            
            // Update all KYC documents to verified
            user.kycDocuments = user.kycDocuments.map(doc => ({
                ...doc.toObject(),
                status: 'verified',
                verifiedAt: new Date()
            }));

            res.status(200).json({
                success: true,
                message: "KYC verified successfully",
                data: {
                    kycStatus: user.kycStatus,
                    verifiedAt: user.kycInfo.verifiedAt,
                    verifiedBy: admin.username
                }
            });
        } else {
            // Reject KYC
            if (!rejectionReason) {
                return res.status(400).json({
                    success: false,
                    message: "Rejection reason is required when rejecting KYC"
                });
            }

            user.kycStatus = 'rejected';
            user.kycInfo.rejectionReason = rejectionReason;
            
            // Update all KYC documents to rejected
            user.kycDocuments = user.kycDocuments.map(doc => ({
                ...doc.toObject(),
                status: 'rejected'
            }));
            res.status(200).json({
                success: true,
                message: "KYC rejected",
                data: {
                    kycStatus: user.kycStatus,
                    rejectionReason: rejectionReason,
                    rejectedAt: new Date()
                }
            });
        }

        await user.save();

    } catch (error) {
        console.error("Admin KYC verify error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process KYC verification"
        });
    }
});

// Resend email verification OTP
user_route.post("/resend-email-verification-otp", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        const result = user.resendEmailVerificationOTP();
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message
            });
        }

        await user.save();

        // Send email (same as send-email-verification-otp route)
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "support@genzz.casino",
                pass: "rpsu nvzi yqai wdwc",
            },
        });

        const mailOptions = {
            from: "Genzz Casino Support <support@genzz.casino>",
            to: user.email,
            subject: "Verify Your Email - Genzz Casino (Resend)",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #4A90E2; text-align: center;">Email Verification - Genzz Casino</h2>
                    <p>Hello ${user.username},</p>
                    <p>Please use the following OTP to verify your email address:</p>
                    <p style="text-align: center; font-size: 18px; font-weight: bold; color: #333;">Your OTP Code:</p>
                    <div style="text-align: center; font-size: 24px; font-weight: bold; color: #4A90E2; padding: 10px; border: 2px dashed #4A90E2; display: inline-block; margin: auto;">
                        ${result.otp}
                    </div>
                    <p style="text-align: center; font-size: 14px; color: #555;">
                        This OTP is valid for 10 minutes. Do not share this code with anyone.
                    </p>
                    <p>If you didn't request this verification, please ignore this email.</p>
                    <p style="margin-top: 20px; font-size: 14px; color: #777;">
                        Best Regards,<br>
                        <strong>Genzz Casino Support Team</strong>
                    </p>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Error resending email verification OTP:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to resend verification email"
                });
            }
            
            res.json({
                success: true,
                message: "Email verification OTP resent successfully",
                data: {
                    email: user.email,
                    expiresIn: "10 minutes",
                    attemptsRemaining: 5 - (user.emailVerificationOTP?.attempts || 0)
                }
            });
        });

    } catch (error) {
        console.error("Resend email verification OTP error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to resend email verification OTP"
        });
    }
});
// ---------------------deposit-system--------------------------------
// -----------------for-localhost--------------------
// const PAYMENT_CONFIG = {
//   BASE_URL: process.env.PAYMENT_GATEWAY_URL || 'http://localhost:8080',
//   API_KEY: process.env.PAYMENT_GATEWAY_API_KEY || '65bc6725e76c3792719c',
//   FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5178'
// };
// ---------------------for-live----------------------------
const PAYMENT_CONFIG = {
  BASE_URL: process.env.PAYMENT_GATEWAY_URL || 'https://backend.credixopay.com',
  API_KEY: process.env.PAYMENT_GATEWAY_API_KEY || '18e5f948356de68e2909',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://genzz.casino'
};

// user_route.post('/initiate', async (req, res) => {
//     const { 
//         method, 
//         amount, 
//         bonusType = 'none',  // Default to 'none' for no bonus
//         bonusId, 
//         bonusCode, 
//         bonusAmount, 
//         bonusName, 
//         bonusPercentage, 
//         bonusMaxAmount, 
//         wageringRequirement,
//         balanceType = 'cash_balance', // Default to cash_balance for regular deposits
//         userid,
//         playerbalance,
//         waigergamecategory = [],
//         gameCategory = null,
//         orderId
//     } = req.body;
    
//     console.log('Deposit initiate request:', req.body);
    
//     try {
//         // Validate inputs
//         if (!method || !amount || !userid) {
//             return res.status(400).json({ 
//                 success: false,
//                 message: 'Method, amount and user ID are required' 
//             });
//         }

//         const amountNum = parseFloat(amount);
//         if (isNaN(amountNum)) {
//             return res.status(400).json({ 
//                 success: false,
//                 message: 'অনুগ্রহ করে একটি বৈধ অর্থের পরিমাণ লিখুন' // Please enter a valid amount
//             });
//         }

//         if (amountNum < 300 || amountNum > 30000) {
//             return res.status(400).json({ 
//                 success: false,
//                 message: amountNum < 300 ? 
//                     'ন্যূনতম জমার পরিমাণ ৩০০ টাকা' : // Minimum deposit amount is 300 BDT
//                     'সর্বোচ্চ জমার পরিমাণ ৩০,০০০ টাকা' // Maximum deposit amount is 30,000 BDT
//             });
//         }
       
//         const user = await User.findById(userid);
//         if (!user) {
//             return res.status(404).json({ 
//                 success: false,
//                 message: 'User not found' 
//             });
//         }

//         // Check if user has mobile number
//         if (!user.phone) {
//             return res.status(400).json({ 
//                 success: false,
//                 message: 'অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে একটি মোবাইল নম্বর যোগ করুন' // Please add mobile number first
//             });
//         }

//         // Validate bonus selection
//         if (bonusType && bonusType !== 'none') {
//             // If it's a dynamic bonus with bonusId
//             if (bonusId) {
//                 console.log(`Dynamic bonus selected: ${bonusId}, Code: ${bonusCode}`);
              
//             }
//             // For old static bonuses (backward compatibility)
//             else {
//                 // Calculate account age in days
//                 const accountAgeInDays = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));
//                 const isNewUser = accountAgeInDays < 3;
//                 const firstDepositBonusAvailable = !user.bonusInfo.firstDepositBonusClaimed && user.total_deposit === 0;
//                 const specialBonusAvailable = isNewUser && user.total_deposit === 0 && 
//                                            !user.bonusInfo.activeBonuses.some(b => b.bonusType === 'special_bonus');

//                 if (bonusType === 'first_deposit' && !firstDepositBonusAvailable) {
//                     return res.status(400).json({ 
//                         success: false,
//                         message: 'প্রথম ডিপোজিট বোনাস পাওয়ার জন্য আপনি অযোগ্য' // Not eligible for first deposit bonus
//                     });
//                 }
                
//                 if (bonusType === 'special_bonus' && !specialBonusAvailable) {
//                     return res.status(400).json({ 
//                         success: false,
//                         message: 'বিশেষ বোনাস পাওয়ার জন্য আপনি অযোগ্য' // Not eligible for special bonus
//                     });
//                 }
//             }
//         }
        
//         // Validate balanceType - for deposits without bonus, default to cash_balance
//         const finalBalanceType = bonusType === 'none' ? 'cash_balance' : (balanceType || 'bonus_balance');
//         if (!['bonus_balance', 'cash_balance'].includes(finalBalanceType)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid balance type'
//             });
//         }
        
//         // Validate waigergamecategory if provided
//         if (waigergamecategory && !Array.isArray(waigergamecategory)) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'waigergamecategory must be an array'
//             });
//         }
        
//         // Generate transaction IDs
//         const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
//         const orderId = req.body.orderId;
//         const externalPaymentId = `${method.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
//         // Calculate bonus amount - only if bonusType is not 'none'
//         let finalBonusAmount = 0;
//         let finalWageringRequirement = 0;
        
//         if (bonusType && bonusType !== 'none') {
//             if (bonusAmount && !isNaN(parseFloat(bonusAmount))) {
//                 finalBonusAmount = parseFloat(bonusAmount);
//             } else if (bonusPercentage && !isNaN(parseFloat(bonusPercentage))) {
//                 // Calculate percentage-based bonus
//                 const percentage = parseFloat(bonusPercentage);
//                 finalBonusAmount = (amountNum * percentage) / 100;
                
//                 // Apply max bonus limit if provided
//                 if (bonusMaxAmount && !isNaN(parseFloat(bonusMaxAmount)) && finalBonusAmount > parseFloat(bonusMaxAmount)) {
//                     finalBonusAmount = parseFloat(bonusMaxAmount);
//                 }
//             }
            
//             // Set wagering requirement only for bonus deposits
//             finalWageringRequirement = wageringRequirement || 0;
//         }
        
//         // Create transaction record
//         const transactionData = {
//             transaction_id: transactionId,
//             customer_id: user._id.toString(),
//             customer_name: user.username,
//             customer_email: user.email,
//             customer_phone: user.phone,
//             payment_type: 'deposit',
//             payment_method: method.toLowerCase(),
//             amount: amountNum,
//             bonus_amount: finalBonusAmount,
//             bonus_type: bonusType,
//             balance_type: finalBalanceType,
//             post_balance: user.balance,
//             status: 'pending',
//             transaction_note: bonusType === 'none' 
//                 ? `Deposit initiated via ${method} (no bonus)`
//                 : `Deposit initiated via ${method}${bonusName ? ` with bonus: ${bonusName}` : ''}`,
//             updated_by: 'system',
//             bonusType: bonusType,
//             bonusAmount: finalBonusAmount,
//             wageringRequirement: wageringRequirement,
//             playerbalance: playerbalance || user.balance,
//             paymentId: null,
//             gameCategory: gameCategory,
//             waigergamecategory: waigergamecategory || []
//         };
        
//         // Save transaction to database
//         const transaction = new transaction_model(transactionData);
//         await transaction.save();

//         // Create deposit record
//         const deposit = {
//             method: method.toLowerCase(),
//             amount: amountNum,
//             status: 'pending',
//             transactionId: transactionId,
//             bonusApplied: finalBonusAmount > 0,
//             bonusType: bonusType,
//             bonusAmount: finalBonusAmount,
//             bonusCode: bonusCode || '',
//             wageringRequirement: finalWageringRequirement,
//             balanceType: finalBalanceType,
//             orderId: orderId,
//             paymentUrl: null,
//             paymentId: null,
//             externalPaymentId: externalPaymentId,
//             userIdentifyAddress: `${user._id}-${user.player_id}`,
//             playerbalance: playerbalance || user.balance,
//             waigergamecategory: Array.isArray(waigergamecategory) ? waigergamecategory : [],
//             gameCategory: gameCategory,
//             processedAt: null,
//             completedAt: null,
//             createdAt: new Date(),
//             // Flags for tracking
//             isBonusDeposit: bonusType !== 'none',
//             isCashOnlyDeposit: bonusType === 'none'
//         };

//         // Add optional bonus fields if provided
//         if (bonusId) deposit.bonusId = bonusId;
//         if (bonusName) deposit.bonusName = bonusName;
//         if (bonusPercentage) deposit.bonusPercentage = bonusPercentage;
//         if (bonusMaxAmount) deposit.bonusMaxAmount = bonusMaxAmount;

//         // Add deposit to user's depositHistory
//         user.depositHistory.push(deposit);
//         await user.save();

//         // Prepare payment gateway payload
//         const paymentPayload = {
//             provider: method.toLowerCase(),
//             amount: amountNum,
//             orderId: orderId,
//             transactionId: transactionId,
//             currency: "BDT",
//             payerId: user.player_id,
//             redirectUrl: `http://genzz.casino`,
//             callbackUrl: `https://admin2.genzz.casino/user/callback`,
//             metadata: {
//                 userId: user._id.toString(),
//                 transactionId: transactionId,
//                 bonusId: bonusId || null,
//                 bonusCode: bonusCode || null,
//                 bonusType: bonusType,
//                 bonusAmount: finalBonusAmount,
//                 wageringRequirement: finalWageringRequirement,
//                 balanceType: finalBalanceType,
//                 gameCategory: gameCategory || null,
//                 waigergamecategory: waigergamecategory || [],
//                 depositId: deposit._id ? deposit._id.toString() : null,
//                 isBonusDeposit: bonusType !== 'none',
//                 isCashOnlyDeposit: bonusType === 'none'
//             }
//         };


//             //         redirectUrl: `http://genzz.casino`,
//             // callbackUrl: `https://admin2.genzz.casino/user/callback`,

//             //  redirectUrl: `http://localhost:5173`,
//             // callbackUrl: `http://localhost:8000/user/callback`,
//         // Call payment gateway API
//         const paymentResponse = await axios.post(
//             `${PAYMENT_CONFIG.BASE_URL}/api/payment/payment`,
//             paymentPayload,
//             {
//                 headers: {
//                     'x-api-key': PAYMENT_CONFIG.API_KEY,
//                     'Content-Type': 'application/json'
//                 }
//             }
//         );
        
//         if (!paymentResponse.data || !paymentResponse.data.success) {
//             // Update transaction status if payment fails
//             await transaction_model.updateOne(
//                 { transaction_id: transactionId },
//                 { 
//                     status: 'failed',
//                     gateway_response: paymentResponse.data || {},
//                     reason: paymentResponse.data?.message || 'Payment gateway error',
//                     updated_by: 'system',
//                     updated_at: new Date()
//                 }
//             );
            
//             // Also update user's deposit history
//             const depositIndex = user.depositHistory.length - 1;
//             if (depositIndex >= 0) {
//                 user.depositHistory[depositIndex].status = 'failed';
//                 await user.save();
//             }
            
//             throw new Error(paymentResponse.data?.message || 'Failed to initiate payment');
//         }
        
//         // Update transaction with payment gateway response and paymentId
//         await transaction_model.updateOne(
//             { transaction_id: transactionId },
//             { 
//                 gateway_response: paymentResponse.data,
//                 paymentId: paymentResponse.data.paymentId || null,
//                 updated_by: 'system',
//                 updated_at: new Date()
//             }
//         );
        
//         // Update user's deposit history with payment URL and paymentId
//         const depositIndex = user.depositHistory.length - 1;
//         if (depositIndex >= 0) {
//             user.depositHistory[depositIndex].paymentUrl = paymentResponse.data.redirectUrl || 
//                      `https://credixopay.com/checkout/${paymentResponse.data.paymentId}`
//             user.depositHistory[depositIndex].paymentId = paymentResponse.data.paymentId || null;
//             await user.save();
//         }
        
//         res.json({
//             success: true,
//             message: 'অর্থপ্রদান সফলভাবে শুরু হয়েছে৷',
//             paymentId: paymentResponse.data.paymentId,
//             transactionId: transactionId,
//             orderId: orderId,
//             depositId: user.depositHistory[depositIndex]?._id || null,
//             redirectUrl: paymentResponse.data.redirectUrl || 
//         `https://credixopay.com/checkout/${paymentResponse.data.paymentId}`,
//             depositDetails: {
//                 amount: amountNum,
//                 bonusAmount: finalBonusAmount,
//                 bonusType: bonusType,
//                 balanceType: finalBalanceType,
//                 wageringRequirement: finalWageringRequirement,
//                 gameCategory: gameCategory,
//                 waigergamecategory: waigergamecategory || [],
//                 status: 'pending',
//                 isBonusDeposit: bonusType !== 'none',
//                 isCashOnlyDeposit: bonusType === 'none'
//             }
//         });

//     } catch (error) {
//         console.error('Deposit initiation error:', error);
//         res.status(500).json({ 
//             success: false,
//             message: error.response?.data?.message || error.message || 'Payment failed. Please try again.' 
//         });
//     }
// });

user_route.post('/initiate', async (req, res) => {
    const { 
        method, 
        amount, 
        bonusType = 'none',  // Default to 'none' for no bonus
        bonusId, 
        bonusCode, 
        bonusAmount, 
        bonusName, 
        bonusPercentage, 
        bonusMaxAmount, 
        wageringRequirement,
        balanceType = 'cash_balance', // Default to cash_balance for regular deposits
        userid,
        playerbalance,
        waigergamecategory = [],
        gameCategory = null,
        orderId
    } = req.body;
    
    console.log('Deposit initiate request:', req.body);
    
    try {
        // Validate inputs
        if (!method || !amount || !userid) {
            return res.status(400).json({ 
                success: false,
                message: 'Method, amount and user ID are required' 
            });
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum)) {
            return res.status(400).json({ 
                success: false,
                message: 'অনুগ্রহ করে একটি বৈধ অর্থের পরিমাণ লিখুন' // Please enter a valid amount
            });
        }

        if (amountNum < 300 || amountNum > 30000) {
            return res.status(400).json({ 
                success: false,
                message: amountNum < 300 ? 
                    'ন্যূনতম জমার পরিমাণ ৩০০ টাকা' : // Minimum deposit amount is 300 BDT
                    'সর্বোচ্চ জমার পরিমাণ ৩০,০০০ টাকা' // Maximum deposit amount is 30,000 BDT
            });
        }
       
        const user = await User.findById(userid);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Check if user has mobile number
        if (!user.phone) {
            return res.status(400).json({ 
                success: false,
                message: 'অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে একটি মোবাইল নম্বর যোগ করুন' // Please add mobile number first
            });
        }

        // Validate bonus selection
        if (bonusType && bonusType !== 'none') {
            // If it's a dynamic bonus with bonusId
            if (bonusId) {
                console.log(`Dynamic bonus selected: ${bonusId}, Code: ${bonusCode}`);
              
            }
            // For old static bonuses (backward compatibility)
            else {
                // Calculate account age in days
                const accountAgeInDays = Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24));
                const isNewUser = accountAgeInDays < 3;
                const firstDepositBonusAvailable = !user.bonusInfo.firstDepositBonusClaimed && user.total_deposit === 0;
                const specialBonusAvailable = isNewUser && user.total_deposit === 0 && 
                                           !user.bonusInfo.activeBonuses.some(b => b.bonusType === 'special_bonus');

                if (bonusType === 'first_deposit' && !firstDepositBonusAvailable) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'প্রথম ডিপোজিট বোনাস পাওয়ার জন্য আপনি অযোগ্য' // Not eligible for first deposit bonus
                    });
                }
                
                if (bonusType === 'special_bonus' && !specialBonusAvailable) {
                    return res.status(400).json({ 
                        success: false,
                        message: 'বিশেষ বোনাস পাওয়ার জন্য আপনি অযোগ্য' // Not eligible for special bonus
                    });
                }
            }
        }
        
        // Validate balanceType - for deposits without bonus, default to cash_balance
        const finalBalanceType = bonusType === 'none' ? 'cash_balance' : (balanceType || 'bonus_balance');
        if (!['bonus_balance', 'cash_balance'].includes(finalBalanceType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid balance type'
            });
        }
        
        // Validate waigergamecategory if provided
        if (waigergamecategory && !Array.isArray(waigergamecategory)) {
            return res.status(400).json({
                success: false,
                message: 'waigergamecategory must be an array'
            });
        }
        
        // Generate transaction IDs
        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const orderId = req.body.orderId;
        const externalPaymentId = `${method.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Calculate bonus amount - only if bonusType is not 'none'
        let finalBonusAmount = 0;
        let finalWageringRequirement = 0;
        
        if (bonusType && bonusType !== 'none') {
            if (bonusAmount && !isNaN(parseFloat(bonusAmount))) {
                finalBonusAmount = parseFloat(bonusAmount);
            } else if (bonusPercentage && !isNaN(parseFloat(bonusPercentage))) {
                // Calculate percentage-based bonus
                const percentage = parseFloat(bonusPercentage);
                finalBonusAmount = (amountNum * percentage) / 100;
                
                // Apply max bonus limit if provided
                if (bonusMaxAmount && !isNaN(parseFloat(bonusMaxAmount)) && finalBonusAmount > parseFloat(bonusMaxAmount)) {
                    finalBonusAmount = parseFloat(bonusMaxAmount);
                }
            }
            
            // Set wagering requirement only for bonus deposits
            finalWageringRequirement = wageringRequirement || 0;
        }
        
        // Create transaction record
        const transactionData = {
            transaction_id: transactionId,
            customer_id: user._id.toString(),
            customer_name: user.username,
            customer_email: user.email,
            customer_phone: user.phone,
            payment_type: 'deposit',
            payment_method: method.toLowerCase(),
            amount: amountNum,
            bonus_amount: finalBonusAmount,
            bonus_type: bonusType,
            balance_type: finalBalanceType,
            post_balance: user.balance,
            status: 'pending',
            transaction_note: bonusType === 'none' 
                ? `Deposit initiated via ${method} (no bonus)`
                : `Deposit initiated via ${method}${bonusName ? ` with bonus: ${bonusName}` : ''}`,
            updated_by: 'system',
            bonusType: bonusType,
            bonusAmount: finalBonusAmount,
            wageringRequirement: wageringRequirement,
            playerbalance: playerbalance || user.balance,
            paymentId: null,
            gameCategory: gameCategory,
            waigergamecategory: waigergamecategory || []
        };
        
        // Save transaction to database
        const transaction = new transaction_model(transactionData);
        await transaction.save();

        // Create deposit record
        const deposit = {
            method: method.toLowerCase(),
            amount: amountNum,
            status: 'pending',
            transactionId: transactionId,
            bonusApplied: finalBonusAmount > 0,
            bonusType: bonusType,
            bonusAmount: finalBonusAmount,
            bonusCode: bonusCode || '',
            wageringRequirement: finalWageringRequirement,
            balanceType: finalBalanceType,
            orderId: orderId,
            paymentUrl: null,
            paymentId: null,
            externalPaymentId: externalPaymentId,
            userIdentifyAddress: `${user._id}-${user.player_id}`,
            playerbalance: playerbalance || user.balance,
            waigergamecategory: Array.isArray(waigergamecategory) ? waigergamecategory : [],
            gameCategory: gameCategory,
            processedAt: null,
            completedAt: null,
            createdAt: new Date(),
            // Flags for tracking
            isBonusDeposit: bonusType !== 'none',
            isCashOnlyDeposit: bonusType === 'none'
        };

        // Add optional bonus fields if provided
        if (bonusId) deposit.bonusId = bonusId;
        if (bonusName) deposit.bonusName = bonusName;
        if (bonusPercentage) deposit.bonusPercentage = bonusPercentage;
        if (bonusMaxAmount) deposit.bonusMaxAmount = bonusMaxAmount;

        // Add deposit to user's depositHistory
        user.depositHistory.push(deposit);
        await user.save();

        // Check if method is bkash_fast - if yes, skip payment gateway call
        if (method.toLowerCase() === 'bkash_fast') {
            console.log('bkash_fast method detected - skipping payment gateway call');
            
            // Update transaction with pending status for manual processing
            await transaction_model.updateOne(
                { transaction_id: transactionId },
                { 
                    status: 'pending',
                    gateway_response: { message: 'Manual processing required' },
                    updated_by: 'system',
                    updated_at: new Date()
                }
            );
            
            // Update user's deposit history
            const depositIndex = user.depositHistory.length - 1;
            if (depositIndex >= 0) {
                user.depositHistory[depositIndex].paymentUrl = null;
                user.depositHistory[depositIndex].paymentId = null;
                user.depositHistory[depositIndex].status = 'pending';
                await user.save();
            }
            
            return res.json({
                success: true,
                message: 'অর্থপ্রদানের অনুরোধ গ্রহণ করা হয়েছে। অনুগ্রহ করে অপেক্ষা করুন।',
                transactionId: transactionId,
                orderId: orderId,
                depositId: user.depositHistory[depositIndex]?._id || null,
                redirectUrl: null,
                depositDetails: {
                    amount: amountNum,
                    bonusAmount: finalBonusAmount,
                    bonusType: bonusType,
                    balanceType: finalBalanceType,
                    wageringRequirement: finalWageringRequirement,
                    gameCategory: gameCategory,
                    waigergamecategory: waigergamecategory || [],
                    status: 'pending',
                    isBonusDeposit: bonusType !== 'none',
                    isCashOnlyDeposit: bonusType === 'none',
                    requiresManualProcessing: true
                }
            });
        }

        // For all other methods, proceed with payment gateway call
        // Prepare payment gateway payload
        const paymentPayload = {
            provider: method.toLowerCase(),
            amount: amountNum,
            orderId: orderId,
            transactionId: transactionId,
            currency: "BDT",
            payerId: user.player_id,
            redirectUrl: `http://genzz.casino`,
            callbackUrl: `https://admin2.genzz.casino/user/callback`,
            metadata: {
                userId: user._id.toString(),
                transactionId: transactionId,
                bonusId: bonusId || null,
                bonusCode: bonusCode || null,
                bonusType: bonusType,
                bonusAmount: finalBonusAmount,
                wageringRequirement: finalWageringRequirement,
                balanceType: finalBalanceType,
                gameCategory: gameCategory || null,
                waigergamecategory: waigergamecategory || [],
                depositId: deposit._id ? deposit._id.toString() : null,
                isBonusDeposit: bonusType !== 'none',
                isCashOnlyDeposit: bonusType === 'none'
            }
        };

        // Call payment gateway API
        const paymentResponse = await axios.post(
            `${PAYMENT_CONFIG.BASE_URL}/api/payment/payment`,
            paymentPayload,
            {
                headers: {
                    'x-api-key': PAYMENT_CONFIG.API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        if (!paymentResponse.data || !paymentResponse.data.success) {
            // Update transaction status if payment fails
            await transaction_model.updateOne(
                { transaction_id: transactionId },
                { 
                    status: 'failed',
                    gateway_response: paymentResponse.data || {},
                    reason: paymentResponse.data?.message || 'Payment gateway error',
                    updated_by: 'system',
                    updated_at: new Date()
                }
            );
            
            // Also update user's deposit history
            const depositIndex = user.depositHistory.length - 1;
            if (depositIndex >= 0) {
                user.depositHistory[depositIndex].status = 'failed';
                await user.save();
            }
            
            throw new Error(paymentResponse.data?.message || 'Failed to initiate payment');
        }
        
        // Update transaction with payment gateway response and paymentId
        await transaction_model.updateOne(
            { transaction_id: transactionId },
            { 
                gateway_response: paymentResponse.data,
                paymentId: paymentResponse.data.paymentId || null,
                updated_by: 'system',
                updated_at: new Date()
            }
        );
        
        // Update user's deposit history with payment URL and paymentId
        const depositIndex = user.depositHistory.length - 1;
        if (depositIndex >= 0) {
            user.depositHistory[depositIndex].paymentUrl = paymentResponse.data.redirectUrl || 
                     `https://credixopay.com/checkout/${paymentResponse.data.paymentId}`
            user.depositHistory[depositIndex].paymentId = paymentResponse.data.paymentId || null;
            await user.save();
        }
        
        res.json({
            success: true,
            message: 'অর্থপ্রদান সফলভাবে শুরু হয়েছে৷',
            paymentId: paymentResponse.data.paymentId,
            transactionId: transactionId,
            orderId: orderId,
            depositId: user.depositHistory[depositIndex]?._id || null,
            redirectUrl: paymentResponse.data.redirectUrl || 
        `https://credixopay.com/checkout/${paymentResponse.data.paymentId}`,
            depositDetails: {
                amount: amountNum,
                bonusAmount: finalBonusAmount,
                bonusType: bonusType,
                balanceType: finalBalanceType,
                wageringRequirement: finalWageringRequirement,
                gameCategory: gameCategory,
                waigergamecategory: waigergamecategory || [],
                status: 'pending',
                isBonusDeposit: bonusType !== 'none',
                isCashOnlyDeposit: bonusType === 'none'
            }
        });

    } catch (error) {
        console.error('Deposit initiation error:', error);
        res.status(500).json({ 
            success: false,
            message: error.response?.data?.message || error.message || 'Payment failed. Please try again.' 
        });
    }
});

user_route.post('/callback', async (req, res) => {
  const { paymentId, transactionId, status, amount, player_id } = req.body;
  console.log('callback-data', req.body);
  console.log('=== DEPOSIT CALLBACK STARTED ===');
  console.log(`Payment ID: ${paymentId}, Status: ${status}, Player ID: ${player_id}`);
  try {
    if (!paymentId || !status || !player_id) {
      console.log('❌ Invalid callback data - missing required fields');
      console.log(`Payment ID provided: ${!!paymentId}, Status provided: ${!!status}, Player ID provided: ${!!player_id}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid callback data'
      });
    }

    console.log(`🔍 Searching for user with pending deposit...`);
    console.log(`Search criteria: orderId=${paymentId}, status=pending, player_id=${player_id}`);
    
    // Find user with pending deposit
    const user = await User.findOne({
      'depositHistory.orderId': paymentId,
      'depositHistory.status': 'pending',
      player_id
    });
    
    if (!user) {
      console.log(`❌ User not found or deposit already processed for paymentId: ${paymentId}, player_id: ${player_id}`);
      console.log(`Possible reasons: User doesn't exist, deposit not pending, or already processed`);
      return res.status(404).json({
        success: false,
        message: 'Deposit not found or already processed'
      });
    }
    
    console.log(`✅ User found: ${user.player_id} (ID: ${user._id})`);
    console.log(`User balance before: ${user.balance}`);
    
    const balanceBefore = user.balance;
    console.log(`Balance before deposit: ${balanceBefore}`);

    // Find the specific deposit record
    console.log(`🔍 Searching for deposit record with orderId: ${paymentId}`);
    const depositIndex = user.depositHistory.findIndex(d => d.orderId === paymentId);
    console.log(`Deposit index found: ${depositIndex}`);
    
    if (depositIndex === -1) {
      console.log(`❌ Deposit record not found for orderId: ${paymentId}`);
      console.log(`Available orderIds: ${user.depositHistory.map(d => d.orderId).join(', ')}`);
      return res.status(404).json({
        success: false,
        message: 'Deposit record not found'
      });
    }

    const deposit = user.depositHistory[depositIndex];
    console.log(`✅ Deposit record found at index ${depositIndex}`);
    console.log(`Deposit details: Amount: ${deposit.amount}, Method: ${deposit.method}, Bonus Type: ${deposit.bonusType}`);
    console.log(`Is bonus deposit: ${deposit.bonusType !== 'none'}, Is cash only: ${deposit.bonusType === 'none'}`);

    // Find the corresponding transaction
    console.log(`🔍 Searching for transaction with ID: ${deposit.transactionId}`);
    const transaction = await transaction_model.findOne({
      transaction_id: deposit.transactionId
    });

    if (!transaction) {
      console.error(`❌ Transaction not found for ID: ${deposit.transactionId}`);
    } else {
      console.log(`✅ Transaction found: ${transaction.transaction_id}, Status: ${transaction.status}`);
    }

    if (status === 'success' || status === 'completed') {
      console.log(`✅ Payment status is SUCCESS for paymentId: ${paymentId}`);
      
      // Verify amount matches
      if (amount && Math.abs(parseFloat(amount) - deposit.amount) > 0.01) {
        console.warn(`⚠️ Amount mismatch for payment ${paymentId}. Expected: ${deposit.amount}, Received: ${amount}`);
        console.warn(`Difference: ${Math.abs(parseFloat(amount) - deposit.amount)}`);
      } else {
        console.log(`✅ Amount verified: ${deposit.amount} matches callback amount: ${amount || 'N/A'}`);
      }

      // Handle bonus or cash-only deposit
      console.log(`🔍 Checking deposit type...`);
      let bonusAmount = deposit.bonusAmount || 0;
      let balanceType = deposit.balanceType || 'cash_balance';
      let addToMainBalance = false;
      let wageringRequirement = deposit.wageringRequirement || 0;
      let bonusType = deposit.bonusType || 'none';
      let bonusName = deposit.bonusName || null;
      let bonusPercentage = deposit.bonusPercentage || null;
      let bonusMaxAmount = deposit.bonusMaxAmount || null;
      let gameCategory = deposit.gameCategory || null;
      let waigergamecategory = deposit.waigergamecategory || [];
      
      console.log(`Initial deposit settings: Amount=${deposit.amount}, Bonus Type=${bonusType}, Balance Type=${balanceType}, WR=${wageringRequirement}`);
      
      // Determine if this is a bonus deposit or cash-only deposit
      const isBonusDeposit = bonusType !== 'none';
      const isCashOnlyDeposit = bonusType === 'none';
      
      console.log(`Deposit type: ${isBonusDeposit ? 'BONUS DEPOSIT' : 'CASH-ONLY DEPOSIT'}`);
      
      // Handle waigergamecategory - ensure it's an array
      if (!Array.isArray(waigergamecategory)) {
        console.log(`⚠️ waigergamecategory is not an array, converting to empty array. Original: ${waigergamecategory}`);
        waigergamecategory = [];
      }
      
      if (isCashOnlyDeposit) {
        console.log(`💰 Processing CASH-ONLY deposit (no bonus)`);
        // For cash-only deposits, ensure balanceType is cash_balance
        balanceType = 'cash_balance';
        bonusAmount = 0;
        wageringRequirement = 0; // No wagering for cash-only deposits
        addToMainBalance = true; // Cash goes directly to main balance
        console.log(`Cash-only deposit: Amount ${deposit.amount} will be added to MAIN balance only`);
        
        // Clear any waigering need for cash-only deposits
        // IMPORTANT: Do NOT reset waigeringneed for cash-only deposits
        // Only update waigeringneed if there's an existing wagering requirement from previous bonus
        if (user.waigeringneed && user.waigeringneed > 0) {
          console.log(`⚠️ User has existing waigeringneed: ${user.waigeringneed} - KEEPING IT UNCHANGED for cash-only deposit`);
          console.log(`✅ waigeringneed remains: ${user.waigeringneed}`);
        } else {
          console.log(`User has no existing waigeringneed or it's 0`);
        }
        
        // Ensure waigergamecategory is not modified for cash-only deposits
        console.log(`⚠️ waigergamecategory NOT modified for cash-only deposit: ${JSON.stringify(user.waigergamecategory)}`);
      } else if (isBonusDeposit) {
        console.log(`🎁 Processing BONUS deposit`);
        
        // Check if it's a dynamic bonus
        const isDynamicBonus = deposit.bonusId && deposit.bonusCode;
        console.log(`Is dynamic bonus: ${isDynamicBonus} (Bonus ID: ${deposit.bonusId}, Bonus Code: ${deposit.bonusCode})`);
        
        // Determine where to add bonus based on balanceType
        if (balanceType === 'cash_balance') {
          addToMainBalance = true;
          console.log(`💰 Balance type is CASH_BALANCE - bonus will be added to MAIN balance`);
        } else {
          addToMainBalance = false;
          console.log(`🪙 Balance type is BONUS_BALANCE - bonus will be added to BONUS balance`);
        }
        
        // For dynamic bonuses, calculate bonus amount
        if (isDynamicBonus) {
          console.log(`🔄 Processing dynamic bonus: ${deposit.bonusCode}, Type: ${bonusType}, Balance Type: ${balanceType}`);
          
          if (deposit.bonusAmount && deposit.bonusAmount > 0) {
            bonusAmount = deposit.bonusAmount;
            console.log(`Using pre-calculated bonus amount: ${bonusAmount}`);
          } else if (bonusPercentage && deposit.amount) {
            // Calculate percentage-based bonus
            bonusAmount = (deposit.amount * bonusPercentage) / 100;
            console.log(`Calculated percentage bonus: ${deposit.amount} * ${bonusPercentage}% = ${bonusAmount}`);
            
            // Apply max bonus limit if provided
            if (bonusMaxAmount && bonusAmount > bonusMaxAmount) {
              console.log(`Applying max bonus limit: ${bonusAmount} -> ${bonusMaxAmount}`);
              bonusAmount = bonusMaxAmount;
            }
          }
          
          // Set wagering requirement from deposit data - ensure it's a number
          wageringRequirement = parseFloat(deposit.wageringRequirement) || 0;
          console.log(`Wagering requirement set to: ${wageringRequirement}x`);
          
          // Handle case where wagering requirement is 0 or not provided
          if (wageringRequirement <= 0) {
            console.log(`⚠️ No wagering requirement or wagering requirement is 0`);
            // Set wagering need to 0 if no wagering requirement
            user.waigeringneed = 0;
            console.log(`✅ Wagering need set to 0 (no wagering requirement)`);
            
            // Clear waigergamecategory if no wagering requirement
            waigergamecategory = [];
            console.log(`✅ waigergamecategory cleared (no wagering requirement)`);
          }
          
          // For cash balance bonuses, wagering might not apply
          if (balanceType === 'cash_balance') {
            console.log(`⚠️ Note: Wagering requirement may not apply to cash balance bonuses`);
            // For cash balance bonuses, set wagering need to 0
            user.waigeringneed = 0;
            console.log(`✅ Wagering need set to 0 for cash balance bonus`);
            
            // Clear waigergamecategory for cash balance bonuses
            waigergamecategory = [];
            console.log(`✅ waigergamecategory cleared for cash balance bonus`);
          }
        } else {
          // No legacy bonus system handling - only dynamic bonuses are supported
          console.log('⚠️ Legacy bonus system removed. Only dynamic bonuses are supported.');
          bonusAmount = 0;
          bonusType = 'none';
          wageringRequirement = 0;
          
          // Set wagering need to 0 for non-dynamic bonuses
          user.waigeringneed = 0;
          console.log(`✅ Wagering need set to 0 for non-dynamic bonus`);
          
          // Clear waigergamecategory for non-dynamic bonuses
          waigergamecategory = [];
          console.log(`✅ waigergamecategory cleared for non-dynamic bonus`);
        }
        
        // Create bonus record if bonus is applied
        if (bonusAmount > 0) {
          console.log(`💰 Creating bonus record: ${bonusAmount} for bonus type: ${bonusType}, Balance Type: ${balanceType}`);
          
          const bonusRecord = {
            bonusType: bonusType,
            amount: bonusAmount,
            originalAmount: bonusAmount,
            wageringRequirement: wageringRequirement,
            depositAmount: deposit.amount,
            amountWagered: 0,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + BONUS_CONFIG.BONUS_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
            status: 'active',
            balanceType: balanceType,
            addedToMainBalance: addToMainBalance,
            gameCategory: gameCategory,
            waigergamecategory: waigergamecategory
          };
          
          console.log(`Bonus record created:`, {
            amount: bonusRecord.amount,
            balanceType: bonusRecord.balanceType,
            wageringRequirement: bonusRecord.wageringRequirement,
            addedToMainBalance: bonusRecord.addedToMainBalance,
            gameCategory: bonusRecord.gameCategory,
            waigergamecategory: bonusRecord.waigergamecategory
          });
          
          // Add bonus name and code for dynamic bonuses
          if (isDynamicBonus) {
            bonusRecord.bonusName = bonusName;
            bonusRecord.bonusCode = deposit.bonusCode;
            console.log(`Dynamic bonus details: Name=${bonusName}, Code=${deposit.bonusCode}`);
          }
          
          user.bonusInfo.activeBonuses.push(bonusRecord);
          console.log(`✅ Bonus record added to user's active bonuses`);
          
          // If this is a private or single-user bonus, update the bonus's assigned user status
          if (isDynamicBonus && deposit.bonusId) {
            try {
              // Update the bonus to mark it as claimed for this user
              await axios.put(
                `${base_url}/admin/bonuses/${deposit.bonusId}/update-assigned-status`,
                {
                  userId: user._id,
                  status: 'claimed'
                },
                {
                  headers: {
                    'Authorization': `Bearer ${process.env.ADMIN_TOKEN || 'your-admin-token'}`,
                    'Content-Type': 'application/json'
                  }
                }
              );
              console.log(`✅ Bonus claim status updated for user ${user._id}`);
            } catch (bonusUpdateError) {
              console.error('Error updating bonus claim status:', bonusUpdateError.message);
            }
          }
        } else {
          console.log(`No bonus amount to apply (bonusAmount=${bonusAmount})`);
          
          // If no bonus amount, ensure wagering need is 0
          user.waigeringneed = 0;
          console.log(`✅ Wagering need set to 0 (no bonus amount)`);
          
          // Clear waigergamecategory if no bonus amount
          waigergamecategory = [];
          console.log(`✅ waigergamecategory cleared (no bonus amount)`);
        }
      }

      // Update deposit status with all fields
      console.log(`📝 Updating deposit record...`);
      const updatedDeposit = {
        ...deposit.toObject(),
        status: 'completed',
        externalPaymentId: transactionId || deposit.externalPaymentId,
        paymentId: paymentId,
        completedAt: new Date(),
        bonusAmount: bonusAmount,
        balanceType: balanceType,
        bonusApplied: bonusAmount > 0,
        bonusAddedToMainBalance: addToMainBalance,
        wageringRequirement: wageringRequirement,
        gameCategory: gameCategory,
        waigergamecategory: waigergamecategory,
        isBonusDeposit: isBonusDeposit,
        isCashOnlyDeposit: isCashOnlyDeposit
      };
      
      // Ensure all fields from schema are present
      updatedDeposit.method = updatedDeposit.method || deposit.method;
      updatedDeposit.transactionId = updatedDeposit.transactionId || deposit.transactionId;
      updatedDeposit.playerbalance = updatedDeposit.playerbalance || balanceBefore;
      
      console.log(`Updated deposit details:`, {
        status: updatedDeposit.status,
        amount: updatedDeposit.amount,
        bonusAmount: updatedDeposit.bonusAmount,
        bonusType: updatedDeposit.bonusType,
        balanceType: updatedDeposit.balanceType,
        wageringRequirement: updatedDeposit.wageringRequirement,
        waigergamecategory: updatedDeposit.waigergamecategory,
        isBonusDeposit: updatedDeposit.isBonusDeposit,
        isCashOnlyDeposit: updatedDeposit.isCashOnlyDeposit,
        completedAt: updatedDeposit.completedAt
      });
      
      user.depositHistory[depositIndex] = updatedDeposit;
      console.log(`✅ Deposit record updated in user's depositHistory`);

      // Update user balance and stats
      console.log(`💰 Updating user balance and statistics...`);
      user.balance += deposit.amount; // Add deposit amount to main balance
      console.log(`Balance after deposit: ${user.balance} (+${deposit.amount})`);
      
      user.total_deposit += deposit.amount;
      user.lifetime_deposit += deposit.amount;
      user.depositamount = deposit.amount;
      
      console.log(`User stats updated: total_deposit=${user.total_deposit}, lifetime_deposit=${user.lifetime_deposit}`);
      
      // Update user's waigergamecategory field by merging with deposit's waigergamecategory
      // Only merge if waigergamecategory is not empty and wagering requirement exists
      if (waigergamecategory && waigergamecategory.length > 0 && wageringRequirement > 0) {
        console.log(`🎯 Merging waigergamecategory...`);
        console.log(`User's existing categories: ${JSON.stringify(user.waigergamecategory || [])}`);
        console.log(`Deposit categories: ${JSON.stringify(waigergamecategory)}`);
        
        // Merge the deposit's waigergamecategory with user's existing categories
        const mergedCategories = [...new Set([
          ...(user.waigergamecategory || []),
          ...waigergamecategory
        ])];
        user.waigergamecategory = mergedCategories;
        console.log(`Merged categories: ${JSON.stringify(mergedCategories)}`);
      } else if (isCashOnlyDeposit) {
        // For cash-only deposits, do NOT modify waigergamecategory
        console.log(`⚠️ Cash-only deposit: waigergamecategory NOT modified`);
        console.log(`Current waigergamecategory remains: ${JSON.stringify(user.waigergamecategory)}`);
      } else {
        // If no waigergamecategory or no wagering requirement, and it's not cash-only deposit
        console.log(`No waigergamecategory to merge or no wagering requirement`);
        user.waigergamecategory = [];
        console.log(`✅ User's waigergamecategory set to empty array`);
      }
      
      // Update wagering needs - only for bonus_balance bonuses with wagering requirement > 0
      if (isBonusDeposit && balanceType === 'bonus_balance' && wageringRequirement > 0) {
        const requiredWager = wageringRequirement;
        user.waigeringneed = (user.waigeringneed || 0) + requiredWager;
        console.log(`Wagering requirement: ${deposit.amount} * ${wageringRequirement} = ${requiredWager}`);
        console.log(`Total wagering needed: ${user.waigeringneed}`);
      } else if (isCashOnlyDeposit) {
        // IMPORTANT: For cash-only deposits, DO NOT modify waigeringneed
        console.log(`⚠️ Cash-only deposit: waigeringneed NOT modified`);
        console.log(`Current waigeringneed remains: ${user.waigeringneed || 0}`);
      } else {
        // For other cases (non-bonus deposits or bonuses without wagering)
        user.waigeringneed = 0;
        console.log(`✅ Wagering need set to 0 (no wagering requirement or not bonus deposit)`);
      }
      
      // RESET total_bet to 0 ONLY if waigeringneed is 0
      console.log(`🎯 Checking if total_bet should be reset...`);
      console.log(`Current waigeringneed: ${user.waigeringneed}`);
      console.log(`Current total_bet: ${user.total_bet || 0}`);
      
      if (user.waigeringneed === 0) {
        console.log(`🔄 Resetting total_bet from ${user.total_bet || 0} to 0 because waigeringneed is 0`);
        user.total_bet = 0;
        console.log(`✅ total_bet reset to 0`);
      } else {
        console.log(`⚠️ Keeping total_bet as ${user.total_bet || 0} because waigeringneed is ${user.waigeringneed} (not 0)`);
      }
      
      // Add bonus amount to appropriate balance based on balanceType (only for bonus deposits)
      if (isBonusDeposit && bonusAmount > 0) {
        console.log(`🎁 Adding bonus amount: ${bonusAmount} to ${balanceType === 'cash_balance' ? 'MAIN' : 'BONUS'} balance`);
        
        if (balanceType === 'cash_balance') {
          // Add to main balance (cash balance)
          user.balance += bonusAmount;
          console.log(`Bonus added to MAIN (CASH) balance. New balance: ${user.balance}`);
        } else {
          // Add to bonus balance
          user.bonusBalance += bonusAmount;
          console.log(`Bonus added to BONUS balance. New bonus balance: ${user.bonusBalance}`);
        }
        
        // Log bonus activity
        const bonusStatus = balanceType === 'cash_balance' ? 'cash_awarded' : 'active';
        console.log(`Bonus status: ${bonusStatus}`);
        
        user.bonusActivityLogs.push({
          bonusType: bonusType,
          bonusAmount: bonusAmount,
          balanceType: balanceType,
          depositAmount: deposit.amount,
          activatedAt: new Date(),
          addedToMainBalance: addToMainBalance,
          status: bonusStatus,
          gameCategory: gameCategory,
          waigergamecategory: waigergamecategory,
          bonusCode: deposit.bonusCode || null,
          bonusName: bonusName || null,
          wageringRequirement: wageringRequirement
        });
        
        console.log(`✅ Bonus activity logged with balance type: ${balanceType}`);
      }

      // Add transaction record for deposit
      console.log(`📊 Adding deposit transaction record...`);
      const depositTransaction = {
        type: 'deposit',
        amount: deposit.amount,
        balanceBefore: balanceBefore,
        balanceAfter: user.balance - (bonusAmount > 0 && balanceType === 'cash_balance' ? bonusAmount : 0),
        description: isCashOnlyDeposit 
          ? `Cash deposit via ${deposit.method}`
          : `Deposit via ${deposit.method}${isBonusDeposit ? ' (with bonus)' : ''}`,
        referenceId: transactionId || deposit.transactionId,
        createdAt: new Date(),
        metadata: {
          depositType: isCashOnlyDeposit ? 'cash_only' : (isBonusDeposit ? 'bonus_deposit' : 'unknown'),
          bonusType: bonusType,
          bonusAmount: bonusAmount,
          balanceType: balanceType,
          wageringRequirement: wageringRequirement,
          gameCategory: gameCategory,
          waigergamecategory: waigergamecategory
        }
      };
      
      user.transactionHistory.push(depositTransaction);
      console.log(`Deposit transaction added: ${deposit.amount} via ${deposit.method}`);

      // Add separate transaction record for bonus if applicable
      if (isBonusDeposit && bonusAmount > 0) {
        console.log(`📊 Adding bonus transaction record...`);
        const bonusTransaction = {
          type: 'bonus',
          amount: bonusAmount,
          balanceBefore: balanceType === 'cash_balance' ? user.balance - bonusAmount : user.bonusBalance - bonusAmount,
          balanceAfter: balanceType === 'cash_balance' ? user.balance : user.bonusBalance,
          description: `${bonusType} bonus (${balanceType})${bonusName ? ` - ${bonusName}` : ''}`,
          referenceId: `${deposit.transactionId || transactionId}-BONUS`,
          createdAt: new Date(),
          bonusType: bonusType,
          balanceType: balanceType,
          addedToMainBalance: addToMainBalance,
          wageringRequirement: wageringRequirement,
          bonusCode: deposit.bonusCode || null,
          gameCategory: gameCategory,
          waigergamecategory: waigergamecategory
        };
        
        user.transactionHistory.push(bonusTransaction);
        console.log(`Bonus transaction added: ${bonusAmount} (${bonusType}, ${balanceType})`);
      }

      // Apply referral bonus (using legacy method for compatibility)
      console.log(`🤝 Applying referral bonus...`);
      const { applied, referralBonus, debt } = await user.applyReferralBonus(deposit.amount);
      if (applied && debt > 0) {
        console.log(`💸 Referrer debt recorded: ${debt} for user ${user.referredBy}`);
      } else if (applied) {
        console.log(`✅ Referral bonus applied: ${referralBonus}`);
      } else {
        console.log(`No referral bonus to apply`);
      }

      // Apply referral commission to referrer if user has referredBy
      let referralCommissionApplied = false;
      let referralCommissionAmount = 0;

      if (user.referredBy) {
        console.log(`👥 User was referred by: ${user.referredBy}`);
        try {
          const referrer = await User.findById(user.referredBy);
          if (referrer) {
            console.log(`✅ Referrer found: ${referrer.username || referrer.player_id}`);
            
            // Calculate commission based on: (total_deposit - total_withdraw - balance) * 0.25
            // For demonstration, using 75 as commission
            referralCommissionAmount = 75;
            console.log(`Calculated referral commission: ${referralCommissionAmount}`);
            
            // Only apply commission if it's positive
            if (referralCommissionAmount > 0) {
              // Update referrer's referral earnings (not main balance)
              referrer.referralEarnings += referralCommissionAmount;
              console.log(`Referrer's total earnings: ${referrer.referralEarnings}`);
              
              // Add transaction history for referrer
              referrer.transactionHistory.push({
                type: 'referral_commission',
                amount: referralCommissionAmount,
                balanceBefore: referrer.balance,
                balanceAfter: referrer.balance,
                description: `Referral commission from ${user.username || user.player_id}'s deposit`,
                referenceId: `REFCOM-${Date.now()}`,
                createdAt: new Date(),
                metadata: {
                  referredUserId: user._id,
                  referredUsername: user.username,
                  depositAmount: deposit.amount,
                  depositType: isCashOnlyDeposit ? 'cash_only' : (isBonusDeposit ? 'bonus_deposit' : 'unknown'),
                  bonusType: bonusType,
                  balanceType: balanceType,
                  wageringRequirement: wageringRequirement,
                  waigergamecategory: waigergamecategory
                }
              });

              // Log in bonus history
              referrer.bonusHistory.push({
                type: 'referral_commission',
                amount: referralCommissionAmount,
                claimedAt: new Date(),
                status: 'claimed',
                referredUserId: user._id,
                depositType: isCashOnlyDeposit ? 'cash_only' : 'bonus_deposit',
                wageringRequirement: wageringRequirement,
                waigergamecategory: waigergamecategory
              });

              // Update referral user tracking
              const referralUserIndex = referrer.referralUsers.findIndex(
                ref => ref.user && ref.user.toString() === user._id.toString()
              );

              if (referralUserIndex !== -1) {
                referrer.referralUsers[referralUserIndex].earnedAmount += referralCommissionAmount;
                console.log(`Updated existing referral user record`);
              } else {
                referrer.referralUsers.push({
                  user: user._id,
                  joinedAt: new Date(),
                  earnedAmount: referralCommissionAmount,
                  wageringRequirement: wageringRequirement,
                  waigergamecategory: waigergamecategory
                });
                console.log(`Created new referral user record`);
              }

              await referrer.save();
              referralCommissionApplied = true;
              
              console.log(`✅ Referral commission of ${referralCommissionAmount} applied to referrer ${referrer.username || referrer.player_id}`);
            } else {
              console.log(`No referral commission to apply (amount: ${referralCommissionAmount})`);
            }
          } else {
            console.log(`❌ Referrer not found with ID: ${user.referredBy}`);
          }
        } catch (referralError) {
          console.error('❌ Error applying referral commission:', referralError.message);
          console.error('Stack trace:', referralError.stack);
        }
      } else {
        console.log(`User not referred (no referredBy field)`);
      }

      // Update transaction model if transaction exists
      if (transaction) {
        console.log(`📝 Updating transaction model for ID: ${deposit.transactionId}`);
        await transaction_model.updateOne(
          { transaction_id: deposit.transactionId },
          {
            status: 'success',
            bonus_amount: bonusAmount,
            balance_type: balanceType,
            post_balance: user.balance,
            updated_at: new Date(),
            updated_by: 'system',
            gateway_response: {
              ...(transaction.gateway_response || {}),
              callbackData: req.body
            },
            bonus_added_to_main_balance: addToMainBalance,
            referral_commission_applied: referralCommissionApplied,
            referral_commission_amount: referralCommissionAmount,
            wagering_requirement: wageringRequirement,
            bonus_type: bonusType,
            balance_type: balanceType,
            game_category: gameCategory,
            bonus_code: deposit.bonusCode || null,
            waigergamecategory: waigergamecategory,
            deposit_type: isCashOnlyDeposit ? 'cash_only' : (isBonusDeposit ? 'bonus_deposit' : 'unknown')
          }
        );
        console.log(`✅ Transaction model updated with deposit type: ${isCashOnlyDeposit ? 'cash_only' : 'bonus_deposit'}`);
      } else {
        console.log(`No transaction model to update`);
      }

      console.log(`💾 Saving user changes...`);
      await user.save();
      console.log(`✅ User saved successfully`);

      // Send postback to tracking API if user has clickId
      let postbackSent = false;
      if (user.clickId) {
        console.log(`🔗 User has clickId: ${user.clickId}, sending postback...`);
        try {
          const postbackUrl = `https://0yn0v.bemobtrcks.com/postback?cid=${user.clickId}&payout=${deposit.amount}&txid=${transactionId}&status=approved`;
          
          console.log(`Postback URL: ${postbackUrl}`);
          
          const postbackResponse = await axios.get(postbackUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': '*/*'
            },
            timeout: 10000
          });

          if (postbackResponse.status === 200) {
            console.log(`✅ Postback sent successfully for user ${user.player_id}`);
            console.log(`Response status: ${postbackResponse.status}`);
            postbackSent = true;
          } else {
            console.warn(`⚠️ Postback failed with status: ${postbackResponse.status} for user ${user.player_id}`);
          }
        } catch (postbackError) {
          console.error('❌ Error sending postback:', postbackError.message);
          console.error('Postback error stack:', postbackError.stack);
        }
      } else {
        console.log(`No clickId found for user, skipping postback`);
      }

      // Send postback to affiliate system if user has affiliateCode
      let affiliatePostbackSent = false;
      if (user.affiliateCode) {
        console.log(`🤝 User has affiliateCode: ${user.affiliateCode}, sending affiliate postback...`);
        try {
          const affiliatePostbackUrl = 'https://backend.affilinkly.com/api/deposit-callback';
          
          // Find all previous completed deposits (excluding current one)
          const previousDeposits = user.depositHistory.filter(d => 
            d.status === 'completed' && d.orderId !== paymentId
          );
          
          console.log(`Previous completed deposits count: ${previousDeposits.length}`);
          
          // Check if this is the first deposit
          const isFirstDeposit = previousDeposits.length === 0;
          console.log(`Is first deposit: ${isFirstDeposit}`);
          
          // Get the LAST previous deposit (not current one)
          let previousDepositData = null;
          let previousDepositAmount = 0;
          
          if (previousDeposits.length > 0) {
            // Sort by date to get the most recent previous deposit
            const sortedPreviousDeposits = previousDeposits.sort((a, b) => 
              new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)
            );
            previousDepositData = sortedPreviousDeposits[0];
            previousDepositAmount = previousDepositData.amount || 0;
            console.log(`Most recent previous deposit: ${previousDepositAmount} on ${previousDepositData.completedAt || previousDepositData.createdAt}`);
          }
          
          // Determine amount based on whether it's first deposit
          let postbackAmount;
          let depositType;
          let shouldSendPostback = true;
          
          if (isFirstDeposit) {
            // First deposit: send amount as 30
            postbackAmount = 30;
            depositType = "first deposit";
            console.log(`First deposit detected, postback amount fixed to: ${postbackAmount}`);
          } else if (previousDepositData) {
            // Not first deposit: use only the previous deposit amount
            const totalWithdraw = user.total_withdraw;
            const userBalanceBefore = balanceBefore;
            
            // Calculate: previous deposit amount - total withdrawals - balance before current deposit
            postbackAmount = previousDepositAmount - totalWithdraw - userBalanceBefore;
            
            console.log(`Postback calculation details:`);
            console.log(`  Previous deposit amount: ${previousDepositAmount}`);
            console.log(`  Total withdrawals: ${totalWithdraw}`);
            console.log(`  Balance before current deposit: ${userBalanceBefore}`);
            console.log(`  Calculated: ${previousDepositAmount} - ${totalWithdraw} - ${userBalanceBefore} = ${postbackAmount}`);
            
            // If postbackAmount is negative, don't send postback
            if (postbackAmount < 0) {
              shouldSendPostback = false;
              console.log(`❌ Not sending affiliate postback: calculated amount is negative (${postbackAmount})`);
            } else if (postbackAmount === 0) {
              console.log(`Calculated postback amount is 0, will still send postback`);
            }
            
            depositType = "previous deposit";
            
            console.log(`Postback amount: ${postbackAmount}, Should send: ${shouldSendPostback}`);
          } else {
            postbackAmount = 0;
            depositType = "unknown";
            shouldSendPostback = false;
            console.log(`No previous deposit data found, cannot calculate postback`);
          }
          
          // Only send postback if shouldSendPostback is true
          if (shouldSendPostback) {
            // Prepare data
            const postbackData = {
              userId: user._id.toString(),
              playerid:user.player_id.toString(),
              depositId: previousDepositData ? previousDepositData.orderId : paymentId,
              amount: postbackAmount,
              method: previousDepositData ? previousDepositData.method : deposit.method,
              affiliateCode: user.affiliateCode,
              player_id: user.player_id,
              username: user.username || user.player_id,
              status: 'completed',
              transactionId: previousDepositData ? previousDepositData.transactionId : transactionId,
              bonusAmount: previousDepositData ? previousDepositData.bonusAmount || 0 : 0,
              balanceType: previousDepositData ? previousDepositData.balanceType || 'cash_balance' : balanceType,
              gameCategory: previousDepositData ? previousDepositData.gameCategory : gameCategory,
              waigergamecategory: waigergamecategory,
              timestamp: new Date().toISOString(),
              type: depositType,
              
              // Additional context fields
              currentDepositId: paymentId,
              currentAmount: deposit.amount,
              currentBalanceType: balanceType,
              isFirstDeposit: isFirstDeposit,
              reportType: isFirstDeposit ? 'first_deposit' : 'previous_deposit',
              depositType: isCashOnlyDeposit ? 'cash_only' : 'bonus_deposit',
              isBonusDeposit: isBonusDeposit,
              bonusType: bonusType,
              wageringRequirement: wageringRequirement
            };
            
            // Add calculation details only for non-first deposits with previous deposit data
            if (!isFirstDeposit && previousDepositData) {
              const totalWithdraw = user.total_withdraw || 0;
              const userBalanceBefore = balanceBefore;
              
              postbackData.calculationDetails = {
                previousDepositAmount: previousDepositAmount,
                totalWithdraw: totalWithdraw,
                balanceBeforeCurrentDeposit: userBalanceBefore,
                calculatedAmount: postbackAmount
              };
            }
            
            console.log(`Sending affiliate postback to: ${affiliatePostbackUrl}`);
            console.log(`Postback data:`, JSON.stringify(postbackData, null, 2));
            
            const affiliatePostbackResponse = await axios.post(affiliatePostbackUrl, postbackData, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              timeout: 10000
            });

            if (affiliatePostbackResponse.status === 200) {
              console.log(`✅ Affiliate postback sent successfully`);
              console.log(`Response status: ${affiliatePostbackResponse.status}`);
              affiliatePostbackSent = true;
              
              if (affiliatePostbackResponse.data) {
                console.log(`Affiliate system response:`, JSON.stringify(affiliatePostbackResponse.data, null, 2));
              }
            } else {
              console.warn(`⚠️ Affiliate postback failed with status: ${affiliatePostbackResponse.status}`);
              console.warn(`Response data:`, affiliatePostbackResponse.data);
            }

            // Reset total_withdraw for next calculation (if needed)
            console.log(`Resetting total_withdraw from ${user.total_withdraw} to 0`);
            user.total_withdraw = 0;
            await user.save();
            console.log(`User total_withdraw reset to 0`);
          } else {
            console.log(`Skipping affiliate postback (shouldSendPostback=${shouldSendPostback})`);
          }
        } catch (affiliatePostbackError) {
          console.error('❌ Error sending affiliate postback:', affiliatePostbackError.message);
          console.error('Error stack:', affiliatePostbackError.stack);
          if (affiliatePostbackError.response) {
            console.error('Affiliate system error response:', {
              status: affiliatePostbackError.response.status,
              data: affiliatePostbackError.response.data
            });
          }
        }
      } else {
        console.log(`No affiliateCode found for user, skipping affiliate postback`);
      }

      console.log(`=== DEPOSIT PROCESSING COMPLETED SUCCESSFULLY ===`);
      console.log(`Final user balance: ${user.balance}`);
      console.log(`Final bonus balance: ${user.bonusBalance}`);
      console.log(`Balance type: ${balanceType}`);
      console.log(`Deposit type: ${isCashOnlyDeposit ? 'CASH-ONLY' : 'BONUS'}`);
      console.log(`Wagering requirement: ${wageringRequirement}`);
      console.log(`Wagering need: ${user.waigeringneed}`);
      console.log(`total_bet: ${user.total_bet || 0}`);
      console.log(`waigergamecategory: ${JSON.stringify(user.waigergamecategory)}`);
      
      return res.json({
        success: true,
        message: 'Deposit completed successfully',
        depositAmount: deposit.amount,
        depositType: isCashOnlyDeposit ? 'cash_only' : 'bonus_deposit',
        bonusAmount: bonusAmount,
        bonusType: bonusType,
        balanceType: balanceType,
        bonusAddedToMainBalance: addToMainBalance,
        wageringRequirement: wageringRequirement,
        waigeringneed: user.waigeringneed,
        total_bet: user.total_bet || 0,
        waigergamecategory: user.waigergamecategory,
        gameCategory: gameCategory,
        isDynamicBonus: isBonusDeposit && deposit.bonusId ? true : false,
        referralBonus: applied ? referralBonus : undefined,
        referralCommission: referralCommissionApplied ? referralCommissionAmount : undefined,
        postbackSent: postbackSent,
        affiliatePostbackSent: affiliatePostbackSent
      });
    } else {
      // Mark as failed
      console.log(`❌ Payment status is FAILED for paymentId: ${paymentId}`);
      console.log(`Updating deposit status to failed`);
      
      user.depositHistory[depositIndex] = {
        ...deposit.toObject(),
        status: 'failed',
        processedAt: new Date(),
        externalPaymentId: transactionId || deposit.externalPaymentId,
        paymentId: paymentId
      };

      // Update transaction model if transaction exists
      if (transaction) {
        console.log(`Updating transaction model status to failed`);
        await transaction_model.updateOne(
          { transaction_id: deposit.transactionId },
          {
            status: 'failed',
            updated_at: new Date(),
            updated_by: 'system',
            gateway_response: {
              ...(transaction.gateway_response || {}),
              callbackData: req.body
            },
            reason: 'Payment failed at gateway'
          }
        );
      }

      await user.save();
      console.log(`✅ User saved with failed deposit status`);

      return res.json({
        success: false,
        message: 'Deposit failed'
      });
    }
  } catch (error) {
    console.error('❌ DEPOSIT CALLBACK ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Request body:', req.body);
    console.error('Error occurred at:', new Date().toISOString());
    
    return res.status(500).json({
      success: false,
      message: 'Server error processing callback',
      error: error.message
    });
  } finally {
    console.log(`=== DEPOSIT CALLBACK PROCESS ENDED ===`);
  }
});
user_route.post("/bkash-fast-payment", ensureAuthenticated, async (req, res) => {
    try {
        const {
            orderId,
            payerId,
            amount,
            player_id,
            currency = 'BDT',
            redirectUrl,
            callbackUrl,
            sitecallback,
            transactionId,
            paymentId
        } = req.body;

        console.log('bKash Fast Payment Request:', req.body);

        // Validate required fields
        if (!orderId || !payerId || !amount || !player_id) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: orderId, payerId, amount, and player_id are required"
            });
        }

        // Validate amount
        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid amount"
            });
        }

        // Find the user
        const user = await UserModel.findOne({ player_id: player_id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get API key from localStorage equivalent (in backend, we use environment variable)
        const apiKey = process.env.PAYMENT_GATEWAY_API_KEY || "18e5f948356de68e2909";
        
        // Get token from request header
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authorization token required"
            });
        }

        // Prepare payment gateway payload
        const paymentPayload = {
            orderId: orderId,
            payerId: payerId,
            amount: amountNum,
            player_id: player_id,
            currency: currency,
            redirectUrl: redirectUrl || PAYMENT_CONFIG.FRONTEND_URL,
            callbackUrl: callbackUrl || `${PAYMENT_CONFIG.BASE_URL}/user/callback-payment`,
            sitecallback: sitecallback || `${PAYMENT_CONFIG.BASE_URL}/user/callback`,
            transactionId: transactionId,
            paymentId: paymentId
        };

        console.log('Forwarding to payment gateway:', {
            endpoint: `${PAYMENT_CONFIG.BASE_URL}/api/payment/p2c/bkash/payment`,
            payload: paymentPayload
        });

        // Forward the request to the payment gateway
        const paymentResponse = await axios.post(
            `${PAYMENT_CONFIG.BASE_URL}/api/payment/p2c/bkash/payment`,
            paymentPayload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-api-key': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Payment gateway response:', paymentResponse.data);

        if (!paymentResponse.data || !paymentResponse.data.success) {
            return res.status(400).json({
                success: false,
                message: paymentResponse.data?.message || 'Payment gateway error',
                gatewayResponse: paymentResponse.data
            });
        }

        // Find and update the deposit record in user's depositHistory
        const depositIndex = user.depositHistory.findIndex(d => d.orderId === orderId);
        if (depositIndex !== -1) {
            user.depositHistory[depositIndex].bkashFastPayment = {
                initiatedAt: new Date(),
                paymentId: paymentResponse.data.paymentId,
                transactionId: paymentResponse.data.transactionId,
                status: 'processing'
            };
            await user.save();
        }

        // Find and update the transaction record
        if (transactionId) {
            await transaction_model.updateOne(
                { transaction_id: transactionId },
                {
                    $set: {
                        'bkashFastPayment': {
                            initiatedAt: new Date(),
                            paymentId: paymentResponse.data.paymentId,
                            gatewayResponse: paymentResponse.data
                        }
                    }
                }
            );
        }

        res.status(200).json({
            success: true,
            message: "bKash Fast payment initiated successfully",
            data: paymentResponse.data
        });

    } catch (error) {
        console.error("bKash Fast Payment Error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            stack: error.stack
        });

        // Handle specific error cases
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            return res.status(error.response.status).json({
                success: false,
                message: error.response.data?.message || "Payment gateway error",
                error: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            return res.status(503).json({
                success: false,
                message: "Payment gateway is not responding. Please try again later."
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            return res.status(500).json({
                success: false,
                message: error.message || "Failed to initiate bKash Fast payment"
            });
        }
    }
});
user_route.post('/cancel-bonus', async (req, res) => {
    const { userid } = req.body;
    try {
        console.log(userid)
        if (!userid) {
            return res.status(400).json({ 
                success: false,
                message: 'User ID is required' 
            });
        }
        const user = await User.findById(userid);
        console.log(user)
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Check if user has bonus balance (either from active bonuses or direct admin addition)
        if (user.bonusBalance <= 0) {
            return res.status(400).json({ 
                success: false,
                message: 'কোন সক্রিয় বোনাস ব্যালেন্স নেই' // No active bonus balance
            });
        }

        // Record cancelled bonus amount
        const cancelledBonusAmount = user.bonusBalance;
        const bonusSource = user.bonusInfo.activeBonuses.some(b => b.status === 'active') 
            ? 'active_bonus' 
            : 'direct_bonus';

        // Log the cancellation in bonus history
        user.bonusActivityLogs.push({
            bonusType: bonusSource === 'active_bonus' ? 'special_bonus' : 'direct_bonus',
            bonusAmount: cancelledBonusAmount,
            depositAmount: 0,
            activatedAt: null,
            cancelledAt: new Date(),
            status: 'cancelled'
        });

        // If there are active bonuses, mark them as cancelled
        if (bonusSource === 'active_bonus') {
            user.bonusInfo.activeBonuses = user.bonusInfo.activeBonuses.map(bonus => {
                if (bonus.status === 'active') {
                    return {
                        ...bonus.toObject(),
                        status: 'cancelled'
                    };
                }
                return bonus;
            });

            // Add to cancelled bonuses list
            user.bonusInfo.cancelledBonuses.push({
                bonusType: 'special_bonus',
                amount: cancelledBonusAmount,
                penaltyApplied: 0,
                cancelledAt: new Date()
            });
        } else {
            // For direct bonus (admin-added), add to cancelled bonuses with a different type
            user.bonusInfo.cancelledBonuses.push({
                bonusType: 'direct_bonus',
                amount: cancelledBonusAmount,
                penaltyApplied: 0,
                cancelledAt: new Date()
            });
        }

        // Clear bonus balance regardless of source
        user.bonusBalance = 0;
        
        // Reset wagering need to 0 when canceling bonus
        user.waigeringneed = 0; // ADD THIS LINE

        // Add transaction record
        user.transactionHistory.push({
            type: 'bonus',
            amount: -cancelledBonusAmount,
            balanceBefore: user.balance + cancelledBonusAmount,
            balanceAfter: user.balance,
            description: `বোনাস বাতিল হয়েছে (${bonusSource})`,
            referenceId: `CANCEL-${Date.now()}`,
            createdAt: new Date()
        });

        await user.save();

        res.json({
            success: true,
            message: 'বোনাস ব্যালেন্স সফলভাবে বাতিল হয়েছে।',  // Bonus balance cancelled successfully
            cancelledBonusAmount: cancelledBonusAmount,
            bonusSource: bonusSource,
            newBalance: user.balance,
            newBonusBalance: user.bonusBalance,
            waigeringneed: user.waigeringneed // Optional: include in response
        });

    } catch (error) {
        console.error('Bonus cancellation error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'বোনাস বাতিল করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।'
        });
    }
});
// Helper function to send deposit notification
async function sendDepositNotification(user, amount, bonusAmount = 0) {
    try {
        const notification = {
            userId: user._id,
            type: 'deposit',
            title: 'Deposit Completed',
            message: `Your deposit of ${amount} BDT has been processed${bonusAmount > 0 ? ` with ${bonusAmount} BDT bonus` : ''}`,
            read: false,
            createdAt: new Date()
        };
        
        // Here you would typically save to database and/or send push notification
        // For example:
        // await Notification.create(notification);
        // sendPushNotification(user.deviceTokens, notification);
        
        console.log(`Notification sent for deposit: ${amount} BDT`);
    } catch (error) {
        console.error('Error sending deposit notification:', error);
    }
}
// Get deposit history
user_route.get('/history', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sort by most recent first
        const history = user.depositHistory.sort((a, b) => b.createdAt - a.createdAt);
        
        res.json({
            success: true,
            history: history
        });
    } catch (error) {
        console.error('Error getting deposit history:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// ------------------after-win--------------------------
user_route.put("/after-wind-add-balance",ensureAuthenticated,async(req,res)=>{
    try {
        const {winAmount,player_id}=req.body;
        console.log(req.body)
        const find_user=await UserModel.findOne({player_id:player_id});
        if(!find_user){
            return res.send({success:false,message:"User did not find!"})
        }
        // const update_user_balance=await UserModel.findByIdAndUpdate({_id:find_user._id});
        find_user.balance+=winAmount;
        res.send({success:true,message:"Ok"})
        find_user.save();
    } catch (err) {
        console.log(err)
    }
});
// -------------------------after-withdraw-------------------------------
user_route.put("/after-withdraw-minus-balance",ensureAuthenticated,async(req,res)=>{
    try {
        const {amount,player_id}=req.body;
        console.log(req.body)
        const find_user=await UserModel.findOne({player_id:player_id});
        if(!find_user){
            return res.send({success:false,message:"User did not find!"})
        }
        // const update_user_balance=await UserModel.findByIdAndUpdate({_id:find_user._id});
        find_user.balance-=amount;
        res.send({success:true,message:"Ok"})
        find_user.save();
    } catch (err) {
        console.log(err)
    }
});
// -------------create-transations--------------------
user_route.post("/create-transaction", async (req, res) => {
  try {
      const {
          transiction,
          customer_id,
          payment_type,
          payment_method,
          amount,
          post_balance,
          transaction,
          type,
          status,
          updated_by,
          reason,
      } = req.body;
      console.log(req.body)
      // Check if transaction already exists based on a unique identifier (transaction ID)
      const existingTransaction = await transaction_model.findOne({ transaction });
      const find_user = await UserModel.findOne({ _id: customer_id });

      if (existingTransaction) {
          return res.json({ message: "Transaction already exists." });
      }

      // Create a new transaction
      const newTransaction = new transaction_model({
          transiction,
          customer_id,
          customer_name: find_user.name,
          customer_email: find_user.email,
          payment_type,
          payment_method,
          amount,
          post_balance,
          transaction,
          type: type || "deposit", // default type is 'deposit'
          status,
          updated_by: updated_by || "", // default empty string for updated_by
          reason,
      });

      // Save the new transaction to the database
      await newTransaction.save();

      // If status is "success", update the user's balance
      if (status === "success") {
              find_user.balance += amount;
              await UserModel.findByIdAndUpdate({_id:find_user._id},{$set:{deposit_money:amount}})
              // Save the updated user balance
               await find_user.save();
      }

      return res.status(201).json({
          message: "Transaction created successfully, and user balance updated.",
          transaction: newTransaction,
          updatedBalance: find_user.balance,
      });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error, please try again later." });
  }
});
user_route.get("/callback-payment",(req,res)=>{
  try {
    console.log(req.body)
  } catch (error) {
    console.log(error)
  }
})
// --------------single-user-transaction-data---------------------
user_route.get("/single-user-transactions/:id",async(req,res)=>{
    try {
        const transaction_data=await transaction_model.find({customer_id:req.params.id}).sort({ createdAt: -1 });
        if(!transaction_data){
            return res.send({success:false,message:"Transaction not found!"})
        };
        res.send({success:true,data:transaction_data})
    } catch (error) {
        console.log(error)
    }
});


// Payout route with transaction password verification
// user_route.post("/payout", async (req, res) => {
//     try {
//         const { userId, username, email, playerId, provider, amount, orderId, payeeAccount, transactionPassword, wageringStatus, cancelBonus } = req.body;
//        console.log(req.body)
//         // Validate required fields
//         const requiredFields = ['userId', 'username', 'email', 'playerId', 'provider', 'amount', 'orderId', 'payeeAccount', 'transactionPassword'];
//         const missingFields = requiredFields.filter(field => !req.body[field]);
        
//         if (missingFields.length > 0) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: `Missing required fields: ${missingFields.join(', ')}`
//             });
//         }

//         // Validate amount is a positive number
//         if (isNaN(amount) || amount <= 0) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Amount must be a positive number"
//             });
//         }

//         // Validate provider is supported
//         const supportedProviders = ['bkash', 'nagad', 'rocket', 'bank'];
//         if (!supportedProviders.includes(provider)) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: `Unsupported provider. Supported providers are: ${supportedProviders.join(', ')}`
//             });
//         }

//         // Validate the user
//         const user = await UserModel.findById(userId).select('+transactionPassword');
//         if (!user) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "User not found."
//             });
//         }

//         // Verify user identity
//         if (user.username !== username || user.email !== email || user.player_id !== playerId) {
//             return res.status(403).json({ 
//                 success: false, 
//                 message: "User credentials don't match"
//             });
//         }

//         // Verify transaction password
//         if (!user.transactionPassword) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: "Transaction password not set for this user"
//             });
//         }
//         const isPasswordValid = await bcrypt.compare(transactionPassword, user.transactionPassword);
//         console.log(isPasswordValid)

//         if (!isPasswordValid) {
//             return res.status(401).json({ 
//                 success: false, 
//                 message: "আপনার লেনদেনের পাসওয়ার্ড ভুল।"
//             });
//         }

//         // Check if user can withdraw
//         const withdrawalCheck = user.canWithdraw(amount);
//         if (!withdrawalCheck.canWithdraw) {
//             return res.status(400).json({ 
//                 success: false, 
//                 message: withdrawalCheck.reason 
//             });
//         }

//         // Check if user has completed 3x wagering of total deposit
//         const hasCompletedWagering = user.total_bet >= (user.total_deposit * 3);
//          console.log("hasCompletedWagering", hasCompletedWagering)
//         let processingFee = 0;
//         let netAmount = amount;
//         let commission = withdrawalCheck.commission;

//         if (!hasCompletedWagering) {
//             // Apply 20% fee if wagering not completed (less than 3x total deposit)
//             processingFee = amount * 0.2;
//             netAmount = amount - processingFee;
            
//             // Add the processing fee to commission for tracking
//             commission += processingFee;
//         }

//         // Handle bonus cancellation if requested
//         if (cancelBonus && user.bonusBalance > 0) {
//             await user.cancelBonusWithPenalty();
//         }

//         // Create withdrawal request
//         const newWithdrawal = new Withdrawmodel({
//             userId,
//             provider,
//             amount,
//             orderId,
//             payeeAccount,
//             name: username,
//             email,
//             playerId,
//             post_balance: user.balance - amount,
//             recieved_amount: netAmount,
//             tax_amount: commission,
//             status: 'pending',
//             processedAt: null,
//             completedAt: null,
//             wageringCompleted: hasCompletedWagering,
//             processingFee: processingFee,
//             wagering_status: wageringStatus,
//             bonusCancelled: cancelBonus,
//             bonusPenalty: cancelBonus ? user.bonusBalance * 1.5 : 0
//         });

//         // Deduct balance from user
//         user.balance -= amount;
//         user.total_withdraw += amount;

//         // Update withdrawal count and date
//         const today = new Date().toDateString();
//         const lastWithdrawalDay = user.lastWithdrawalDate ? new Date(user.lastWithdrawalDate).toDateString() : null;

//         if (!lastWithdrawalDay || today !== lastWithdrawalDay) {
//             user.withdrawalCountToday = 1;
//         } else {
//             user.withdrawalCountToday += 1;
//         }
//         user.lastWithdrawalDate = new Date();

//         // Add to transaction history
//         user.transactionHistory.push({
//             type: 'withdrawal',
//             amount: amount,
//             balanceBefore: user.balance + amount,
//             balanceAfter: user.balance,
//             description: `Withdrawal via ${provider}` + 
//                         (!hasCompletedWagering ? ' (20% fee applied - wagering not completed)' : '') +
//                         (cancelBonus ? ' (Bonus cancelled with penalty)' : ''),
//             referenceId: orderId,
//             details: {
//                 processingFee: processingFee,
//                 netAmount: netAmount,
//                 wageringCompleted: hasCompletedWagering,
//                 bonusCancelled: cancelBonus,
//                 bonusPenalty: cancelBonus ? user.bonusBalance * 1.5 : 0
//             }
//         });

//         // Save both user and withdrawal in transaction
//         await Promise.all([
//             newWithdrawal.save(),
//             user.save()
//         ]);

//         res.status(201).json({ 
//             success: true, 
//             message: "প্রত্যাহারের অনুরোধ সফলভাবে জমা দেওয়া হয়েছে!" + 
//                    (!hasCompletedWagering ? ' দ্রষ্টব্য: বাজির প্রয়োজনীয়তা পূরণ না হওয়ায় ২০% প্রক্রিয়াকরণ ফি প্রযোজ্য হয়েছে।' : '') +
//                    (cancelBonus ? ' দ্রষ্টব্য: জরিমানা প্রযোজ্য সহ বোনাস বাতিল করা হয়েছে।' : ''),
//             data: {
//                 withdrawalId: newWithdrawal._id,
//                 amount: amount,
//                 netAmount: netAmount,
//                 commission: commission,
//                 processingFee: processingFee,
//                 newBalance: user.balance,
//                 status: 'pending',
//                 wageringCompleted: hasCompletedWagering,
//                 bonusCancelled: cancelBonus,
//                 bonusPenalty: cancelBonus ? user.bonusBalance * 1.5 : 0,
//                 wageringRequirement: `You need to wager ${user.total_deposit * 3} (3x your total deposit). You've wagered ${user.total_bet}.`
//             }
//         });

//     } catch (error) {
//         console.error("Payout error:", error);
//         res.status(500).json({ 
//             success: false, 
//             message: error.message || "Internal server error" 
//         });
//     }
// });
user_route.post("/payout", async (req, res) => {
    try {
        const { userId, username, email, playerId, provider, amount, orderId, payeeAccount, transactionPassword, wageringStatus, cancelBonus } = req.body;
        console.log(req.body)
        
        // Validate required fields
        const requiredFields = ['userId', 'username', 'email', 'playerId', 'provider', 'amount', 'orderId', 'payeeAccount', 'transactionPassword'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        // Validate amount is a positive number
        if (isNaN(amount) || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Amount must be a positive number"
            });
        }

        // Validate provider is supported
        const supportedProviders = ['bkash', 'nagad', 'rocket', 'bank'];
        if (!supportedProviders.includes(provider)) {
            return res.status(400).json({ 
                success: false, 
                message: `Unsupported provider. Supported providers are: ${supportedProviders.join(', ')}`
            });
        }

        // Validate the user
        const user = await UserModel.findById(userId).select('+transactionPassword');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found."
            });
        }

        // Verify user identity
        if (user.username !== username || user.email !== email || user.player_id !== playerId) {
            return res.status(403).json({ 
                success: false, 
                message: "User credentials don't match"
            });
        }

        // Verify transaction password
        if (!user.transactionPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "Transaction password not set for this user"
            });
        }
        const isPasswordValid = await bcrypt.compare(transactionPassword, user.transactionPassword);
        console.log(isPasswordValid)

        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: "আপনার লেনদেনের পাসওয়ার্ড ভুল।"
            });
        }

        // Check if user can withdraw
        const withdrawalCheck = user.canWithdraw(amount);
        if (!withdrawalCheck.canWithdraw) {
            return res.status(400).json({ 
                success: false, 
                message: withdrawalCheck.reason 
            });
        }

        // Check if user has completed 3x wagering of total deposit
        const hasCompletedWagering = user.total_bet >= (user.total_deposit * 3);
        console.log("hasCompletedWagering", hasCompletedWagering)
        let processingFee = 0;
        let netAmount = amount;
        let commission = withdrawalCheck.commission;

        if (!hasCompletedWagering) {
            // Apply 20% fee if wagering not completed (less than 3x total deposit)
            processingFee = amount * 0.2;
            netAmount = amount - processingFee;
            
            // Add the processing fee to commission for tracking
            commission += processingFee;
            
            // Check if net amount is less than 800 after 20% commission
            if (netAmount < 800) {
                const minimumAmountBeforeFee = Math.ceil(800 / 0.8); // Calculate minimum amount needed before fee to get 800 after fee
                return res.status(400).json({ 
                    success: false, 
                    message: `আপনি এখনও বাজির প্রয়োজনীয়তা পূরণ করেননি। ২০% প্রসেসিং ফি প্রযোজ্য হওয়ায়, প্রত্যাহার করার পরের নেট পরিমাণ টাকা ৮০০ টাকার কম হবে। অনুগ্রহ করে কমপক্ষে ${minimumAmountBeforeFee} টাকা প্রত্যাহার করুন অথবা বাজির প্রয়োজনীয়তা পূর্ণ করুন।`,
                    data: {
                        requestedAmount: amount,
                        processingFee: processingFee,
                        netAmountAfterFee: netAmount,
                        minimumRequiredBeforeFee: minimumAmountBeforeFee,
                        wageringStatus: `আপনি ${user.total_bet} টাকা বাজি করেছেন, প্রয়োজন ${user.total_deposit * 3} টাকা`
                    }
                });
            }
        }

        // Handle bonus cancellation if requested
        if (cancelBonus && user.bonusBalance > 0) {
            await user.cancelBonusWithPenalty();
        }

        // Create withdrawal request
        const newWithdrawal = new Withdrawmodel({
            userId,
            provider,
            amount,
            orderId,
            payeeAccount,
            name: username,
            email,
            playerId,
            post_balance: user.balance - amount,
            recieved_amount: netAmount,
            tax_amount: amount-netAmount,
            status: 'pending',
            processedAt: null,
            completedAt: null,
            wageringCompleted: hasCompletedWagering,
            processingFee: processingFee,
            wagering_status: wageringStatus,
            bonusCancelled: cancelBonus,
            bonusPenalty: cancelBonus ? user.bonusBalance * 1.5 : 0
        });

        // Deduct balance from user
        user.balance -= amount;
        user.total_withdraw += amount;

        // Update withdrawal count and date
        const today = new Date().toDateString();
        const lastWithdrawalDay = user.lastWithdrawalDate ? new Date(user.lastWithdrawalDate).toDateString() : null;

        if (!lastWithdrawalDay || today !== lastWithdrawalDay) {
            user.withdrawalCountToday = 1;
        } else {
            user.withdrawalCountToday += 1;
        }
        user.lastWithdrawalDate = new Date();

        // Add to transaction history
        user.transactionHistory.push({
            type: 'withdrawal',
            amount: amount,
            balanceBefore: user.balance + amount,
            balanceAfter: user.balance,
            description: `Withdrawal via ${provider}` + 
                        (!hasCompletedWagering ? ' (20% fee applied - wagering not completed)' : '') +
                        (cancelBonus ? ' (Bonus cancelled with penalty)' : ''),
            referenceId: orderId,
            details: {
                processingFee: processingFee,
                netAmount: netAmount,
                wageringCompleted: hasCompletedWagering,
                bonusCancelled: cancelBonus,
                bonusPenalty: cancelBonus ? user.bonusBalance * 1.5 : 0
            }
        });

        // Save both user and withdrawal in transaction
        await Promise.all([
            newWithdrawal.save(),
            user.save()
        ]);

        res.status(201).json({ 
            success: true, 
            message: "প্রত্যাহারের অনুরোধ সফলভাবে জমা দেওয়া হয়েছে!" + 
                   (!hasCompletedWagering ? ' দ্রষ্টব্য: বাজির প্রয়োজনীয়তা পূরণ না হওয়ায় ২০% প্রক্রিয়াকরণ ফি প্রযোজ্য হয়েছে।' : '') +
                   (cancelBonus ? ' দ্রষ্টব্য: জরিমানা প্রযোজ্য সহ বোনাস বাতিল করা হয়েছে।' : ''),
            data: {
                withdrawalId: newWithdrawal._id,
                amount: amount,
                netAmount: netAmount,
                commission: commission,
                processingFee: processingFee,
                newBalance: user.balance,
                status: 'pending',
                wageringCompleted: hasCompletedWagering,
                bonusCancelled: cancelBonus,
                bonusPenalty: cancelBonus ? user.bonusBalance * 1.5 : 0,
                wageringRequirement: `You need to wager ${user.total_deposit * 3} (3x your total deposit). You've wagered ${user.total_bet}.`,
                minimumCheck: !hasCompletedWagering ? `Net amount after 20% fee: ${netAmount} (Minimum required: 800)` : 'No fee applied'
            }
        });

    } catch (error) {
        console.error("Payout error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Internal server error" 
        });
    }
});

user_route.get("/withdrawals/:userid", async (req, res) => {
    try {
        const { userid } = req.params;
        const { page = 1, limit = 10, status } = req.query;
         console.log(userid)
        // Validate user exists
        const userExists = await UserModel.exists({ _id: userid });
        if (!userExists) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Build query
        const query = { userid };
        if (status) {
            query.status = status;
        }

        // Get paginated withdrawals
        const withdrawals = await Withdrawmodel.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await Withdrawmodel.countDocuments(query);

        res.json({
            success: true,
            data: withdrawals,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Withdrawal history error:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message || "Internal server error" 
        });
    }
});
  // Get user's withdrawals
user_route.get("/withdrawal/:userId",async (req, res) => {
    try {
      const withdrawals = await Withdrawmodel.find({ userId: req.params.userId });
      res.send({success:true,data:withdrawals});
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error." });
    }
});
  // Admin approves/rejects a withdrawal
user_route.put("/update/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const withdrawal = await Withdrawmodel.findById(req.params.id);
  
      if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal not found." });
  
      withdrawal.status = status;
      await withdrawal.save();
  
      res.json({ success: true, message: `Withdrawal ${status}.` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  });
// ----------------otp-send-------------------
  const otpStorage = {}; // Temporary OTP storage

  // 📨 Send OTP
user_route.post("/send-otp", async (req, res) => {
    const { email } = req.body;
    
    try {
      const user = await UserModel.findOne({ email });
      if (!user) return res.status(400).json({ error: "User not found" });
  
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
  
      // Update OTP in the user document
      user.otp = {
        code: otp.toString(),   // Store as a string to prevent formatting issues
        expiresAt: Date.now() + 300000, // 5 minutes expiry
      };
      await user.save();  // Save to the database
  
      // Send email
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "shihabmoni15@gmail.com",
          pass: "cdir niov oqpo didg", // Use environment variables for security
        },
      });
  
      const mailOptions = {
        from: "HoBet Support <shihabmoni15@gmail.com>",
        to: email,
        subject: "🔒 Reset Your Password - HoBet Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #4A90E2; text-align: center;">HoBet Password Reset</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your HoBet account. If you did not make this request, you can safely ignore this email.</p>
            <p style="text-align: center; font-size: 18px; font-weight: bold; color: #333;">Your OTP Code:</p>
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #4A90E2; padding: 10px; border: 2px dashed #4A90E2; display: inline-block; margin: auto;">
              ${otp}
            </div>
            <p style="text-align: center; font-size: 14px; color: #555;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
            <p>If you need further assistance, please contact our support team.</p>
            <p style="margin-top: 20px; font-size: 14px; color: #777;">Best Regards,<br><strong>HoBet Support Team</strong></p>
          </div>
        `,
      };
  
      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error sending OTP email:", error);
          return res.status(500).json({ error: "Failed to send OTP" });
        }
        res.json({ message: "OTP sent! It will expire in 5 minutes. Please check your email and enter the OTP." });
      });
  
    } catch (error) {
      console.error("Error in /send-otp:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});
  
  // ✅ Verify OTP
user_route.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      // Find user by email
      const user = await UserModel.findOne({ email });
      console.log(user)
      if (!user) {
        return res.json({ success:false,message: "User not found" });
      }
  
      // Check if OTP exists
      if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
        return res.json({  success:false,message:"OTP expired or invalid" });
      }
  
      // Check if OTP is expired
      if (Date.now() > user.otp.expiresAt) {
        return res.json({ success:false,message: "OTP has expired" });
      }
  
      // Verify OTP
      if (otp !== user.otp.code) {
        return res.json({ success:false,message:"Invalid OTP" });
      }
  
      // OTP is correct → Clear OTP after verification
      user.otp = { code: null, expiresAt: null };
      await user.save();
  
      res.json({success:true,message: "OTP verified successfully!" });
  
    } catch (error) {
      console.error("Error verifying OTP:", error);
      res.status(500).json({ error: "Internal server error" });
    }
});
  
  // 🔑 Reset Password
user_route.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });
  
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
  
    res.json({ message: "Password reset successfully" });
});
  // ==================== NEW ROUTES ====================

// 1. Add Mobile Number with Transaction Password
user_route.post("/add-mobile", ensureAuthenticated, async (req, res) => {
    try {
        const { userId, mobileNumber, transactionPassword } = req.body;
        
        // Validate mobile number format
        if (!/^[0-9]{10,15}$/.test(mobileNumber)) {
            return res.status(400).json({ 
                success: false, 
                message: "মোবাইল নম্বরের ফরম্যাট সঠিক নয়" 
            });
        }

        // Check if mobile already exists
        const existingUser = await UserModel.findOne({ phone: mobileNumber });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: "এই মোবাইল নম্বরটি ইতিমধ্যে রেজিস্টার্ড" 
            });
        }

        // Find the user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" 
            });
        }

        // Hash the transaction password
        const salt = await bcrypt.genSalt(10);
        const hashedTransactionPassword = await bcrypt.hash(transactionPassword, salt);

        // Update user
        user.phone = mobileNumber;
        user.transactionPassword = hashedTransactionPassword;
        user.isPhoneVerified = true;
        user.isMoneyTransferPasswordSet = true;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "মোবাইল নম্বর এবং ট্রানজেকশন পাসওয়ার্ড সফলভাবে সংযুক্ত হয়েছে" 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "সার্ভার সমস্যা" 
        });
    }
});

// 2. Update Transaction Password
user_route.put("/update-transaction-password", ensureAuthenticated, async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        // Find user and explicitly select transactionPassword
        const user = await UserModel.findById(userId).select('+transactionPassword');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" 
            });
        }
        // Check if user has transaction password set
        if (!user.transactionPassword) {
            return res.status(400).json({ 
                success: false, 
                message: "ট্রানজেকশন পাসওয়ার্ড সেট আপ করা হয়নি" 
            });
        }

        // Verify current transaction password using the method
        const isMatch = await user.verifyTransactionPassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: "বর্তমান ট্রানজেকশন পাসওয়ার্ড ভুল" 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.transactionPassword = hashedPassword;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "ট্রানজেকশন পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে" 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "সার্ভার সমস্যা" 
        });
    }
});
// 3. Get Deposit History
user_route.get("/deposit-history/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const deposits = await transaction_model.find({ 
            customer_id: req.params.userId,
            type: 'deposit'
        }).sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            data: deposits 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});
// 4. Get Withdrawal History
user_route.get("/withdrawal-history/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const withdrawals = await Withdrawmodel.find({ 
            userId: req.params.userId 
        }).sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            data: withdrawals 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});
// 5. Get Bet History
// user_route.get("/bet-history/:userId", ensureAuthenticated, async (req, res) => {
//     try {
//         const user = await UserModel.findById(req.params.userId);
//         if (!user) {
//             return res.status(404).json({ 
//                 success: false, 
//                 message: "User not found" 
//             });
//         }

//         res.status(200).json({ 
//             success: true, 
//             data: user.betHistory 
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ 
//             success: false, 
//             message: "Server error" 
//         });
//     }
// });
// 6. Get Referral History
user_route.get("/referral-history/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId)
            .populate('referralUsers', 'username createdAt');

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: {
                referralCode: user.referralCode,
                referralCount: user.referralCount,
                referralEarnings: user.referralEarnings,
                referredUsers: user.referralUsers
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});
// 7. Update Account Password
user_route.put("/update-account-password", ensureAuthenticated, async (req, res) => {
    try {
        const { userId, currentPassword, newPassword } = req.body;

        // Find user with password
        const user = await UserModel.findById(userId).select('+password');
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" 
            });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ 
                success: false, 
                message: "বর্তমান পাসওয়ার্ডটি ভুল" 
            });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "অ্যাকাউন্ট পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে" 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "সার্ভার সমস্যা" 
        });
    }
});
// ============================all-refer-details==============================
// 8. Get Referral Bonus Details
user_route.get("/referral-bonus-details/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Get all transactions where type is referral bonus
        const referralBonuses = await transaction_model.find({
            customer_id: req.params.userId,
            type: 'referral_bonus'
        }).sort({ createdAt: -1 });

        res.status(200).json({ 
            success: true, 
            data: {
                totalReferralEarnings: user.referralEarnings || 0,
                referralCount: user.referralCount || 0,
                referralCode: user.referralCode || '',
                bonusHistory: referralBonuses,
                bonusRate: process.env.REFERRAL_BONUS_RATE || '10%' // Default 10% if not set
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});
// 9. Get Detailed Referred Users Information
user_route.get("/referred-users-details/:userId", async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId)
            .populate({
                path: 'referralUsers.user',
                select: 'username email phone balance deposit_money createdAt lastLogin'
            });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Filter out null referral users first
        const validReferralUsers = user.referralUsers.filter(ref => ref.user !== null);

        // Calculate statistics with null checks
        const activeReferrals = validReferralUsers.filter(ref => {
            return ref.user.lastLogin && ref.user.lastLogin > Date.now() - 30 * 24 * 60 * 60 * 1000;
        }).length;

        const depositedReferrals = validReferralUsers.filter(ref => {
            return ref.user.deposit_money && ref.user.deposit_money > 0;
        }).length;

        res.status(200).json({ 
            success: true, 
            data: {
                referralCode: user.referralCode,
                totalReferrals: validReferralUsers.length, // Use actual count of valid referrals
                activeReferrals,
                depositedReferrals,
                referralEarnings: user.referralEarnings || 0,
                referredUsers: validReferralUsers.map(ref => ({
                    id: ref.user._id,
                    username: ref.user.username,
                    email: ref.user.email,
                    phone: ref.user.phone || 'Not provided',
                    balance: ref.user.balance || 0,
                    joinDate: ref.user.createdAt,
                    lastActive: ref.user.lastLogin || ref.user.createdAt, // Fallback to join date
                    hasDeposited: (ref.user.deposit_money || 0) > 0,
                    earnedAmount: ref.earnedAmount || 0
                })),
                totalDepositsByReferrals: validReferralUsers.reduce((sum, ref) => 
                    sum + (ref.user.deposit_money || 0), 0
                )
            }
        });

    } catch (error) {
        console.error("Error fetching referred users details:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});
// Helper function to format mobile number (similar to your frontend)
function formatMobileNumber(number) {
    if (!number || number.length < 7) return number;
    const firstPart = number.substring(0, 4);
    const lastPart = number.substring(number.length - 3);
    return `${firstPart}****${lastPart}`;
}
// 10. Generate New Referral Code
user_route.post("/generate-referral-code/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Generate a random 8-character alphanumeric code
        const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        user.referralCode = newCode;
        await user.save();

        res.status(200).json({ 
            success: true, 
            message: "New referral code generated",
            referralCode: newCode
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});
// 11. Claim Referral Bonus
user_route.post("/claim-referral-bonus/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (user.referralEarnings <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "No referral earnings to claim" 
            });
        }

        // Add to balance
        const bonusAmount = user.referralEarnings;
        user.balance += bonusAmount;
        
        // Create transaction record
        const newTransaction = new transaction_model({
            customer_id: user._id,
            customer_name: user.username,
            customer_email: user.email,
            payment_type: 'referral_bonus',
            amount: bonusAmount,
            post_balance: user.balance,
            transaction: `REFBONUS-${Date.now()}`,
            type: 'referral_bonus',
            status: 'success'
        });

        // Reset referral earnings
        user.referralEarnings = 0;
        
        await Promise.all([user.save(), newTransaction.save()]);

        res.status(200).json({ 
            success: true, 
            message: `$${bonusAmount} referral bonus claimed successfully`,
            newBalance: user.balance
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});
// 12. Get Referral Statistics
user_route.get("/referral-stats/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // Calculate statistics
        const referredUsers = await UserModel.find({ referredBy: user._id });
        
        const activeReferrals = referredUsers.filter(u => u.lastLogin > Date.now() - 30*24*60*60*1000).length;
        const depositedReferrals = referredUsers.filter(u => u.deposit_money > 0).length;
        const totalDeposits = referredUsers.reduce((sum, u) => sum + (u.deposit_money || 0), 0);
        
        res.status(200).json({ 
            success: true, 
            data: {
                referralCode: user.referralCode,
                totalReferrals: user.referralCount || 0,
                activeReferrals,
                depositedReferrals,
                totalDepositsByReferrals: totalDeposits,
                referralEarnings: user.referralEarnings || 0,
                potentialEarnings: totalDeposits * (process.env.REFERRAL_BONUS_RATE || 0.1), // Assuming 10% bonus rate
                bonusRate: process.env.REFERRAL_BONUS_RATE || '10%'
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            message: "Server error" 
        });
    }
});
// --------------game-hostory-----------------------------

user_route.get("/game-history/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            page = 1, 
            limit = 50, 
            type, 
            startDate, 
            endDate,
            game_uuid,
            session_id 
        } = req.query;

        // Validate user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Build query
        const query = { player_id: user.player_id };
        
        // Add filters if provided
        if (game_uuid) {
            query.game_uuid = game_uuid;
        }
        
        if (session_id) {
            query.session_id = session_id;
        }
        
        if (startDate && endDate) {
            query.started_at = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        // Get paginated game sessions
        const sessions = await GameSession.find(query)
            .sort({ started_at: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await GameSession.countDocuments(query);

        // Calculate summary statistics
        const summary = await GameSession.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalBets: { $sum: "$total_bet" },
                    totalWins: { $sum: "$total_win" },
                    totalRefunds: { $sum: "$total_refund" },
                    sessionCount: { $sum: 1 },
                    uniqueGames: { $addToSet: "$game_uuid" },
                    totalNetResult: { $sum: "$net_result" }
                }
            },
            {
                $project: {
                    totalBets: 1,
                    totalWins: 1,
                    totalRefunds: 1,
                    sessionCount: 1,
                    uniqueGameCount: { $size: "$uniqueGames" },
                    netProfit: "$totalNetResult",
                    averageSessionResult: {
                        $cond: [
                            { $gt: ["$sessionCount", 0] },
                            { $divide: ["$totalNetResult", "$sessionCount"] },
                            0
                        ]
                    }
                }
            }
        ]);

        // If transaction type filter is provided, we need to process the sessions
        let filteredSessions = sessions;
        if (type) {
            filteredSessions = sessions.map(session => {
                const filteredTransactions = session.transactions.filter(
                    transaction => transaction.type === type
                );
                
                return {
                    ...session,
                    transactions: filteredTransactions
                };
            }).filter(session => session.transactions.length > 0);
        }

        res.status(200).json({
            success: true,
            data: {
                sessions: filteredSessions,
                summary: summary[0] || {
                    totalBets: 0,
                    totalWins: 0,
                    totalRefunds: 0,
                    sessionCount: 0,
                    uniqueGameCount: 0,
                    netProfit: 0,
                    averageSessionResult: 0
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                playerInfo: {
                    username: user.username,
                    player_id: user.player_id,
                    currentBalance: user.balance
                }
            }
        });

    } catch (error) {
        console.error("Error fetching game history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch game history"
        });
    }
});
// Get Game Session Details
user_route.get("/game-session/:session_id", ensureAuthenticated, async (req, res) => {
    try {
        const { session_id } = req.params;
        const { userId } = req.query;

        // Validate user exists if userId is provided
        if (userId) {
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
        }

        // Get all transactions for this session
        const sessionTransactions = await GameHistory.find({ session_id })
            .sort({ createdAt: 1 })
            .lean();

        if (sessionTransactions.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Session not found"
            });
        }

        // Calculate session summary
        const sessionSummary = sessionTransactions.reduce((summary, transaction) => {
            if (transaction.action === 'bet') {
                summary.totalBets += transaction.amount;
                summary.betCount++;
            } else if (transaction.action === 'win') {
                summary.totalWins += transaction.amount;
                summary.winCount++;
            } else if (transaction.action === 'refund') {
                summary.totalRefunds += transaction.amount;
                summary.refundCount++;
            }
            return summary;
        }, {
            totalBets: 0,
            totalWins: 0,
            totalRefunds: 0,
            betCount: 0,
            winCount: 0,
            refundCount: 0,
            netResult: 0
        });

        sessionSummary.netResult = sessionSummary.totalWins - sessionSummary.totalBets + sessionSummary.totalRefunds;

        res.status(200).json({
            success: true,
            data: {
                session_id,
                transactions: sessionTransactions,
                summary: sessionSummary,
                startedAt: sessionTransactions[0]?.createdAt,
                endedAt: sessionTransactions[sessionTransactions.length - 1]?.createdAt,
                duration: sessionTransactions.length > 1 ? 
                    (new Date(sessionTransactions[sessionTransactions.length - 1].createdAt) - 
                     new Date(sessionTransactions[0].createdAt)) / 1000 : 0
            }
        });

    } catch (error) {
        console.error("Error fetching game session details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch game session details"
        });
    }
});
// -----------------bet-history-------------------
user_route.get("/bet-history/:id", async (req, res) => {
  try {
    const bethistory = await GameSession.find({player_id:req.params.id}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: bethistory.length,
      data: bethistory
    });

  } catch (error) {
    console.error("Error fetching bet history:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bet history"
    });
  }
});

// Get bonus information
user_route.get("/bonus-info/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Calculate bonuses
    const weeklyBonus = user.calculateWeeklyBonus();
    const monthlyBonus = user.calculateMonthlyBonus();
    const availability = user.checkBonusAvailability();
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        weekly: {
          totalBet: user.weeklyBonus.totalBet,
          bonusAmount: weeklyBonus,
          status: user.weeklyBonus.status,
          nextAvailable: user.weeklyBonus.nextAvailable,
          lastClaimed: user.weeklyBonus.lastClaimed
        },
        monthly: {
          totalBet: user.monthlyBonus.totalBet,
          bonusAmount: monthlyBonus,
          status: user.monthlyBonus.status,
          nextAvailable: user.monthlyBonus.nextAvailable,
          lastClaimed: user.monthlyBonus.lastClaimed
        },
        availability
      }
    });
  } catch (error) {
    console.error("Bonus info error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Claim weekly bonus
// user_route.post("/claim-weekly-bonus/:userId", ensureAuthenticated, async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.params.userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }
    
//     const bonusAmount = await user.claimWeeklyBonus();
    
//     res.json({
//       success: true,
//       message: "Weekly bonus claimed successfully",
//       data: {
//         bonusAmount,
//         newBalance: user.balance
//       }
//     });
//   } catch (error) {
//     console.error("Claim weekly bonus error:", error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// });

// // Claim monthly bonus
// user_route.post("/claim-monthly-bonus/:userId", ensureAuthenticated, async (req, res) => {
//   try {
//     const user = await UserModel.findById(req.params.userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }
    
//     const bonusAmount = await user.claimMonthlyBonus();
    
//     res.json({
//       success: true,
//       message: "Monthly bonus claimed successfully",
//       data: {
//         bonusAmount,
//         newBalance: user.balance
//       }
//     });
//   } catch (error) {
//     console.error("Claim monthly bonus error:", error);
//     res.status(400).json({
//       success: false,
//       message: error.message
//     });
//   }
// });

// Claim weekly bonus
user_route.post("/claim-weekly-bonus/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if today is Tuesday
    const today = new Date();
    if (today.getDay() !== 2) {
      return res.status(400).json({
        success: false,
        message: "Weekly bonus is only available on Tuesdays"
      });
    }
    
    const bonusAmount = await user.claimWeeklyBonus();
    
    res.json({
      success: true,
      message: "Weekly bonus claimed successfully",
      data: {
        bonusAmount,
        newBalance: user.balance
      }
    });
  } catch (error) {
    console.error("Claim weekly bonus error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Claim monthly bonus
user_route.post("/claim-monthly-bonus/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Check if today is the 4th day of month
    const today = new Date();
    if (today.getDate() !== 4) {
      return res.status(400).json({
        success: false,
        message: "Monthly bonus is only available on the 4th day of each month"
      });
    }
    
    const bonusAmount = await user.claimMonthlyBonus();
    
    res.json({
      success: true,
      message: "Monthly bonus claimed successfully",
      data: {
        bonusAmount,
        newBalance: user.balance
      }
    });
  } catch (error) {
    console.error("Claim monthly bonus error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});


// Update bet amounts for weekly/monthly tracking
user_route.put("/update-bet-totals/:userId", async (req, res) => {
  try {
    const { betAmount } = req.body;
    const user = await UserModel.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Update weekly and monthly bet totals
    user.weeklyBonus.totalBet += betAmount;
    user.monthlyBonus.totalBet += betAmount;
    
    // Recalculate bonuses
    user.calculateWeeklyBonus();
    user.calculateMonthlyBonus();
    
    await user.save();
    
    res.json({
      success: true,
      message: "Bet totals updated successfully"
    });
  } catch (error) {
    console.error("Update bet totals error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Check for level ups and get level information
user_route.get("/level-info/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check for level ups
    const levelUpResult = user.checkLevelUp();
    if (levelUpResult.leveledUp) {
      await user.save();
    }

    const levelData = user.calculateCurrentLevel();
    const availableBonuses = user.getAvailableLevelBonuses();

    res.json({
      success: true,
      data: {
        currentLevel: levelData.currentLevel,
        nextLevel: levelData.nextLevel,
        lifetimeDeposit: levelData.lifetimeDeposit,
        progressPercentage: levelData.progressPercentage,
        leveledUp: levelUpResult.leveledUp,
        levelUpInfo: levelUpResult.leveledUp ? {
          fromLevel: levelUpResult.fromLevel,
          toLevel: levelUpResult.toLevel,
          bonusAvailable: levelUpResult.bonusAvailable,
          bonusAmount: levelUpResult.bonusAmount
        } : null,
        availableBonuses: availableBonuses,
        levelHistory: user.levelInfo.lifetimeLevels.sort((a, b) => new Date(b.achievedAt) - new Date(a.achievedAt))
      }
    });

  } catch (error) {
    console.error("Level info error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Claim level up bonus
user_route.post("/claim-level-bonus/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const { levelName } = req.body;
    
    if (!levelName) {
      return res.status(400).json({
        success: false,
        message: "Level name is required"
      });
    }

    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const result = await user.claimLevelUpBonus(levelName);

    res.json({
      success: true,
      message: `Level up bonus claimed successfully for ${levelName} level!`,
      data: result
    });

  } catch (error) {
    console.error("Claim level bonus error:", error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get all level information including bonuses
user_route.get("/level-bonus-info/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const levelData = user.calculateCurrentLevel();
    const availableBonuses = user.getAvailableLevelBonuses();
    const allLevels = Object.values(LEVEL_CONFIG);

    const levelProgress = allLevels.map(level => {
      const isCurrentLevel = level.name === levelData.currentLevel.name;
      const isAchieved = levelData.lifetimeDeposit >= level.threshold;
      const bonusClaimed = user.levelInfo.lifetimeLevels.some(
        l => l.levelName === level.name && l.bonusClaimed
      );
      
      return {
        level: level.name,
        threshold: level.threshold,
        bonus: level.bonus,
        isCurrentLevel,
        isAchieved,
        bonusClaimed,
        progress: levelData.lifetimeDeposit >= level.threshold ? 100 : 
                 levelData.lifetimeDeposit < level.threshold ? 0 :
                 Math.min(100, Math.round(((levelData.lifetimeDeposit - level.threshold) / 
                 (level.threshold - (allLevels[allLevels.indexOf(level) - 1]?.threshold || 0))) * 100))
      };
    });

    res.json({
      success: true,
      data: {
        currentLevel: levelData.currentLevel,
        nextLevel: levelData.nextLevel,
        lifetimeDeposit: levelData.lifetimeDeposit,
        progressPercentage: levelData.progressPercentage,
        availableBonuses: availableBonuses,
        levelProgress: levelProgress,
        totalBonusesClaimed: user.levelInfo.lifetimeLevels.filter(l => l.bonusClaimed).length,
        totalBonusAmount: user.levelInfo.lifetimeLevels
          .filter(l => l.bonusClaimed)
          .reduce((sum, level) => {
            const levelConfig = allLevels.find(l => l.name === level.levelName);
            return sum + (levelConfig?.bonus || 0);
          }, 0)
      }
    });

  } catch (error) {
    console.error("Level bonus info error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
// Transfer Bonus Balance to Main Balance
// user_route.put("/transfer-bonus-to-main-balance", ensureAuthenticated, async (req, res) => {
//     try {
//         const { userId } = req.body;

//         // Validate input
//         if (!userId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "ইউজার আইডি প্রয়োজন" // User ID is required
//             });
//         }

//         // Find user
//         const user = await UserModel.findById(userId);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "ইউজার খুঁজে পাওয়া যায়নি" // User not found
//             });
//         }

//         // Check if there's bonus balance to transfer
//         if (user.bonusBalance <= 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "কোনো সক্রিয় বোনাস ব্যালেন্স নেই" // No active bonus balance
//             });
//         }

//         // Check if wagering requirements are met for all active bonuses
//         const uncompletedBonuses = user.bonusInfo.activeBonuses.filter(
//             bonus => bonus.status === 'active' && bonus.amountWagered < bonus.wageringTarget
//         );

//         if (uncompletedBonuses.length > 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "বোনাসের বাজির প্রয়োজনীয়তা পূরণ করা হয়নি" // Wagering requirements not met
//             });
//         }

//         // Transfer bonus balance to main balance
//         const bonusAmount = user.bonusBalance;
//         const balanceBefore = user.balance;
//         user.balance += bonusAmount;
//         user.bonusBalance = 0;

//         // Update all active bonuses to completed
//         user.bonusInfo.activeBonuses = user.bonusInfo.activeBonuses.map(bonus => {
//             if (bonus.status === 'active') {
//                 return {
//                     ...bonus.toObject(),
//                     status: 'completed',
//                     addedToMainBalance: true
//                 };
//             }
//             return bonus;
//         });

//         // Log transaction
//         user.transactionHistory.push({
//             type: 'bonus_transfer',
//             amount: bonusAmount,
//             balanceBefore: balanceBefore,
//             balanceAfter: user.balance,
//             description: 'Bonus balance transferred to main balance',
//             referenceId: `BONTR-${Date.now()}`,
//             createdAt: new Date()
//         });

//         // Log bonus activity
//         user.bonusActivityLogs.push({
//             bonusType: 'transfer_to_main',
//             bonusAmount: bonusAmount,
//             depositAmount: 0,
//             activatedAt: new Date(),
//             status: 'completed'
//         });

//         await user.save();

//         res.status(200).json({
//             success: true,
//             message: "বোনাস ব্যালেন্স সফলভাবে মেইন ব্যালেন্সে স্থানান্তরিত হয়েছে", // Bonus balance successfully transferred
//             data: {
//                 transferredAmount: bonusAmount,
//                 newMainBalance: user.balance,
//                 newBonusBalance: user.bonusBalance
//             }
//         });

//     } catch (error) {
//         console.error("Bonus transfer error:", error);
//         res.status(500).json({
//             success: false,
//             message: "বোনাস স্থানান্তরে ত্রুটি ঘটেছে" // Error transferring bonus
//         });
//     }
// });

// Transfer Bonus Balance to Main Balance
user_route.put("/transfer-bonus-to-main-balance", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.body;

        // Validate input
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ইউজার আইডি প্রয়োজন" // User ID is required
            });
        }

        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ইউজার খুঁজে পাওয়া যায়নি" // User not found
            });
        }

        // Check if there's bonus balance to transfer
        if (user.bonusBalance <= 0) {
            return res.status(400).json({
                success: false,
                message: "কোনো সক্রিয় বোনাস ব্যালেন্স নেই" // No active bonus balance
            });
        }

        // Check if wagering requirements are met for all active bonuses
        const uncompletedBonuses = user.bonusInfo.activeBonuses.filter(
            bonus => bonus.status === 'active' && bonus.amountWagered < bonus.wageringTarget
        );

        if (uncompletedBonuses.length > 0) {
            return res.status(400).json({
                success: false,
                message: "বোনাসের বাজির প্রয়োজনীয়তা পূরণ করা হয়নি" // Wagering requirements not met
            });
        }

        // Transfer bonus balance to main balance
        const bonusAmount = user.bonusBalance;
        const balanceBefore = user.balance;
        user.balance += bonusAmount;
        user.bonusBalance = 0;

        // Update all active bonuses to completed
        user.bonusInfo.activeBonuses = user.bonusInfo.activeBonuses.map(bonus => {
            if (bonus.status === 'active') {
                return {
                    ...bonus.toObject(),
                    status: 'completed',
                    addedToMainBalance: true
                };
            }
            return bonus;
        });

        // Log transaction
        user.transactionHistory.push({
            type: 'bonus_transfer',
            amount: bonusAmount,
            balanceBefore: balanceBefore,
            balanceAfter: user.balance,
            description: 'Bonus balance transferred to main balance',
            referenceId: `BONTR-${Date.now()}`,
            createdAt: new Date()
        });

        // Log bonus activity - UPDATED: status set to 'completed'
        user.bonusActivityLogs.push({
            bonusType: 'transfer_to_main',
            bonusAmount: bonusAmount,
            depositAmount: 0,
            activatedAt: new Date(),
            status: 'completed' // Changed from 'active' to 'completed'
        });

        // Add to bonus history
        user.bonusHistory.push({
            type: 'transfer_to_main',
            amount: bonusAmount,
            totalBet: 0,
            claimedAt: new Date(),
            status: 'completed'
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "বোনাস ব্যালেন্স সফলভাবে মেইন ব্যালেন্সে স্থানান্তরিত হয়েছে", // Bonus balance successfully transferred
            data: {
                transferredAmount: bonusAmount,
                newMainBalance: user.balance,
                newBonusBalance: user.bonusBalance
            }
        });

    } catch (error) {
        console.error("Bonus transfer error:", error);
        res.status(500).json({
            success: false,
            message: "বোনাস স্থানান্তরে ত্রুটি ঘটেছে" // Error transferring bonus
        });
    }
});

// Complete Special Bonus
user_route.put("/complete-special-bonus", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.body;

        // Validate input
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "ইউজার আইডি প্রয়োজন" // User ID is required
            });
        }

        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "ইউজার খুঁজে পাওয়া যায়নি" // User not found
            });
        }

        // Find active special bonuses
        const specialBonuses = user.bonusInfo.activeBonuses.filter(
            bonus => bonus.bonusType === 'special_bonus' && bonus.status === 'active'
        );

        if (specialBonuses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "কোনো সক্রিয় স্পেশাল বোনাস নেই" // No active special bonus
            });
        }

        let totalBonusAmount = 0;
        const balanceBefore = user.balance;

        // Process each special bonus
        for (let bonus of specialBonuses) {
            if (bonus.amountWagered >= bonus.wageringTarget) {
                totalBonusAmount += bonus.amount;
                bonus.status = 'completed';

                // Log bonus completion
                user.bonusActivityLogs.push({
                    bonusType: 'special_bonus',
                    bonusAmount: bonus.amount,
                    depositAmount: bonus.depositAmount,
                    activatedAt: bonus.createdAt,
                    status: 'completed'
                });

                // If bonus wasn't already added to main balance
                if (!bonus.addedToMainBalance) {
                    user.balance += bonus.amount;
                    user.bonusBalance -= bonus.amount;
                    bonus.addedToMainBalance = true;

                    // Log transaction
                    user.transactionHistory.push({
                        type: 'bonus_transfer',
                        amount: bonus.amount,
                        balanceBefore: user.balance - bonus.amount,
                        balanceAfter: user.balance,
                        description: 'Special bonus completed and transferred to main balance',
                        referenceId: `SPBONTR-${Date.now()}`,
                        createdAt: new Date()
                    });
                }
            }
        }

        // Remove completed bonuses from active list
        user.bonusInfo.activeBonuses = user.bonusInfo.activeBonuses.filter(
            bonus => bonus.status === 'active'
        );

        await user.save();

        if (totalBonusAmount === 0) {
            return res.status(400).json({
                success: false,
                message: "কোনো স্পেশাল বোনাসের বাজির প্রয়োজনীয়তা পূরণ করা হয়নি" // No special bonus wagering requirements met
            });
        }

        res.status(200).json({
            success: true,
            message: "স্পেশাল বোনাস সফলভাবে সম্পন্ন হয়েছে", // Special bonus completed successfully
            data: {
                completedBonusAmount: totalBonusAmount,
                newMainBalance: user.balance,
                newBonusBalance: user.bonusBalance
            }
        });

    } catch (error) {
        console.error("Special bonus completion error:", error);
        res.status(500).json({
            success: false,
            message: "স্পেশাল বোনাস সম্পন্ন করতে ত্রুটি ঘটেছে" // Error completing special bonus
        });
    }
});

// ==================== FORGOT TRANSACTION PASSWORD ROUTES ====================

// Send OTP for transaction password reset
user_route.post("/send-transaction-password-otp", async (req, res) => {
    const { email } = req.body;
    console.log(req.body)
    
    try {
        // Find user by email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি" 
            });
        }

        // Check if user has transaction password set
        if (!user.transactionPassword) {
            return res.status(400).json({ 
                success: false,
                message: "আপনার কোনো ট্রানজেকশন পাসওয়ার্ড সেট আপ করা নেই" 
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Update OTP in the user document for transaction password reset
        user.otp = {
            code: otp,
            expiresAt: Date.now() + 300000, // 5 minutes expiry
            purpose: 'transaction_password_reset',
            verified: false
        };
        
        await user.save();

        // Send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: "support@genzz.casino",
                pass: "rpsu nvzi yqai wdwc",
            },
        });
     const mailOptions = {
    from: "Genzz Casino Support <support@genzz.casino>",
    to: email,
    subject: "Reset Your Transaction Password - Genzz Casino Account",
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
            <h2 style="color: #4A90E2; text-align: center;">Genzz Casino Transaction Password Reset</h2>
            <p>Hello ${user.username},</p>
            <p>We received a request to reset your transaction password for your Genzz Casino account. If you did not make this request, you can safely ignore this email.</p>
            <p style="text-align: center; font-size: 18px; font-weight: bold; color: #333;">Your OTP Code:</p>
            <div style="text-align: center; font-size: 24px; font-weight: bold; color: #4A90E2; padding: 10px; border: 2px dashed #4A90E2; display: inline-block; margin: auto;">
                ${otp}
            </div>
            <p style="text-align: center; font-size: 14px; color: #555;">This OTP is valid for <strong>5 minutes</strong>. Do not share this code with anyone.</p>
            <p><strong>Security Tip:</strong> Your transaction password is different from your login password and is used for financial transactions only.</p>
            <p>If you need further assistance, please contact our support team.</p>
            <p style="margin-top: 20px; font-size: 14px; color: #777;">Best Regards,<br><strong>Genzz Casino Support Team</strong></p>
        </div>
    `,
};

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Error sending transaction password OTP email:", error);
                return res.status(500).json({ 
                    success: false,
                    message: "OTP পাঠাতে সমস্যা হয়েছে" 
                });
            }
            res.json({ 
                success: true,
                message: "ট্রানজেকশন পাসওয়ার্ড রিসেট OTP পাঠানো হয়েছে! এটি ৫ মিনিটের মধ্যে এক্সপায়ার হবে।" 
            });
        });

    } catch (error) {
        console.error("Error in /send-transaction-password-otp:", error);
        res.status(500).json({ 
            success: false,
            message: "সার্ভারে সমস্যা হয়েছে" 
        });
    }
});

// Verify OTP for transaction password reset
user_route.post("/verify-transaction-password-otp", async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find user by email
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" 
            });
        }

        // Check if OTP exists and is for transaction password reset
        if (!user.otp || !user.otp.code || !user.otp.expiresAt || user.otp.purpose !== 'transaction_password_reset') {
            return res.status(400).json({ 
                success: false,
                message: "OTP এক্সপায়ার বা ইনভ্যালিড হয়েছে" 
            });
        }

        // Check if OTP is expired
        if (Date.now() > user.otp.expiresAt) {
            return res.status(400).json({ 
                success: false,
                message: "OTP এক্সপায়ার হয়ে গেছে" 
            });
        }

        // Verify OTP
        if (otp !== user.otp.code) {
            return res.status(400).json({ 
                success: false,
                message: "ভুল OTP কোড" 
            });
        }

        // Mark OTP as verified but don't clear it yet (we'll clear after password reset)
        user.otp.verified = true;
        await user.save();

        res.json({ 
            success: true, 
            message: "OTP ভেরিফাই সফল হয়েছে!",
            token: jwt.sign(
                { 
                    userId: user._id, 
                    email: user.email,
                    purpose: 'transaction_password_reset' 
                }, 
                process.env.JWT_SECRET || 'your-secret-key', 
                { expiresIn: '15m' }
            )
        });

    } catch (error) {
        console.error("Error verifying transaction password OTP:", error);
        res.status(500).json({ 
            success: false,
            message: "সার্ভারে সমস্যা হয়েছে" 
        });
    }
});

// Reset transaction password after OTP verification
user_route.post("/reset-transaction-password", async (req, res) => {
    const { token, newPassword, confirmPassword } = req.body;

    try {
        if (!token) {
            return res.status(400).json({ 
                success: false,
                message: "ভেরিফিকেশন টোকেন প্রয়োজন" 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        if (decoded.purpose !== 'transaction_password_reset') {
            return res.status(400).json({ 
                success: false,
                message: "ইনভ্যালিড টোকেন" 
            });
        }

        // Find user
        const user = await UserModel.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" 
            });
        }

        // Check if OTP was verified
        if (!user.otp || !user.otp.verified) {
            return res.status(400).json({ 
                success: false,
                message: "দয়া করে প্রথমে OTP ভেরিফাই করুন" 
            });
        }

        // Validate new password
        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ 
                success: false,
                message: "পাসওয়ার্ড অবশ্যই ৪ ক্যারেক্টারের বেশি হতে হবে" 
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ 
                success: false,
                message: "পাসওয়ার্ড মিলছে না" 
            });
        }

        // Hash new transaction password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update transaction password
        user.transactionPassword = hashedPassword;
        
        // Clear OTP data
        user.otp = {
            code: null,
            expiresAt: null,
            purpose: null,
            verified: false
        };
        
        await user.save();

        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "support@genzz.casino",
                pass: "rpsu nvzi yqai wdwc",
            },
        });
        const mailOptions = {
            from: "Genzz Casino Support <support@genzz.casino>",
            to: decoded.email, // Use email from decoded token
            subject: "Transaction Password Reset Successful - Genzz Casino Account",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <h2 style="color: #4A90E2; text-align: center;">Genzz Casino Transaction Password Reset</h2>
                    <p>Hello ${user.username},</p>
                    <p>Your transaction password for your Genzz Casino account has been successfully reset.</p>
                    <p>If you did not initiate this change, please contact our support team immediately.</p>
                    <p><strong>Security Tip:</strong> Your transaction password is different from your login password and is used for financial transactions only. Keep it secure and do not share it with anyone.</p>
                    <p>If you need further assistance, please contact our support team.</p>
                    <p style="margin-top: 20px; font-size: 14px; color: #777;">Best Regards,<br><strong>Genzz Casino Support Team</strong></p>
                </div>
            `,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error("Error sending transaction password reset confirmation:", error);
                // Don't return error here, just log it
            }
        });

        res.json({ 
            success: true, 
            message: "ট্রানজেকশন পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে" 
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({ 
                success: false,
                message: "ভেরিফিকেশন টোকেন এক্সপায়ার বা ইনভ্যালিড" 
            });
        }
        
        console.error("Error resetting transaction password:", error);
        res.status(500).json({ 
            success: false,
            message: "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে" 
        });
    }
});

// Check if user has transaction password set
user_route.get("/check-transaction-password/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: "ব্যবহারকারী খুঁজে পাওয়া যায়নি" 
            });
        }

        res.json({ 
            success: true,
            hasTransactionPassword: !!user.transactionPassword,
            isMoneyTransferPasswordSet: user.isMoneyTransferPasswordSet || false
        });

    } catch (error) {
        console.error("Error checking transaction password:", error);
        res.status(500).json({ 
            success: false,
            message: "সার্ভারে সমস্যা হয়েছে" 
        });
    }
});

// Add this to your user route file

// Check if user can spin today
user_route.get("/spin-wheel/check-eligibility/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user has spun today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySpin = await SpinWheelHistory.findOne({
            userId: userId,
            spinDate: {
                $gte: today,
                $lt: tomorrow
            }
        });

        const canSpin = !todaySpin;

        res.json({
            success: true,
            data: {
                canSpin: canSpin,
                lastSpin: todaySpin ? {
                    amount: todaySpin.amount,
                    result: todaySpin.result,
                    spinDate: todaySpin.spinDate
                } : null,
                message: canSpin ? "You can spin the wheel today!" : "You have already spun the wheel today. Come back tomorrow!"
            }
        });

    } catch (error) {
        console.error("Spin wheel eligibility check error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check spin eligibility"
        });
    }
});

// Spin the wheel (UPDATED - without transactions)
user_route.post("/spin-wheel", ensureAuthenticated, async (req, res) => {
    try {
        const { userId, amount } = req.body;

        // Validate input
        if (!userId || !amount) {
            return res.status(400).json({
                success: false,
                message: "User ID and amount are required"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if user has already spun today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySpin = await SpinWheelHistory.findOne({
            userId: userId,
            spinDate: {
                $gte: today,
                $lt: tomorrow
            }
        });

        if (todaySpin) {
            return res.status(400).json({
                success: false,
                message: "You have already spun the wheel today. Come back tomorrow!"
            });
        }

        // Validate amount is positive
        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid spin amount"
            });
        }

        // Create transaction ID
        const transactionId = `SPIN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Add amount to user balance
        const balanceBefore = user.balance;
        user.balance += amount;
        
        // Create spin history record
        const spinHistory = new SpinWheelHistory({
            userId: userId,
            player_id: user.player_id,
            amount: amount,
            result: `Won ৳${amount}`,
            spinDate: new Date(),
            status: 'won',
            transactionId: transactionId
        });

        // Add transaction record
        user.transactionHistory.push({
            type: 'bonus',
            amount: amount,
            balanceBefore: balanceBefore,
            balanceAfter: user.balance,
            description: `Spin wheel reward: ৳${amount}`,
            referenceId: transactionId,
            createdAt: new Date()
        });

        // Save all changes without transaction
        await Promise.all([
            user.save(),
            spinHistory.save()
        ]);

        res.json({
            success: true,
            message: `Congratulations! You won ৳${amount} from the spin wheel!`,
            data: {
                amount: amount,
                newBalance: user.balance,
                transactionId: transactionId,
                spinDate: new Date()
            }
        });

    } catch (error) {
        console.error("Spin wheel error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process spin wheel"
        });
    }
});

// Get spin wheel history
user_route.get("/spin-wheel/history/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const history = await SpinWheelHistory.find({ userId: userId })
            .sort({ spinDate: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await SpinWheelHistory.countDocuments({ userId: userId });

        // Calculate statistics
        const stats = await SpinWheelHistory.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalSpins: { $sum: 1 },
                    totalWon: { $sum: "$amount" },
                    averageWin: { $avg: "$amount" },
                    maxWin: { $max: "$amount" },
                    lastSpin: { $max: "$spinDate" }
                }
            }
        ]);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySpin = await SpinWheelHistory.findOne({
            userId: userId,
            spinDate: {
                $gte: today,
                $lt: tomorrow
            }
        });

        res.json({
            success: true,
            data: {
                history: history,
                statistics: stats[0] || {
                    totalSpins: 0,
                    totalWon: 0,
                    averageWin: 0,
                    maxWin: 0,
                    lastSpin: null
                },
                canSpinToday: !todaySpin,
                todaySpin: todaySpin ? {
                    amount: todaySpin.amount,
                    result: todaySpin.result,
                    spinDate: todaySpin.spinDate
                } : null,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error("Spin wheel history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch spin history"
        });
    }
});

// Get spin wheel statistics
user_route.get("/spin-wheel/stats/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Monthly statistics
        const currentMonth = new Date();
        currentMonth.setDate(1);
        currentMonth.setHours(0, 0, 0, 0);

        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const monthlyStats = await SpinWheelHistory.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    spinDate: { $gte: currentMonth, $lt: nextMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    monthlySpins: { $sum: 1 },
                    monthlyWon: { $sum: "$amount" }
                }
            }
        ]);

        // Weekly statistics
        const currentWeek = new Date();
        currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay());
        currentWeek.setHours(0, 0, 0, 0);

        const nextWeek = new Date(currentWeek);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const weeklyStats = await SpinWheelHistory.aggregate([
            {
                $match: {
                    userId: new mongoose.Types.ObjectId(userId),
                    spinDate: { $gte: currentWeek, $lt: nextWeek }
                }
            },
            {
                $group: {
                    _id: null,
                    weeklySpins: { $sum: 1 },
                    weeklyWon: { $sum: "$amount" }
                }
            }
        ]);

        // Check today's spin eligibility
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todaySpin = await SpinWheelHistory.findOne({
            userId: userId,
            spinDate: {
                $gte: today,
                $lt: tomorrow
            }
        });

        res.json({
            success: true,
            data: {
                canSpinToday: !todaySpin,
                todaySpin: todaySpin,
                monthly: monthlyStats[0] || { monthlySpins: 0, monthlyWon: 0 },
                weekly: weeklyStats[0] || { weeklySpins: 0, weeklyWon: 0 },
                lifetime: await SpinWheelHistory.aggregate([
                    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
                    {
                        $group: {
                            _id: null,
                            totalSpins: { $sum: 1 },
                            totalWon: { $sum: "$amount" },
                            averageWin: { $avg: "$amount" }
                        }
                    }
                ]).then(result => result[0] || { totalSpins: 0, totalWon: 0, averageWin: 0 })
            }
        });

    } catch (error) {
        console.error("Spin wheel stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch spin statistics"
        });
    }
});

// Backend route example
user_route.get('/check-deposit-status/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user has any completed deposits
    const deposits = await transaction_model.find({ 
      customer_id:userId, 
      status: 'success' 
    });
    
    const hasCompletedDeposit = deposits.length > 0;
    
    res.json({
      success: true,
      data: {
        hasCompletedDeposit
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking deposit status'
    });
  }
});


// ==================== REFERRAL COMMISSION COLLECTION SYSTEM ====================

// Collect referral commission from referred users
user_route.post("/collect-referral-commission", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        // Find the referrer
        const referrer = await UserModel.findById(userId);
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: "Referrer not found"
            });
        }

        // Get all referred users
        const referredUsers = await UserModel.find({ referredBy: userId });
        
        if (referredUsers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No referred users found"
            });
        }

        console.log('=== COMMISSION CALCULATION DEBUG ===');
        console.log(`Referrer: ${referrer.username} (${referrer._id})`);
        console.log(`Total referred users: ${referredUsers.length}`);
      
        let totalCommission = 0;
        const commissionDetails = [];
        
        // Calculate and collect commission from ALL referred users
        for (const referredUser of referredUsers) {
            // Calculate net loss: (total_deposit - total_withdraw - current_balance)
            const netLoss = (referredUser.total_deposit || 0) - 
                          (referredUser.total_withdraw || 0) - 
                          (referredUser.balance || 0);

            // Commission is 25% of net loss
            const commission = Math.max(0, netLoss * 0.25);
            const roundedCommission = Math.round(commission * 100) / 100;

            // DEBUG LOGGING FOR EACH USER
            console.log('---');
            console.log(`Referred User: ${referredUser.username} (${referredUser._id})`);
            console.log(`Deposit: ${referredUser.total_deposit || 0}`);
            console.log(`Withdraw: ${referredUser.total_withdraw || 0}`);
            console.log(`Balance: ${referredUser.balance || 0}`);
            console.log(`Net Loss Calculation: (${referredUser.total_deposit || 0} - ${referredUser.total_withdraw || 0} - ${referredUser.balance || 0}) = ${netLoss}`);
            console.log(`Commission: ${netLoss} * 25% = ${netLoss * 0.25}`);
            console.log(`Rounded Commission: ${roundedCommission}`);
            console.log(`Commission > 0: ${commission > 0}`);

            if (commission > 0) {
                totalCommission += roundedCommission;

                // Find or create referral user record
                let referralRecord = referrer.referralUsers.find(
                    ref => ref.user && ref.user.toString() === referredUser._id.toString()
                );

                if (referralRecord) {
                    // Update existing record - add new commission to earned amount
                    referralRecord.earnedAmount += roundedCommission;
                    console.log(`Updated existing referral record. New earned amount: ${referralRecord.earnedAmount}`);
                } else {
                    // Create new referral record
                    referrer.referralUsers.push({
                        user: referredUser._id,
                        joinedAt: referredUser.createdAt,
                        earnedAmount: roundedCommission
                    });
                    console.log(`Created new referral record with earned amount: ${roundedCommission}`);
                }

                commissionDetails.push({
                    referredUser: referredUser.username,
                    netLoss: netLoss,
                    commission: roundedCommission
                });
            } else {
                console.log(`No commission for ${referredUser.username} - commission is 0 or negative`);
            }
        }

        console.log('---');
        console.log(`TOTAL COMMISSION CALCULATED: ${totalCommission}`);
        console.log(`Users with commission: ${commissionDetails.length}`);
        console.log('=== END DEBUG ===');

        if (totalCommission > 0) {
            // ADD ALL COMMISSION TO REFERRAL EARNINGS
            const oldReferralEarnings = referrer.referralEarnings;
            referrer.referralEarnings += totalCommission;

            console.log(`Updating referral earnings: ${oldReferralEarnings} + ${totalCommission} = ${referrer.referralEarnings}`);

            // Add transaction record
            referrer.transactionHistory.push({
                type: 'referral_commission',
                amount: totalCommission,
                balanceBefore: referrer.balance,
                balanceAfter: referrer.balance, // Only affects referralEarnings, not main balance
                description: `Referral commission collected from ${referredUsers.length} users`,
                referenceId: `REFCOM-${Date.now()}`,
                createdAt: new Date()
            });

            // Log in bonus history
            referrer.bonusHistory.push({
                type: 'referral_commission',
                amount: totalCommission,
                claimedAt: new Date(),
                status: 'claimed'
            });

            await referrer.save();
            console.log('Referrer data saved successfully');

            res.status(200).json({
                success: true,
                message: `Successfully collected ৳${totalCommission.toFixed(2)} referral commission from ${commissionDetails.length} users`,
                data: {
                    totalCommission: totalCommission,
                    totalReferredUsers: referredUsers.length,
                    usersWithCommission: commissionDetails.length,
                    commissionDetails: commissionDetails,
                    newReferralEarnings: referrer.referralEarnings
                }
            });
        } else {
            console.log('No commission to collect - sending response');
            res.status(400).json({
                success: false,
                message: "No commission available to collect from referred users",
                data: {
                    totalCommission: 0,
                    totalReferredUsers: referredUsers.length,
                    usersWithCommission: 0
                }
            });
        }

    } catch (error) {
        console.error("Referral commission collection error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to collect referral commission",
            error: error.message
        });
    }
});

// Get detailed referral commission summary
user_route.get("/referral-commission-summary/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;

        const referrer = await UserModel.findById(userId);
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get all referred users
        const referredUsers = await UserModel.find({ referredBy: userId });
        
        const commissionSummary = await Promise.all(
            referredUsers.map(async (referredUser) => {
                // Calculate current potential commission
                const netLoss = (referredUser.total_deposit || 0) - 
                              (referredUser.total_withdraw || 0) - 
                              (referredUser.balance || 0);
                
                const totalPotentialCommission = Math.max(0, netLoss * 0.25);
                const roundedCommission = Math.round(totalPotentialCommission * 100) / 100;

                // Find how much commission has already been earned from this user
                const existingCommissionEntry = referrer.referralUsers.find(
                    ref => ref.user && ref.user.toString() === referredUser._id.toString()
                );

                const alreadyEarned = existingCommissionEntry ? existingCommissionEntry.earnedAmount : 0;
                const availableCommission = Math.max(0, roundedCommission - alreadyEarned);

                return {
                    referredUserId: referredUser._id,
                    username: referredUser.username,
                    email: referredUser.email,
                    joinDate: referredUser.createdAt,
                    totalDeposit: referredUser.total_deposit || 0,
                    totalWithdraw: referredUser.total_withdraw || 0,
                    currentBalance: referredUser.balance || 0,
                    netLoss: netLoss,
                    totalPotentialCommission: roundedCommission,
                    alreadyEarned: alreadyEarned,
                    availableCommission: availableCommission,
                    lastActivity: referredUser.last_login || referredUser.createdAt,
                    calculationDetails: {
                        formula: "(total_deposit - total_withdraw - balance) × 25%",
                        calculation: `(${referredUser.total_deposit} - ${referredUser.total_withdraw} - ${referredUser.balance}) × 0.25 = ${roundedCommission}`
                    }
                };
            })
        );

        // Calculate totals
        const totalPotentialCommission = commissionSummary.reduce((sum, user) => sum + user.totalPotentialCommission, 0);
        const totalAlreadyEarned = commissionSummary.reduce((sum, user) => sum + user.alreadyEarned, 0);
        const totalAvailableCommission = commissionSummary.reduce((sum, user) => sum + user.availableCommission, 0);

        // Filter users with available commission
        const usersWithAvailableCommission = commissionSummary.filter(user => user.availableCommission > 0);
        const usersWithEarnings = commissionSummary.filter(user => user.alreadyEarned > 0);

        res.status(200).json({
            success: true,
            data: {
                referrerInfo: {
                    username: referrer.username,
                    referralCode: referrer.referralCode,
                    currentReferralEarnings: referrer.referralEarnings || 0
                },
                summary: {
                    totalReferredUsers: referredUsers.length,
                    totalPotentialCommission: totalPotentialCommission,
                    totalAlreadyEarned: totalAlreadyEarned,
                    totalAvailableCommission: totalAvailableCommission,
                    usersWithAvailableCommission: usersWithAvailableCommission.length,
                    usersWithEarnings: usersWithEarnings.length
                },
                commissionRate: "25% of referred user's net loss (total_deposit - total_withdraw - balance)",
                referredUsers: commissionSummary,
                lastUpdated: new Date()
            }
        });

    } catch (error) {
        console.error("Referral commission summary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get referral commission summary",
            error: error.message
        });
    }
});

// Auto-collect referral commission with threshold
user_route.post("/auto-collect-referral-commission", ensureAuthenticated, async (req, res) => {
    try {
        const { userId, minCommission = 1 } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const referrer = await UserModel.findById(userId);
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const referredUsers = await UserModel.find({ referredBy: userId });
        
        if (referredUsers.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No referred users found"
            });
        }

        let totalCommission = 0;
        const collectedUsers = [];
        const skippedUsers = [];

        for (const referredUser of referredUsers) {
            const netLoss = (referredUser.total_deposit || 0) - 
                          (referredUser.total_withdraw || 0) - 
                          (referredUser.balance || 0);

            const commission = Math.max(0, netLoss * 0.25);
            const roundedCommission = Math.round(commission * 100) / 100;

            if (roundedCommission > 0) {
                // Check existing earnings
                const existingCommissionEntry = referrer.referralUsers.find(
                    ref => ref.user && ref.user.toString() === referredUser._id.toString()
                );

                const existingEarnings = existingCommissionEntry ? existingCommissionEntry.earnedAmount : 0;
                const newCommission = Math.max(0, roundedCommission - existingEarnings);

                // Apply minimum commission threshold
                if (newCommission >= minCommission) {
                    referrer.referralEarnings += newCommission;
                    totalCommission += newCommission;

                    // Update referral user record
                    if (existingCommissionEntry) {
                        existingCommissionEntry.earnedAmount += newCommission;
                    } else {
                        referrer.referralUsers.push({
                            user: referredUser._id,
                            joinedAt: referredUser.createdAt,
                            earnedAmount: newCommission
                        });
                    }

                    // Add transaction record
                    referrer.transactionHistory.push({
                        type: 'referral_commission',
                        amount: newCommission,
                        balanceBefore: referrer.balance,
                        balanceAfter: referrer.balance,
                        description: `Auto-collected referral commission from ${referredUser.username}`,
                        referenceId: `AUTOREF-${Date.now()}-${referredUser._id}`,
                        createdAt: new Date()
                    });

                    collectedUsers.push({
                        username: referredUser.username,
                        commission: newCommission,
                        netLoss: netLoss,
                        status: 'collected'
                    });
                } else {
                    skippedUsers.push({
                        username: referredUser.username,
                        potentialCommission: newCommission,
                        reason: newCommission > 0 ? `Below minimum threshold (${minCommission})` : 'No new commission',
                        netLoss: netLoss
                    });
                }
            }
        }

        if (totalCommission > 0) {
            // Log in bonus history
            referrer.bonusHistory.push({
                type: 'referral_commission',
                amount: totalCommission,
                totalBet: 0,
                claimedAt: new Date(),
                status: 'claimed'
            });

            await referrer.save();

            res.status(200).json({
                success: true,
                message: `Auto-collected ৳${totalCommission.toFixed(2)} referral commission from ${collectedUsers.length} users`,
                data: {
                    totalCommission: totalCommission,
                    collectedFrom: collectedUsers.length,
                    minimumThreshold: minCommission,
                    collectedUsers: collectedUsers,
                    skippedUsers: skippedUsers,
                    newReferralEarnings: referrer.referralEarnings
                }
            });
        } else {
            res.status(200).json({
                success: true,
                message: `No commission available to collect (minimum threshold: ${minCommission})`,
                data: {
                    totalCommission: 0,
                    collectedFrom: 0,
                    skippedUsers: skippedUsers,
                    minimumThreshold: minCommission
                }
            });
        }

    } catch (error) {
        console.error("Auto-collect referral commission error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to auto-collect referral commission",
            error: error.message
        });
    }
});

// Get referral commission history
user_route.get("/referral-commission-history/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Filter transaction history for referral commissions
        const referralCommissions = user.transactionHistory
            .filter(transaction => transaction.type === 'referral_commission')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice((page - 1) * limit, page * limit);

        // Get total count for pagination
        const totalCommissions = user.transactionHistory.filter(
            transaction => transaction.type === 'referral_commission'
        ).length;

        // Calculate statistics
        const totalCommissionEarned = user.transactionHistory
            .filter(transaction => transaction.type === 'referral_commission')
            .reduce((sum, transaction) => sum + transaction.amount, 0);

        res.status(200).json({
            success: true,
            data: {
                commissionHistory: referralCommissions,
                statistics: {
                    totalCommissionEarned: totalCommissionEarned,
                    totalTransactions: totalCommissions,
                    averageCommission: totalCommissions > 0 ? totalCommissionEarned / totalCommissions : 0
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: totalCommissions,
                    pages: Math.ceil(totalCommissions / limit)
                }
            }
        });

    } catch (error) {
        console.error("Referral commission history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get referral commission history",
            error: error.message
        });
    }
});

// Quick commission check (lightweight version)
user_route.get("/quick-commission-check/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;

        const referrer = await UserModel.findById(userId);
        if (!referrer) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get only basic info about referred users for quick calculation
        const referredUsers = await UserModel.find(
            { referredBy: userId },
            'username total_deposit total_withdraw balance createdAt'
        );

        let totalAvailableCommission = 0;
        let usersWithCommission = 0;

        for (const referredUser of referredUsers) {
            const netLoss = (referredUser.total_deposit || 0) - 
                          (referredUser.total_withdraw || 0) - 
                          (referredUser.balance || 0);

            const totalCommission = Math.max(0, netLoss * 0.25);
            const roundedCommission = Math.round(totalCommission * 100) / 100;

            if (roundedCommission > 0) {
                // Check existing earnings
                const existingCommissionEntry = referrer.referralUsers.find(
                    ref => ref.user && ref.user.toString() === referredUser._id.toString()
                );

                const existingEarnings = existingCommissionEntry ? existingCommissionEntry.earnedAmount : 0;
                const availableCommission = Math.max(0, roundedCommission - existingEarnings);

                if (availableCommission > 0) {
                    totalAvailableCommission += availableCommission;
                    usersWithCommission++;
                }
            }
        }

        res.status(200).json({
            success: true,
            data: {
                totalReferredUsers: referredUsers.length,
                usersWithAvailableCommission: usersWithCommission,
                totalAvailableCommission: totalAvailableCommission,
                canCollect: totalAvailableCommission > 0,
                currentReferralEarnings: referrer.referralEarnings || 0,
                lastChecked: new Date()
            }
        });

    } catch (error) {
        console.error("Quick commission check error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check commission availability",
            error: error.message
        });
    }
});

// ==================== USER BONUS ROUTES ====================

// GET all active bonuses for user
// GET all active bonuses for user
user_route.get("/bonuses/available", ensureAuthenticated, async (req, res) => {
  try {
    const { userid } = req.query; // Get userid from query params
    const userId = userid || req.user?._id; // Use query param or authenticated user
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    // Find user with necessary fields
    const user = await User.findById(userId)
      .select('createdAt depositHistory bonusActivityLogs bonusInfo activeBonuses');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Calculate days since registration
    const daysSinceRegistration = Math.floor(
      (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
    );
    
    // Find active bonuses that haven't expired
    const allBonuses = await Bonus.find({
      status: 'active',
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ],
      startDate: { $lte: new Date() }
    });
    
    // Get all bonus IDs that user has already claimed (from multiple sources)
    const claimedBonusIds = new Set();
    
    // 1. Check bonusActivityLogs
    if (user.bonusActivityLogs && user.bonusActivityLogs.length > 0) {
      user.bonusActivityLogs.forEach(log => {
        if (log.bonusId) {
          claimedBonusIds.add(log.bonusId.toString());
        }
      });
    }
    
    // 2. Check depositHistory for bonusId
    if (user.depositHistory && user.depositHistory.length > 0) {
      user.depositHistory.forEach(deposit => {
        if (deposit.bonusId && deposit.status === 'completed') {
          claimedBonusIds.add(deposit.bonusId.toString());
        }
      });
    }
    
    // 3. Check bonusInfo.activeBonuses (deprecated but still check)
    if (user.bonusInfo && user.bonusInfo.activeBonuses) {
      user.bonusInfo.activeBonuses.forEach(bonus => {
        if (bonus.bonusId) {
          claimedBonusIds.add(bonus.bonusId.toString());
        }
      });
    }
    
    // Filter bonuses user is eligible for
    const eligibleBonuses = allBonuses.filter(bonus => {
      // Check if bonus has reached max claims
      if (bonus.maxClaims !== null && bonus.maxClaims !== undefined && bonus.claimCount >= bonus.maxClaims) {
        return false;
      }
      
      // Check new/existing user eligibility
      if (bonus.applicableTo === 'new' && daysSinceRegistration > 7) {
        return false;
      }
      if (bonus.applicableTo === 'existing' && daysSinceRegistration <= 7) {
        return false;
      }
      
      // Check if user has already claimed non-reusable bonus
      if (!bonus.reusable) {
        // Check if this bonus ID is in claimedBonusIds
        if (claimedBonusIds.has(bonus._id.toString())) {
          return false;
        }
        
        // Also check by bonus code in deposit history
        const hasClaimedByCode = user.depositHistory?.some(deposit => 
          deposit.status === 'completed' && 
          deposit.bonusCode === bonus.bonusCode
        );
        if (hasClaimedByCode) {
          return false;
        }
      }
      
      // Check assigned users for private/single user bonuses
      if (bonus.distributionType === 'single_user' || bonus.distributionType === 'private') {
        const isAssigned = bonus.assignedUsers?.some(
          assignment => assignment.userId.toString() === userId.toString()
        );
        if (!isAssigned) return false;
      }
      
      // Check first deposit bonus eligibility
      if (bonus.bonusType === 'first_deposit') {
        const hasPreviousDeposits = user.depositHistory?.some(
          deposit => deposit.status === 'completed'
        );
        if (hasPreviousDeposits) return false;
      }
      
      return true;
    });
    
    // Format bonuses for response
    const formattedBonuses = eligibleBonuses.map(bonus => {
      // UPDATED: Generate description with new validity types
      let description = '';
      if (bonus.percentage > 0) {
        description = `${bonus.percentage}% bonus on deposit`;
        if (bonus.maxBonus > 0) {
          description += ` (max ${bonus.maxBonus}৳)`;
        }
      } else if (bonus.amount > 0) {
        description = `${bonus.amount}৳ fixed bonus`;
      }
      
      // Add wagering info
      if (bonus.wageringRequirement > 0) {
        description += ` | ${bonus.wageringRequirement}x wager`;
      }
      
      // Add balance type info
      if (bonus.balanceType) {
        description += ` | ${bonus.balanceType === 'cash_balance' ? 'Cash' : 'Bonus'} Balance`;
      }

      // UPDATED: Calculate expiry date for response
      let expiryInfo = null;
      if (bonus.validityType === 'infinite') {
        expiryInfo = 'Never expires';
      } else if (bonus.validityType && bonus.validityValue) {
        const now = new Date();
        let expiryDate;
        
        if (bonus.validityType === 'days') {
          expiryDate = new Date(now);
          expiryDate.setDate(expiryDate.getDate() + bonus.validityValue);
        } else if (bonus.validityType === 'hours') {
          expiryDate = new Date(now);
          expiryDate.setHours(expiryDate.getHours() + bonus.validityValue);
        }
        
        if (expiryDate) {
          expiryInfo = {
            type: bonus.validityType,
            value: bonus.validityValue,
            expiryDate: expiryDate.toISOString(),
            formatted: `Valid for ${bonus.validityValue} ${bonus.validityType}`
          };
        }
      } else if (bonus.validityDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + bonus.validityDays);
        expiryInfo = {
          type: 'days',
          value: bonus.validityDays,
          expiryDate: expiryDate.toISOString(),
          formatted: `Valid for ${bonus.validityDays} days`
        };
      }
      
      // UPDATED: Game categories info
      let gameCategoriesInfo = 'All Games';
      if (bonus.gamesCategory && !bonus.gamesCategory.includes('all')) {
        // Get first few category names
        const categories = bonus.gamesCategory.slice(0, 3).map(cat => {
          // Map category IDs to readable names
          const categoryMap = {
            'গরম খেলা': 'Hot Games',
            'স্লট গেম': 'Slot Games',
            'টেবিল': 'Table Games',
            'ক্যাসিনো': 'Casino',
            'রুলেট': 'Roulette',
            'ইনস্ট্যান্ট': 'Instant',
            'স্ক্র্যাচ কার্ড': 'Scratch Cards',
            'ফিশিং': 'Fishing',
            'পোকার': 'Poker',
            'ভিডিও পোকার': 'Video Poker',
            'ক্রাশ': 'Crash',
            'লাইভ ডিলার': 'Live Dealer',
            'লটারি': 'Lottery',
            'ভি-স্পোর্টস': 'V-Sports',
            'জনপ্রিয়': 'Popular',
            'আমেরিকান রুলেট': 'American Roulette',
            'কার্ড': 'Card Games',
            'ব্ল্যাকজ্যাক': 'Blackjack'
          };
          return categoryMap[cat] || cat;
        });
        
        gameCategoriesInfo = categories.join(', ');
        if (bonus.gamesCategory.length > 3) {
          gameCategoriesInfo += ` +${bonus.gamesCategory.length - 3} more`;
        }
      }
      
      return {
        id: bonus._id,
        _id: bonus._id,
        name: bonus.name,
        bonusCode: bonus.bonusCode,
        bonusType: bonus.bonusType,
        balanceType: bonus.balanceType || 'bonus_balance',
        amount: bonus.amount,
        percentage: bonus.percentage,
        minDeposit: bonus.minDeposit,
        maxBonus: bonus.maxBonus,
        wageringRequirement: bonus.wageringRequirement,
        // UPDATED: New validity fields
        validityType: bonus.validityType || 'days',
        validityValue: bonus.validityValue || (bonus.validityType === 'infinite' ? 0 : bonus.validityDays || 30),
        validityDays: bonus.validityDays || (bonus.validityType === 'days' ? bonus.validityValue : 30),
        expiryInfo: expiryInfo,
        // UPDATED: Game categories
        gamesCategory: bonus.gamesCategory || [],
        gamesCategoryInfo: gameCategoriesInfo,
        applicableTo: bonus.applicableTo,
        distributionType: bonus.distributionType,
        reusable: bonus.reusable,
        description: description,
        startDate: bonus.startDate,
        endDate: bonus.endDate,
        claimCount: bonus.claimCount || 0,
        maxClaims: bonus.maxClaims,
        // Additional info for UI display
        displayInfo: {
          isInfinite: bonus.validityType === 'infinite',
          isHourly: bonus.validityType === 'hours',
          isDaily: bonus.validityType === 'days' || (!bonus.validityType && bonus.validityDays),
          formattedValidity: bonus.validityType === 'infinite' 
            ? 'Never expires' 
            : bonus.validityType === 'hours'
              ? `${bonus.validityValue || 24} hours`
              : `${bonus.validityValue || bonus.validityDays || 30} days`
        }
      };
    });
    
    // UPDATED: Sort bonuses: infinite validity first, then by expiry date
    formattedBonuses.sort((a, b) => {
      // Infinite bonuses first
      if (a.validityType === 'infinite' && b.validityType !== 'infinite') return -1;
      if (a.validityType !== 'infinite' && b.validityType === 'infinite') return 1;
      
      // Then by validity duration (shortest first)
      if (a.validityType === b.validityType && a.validityValue && b.validityValue) {
        return a.validityValue - b.validityValue;
      }
      
      // Then by bonus amount/value
      const aValue = a.amount || (a.percentage * 1000); // Rough estimate for percentage
      const bValue = b.amount || (b.percentage * 1000);
      return bValue - aValue;
    });
    
    res.json({
      success: true,
      data: formattedBonuses,
      // Debug info (optional - remove in production)
      debug: {
        totalBonuses: allBonuses.length,
        eligibleCount: eligibleBonuses.length,
        claimedBonusIds: Array.from(claimedBonusIds),
        userAgeDays: daysSinceRegistration,
        // UPDATED: Add validity type summary
        validitySummary: {
          infinite: eligibleBonuses.filter(b => b.validityType === 'infinite').length,
          days: eligibleBonuses.filter(b => b.validityType === 'days').length,
          hours: eligibleBonuses.filter(b => b.validityType === 'hours').length,
          unspecified: eligibleBonuses.filter(b => !b.validityType).length
        }
      }
    });
    
  } catch (error) {
    console.error("Error fetching bonuses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch available bonuses"
    });
  }
});


// Helper function to generate bonus description
function getBonusDescription(bonus) {
  let description = '';
  
  if (bonus.amount > 0) {
    description += `Get ${bonus.amount.toFixed(2)} BDT bonus. `;
  }
  
  if (bonus.percentage > 0) {
    description += `Get ${bonus.percentage}% bonus on your deposit. `;
  }
  
  if (bonus.minDeposit > 0) {
    description += `Minimum deposit: ${bonus.minDeposit.toFixed(2)} BDT. `;
  }
  
  if (bonus.maxBonus) {
    description += `Maximum bonus: ${bonus.maxBonus.toFixed(2)} BDT. `;
  }
  
  if (bonus.wageringRequirement > 0) {
    description += `Wagering requirement: ${bonus.wageringRequirement}x. `;
  }
  
  description += `Valid for ${bonus.validityDays} days.`;
  
  return description;
}

// GET user's active bonuses (bonuses they have claimed)
user_route.get("/bonuses/my-bonuses", ensureAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    
    // Get all active bonuses from user's bonusInfo
    const activeBonuses = user.bonusInfo?.activeBonuses || [];
    const bonusActivityLogs = user.bonusActivityLogs || [];
    
    // Format active bonuses with additional info
    const formattedActiveBonuses = activeBonuses.map(bonus => {
      const remainingDays = Math.ceil((new Date(bonus.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        bonusId: bonus.bonusId,
        bonusCode: bonus.bonusCode,
        bonusType: bonus.bonusType,
        amount: bonus.amount,
        originalAmount: bonus.originalAmount,
        wageringRequirement: bonus.wageringRequirement,
        wageringCompleted: bonus.wageringCompleted || 0,
        remainingWagering: Math.max(0, (bonus.originalAmount * bonus.wageringRequirement) - (bonus.wageringCompleted || 0)),
        createdAt: bonus.createdAt,
        expiresAt: bonus.expiresAt,
        remainingDays: Math.max(0, remainingDays),
        status: 'active'
      };
    });

    // Get recently claimed/used bonuses from activity logs
    const recentActivity = bonusActivityLogs
      .sort((a, b) => new Date(b.activatedAt) - new Date(a.activatedAt))
      .slice(0, 10)
      .map(log => ({
        bonusType: log.bonusType,
        bonusAmount: log.bonusAmount,
        depositAmount: log.depositAmount || 0,
        activatedAt: log.activatedAt,
        status: log.status,
        source: log.source
      }));

    res.json({
      success: true,
      data: {
        bonusBalance: user.bonusBalance || 0,
        activeBonuses: formattedActiveBonuses,
        recentActivity: recentActivity,
        stats: {
          totalActive: formattedActiveBonuses.length,
          totalWageringRequired: formattedActiveBonuses.reduce((sum, bonus) => 
            sum + (bonus.originalAmount * bonus.wageringRequirement), 0),
          totalWageringCompleted: formattedActiveBonuses.reduce((sum, bonus) => 
            sum + (bonus.wageringCompleted || 0), 0)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching user bonuses:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user bonuses"
    });
  }
});

// GET specific bonus details by code
user_route.get("/bonuses/code/:code", ensureAuthenticated, async (req, res) => {
  try {
    const { code } = req.params;
    const user = req.user;

    // Find bonus by code
    const bonus = await Bonus.findOne({ 
      bonusCode: code.toUpperCase(),
      status: 'active',
      endDate: { $gte: new Date() },
      startDate: { $lte: new Date() }
    });

    if (!bonus) {
      return res.status(404).json({
        success: false,
        message: "Bonus code not found or expired"
      });
    }

    // Check if user is eligible
    const userCreatedDate = new Date(user.createdAt);
    const daysSinceRegistration = Math.floor((new Date() - userCreatedDate) / (1000 * 60 * 60 * 24));
    
    let isEligible = true;
    let eligibilityMessage = 'You are eligible for this bonus';

    if (bonus.applicableTo === 'new' && daysSinceRegistration > 7) {
      isEligible = false;
      eligibilityMessage = 'This bonus is only for new users (registered within 7 days)';
    } else if (bonus.applicableTo === 'existing' && daysSinceRegistration <= 7) {
      isEligible = false;
      eligibilityMessage = 'This bonus is only for existing users (registered more than 7 days ago)';
    }

    // Check if user has already claimed this bonus
    const alreadyClaimed = user.bonusActivityLogs?.some(log => 
      log.bonusCode === bonus.bonusCode && log.status === 'active'
    );

    if (alreadyClaimed) {
      isEligible = false;
      eligibilityMessage = 'You have already claimed this bonus';
    }

    // Calculate example bonus amount
    let exampleAmount = 0;
    if (bonus.percentage > 0 && bonus.minDeposit > 0) {
      exampleAmount = (bonus.minDeposit * bonus.percentage) / 100;
      if (bonus.maxBonus && exampleAmount > bonus.maxBonus) {
        exampleAmount = bonus.maxBonus;
      }
    } else if (bonus.amount > 0) {
      exampleAmount = bonus.amount;
    }

    const response = {
      success: true,
      data: {
        id: bonus._id,
        name: bonus.name,
        bonusCode: bonus.bonusCode,
        bonusType: bonus.bonusType,
        amount: bonus.amount,
        percentage: bonus.percentage,
        minDeposit: bonus.minDeposit,
        maxBonus: bonus.maxBonus,
        wageringRequirement: bonus.wageringRequirement,
        validityDays: bonus.validityDays,
        applicableTo: bonus.applicableTo,
        endDate: bonus.endDate,
        description: getBonusDescription(bonus),
        exampleAmount: exampleAmount,
        isEligible: isEligible,
        eligibilityMessage: eligibilityMessage,
        alreadyClaimed: alreadyClaimed
      }
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching bonus by code:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bonus details"
    });
  }
});

// POST claim bonus (user enters bonus code)
user_route.post("/bonuses/claim", ensureAuthenticated, async (req, res) => {
  try {
    const { bonusCode, depositAmount = 0 } = req.body;
    const user = req.user;

    if (!bonusCode) {
      return res.status(400).json({
        success: false,
        message: "Bonus code is required"
      });
    }

    // Find bonus by code
    const bonus = await Bonus.findOne({ 
      bonusCode: bonusCode.toUpperCase(),
      status: 'active',
      endDate: { $gte: new Date() },
      startDate: { $lte: new Date() }
    });

    if (!bonus) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired bonus code"
      });
    }

    // Check eligibility
    const userCreatedDate = new Date(user.createdAt);
    const daysSinceRegistration = Math.floor((new Date() - userCreatedDate) / (1000 * 60 * 60 * 24));

    if (bonus.applicableTo === 'new' && daysSinceRegistration > 7) {
      return res.status(400).json({
        success: false,
        message: "This bonus is only for new users (registered within 7 days)"
      });
    }

    if (bonus.applicableTo === 'existing' && daysSinceRegistration <= 7) {
      return res.status(400).json({
        success: false,
        message: "This bonus is only for existing users (registered more than 7 days ago)"
      });
    }

    // Check if minimum deposit requirement is met
    if (depositAmount > 0 && depositAmount < bonus.minDeposit) {
      return res.status(400).json({
        success: false,
        message: `Minimum deposit required: ${bonus.minDeposit} BDT`
      });
    }

    // Check if user has already claimed this bonus
    const alreadyClaimed = user.bonusActivityLogs?.some(log => 
      log.bonusCode === bonus.bonusCode && log.status === 'active'
    );

    if (alreadyClaimed) {
      return res.status(400).json({
        success: false,
        message: "You have already claimed this bonus"
      });
    }

    // Calculate bonus amount
    let bonusAmount = bonus.amount;
    if (bonus.percentage > 0 && depositAmount > 0) {
      bonusAmount = (depositAmount * bonus.percentage) / 100;
      if (bonus.maxBonus && bonusAmount > bonus.maxBonus) {
        bonusAmount = bonus.maxBonus;
      }
    }

    // Add bonus to user's balance
    user.bonusBalance = (user.bonusBalance || 0) + bonusAmount;

    // Add to active bonuses
    user.bonusInfo = user.bonusInfo || {};
    user.bonusInfo.activeBonuses = user.bonusInfo.activeBonuses || [];
    
    user.bonusInfo.activeBonuses.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusCode: bonus.bonusCode,
      amount: bonusAmount,
      originalAmount: bonusAmount,
      wageringRequirement: bonus.wageringRequirement,
      wageringCompleted: 0,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + bonus.validityDays * 24 * 60 * 60 * 1000)
    });

    // Log the bonus activity
    user.bonusActivityLogs = user.bonusActivityLogs || [];
    user.bonusActivityLogs.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusCode: bonus.bonusCode,
      bonusAmount: bonusAmount,
      depositAmount: depositAmount,
      activatedAt: new Date(),
      status: "active",
      source: "manual_claim"
    });

    // Add transaction history
    user.transactionHistory = user.transactionHistory || [];
    user.transactionHistory.push({
      type: "bonus",
      amount: bonusAmount,
      balanceBefore: user.bonusBalance - bonusAmount,
      balanceAfter: user.bonusBalance,
      description: `Bonus claimed: ${bonus.name} (${bonus.bonusCode})`,
      referenceId: `BONUS-${Date.now()}`,
      createdAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: "Bonus claimed successfully!",
      data: {
        bonusAmount: bonusAmount,
        newBonusBalance: user.bonusBalance,
        wageringRequirement: bonus.wageringRequirement,
        validityDays: bonus.validityDays,
        expiresAt: new Date(Date.now() + bonus.validityDays * 24 * 60 * 60 * 1000)
      }
    });

  } catch (error) {
    console.error("Error claiming bonus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to claim bonus"
    });
  }
});

// GET user's bonus wagering status
user_route.get("/bonuses/wagering-status", ensureAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    
    const activeBonuses = user.bonusInfo?.activeBonuses || [];
    
    // Calculate total wagering stats
    const totalWageringRequired = activeBonuses.reduce((sum, bonus) => 
      sum + (bonus.originalAmount * bonus.wageringRequirement), 0);
    
    const totalWageringCompleted = activeBonuses.reduce((sum, bonus) => 
      sum + (bonus.wageringCompleted || 0), 0);
    
    const totalWageringRemaining = totalWageringRequired - totalWageringCompleted;
    
    // Calculate percentage completed
    const percentageCompleted = totalWageringRequired > 0 
      ? Math.min(100, (totalWageringCompleted / totalWageringRequired) * 100)
      : 0;

    // Get active bonuses with detailed wagering info
    const bonusWageringDetails = activeBonuses.map(bonus => {
      const remainingWagering = Math.max(0, 
        (bonus.originalAmount * bonus.wageringRequirement) - (bonus.wageringCompleted || 0)
      );
      
      const bonusPercentageCompleted = bonus.wageringRequirement > 0
        ? Math.min(100, ((bonus.wageringCompleted || 0) / (bonus.originalAmount * bonus.wageringRequirement)) * 100)
        : 0;

      return {
        bonusId: bonus.bonusId,
        bonusCode: bonus.bonusCode,
        bonusType: bonus.bonusType,
        bonusAmount: bonus.amount,
        originalAmount: bonus.originalAmount,
        wageringRequirement: bonus.wageringRequirement,
        wageringCompleted: bonus.wageringCompleted || 0,
        remainingWagering: remainingWagering,
        percentageCompleted: bonusPercentageCompleted,
        expiresAt: bonus.expiresAt
      };
    });

    res.json({
      success: true,
      data: {
        bonusBalance: user.bonusBalance || 0,
        totalWageringRequired: totalWageringRequired,
        totalWageringCompleted: totalWageringCompleted,
        totalWageringRemaining: totalWageringRemaining,
        percentageCompleted: percentageCompleted,
        activeBonusesCount: activeBonuses.length,
        bonusWageringDetails: bonusWageringDetails,
        canWithdrawBonusFunds: totalWageringRemaining === 0 && user.bonusBalance > 0
      }
    });
  } catch (error) {
    console.error("Error fetching wagering status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch wagering status"
    });
  }
});

// POST convert bonus to real money (after wagering completed)
user_route.post("/bonuses/convert", ensureAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    
    // Check if user has any bonus balance
    if (!user.bonusBalance || user.bonusBalance <= 0) {
      return res.status(400).json({
        success: false,
        message: "No bonus balance available"
      });
    }

    // Check wagering requirements for all active bonuses
    const activeBonuses = user.bonusInfo?.activeBonuses || [];
    const incompleteWagering = activeBonuses.filter(bonus => {
      const requiredWagering = bonus.originalAmount * bonus.wageringRequirement;
      return (bonus.wageringCompleted || 0) < requiredWagering;
    });

    if (incompleteWagering.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Wagering requirements not met for all bonuses",
        incompleteBonuses: incompleteWagering.map(b => ({
          bonusCode: b.bonusCode,
          wageringCompleted: b.wageringCompleted || 0,
          wageringRequired: b.originalAmount * b.wageringRequirement,
          remaining: (b.originalAmount * b.wageringRequirement) - (b.wageringCompleted || 0)
        }))
      });
    }

    // Convert bonus to real money
    const bonusAmount = user.bonusBalance;
    const newRealBalance = (user.balance || 0) + bonusAmount;

    // Update balances
    user.balance = newRealBalance;
    user.bonusBalance = 0;

    // Mark active bonuses as converted
    activeBonuses.forEach(bonus => {
      bonus.status = 'converted';
      bonus.convertedAt = new Date();
    });

    // Log transaction
    user.transactionHistory.push({
      type: "bonus_conversion",
      amount: bonusAmount,
      balanceBefore: user.balance - bonusAmount,
      balanceAfter: user.balance,
      description: "Bonus converted to real money",
      referenceId: `CONV-${Date.now()}`,
      createdAt: new Date()
    });

    // Log bonus activity
    user.bonusActivityLogs.push({
      action: "converted_to_real_money",
      amount: bonusAmount,
      timestamp: new Date(),
      details: {
        previousBonusBalance: bonusAmount,
        newRealBalance: newRealBalance
      }
    });

    await user.save();

    res.json({
      success: true,
      message: "Bonus successfully converted to real money",
      data: {
        convertedAmount: bonusAmount,
        newBalance: user.balance,
        newBonusBalance: user.bonusBalance
      }
    });

  } catch (error) {
    console.error("Error converting bonus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to convert bonus"
    });
  }
});

// GET bonus types available
user_route.get("/bonuses/types", ensureAuthenticated, async (req, res) => {
  try {
    // Get distinct bonus types from active bonuses
    const bonusTypes = await Bonus.distinct('bonusType', {
      status: 'active',
      endDate: { $gte: new Date() },
      startDate: { $lte: new Date() }
    });

    const typeDescriptions = {
      welcome: "Welcome bonuses for new players",
      deposit: "Bonus on your deposits",
      reload: "Bonus on subsequent deposits",
      cashback: "Get back a percentage of your losses",
      free_spin: "Free spins on slot games",
      special: "Special promotional bonuses",
      manual: "Manually assigned bonuses"
    };

    const formattedTypes = bonusTypes.map(type => ({
      type: type,
      name: type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      description: typeDescriptions[type] || "Bonus offer",
      icon: getBonusTypeIcon(type)
    }));

    res.json({
      success: true,
      data: formattedTypes
    });
  } catch (error) {
    console.error("Error fetching bonus types:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch bonus types"
    });
  }
});

// Helper function for bonus type icons
function getBonusTypeIcon(type) {
  switch(type) {
    case 'welcome': return '🎉';
    case 'deposit': return '💰';
    case 'reload': return '🔄';
    case 'cashback': return '💸';
    case 'free_spin': return '🎰';
    case 'special': return '⭐';
    case 'manual': return '✏️';
    default: return '🎁';
  }
}


// ==================== WEEKLY & MONTHLY BONUS ROUTES ====================

// Get user's weekly and monthly bonus status
user_route.get("/bonus-status/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Calculate current date and check day of week/month
        const now = new Date();
        const currentDay = now.getDay(); // 0 = Sunday, 2 = Tuesday
        const currentDate = now.getDate();
        
        // Check if today is Tuesday (for weekly bonus)
        const isTuesday = currentDay === 2;
        
        // Check if today is 4th day of month (for monthly bonus)
        const is4thDay = currentDate === 4;

        // Find unclaimed bonuses from user's bonusHistory
        const unclaimedBonuses = {
            weekly: user.bonusHistory?.filter(bonus => 
                bonus.type === 'weekly' && bonus.status === 'unclaimed'
            ) || [],
            monthly: user.bonusHistory?.filter(bonus => 
                bonus.type === 'monthly' && bonus.status === 'unclaimed'
            ) || []
        };

        // Find claimed bonuses from this week/month
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of week (Sunday)
        startOfWeek.setHours(0, 0, 0, 0);
        
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const weeklyClaimedThisWeek = user.bonusHistory?.filter(bonus => 
            bonus.type === 'weekly' && 
            bonus.status === 'claimed' &&
            bonus.claimedAt &&
            new Date(bonus.claimedAt) >= startOfWeek
        ) || [];

        const monthlyClaimedThisMonth = user.bonusHistory?.filter(bonus => 
            bonus.type === 'monthly' && 
            bonus.status === 'claimed' &&
            bonus.claimedAt &&
            new Date(bonus.claimedAt) >= startOfMonth
        ) || [];

        // Calculate totals
        const totalWeeklyClaimed = user.bonusHistory
            ?.filter(bonus => bonus.type === 'weekly' && bonus.status === 'claimed')
            .reduce((sum, bonus) => sum + (bonus.amount || 0), 0) || 0;
            
        const totalMonthlyClaimed = user.bonusHistory
            ?.filter(bonus => bonus.type === 'monthly' && bonus.status === 'claimed')
            .reduce((sum, bonus) => sum + (bonus.amount || 0), 0) || 0;

        const totalWeeklyUnclaimed = unclaimedBonuses.weekly.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);
        const totalMonthlyUnclaimed = unclaimedBonuses.monthly.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);

        // Get pending transactions
        const pendingTransactions = user.transactionHistory?.filter(
            transaction => transaction.type === 'bonus_pending'
        ) || [];

        // Calculate pending amounts by type
        const weeklyPendingAmount = pendingTransactions
            .filter(t => t.description?.includes('Weekly bonus pending'))
            .reduce((sum, t) => sum + (t.amount || 0), 0);
            
        const monthlyPendingAmount = pendingTransactions
            .filter(t => t.description?.includes('Monthly bonus pending'))
            .reduce((sum, t) => sum + (t.amount || 0), 0);

        // Get weekly and monthly bet amounts
        const weeklyBetAmount = user.weeklybetamount || 0;
        const monthlyBetAmount = user.monthlybetamount || 0;

        // Check eligibility
        const canClaimWeekly = unclaimedBonuses.weekly.length > 0 && isTuesday;
        const canClaimMonthly = unclaimedBonuses.monthly.length > 0 && is4thDay;

        // Check if user has claimed this week/month already
        const hasClaimedWeeklyThisWeek = weeklyClaimedThisWeek.length > 0;
        const hasClaimedMonthlyThisMonth = monthlyClaimedThisMonth.length > 0;

        // Bonus rates
        const WEEKLY_BONUS_RATE = 0.008; // 0.8%
        const MONTHLY_BONUS_RATE = 0.005; // 0.5%

        // Calculate potential future bonuses
        const potentialWeeklyBonus = parseFloat((weeklyBetAmount * WEEKLY_BONUS_RATE).toFixed(2));
        const potentialMonthlyBonus = parseFloat((monthlyBetAmount * MONTHLY_BONUS_RATE).toFixed(2));

        // Get bonus history records for more details
        const bonusHistoryRecords = await BonusHistory.find({ userId: userId })
            .sort({ creditedAt: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: {
                // User info
                userInfo: {
                    username: user.username,
                    email: user.email,
                    player_id: user.player_id,
                    currentBalance: user.balance,
                    weeklyBetAmount: weeklyBetAmount,
                    monthlyBetAmount: monthlyBetAmount
                },

                // Current date info
                currentDate: {
                    date: now.toISOString(),
                    dayOfWeek: currentDay,
                    dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDay],
                    isTuesday: isTuesday,
                    is4thDay: is4thDay,
                    dayOfMonth: currentDate
                },

                // Weekly bonus info
                weeklyBonus: {
                    totalUnclaimedAmount: totalWeeklyUnclaimed,
                    totalClaimedAmount: totalWeeklyClaimed,
                    totalPendingAmount: weeklyPendingAmount,
                    unclaimedBonuses: unclaimedBonuses.weekly,
                    claimedThisWeek: weeklyClaimedThisWeek,
                    canClaim: canClaimWeekly,
                    hasClaimedThisWeek: hasClaimedWeeklyThisWeek,
                    potentialNextBonus: potentialWeeklyBonus,
                    bonusRate: WEEKLY_BONUS_RATE,
                    bonusPercentage: "0.8%",
                    eligibleDays: ["Tuesday"],
                    lastClaimedDate: weeklyClaimedThisWeek[0]?.claimedAt || null
                },

                // Monthly bonus info
                monthlyBonus: {
                    totalUnclaimedAmount: totalMonthlyUnclaimed,
                    totalClaimedAmount: totalMonthlyClaimed,
                    totalPendingAmount: monthlyPendingAmount,
                    unclaimedBonuses: unclaimedBonuses.monthly,
                    claimedThisMonth: monthlyClaimedThisMonth,
                    canClaim: canClaimMonthly,
                    hasClaimedThisMonth: hasClaimedMonthlyThisMonth,
                    potentialNextBonus: potentialMonthlyBonus,
                    bonusRate: MONTHLY_BONUS_RATE,
                    bonusPercentage: "0.5%",
                    eligibleDays: [4],
                    lastClaimedDate: monthlyClaimedThisMonth[0]?.claimedAt || null
                },

                // Summary
                summary: {
                    totalUnclaimedAmount: totalWeeklyUnclaimed + totalMonthlyUnclaimed,
                    totalClaimedAmount: totalWeeklyClaimed + totalMonthlyClaimed,
                    totalAllTimeBonus: totalWeeklyClaimed + totalMonthlyClaimed + totalWeeklyUnclaimed + totalMonthlyUnclaimed,
                    unclaimedCount: unclaimedBonuses.weekly.length + unclaimedBonuses.monthly.length,
                    claimedCount: (user.bonusHistory?.filter(b => b.status === 'claimed').length || 0)
                },

                // Recent bonus history
                recentHistory: bonusHistoryRecords.map(record => ({
                    id: record._id,
                    bonusType: record.bonusType,
                    amount: record.bonusAmount,
                    betAmount: record.betAmount,
                    status: record.status,
                    creditedAt: record.creditedAt,
                    claimedAt: record.claimedAt,
                    notes: record.notes,
                    bonusRate: record.bonusRate,
                    bonusPercentage: record.bonusPercentage
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching bonus status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bonus status",
            error: error.message
        });
    }
});

// Claim weekly bonus
user_route.post("/claim-weekly-bonus/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if today is Tuesday
        const now = new Date();
        const isTuesday = now.getDay() === 2; // Tuesday = 2
        
        if (!isTuesday) {
            return res.status(400).json({
                success: false,
                message: "Weekly bonus can only be claimed on Tuesdays"
            });
        }

        // Find unclaimed weekly bonuses
        const unclaimedWeeklyBonuses = user.bonusHistory?.filter(bonus => 
            bonus.type === 'weekly' && bonus.status === 'unclaimed'
        ) || [];

        if (unclaimedWeeklyBonuses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No unclaimed weekly bonuses available"
            });
        }

        // Calculate total unclaimed amount
        const totalUnclaimedAmount = unclaimedWeeklyBonuses.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);

        // Check if user has already claimed this week
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyClaimedThisWeek = user.bonusHistory?.filter(bonus => 
            bonus.type === 'weekly' && 
            bonus.status === 'claimed' &&
            bonus.claimedAt &&
            new Date(bonus.claimedAt) >= startOfWeek
        ) || [];

        if (weeklyClaimedThisWeek.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You have already claimed a weekly bonus this week"
            });
        }

        // Add bonus to user's balance
        const balanceBefore = user.balance;
        user.balance += totalUnclaimedAmount;

        // Initialize transactionHistory if undefined
        if (!user.transactionHistory) {
            user.transactionHistory = [];
        }

        // Add transaction history for claimed bonus
        user.transactionHistory.push({
            type: 'bonus_claimed',
            amount: totalUnclaimedAmount,
            balanceBefore: balanceBefore,
            balanceAfter: user.balance,
            description: `Weekly bonus credited based on weekly bet amount (0.8%) - Weekly bonus distribution`,
            referenceId: `WEEKLY-BONUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date(),
            status: 'completed',
            details: {
                bonusType: 'weekly',
                totalUnclaimedAmount: totalUnclaimedAmount,
                unclaimedCount: unclaimedWeeklyBonuses.length,
                claimedAt: new Date()
            }
        });

        // Update bonus history to claimed
        if (!user.bonusHistory) {
            user.bonusHistory = [];
        }

        // Mark all unclaimed weekly bonuses as claimed
        unclaimedWeeklyBonuses.forEach(bonus => {
            const bonusIndex = user.bonusHistory.findIndex(b => 
                b._id.toString() === bonus._id.toString()
            );
            if (bonusIndex !== -1) {
                user.bonusHistory[bonusIndex].status = 'claimed';
                user.bonusHistory[bonusIndex].claimedAt = new Date();
            }
        });

        // Update BonusHistory records
        for (const bonus of unclaimedWeeklyBonuses) {
            await BonusHistory.findOneAndUpdate(
                {
                    userId: userId,
                    bonusType: 'weekly',
                    bonusAmount: bonus.amount,
                    status: 'unclaimed'
                },
                {
                    $set: {
                        status: 'claimed',
                        claimedAt: new Date(),
                        notes: `${bonus.notes || ''} - Claimed by user on ${new Date().toISOString()}`
                    }
                }
            );
        }

        // Remove pending transactions
        const pendingTransactionIndex = user.transactionHistory.findIndex(t => 
            t.type === 'bonus_pending' && 
            t.description?.includes('Weekly bonus pending')
        );

        if (pendingTransactionIndex !== -1) {
            user.transactionHistory.splice(pendingTransactionIndex, 1);
        }

        // Save user changes
        await user.save();

        res.status(200).json({
            success: true,
            message: `Weekly bonus claimed successfully! ${totalUnclaimedAmount.toFixed(2)} BDT has been added to your balance.`,
            data: {
                bonusAmount: totalUnclaimedAmount,
                unclaimedCount: unclaimedWeeklyBonuses.length,
                balanceBefore: balanceBefore,
                balanceAfter: user.balance,
                claimedAt: new Date(),
                transactionId: `WEEKLY-BONUS-${Date.now()}`
            }
        });

    } catch (error) {
        console.error("Error claiming weekly bonus:", error);
        res.status(500).json({
            success: false,
            message: "Failed to claim weekly bonus",
            error: error.message
        });
    }
});

// Claim monthly bonus
user_route.post("/claim-monthly-bonus/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if today is 4th day of month
        const now = new Date();
        const is4thDay = now.getDate() === 4;
        
        if (!is4thDay) {
            return res.status(400).json({
                success: false,
                message: "Monthly bonus can only be claimed on the 4th day of each month"
            });
        }

        // Find unclaimed monthly bonuses
        const unclaimedMonthlyBonuses = user.bonusHistory?.filter(bonus => 
            bonus.type === 'monthly' && bonus.status === 'unclaimed'
        ) || [];

        if (unclaimedMonthlyBonuses.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No unclaimed monthly bonuses available"
            });
        }

        // Calculate total unclaimed amount
        const totalUnclaimedAmount = unclaimedMonthlyBonuses.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);

        // Check if user has already claimed this month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const monthlyClaimedThisMonth = user.bonusHistory?.filter(bonus => 
            bonus.type === 'monthly' && 
            bonus.status === 'claimed' &&
            bonus.claimedAt &&
            new Date(bonus.claimedAt) >= startOfMonth
        ) || [];

        if (monthlyClaimedThisMonth.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You have already claimed a monthly bonus this month"
            });
        }

        // Add bonus to user's balance
        const balanceBefore = user.balance;
        user.balance += totalUnclaimedAmount;

        // Initialize transactionHistory if undefined
        if (!user.transactionHistory) {
            user.transactionHistory = [];
        }

        // Add transaction history for claimed bonus
        user.transactionHistory.push({
            type: 'bonus_claimed',
            amount: totalUnclaimedAmount,
            balanceBefore: balanceBefore,
            balanceAfter: user.balance,
            description: `Monthly bonus credited based on monthly bet amount (0.5%) - Monthly bonus distribution`,
            referenceId: `MONTHLY-BONUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date(),
            status: 'completed',
            details: {
                bonusType: 'monthly',
                totalUnclaimedAmount: totalUnclaimedAmount,
                unclaimedCount: unclaimedMonthlyBonuses.length,
                claimedAt: new Date(),
                month: now.getMonth() + 1,
                year: now.getFullYear()
            }
        });

        // Update bonus history to claimed
        if (!user.bonusHistory) {
            user.bonusHistory = [];
        }

        // Mark all unclaimed monthly bonuses as claimed
        unclaimedMonthlyBonuses.forEach(bonus => {
            const bonusIndex = user.bonusHistory.findIndex(b => 
                b._id.toString() === bonus._id.toString()
            );
            if (bonusIndex !== -1) {
                user.bonusHistory[bonusIndex].status = 'claimed';
                user.bonusHistory[bonusIndex].claimedAt = new Date();
            }
        });

        // Update BonusHistory records
        for (const bonus of unclaimedMonthlyBonuses) {
            await BonusHistory.findOneAndUpdate(
                {
                    userId: userId,
                    bonusType: 'monthly',
                    bonusAmount: bonus.amount,
                    status: 'unclaimed'
                },
                {
                    $set: {
                        status: 'claimed',
                        claimedAt: new Date(),
                        notes: `${bonus.notes || ''} - Claimed by user on ${new Date().toISOString()}`
                    }
                }
            );
        }

        // Remove pending transactions
        const pendingTransactionIndex = user.transactionHistory.findIndex(t => 
            t.type === 'bonus_pending' && 
            t.description?.includes('Monthly bonus pending')
        );

        if (pendingTransactionIndex !== -1) {
            user.transactionHistory.splice(pendingTransactionIndex, 1);
        }

        // Save user changes
        await user.save();

        res.status(200).json({
            success: true,
            message: `Monthly bonus claimed successfully! ${totalUnclaimedAmount.toFixed(2)} BDT has been added to your balance.`,
            data: {
                bonusAmount: totalUnclaimedAmount,
                unclaimedCount: unclaimedMonthlyBonuses.length,
                balanceBefore: balanceBefore,
                balanceAfter: user.balance,
                claimedAt: new Date(),
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                transactionId: `MONTHLY-BONUS-${Date.now()}`
            }
        });

    } catch (error) {
        console.error("Error claiming monthly bonus:", error);
        res.status(500).json({
            success: false,
            message: "Failed to claim monthly bonus",
            error: error.message
        });
    }
});

// Claim all bonuses (weekly and monthly)
user_route.post("/claim-all-bonuses/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const now = new Date();
        const isTuesday = now.getDay() === 2;
        const is4thDay = now.getDate() === 4;

        // Find all unclaimed bonuses
        const unclaimedBonuses = {
            weekly: user.bonusHistory?.filter(bonus => 
                bonus.type === 'weekly' && bonus.status === 'unclaimed'
            ) || [],
            monthly: user.bonusHistory?.filter(bonus => 
                bonus.type === 'monthly' && bonus.status === 'unclaimed'
            ) || []
        };

        // Check eligibility
        if (unclaimedBonuses.weekly.length > 0 && !isTuesday) {
            return res.status(400).json({
                success: false,
                message: "Weekly bonus can only be claimed on Tuesdays"
            });
        }

        if (unclaimedBonuses.monthly.length > 0 && !is4thDay) {
            return res.status(400).json({
                success: false,
                message: "Monthly bonus can only be claimed on the 4th day of each month"
            });
        }

        if (unclaimedBonuses.weekly.length === 0 && unclaimedBonuses.monthly.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No unclaimed bonuses available"
            });
        }

        // Calculate total amounts
        const weeklyAmount = unclaimedBonuses.weekly.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);
        const monthlyAmount = unclaimedBonuses.monthly.reduce((sum, bonus) => sum + (bonus.amount || 0), 0);
        const totalAmount = weeklyAmount + monthlyAmount;

        // Check if user has already claimed this week/month
        const startOfWeek = new Date(now);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);

        const weeklyClaimedThisWeek = user.bonusHistory?.filter(bonus => 
            bonus.type === 'weekly' && 
            bonus.status === 'claimed' &&
            bonus.claimedAt &&
            new Date(bonus.claimedAt) >= startOfWeek
        ) || [];

        const monthlyClaimedThisMonth = user.bonusHistory?.filter(bonus => 
            bonus.type === 'monthly' && 
            bonus.status === 'claimed' &&
            bonus.claimedAt &&
            new Date(bonus.claimedAt) >= startOfMonth
        ) || [];

        if (weeklyClaimedThisWeek.length > 0 && unclaimedBonuses.weekly.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You have already claimed a weekly bonus this week"
            });
        }

        if (monthlyClaimedThisMonth.length > 0 && unclaimedBonuses.monthly.length > 0) {
            return res.status(400).json({
                success: false,
                message: "You have already claimed a monthly bonus this month"
            });
        }

        // Add bonus to user's balance
        const balanceBefore = user.balance;
        user.balance += totalAmount;

        // Initialize transactionHistory if undefined
        if (!user.transactionHistory) {
            user.transactionHistory = [];
        }

        // Add transaction history for claimed bonuses
        const transactionIds = [];
        
        if (weeklyAmount > 0) {
            user.transactionHistory.push({
                type: 'bonus_claimed',
                amount: weeklyAmount,
                balanceBefore: balanceBefore,
                balanceAfter: user.balance - monthlyAmount,
                description: `Weekly bonus credited based on weekly bet amount (0.8%) - Weekly bonus distribution`,
                referenceId: `WEEKLY-BONUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                createdAt: new Date(),
                status: 'completed',
                details: {
                    bonusType: 'weekly',
                    unclaimedCount: unclaimedBonuses.weekly.length,
                    claimedAt: new Date()
                }
            });
            transactionIds.push(`WEEKLY-BONUS-${Date.now()}`);
        }

        if (monthlyAmount > 0) {
            user.transactionHistory.push({
                type: 'bonus_claimed',
                amount: monthlyAmount,
                balanceBefore: user.balance - monthlyAmount,
                balanceAfter: user.balance,
                description: `Monthly bonus credited based on monthly bet amount (0.5%) - Monthly bonus distribution`,
                referenceId: `MONTHLY-BONUS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                createdAt: new Date(),
                status: 'completed',
                details: {
                    bonusType: 'monthly',
                    unclaimedCount: unclaimedBonuses.monthly.length,
                    claimedAt: new Date(),
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                }
            });
            transactionIds.push(`MONTHLY-BONUS-${Date.now()}`);
        }

        // Update bonus history to claimed
        if (!user.bonusHistory) {
            user.bonusHistory = [];
        }

        // Mark all unclaimed bonuses as claimed
        [...unclaimedBonuses.weekly, ...unclaimedBonuses.monthly].forEach(bonus => {
            const bonusIndex = user.bonusHistory.findIndex(b => 
                b._id.toString() === bonus._id.toString()
            );
            if (bonusIndex !== -1) {
                user.bonusHistory[bonusIndex].status = 'claimed';
                user.bonusHistory[bonusIndex].claimedAt = new Date();
            }
        });

        // Update BonusHistory records
        for (const bonus of unclaimedBonuses.weekly) {
            await BonusHistory.findOneAndUpdate(
                {
                    userId: userId,
                    bonusType: 'weekly',
                    bonusAmount: bonus.amount,
                    status: 'unclaimed'
                },
                {
                    $set: {
                        status: 'claimed',
                        claimedAt: new Date(),
                        notes: `${bonus.notes || ''} - Claimed by user on ${new Date().toISOString()}`
                    }
                }
            );
        }

        for (const bonus of unclaimedBonuses.monthly) {
            await BonusHistory.findOneAndUpdate(
                {
                    userId: userId,
                    bonusType: 'monthly',
                    bonusAmount: bonus.amount,
                    status: 'unclaimed'
                },
                {
                    $set: {
                        status: 'claimed',
                        claimedAt: new Date(),
                        notes: `${bonus.notes || ''} - Claimed by user on ${new Date().toISOString()}`
                    }
                }
            );
        }

        // Remove pending transactions
        user.transactionHistory = user.transactionHistory.filter(t => 
            !(t.type === 'bonus_pending' && (
                t.description?.includes('Weekly bonus pending') || 
                t.description?.includes('Monthly bonus pending')
            ))
        );

        // Save user changes
        await user.save();

        const messages = [];
        if (weeklyAmount > 0) messages.push(`Weekly bonus: ${weeklyAmount.toFixed(2)} BDT`);
        if (monthlyAmount > 0) messages.push(`Monthly bonus: ${monthlyAmount.toFixed(2)} BDT`);

        res.status(200).json({
            success: true,
            message: `Bonuses claimed successfully! ${messages.join(' and ')} has been added to your balance.`,
            data: {
                weeklyBonus: {
                    amount: weeklyAmount,
                    count: unclaimedBonuses.weekly.length,
                    claimed: weeklyAmount > 0
                },
                monthlyBonus: {
                    amount: monthlyAmount,
                    count: unclaimedBonuses.monthly.length,
                    claimed: monthlyAmount > 0
                },
                totalAmount: totalAmount,
                balanceBefore: balanceBefore,
                balanceAfter: user.balance,
                claimedAt: new Date(),
                transactionIds: transactionIds
            }
        });

    } catch (error) {
        console.error("Error claiming all bonuses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to claim bonuses",
            error: error.message
        });
    }
});

// Get user's bonus history with pagination
user_route.get("/bonus-history/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            page = 1, 
            limit = 20,
            bonusType,
            status,
            startDate,
            endDate 
        } = req.query;

        // Build query
        const query = { userId: userId };

        if (bonusType && bonusType !== 'all') {
            query.bonusType = bonusType;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        // Date range filter
        if (startDate || endDate) {
            query.creditedAt = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                query.creditedAt.$gte = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.creditedAt.$lte = end;
            }
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get bonus history with pagination
        const history = await BonusHistory.find(query)
            .sort({ creditedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await BonusHistory.countDocuments(query);

        // Calculate summary
        const summary = await BonusHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$bonusType',
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    totalBetAmount: { $sum: '$betAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate status summary
        const statusSummary = await BonusHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate total unclaimed amount
        const unclaimedSummary = await BonusHistory.aggregate([
            { 
                $match: { 
                    userId: mongoose.Types.ObjectId(userId),
                    status: 'unclaimed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalUnclaimedAmount: { $sum: '$bonusAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Find user for additional info
        const user = await UserModel.findById(userId)
            .select('username email player_id balance weeklybetamount monthlybetamount');

        res.status(200).json({
            success: true,
            data: history,
            summary: {
                byType: summary,
                byStatus: statusSummary,
                unclaimed: unclaimedSummary[0] || { totalUnclaimedAmount: 0, count: 0 },
                totalRecords: total
            },
            userInfo: user,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching bonus history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bonus history",
            error: error.message
        });
    }
});

// Get user's bonus statistics
user_route.get("/bonus-stats/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            startDate = new Date(new Date().setDate(new Date().getDate() - 30)),
            endDate = new Date()
        } = req.query;

        // Parse dates
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Overall statistics
        const overallStats = await BonusHistory.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    creditedAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: null,
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    totalBetAmount: { $sum: '$betAmount' },
                    totalTransactions: { $sum: 1 },
                    averageBonus: { $avg: '$bonusAmount' },
                    averageBet: { $avg: '$betAmount' }
                }
            }
        ]);

        // Statistics by bonus type
        const statsByType = await BonusHistory.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    creditedAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$bonusType',
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    totalBetAmount: { $sum: '$betAmount' },
                    count: { $sum: 1 },
                    averageBonus: { $avg: '$bonusAmount' },
                    averageBet: { $avg: '$betAmount' }
                }
            }
        ]);

        // Statistics by status
        const statsByStatus = await BonusHistory.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    creditedAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$status',
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    count: { $sum: 1 },
                    averageBonus: { $avg: '$bonusAmount' }
                }
            }
        ]);

        // Daily statistics for chart
        const dailyStats = await BonusHistory.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    creditedAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$creditedAt" } },
                        bonusType: "$bonusType",
                        status: "$status"
                    },
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        // Monthly summary
        const monthlySummary = await BonusHistory.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId),
                    creditedAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$creditedAt" },
                        month: { $month: "$creditedAt" }
                    },
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 }
            }
        ]);

        // Get user info
        const user = await UserModel.findById(userId)
            .select('username email player_id balance weeklybetamount monthlybetamount createdAt');

        res.status(200).json({
            success: true,
            data: {
                userInfo: user,
                dateRange: {
                    start: start,
                    end: end,
                    days: Math.ceil((end - start) / (1000 * 60 * 60 * 24))
                },
                overall: overallStats[0] || {
                    totalBonusAmount: 0,
                    totalBetAmount: 0,
                    totalTransactions: 0,
                    averageBonus: 0,
                    averageBet: 0
                },
                byType: statsByType,
                byStatus: statsByStatus,
                dailyStats: dailyStats,
                monthlySummary: monthlySummary,
                // Current pending/eligible amounts
                currentEligibility: {
                    weeklyBetAmount: user.weeklybetamount || 0,
                    monthlyBetAmount: user.monthlybetamount || 0,
                    potentialWeeklyBonus: parseFloat(((user.weeklybetamount || 0) * 0.008).toFixed(2)),
                    potentialMonthlyBonus: parseFloat(((user.monthlybetamount || 0) * 0.005).toFixed(2)),
                    daysSinceRegistration: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
                }
            }
        });

    } catch (error) {
        console.error("Error fetching bonus statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bonus statistics",
            error: error.message
        });
    }
});
// ==================== SIMPLE BONUS ROUTES ====================

// 1. GET route to fetch monthly & weekly bonuses
user_route.get("/bonus/monthly-weekly/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Get only monthly and weekly bonuses from bonusHistory
        const monthlyWeeklyBonuses = (user.bonusHistory || []).filter(bonus => 
            bonus.type === 'weekly' || bonus.type === 'monthly'
        );

        res.status(200).json({
            success: true,
            message: "Monthly and weekly bonuses fetched successfully",
            data: monthlyWeeklyBonuses
        });

    } catch (error) {
        console.error("Error fetching monthly/weekly bonuses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bonuses"
        });
    }
});

// 2. POST route to claim a bonus
user_route.post("/bonus/claim/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { bonusId } = req.body;

        if (!bonusId) {
            return res.status(400).json({
                success: false,
                message: "Bonus ID is required"
            });
        }

        // Find user
        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find the bonus in user's bonusHistory
        const bonusIndex = user.bonusHistory.findIndex(b => 
            b._id.toString() === bonusId
        );

        if (bonusIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Bonus not found"
            });
        }

        const bonus = user.bonusHistory[bonusIndex];

        // Check if already claimed
        if (bonus.status === 'claimed') {
            return res.status(400).json({
                success: false,
                message: "Bonus already claimed"
            });
        }

        // Check if bonus is weekly/monthly
        if (bonus.type !== 'weekly' && bonus.type !== 'monthly') {
            return res.status(400).json({
                success: false,
                message: "Can only claim weekly or monthly bonuses"
            });
        }

        // Check day requirements
        const now = new Date();
        if (bonus.type === 'weekly' && now.getDay() !== 2) {
            return res.status(400).json({
                success: false,
                message: "Weekly bonuses can only be claimed on Tuesday"
            });
        }

        if (bonus.type === 'monthly' && now.getDate() !== 4) {
            return res.status(400).json({
                success: false,
                message: "Monthly bonuses can only be claimed on 4th day of month"
            });
        }

        // Claim the bonus
        const bonusAmount = bonus.amount || 0;
        user.balance += bonusAmount;
        user.bonusHistory[bonusIndex].status = 'claimed';
        user.bonusHistory[bonusIndex].claimedAt = new Date();

        // Add transaction
        user.transactionHistory.push({
            type: 'bonus_claimed',
            amount: bonusAmount,
            balanceBefore: user.balance - bonusAmount,
            balanceAfter: user.balance,
            description: `${bonus.type} bonus claimed`,
            referenceId: `BONUS-${Date.now()}`,
            createdAt: new Date()
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "Bonus claimed successfully",
            data: {
                bonusId: bonusId,
                amount: bonusAmount,
                type: bonus.type,
                newBalance: user.balance
            }
        });

    } catch (error) {
        console.error("Error claiming bonus:", error);
        res.status(500).json({
            success: false,
            message: "Failed to claim bonus"
        });
    }
});


// ==================== SIMPLE KYC SYSTEM WITH DIDIT ====================
const DIDIT_CONFIG = {
  BASE_URL: 'https://verification.didit.me', // Fixed: Use verification.didit.me
  API_KEY: '3jtBI6BT3Z2ZW8CEIF-Ck4Ma9qjfHw4IfI8eN6X2zdY',
  WORKFLOW_ID: "ada49549-51da-4909-a20e-b71e6dc5623f",
  CALLBACK_URL: 'https://genzz.casino/user/didit-callback'
};
user_route.post("/kyc/start-verification", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before starting KYC verification"
      });
    }

    // Check if user can resubmit KYC
    const canResubmit = user.canResubmitKYC();
    if (!canResubmit.canResubmit) {
      return res.status(400).json({
        success: false,
        message: canResubmit.reason,
        ...canResubmit
      });
    }

    const sessionPayload = {
      workflow_id: DIDIT_CONFIG.WORKFLOW_ID,
      vendor_data: user.player_id.toString(),
      callback: DIDIT_CONFIG.CALLBACK_URL, 
      metadata: JSON.stringify({
        user_id: user.player_id.toString(),
        email: user.email,
        username: user.username,
        user_type: "premium",
        account_id: user.player_id.toString()
      })
    };

    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'x-api-key': DIDIT_CONFIG.API_KEY
    };

    console.log("Calling Didit API with:", {
      url: `${DIDIT_CONFIG.BASE_URL}/v3/session/`,
      headers,
      payload: sessionPayload
    });

    const diditResponse = await axios.post(
      `${DIDIT_CONFIG.BASE_URL}/v3/session/`,
      sessionPayload,
      { headers }
    );

    const sessionData = diditResponse.data;
    console.log("Didit API Response:", sessionData);
    
    // Use the new method to add verification
    const verification = user.addKYCVerification(sessionData);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "KYC verification session created successfully",
      data: {
        session_id: verification.sessionId,
        session_token: verification.sessionToken,
        verification_url: verification.verificationUrl
      }
    });
    
  } catch (error) {
    console.error("Start KYC error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    const errorData = error.response?.data;
    const isHtmlError = typeof errorData === 'string' && errorData.includes('<!DOCTYPE html>');
    
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      success: false, 
      message: "Failed to start KYC verification",
      error: isHtmlError ? "Invalid API endpoint (404)" : (error.response?.data || error.message)
    });
  }
});

// ==================== RESUBMIT KYC VERIFICATION ====================
user_route.post("/kyc/resubmit", async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email before resubmitting KYC verification"
      });
    }

    // Check if user can resubmit KYC
    const canResubmit = user.canResubmitKYC();
    if (!canResubmit.canResubmit) {
      return res.status(400).json({
        success: false,
        message: canResubmit.reason,
        ...canResubmit
      });
    }

    // Get the latest verification to check its status
    const latestVerification = user.kycVerifications?.[user.kycVerifications.length - 1];
    
    // Only allow resubmission if previous verification was rejected/declined
    if (latestVerification && latestVerification.status !== 'Declined' && latestVerification.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: "You can only resubmit KYC if your previous verification was rejected"
      });
    }

    const sessionPayload = {
      workflow_id: DIDIT_CONFIG.WORKFLOW_ID,
      vendor_data: user.player_id.toString(),
      callback: DIDIT_CONFIG.CALLBACK_URL,
      metadata: JSON.stringify({
        user_id: user.player_id.toString(),
        email: user.email,
        username: user.username,
        user_type: "premium",
        account_id: user.player_id.toString(),
        resubmission: true,
        previous_session_id: latestVerification?.sessionId,
        resubmission_count: (user.kycResubmissionCount || 0) + 1
      })
    };

    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
      'x-api-key': DIDIT_CONFIG.API_KEY
    };

    console.log("Calling Didit API for resubmission with:", {
      url: `${DIDIT_CONFIG.BASE_URL}/v3/session/`,
      headers,
      payload: sessionPayload
    });

    const diditResponse = await axios.post(
      `${DIDIT_CONFIG.BASE_URL}/v3/session/`,
      sessionPayload,
      { headers }
    );

    const sessionData = diditResponse.data;
    console.log("Didit API Response for resubmission:", sessionData);
    
    // Add the new verification using the same method
    const verification = user.addKYCVerification(sessionData);
    
    // Increment resubmission count WITHOUT changing any status
    user.kycResubmissionCount = (user.kycResubmissionCount || 0) + 1;
    
    // DO NOT change kycStatus here - keep it as is (rejected/declined) until the new verification is processed
    // The callback/webhook will handle status updates when the new verification is completed
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: "KYC verification resubmitted successfully",
      data: {
        session_id: verification.sessionId,
        session_token: verification.sessionToken,
        verification_url: verification.verificationUrl,
        resubmission_count: user.kycResubmissionCount
      }
    });
    
  } catch (error) {
    console.error("Resubmit KYC error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    const errorData = error.response?.data;
    const isHtmlError = typeof errorData === 'string' && errorData.includes('<!DOCTYPE html>');
    
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ 
      success: false, 
      message: "Failed to resubmit KYC verification",
      error: isHtmlError ? "Invalid API endpoint (404)" : (error.response?.data || error.message)
    });
  }
});
// 2. CHECK KYC STATUS
user_route.get("/kyc/status/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await UserModel.findById(userId);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Get latest verification
    const latestVerification = user.kycVerifications?.[user.kycVerifications.length - 1];
    let diditStatus = null;

    // If there's an active session, check Didit status
    if (latestVerification?.sessionId) {
      try {
        const diditResponse = await axios.get(
          `${DIDIT_CONFIG.BASE_URL}/sessions/${latestVerification.sessionId}`,
          {
            headers: {
              'Authorization': `Bearer ${DIDIT_CONFIG.API_KEY}`
            }
          }
        );
        diditStatus = diditResponse.data.data;
        
        // Update status if changed
        if (diditStatus.status !== latestVerification.status) {
          latestVerification.status = diditStatus.status;
          latestVerification.lastChecked = new Date();
          
          if (diditStatus.status === 'verified') {
            user.kycStatus = 'verified';
            user.kycInfo.verifiedAt = new Date();
          } else if (diditStatus.status === 'failed') {
            user.kycStatus = 'rejected';
            user.kycInfo.rejectionReason = diditStatus.rejectionReason || 'Verification failed';
          }
          
          await user.save();
        }
      } catch (error) {
        console.error("Error checking Didit status:", error.message);
      }
    }

    res.json({
      success: true,
      data: {
        kycStatus: user.kycStatus,
        emailVerified: user.isEmailVerified,
        latestVerification: latestVerification,
        diditStatus: diditStatus,
        kycInfo: user.kycInfo,
        canStartKYC: user.isEmailVerified && user.kycStatus === 'unverified'
      }
    });

  } catch (error) {
    console.error("KYC status error:", error);
    res.status(500).json({ success: false, message: "Failed to get KYC status" });
  }
});

user_route.post("/didit-callback", async (req, res) => {
  try {
    console.log('=== DIDIT WEBHOOK CALLBACK RECEIVED ===',req.body);
    console.log('Webhook type:', req.body.webhook_type);
    console.log('Session ID:', req.body.session_id);
    const { 
      session_id,
      status,
      decision,
      vendor_data
    } = req.body;

    if (!session_id) {
      console.log('❌ Missing session_id in webhook');
      return res.status(400).json({ 
        success: false, 
        message: "Missing session_id" 
      });
    }

    // Find user by vendor_data (user ID)
    let user;
    if (vendor_data) {
      console.log(`Searching user by vendor_data: ${vendor_data}`);
      user = await UserModel.findOne({player_id:vendor_data});
    }

    // If not found by vendor_data, search by session_id
    if (!user) {
      console.log(`Searching user by session_id: ${session_id}`);
      user = await UserModel.findOne({
        'kycVerifications.sessionId': session_id
      });
    }

    if (!user) {
      console.log(`❌ User not found for session: ${session_id}`);
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    console.log(`✅ User found: ${user._id} (${user.username || user.email})`);
    
    // Update the verification using the new method
    user.updateKYCVerification(session_id, req.body);
    user.kycStatus = status === 'Approved' ? 'verified' : (status === 'Declined' ? 'rejected' : user.kycStatus);
    
    // Set kycCompleted to true if status is Approved
    if (status === 'Approved') {
      user.kycCompleted = true;
    }
    await user.save();
    console.log(`✅ KYC status updated to: ${user.kycStatus}`);
    console.log(`✅ KYC completed: ${user.kycCompleted}`);
    
    res.status(200).json({ 
      success: true, 
      message: "Webhook processed successfully",
      kycStatus: user.kycStatus,
      kycCompleted: user.kycCompleted
    });

    console.log('=== DIDIT WEBHOOK PROCESSING COMPLETED ===');

  } catch (error) {
    console.error("❌ Didit callback error:", error);
    console.error('Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: "Callback processing failed",
      error: error.message
    });
  }
});

// ==================== DIDIT KYC SESSION ROUTES ====================

// Get KYC session status from Didit
user_route.get("/kyc/session-status/:sessionId", ensureAuthenticated, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userId } = req.query; // Optional: to update local DB

        // Validate sessionId
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required"
            });
        }

        console.log(`Fetching Didit session status for: ${sessionId}`);

        // Call Didit API to get session status
        const diditResponse = await axios.get(
            `${DIDIT_CONFIG.BASE_URL}/v3/session/${sessionId}/decision`,
            {
                headers: {
                    'x-api-key': DIDIT_CONFIG.API_KEY,
                    'accept': 'application/json'
                }
            }
        );

        const sessionData = diditResponse.data;
        console.log("Didit session response:", sessionData);

        // If userId is provided, update local user record
        if (userId) {
            const user = await UserModel.findById(userId);
            if (user) {
                // Update KYC verification in user record
                const verificationIndex = user.kycVerifications?.findIndex(
                    v => v.sessionId === sessionId
                );

                if (verificationIndex !== -1) {
                    // Update existing verification
                    user.kycVerifications[verificationIndex].status = sessionData.status;
                    user.kycVerifications[verificationIndex].lastChecked = new Date();
                    user.kycVerifications[verificationIndex].fullResponse = sessionData;
                } else {
                    // Add new verification record
                    if (!user.kycVerifications) user.kycVerifications = [];
                    user.kycVerifications.push({
                        sessionId: sessionId,
                        status: sessionData.status,
                        sessionNumber: sessionData.session_number,
                        sessionUrl: sessionData.session_url,
                        workflowId: sessionData.workflow_id,
                        vendorData: sessionData.vendor_data,
                        features: sessionData.features,
                        metadata: sessionData.metadata,
                        lastChecked: new Date(),
                        fullResponse: sessionData
                    });
                }

                // Update overall KYC status based on session status
                if (sessionData.status === 'Approved') {
                    user.kycStatus = 'verified';
                    user.kycInfo = user.kycInfo || {};
                    user.kycInfo.verifiedAt = new Date();
                } else if (sessionData.status === 'Declined') {
                    user.kycStatus = 'rejected';
                    user.kycInfo = user.kycInfo || {};
                    user.kycInfo.rejectionReason = 'Verification declined by system';
                } else if (sessionData.status === 'In Review') {
                    user.kycStatus = 'pending';
                }

                await user.save();
                console.log(`User KYC status updated to: ${user.kycStatus}`);
            }
        }

        res.status(200).json({
            success: true,
            message: "Session status retrieved successfully",
            data: sessionData
        });

    } catch (error) {
        console.error("Error fetching Didit session status:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        const statusCode = error.response?.status || 500;
        res.status(statusCode).json({
            success: false,
            message: "Failed to fetch session status",
            error: error.response?.data || error.message
        });
    }
});

// Update KYC session status (Approve/Decline/Resubmit)
user_route.patch("/kyc/update-session-status/:sessionId", ensureAuthenticated, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { 
            new_status, 
            comment, 
            send_email = false, 
            email_address, 
            email_language = 'en',
            userId // Optional: to update local DB
        } = req.body;

        // Validate required fields
        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required"
            });
        }

        if (!new_status) {
            return res.status(400).json({
                success: false,
                message: "new_status is required (Approved, Declined, or Resubmitted)"
            });
        }

        // Validate new_status value
        const validStatuses = ['Approved', 'Declined', 'Resubmitted'];
        if (!validStatuses.includes(new_status)) {
            return res.status(400).json({
                success: false,
                message: "new_status must be one of: Approved, Declined, Resubmitted"
            });
        }

        // Validate email if send_email is true
        if (send_email && !email_address) {
            return res.status(400).json({
                success: false,
                message: "email_address is required when send_email is true"
            });
        }

        console.log(`Updating Didit session ${sessionId} to status: ${new_status}`);

        // Prepare request body for Didit API
        const updatePayload = {
            new_status: new_status
        };

        // Add optional fields if provided
        if (comment) updatePayload.comment = comment;
        if (send_email) updatePayload.send_email = send_email;
        if (email_address) updatePayload.email_address = email_address;
        if (email_language) updatePayload.email_language = email_language;

        // Call Didit API to update session status
        const diditResponse = await axios.patch(
            `${DIDIT_CONFIG.BASE_URL}/v3/session/${sessionId}/u`,
            updatePayload,
            {
                headers: {
                    'x-api-key': DIDIT_CONFIG.API_KEY,
                    'Content-Type': 'application/json',
                    'accept': 'application/json'
                }
            }
        );

        console.log("Didit update response:", diditResponse.data);

        // If userId is provided, update local user record
        if (userId) {
            const user = await UserModel.findById(userId);
            if (user) {
                // Update KYC verification in user record
                const verificationIndex = user.kycVerifications?.findIndex(
                    v => v.sessionId === sessionId
                );

                if (verificationIndex !== -1) {
                    // Update existing verification
                    user.kycVerifications[verificationIndex].status = new_status;
                    user.kycVerifications[verificationIndex].lastChecked = new Date();
                    user.kycVerifications[verificationIndex].adminAction = {
                        status: new_status,
                        comment: comment,
                        actionBy: req.user?._id || 'admin',
                        actionAt: new Date()
                    };
                }

                // Update overall KYC status based on new status
                if (new_status === 'Approved') {
                    user.kycStatus = 'verified';
                    user.kycInfo = user.kycInfo || {};
                    user.kycInfo.verifiedAt = new Date();
                    user.kycInfo.verifiedBy = req.user?._id || 'admin';
                } else if (new_status === 'Declined') {
                    user.kycStatus = 'rejected';
                    user.kycInfo = user.kycInfo || {};
                    user.kycInfo.rejectionReason = comment || 'Verification declined by admin';
                    user.kycInfo.rejectedAt = new Date();
                    user.kycInfo.rejectedBy = req.user?._id || 'admin';
                    
                    // Increment rejection count for resubmission limit
                    user.kycRejectedCount = (user.kycRejectedCount || 0) + 1;
                } else if (new_status === 'Resubmitted') {
                    user.kycStatus = 'pending';
                    user.kycInfo = user.kycInfo || {};
                    user.kycInfo.resubmissionRequestedAt = new Date();
                    user.kycInfo.resubmissionReason = comment || 'Resubmission requested';
                    
                    // Increment resubmission count
                    user.kycResubmissionCount = (user.kycResubmissionCount || 0) + 1;
                }

                // Add note about admin action
                if (!user.notes) user.notes = [];
                user.notes.push({
                    note: `KYC ${new_status} by admin. ${comment ? `Reason: ${comment}` : ''}`,
                    createdAt: new Date(),
                    createdBy: req.user?.email || 'admin'
                });

                await user.save();
                console.log(`User KYC status updated to: ${user.kycStatus}`);
            }
        }

        res.status(200).json({
            success: true,
            message: `Session status updated to ${new_status} successfully`,
            data: diditResponse.data
        });

    } catch (error) {
        console.error("Error updating Didit session status:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        const statusCode = error.response?.status || 500;
        res.status(statusCode).json({
            success: false,
            message: "Failed to update session status",
            error: error.response?.data || error.message
        });
    }
});

// Get complete KYC session details with decision data
user_route.get("/kyc/session-details/:sessionId", ensureAuthenticated, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { userId } = req.query;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "Session ID is required"
            });
        }

        console.log(`Fetching complete Didit session details for: ${sessionId}`);

        // Call Didit API to get full session details including decision data
        const diditResponse = await axios.get(
            `${DIDIT_CONFIG.BASE_URL}/v3/session/${sessionId}/decision`,
            {
                headers: {
                    'x-api-key': DIDIT_CONFIG.API_KEY,
                    'accept': 'application/json'
                }
            }
        );

        const sessionData = diditResponse.data;
        console.log("Didit session details received");

        // If userId is provided, store the complete response
        if (userId) {
            const user = await UserModel.findById(userId);
            if (user) {
                // Store the complete verification data
                const verificationIndex = user.kycVerifications?.findIndex(
                    v => v.sessionId === sessionId
                );

                const verificationData = {
                    sessionId: sessionId,
                    sessionNumber: sessionData.session_number,
                    sessionUrl: sessionData.session_url,
                    status: sessionData.status,
                    workflowId: sessionData.workflow_id,
                    features: sessionData.features,
                    vendorData: sessionData.vendor_data,
                    metadata: sessionData.metadata,
                    lastChecked: new Date(),
                    fullResponse: sessionData,
                    // Extract specific verification results if available
                    idVerifications: sessionData.id_verifications,
                    nfcVerifications: sessionData.nfc_verifications,
                    livenessChecks: sessionData.liveness_checks,
                    faceMatches: sessionData.face_matches,
                    phoneVerifications: sessionData.phone_verifications,
                    emailVerifications: sessionData.email_verifications,
                    poaVerifications: sessionData.poa_verifications,
                    amlScreenings: sessionData.aml_screenings,
                    ipAnalyses: sessionData.ip_analyses,
                    databaseValidations: sessionData.database_validations,
                    reviews: sessionData.reviews,
                    createdAt: sessionData.created_at
                };

                if (verificationIndex !== -1) {
                    user.kycVerifications[verificationIndex] = {
                        ...user.kycVerifications[verificationIndex].toObject(),
                        ...verificationData
                    };
                } else {
                    if (!user.kycVerifications) user.kycVerifications = [];
                    user.kycVerifications.push(verificationData);
                }

                // Extract and store user details from verification if available
                if (sessionData.expected_details) {
                    user.kycInfo = user.kycInfo || {};
                    user.kycInfo.firstName = sessionData.expected_details.first_name;
                    user.kycInfo.lastName = sessionData.expected_details.last_name;
                }

                if (sessionData.contact_details) {
                    user.kycInfo = user.kycInfo || {};
                    user.kycInfo.email = sessionData.contact_details.email;
                }

                // If ID verification was successful, extract data
                if (sessionData.id_verifications && sessionData.id_verifications.length > 0) {
                    const idVerification = sessionData.id_verifications[0];
                    if (idVerification.status === 'Approved') {
                        user.kycInfo = user.kycInfo || {};
                        user.kycInfo.documentType = idVerification.document_type;
                        user.kycInfo.documentNumber = idVerification.document_number;
                        user.kycInfo.dateOfBirth = idVerification.date_of_birth;
                        user.kycInfo.fullName = idVerification.full_name;
                        user.kycInfo.address = idVerification.address;
                        user.kycInfo.formattedAddress = idVerification.formatted_address;
                        
                        // Also store in user profile if not already set
                        if (!user.fullName) user.fullName = idVerification.full_name;
                        if (!user.address) user.address = idVerification.address;
                    }
                }

                await user.save();
                console.log(`User KYC details updated from session data`);
            }
        }

        // Format response with extracted key information
        const formattedResponse = {
            sessionInfo: {
                sessionId: sessionData.session_id,
                sessionNumber: sessionData.session_number,
                sessionUrl: sessionData.session_url,
                status: sessionData.status,
                workflowId: sessionData.workflow_id,
                features: sessionData.features,
                vendorData: sessionData.vendor_data,
                metadata: sessionData.metadata,
                createdAt: sessionData.created_at
            },
            userDetails: {
                expected: sessionData.expected_details,
                contact: sessionData.contact_details
            },
            verificationResults: {
                idVerification: sessionData.id_verifications?.map(v => ({
                    status: v.status,
                    documentType: v.document_type,
                    documentNumber: v.document_number,
                    fullName: v.full_name,
                    dateOfBirth: v.date_of_birth,
                    expirationDate: v.expiration_date,
                    issuingState: v.issuing_state,
                    address: v.address,
                    warnings: v.warnings
                })),
                nfcVerification: sessionData.nfc_verifications?.map(v => ({
                    status: v.status,
                    chipData: v.chip_data,
                    authenticity: v.authenticity,
                    warnings: v.warnings
                })),
                livenessChecks: sessionData.liveness_checks?.map(v => ({
                    status: v.status,
                    method: v.method,
                    score: v.score,
                    ageEstimation: v.age_estimation,
                    warnings: v.warnings
                })),
                faceMatches: sessionData.face_matches?.map(v => ({
                    status: v.status,
                    score: v.score,
                    warnings: v.warnings
                })),
                phoneVerifications: sessionData.phone_verifications?.map(v => ({
                    status: v.status,
                    phoneNumber: v.full_number,
                    carrier: v.carrier,
                    isDisposable: v.is_disposable
                })),
                emailVerifications: sessionData.email_verifications?.map(v => ({
                    status: v.status,
                    email: v.email,
                    isBreached: v.is_breached,
                    isDisposable: v.is_disposable
                })),
                poaVerifications: sessionData.poa_verifications?.map(v => ({
                    status: v.status,
                    documentType: v.document_type,
                    address: v.poa_address,
                    issuer: v.issuer
                })),
                amlScreenings: sessionData.aml_screenings?.map(v => ({
                    status: v.status,
                    totalHits: v.total_hits,
                    hits: v.hits?.map(hit => ({
                        id: hit.id,
                        caption: hit.caption,
                        match: hit.match,
                        score: hit.score,
                        datasets: hit.datasets,
                        riskView: hit.risk_view,
                        matchScore: hit.match_score
                    }))
                })),
                ipAnalyses: sessionData.ip_analyses?.map(v => ({
                    status: v.status,
                    ipAddress: v.ip_address,
                    ipCountry: v.ip_country,
                    ipCity: v.ip_city,
                    isVPN: v.is_vpn_or_tor,
                    deviceInfo: {
                        brand: v.device_brand,
                        model: v.device_model,
                        os: v.os_family,
                        browser: v.browser_family
                    }
                })),
                databaseValidations: sessionData.database_validations
            },
            reviews: sessionData.reviews,
            callback: sessionData.callback
        };

        res.status(200).json({
            success: true,
            message: "Session details retrieved successfully",
            data: formattedResponse,
            rawData: sessionData // Include raw data for debugging if needed
        });

    } catch (error) {
        console.error("Error fetching Didit session details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        const statusCode = error.response?.status || 500;
        res.status(statusCode).json({
            success: false,
            message: "Failed to fetch session details",
            error: error.response?.data || error.message
        });
    }
});

// Batch update multiple KYC sessions (admin only)
user_route.post("/kyc/batch-update-sessions", ensureAuthenticated, async (req, res) => {
    try {
        const { updates } = req.body; // Array of { sessionId, new_status, comment, send_email, email_address }

        // Check if user is admin
        if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: "Admin privileges required"
            });
        }

        if (!updates || !Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Updates array is required"
            });
        }

        console.log(`Processing batch update for ${updates.length} sessions`);

        const results = [];
        const errors = [];

        // Process each update sequentially
        for (const update of updates) {
            try {
                const { sessionId, new_status, comment, send_email, email_address, email_language } = update;

                if (!sessionId || !new_status) {
                    errors.push({
                        sessionId,
                        error: "Missing sessionId or new_status"
                    });
                    continue;
                }

                // Prepare request body
                const updatePayload = { new_status };
                if (comment) updatePayload.comment = comment;
                if (send_email) updatePayload.send_email = send_email;
                if (email_address) updatePayload.email_address = email_address;
                if (email_language) updatePayload.email_language = email_language;

                // Call Didit API
                const diditResponse = await axios.patch(
                    `${DIDIT_CONFIG.BASE_URL}/v3/session/${sessionId}/u`,
                    updatePayload,
                    {
                        headers: {
                            'x-api-key': DIDIT_CONFIG.API_KEY,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                // Find and update user if session belongs to any user
                const user = await UserModel.findOne({
                    'kycVerifications.sessionId': sessionId
                });

                if (user) {
                    const verificationIndex = user.kycVerifications.findIndex(
                        v => v.sessionId === sessionId
                    );

                    if (verificationIndex !== -1) {
                        user.kycVerifications[verificationIndex].status = new_status;
                        user.kycVerifications[verificationIndex].lastChecked = new Date();
                        
                        if (new_status === 'Approved') {
                            user.kycStatus = 'verified';
                        } else if (new_status === 'Declined') {
                            user.kycStatus = 'rejected';
                            user.kycRejectedCount = (user.kycRejectedCount || 0) + 1;
                        }

                        await user.save();
                    }
                }

                results.push({
                    sessionId,
                    success: true,
                    status: new_status,
                    response: diditResponse.data
                });

            } catch (error) {
                console.error(`Error updating session ${update.sessionId}:`, error.message);
                errors.push({
                    sessionId: update.sessionId,
                    error: error.response?.data || error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Batch update completed. ${results.length} successful, ${errors.length} failed.`,
            data: {
                successful: results,
                failed: errors
            }
        });

    } catch (error) {
        console.error("Batch update error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process batch update",
            error: error.message
        });
    }
});

// Get KYC verification summary for user
user_route.get("/kyc/verification-summary/:userId", ensureAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const verifications = user.kycVerifications || [];
        const latestVerification = verifications[verifications.length - 1];

        // Calculate statistics
        const stats = {
            totalVerifications: verifications.length,
            approvedCount: verifications.filter(v => v.status === 'Approved').length,
            rejectedCount: verifications.filter(v => v.status === 'Declined').length,
            pendingCount: verifications.filter(v => v.status === 'In Review' || v.status === 'pending').length,
            resubmittedCount: verifications.filter(v => v.status === 'Resubmitted').length,
            lastVerificationDate: latestVerification?.lastChecked || latestVerification?.createdAt
        };

        res.status(200).json({
            success: true,
            data: {
                currentKycStatus: user.kycStatus,
                emailVerified: user.isEmailVerified,
                rejectionCount: user.kycRejectedCount || 0,
                resubmissionCount: user.kycResubmissionCount || 0,
                canResubmit: user.canResubmitKYC ? user.canResubmitKYC() : { canResubmit: true },
                stats: stats,
                verifications: verifications.map(v => ({
                    sessionId: v.sessionId,
                    status: v.status,
                    sessionNumber: v.sessionNumber,
                    sessionUrl: v.sessionUrl,
                    lastChecked: v.lastChecked,
                    createdAt: v.createdAt,
                    hasFullData: !!v.fullResponse
                })),
                latestVerification: latestVerification ? {
                    sessionId: latestVerification.sessionId,
                    status: latestVerification.status,
                    sessionUrl: latestVerification.sessionUrl,
                    lastChecked: latestVerification.lastChecked,
                    // Include extracted data if available
                    idVerification: latestVerification.idVerifications?.[0],
                    livenessCheck: latestVerification.livenessChecks?.[0],
                    faceMatch: latestVerification.faceMatches?.[0],
                    amlScreening: latestVerification.amlScreenings?.[0]
                } : null
            }
        });

    } catch (error) {
        console.error("Verification summary error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get verification summary",
            error: error.message
        });
    }
});
// 4. SUBMIT KYC INFO (Simple version)
user_route.post("/kyc/submit-info", ensureAuthenticated, async (req, res) => {
  try {
    const { 
      userId,
      fullLegalName,
      dateOfBirth,
      voterIdNumber,
      permanentAddress,
      phoneNumber
    } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update user info
    user.kycInfo = {
      fullLegalName,
      dateOfBirth: new Date(dateOfBirth),
      voterIdNumber,
      permanentAddress: JSON.parse(permanentAddress),
      submittedAt: new Date()
    };

    if (phoneNumber) user.phone = phoneNumber;
    
    user.kycStatus = 'pending';
    await user.save();

    res.json({
      success: true,
      message: "KYC information submitted",
      kycStatus: user.kycStatus
    });

  } catch (error) {
    console.error("Submit KYC error:", error);
    res.status(500).json({ success: false, message: "Failed to submit KYC info" });
  }
});


user_route.post("/kyc/upload-document", ensureAuthenticated, upload.single('document'), async (req, res) => {
  try {
    const { userId, documentType } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Save document info (in production, upload to S3/cloud storage)
    if (!user.kycDocuments) user.kycDocuments = [];
    
    user.kycDocuments.push({
      documentType,
      filename: req.file.originalname,
      uploadedAt: new Date(),
      status: 'pending'
    });

    await user.save();

    res.json({
      success: true,
      message: "Document uploaded successfully"
    });

  } catch (error) {
    console.error("Upload document error:", error);
    res.status(500).json({ success: false, message: "Failed to upload document" });
  }
});


// @route   GET /api/user/auto-payment-status
// @desc    Get auto payment method status for users
// @access  Private (User only)
user_route.get("/auto-payment-status", ensureAuthenticated, async (req, res) => {
    try {
        const AutoPaymentMethod = require("../Models/AutoPaymentMethod");
        
        const autoPaymentMethod = await AutoPaymentMethod.getInstance();
        
        res.status(200).json({
            success: true,
            status: autoPaymentMethod.status
        });

    } catch (error) {
        console.error("Error fetching auto payment status:", error);
        res.status(500).json({
            success: false,
            status: false
        });
    }
});
module.exports=user_route;
