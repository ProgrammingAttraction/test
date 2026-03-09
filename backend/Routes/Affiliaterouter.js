const express = require("express");
const Affiliaterouter = express.Router();
const jwt = require("jsonwebtoken");
const Affiliateuser = require("../Models/Affiliateuser");


// Middleware to verify JWT token
const authenticateAffiliate = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided. Authorization denied." 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key_here");
    
    // Find affiliate user
    const affiliate = await AffiliateUser.findById(decoded.userId).select("-password");
    
    if (!affiliate) {
      return res.status(404).json({ 
        success: false, 
        message: "Affiliate not found" 
      });
    }

    // Check if account is verified
    if (!affiliate.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: "Account not verified. Please verify your email." 
      });
    }

    // Attach affiliate to request object
    req.affiliate = affiliate;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ 
        success: false, 
        message: "Token expired. Please log in again." 
      });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token. Please log in again." 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Server error during authentication" 
    });
  }
};

// Get affiliate profile information
Affiliaterouter.get("/profile", authenticateAffiliate, async (req, res) => {
  try {
    // Return profile information (excluding sensitive data)
    const profileData = {
      id: req.affiliate._id,
      fullName: req.affiliate.fullName,
      email: req.affiliate.email,
      phone: req.affiliate.phone,
      balance: req.affiliate.balance,
      referralCode: req.affiliate.referralCode,
      paymentMethod: req.affiliate.paymentMethod,
      paymentDetails: req.affiliate.paymentDetails,
      totalReferrals: req.affiliate.referrals.length,
      totalEarnings: req.affiliate.totalEarnings,
      joinedAt: req.affiliate.createdAt
    };

    res.json({
      success: true,
      profile: profileData
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching profile" 
    });
  }
});

// Get affiliate performance statistics
Affiliaterouter.get("/stats", authenticateAffiliate, async (req, res) => {
  try {
    // In a real application, you would calculate these from your database
    const stats = {
      totalClicks: req.affiliate.totalClicks || 0,
      totalSignups: req.affiliate.referrals.length || 0,
      conversionRate: req.affiliate.totalClicks 
        ? (req.affiliate.referrals.length / req.affiliate.totalClicks * 100).toFixed(2) 
        : 0,
      earningsThisMonth: req.affiliate.earningsThisMonth || 0,
      earningsLastMonth: req.affiliate.earningsLastMonth || 0,
      topReferrers: req.affiliate.referrals.slice(0, 5) // Example: top 5 referrals
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching stats" 
    });
  }
});

// Update affiliate profile information
Affiliaterouter.put("/profile", authenticateAffiliate, async (req, res) => {
  try {
    const { fullName, phone, paymentMethod, paymentDetails } = req.body;
    
    // Basic validation
    if (!fullName || !phone || !paymentMethod || !paymentDetails) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Update the affiliate
    const updatedAffiliate = await Affiliateuser.findByIdAndUpdate(
      req.affiliate._id,
      { 
        fullName, 
        phone, 
        paymentMethod, 
        paymentDetails,
        updatedAt: Date.now() 
      },
      { new: true }
    ).select("-password -otp");

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: updatedAffiliate
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while updating profile" 
    });
  }
});


// Update affiliate password
Affiliaterouter.put("/update-password", authenticateAffiliate, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }
    
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        success: false, 
        message: "New password and confirmation do not match" 
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 8 characters long" 
      });
    }
    
    // Verify current password
    const affiliate = await AffiliateUser.findById(req.affiliate._id).select("+password");
    const isMatch = await affiliate.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Current password is incorrect" 
      });
    }
    
    // Update password
    affiliate.password = newPassword;
    await affiliate.save();
    
    res.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error("Password update error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while updating password" 
    });
  }
});
// Add these routes to your existing Affiliaterouter.js

// Get withdrawal history
Affiliaterouter.get("/withdrawals", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await AffiliateUser.findById(req.affiliate._id)
      .select("withdrawals")
      .sort({ "withdrawals.requestedAt": -1 });

    res.json({
      success: true,
      withdrawals: affiliate.withdrawals
    });
  } catch (error) {
    console.error("Withdrawal history error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching withdrawal history" 
    });
  }
});

// Request new withdrawal
Affiliaterouter.post("/withdrawals", authenticateAffiliate, async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;
    
    if (!amount || !paymentMethod || !paymentDetails) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    const affiliate = await AffiliateUser.findById(req.affiliate._id);
    
    // Check minimum withdrawal amount (500 as per your schema)
    if (amount < 500) {
      return res.status(400).json({ 
        success: false, 
        message: "Minimum withdrawal amount is 500" 
      });
    }

    // Check available balance
    if (amount > affiliate.availableBalance) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient available balance" 
      });
    }

    // Create withdrawal request
    const withdrawal = {
      amount,
      paymentMethod,
      paymentDetails,
      status: "pending"
    };

    affiliate.withdrawals.push(withdrawal);
    affiliate.pendingWithdrawal += amount;
    await affiliate.save();

    res.json({
      success: true,
      message: "Withdrawal request submitted successfully",
      withdrawal
    });
  } catch (error) {
    console.error("Withdrawal request error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while processing withdrawal" 
    });
  }
});

// Get referral history
Affiliaterouter.get("/referrals", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await AffiliateUser.findById(req.affiliate._id)
      .select("referrals")
      .populate({
        path: "referrals.referredUser",
        select: "fullName email phone createdAt"
      })
      .sort({ "referrals.earnedAt": -1 });

    res.json({
      success: true,
      referrals: affiliate.referrals
    });
  } catch (error) {
    console.error("Referral history error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching referral history" 
    });
  }
});

// Get earnings summary
Affiliaterouter.get("/earnings", authenticateAffiliate, async (req, res) => {
  try {
    const affiliate = await AffiliateUser.findById(req.affiliate._id)
      .select("balance totalEarned totalWithdrawn pendingWithdrawal");

    // Calculate monthly earnings (example - in a real app you'd query actual transactions)
    const currentMonthEarnings = affiliate.referrals
      .filter(ref => new Date(ref.earnedAt).getMonth() === new Date().getMonth())
      .reduce((sum, ref) => sum + ref.commissionAmount, 0);

    const lastMonthEarnings = affiliate.referrals
      .filter(ref => {
        const earnedDate = new Date(ref.earnedAt);
        const now = new Date();
        return earnedDate.getMonth() === (now.getMonth() - 1) && earnedDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, ref) => sum + ref.commissionAmount, 0);

    res.json({
      success: true,
      earnings: {
        currentBalance: affiliate.balance,
        availableBalance: affiliate.balance - affiliate.pendingWithdrawal,
        totalEarned: affiliate.totalEarned,
        totalWithdrawn: affiliate.totalWithdrawn,
        pendingWithdrawal: affiliate.pendingWithdrawal,
        currentMonthEarnings,
        lastMonthEarnings
      }
    });
  } catch (error) {
    console.error("Earnings summary error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error while fetching earnings summary" 
    });
  }
});
module.exports = Affiliaterouter;