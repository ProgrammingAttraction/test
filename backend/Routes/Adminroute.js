const express=require("express");
const UserModel = require("../Models/User");
const transaction_model = require("../Models/Transactionmodel");
const admin_route=express();
const nodemailer=require("nodemailer");
const notification_model = require("../Models/Usernotification");
const Withdrawmodel = require("../Models/Withdrawmodel");
const admin_model = require("../Models/Adminmodel");
const ensureAuthenticated = require("../Middlewares/Auth");
const path=require("path");
const Bannermodel = require("../Models/Bannermodel");
const fs=require("fs")
const multer=require("multer");
const ensureadminAuthenticated = require("../Middlewares/Adminauth");
const Noticemodel = require("../Models/Noticemodel");
const Providermodel = require("../Models/Providermodel");
const GameModel = require("../Models/GameModel");
const mongoose=require("mongoose");
const bcrypt=require("bcryptjs")
const BonusHistory = require("../Models/BonusHistoryModel");

// ------------file-upload----------
const storage=multer.diskStorage({
  destination:function(req,file,cb){
      cb(null,"./public/images")
  },
  filename:function(req,file,cb){
      cb(null,`${Date.now()}_${file.originalname}`)
  }

});
const uploadimage = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (adjust as needed)
  },
});
// --------------admin-dashboard----------------
admin_route.get("/admin-overview",async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set start of the day

    // Fetch all successful deposits and withdrawals
    const success_deposit = await transaction_model.find({ status: "success" });
    const rejected_deposit = await transaction_model.find({ status: "failed" });
    const rejected_withdraw = await Withdrawmodel.find({ status: "rejected" });
    const successful_withdraw = await Withdrawmodel.find({ status: "success" });

    // Calculate total rejected amounts
    const totalRejectedDeposit = rejected_deposit.reduce((sum, txn) => sum + txn.amount, 0);
    const totalRejectedWithdraw = rejected_withdraw.reduce((sum, txn) => sum + txn.amount, 0);

    const totalDeposit = success_deposit.reduce((sum, txn) => sum + txn.amount, 0);
    const todaysDeposit = success_deposit
      .filter(txn => new Date(txn.createdAt) >= today)
      .reduce((sum, txn) => sum + txn.amount, 0);

    const totalWithdraw = successful_withdraw.reduce((sum, txn) => sum + txn.amount, 0);
    const todaysWithdraw = successful_withdraw
      .filter(txn => new Date(txn.createdAt) >= today)
      .reduce((sum, txn) => sum + txn.amount, 0);

    // Calculate history data for charts
    const depositHistory = success_deposit.map(txn => ({
      date: new Date(txn.createdAt).toLocaleDateString(),
      amount: txn.amount,
    }));

    const withdrawHistory = successful_withdraw.map(txn => ({
      date: new Date(txn.createdAt).toLocaleDateString(),
      amount: txn.amount,
    }));

    // Calculate tax data for withdrawal
    const totalWithdrawTax = successful_withdraw.reduce((sum, txn) => sum + (txn.tax_amount || 0), 0);
    const todaysWithdrawTax = successful_withdraw
      .filter(txn => new Date(txn.createdAt) >= today)
      .reduce((sum, txn) => sum + (txn.tax_amount || 0), 0);

    // Calculate trends and differences
    const withdrawDifference = todaysWithdraw - todaysDeposit;
    const withdrawPercentageDifference = todaysDeposit > 0 ? ((withdrawDifference / todaysDeposit) * 100).toFixed(2) : 0;
    const withdrawTrend = withdrawDifference > 0 ? "up" : "down";

    const depositDifference = todaysDeposit - todaysWithdraw;
    const depositPercentageDifference = todaysWithdraw > 0 ? ((depositDifference / todaysWithdraw) * 100).toFixed(2) : 0;
    const depositTrend = depositDifference > 0 ? "up" : "down";

    res.send({
      success: true,
      message: "ok",
      totalDeposit,
      todaysDeposit,
      totalWithdraw,
      todaysWithdraw,
      totalWithdrawTax,
      todaysWithdrawTax,
      withdrawDifference,
      withdrawPercentageDifference,
      withdrawTrend,
      depositDifference,
      depositPercentageDifference,
      depositTrend,
      totalRejectedDeposit,
      totalRejectedWithdraw,
      depositHistory,
      withdrawHistory,  // Include both histories for charts
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server Error" });
  }
});
// Enhanced statistic-data route with backend calculations
admin_route.get("/statistic-data", ensureadminAuthenticated, async(req, res) => {
  try {
    // Get all data in parallel
    const [all_users, all_deposits, all_withdraw] = await Promise.all([
      UserModel.find({}),
      transaction_model.find({}),
      Withdrawmodel.find({})
    ]);

    // Get current date for calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);

    // Helper function to check if date is today/yesterday
    const isToday = (date) => new Date(date).toDateString() === today.toDateString();
    const isYesterday = (date) => new Date(date).toDateString() === yesterday.toDateString();

    // Separate manual and automatic transactions
    const automaticDeposits = all_deposits.filter(d => d.payment_method !== 'manual');
    const manualDeposits = all_deposits.filter(d => d.payment_method === 'manual');
    const automaticWithdrawals = all_withdraw.filter(w => w.provider !== 'manual');
    const manualWithdrawals = all_withdraw.filter(w => w.provider === 'manual');

    // Calculate totals
    const totalDeposits = all_deposits.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const totalWithdrawals = all_withdraw.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
    const automaticDepositsAmount = automaticDeposits.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const automaticWithdrawalsAmount = automaticWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
    const manualDepositsAmount = manualDeposits.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const manualWithdrawalsAmount = manualWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
    
    // Revenue calculation (automatic only)
    const totalRevenue = automaticDepositsAmount - automaticWithdrawalsAmount;

    // Today's values
    const todaysAutomaticDeposits = automaticDeposits
      .filter(d => isToday(d.createdAt) && ['success', 'completed', 'approved'].includes(d.status?.toLowerCase()))
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    
    const todaysAutomaticWithdrawals = automaticWithdrawals
      .filter(w => isToday(w.createdAt) && ['success', 'completed', 'approved'].includes(w.status?.toLowerCase()))
      .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
    
    const todaysManualDeposits = manualDeposits
      .filter(d => isToday(d.createdAt))
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    
    const todaysManualWithdrawals = manualWithdrawals
      .filter(w => isToday(w.createdAt))
      .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
    
    const todaysUsers = all_users.filter(u => isToday(u.createdAt)).length;

    // Yesterday's values for growth calculations
    const yesterdaysAutomaticDeposits = automaticDeposits
      .filter(d => isYesterday(d.createdAt) && ['success', 'completed', 'approved'].includes(d.status?.toLowerCase()))
      .reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    
    const yesterdaysAutomaticWithdrawals = automaticWithdrawals
      .filter(w => isYesterday(w.createdAt) && ['success', 'completed', 'approved'].includes(w.status?.toLowerCase()))
      .reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
    
    const yesterdaysUsers = all_users.filter(u => isYesterday(u.createdAt)).length;

    // Calculate growth percentages
    const userGrowth = todaysUsers - yesterdaysUsers;
    const depositGrowth = yesterdaysAutomaticDeposits > 0 ? 
      ((todaysAutomaticDeposits - yesterdaysAutomaticDeposits) / yesterdaysAutomaticDeposits) * 100 : 
      (todaysAutomaticDeposits > 0 ? 100 : 0);
    
    const withdrawGrowth = yesterdaysAutomaticWithdrawals > 0 ? 
      ((todaysAutomaticWithdrawals - yesterdaysAutomaticWithdrawals) / yesterdaysAutomaticWithdrawals) * 100 : 
      (todaysAutomaticWithdrawals > 0 ? 100 : 0);

    // Successful transactions counts
    const successfulAutomaticDeposits = automaticDeposits.filter(d => 
      ['success', 'completed', 'approved'].includes(d.status?.toLowerCase())
    );
    
    const successfulAutomaticWithdrawals = automaticWithdrawals.filter(w => 
      ['success', 'completed', 'approved'].includes(w.status?.toLowerCase())
    );
    
    const successfulManualDeposits = manualDeposits; // All manual deposits are successful
    const successfulManualWithdrawals = manualWithdrawals; // All manual withdrawals are successful

    // Successful amounts
    const successfulAutomaticDepositsAmount = successfulAutomaticDeposits.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    const successfulAutomaticWithdrawalsAmount = successfulAutomaticWithdrawals.reduce((sum, w) => sum + (parseFloat(w.amount) || 0), 0);
    
    const successfulRevenue = successfulAutomaticDepositsAmount - successfulAutomaticWithdrawalsAmount;

    // Pending transactions (automatic only)
    const pendingAutomaticDeposits = automaticDeposits.filter(d => 
      d.status?.toLowerCase() === 'pending'
    );
    
    const pendingAutomaticWithdrawals = automaticWithdrawals.filter(w => 
      w.status?.toLowerCase() === 'pending'
    );

    // Success rates
    const depositSuccessRate = automaticDeposits.length > 0 ? 
      (successfulAutomaticDeposits.length / automaticDeposits.length) * 100 : 0;
    
    const withdrawSuccessRate = automaticWithdrawals.length > 0 ? 
      (successfulAutomaticWithdrawals.length / automaticWithdrawals.length) * 100 : 0;

    // Chart data preparation (group by date)
    const prepareChartData = (transactions) => {
      const groupedByDate = transactions.reduce((acc, transaction) => {
        const date = new Date(transaction.createdAt).toLocaleDateString('en-BD');
        const amount = parseFloat(transaction.amount) || 0;
        
        if (!acc[date]) {
          acc[date] = 0;
        }
        acc[date] += amount;
        return acc;
      }, {});

      return Object.entries(groupedByDate)
        .map(([date, amount]) => ({
          date,
          amount: Math.round(amount * 100) / 100
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    };

    // Prepare chart data
    const depositHistory = prepareChartData(automaticDeposits);
    const withdrawHistory = prepareChartData(automaticWithdrawals);

    // Calculate user activity status
    const activeUsers = all_users.filter(u => u.status === 'active').length;
    const bannedUsers = all_users.filter(u => u.status === 'banned' || u.status === 'inactive').length;
    const verifiedUsers = all_users.filter(u => u.isEmailVerified === true).length;
    const kycVerifiedUsers = all_users.filter(u => u.kycStatus === 'verified' || u.kycStatus === 'approved').length;

    // User balance statistics
    const totalUserBalance = all_users.reduce((sum, user) => sum + (parseFloat(user.balance) || 0), 0);
    const avgUserBalance = all_users.length > 0 ? totalUserBalance / all_users.length : 0;

    // Transaction statistics
    const successfulTransactions = all_deposits.filter(d => 
      ['success', 'completed', 'approved'].includes(d.status?.toLowerCase())
    ).length + all_withdraw.filter(w => 
      ['success', 'completed', 'approved'].includes(w.status?.toLowerCase())
    ).length;

    const failedTransactions = all_deposits.filter(d => 
      ['failed', 'rejected', 'cancelled'].includes(d.status?.toLowerCase())
    ).length + all_withdraw.filter(w => 
      ['failed', 'rejected', 'cancelled'].includes(w.status?.toLowerCase())
    ).length;

    const pendingTransactions = all_deposits.filter(d => 
      d.status?.toLowerCase() === 'pending'
    ).length + all_withdraw.filter(w => 
      w.status?.toLowerCase() === 'pending'
    ).length;

    // Format numbers for display
    const formatNumber = (num) => parseFloat(num.toFixed(2));

    // Send all calculated data in response
    res.send({
      success: true,
      
      // Raw data
      all_users: all_users.map(u => ({
        _id: u._id,
        username: u.username,
        email: u.email,
        player_id: u.player_id,
        balance: u.balance,
        status: u.status,
        isEmailVerified: u.isEmailVerified,
        kycStatus: u.kycStatus,
        createdAt: u.createdAt,
        last_login: u.last_login,
        total_deposit: u.total_deposit || 0,
        total_withdraw: u.total_withdraw || 0
      })),
      all_deposits: all_deposits.map(d => ({
        _id: d._id,
        customer_id: d.customer_id,
        customer_name: d.customer_name,
        customer_email: d.customer_email,
        amount: d.amount,
        payment_method: d.payment_method,
        status: d.status,
        createdAt: d.createdAt,
        bonus_amount: d.bonus_amount || 0
      })),
      all_withdraw: all_withdraw.map(w => ({
        _id: w._id,
        userId: w.userId,
        name: w.name,
        email: w.email,
        amount: w.amount,
        provider: w.provider,
        status: w.status,
        createdAt: w.createdAt,
        recieved_amount: w.recieved_amount || w.amount,
        tax_amount: w.tax_amount || 0
      })),
      
      // Pre-calculated metrics
      metrics: {
        // Totals
        totalUsers: all_users.length,
        totalDeposits: formatNumber(totalDeposits),
        totalWithdrawals: formatNumber(totalWithdrawals),
        totalRevenue: formatNumber(totalRevenue),
        successfulRevenue: formatNumber(successfulRevenue),
        
        // User statistics
        activeUsers,
        bannedUsers,
        verifiedUsers,
        kycVerifiedUsers,
        totalUserBalance: formatNumber(totalUserBalance),
        avgUserBalance: formatNumber(avgUserBalance),
        
        // Today's metrics
        todaysAutomaticDeposits: formatNumber(todaysAutomaticDeposits),
        todaysAutomaticWithdrawals: formatNumber(todaysAutomaticWithdrawals),
        todaysManualDeposits: formatNumber(todaysManualDeposits),
        todaysManualWithdrawals: formatNumber(todaysManualWithdrawals),
        todaysUsers,
        userGrowth,
        
        // Manual transactions
        manualDepositsAmount: formatNumber(manualDepositsAmount),
        manualWithdrawalsAmount: formatNumber(manualWithdrawalsAmount),
        
        // Successful counts
        successfulAutomaticDeposits: successfulAutomaticDeposits.length,
        successfulAutomaticWithdrawals: successfulAutomaticWithdrawals.length,
        successfulManualDeposits: successfulManualDeposits.length,
        successfulManualWithdrawals: successfulManualWithdrawals.length,
        
        // Successful amounts
        successfulAutomaticDepositsAmount: formatNumber(successfulAutomaticDepositsAmount),
        successfulAutomaticWithdrawalsAmount: formatNumber(successfulAutomaticWithdrawalsAmount),
        
        // Pending counts
        pendingAutomaticDeposits: pendingAutomaticDeposits.length,
        pendingAutomaticWithdrawals: pendingAutomaticWithdrawals.length,
        
        // Transaction statistics
        successfulTransactions,
        failedTransactions,
        pendingTransactions,
        
        // Rates and growth
        depositSuccessRate: formatNumber(depositSuccessRate),
        withdrawSuccessRate: formatNumber(withdrawSuccessRate),
        depositGrowth: formatNumber(depositGrowth),
        withdrawGrowth: formatNumber(withdrawGrowth)
      },
      
      // Chart data
      chartData: {
        depositHistory,
        withdrawHistory
      },
      
      // Timestamp for caching
      lastUpdated: new Date(),
      dataCount: {
        users: all_users.length,
        deposits: all_deposits.length,
        withdrawals: all_withdraw.length
      }
    });
    
  } catch (error) {
    console.error("Error fetching statistic data:", error);
    res.status(500).send({ 
      success: false, 
      message: "Error fetching statistic data",
      error: error.message 
    });
  }
});
// ======================== RECENT USER ACTIVITY DASHBOARD ========================
admin_route.get("/admin-info/:id",async(req,res)=>{
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
// @route   GET /api/admin/bet-history
// @desc    Get all bet history from GameSession model (efficient version)
admin_route.get("/bet-history", async (req, res) => {
  try {
    const bethistory = await GameSession.find().sort({createdAt:-1});

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
// @route   GET /api/admin/recent-user-data
// @desc    Get recent user data including users, withdrawals, and transactions
admin_route.get("/recent-user-data", async (req, res) => {
  try {
    const { 
      userLimit = 5,
      withdrawalLimit = 10,
      transactionLimit = 10
    } = req.query;

    // Get recent users
    const recentUsers = await UserModel.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(userLimit))
      .select('username email player_id balance status createdAt last_login')
      .lean();

    // Get recent withdrawals
    const recentWithdrawals = await Withdrawmodel.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(withdrawalLimit))
      .populate('userId', 'username email player_id')
      .lean();

    // Get recent transactions
    const recentTransactions = await transaction_model.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(transactionLimit))
      .lean();

    // Format the data for better response
    const formattedUsers = recentUsers.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      player_id: user.player_id,
      balance: user.balance,
      status: user.status,
      created_at: user.createdAt,
      last_login: user.last_login,
      type: 'user'
    }));

    const formattedWithdrawals = recentWithdrawals.map(withdrawal => ({
      id: withdrawal._id,
      type: 'withdrawal',
      user: withdrawal.userId ? {
        username: withdrawal.userId.username,
        email: withdrawal.userId.email,
        player_id: withdrawal.userId.player_id
      } : null,
      amount: withdrawal.amount,
      status: withdrawal.status,
      method: withdrawal.provider,
      orderId: withdrawal.orderId,
      createdAt: withdrawal.createdAt,
      netAmount: withdrawal.netAmount || withdrawal.amount,
      taxAmount: withdrawal.tax_amount || 0
    }));

    const formattedTransactions = recentTransactions.map(transaction => ({
      id: transaction._id,
      type: 'transaction',
      transaction_id: transaction.transaction_id,
      customer_name: transaction.customer_name,
      customer_email: transaction.customer_email,
      payment_type: transaction.payment_type,
      payment_method: transaction.payment_method,
      amount: transaction.amount,
      bonus_amount: transaction.bonus_amount || 0,
      status: transaction.status,
      createdAt: transaction.createdAt,
      customer_id: transaction.customer_id
    }));

    // Combine all data by timestamp for a unified timeline view
    const allActivities = [
      ...formattedUsers.map(item => ({ ...item, timestamp: item.created_at })),
      ...formattedWithdrawals.map(item => ({ ...item, timestamp: item.createdAt })),
      ...formattedTransactions.map(item => ({ ...item, timestamp: item.createdAt }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        recent_users: formattedUsers,
        recent_withdrawals: formattedWithdrawals,
        recent_transactions: formattedTransactions,
        combined_activities: allActivities.slice(0, 20) // Show top 20 combined activities
      },
      counts: {
        users: formattedUsers.length,
        withdrawals: formattedWithdrawals.length,
        transactions: formattedTransactions.length,
        total_activities: allActivities.length
      }
    });

  } catch (error) {
    console.error("Error fetching recent user data:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/recent-withdrawals
// @desc    Get only recent withdrawals with user info
admin_route.get("/recent-withdrawals", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentWithdrawals = await Withdrawmodel.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'username email player_id avatar')
      .lean();

    const formattedWithdrawals = recentWithdrawals.map(withdrawal => ({
      id: withdrawal._id,
      user: withdrawal.userId ? {
        id: withdrawal.userId._id,
        username: withdrawal.userId.username,
        email: withdrawal.userId.email,
        player_id: withdrawal.userId.player_id,
        avatar: withdrawal.userId.avatar
      } : null,
      amount: withdrawal.amount,
      status: withdrawal.status,
      method: withdrawal.provider,
      orderId: withdrawal.orderId,
      payeeAccount: withdrawal.payeeAccount,
      createdAt: withdrawal.createdAt,
      netAmount: withdrawal.netAmount || withdrawal.amount,
      taxAmount: withdrawal.tax_amount || 0,
      recieved_amount: withdrawal.recieved_amount
    }));

    res.status(200).json({
      success: true,
      data: formattedWithdrawals,
      count: formattedWithdrawals.length
    });

  } catch (error) {
    console.error("Error fetching recent withdrawals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/recent-transactions
// @desc    Get only recent transactions
admin_route.get("/recent-transactions", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentTransactions = await transaction_model.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    const formattedTransactions = recentTransactions.map(transaction => ({
      id: transaction._id,
      transaction_id: transaction.transaction_id,
      customer_name: transaction.customer_name,
      customer_email: transaction.customer_email,
      customer_phone: transaction.customer_phone,
      payment_type: transaction.payment_type,
      payment_method: transaction.payment_method,
      amount: transaction.amount,
      bonus_amount: transaction.bonus_amount || 0,
      bonus_type: transaction.bonus_type || 'none',
      status: transaction.status,
      post_balance: transaction.post_balance,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
      customer_id: transaction.customer_id,
      transaction_note: transaction.transaction_note
    }));

    res.status(200).json({
      success: true,
      data: formattedTransactions,
      count: formattedTransactions.length
    });

  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/recent-users
// @desc    Get only recent registered users
admin_route.get("/recent-users", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentUsers = await UserModel.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('username email player_id balance status createdAt last_login login_count total_deposit total_withdraw')
      .lean();

    const formattedUsers = recentUsers.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      player_id: user.player_id,
      balance: user.balance,
      status: user.status,
      created_at: user.createdAt,
      last_login: user.last_login,
      login_count: user.login_count || 0,
      total_deposit: user.total_deposit || 0,
      total_withdraw: user.total_withdraw || 0,
      account_age: Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) + ' days'
    }));

    res.status(200).json({
      success: true,
      data: formattedUsers,
      count: formattedUsers.length
    });

  } catch (error) {
    console.error("Error fetching recent users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// --------------user-total-information--------------------
admin_route.get("/user-financials/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    // Fetch all deposits and withdrawals for the user
    const successDeposits = await transaction_model.find({ userId, status: "success" });
    const successWithdrawals = await Withdrawmodel.find({ userId, status: "success" });

    // Calculate **total** deposit & withdrawal amounts (all time)
    const totalDeposit = successDeposits.reduce((sum, txn) => sum + txn.amount, 0);
    const totalWithdraw = successWithdrawals.reduce((sum, txn) => sum + txn.amount, 0);

    // Calculate **today's** deposit & withdrawal amounts
    const todaysDeposit = successDeposits
      .filter(txn => new Date(txn.createdAt) >= today)
      .reduce((sum, txn) => sum + txn.amount, 0);

    const todaysWithdraw = successWithdrawals
      .filter(txn => new Date(txn.createdAt) >= today)
      .reduce((sum, txn) => sum + txn.amount, 0);

    // Calculate deposit & withdrawal difference
    const depositDifference = todaysDeposit - todaysWithdraw;
    const depositPercentageDifference = totalWithdraw > 0 ? ((depositDifference / totalWithdraw) * 100).toFixed(2) : 0;

    const withdrawDifference = todaysWithdraw - todaysDeposit;
    const withdrawPercentageDifference = totalDeposit > 0 ? ((withdrawDifference / totalDeposit) * 100).toFixed(2) : 0;

    res.send({
      success: true,
      message: "ok",
      totalDeposit,
      totalWithdraw,
      todaysDeposit,
      todaysWithdraw,
      depositDifference,
      depositPercentageDifference,
      withdrawDifference,
      withdrawPercentageDifference,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Server Error" });
  }
});
// ------------------all-information---------------------
admin_route.get("/all-coutation",async(req,res)=>{
  try {
     const pending_withdraw=await Withdrawmodel.find({status:"in review"}).countDocuments();
     const approved_withdraw=await Withdrawmodel.find({status:"approved"}).countDocuments();
     const rejected_withdraw=await Withdrawmodel.find({status:"rejected"}).countDocuments();
     const all_withdraw=await Withdrawmodel.find().countDocuments();
    //  -------------------------deposit------------------------------
    const pending_deposit=await transaction_model.find({status:"failed"}).countDocuments();
    const success_deposit=await transaction_model.find({status:"success"}).countDocuments();
    const all_deposit=await transaction_model.find().countDocuments();
     res.send({success:true,pending_withdraw,approved_withdraw,rejected_withdraw,all_withdraw,pending_deposit,success_deposit,all_deposit})
  } catch (error) {
    console.log(error)
  }
})
// ========================users===================================
// In your backend routes file
admin_route.get("/all-users", async (req, res) => {
    try {
        // Extract pagination and filter parameters from query
        const {
            page = 1,
            limit = 50,
            search = '',
            status,
            balanceFilter,
            bonusFilter,
            inactivityFilter,
            depositFilter,
            verificationFilter,
            kycFilter,
            referralFilter,
            bettingFilter,
            ratingFilter,
            dateFilter,
            startDate,
            endDate,
            sortBy = 'createdAt',
            sortOrder = -1
        } = req.query;

        // Build filter object
        const filter = {};

        // Apply search filter - FIXED: Don't use regex on _id
        if (search) {
            const searchRegex = { $regex: search, $options: 'i' };
            filter.$or = [
                { username: searchRegex },
                { email: searchRegex },
                { mobile: searchRegex },
                { phone: searchRegex },
                { player_id: searchRegex },
                { referralCode: searchRegex }
            ];
            
            // If search looks like an ObjectId (24 hex chars), also search by _id
            if (/^[0-9a-fA-F]{24}$/.test(search)) {
                filter.$or.push({ _id: search });
            }
        }

        // Apply status filter
        if (status && status !== 'all') {
            filter.status = status;
        }

        // Apply rating filter
        if (ratingFilter && ratingFilter !== 'all') {
            switch (ratingFilter) {
                case '0':
                    filter.rating = 0;
                    break;
                case '1-2':
                    filter.rating = { $gte: 1, $lte: 2 };
                    break;
                case '3-4':
                    filter.rating = { $gte: 3, $lte: 4 };
                    break;
                case '5':
                    filter.rating = 5;
                    break;
                case 'rated':
                    filter.rating = { $gt: 0 };
                    break;
            }
        }

        // Apply balance filter
        if (balanceFilter && balanceFilter !== 'all') {
            switch (balanceFilter) {
                case '0':
                    filter.balance = 0;
                    break;
                case '1-1000':
                    filter.balance = { $gt: 0, $lte: 1000 };
                    break;
                case '1001-5000':
                    filter.balance = { $gt: 1000, $lte: 5000 };
                    break;
                case '5000+':
                    filter.balance = { $gt: 5000 };
                    break;
            }
        }

        // Apply deposit filter
        if (depositFilter && depositFilter !== 'all') {
            switch (depositFilter) {
                case 'never':
                    filter.$or = [
                        { depositHistory: { $exists: false } },
                        { depositHistory: { $size: 0 } },
                        { total_deposit: 0 }
                    ];
                    break;
                case 'has_deposited':
                    filter.total_deposit = { $gt: 0 };
                    break;
                case 'first_time':
                    filter.$or = [
                        { depositHistory: { $exists: false } },
                        { depositHistory: { $size: 0 } },
                        { total_deposit: 0 }
                    ];
                    break;
                case 'multiple':
                    filter['depositHistory.1'] = { $exists: true };
                    break;
            }
        }

        // Apply verification filter
        if (verificationFilter && verificationFilter !== 'all') {
            switch (verificationFilter) {
                case 'email_verified':
                    filter.isEmailVerified = true;
                    break;
                case 'phone_verified':
                    filter.isPhoneVerified = true;
                    break;
                case 'both_verified':
                    filter.isEmailVerified = true;
                    filter.isPhoneVerified = true;
                    break;
                case 'none_verified':
                    filter.isEmailVerified = false;
                    filter.isPhoneVerified = false;
                    break;
            }
        }

        // Apply KYC filter
        if (kycFilter && kycFilter !== 'all') {
            filter.kycStatus = kycFilter;
        }

        // Apply referral filter
        if (referralFilter && referralFilter !== 'all') {
            switch (referralFilter) {
                case 'has_referrals':
                    filter.referralCount = { $gt: 0 };
                    break;
                case 'no_referrals':
                    filter.referralCount = 0;
                    break;
                case 'has_earnings':
                    filter.referralEarnings = { $gt: 0 };
                    break;
                case 'top_referrers':
                    filter.referralCount = { $gte: 5 };
                    break;
            }
        }

        // Apply date filters
        if (dateFilter && dateFilter !== 'all') {
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    const todayStart = new Date(now.setHours(0, 0, 0, 0));
                    filter.createdAt = { $gte: todayStart };
                    break;
                case 'week':
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    weekStart.setHours(0, 0, 0, 0);
                    filter.createdAt = { $gte: weekStart };
                    break;
                case 'month':
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    filter.createdAt = { $gte: monthStart };
                    break;
                case 'year':
                    const yearStart = new Date(now.getFullYear(), 0, 1);
                    filter.createdAt = { $gte: yearStart };
                    break;
                case 'custom':
                    if (startDate && endDate) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        filter.createdAt = { $gte: start, $lte: end };
                    }
                    break;
            }
        }

        // Calculate skip value for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build sort object
        const sort = {};
        sort[sortBy] = parseInt(sortOrder);

        // Get total count for pagination
        const totalUsers = await UserModel.countDocuments(filter);

        // Fetch users with pagination and filtering
        const all_users = await UserModel.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        if (!all_users || all_users.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "Users Not found!",
                total: 0,
                page: 1,
                totalPages: 1
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Users fetched successfully",
            data: all_users,
            pagination: {
                total: totalUsers,
                page: parseInt(page),
                totalPages: Math.ceil(totalUsers / parseInt(limit)),
                limit: parseInt(limit),
                hasNextPage: skip + all_users.length < totalUsers,
                hasPrevPage: parseInt(page) > 1
            }
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error fetching users",
            error: error.message 
        });
    }
});
admin_route.get("/all-active-users", async (req, res) => {
    try {
        // Use proper MongoDB query and field selection
        const all_users = await UserModel.find({})
            .sort({ createdAt: -1 })
        
        if (!all_users) {
            return res.status(404).json({ 
                success: false, 
                message: "Users Not found!" 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Users fetched successfully", 
            data: all_users 
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error fetching users",
            error: error.message 
        });
    }
});
admin_route.get("/all-ban-users",ensureadminAuthenticated,async(req,res)=>{
    try {
       const all_users=await UserModel.find({status:"banned"}).sort({createdAt:-1});
       if(!all_users){
           return res.send({success:false,message:"Users Not found!"})   
       }
       res.send({success:true,message:"Active users",data:all_users})
    } catch (error) {
        console.log(error)
    }
});
admin_route.get("/active-users",ensureadminAuthenticated,async(req,res)=>{
    try {
       const active_user=await UserModel.find({status:"active"}).sort({createdAt:-1});
       if(!active_user){
           return res.send({success:false,message:"Active Users Not found!"})   
       }
       res.send({success:true,message:"Active users",data:active_user})
    } catch (error) {
        console.log(error)
    }
});
admin_route.get("/banned-users",ensureadminAuthenticated,async(req,res)=>{
    try {
       const banned_user=await UserModel.find({status:"inactive"}).sort({createdAt:-1});
       if(!banned_user){
           return res.send({success:false,message:"Banned Users Not found!"})   
       }
       res.send({success:true,message:"Active users",data:banned_user})
    } catch (error) {
        console.log(error)
    }
});
admin_route.get("/single-user-details/:id",async(req,res)=>{
    try {
       const user_detail=await UserModel.findOne({_id:req.params.id});
       if(!user_detail){
           return res.send({success:false,message:"User Not found!"})   
       }
       res.send({success:true,message:"Ok",data:user_detail})
    } catch (error) {
        console.log(error)
    }
});
// admin_route.put("/add-user-balance/:id",async(req,res)=>{
//     try {
//         const {amount}=req.body;
//         const find_user=await UserModel.findOne({_id:req.params.id});
//         if(!find_user){
//           return res.send({success:false,message:"User did not find!"})
//         }
//         find_user.balance+=amount;
//         const update_deposit_money=await UserModel.findByIdAndUpdate({_id:find_user._id},{$set:{deposit_money:amount}})
//         find_user.save();
//        res.send({success:true,message:`${amount} BDT has been added to ${find_user.name}'s account!`})
//     } catch (error) {
//         console.log(error)
//     }
// });
// Route to add user balance with different balance types
admin_route.put("/add-user-balance/:id", async (req, res) => {
    try {
        const { 
            amount, 
            remark = "Admin balance addition",
            balanceType = "main"
        } = req.body;
        
        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).send({
                success: false,
                message: "Please provide a valid positive amount"
            });
        }

        // Updated valid balance types
        const validBalanceTypes = ["main", "bonus", "referral", "commission", "adjustment", "refund", "winning", "cashback", "others"];
        
        if (!validBalanceTypes.includes(balanceType)) {
            return res.status(400).send({
                success: false,
                message: `Invalid balance type. Must be one of: ${validBalanceTypes.join(', ')}`
            });
        }

        const find_user = await UserModel.findOne({ _id: req.params.id });
        if (!find_user) {
            return res.status(404).send({
                success: false,
                message: "User not found!"
            });
        }
        
        if(!find_user.phone){
            return res.send({
                success: false,
                message: "Please add phone number!"
            });    
        }

        let balanceBefore;
        let balanceAfter;
        let transactionDescription;
        let transactionType;
        let bonusHistoryEntry;
   
        // Handle different balance types
        switch(balanceType) {
            case "main":
                // Add to main balance
                balanceBefore = find_user.balance;
                find_user.balance += parseFloat(amount);
                balanceAfter = find_user.balance;
                find_user.total_deposit += parseFloat(amount);
                find_user.lifetime_deposit += parseFloat(amount);
                transactionDescription = `Admin added balance: ${remark}`;
                transactionType = 'deposit';
                break;

            case "bonus":
                // Add to bonus balance
                balanceBefore = find_user.bonusBalance;
                find_user.bonusBalance += parseFloat(amount);
                balanceAfter = find_user.bonusBalance;
                transactionDescription = `Admin added bonus balance: ${remark}`;
                transactionType = 'bonus';
                
                // Add to bonus history
                bonusHistoryEntry = {
                    type: 'bonus',
                    amount: parseFloat(amount),
                    totalBet: 0,
                    claimedAt: new Date(),
                    status: 'claimed',
                    reason: remark
                };
                find_user.bonusHistory.push(bonusHistoryEntry);
                
                // Create bonus activity log
                find_user.bonusActivityLogs.push({
                    bonusType: 'admin_added',
                    bonusAmount: parseFloat(amount),
                    depositAmount: 0,
                    activatedAt: new Date(),
                    status: 'active'
                });
                break;

            case "referral":
                // Only add to referralEarnings, NOT to main balance
                balanceBefore = find_user.referralEarnings;
                find_user.referralEarnings += parseFloat(amount);
                balanceAfter = find_user.referralEarnings;
                transactionDescription = `Admin added referral earnings: ${remark}`;
                transactionType = 'referral_commission';
                
                // Add to referral bonus history
                bonusHistoryEntry = {
                    type: 'referral_commission',
                    amount: parseFloat(amount),
                    totalBet: 0,
                    claimedAt: new Date(),
                    status: 'claimed',
                    reason: remark
                };
                find_user.bonusHistory.push(bonusHistoryEntry);
                break;

            case "commission":
                // Add to main balance as commission
                balanceBefore = find_user.balance;
                find_user.balance += parseFloat(amount);
                balanceAfter = find_user.balance;
                transactionDescription = `Admin added commission: ${remark}`;
                transactionType = 'deposit';
                break;

            case "adjustment":
                // Add to main balance as adjustment
                balanceBefore = find_user.balance;
                find_user.balance += parseFloat(amount);
                balanceAfter = find_user.balance;
                transactionDescription = `Admin balance adjustment: ${remark}`;
                transactionType = 'deposit';
                break;

            case "refund":
                // Add to main balance as refund
                balanceBefore = find_user.balance;
                find_user.balance += parseFloat(amount);
                balanceAfter = find_user.balance;
                transactionDescription = `Admin added refund: ${remark}`;
                transactionType = 'deposit';
                break;

            case "winning":
                // Add to main balance as winnings
                balanceBefore = find_user.balance;
                find_user.balance += parseFloat(amount);
                balanceAfter = find_user.balance;
                transactionDescription = `Admin added winnings: ${remark}`;
                transactionType = 'deposit';
                break;

            case "cashback":
                // Add to main balance as cashback
                balanceBefore = find_user.balance;
                find_user.balance += parseFloat(amount);
                balanceAfter = find_user.balance;
                transactionDescription = `Admin added cashback: ${remark}`;
                transactionType = 'deposit';
                break;

            case "others":
                // Add to main balance as others
                balanceBefore = find_user.balance;
                find_user.balance += parseFloat(amount);
                balanceAfter = find_user.balance;
                transactionDescription = `Admin added other balance: ${remark}`;
                transactionType = 'deposit';
                break;

            default:
                return res.status(400).send({
                    success: false,
                    message: "Invalid balance type"
                });
        }

        // Add transaction history
        find_user.transactionHistory.push({
            type: transactionType,
            amount: parseFloat(amount),
            balanceBefore: balanceBefore,
            balanceAfter: balanceAfter,
            description: transactionDescription,
            referenceId: `ADMIN-ADD-${balanceType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date(),
            details: {
                balanceType: balanceType,
                remark: remark,
                processedBy: req.admin?.username || 'admin',
                originalBalanceType: balanceType
            }
        });

        await find_user.save();
        
        // Create transaction record
        const transactionId = `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        const transactionData = {
            transaction_id: transactionId,
            customer_id: req.params.id,
            customer_name: find_user.username,
            customer_email: find_user.email,
            customer_phone: find_user.phone,
            payment_type: 'deposit',
            payment_method: "manual",
            amount: amount,
            bonus_amount: balanceType === 'bonus' ? amount : 0,
            bonus_type: balanceType,
            post_balance: find_user.balance,
            post_bonus_balance: find_user.bonusBalance,
            post_referral_earnings: find_user.referralEarnings,
            status: 'success',
            transaction_note: `${balanceType.charAt(0).toUpperCase() + balanceType.slice(1)} balance added by admin: ${remark}`,
            updated_by: req.admin?.username || 'admin',
            balance_type: balanceType
        };

        // Save transaction to database
        const transaction = new transaction_model(transactionData);
        await transaction.save();

        // Prepare response data
        const responseData = {
            success: true,
            message: `${amount} BDT has been added to ${find_user.username}'s ${balanceType} balance!`,
            remark: remark,
            balanceType: balanceType,
            transactionId: transactionId
        };

        // Add specific balance info based on type
        if (balanceType === 'main' || balanceType === 'commission' || balanceType === 'adjustment' || 
            balanceType === 'refund' || balanceType === 'winning' || balanceType === 'cashback' || 
            balanceType === 'others') {
            responseData.newMainBalance = find_user.balance;
            responseData.balanceBefore = balanceBefore;
            responseData.balanceAfter = find_user.balance;
        } else if (balanceType === 'bonus') {
            responseData.newBonusBalance = find_user.bonusBalance;
            responseData.balanceBefore = balanceBefore;
            responseData.balanceAfter = find_user.bonusBalance;
        } else if (balanceType === 'referral') {
            responseData.newReferralEarnings = find_user.referralEarnings;
            responseData.balanceBefore = balanceBefore;
            responseData.balanceAfter = find_user.referralEarnings;
        }

        res.send(responseData);
    } catch (error) {
        console.log("Add balance error:", error);
        res.status(500).send({
            success: false,
            message: error.message || "Server error while adding balance",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
// Simple User Status Change Route
admin_route.put("/users/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status)
    // Find and update user
    const user = await UserModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
     console.log(user)
    if (!user) {
      return res.status(404).send({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.send({ 
      success: true, 
      message: `User status updated to ${status}`,
      user: {
        id: user._id,
        username: user.username,
        status: user.status
      }
    });

  } catch (error) {
    console.log("Status change error:", error);
    res.status(500).send({ 
      success: false, 
      message: "Server error" 
    });
  }
});
// ------------------------p2p-system------------------------
admin_route.post("/deposit-success",async(req,res)=>{
    try {
      console.log(req.body)
      const user_info=await UserModel.findOne({player_id:req.body.player_id});

      // user_info.balance+=req.body.amount;
      // user_info.save();
      console.log("myingo",user_info)
      res.send({success:true,message:`${req.body.amount} BDT has been added to your account!`})

      if(req.body.status =="success"){
      const {amount}=req.body;
        if(!user_info){
          return res.send({success:false,message:"User did not find!"})
        }
        user_info.balance+=amount;
        user_info.save();
      }
  
       res.send({success:true,message:`${amount} BDT has been added to ${find_user.name}'s account!`})
    } catch (error) {
        console.log(error)
    }
});
admin_route.put("/subtract-user-balance/:id", async (req, res) => {
    try {
        const { amount, reason = "Admin balance deduction" } = req.body;
        
        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
            return res.status(400).send({ 
                success: false, 
                message: "Please provide a valid positive amount" 
            });
        }

        const find_user = await UserModel.findOne({ _id: req.params.id });

        if (!find_user) {
            return res.status(404).send({ 
                success: false, 
                message: "User not found!" 
            });
        }

        // Check if user has sufficient balance
        if (find_user.balance < amount) {
            return res.status(400).send({ 
                success: false, 
                message: "Insufficient balance!" 
            });
        }
        // Record balance before transaction
        const balanceBefore = find_user.balance;
        
        // Update user balance
        find_user.balance -= parseFloat(amount);
        
        // Update lifetime withdrawal if needed
        find_user.lifetime_withdraw += parseFloat(amount);
        
        // Add transaction history
        find_user.transactionHistory.push({
            type: 'withdrawal',
            amount: parseFloat(amount),
            balanceBefore: balanceBefore,
            balanceAfter: find_user.balance,
            description: reason,
            referenceId: `ADMIN-SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date(),
            details: {
                adminAction: true,
                reason: reason,
                processedBy: req.admin?.username || 'system'
            }
        });
        const orderId = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

       const newWithdrawal = new Withdrawmodel({
            userId:find_user._id,
            provider:"manual",
            amount,
            orderId,
            name: find_user.username,
            email:find_user.email,
            playerId:find_user.player_id,
            post_balance: find_user.balance - amount,
            recieved_amount: amount,
            tax_amount:0,
            status: 'success',
            processedAt: null,
            completedAt: null,
        });
        // Check if this affects wagering status
        const wageringStatus = find_user.wageringStatus;
        newWithdrawal.save();
        await find_user.save();

        res.send({ 
            success: true, 
            message: `${amount} BDT has been subtracted from ${find_user.username}'s account!`,
            data: {
                newBalance: find_user.balance,
                wageringStatus: wageringStatus,
                transactionId: `ADMIN-SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`
            }
        });

    } catch (error) {
        console.error("Subtract balance error:", error);
        res.status(500).send({ 
            success: false, 
            message: error.message || "Server error while subtracting balance" 
        });
    }
});
admin_route.put("/banned-user/:id",async(req,res)=>{
    try {
        const find_user=await UserModel.findOne({_id:req.params.id});
        if(!find_user){
          return res.send({success:false,message:"User did not find!"})
        }
        const banned_user=await UserModel.findByIdAndUpdate({_id:req.params.id},{$set:{status:"banned",reason:req.body.reason}});
       res.send({success:true,message:`${find_user.name}'s account has been banned!`})
    } catch (error) {
        console.log(error)
    }
})
admin_route.put("/unban-user/:id",async(req,res)=>{
    try {
        const find_user=await UserModel.findOne({_id:req.params.id});
        if(!find_user){
          return res.send({success:false,message:"User did not find!"})
        }
        const unban_user=await UserModel.findByIdAndUpdate({_id:req.params.id},{$set:{status:"active",reason:req.body.reason}});
       res.send({success:true,message:`${find_user.name}'s account has been banned!`})
    } catch (error) {
        console.log(error)
    }
})
// @route   GET /api/users/:userId/bet-history
// @desc    Get a user's complete bet history with filtering options
// Get user's bet history (simple version)
admin_route.get("/users/:userId/bet-history", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find user and select only the betHistory field
    const user = await UserModel.findById(userId, 'betHistory').sort({createdAt:-1});

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      data: user.betHistory || [] // Return empty array if no bets exist
    });

  } catch (error) {
    console.error("Error fetching bet history:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error"
    });
  }
});
// ========================users=================================
// ---------------------withdraw-ban-----------------------------------
// ======================== WITHDRAWAL BAN ROUTES ========================

// @route   POST /api/admin/users/:id/withdrawal-ban
// @desc    Ban a user from making withdrawals
admin_route.post("/users/:id/withdrawal-ban", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, banDurationDays } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Ban reason is required"
      });
    }

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Calculate unban date if duration is provided
    let unbanDate = null;
    if (banDurationDays && !isNaN(banDurationDays)) {
      unbanDate = new Date();
      unbanDate.setDate(unbanDate.getDate() + parseInt(banDurationDays));
    }

    // Update user withdrawal ban status
    user.withdrawalBanned = true;
    user.withdrawalBanReason = reason;
    user.withdrawalBanDate = new Date();
    user.withdrawalUnbanDate = unbanDate;

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.username} has been banned from withdrawals`,
      data: {
        withdrawalBanned: user.withdrawalBanned,
        withdrawalBanReason: user.withdrawalBanReason,
        withdrawalBanDate: user.withdrawalBanDate,
        withdrawalUnbanDate: user.withdrawalUnbanDate
      }
    });

  } catch (error) {
    console.error("Error banning user from withdrawals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   POST /api/admin/users/:id/withdrawal-unban
// @desc    Unban a user from making withdrawals
admin_route.post("/users/:id/withdrawal-unban", async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.withdrawalBanned) {
      return res.status(400).json({
        success: false,
        message: "User is not currently banned from withdrawals"
      });
    }

    // Update user withdrawal ban status
    user.withdrawalBanned = false;
    user.withdrawalBanReason = reason || "Manually unbanned by admin";
    user.withdrawalUnbanDate = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.username} has been unbanned from withdrawals`,
      data: {
        withdrawalBanned: user.withdrawalBanned,
        withdrawalBanReason: user.withdrawalBanReason,
        withdrawalUnbanDate: user.withdrawalUnbanDate
      }
    });

  } catch (error) {
    console.error("Error unbanning user from withdrawals:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/users/withdrawal-banned
// @desc    Get all users who are banned from withdrawals
admin_route.get("/users/withdrawal-banned", async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query;
    
    const query = { withdrawalBanned: true };
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { player_id: { $regex: search, $options: 'i' } },
        { withdrawalBanReason: { $regex: search, $options: 'i' } }
      ];
    }

    const bannedUsers = await UserModel.find(query)
      .select('username email player_id balance withdrawalBanned withdrawalBanReason withdrawalBanDate withdrawalUnbanDate status')
      .sort({ withdrawalBanDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await UserModel.countDocuments(query);

    res.status(200).json({
      success: true,
      data: bannedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error("Error fetching withdrawal banned users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/users/:id/withdrawal-ban-status
// @desc    Get withdrawal ban status for a specific user
admin_route.get("/users/:id/withdrawal-ban-status", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id)
      .select('username email player_id withdrawalBanned withdrawalBanReason withdrawalBanDate withdrawalUnbanDate');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        withdrawalBanned: user.withdrawalBanned,
        withdrawalBanReason: user.withdrawalBanReason,
        withdrawalBanDate: user.withdrawalBanDate,
        withdrawalUnbanDate: user.withdrawalUnbanDate,
        isPermanent: !user.withdrawalUnbanDate,
        isExpired: user.withdrawalUnbanDate && new Date() > user.withdrawalUnbanDate
      }
    });

  } catch (error) {
    console.error("Error fetching withdrawal ban status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   POST /api/admin/users/check-withdrawal-bans
// @desc    Check and auto-unban users whose ban period has expired
admin_route.post("/users/check-withdrawal-bans", async (req, res) => {
  try {
    const now = new Date();
    
    // Find users with expired bans
    const expiredBans = await UserModel.find({
      withdrawalBanned: true,
      withdrawalUnbanDate: { $lte: now }
    });

    // Unban users with expired bans
    if (expiredBans.length > 0) {
      const userIds = expiredBans.map(user => user._id);
      
      await UserModel.updateMany(
        { _id: { $in: userIds } },
        { 
          withdrawalBanned: false,
          withdrawalBanReason: "Ban period expired",
          withdrawalUnbanDate: now
        }
      );
    }

    res.status(200).json({
      success: true,
      message: `Checked withdrawal bans. ${expiredBans.length} users auto-unbanned.`,
      data: {
        unbannedCount: expiredBans.length,
        unbannedUsers: expiredBans.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email
        }))
      }
    });

  } catch (error) {
    console.error("Error checking withdrawal bans:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// ======================== USER DELETE ROUTES ========================

// @route   DELETE /api/admin/users/:id
// @desc    Delete a user account permanently
admin_route.delete("/users/:id", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteReason } = req.body;

    // Simple validation
    if (!deleteReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Delete reason is required"
      });
    }

    // Find the user first to get player_id
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const userInfo = {
      id: user._id,
      username: user.username,
      email: user.email,
      player_id: user.player_id
    };

    // Delete all related data in parallel for better performance
    await Promise.all([
      // Delete user's transactions (deposits)
      transaction_model.deleteMany({ customer_id: id }),
      
      // Delete user's withdrawals
      Withdrawmodel.deleteMany({ userId: id }),
      
      // Delete user's login history
      LoginHistoryModel.deleteMany({ userId: id }),
      
      // Delete user's game logs
      GameHistory.deleteMany({ player_id: user.player_id }),
      
      // Delete user's login logs
      LoginLog.deleteMany({ userId: id }),
      
      // Delete user's security settings
      SecuritySettings.deleteMany({ userId: id }),
      
      // Delete user's failed login records
      FailedLogin.deleteMany({ 
        $or: [
          { username: user.username },
          { userId: id }
        ]
      }),
      
      // Delete user's devices
      Device.deleteMany({ userId: id })
    ]);

    // Finally delete the user
    await UserModel.findByIdAndDelete(id);

    // Log the deletion
    console.log(`User and all related data deleted: ${userInfo.username} (${userInfo.email}) by admin. Reason: ${deleteReason}`);

    res.status(200).json({
      success: true,
      message: "User and all related data deleted successfully",
      data: {
        deletedUser: userInfo,
        deletedAt: new Date(),
        deletedBy: req.admin?.username || 'system',
        reason: deleteReason
      }
    });

  } catch (error) {
    console.error("Error deleting user and related data:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error while deleting user"
    });
  }
});
// ---------------------send-notification------------------------------

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "support@genzz.casino",
        pass: "ryoc xorr uevf cgwo",
    },
});
// Send Notification Route
admin_route.post("/send-notification",ensureadminAuthenticated, async (req, res) => {
  try {
    const { recipients, subject, message, sendViaEmail } = req.body;

    if (!recipients || !subject || !message) {
      return res.status(400).json({ success: false, message: "All fields are required!" });
    }

    let recipientEmails = [];

    // If "All Users" is selected, fetch all user emails from DB
    if (recipients === "All Users") {
      const users = await UserModel.find({}, "email"); // Fetch all users' emails
      recipientEmails = users.map(user => user.email);
    } else {
      recipientEmails = [recipients]; // Single recipient email
    }

    // Save Notification in Database
    const newNotification = new notification_model({ recipients: recipientEmails, subject, message, sentViaEmail: sendViaEmail });
    await newNotification.save();

    // If email sending is enabled
    if (sendViaEmail && recipientEmails.length > 0) {
        const mailOptions = {
            from: "support@genzz.casino",
            to: recipientEmails.join(","), // Convert array to comma-separated string
            subject,
            html: `
              <div style="
                max-width: 600px;
                margin: 0 auto;
                font-family: 'Arial', sans-serif;
                text-align: center;
              ">
                <!-- Header with Black Background -->
                <div style="
                  color: black;
                  padding: 15px;
                  font-size: 24px;
                  font-weight: bold;
                ">
                  <span style="color:cyan">G</span>enzz.casino
                </div>
          
                <!-- Notification Box -->
                <div style="
                  background: white;
                  color: #333;
                  padding: 20px;
                  margin-top: 10px;
                  border-radius: 8px;
                  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
                  text-align: left;
                ">
                  <h2 style="font-size: 22px;text-align: center;">${subject}</h2>
                  <p style="line-height: 1.6; font-size: 16px;">${message}</p>
                </div>
          
                <!-- Footer -->
                <p style="margin-top: 15px; font-size: 14px; opacity: 0.8;">Best Regards,</p>
                <p style="margin: 0; font-size: 16px; font-weight: bold;">Genzz Team</p>
              </div>
            `,
          };
          
      await transporter.sendMail(mailOptions);
    }

    res.status(201).json({ success: true, message: "Notification sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
admin_route.get("/notifications/:email",ensureAuthenticated,async (req, res) => {
    try {
      const { email } = req.params;
  
      // Find notifications where:
      // - The user's email exists in the recipients array
      // - OR The notification is for all users (null recipients array)
      const notifications = await notification_model
        .find({ recipients: { $in: [email] } }) // Check if email exists in recipients array
        .sort({ createdAt: -1 });
  
      res.status(200).json({ success: true, data: notifications });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
  
  admin_route.delete("/notifications/:id", ensureAuthenticated,async (req, res) => {
    try {
      const { id } = req.params;
  
      // Find and delete the notification by ID
      const deletedNotification = await notification_model.findByIdAndDelete(id);
  
      if (!deletedNotification) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }
  
      res.status(200).json({ success: true, message: "Notification deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  });
// Get all notifications with search and date filtering
admin_route.get("/notification-history",ensureadminAuthenticated, async (req, res) => {
  try {
    const { search, date, email } = req.query;
    let filter = {};

    // 🔹 Search filter
    if (search) {
      filter.$or = [
        { "recipients": { $regex: search, $options: "i" } },
        { "subject": { $regex: search, $options: "i" } },
        { "message": { $regex: search, $options: "i" } }
      ];
    }

    // 🔹 Email filter (for recipients array)
    if (email) {
      filter.recipients = { $in: [email] }; // Matches if the email is inside the recipients array
    }

    // 🔹 Date filter
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    // 🔹 Fetch notifications with sorting
    const notifications = await notification_model.find(filter).sort({ createdAt: -1 });

    res.json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});


// ========================deposit-transactions=============================
admin_route.get("/failed-deposit",async(req,res)=>{
    try {
        const pending_deposit=await transaction_model.find({status:"failed"}).sort({ createdAt: -1 });
        if(!pending_deposit){
            return res.send({success:false,message:"Transaction not found!"})
        };
        res.send({success:true,data:pending_deposit})
    } catch (error) {
        console.log(error)
    }
});
admin_route.get("/successful-deposit",async(req,res)=>{
    try {
        const success_deposit=await transaction_model.find({status:"success"}).sort({ createdAt: -1 });
        if(!success_deposit){
            return res.send({success:false,message:"Transaction not found!"})
        };
        res.send({success:true,data:success_deposit})
    } catch (error) {
        console.log(error)
    }
});
admin_route.get("/all-deposits",async(req,res)=>{
    try {
        const all_deposit=await transaction_model.find().sort({ createdAt: -1 });
        if(!all_deposit){
            return res.send({success:false,message:"Transaction not found!"})
        };
        res.send({success:true,data:all_deposit})
    } catch (error) {
        console.log(error)
    }
});
admin_route.get("/single-deposit/:id",async(req,res)=>{
  try {
      const single_deposit=await transaction_model.findById({_id:req.params.id})
      if(!single_deposit){
          return res.send({success:false,message:"Transaction not found!"})
      };
      res.send({success:true,data:single_deposit})
  } catch (error) {
      console.log(error)
  }
});
// Get single user's deposit history
admin_route.get("/single-user-deposits/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const deposits = await transaction_model.find({customer_id:id}).sort({ createdAt: -1 });
   
    if (!deposits.length) {
      return res.json({ success: false, message: "No deposits found!" });
    }

    res.json({ success: true, data: deposits });
  } catch (error) {
    console.error("Error fetching deposit history:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


// --------------------------withdrawal--------------------------
admin_route.get("/pending-withdrawal",async(req,res)=>{
  try {
      const pending_deposit=await Withdrawmodel.find({
        status:"pending"
      }).sort({ createdAt: -1 });
      if(!pending_deposit){
          return res.send({success:false,message:"Transaction not found!"})
      };
      res.send({success:true,data:pending_deposit})
  } catch (error) {
      console.log(error)
  }
});
admin_route.get("/approved-withdrawal",async(req,res)=>{
  try {
      const success_deposit=await Withdrawmodel.find({status:"approved"}).sort({ createdAt: -1 });
      if(!success_deposit){
          return res.send({success:false,message:"Transaction not found!"})
      };
      res.send({success:true,data:success_deposit})
  } catch (error) {
      console.log(error)
  }
});
admin_route.get("/rejected-withdrawal",async(req,res)=>{
  try {
      const rejected_withdraw=await Withdrawmodel.find({status:"rejected"}).sort({ createdAt: -1 });
      if(!rejected_withdraw){
          return res.send({success:false,message:"Transaction not found!"})
      };
      res.send({success:true,data:rejected_withdraw})
  } catch (error) {
      console.log(error)
  }
});
admin_route.get("/success-withdrawal",async(req,res)=>{
  try {
      const rejected_withdraw=await Withdrawmodel.find({status:"success"}).sort({ createdAt: -1 });
      if(!rejected_withdraw){
          return res.send({success:false,message:"Transaction not found!"})
      };
      res.send({success:true,data:rejected_withdraw})
  } catch (error) {
      console.log(error)
  }
});
admin_route.get("/all-withdrawals",async(req,res)=>{
  try {
      const all_deposit=await Withdrawmodel.find().sort({ createdAt: -1 });
      if(!all_deposit){
          return res.send({success:false,message:"Transaction not found!"})
      };
      res.send({success:true,data:all_deposit})
  } catch (error) {
      console.log(error)
  }
});
admin_route.get("/single-withdraw/:id",async(req,res)=>{
  try {
      const single_withdraw=await Withdrawmodel.findById({_id:req.params.id})
      if(!single_withdraw){
          return res.send({success:false,message:"Transaction not found!"})
      };
      res.send({success:true,data:single_withdraw})
  } catch (error) {
      console.log(error)
  }
});
admin_route.get("/all-transactions", async (req, res) => {
  try {
    // Extract query parameters
    const {
      q: searchQuery,
      type,
      remark,
      status,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 10
    } = req.query;

    // Prepare base queries for deposits and withdrawals
    const depositQuery = {};
    const withdrawalQuery = {};

    // Apply search filter (across multiple fields)
    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, 'i');
      const searchConditions = {
        $or: [
          { transaction_id: searchRegex },
          { customer_name: searchRegex },
          { customer_email: searchRegex },
          { customer_phone: searchRegex },
          { 'gateway_response.paymentId': searchRegex }
        ]
      };

      depositQuery.$or = searchConditions.$or;
      withdrawalQuery.$or = searchConditions.$or;
    }

    // Apply type filter
    if (type && type !== 'All') {
      if (type === 'deposit') {
        withdrawalQuery._id = { $exists: false }; // Exclude withdrawals
      } else if (type === 'withdrawal') {
        depositQuery._id = { $exists: false }; // Exclude deposits
      }
      // For other types, we might need additional logic
    }

    // Apply remark filter
    if (remark && remark !== 'All') {
      depositQuery.transaction_note = new RegExp(remark, 'i');
      withdrawalQuery.transaction_note = new RegExp(remark, 'i');
    }

    // Apply status filter
    if (status && status !== 'All') {
      depositQuery.status = new RegExp(`^${status}$`, 'i');
      withdrawalQuery.status = new RegExp(`^${status}$`, 'i');
    }

    // Apply payment method filter
    if (paymentMethod && paymentMethod !== 'All') {
      depositQuery.payment_method = new RegExp(`^${paymentMethod}$`, 'i');
      withdrawalQuery.payment_method = new RegExp(`^${paymentMethod}$`, 'i');
    }

    // Apply date range filter
    if (startDate || endDate) {
      const dateFilter = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate + 'T23:59:59.999Z'); // Include entire end day

      depositQuery.createdAt = dateFilter;
      withdrawalQuery.createdAt = dateFilter;
    }

    // Fetch deposits and withdrawals with pagination
    const skip = (page - 1) * limit;
    
    const [deposits, withdrawals, totalDeposits, totalWithdrawals] = await Promise.all([
      transaction_model.find(depositQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Withdrawmodel.find(withdrawalQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      transaction_model.countDocuments(depositQuery),
      Withdrawmodel.countDocuments(withdrawalQuery)
    ]);

    // Merge both arrays and add type identifier
    const allTransactions = [
      ...deposits.map(d => ({ ...d, payment_type: 'deposit' })),
      ...withdrawals.map(w => ({ ...w, payment_type: 'withdrawal' }))
    ];

    // Sort transactions by createdAt in descending order (latest first)
    allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Calculate totals for pagination
    const total = totalDeposits + totalWithdrawals;
    const totalPages = Math.ceil(total / limit);

    res.send({
      success: true,
      data: allTransactions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, message: "Server error!" });
  }
});
// PUT route to update the status of a transaction
admin_route.put('/update-deposit-status/:id', async (req, res) => {
  const { status, reason, updated_by } = req.body;
  const { id } = req.params; // Transaction ID from the URL parameter
 console.log("deposit",req.body)
 console.log("deposit",req.params)

  // Custom Validation
  if (!status || !['pending', 'success', 'failed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be "pending", "success", or "failed".' });
  }

  if (!reason || reason.trim() === '') {
    return res.status(400).json({ message: 'Reason is required and cannot be empty.' });
  }

  if (!updated_by || updated_by.trim() === '') {
    return res.status(400).json({ message: 'Updated by field is required and cannot be empty.' });
  }

  try {
    // Find the transaction by ID
    const transaction = await transaction_model.findById(id);
    console.log(transaction.customer_id)
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Update the status and reason
    transaction.status = status;
    transaction.reason = reason;
    transaction.updated_by = updated_by;
    const find_user=await UserModel.findById({_id:transaction.customer_id});
    console.log(find_user)
    if(!find_user){
         return res.status(404).json({ message: 'User  Not Find!'});
    }
    if(status=="success"){
      find_user.balance+=transaction.amount;
      find_user.save();
    }

    // Save the updated transaction
    await transaction.save();

    // Send success response
    return res.status(200).json({
      success: true,
      message: 'Transaction status updated successfully',
      data: transaction,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get Withdraw History
admin_route.get("/single-user-withdraws/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const withdraws = await Withdrawmodel.find({userId:userId}).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: withdraws });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// admin_route.put("/withdrawals/:withdrawalId/status", async (req, res) => {
//   try {
//     const { withdrawalId } = req.params;
//     const { status } = req.body;

//     // Allowed status values
//     const validStatuses = ["pending", "in review","assigned","success","approved", "rejected"];

//     // Validate the new status
//     if (!validStatuses.includes(status)) {
//       return res.status(400).json({ message: "Invalid status value." });
//     }

//     // Find and update the withdrawal status
//     const updatedWithdrawal = await Withdrawmodel.findByIdAndUpdate(
//       withdrawalId,
//       { status },
//       { new: true }
//     );

//     if (!updatedWithdrawal) {
//       return res.status(404).json({ message: "Withdrawal not found." });
//     }

//     res.json({ message: "Withdrawal status updated successfully.", withdrawal: updatedWithdrawal });
//   } catch (error) {
//     res.status(500).json({ message: "Server error.", error: error.message });
//   }
// });
// Update withdrawal status
const axios = require('axios');

admin_route.put("/withdrawals/:withdrawalId/status", async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status } = req.body;
    const backend_url = "https://admin2.genzz.casino";
    console.log(req.params);

    // Allowed status values
    const validStatuses = ["pending", "in review", "assigned", "success", "approved", "rejected"];

    // Validate the new status
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    // Find the withdrawal
    const withdrawal = await Withdrawmodel.findById(withdrawalId);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }

    // Store original status for rollback
    const originalStatus = withdrawal.status;

    // Handle status changes
    if (status === "rejected") {
      // Find the user to update the balance
      const user = await UserModel.findOne({ email: withdrawal.email });

      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      // Add the withdrawal amount back to the user's balance
      user.balance += withdrawal.amount;
      await user.save();

      // Update withdrawal status to rejected
      const updatedWithdrawal = await Withdrawmodel.findByIdAndUpdate(
        withdrawalId,
        { status: "rejected" },
        { new: true }
      );

      return res.json({ 
        message: "Withdrawal rejected successfully. Balance refunded.", 
        withdrawal: updatedWithdrawal 
      });

    } else if (status === "approved") {
      // First update status to "in review" or keep as pending while processing payout
      const updatedWithdrawal = await Withdrawmodel.findByIdAndUpdate(
        withdrawalId,
        { status: "in review" }, // Temporary status while processing
        { new: true }
      );

      try {
        // Generate unique orderId to prevent duplicates
        const generateUniqueOrderId = () => {
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(2, 15);
          return `WD${timestamp}${random}`.substring(0, 50); // Ensure it's not too long
        };

        const uniqueOrderId = generateUniqueOrderId();

        // Check if this orderId already exists in database (additional safety)
        const existingWithdrawal = await Withdrawmodel.findOne({ orderId: uniqueOrderId });
        if (existingWithdrawal) {
          // Regenerate if duplicate (very rare case)
          uniqueOrderId = generateUniqueOrderId();
        }

        // Initiate payout to external API
        const payoutData = {
          mid: "Genzz",
          provider: withdrawal.provider,
          amount: withdrawal.recieved_amount,
          orderId: uniqueOrderId, // Use unique orderId instead of withdrawal.orderId
          payeeId: withdrawal.playerId,
          payeeAccount: withdrawal.payeeAccount,
          callbackUrl: `${backend_url}/admin/withdrawals-take`,
          currency: "BDT",
        };

        console.log("Sending payout request with orderId:", uniqueOrderId);

        const payoutResponse = await axios.post(
          "https://backend.credixopay.com/api/payment/payout",
          payoutData,
          {
            headers: {
              'x-api-key': '18e5f948356de68e2909',
              'Content-Type': 'application/json'
            },
            timeout: 30000 // 30 seconds timeout
          }
        );

        console.log("Payout response:", payoutResponse.data);

        if (payoutResponse.data.success) {
          // Find user and update total withdrawn
          const user = await UserModel.findOne({ email: withdrawal.email });
          if (user) {
            user.total_withdraw += withdrawal.amount;
            await user.save();
          }

          // Payout successful - update to approved status with transaction details
          const finalWithdrawal = await Withdrawmodel.findByIdAndUpdate(
            withdrawalId,
            { 
              status: "approved",
              orderId: uniqueOrderId, // Store the new unique orderId
              transactionId: payoutResponse.data.transactionId,
              payoutTime: new Date().toISOString(),
              payoutResponse: payoutResponse.data // Store full response for reference
            },
            { new: true }
          );

          return res.json({ 
            message: "Withdrawal approved and payout initiated successfully.", 
            withdrawal: finalWithdrawal,
            payoutInitiated: true
          });
        } else {
          // Payout API returned success: false - rollback to original status
          await Withdrawmodel.findByIdAndUpdate(
            withdrawalId,
            { 
              status: originalStatus,
              payoutError: payoutResponse.data.message 
            }
          );

          return res.status(400).json({ 
            message: "Payout initiation failed.", 
            error: payoutResponse.data.message,
            statusReverted: true
          });
        }
      } catch (payoutError) {
        // Payout API call failed - rollback to original status
        await Withdrawmodel.findByIdAndUpdate(
          withdrawalId,
          { 
            status: originalStatus,
            payoutError: payoutError.response?.data?.message || payoutError.message 
          }
        );

        console.error("Payout error details:", {
          message: payoutError.message,
          response: payoutError.response?.data,
          status: payoutError.response?.status
        });

        return res.status(500).json({ 
          message: "Payout initiation failed. Status reverted to previous state.", 
          error: payoutError.response?.data?.message || payoutError.message,
          statusReverted: true
        });
      }
    } else {
      // For other status changes (pending, in review, assigned, success)
      const updatedWithdrawal = await Withdrawmodel.findByIdAndUpdate(
        withdrawalId,
        { status },
        { new: true }
      );

      return res.json({ 
        message: "Withdrawal status updated successfully.", 
        withdrawal: updatedWithdrawal 
      });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});
admin_route.post("/withdrawals-take", async (req, res) => {
  try {
    console.log(req.body)
     const find_withdraw=await Withdrawmodel.findOne({orderId:req.body.orderId})
     console.log("dfsf",find_withdraw)
     if(!find_withdraw){
        return res.send({success:false,message:"Withdraw id not found!"});
        console.log("ok")
     }
     const update_status=await Withdrawmodel.findByIdAndUpdate({_id:find_withdraw._id},{$set:{status:req.body.status}})
     console.log(update_status)
     // If status is 'failed' or 'rejected', refund the user
    if (req.body.status === "failed" || req.body.status === "rejected") {
      const user = await UserModel.findById(find_withdraw.userId);
      if (user) {
        user.balance += find_withdraw.amount; // Refund the amount
        await user.save();
        console.log(`Refunded ${find_withdraw.amount} to user ${user._id}`);
      }
    }
    res.send({ success: true, message: "Withdrawal status updated successfully." });
     console.log(update_status);
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error.", error: error.message });
  }
});
// -------------------------report-------------------------
// -------------moderator---------------------------
admin_route.get("/all-admins",async(req,res)=>{
  try {
     const all_admins=await admin_model.find({role:"admin",is_admin:true});
     if(!all_admins){
         return res.send({success:false,message:"Active admin Not found!"})   
     }
     res.send({success:true,message:"Active users",data:all_admins})
  } catch (error) {
      console.log(error)
  }
});
// POST /admin/games/bulk-inactivate
admin_route.post('/games/bulk-inactivate', async (req, res) => {
  try {
    const { excludeGameIds = [] } = req.body;
    const result = await Game.updateMany(
      { _id: { $nin: excludeGameIds }, isActive: true }, // Only update currently active non-excluded
      { $set: { isActive: false } }
    );
    res.json({
      success: true,
      message: `Inactivated ${result.modifiedCount} games (kept ${excludeGameIds.length} popular ones)`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// @route   DELETE /api/admin/games/provider/PragmaticPlay
// @desc    Delete all games from PragmaticPlay provider
admin_route.delete("/games/category/PragmaticPlay", async (req, res) => {
  try {
    // Find all games that have PragmaticPlay in their categories array
    const pragmaticPlayGames = await GameModel.find({ 
      categories: { $in: [/PragmaticPlay/i] } 
    });

    if (!pragmaticPlayGames || pragmaticPlayGames.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No games found with PragmaticPlay category"
      });
    }

    // Delete all games with PragmaticPlay category
    const deleteResult = await GameModel.deleteMany({ 
      categories: { $in: [/PragmaticPlay/i] } 
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} games with PragmaticPlay category`,
      deletedCount: deleteResult.deletedCount,
      deletedGames: pragmaticPlayGames.map(game => ({
        gameId: game.gameId,
        gameName: game.gameName,
        providerName: game.providerName,
        categories: game.categories
      }))
    });

  } catch (error) {
    console.error("Error deleting PragmaticPlay category games:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error while deleting PragmaticPlay category games"
    });
  }
});
admin_route.get("/all-super-admins",async(req,res)=>{
  try {
     const all_admins=await admin_model.find({role:"super-admin",is_admin:true});
     if(!all_admins){
         return res.send({success:false,message:"Active admin Not found!"})   
     }
     res.send({success:true,message:"Active users",data:all_admins})
  } catch (error) {
      console.log(error)
  }
});
admin_route.get("/pending-admins",async(req,res)=>{
  try {
     const pending_admins=await admin_model.find({is_admin:false});
     if(!pending_admins){
         return res.send({success:false,message:"Active admin Not found!"})   
     }
     res.send({success:true,message:"Pending admins",data:pending_admins})
  } catch (error) {
      console.log(error)
  }
});
// -----------chnage-admin-status------------------
admin_route.put("/admin-status-update/:id",async(req,res)=>{
  try {
      const admin_find=await admin_model.findOne({_id:req.params.id});
      if(!admin_find){
        return res.send({success:false,message:"Admin did not find!"})
      }
      const update_status=await admin_model.findByIdAndUpdate({_id:req.params.id},{$set:{status:req.body.status}});
     res.send({success:true,message:`${admin_find.name}'s account has been banned!`})
  } catch (error) {
      console.log(error)
  }
})
// --------------------frontend-----------------------------
// Route to upload multiple images
admin_route.post("/upload",ensureadminAuthenticated,uploadimage.array("images", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Extract filenames and paths from uploaded files
    const filenames = req.files.map(file => file.filename);
    const paths = req.files.map(file => `${file.filename}`);

    // Find the existing document (if any)
    let existingImageSet = await Bannermodel.findOne();

    // If no document exists, create a new one
    if (!existingImageSet) {
      existingImageSet = new Bannermodel({ filenames, paths });
      await existingImageSet.save();
    } else {
      // Add the new images to the existing arrays
      existingImageSet.filenames.push(...filenames);
      existingImageSet.paths.push(...paths);
      await existingImageSet.save();
    }

    res.json({ message: "Images uploaded successfully", images: existingImageSet });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error uploading images", error });
  }
});

// Route to get all uploaded images (for slider)
// GET route to fetch images
admin_route.get('/banners',async (req, res) => {
  try {
    // Find the image document in the database
    const imageSet = await Bannermodel.findOne(); 

    // Check if the imageSet exists
    if (!imageSet) {
      return res.status(404).json({ message: 'No images found' });
    }

    // Send the filenames in the response
    res.json({ filenames: imageSet.filenames });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ message: 'Error fetching banners', error });
  }
});
// Delete a single image
admin_route.delete("/banners/:imageName",ensureAuthenticated,async (req, res) => {
  const { imageName } = req.params;

  try {
    // Find the carousel entry
    const carousel = await Bannermodel.findOne({});

    if (!carousel) {
      return res.status(404).json({ message: "Carousel not found" });
    }

    // Find the index of the image to delete
    const imageIndex = carousel.filenames.indexOf(imageName);
    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Remove the image from the filenames and paths arrays
    carousel.filenames.splice(imageIndex, 1);
    carousel.paths.splice(imageIndex, 1);

    // Delete the actual image file from the server
    const filePath = path.join(__dirname, "public", "images", imageName); // Adjust the path if necessary
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the file from the server
    }

    // Save the updated carousel record
    await carousel.save();

    res.json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: "Error deleting image", error });
  }
});

// ------------notice----------------------
// Create a new notice (this will replace the existing notice)
admin_route.post('/add-notice',ensureadminAuthenticated,async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Notice content is required' });
  }

  try {
    // Find the first notice and update it with the new content, or create a new one if it doesn't exist
    let existingNotice = await Noticemodel.findOne();

    if (existingNotice) {
      // Update the existing notice with new content
      existingNotice.content = content;
      await existingNotice.save();
      res.status(200).json({ message: 'Notice updated successfully', notice: existingNotice });
    } else {
      // If no notice exists, create a new one
      const newNotice = new Noticemodel({ content });
      await newNotice.save();
      res.status(201).json({ message: 'Notice created successfully', notice: newNotice });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error creating or updating notice', error: error.message });
  }
});

// Fetch the latest notice
admin_route.get('/notice', async (req, res) => {
  try {
    const notice = await Noticemodel.findOne();  // Fetch the first notice
    if (!notice) {
      return res.json({ message: 'notice found' });
    }
    res.status(200).json({ notice });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notice', error: error.message });
  }
});
// --------------add-provider---------------
// @route   POST /api/providers/add
// @desc    Add a new provider
admin_route.post("/add-provider", uploadimage.single("image"), async (req, res) => {
  try {
    const { providerName } = req.body;

    if (!providerName || !req.file) {
      return res.status(400).json({ message: "Provider name and image are required." });
    }

    const imageUrl = `${req.file.filename}`; // Store image path

    const newProvider = new Providermodel({ providerName, imageUrl });
    await newProvider.save();

    res.status(201).json({ message: "Provider added successfully!", provider: newProvider });
  } catch (error) {
    console.error("Error adding provider:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// @route   GET /api/providers
// @desc    Get all providers
admin_route.get("/providers", async (req, res) => {
  try {
    const providers = await Providermodel.find().sort({ createdAt: -1 });
    res.status(200).json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
// @desc    Delete a provider
admin_route.delete("/provider-remove/:id", async (req, res) => {
  try {
    const provider = await Providermodel.findById(req.params.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider not found." });
    }

    // Delete the image file from the server
    const imagePath = `./images/${provider.imageUrl.split("/").pop()}`;
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Remove provider from database
    await Providermodel.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Provider deleted successfully!" });
  } catch (error) {
    console.error("Error deleting provider:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});



// Configure multer for game image uploads
const gameImageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const uploadGameImage = multer({ 
  storage: gameImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images only (JPEG, JPG, PNG, GIF)!");
    }
  }
});

// @route   POST /api/games/add
// @desc    Add a new game
// Bulk upload games from Excel with duplicate validation
// Bulk upload games from Excel with duplicate validation
// admin_route.post("/games/bulk-upload", async (req, res) => {
//   try {
//     const { games } = req.body;

//     // Validate input
//     if (!games || !Array.isArray(games) || games.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No games data provided"
//       });
//     }

//     const results = {
//       total: games.length,
//       added: 0,
//       skipped: 0,
//       errors: 0,
//       duplicates: 0,
//       details: []
//     };

//     // Check for duplicates within the uploaded file
//     const gameIdMap = new Map();
//     const duplicatesInFile = new Set();
    
//     games.forEach((game, index) => {
//       if (game.gameId) {
//         const gameId = game.gameId.trim();
//         if (gameIdMap.has(gameId)) {
//           duplicatesInFile.add(gameId);
//         } else {
//           gameIdMap.set(gameId, index);
//         }
//       }
//     });

//     // Get existing gameIds from database
//     const existingGameIds = await GameModel.find({ 
//       gameId: { $in: Array.from(gameIdMap.keys()) } 
//     }).select('gameId -_id');

//     const existingGameIdSet = new Set(existingGameIds.map(g => g.gameId));

//     // Process games
//     const validGames = [];
    
//     games.forEach((game, index) => {
//       const gameId = game.gameId ? game.gameId.trim() : '';

//       // Validate gameId
//       if (!gameId) {
//         results.errors++;
//         results.details.push({
//           gameId: 'unknown',
//           status: 'error',
//           reason: 'Missing game ID',
//           row: index + 2
//         });
//         return;
//       }

//       // Check for duplicates within the file
//       if (duplicatesInFile.has(gameId)) {
//         results.duplicates++;
//         results.details.push({
//           gameId: gameId,
//           status: 'skipped',
//           reason: 'Duplicate game ID within the file',
//           row: index + 2
//         });
//         return;
//       }

//       // Check if gameId exists in database
//       if (existingGameIdSet.has(gameId)) {
//         results.skipped++;
//         results.details.push({
//           gameId: gameId,
//           status: 'skipped',
//           reason: 'Game ID already exists in database',
//           row: index + 2
//         });
//         return;
//       }

//       // Validate required fields
//       if (!game.gameName || !game.providerName || !game.categories || !Array.isArray(game.categories) || game.categories.length === 0 || !game.imageUrl) {
//         results.errors++;
//         results.details.push({
//           gameId: gameId,
//           status: 'error',
//           reason: 'Missing required fields or invalid categories (must be a non-empty array)',
//           row: index + 2
//         });
//         return;
//       }

//       // Validate URL format
//       try {
//         new URL(game.imageUrl);
//       } catch (_) {
//         results.errors++;
//         results.details.push({
//           gameId: gameId,
//           status: 'error',
//           reason: 'Invalid image URL',
//           row: index + 2
//         });
//         return;
//       }

//       // Validate categories
//       const trimmedCategories = game.categories.map(cat => cat.trim()).filter(cat => cat);
//       if (trimmedCategories.length === 0) {
//         results.errors++;
//         results.details.push({
//           gameId: gameId,
//           status: 'error',
//           reason: 'At least one valid category is required',
//           row: index + 2
//         });
//         return;
//       }

//       validGames.push({
//         originalIndex: index,
//         game: {
//           gameName: game.gameName.trim(),
//           providerName: game.providerName.trim(),
//           gameId: gameId,
//           categories: trimmedCategories,
//           imageUrl: game.imageUrl.trim(),
//           isFeatured: game.isFeatured || false,
//           isActive: game.isActive !== undefined ? game.isActive : true
//         }
//       });
//     });

//     // Process valid games in batches
//     const batchSize = 10;
//     for (let i = 0; i < validGames.length; i += batchSize) {
//       const batch = validGames.slice(i, i + batchSize);
      
//       const batchPromises = batch.map(async ({ originalIndex, game }) => {
//         try {
//           // Double-check for race conditions
//           const existingGame = await GameModel.findOne({ gameId: game.gameId });
//           if (existingGame) {
//             return {
//               success: false,
//               gameId: game.gameId,
//               message: "Game ID already exists in database",
//               row: originalIndex + 2
//             };
//           }

//           // Create new game
//           const newGame = new GameModel(game);
//           await newGame.save();
          
//           return {
//             success: true,
//             gameId: game.gameId,
//             message: "Game added successfully",
//             row: originalIndex + 2
//           };
//         } catch (error) {
//           console.error(`Error adding game ${game.gameId}:`, error);
          
//           if (error.code === 11000) {
//             return {
//               success: false,
//               gameId: game.gameId,
//               message: "Duplicate game ID",
//               row: originalIndex + 2
//             };
//           }
          
//           return {
//             success: false,
//             gameId: game.gameId,
//             message: `Database error: ${error.message}`,
//             row: originalIndex + 2
//           };
//         }
//       });

//       const batchResults = await Promise.all(batchPromises);
      
//       batchResults.forEach(result => {
//         if (result.success) {
//           results.added++;
//           results.details.push({
//             gameId: result.gameId,
//             status: 'added',
//             row: result.row
//           });
//         } else if (result.message.includes("Duplicate") || result.message.includes("already exists")) {
//           results.skipped++;
//           results.details.push({
//             gameId: result.gameId,
//             status: 'skipped',
//             reason: result.message,
//             row: result.row
//           });
//         } else {
//           results.errors++;
//           results.details.push({
//             gameId: result.gameId,
//             status: 'error',
//             reason: result.message,
//             row: result.row
//           });
//         }
//       });

//       // Small delay between batches
//       if (i + batchSize < validGames.length) {
//         await new Promise(resolve => setTimeout(resolve, 100));
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Bulk upload completed",
//       results
//     });

//   } catch (error) {
//     console.error("Error in bulk upload:", error);
//     return res.status(500).json({
//       success: false,
//       message: `Internal server error during bulk upload: ${error.message}`
//     });
//   }
// });
admin_route.post("/games/bulk-upload", async (req, res) => {
  try {
    const { games } = req.body;

    // Validate input
    if (!games || !Array.isArray(games) || games.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No games data provided"
      });
    }

    const results = {
      total: games.length,
      added: 0,
      skipped: 0,
      errors: 0,
      duplicates: 0,
      details: []
    };

    // Check for duplicates within the uploaded file
    const gameIdMap = new Map();
    const duplicatesInFile = new Set();
    
    games.forEach((game, index) => {
      if (game.gameId) {
        const gameId = game.gameId.trim();
        if (gameIdMap.has(gameId)) {
          duplicatesInFile.add(gameId);
        } else {
          gameIdMap.set(gameId, index);
        }
      }
    });

    // Get existing gameIds from database
    const existingGameIds = await GameModel.find({ 
      gameId: { $in: Array.from(gameIdMap.keys()) } 
    }).select('gameId -_id');

    const existingGameIdSet = new Set(existingGameIds.map(g => g.gameId));

    // Process games
    const validGames = [];
    
    for (const [index, game] of games.entries()) {
      const gameId = game.gameId ? game.gameId.trim() : '';

      // Validate gameId
      if (!gameId) {
        results.errors++;
        results.details.push({
          gameId: 'unknown',
          status: 'error',
          reason: 'Missing game ID',
          row: index + 2
        });
        continue;
      }

      // Check for duplicates within the file
      if (duplicatesInFile.has(gameId)) {
        results.duplicates++;
        results.details.push({
          gameId: gameId,
          status: 'skipped',
          reason: 'Duplicate game ID within the file',
          row: index + 2
        });
        continue;
      }

      // Check if gameId exists in database
      if (existingGameIdSet.has(gameId)) {
        results.skipped++;
        results.details.push({
          gameId: gameId,
          status: 'skipped',
          reason: 'Game ID already exists in database',
          row: index + 2
        });
        continue;
      }

      // Validate required fields
      if (!game.gameName || !game.providerName || !game.categories || !Array.isArray(game.categories) || game.categories.length === 0 || !game.imageUrl) {
        results.errors++;
        results.details.push({
          gameId: gameId,
          status: 'error',
          reason: 'Missing required fields or invalid categories (must be a non-empty array)',
          row: index + 2
        });
        continue;
      }

      // Validate URL format and accessibility
      try {
        new URL(game.imageUrl);
        // Check if URL is reachable
        await axios.head(game.imageUrl, {
          timeout: 5000, // 5 second timeout
          validateStatus: (status) => status >= 200 && status < 300
        });
      } catch (error) {
        results.errors++;
        results.details.push({
          gameId: gameId,
          status: 'error',
          reason: error.response ? `Invalid or unreachable image URL: ${error.response.status} status` : 'Invalid or unreachable image URL',
          row: index + 2
        });
        continue;
      }

      // Validate categories
      const trimmedCategories = game.categories.map(cat => cat.trim()).filter(cat => cat);
      if (trimmedCategories.length === 0) {
        results.errors++;
        results.details.push({
          gameId: gameId,
          status: 'error',
          reason: 'At least one valid category is required',
          row: index + 2
        });
        continue;
      }

      validGames.push({
        originalIndex: index,
        game: {
          gameName: game.gameName.trim(),
          providerName: game.providerName.trim(),
          gameId: gameId,
          categories: trimmedCategories,
          imageUrl: game.imageUrl.trim(),
          isFeatured: game.isFeatured || false,
          isActive: game.isActive !== undefined ? game.isActive : true
        }
      });
    }

    // Process valid games in batches
    const batchSize = 10;
    for (let i = 0; i < validGames.length; i += batchSize) {
      const batch = validGames.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async ({ originalIndex, game }) => {
        try {
          // Double-check for race conditions
          const existingGame = await GameModel.findOne({ gameId: game.gameId });
          if (existingGame) {
            return {
              success: false,
              gameId: game.gameId,
              message: "Game ID already exists in database",
              row: originalIndex + 2
            };
          }

          // Create new game
          const newGame = new GameModel(game);
          await newGame.save();
          
          return {
            success: true,
            gameId: game.gameId,
            message: "Game added successfully",
            row: originalIndex + 2
          };
        } catch (error) {
          console.error(`Error adding game ${game.gameId}:`, error);
          
          if (error.code === 11000) {
            return {
              success: false,
              gameId: game.gameId,
              message: "Duplicate game ID",
              row: originalIndex + 2
            };
          }
          
          return {
            success: false,
            gameId: game.gameId,
            message: `Database error: ${error.message}`,
            row: originalIndex + 2
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        if (result.success) {
          results.added++;
          results.details.push({
            gameId: result.gameId,
            status: 'added',
            row: result.row
          });
        } else if (result.message.includes("Duplicate") || result.message.includes("already exists")) {
          results.skipped++;
          results.details.push({
            gameId: result.gameId,
            status: 'skipped',
            reason: result.message,
            row: result.row
          });
        } else {
          results.errors++;
          results.details.push({
            gameId: result.gameId,
            status: 'error',
            reason: result.message,
            row: result.row
          });
        }
      });

      // Small delay between batches
      if (i + batchSize < validGames.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return res.status(200).json({
      success: true,
      message: "Bulk upload completed",
      results
    });

  } catch (error) {
    console.error("Error in bulk upload:", error);
    return res.status(500).json({
      success: false,
      message: `Internal server error during bulk upload: ${error.message}`
    });
  }
});
// Enhanced single game add route with multiple categories support
// In your admin route file
admin_route.post("/games/add", async (req, res) => {
  try {
    const { gameName, providerName, gameId, categories, imageUrl, isFeatured } = req.body;

    if (!gameName || !providerName || !gameId || !categories || !Array.isArray(categories) || categories.length === 0 || !imageUrl) {
      return res.status(400).json({ success: false, message: "All fields are required, including at least one category" });
    }

    const newGame = new GameModel({
      gameName,
      providerName,
      gameId,
      categories,
      imageUrl,
      isFeatured
    });

    await newGame.save();
    res.status(201).json({ success: true, message: "Game added successfully", data: newGame });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Game with this ID already exists" });
    }
    res.status(500).json({ success: false, message: "Error adding game" });
  }
});

// Route to toggle featured status
admin_route.patch("/games/:id/featured", async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    // Validate required fields
    if (typeof isFeatured !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "isFeatured field is required and must be a boolean"
      });
    }

    // Find game by ID and update
    const game = await GameModel.findByIdAndUpdate(
      id,
      { 
        isFeatured: isFeatured,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Game ${isFeatured ? 'marked as featured' : 'removed from featured'} successfully`,
      game: game
    });
  } catch (error) {
    console.error("Error updating featured status:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid game ID format"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/games
// @desc    Get all games with optional filtering and pagination (Updated for multiple categories)
admin_route.get("/games", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const query = {};

    // Apply filters if provided
    if (category) {
      // Support both single category and comma-separated categories
      const categories = category.split(',').map(cat => cat.trim());
      query.categories = { $in: categories };
    }

    if (search) {
      query.$or = [
        { gameName: { $regex: search, $options: "i" } },
        { providerName: { $regex: search, $options: "i" } },
        { gameId: { $regex: search, $options: "i" } }
      ];
    }

    const games = await GameModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalGames = await GameModel.countDocuments(query);

    // Get all unique categories for filter options
    const allCategories = await GameModel.distinct("categories");

    res.status(200).json({
      success: true,
      data: games,
      total: totalGames,
      page: parseInt(page),
      pages: Math.ceil(totalGames / limit),
      allCategories: allCategories.sort()
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/games/:id
// @desc    Get single game by ID
admin_route.get("/games/:id", async (req, res) => {
  try {
    const game = await GameModel.findById(req.params.id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found"
      });
    }

    res.status(200).json({
      success: true,
      data: game
    });
  } catch (error) {
    console.error("Error fetching game:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   PUT /api/games/:id
// @desc    Update a game (Updated for multiple categories)
// admin_route.put("/games/:id", uploadGameImage.single("image"), async (req, res) => {
//   try {
//     const { gameName, providerName, gameId, categories } = req.body;
//     const gameIdToUpdate = req.params.id;

//     // Find the existing game
//     const existingGame = await GameModel.findById(gameIdToUpdate);
//     if (!existingGame) {
//       return res.status(404).json({
//         success: false,
//         message: "Game not found"
//       });
//     }

//     // Check if the new game ID conflicts with another game
//     if (gameId && gameId !== existingGame.gameId) {
//       const gameWithNewId = await GameModel.findOne({ gameId });
//       if (gameWithNewId) {
//         return res.status(400).json({
//           success: false,
//           message: "Another game already uses this Game ID"
//         });
//       }
//     }

//     // Parse categories if it's a JSON string
//     let parsedCategories = categories;
//     if (typeof categories === "string") {
//       try {
//         parsedCategories = JSON.parse(categories);
//       } catch (error) {
//         return res.status(400).json({
//           success: false,
//           message: "Invalid categories format: must be a valid JSON array"
//         });
//       }
//     }

//     // Validate categories if provided
//     if (parsedCategories && (!Array.isArray(parsedCategories) || parsedCategories.length === 0)) {
//       return res.status(400).json({
//         success: false,
//         message: "Categories must be a non-empty array"
//       });
//     }

//     // Update game fields
//     existingGame.gameName = gameName || existingGame.gameName;
//     existingGame.providerName = providerName || existingGame.providerName;
//     existingGame.gameId = gameId || existingGame.gameId;
//     existingGame.categories = parsedCategories
//       ? parsedCategories.map(cat => cat.trim())
//       : existingGame.categories;

//     // Update image if provided
//     if (req.file) {
//       // Delete the old image file
//       const oldImagePath = path.join(__dirname, "../public", existingGame.imageUrl);
//       if (fs.existsSync(oldImagePath)) {
//         fs.unlinkSync(oldImagePath);
//       }
//       existingGame.imageUrl = `/game-images/${req.file.filename}`;
//     }

//     await existingGame.save();

//     res.status(200).json({
//       success: true,
//       message: "Game updated successfully",
//       data: existingGame
//     });
//   } catch (error) {
//     console.error("Error updating game:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error"
//     });
//   }
// });

admin_route.put("/games/:id", uploadGameImage.single("image"), async (req, res) => {
  try {
    const { gameName, providerName, gameId, categories, imageUrl, isFeatured } = req.body;
    const gameIdToUpdate = req.params.id;

    // Find the existing game
    const existingGame = await GameModel.findById(gameIdToUpdate);
    if (!existingGame) {
      return res.status(404).json({
        success: false,
        message: "Game not found",
      });
    }

    // Check if the new game ID conflicts with another game
    if (gameId && gameId !== existingGame.gameId) {
      const gameWithNewId = await GameModel.findOne({ gameId });
      if (gameWithNewId) {
        return res.status(400).json({
          success: false,
          message: "Another game already uses this Game ID",
        });
      }
    }

    // Parse categories if it's a JSON string
    let parsedCategories = categories;
    if (typeof categories === "string") {
      try {
        parsedCategories = JSON.parse(categories);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid categories format: must be a valid JSON array",
        });
      }
    }

    // Validate categories if provided
    if (parsedCategories && (!Array.isArray(parsedCategories) || parsedCategories.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "Categories must be a non-empty array",
      });
    }

    // Update game fields
    existingGame.gameName = gameName || existingGame.gameName;
    existingGame.providerName = providerName || existingGame.providerName;
    existingGame.gameId = gameId || existingGame.gameId;
    existingGame.categories = parsedCategories
      ? parsedCategories.map((cat) => cat.trim())
      : existingGame.categories;
    existingGame.isFeatured = isFeatured === "true" || isFeatured === true || existingGame.isFeatured;

    // Update imageUrl: Prioritize file upload if present, otherwise use provided imageUrl
    if (req.file) {
      // Delete the old image file if it exists
      const oldImagePath = path.join(__dirname, "../public", existingGame.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      existingGame.imageUrl = `/game-images/${req.file.filename}`;
    } else if (imageUrl && imageUrl !== existingGame.imageUrl) {
      // Update with the provided imageUrl if no file is uploaded
      existingGame.imageUrl = imageUrl;
    }

    await existingGame.save();

    res.status(200).json({
      success: true,
      message: "Game updated successfully",
      data: existingGame,
    });
  } catch (error) {
    console.error("Error updating game:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
// @route   DELETE /api/games/:id
// @desc    Delete a game
admin_route.delete("/games/:id", async (req, res) => {
  try {
    const game = await GameModel.findByIdAndDelete(req.params.id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found"
      });
    }

    // Delete the associated image file
    const imagePath = path.join(__dirname, "../public", game.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.status(200).json({
      success: true,
      message: "Game deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting game:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   PUT /api/games/:id/status
// @desc    Toggle game active status
admin_route.put("/games/:id/status", async (req, res) => {
  try {
    const game = await GameModel.findById(req.params.id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found"
      });
    }

    game.isActive = !game.isActive;
    await game.save();

    res.status(200).json({
      success: true,
      message: `Game ${game.isActive ? "activated" : "deactivated"} successfully`,
      data: game
    });
  } catch (error) {
    console.error("Error toggling game status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   PUT /api/games/:id/feature
// @desc    Toggle game featured status
admin_route.put("/games/:id/feature", async (req, res) => {
  try {
    const game = await GameModel.findById(req.params.id);
    if (!game) {
      return res.status(404).json({
        success: false,
        message: "Game not found"
      });
    }

    game.isFeatured = !game.isFeatured;
    await game.save();

    res.status(200).json({
      success: true,
      message: `Game ${game.isFeatured ? "added to" : "removed from"} featured list`,
      data: game
    });
  } catch (error) {
    console.error("Error toggling featured status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   DELETE /api/games
// @desc    Delete all games
admin_route.delete("/games", async (req, res) => {
  try {
    // Delete all games from the database
    const deleteResult = await GameModel.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} games`,
      deletedCount: deleteResult.deletedCount
    });
  } catch (error) {
    console.error("Error deleting all games:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});
// @route   PATCH /api/games/bulk-categories
// @desc    Update categories for multiple games (NEW ROUTE)
admin_route.patch("/games/bulk-categories", async (req, res) => {
  try {
    const { gameIds, categories, action } = req.body; // action: 'add', 'replace', 'remove'

    // Validate required fields
    if (!gameIds || !categories || !action) {
      return res.status(400).json({
        success: false,
        message: "gameIds, categories, and action are required"
      });
    }

    if (!Array.isArray(gameIds) || gameIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "gameIds must be a non-empty array"
      });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "categories must be a non-empty array"
      });
    }

    const validActions = ['add', 'replace', 'remove'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "action must be one of: 'add', 'replace', 'remove'"
      });
    }

    let updateQuery;
    const trimmedCategories = categories.map(cat => cat.trim());

    switch (action) {
      case 'add':
        updateQuery = {
          $addToSet: { categories: { $each: trimmedCategories } }
        };
        break;
      case 'replace':
        updateQuery = {
          $set: { categories: trimmedCategories }
        };
        break;
      case 'remove':
        updateQuery = {
          $pull: { categories: { $in: trimmedCategories } }
        };
        break;
    }

    // Add validation to ensure at least one category remains when removing
    if (action === 'remove') {
      const games = await GameModel.find({ _id: { $in: gameIds } });
      for (const game of games) {
        const remainingCategories = game.categories.filter(
          cat => !trimmedCategories.includes(cat)
        );
        if (remainingCategories.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Cannot remove all categories from game: ${game.gameName}`
          });
        }
      }
    }

    const result = await GameModel.updateMany(
      { _id: { $in: gameIds } },
      updateQuery
    );

    res.status(200).json({
      success: true,
      message: `Categories ${action}ed successfully for ${result.modifiedCount} games`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating bulk categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/games/categories/list
// @desc    Get all unique categories (NEW ROUTE)
admin_route.get("/games/categories/list", async (req, res) => {
  try {
    const categories = await GameModel.distinct("categories");
    
    res.status(200).json({
      success: true,
      data: categories.sort()
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   PATCH /api/games/:id/categories
// @desc    Update categories for a single game (NEW ROUTE)
admin_route.patch("/games/:id/categories", async (req, res) => {
  try {
    const { id } = req.params;
    const { categories, action } = req.body;

    // Validate required fields
    if (!categories || !action) {
      return res.status(400).json({
        success: false,
        message: "categories and action are required"
      });
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "categories must be a non-empty array"
      });
    }

    const validActions = ['add', 'replace', 'remove'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "action must be one of: 'add', 'replace', 'remove'"
      });
    }

    // Find the existing game
    const existingGame = await GameModel.findById(id);
    if (!existingGame) {
      return res.status(404).json({
        success: false,
        message: "Game not found"
      });
    }

    const trimmedCategories = categories.map(cat => cat.trim());
    let updatedCategories;

    switch (action) {
      case 'add':
        // Add new categories without duplicates
        updatedCategories = [...new Set([...existingGame.categories, ...trimmedCategories])];
        break;
      case 'replace':
        updatedCategories = trimmedCategories;
        break;
      case 'remove':
        updatedCategories = existingGame.categories.filter(
          cat => !trimmedCategories.includes(cat)
        );
        // Ensure at least one category remains
        if (updatedCategories.length === 0) {
          return res.status(400).json({
            success: false,
            message: "Cannot remove all categories from the game"
          });
        }
        break;
    }

    existingGame.categories = updatedCategories;
    await existingGame.save();

    res.status(200).json({
      success: true,
      message: `Categories ${action}ed successfully`,
      data: existingGame
    });
  } catch (error) {
    console.error("Error updating game categories:", error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: "Invalid game ID format"
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Helper function to validate game ID (UUID format)
function isValidGameId(gameId) {
  if (!gameId || typeof gameId !== 'string') return false;
  
  // Basic UUID format validation (can be customized based on your requirements)
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const shortIdRegex = /^[a-zA-Z0-9_-]{3,50}$/; // Alternative format
  
  return uuidRegex.test(gameId.trim()) || shortIdRegex.test(gameId.trim());
}

// Migration route to convert existing games to multiple categories
admin_route.post("/games/migrate-categories", async (req, res) => {
  try {
    console.log("Starting category migration...");
    
    // Get all games that still have single category (for backward compatibility)
    const games = await GameModel.find({
      $or: [
        { categories: { $exists: false } },
        { categories: { $size: 0 } },
        { category: { $exists: true } } // If old single category field exists
      ]
    });
    
    console.log(`Found ${games.length} games to migrate`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    
    // Update each game to convert category string to categories array
    for (const game of games) {
      // If categories field doesn't exist or is empty, but category exists
      if (game.category && (!game.categories || game.categories.length === 0)) {
        game.categories = [game.category];
        await game.save();
        updatedCount++;
      } else if (game.categories && game.categories.length > 0) {
        // Already has categories, skip
        skippedCount++;
      } else {
        // No categories found, set default
        game.categories = ["Uncategorized"];
        await game.save();
        updatedCount++;
      }
    }
    
    console.log(`Migration completed! Updated ${updatedCount} games, skipped ${skippedCount} games`);
    
    res.status(200).json({
      success: true,
      message: `Category migration completed! Updated ${updatedCount} games, skipped ${skippedCount} games`,
      updatedCount,
      skippedCount
    });
    
  } catch (error) {
    console.error("Migration failed:", error);
    res.status(500).json({
      success: false,
      message: "Migration failed: " + error.message
    });
  }
});

// @route   GET /api/games/categories
// @desc    Get all game categories
admin_route.get("/games/categories", async (req, res) => {
  try {
    const categories = [
      'Fisher Poker Slot',
      'Hot Live Sports',
      'Lottery',
      'Slots',
      'Table Games',
      'Live Casino',
      'Video Poker',
      'Scratch Cards',
      'Other'
    ];
    
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


// ---------------------------category-route------------------------
// Add this near the top with other model imports
const CategoryModel = require("../Models/CategoryModel");
const Categorymodel = require("../Models/CategoryModel");

// Configure multer for category image uploads (add this with your other multer configurations)
const categoryImageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function(req, file, cb) {
    cb(null, `category-${Date.now()}-${file.originalname}`);
  }
});

const uploadCategoryImage = multer({ 
  storage: categoryImageStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Only JPEG, JPG, PNG, or WebP images are allowed!"));
    }
  }
});

// ------------------- CATEGORY ROUTES -------------------

// @route   POST /api/categories
// @desc    Create a new category
admin_route.post("/categories", 
  ensureadminAuthenticated,
  uploadCategoryImage.single("image"), 
  async (req, res) => {
    try {
      const { name } = req.body;

      // Validate input
      if (!name || !req.file) {
        return res.status(400).json({
          success: false,
          message: "Category name and image are required"
        });
      }

      // Check if category already exists
      const existingCategory = await CategoryModel.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists"
        });
      }

      // Create new category
      const newCategory = new CategoryModel({
        name,
        imageUrl: `/images/${req.file.filename}`
      });

      await newCategory.save();

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: newCategory
      });
    } catch (error) {
      console.error("Error creating category:", error);
      
      // Delete uploaded file if there was an error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: error.message || "Internal server error"
      });
    }
  }
);

// @route   GET /api/categories
// @desc    Get all categories
admin_route.get("/categories", async (req, res) => {
  try {
    const { activeOnly, search } = req.query;
    const query = {};

    if (activeOnly === 'true') {
      query.isActive = true;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const categories = await CategoryModel.find(query).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category by ID
admin_route.get("/categories/:id", async (req, res) => {
  try {
    const category = await CategoryModel.findById(req.params.id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update a category
admin_route.put("/categories/:id", 
  ensureadminAuthenticated,
  uploadCategoryImage.single("image"), 
  async (req, res) => {
    try {
      const { name, isActive } = req.body;
      const categoryId = req.params.id;

      // Find the existing category
      const category = await CategoryModel.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      // Check if name is being updated and if it conflicts with another category
      if (name && name !== category.name) {
        const existingCategory = await CategoryModel.findOne({ name });
        if (existingCategory) {
          return res.status(400).json({
            success: false,
            message: "Category with this name already exists"
          });
        }
        category.name = name;
      }

      // Update image if provided
      if (req.file) {
        // Delete the old image file
        const oldImagePath = path.join(__dirname, "../public", category.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
        category.imageUrl = `/images/categories/${req.file.filename}`;
      }

      // Update isActive if provided
      if (isActive !== undefined) {
        category.isActive = isActive;
      }

      await category.save();

      res.status(200).json({
        success: true,
        message: "Category updated successfully",
        data: category
      });
    } catch (error) {
      console.error("Error updating category:", error);
      
      // Delete uploaded file if there was an error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);

// @route   DELETE /api/categories/:id
// @desc    Delete a category
admin_route.delete("/categories/:id", 
  ensureadminAuthenticated,
  async (req, res) => {
    try {
      const category = await CategoryModel.findByIdAndDelete(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      // Delete the associated image file
      const imagePath = path.join(__dirname, "../public", category.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      res.status(200).json({
        success: true,
        message: "Category deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);

// @route   PUT /api/categories/:id/status
// @desc    Toggle category active status
admin_route.put("/categories/:id/status", 
  ensureadminAuthenticated,
  async (req, res) => {
    try {
      const category = await Categorymodel.findById(req.params.id);
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found"
        });
      }

      category.isActive = !category.isActive;
      await category.save();

      res.status(200).json({
        success: true,
        message: `Category ${category.isActive ? "activated" : "deactivated"} successfully`,
        data: category
      });
    } catch (error) {
      console.error("Error toggling category status:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  }
);

const LoginHistoryModel = require("../Models/LoginHistoryModel");
const GameHistory = require("../Models/Gameslogs");

// Add this with your other model imports at the top

// ------------------- LOGIN HISTORY ROUTES -------------------

// @route   GET /api/admin/login-history
// @desc    Get all login history with filters
admin_route.get("/login-history", async (req, res) => {
  try {
   
 const history2=await LoginHistoryModel.find();

    res.status(200).json({
      success: true,
      data: history2
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/login-history/:userId
// @desc    Get login history for a specific user
admin_route.get("/login-history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10 } = req.query;

    const history = await LoginHistoryModel.find({ userId })
      .sort({ loginAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("Error fetching user login history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   DELETE /api/admin/login-history/:id
// @desc    Delete a specific login history record
admin_route.delete("/login-history/:id", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await LoginHistoryModel.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: "Login history record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Login history record deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting login history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   DELETE /api/admin/login-history/user/:userId
// @desc    Delete all login history for a specific user
admin_route.delete("/login-history/user/:userId", ensureadminAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await LoginHistoryModel.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} login history records for user ${userId}`
    });
  } catch (error) {
    console.error("Error deleting user login history:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/game-logs
// @desc    Get all game logs history with filtering and pagination
admin_route.get("/game-logs", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            player_id,
            game_uuid,
            session_id,
            transaction_id,
            action,
            type,
            status,
            startDate,
            endDate,
            search
        } = req.query;

        // Build query
        const query = {};

        // Add filters if provided
        if (player_id) {
            query.player_id = player_id;
        }

        if (game_uuid) {
            query.game_uuid = game_uuid;
        }

        if (session_id) {
            query.session_id = session_id;
        }

        if (transaction_id) {
            query.transaction_id = transaction_id;
        }

        if (action && action !== 'all') {
            query.action = action;
        }

        if (type && type !== 'all') {
            query.type = type;
        }

        if (status && status !== 'all') {
            query.status = status;
        }

        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        // Search filter (across multiple fields)
        if (search) {
            query.$or = [
                { player_id: { $regex: search, $options: 'i' } },
                { game_uuid: { $regex: search, $options: 'i' } },
                { session_id: { $regex: search, $options: 'i' } },
                { transaction_id: { $regex: search, $options: 'i' } },
                { merchant_id: { $regex: search, $options: 'i' } }
            ];
        }

        // Get paginated game logs
        const gameLogs = await GameHistory.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        // Get total count for pagination
        const total = await GameHistory.countDocuments(query);

        // Calculate summary statistics
        const summary = await GameHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalBets: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "bet"] }, "$amount", 0]
                        }
                    },
                    totalWins: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "win"] }, "$amount", 0]
                        }
                    },
                    totalRefunds: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "refund"] }, "$amount", 0]
                        }
                    },
                    betCount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "bet"] }, 1, 0]
                        }
                    },
                    winCount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "win"] }, 1, 0]
                        }
                    },
                    refundCount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "refund"] }, 1, 0]
                        }
                    },
                    uniquePlayers: { $addToSet: "$player_id" },
                    uniqueGames: { $addToSet: "$game_uuid" },
                    uniqueSessions: { $addToSet: "$session_id" }
                }
            },
            {
                $project: {
                    totalBets: 1,
                    totalWins: 1,
                    totalRefunds: 1,
                    betCount: 1,
                    winCount: 1,
                    refundCount: 1,
                    uniquePlayerCount: { $size: "$uniquePlayers" },
                    uniqueGameCount: { $size: "$uniqueGames" },
                    uniqueSessionCount: { $size: "$uniqueSessions" },
                    netProfit: { $subtract: ["$totalWins", "$totalBets"] },
                    winRate: {
                        $cond: [
                            { $gt: ["$betCount", 0] },
                            { $multiply: [{ $divide: ["$winCount", "$betCount"] }, 100] },
                            0
                        ]
                    }
                }
            }
        ]);

        // Get action type counts for pie chart
        const actionCounts = await GameHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        // Get status counts
        const statusCounts = await GameHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get daily activity for chart
        const dailyActivity = await GameHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    betCount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "bet"] }, 1, 0]
                        }
                    },
                    winCount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "win"] }, 1, 0]
                        }
                    },
                    betAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "bet"] }, "$amount", 0]
                        }
                    },
                    winAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "win"] }, "$amount", 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                logs: gameLogs,
                summary: summary[0] || {
                    totalBets: 0,
                    totalWins: 0,
                    totalRefunds: 0,
                    betCount: 0,
                    winCount: 0,
                    refundCount: 0,
                    uniquePlayerCount: 0,
                    uniqueGameCount: 0,
                    uniqueSessionCount: 0,
                    netProfit: 0,
                    winRate: 0
                },
                analytics: {
                    actionCounts,
                    statusCounts,
                    dailyActivity
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                },
                filters: {
                    player_id,
                    game_uuid,
                    session_id,
                    action,
                    type,
                    status,
                    startDate,
                    endDate,
                    search
                }
            }
        });

    } catch (error) {
        console.error("Error fetching game logs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch game logs"
        });
    }
});

// @route   GET /api/admin/game-logs/:id
// @desc    Get single game log by ID
admin_route.get("/game-logs/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const gameLog = await GameHistory.findById(id);

        if (!gameLog) {
            return res.status(404).json({
                success: false,
                message: "Game log not found"
            });
        }

        res.status(200).json({
            success: true,
            data: gameLog
        });

    } catch (error) {
        console.error("Error fetching game log:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch game log"
        });
    }
});

// @route   GET /api/admin/game-logs/player/:player_id
// @desc    Get game logs for a specific player
admin_route.get("/game-logs/player/:player_id", async (req, res) => {
    try {
        const { player_id } = req.params;
        const { 
            page = 1, 
            limit = 50,
            action,
            startDate,
            endDate 
        } = req.query;

        const query = { player_id };

        // Add filters if provided
        if (action && action !== 'all') {
            query.action = action;
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                query.createdAt.$lte = new Date(endDate);
            }
        }

        const gameLogs = await GameHistory.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await GameHistory.countDocuments(query);

        // Calculate player summary
        const playerSummary = await GameHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$player_id",
                    totalBets: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "bet"] }, "$amount", 0]
                        }
                    },
                    totalWins: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "win"] }, "$amount", 0]
                        }
                    },
                    betCount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "bet"] }, 1, 0]
                        }
                    },
                    winCount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "win"] }, 1, 0]
                        }
                    },
                    firstActivity: { $min: "$createdAt" },
                    lastActivity: { $max: "$createdAt" },
                    uniqueGames: { $addToSet: "$game_uuid" }
                }
            },
            {
                $project: {
                    player_id: "$_id",
                    totalBets: 1,
                    totalWins: 1,
                    betCount: 1,
                    winCount: 1,
                    netProfit: { $subtract: ["$totalWins", "$totalBets"] },
                    winRate: {
                        $cond: [
                            { $gt: ["$betCount", 0] },
                            { $multiply: [{ $divide: ["$winCount", "$betCount"] }, 100] },
                            0
                        ]
                    },
                    firstActivity: 1,
                    lastActivity: 1,
                    uniqueGameCount: { $size: "$uniqueGames" }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                logs: gameLogs,
                summary: playerSummary[0] || {
                    player_id,
                    totalBets: 0,
                    totalWins: 0,
                    betCount: 0,
                    winCount: 0,
                    netProfit: 0,
                    winRate: 0,
                    uniqueGameCount: 0
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error("Error fetching player game logs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch player game logs"
        });
    }
});

// @route   GET /api/admin/game-logs/game/:game_uuid
// @desc    Get game logs for a specific game
admin_route.get("/game-logs/game/:game_uuid", async (req, res) => {
    try {
        const { game_uuid } = req.params;
        const { 
            page = 1, 
            limit = 50,
            action 
        } = req.query;

        const query = { game_uuid };

        if (action && action !== 'all') {
            query.action = action;
        }

        const gameLogs = await GameHistory.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .lean();

        const total = await GameHistory.countDocuments(query);

        // Calculate game summary
        const gameSummary = await GameHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$game_uuid",
                    totalBets: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "bet"] }, "$amount", 0]
                        }
                    },
                    totalWins: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "win"] }, "$amount", 0]
                        }
                    },
                    betCount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "bet"] }, 1, 0]
                        }
                    },
                    winCount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "win"] }, 1, 0]
                        }
                    },
                    uniquePlayers: { $addToSet: "$player_id" },
                    firstActivity: { $min: "$createdAt" },
                    lastActivity: { $max: "$createdAt" }
                }
            },
            {
                $project: {
                    game_uuid: "$_id",
                    totalBets: 1,
                    totalWins: 1,
                    betCount: 1,
                    winCount: 1,
                    netProfit: { $subtract: ["$totalWins", "$totalBets"] },
                    winRate: {
                        $cond: [
                            { $gt: ["$betCount", 0] },
                            { $multiply: [{ $divide: ["$winCount", "$betCount"] }, 100] },
                            0
                        ]
                    },
                    uniquePlayerCount: { $size: "$uniquePlayers" },
                    firstActivity: 1,
                    lastActivity: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                logs: gameLogs,
                summary: gameSummary[0] || {
                    game_uuid,
                    totalBets: 0,
                    totalWins: 0,
                    betCount: 0,
                    winCount: 0,
                    netProfit: 0,
                    winRate: 0,
                    uniquePlayerCount: 0
                },
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error("Error fetching game logs:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch game logs"
        });
    }
});

// @route   DELETE /api/admin/game-logs/:id
// @desc    Delete a specific game log
admin_route.delete("/game-logs/:id", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedLog = await GameHistory.findByIdAndDelete(id);

        if (!deletedLog) {
            return res.status(404).json({
                success: false,
                message: "Game log not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Game log deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting game log:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete game log"
        });
    }
});

// @route   GET /api/admin/game-logs-stats
// @desc    Get statistics for game logs dashboard
admin_route.get("/game-logs-stats", async (req, res) => {
    try {
        const { days = 30 } = req.query;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(days));

        // Total counts
        const totalLogs = await GameHistory.countDocuments();
        const totalPlayers = await GameHistory.distinct("player_id").then(ids => ids.length);
        const totalGames = await GameHistory.distinct("game_uuid").then(ids => ids.length);

        // Recent activity (last 24 hours)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const recentLogs = await GameHistory.countDocuments({
            createdAt: { $gte: yesterday }
        });

        // Status distribution
        const statusDistribution = await GameHistory.aggregate([
            {
                $group: {
                    _id: "$status",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Action type distribution
        const actionDistribution = await GameHistory.aggregate([
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);

        // Daily activity for chart
        const dailyActivity = await GameHistory.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt"
                        }
                    },
                    count: { $sum: 1 },
                    betAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "bet"] }, "$amount", 0]
                        }
                    },
                    winAmount: {
                        $sum: {
                            $cond: [{ $eq: ["$action", "win"] }, "$amount", 0]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totals: {
                    logs: totalLogs,
                    players: totalPlayers,
                    games: totalGames,
                    recent: recentLogs
                },
                distributions: {
                    status: statusDistribution,
                    action: actionDistribution
                },
                dailyActivity,
                timeRange: {
                    days: parseInt(days),
                    startDate,
                    endDate: new Date()
                }
            }
        });

    } catch (error) {
        console.error("Error fetching game logs stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch game logs statistics"
        });
    }
});

// ======================== SECURITY ROUTES ========================
// Don't forget to import the models at the top of your file:
const LoginLog = require("../Models/LoginLog");
const IPWhitelist = require("../Models/IPWhitelist");
const SecuritySettings = require("../Models/SecuritySettings");
const FailedLogin = require("../Models/FailedLogin");
const Device = require("../Models/Device");
const GameSession = require("../Models/GameSession");
const SpinWheelHistory = require("../Models/SpinWheelHistory");
const Support = require("../Models/Supportmodel");
const Bonus = require("../Models/Bonus");
const User = require("../Models/User");
const AutoPaymentMethod = require("../Models/AutoPaymentMethod");
// @route   GET /api/admin/security/login-logs
// @desc    Get all login logs with filtering and pagination
admin_route.get("/security/login-logs", ensureadminAuthenticated, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      username,
      ipAddress,
      deviceType,
      status,
      startDate,
      endDate,
      search
    } = req.query;

    // Build query
    const query = {};

    if (userId) query.userId = userId;
    if (username) query.username = { $regex: username, $options: 'i' };
    if (ipAddress) query.ipAddress = ipAddress;
    if (deviceType && deviceType !== 'all') query.deviceType = deviceType;
    if (status && status !== 'all') query.status = status;

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Search across multiple fields
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { browser: { $regex: search, $options: 'i' } },
        { os: { $regex: search, $options: 'i' } },
        { 'location.country': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    const loginLogs = await LoginLog.find(query)
      .populate('userId', 'username email player_id')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await LoginLog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: loginLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching login logs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/security/login-logs/:userId
// @desc    Get login logs for a specific user
admin_route.get("/security/login-logs/:userId", ensureadminAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20 } = req.query;

    const loginLogs = await LoginLog.find({ userId })
      .populate('userId', 'username email player_id')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: loginLogs
    });
  } catch (error) {
    console.error("Error fetching user login logs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/security/ip-whitelist
// @desc    Get all IP whitelist entries
admin_route.get("/security/ip-whitelist", ensureadminAuthenticated, async (req, res) => {
  try {
    const { page = 1, limit = 50, search, isActive } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { ipAddress: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const ipWhitelist = await IPWhitelist.find(query)
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await IPWhitelist.countDocuments(query);

    res.status(200).json({
      success: true,
      data: ipWhitelist,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching IP whitelist:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   POST /api/admin/security/ip-whitelist
// @desc    Add a new IP to whitelist
admin_route.post("/security/ip-whitelist", ensureadminAuthenticated, async (req, res) => {
  try {
    const { ipAddress, description } = req.body;

    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(ipAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid IP address format"
      });
    }

    // Check if IP already exists
    const existingIP = await IPWhitelist.findOne({ ipAddress });
    if (existingIP) {
      return res.status(400).json({
        success: false,
        message: "IP address already exists in whitelist"
      });
    }

    const newIP = new IPWhitelist({
      ipAddress,
      description
    });

    await newIP.save();
    await newIP.populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: "IP added to whitelist successfully",
      data: newIP
    });
  } catch (error) {
    console.error("Error adding IP to whitelist:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   PUT /api/admin/security/ip-whitelist/:id
// @desc    Update IP whitelist entry
admin_route.put("/security/ip-whitelist/:id", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, isActive } = req.body;

    const updatedIP = await IPWhitelist.findByIdAndUpdate(
      id,
      { description, isActive },
      { new: true, runValidators: true }
    ).populate('createdBy', 'username email');

    if (!updatedIP) {
      return res.status(404).json({
        success: false,
        message: "IP whitelist entry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "IP whitelist updated successfully",
      data: updatedIP
    });
  } catch (error) {
    console.error("Error updating IP whitelist:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   DELETE /api/admin/security/ip-whitelist/:id
// @desc    Remove IP from whitelist
admin_route.delete("/security/ip-whitelist/:id", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedIP = await IPWhitelist.findByIdAndDelete(id);

    if (!deletedIP) {
      return res.status(404).json({
        success: false,
        message: "IP whitelist entry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "IP removed from whitelist successfully"
    });
  } catch (error) {
    console.error("Error removing IP from whitelist:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/security/settings/:userId
// @desc    Get security settings for a user
admin_route.get("/security/settings/:userId", ensureadminAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    let securitySettings = await SecuritySettings.findOne({ userId })
      .populate('userId', 'username email player_id');

    // If no settings exist, create default ones
    if (!securitySettings) {
      securitySettings = new SecuritySettings({ userId });
      await securitySettings.save();
      await securitySettings.populate('userId', 'username email player_id');
    }

    res.status(200).json({
      success: true,
      data: securitySettings
    });
  } catch (error) {
    console.error("Error fetching security settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   PUT /api/admin/security/settings/:userId
// @desc    Update security settings for a user
admin_route.put("/security/settings/:userId", ensureadminAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated
    delete updates.userId;
    delete updates._id;

    const securitySettings = await SecuritySettings.findOneAndUpdate(
      { userId },
      updates,
      { new: true, runValidators: true, upsert: true }
    ).populate('userId', 'username email player_id');

    res.status(200).json({
      success: true,
      message: "Security settings updated successfully",
      data: securitySettings
    });
  } catch (error) {
    console.error("Error updating security settings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/security/failed-logins
// @desc    Get failed login attempts with filtering
admin_route.get("/security/failed-logins", ensureadminAuthenticated, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      username,
      ipAddress,
      isLocked,
      startDate,
      endDate,
      search
    } = req.query;

    const query = {};

    if (username) query.username = { $regex: username, $options: 'i' };
    if (ipAddress) query.ipAddress = ipAddress;
    if (isLocked !== undefined) query.isLocked = isLocked === 'true';

    // Date range filter
    if (startDate || endDate) {
      query.lastAttempt = {};
      if (startDate) query.lastAttempt.$gte = new Date(startDate);
      if (endDate) query.lastAttempt.$lte = new Date(endDate);
    }

    // Search across multiple fields
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { ipAddress: { $regex: search, $options: 'i' } },
        { userAgent: { $regex: search, $options: 'i' } }
      ];
    }

    const failedLogins = await FailedLogin.find(query)
      .sort({ lastAttempt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await FailedLogin.countDocuments(query);

    res.status(200).json({
      success: true,
      data: failedLogins,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching failed login attempts:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   DELETE /api/admin/security/failed-logins/:id
// @desc    Clear a failed login attempt record
admin_route.delete("/security/failed-logins/:id", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRecord = await FailedLogin.findByIdAndDelete(id);

    if (!deletedRecord) {
      return res.status(404).json({
        success: false,
        message: "Failed login record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Failed login record cleared successfully"
    });
  } catch (error) {
    console.error("Error clearing failed login record:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   PUT /api/admin/security/failed-logins/:id/unlock
// @desc    Unlock a locked account/IP
admin_route.put("/security/failed-logins/:id/unlock", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRecord = await FailedLogin.findByIdAndUpdate(
      id,
      {
        isLocked: false,
        lockedUntil: null,
        attemptCount: 0
      },
      { new: true }
    );

    if (!updatedRecord) {
      return res.status(404).json({
        success: false,
        message: "Failed login record not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Account/IP unlocked successfully",
      data: updatedRecord
    });
  } catch (error) {
    console.error("Error unlocking account:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/security/devices/:userId
// @desc    Get trusted devices for a user
admin_route.get("/security/devices/:userId", ensureadminAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    const { isTrusted, limit = 20 } = req.query;

    const query = { userId };
    if (isTrusted !== undefined) {
      query.isTrusted = isTrusted === 'true';
    }

    const devices = await Device.find(query)
      .sort({ lastUsed: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: devices
    });
  } catch (error) {
    console.error("Error fetching user devices:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   PUT /api/admin/security/devices/:deviceId/trust
// @desc    Toggle device trusted status
admin_route.put("/security/devices/:deviceId/trust", ensureadminAuthenticated, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { isTrusted } = req.body;

    const device = await Device.findByIdAndUpdate(
      deviceId,
      { isTrusted },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    res.status(200).json({
      success: true,
      message: `Device ${isTrusted ? 'trusted' : 'untrusted'} successfully`,
      data: device
    });
  } catch (error) {
    console.error("Error updating device trust status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   DELETE /api/admin/security/devices/:deviceId
// @desc    Remove a device
admin_route.delete("/security/devices/:deviceId", ensureadminAuthenticated, async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await Device.findByIdAndDelete(deviceId);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Device removed successfully"
    });
  } catch (error) {
    console.error("Error removing device:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   GET /api/admin/security/stats
// @desc    Get security statistics
admin_route.get("/security/stats", ensureadminAuthenticated, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalLoginAttempts,
      successfulLogins,
      failedLogins,
      todayLoginAttempts,
      todaySuccessfulLogins,
      todayFailedLogins,
      lockedAccounts,
      whitelistedIPs,
      trustedDevices
    ] = await Promise.all([
      LoginLog.countDocuments(),
      LoginLog.countDocuments({ status: 'success' }),
      LoginLog.countDocuments({ status: 'failed' }),
      LoginLog.countDocuments({ timestamp: { $gte: today } }),
      LoginLog.countDocuments({ status: 'success', timestamp: { $gte: today } }),
      LoginLog.countDocuments({ status: 'failed', timestamp: { $gte: today } }),
      FailedLogin.countDocuments({ isLocked: true }),
      IPWhitelist.countDocuments({ isActive: true }),
      Device.countDocuments({ isTrusted: true })
    ]);

    // Get login attempts by hour for the last 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const loginAttemptsByHour = await LoginLog.aggregate([
      {
        $match: {
          timestamp: { $gte: twentyFourHoursAgo }
        }
      },
      {
        $group: {
          _id: {
            hour: { $hour: "$timestamp" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.hour": 1 }
      }
    ]);

    // Get failed login reasons
    const failedReasons = await LoginLog.aggregate([
      {
        $match: {
          status: 'failed',
          failureReason: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: "$failureReason",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          loginAttempts: totalLoginAttempts,
          successfulLogins,
          failedLogins,
          lockedAccounts,
          whitelistedIPs,
          trustedDevices
        },
        today: {
          loginAttempts: todayLoginAttempts,
          successfulLogins: todaySuccessfulLogins,
          failedLogins: todayFailedLogins
        },
        analytics: {
          loginAttemptsByHour,
          failedReasons
        }
      }
    });
  } catch (error) {
    console.error("Error fetching security statistics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   POST /api/admin/security/force-password-change/:userId
// @desc    Force a user to change password on next login
admin_route.post("/security/force-password-change/:userId", ensureadminAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    // Update user's last password change date to force password change
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { 
        lastPasswordChange: new Date('2000-01-01'), // Set to very old date to force change
        passwordChangeRequired: true
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "User will be required to change password on next login"
    });
  } catch (error) {
    console.error("Error forcing password change:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// @route   POST /api/admin/security/block-ip
// @desc    Block an IP address manually
admin_route.post("/security/block-ip", ensureadminAuthenticated, async (req, res) => {
  try {
    const { ipAddress, reason } = req.body;

    // Create a failed login record with locked status
    const blockedIP = new FailedLogin({
      ipAddress,
      username: 'admin_blocked',
      isLocked: true,
      lockedUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Block for 1 year
      failureReasons: [{
        reason: `Manually blocked by admin: ${reason}`,
        timestamp: new Date()
      }]
    });

    await blockedIP.save();

    res.status(200).json({
      success: true,
      message: "IP address blocked successfully"
    });
  } catch (error) {
    console.error("Error blocking IP address:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

admin_route.put("/users/:id/transaction-password", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionPassword } = req.body;

    // Validate input
    if (!transactionPassword) {
      return res.status(400).json({
        success: false,
        message: "Transaction password is required"
      });
    }

    if (transactionPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Transaction password must be at least 4 characters long"
      });
    }

    // Find the user
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    console.log(req.body)
    // Hash the transaction password using bcryptjs
  const salt = await bcrypt.genSalt(10);
  const hashedTransactionPassword = await bcrypt.hash(transactionPassword, salt);

    // Update transaction password directly (bypassing pre-save hook)
    user.transactionPassword = hashedTransactionPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Transaction password updated successfully",
      data: {
        id: user._id,
        username: user.username,
        player_id: user.player_id,
        transactionPasswordUpdated: true
      }
    });

  } catch (error) {
    console.error("Error updating transaction password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// --------------spin-history-------------------
admin_route.get("/spin-history",async(req,res)=>{
  try {
    const spinhistory=await SpinWheelHistory.find();
    res.send({success:true.valueOf,data:spinhistory});
  } catch (error) {
    console.log(error);
  }
})
// --------------spin-history-------------------
admin_route.get("/spin-history/:id",async(req,res)=>{
  try {
    const spinhistory=await SpinWheelHistory.find({userId:req.params.id});
    res.send({success:true.valueOf,data:spinhistory});
  } catch (error) {
    console.log(error);
  }
})
// ======================== SIMPLE USER RATING ========================

// @route   POST /api/admin/users/:id/rate
// @desc    Set user rating
admin_route.post("/users/:id/rate", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;

        if (rating < 0 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: "Rating must be between 0 and 5"
            });
        }

        const user = await UserModel.findByIdAndUpdate(
            id,
            { rating: parseFloat(rating) },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Rating set to ${rating} for ${user.username}`,
            data: {
                rating: user.rating,
                username: user.username
            }
        });

    } catch (error) {
        console.error("Error setting rating:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// ======================== SIMPLE USER NOTES ========================

// @route   POST /api/admin/users/:id/notes
// @desc    Add note to user
admin_route.post("/users/:id/notes", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { note } = req.body;

        if (!note) {
            return res.status(400).json({
                success: false,
                message: "Note content is required"
            });
        }

        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.notes.push({
            note,
            createdBy:"Admin"
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "Note added successfully",
            data: {
                note: user.notes[user.notes.length - 1],
                totalNotes: user.notes.length
            }
        });

    } catch (error) {
        console.error("Error adding note:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/admin/users/:id/notes
// @desc    Get user notes
admin_route.get("/users/:id/notes", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        const user = await UserModel.findById(id).select('notes username');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: {
                username: user.username,
                notes: user.notes,
                totalNotes: user.notes.length
            }
        });

    } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   DELETE /api/admin/users/:id/notes/:noteId
// @desc    Delete user note
admin_route.delete("/users/:id/notes/:noteId", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id, noteId } = req.params;

        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Find and remove the note
        const noteIndex = user.notes.findIndex(note => note._id.toString() === noteId);
        if (noteIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        user.notes.splice(noteIndex, 1);
        await user.save();

        res.status(200).json({
            success: true,
            message: "Note deleted successfully",
            data: {
                totalNotes: user.notes.length
            }
        });

    } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

// @route   GET /api/admin/users-with-ratings
// @desc    Get all users with their ratings
admin_route.get("/users-with-ratings", ensureadminAuthenticated, async (req, res) => {
    try {
        const users = await UserModel.find()
            .select('username email player_id rating notes status createdAt')
            .sort({ rating: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            data: users,
            count: users.length
        });

    } catch (error) {
        console.error("Error fetching users with ratings:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// ======================== SUPPORT CRUD ROUTES ========================

// Import the Support model at the top with other imports
// const Support = require("../Models/Support"); // Add this line

// @route   POST /api/admin/create-support
// @desc    Create a new support account
admin_route.post("/create-support", ensureadminAuthenticated, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if support with email already exists
        const existingSupport = await Support.findOne({ email });
        if (existingSupport) {
            return res.status(409).json({
                success: false,
                message: "Support account with this email already exists"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new support account
        const newSupport = new Support({
            name,
            email,
            password: hashedPassword,
            is_admin: true,
            status: 'active'
        });

        await newSupport.save();

        // Remove password from response
        const supportData = newSupport.toObject();
        delete supportData.password;

        res.status(201).json({
            success: true,
            message: "Support account created successfully",
            data: supportData
        });

    } catch (error) {
        console.error("Error creating support account:", error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// @route   GET /api/admin/all-supports
// @desc    Get all support accounts
admin_route.get("/all-supports", ensureadminAuthenticated, async (req, res) => {
    try {
        const supports = await Support.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: supports.length,
            data: supports
        });

    } catch (error) {
        console.error("Error fetching support accounts:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// @route   GET /api/admin/support/:id
// @desc    Get single support account by ID
admin_route.get("/support/:id", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        const support = await Support.findById(id).select('-password');

        if (!support) {
            return res.status(404).json({
                success: false,
                message: "Support account not found"
            });
        }

        res.status(200).json({
            success: true,
            data: support
        });

    } catch (error) {
        console.error("Error fetching support account:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid support ID format"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// @route   PUT /api/admin/support/:id
// @desc    Update support account details
admin_route.put("/support/:id", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, status } = req.body;

        // Check if support exists
        const support = await Support.findById(id);
        if (!support) {
            return res.status(404).json({
                success: false,
                message: "Support account not found"
            });
        }

        // Check if email is being updated and if it conflicts
        if (email && email !== support.email) {
            const existingSupport = await Support.findOne({ email });
            if (existingSupport) {
                return res.status(409).json({
                    success: false,
                    message: "Email already in use by another support account"
                });
            }
        }

        // Update fields
        if (name) support.name = name;
        if (email) support.email = email;
        if (status && ['active', 'inactive'].includes(status)) {
            support.status = status;
        }

        await support.save();

        // Remove password from response
        const supportData = support.toObject();
        delete supportData.password;

        res.status(200).json({
            success: true,
            message: "Support account updated successfully",
            data: supportData
        });

    } catch (error) {
        console.error("Error updating support account:", error);
        
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid support ID format"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// @route   PUT /api/admin/support/:id/password
// @desc    Update support account password
admin_route.put("/support/:id/password", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        // Validate new password
        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password is required"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Check if support exists
        const support = await Support.findById(id);
        if (!support) {
            return res.status(404).json({
                success: false,
                message: "Support account not found"
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        support.password = hashedPassword;
        await support.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Error updating password:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid support ID format"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// @route   DELETE /api/admin/support/:id
// @desc    Delete support account
admin_route.delete("/support/:id", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedSupport = await Support.findByIdAndDelete(id);

        if (!deletedSupport) {
            return res.status(404).json({
                success: false,
                message: "Support account not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Support account deleted successfully",
            data: {
                id: deletedSupport._id,
                name: deletedSupport.name,
                email: deletedSupport.email
            }
        });

    } catch (error) {
        console.error("Error deleting support account:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid support ID format"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// @route   GET /api/admin/supports/active
// @desc    Get all active support accounts
admin_route.get("/supports/active", ensureadminAuthenticated, async (req, res) => {
    try {
        const activeSupports = await Support.find({ status: 'active' })
            .select('-password')
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            count: activeSupports.length,
            data: activeSupports
        });

    } catch (error) {
        console.error("Error fetching active supports:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

// @route   PUT /api/admin/support/:id/status
// @desc    Toggle support account status
admin_route.put("/support/:id/status", ensureadminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be either 'active' or 'inactive'"
            });
        }

        const support = await Support.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).select('-password');

        if (!support) {
            return res.status(404).json({
                success: false,
                message: "Support account not found"
            });
        }

        res.status(200).json({
            success: true,
            message: `Support account ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
            data: support
        });

    } catch (error) {
        console.error("Error updating support status:", error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid support ID format"
            });
        }
        
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});


// ======================== ADMIN PASSWORD UPDATE ========================

// @route   PUT /api/admin/update-password/:id
// @desc    Update admin password
admin_route.put("/update-password/:id", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;
 console.log(req.body)
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password, new password, and confirm password are required"
      });
    }

    // Check if new password matches confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation do not match"
      });
    }

    // Check password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long"
      });
    }

    // Find admin
    const admin = await admin_model.findById(id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: "Admin not found"
      });
    }

    // Check if current password is correct
    const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    admin.password = hashedPassword;
    await admin.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});


// ==================== BONUS MANAGEMENT ROUTES ====================
// POST create new bonus (updated for validity types)
// UPDATED: Create bonus route with balanceType and validityType
admin_route.post("/bonuses", async (req, res) => {
  try {
    const {
      name,
      bonusCode,
      bonusType,
      balanceType,
      amount,
      percentage,
      minDeposit,
      maxBonus,
      wageringRequirement,
      // UPDATED: New validity fields
      validityType,
      validityValue,
      // UPDATED: Keep for backward compatibility
      validityDays,
      gamesCategory,
      status,
      applicableTo,
      distributionType,
      maxClaims,
      reusable,
      startDate,
      endDate,
      assignedUserId
    } = req.body;

    // Validation
    if (!name || (!amount && amount !== 0 && (!percentage || percentage === 0))) {
      return res.status(400).json({
        success: false,
        error: "Name and either amount or percentage are required"
      });
    }

    // Validate balanceType if provided
    if (balanceType && !['bonus_balance', 'cash_balance'].includes(balanceType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid balance type. Must be either 'bonus_balance' or 'cash_balance'"
      });
    }

    // UPDATED: Validate validityType if provided
    if (validityType && !['days', 'hours', 'infinite'].includes(validityType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid validity type. Must be either 'days', 'hours', or 'infinite'"
      });
    }

    // UPDATED: Validate validityValue based on validityType
    if (validityType !== 'infinite') {
      if (!validityValue || validityValue <= 0) {
        return res.status(400).json({
          success: false,
          error: `Validity value must be a positive number for ${validityType} validity type`
        });
      }
    }

    // Validate gamesCategory with your specific Bengali categories
    const validGameCategories = [
      'গরম খেলা',
      'স্লট গেম',
      'টেবিল',
      'ক্যাসিনো',
      'রুলেট',
      'ইনস্ট্যান্ট',
      'স্ক্র্যাচ কার্ড',
      'ফিশিং',
      'পোকার',
      'ভিডিও পোকার',
      'ক্রাশ',
      'লাইভ ডিলার',
      'লটারি',
      'ভি-স্পোর্টস',
      'জনপ্রিয়',
      'আমেরিকান রুলেট',
      'কার্ড',
      'ব্ল্যাকজ্যাক',
      'all'
    ];
    
    if (gamesCategory && Array.isArray(gamesCategory)) {
      const invalidCategories = gamesCategory.filter(cat => !validGameCategories.includes(cat));
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid game categories: ${invalidCategories.join(', ')}. Valid categories are: ${validGameCategories.join(', ')}`
        });
      }
      
      // If 'all' is included with other categories, remove other categories and keep only 'all'
      if (gamesCategory.includes('all') && gamesCategory.length > 1) {
        return res.status(400).json({
          success: false,
          error: "Cannot select 'all' with other specific categories. Please select either 'all' or specific categories only."
        });
      }
    }

    // For single_user bonuses, validate assigned user
    if (distributionType === 'single_user') {
      if (!assignedUserId) {
        return res.status(400).json({
          success: false,
          error: "Assigned user ID is required for single-user bonuses"
        });
      }
      
      const userExists = await User.findById(assignedUserId);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          error: "Assigned user not found"
        });
      }
    }

    // For private bonuses, bonus code is required
    if (distributionType === 'private' && !bonusCode) {
      return res.status(400).json({
        success: false,
        error: "Bonus code is required for private bonuses"
      });
    }

    // Check if bonus code already exists for public/private bonuses
    if (bonusCode && distributionType !== 'single_user') {
      const existingBonus = await Bonus.findOne({ 
        bonusCode: bonusCode.toUpperCase(),
        distributionType: { $in: ['public', 'private'] }
      });
      if (existingBonus) {
        return res.status(400).json({
          success: false,
          error: "Bonus code already exists"
        });
      }
    }

    // UPDATED: Calculate validity fields for backward compatibility
    let finalValidityType = validityType || 'days';
    let finalValidityValue = validityValue;
    
    // Handle backward compatibility with validityDays
    if (!validityValue && validityDays) {
      finalValidityValue = validityDays;
    } else if (!validityValue) {
      finalValidityValue = finalValidityType === 'infinite' ? 0 : 30;
    }

    const bonusData = {
      name,
      bonusCode: bonusCode ? bonusCode.toUpperCase() : undefined,
      bonusType: bonusType || 'deposit',
      balanceType: balanceType || 'bonus_balance',
      amount: amount || 0,
      percentage: percentage || 0,
      minDeposit: minDeposit || 0,
      maxBonus: maxBonus || null,
      wageringRequirement: wageringRequirement || 0,
      // UPDATED: New validity fields
      validityType: finalValidityType,
      validityValue: finalValidityValue,
      // Keep for backward compatibility
      validityDays: finalValidityType === 'days' ? finalValidityValue : 30,
      gamesCategory: gamesCategory && Array.isArray(gamesCategory) && gamesCategory.length > 0 
        ? gamesCategory 
        : ['all'],
      status: status || 'active',
      distributionType: distributionType || 'public',
      maxClaims: maxClaims || null,
      reusable: reusable || false,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      createdBy: req.user?._id
    };

    // Add assigned user for single-user bonus
    if (distributionType === 'single_user' && assignedUserId) {
      bonusData.assignedUsers = [{
        userId: assignedUserId,
        assignedBy: req.user?._id,
        status: 'pending'
      }];
    }

    const newBonus = new Bonus(bonusData);
    const savedBonus = await newBonus.save();

    // Populate createdBy for response
    await savedBonus.populate("createdBy", "username");
    if (savedBonus.assignedUsers && savedBonus.assignedUsers.length > 0) {
      await savedBonus.populate("assignedUsers.userId", "username email");
      await savedBonus.populate("assignedUsers.assignedBy", "username");
    }

    res.status(201).json({
      success: true,
      message: "Bonus created successfully",
      bonus: savedBonus
    });
  } catch (error) {
    console.error("Error creating bonus:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Bonus code already exists"
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create bonus"
    });
  }
});

// PUT: Update bonus with validity types
admin_route.put("/bonuses/:id", async (req, res) => {
  try {
    const bonusId = req.params.id;
    const {
      name,
      bonusCode,
      bonusType,
      balanceType,
      amount,
      percentage,
      minDeposit,
      maxBonus,
      wageringRequirement,
      // UPDATED: New validity fields
      validityType,
      validityValue,
      validityDays, // Keep for backward compatibility
      gamesCategory,
      status,
      distributionType,
      maxClaims,
      reusable,
      startDate,
      endDate
    } = req.body;

    // Find bonus
    const bonus = await Bonus.findById(bonusId);
    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Bonus not found"
      });
    }

    // Validate balanceType if provided
    if (balanceType && !['bonus_balance', 'cash_balance'].includes(balanceType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid balance type. Must be either 'bonus_balance' or 'cash_balance'"
      });
    }

    // UPDATED: Validate validityType if provided
    if (validityType && !['days', 'hours', 'infinite'].includes(validityType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid validity type. Must be either 'days', 'hours', or 'infinite'"
      });
    }

    // UPDATED: Validate validityValue based on validityType
    if (validityType && validityType !== 'infinite' && validityValue !== undefined) {
      if (!validityValue || validityValue <= 0) {
        return res.status(400).json({
          success: false,
          error: `Validity value must be a positive number for ${validityType} validity type`
        });
      }
    }

    // Validate gamesCategory if provided
    const validGameCategories = [
      'গরম খেলা',
      'স্লট গেম',
      'টেবিল',
      'ক্যাসিনো',
      'রুলেট',
      'ইনস্ট্যান্ট',
      'স্ক্র্যাচ কার্ড',
      'ফিশিং',
      'পোকার',
      'ভিডিও পোকার',
      'ক্রাশ',
      'লাইভ ডিলার',
      'লটারি',
      'ভি-স্পোর্টস',
      'জনপ্রিয়',
      'আমেরিকান রুলেট',
      'কার্ড',
      'ব্ল্যাকজ্যাক',
      'all'
    ];
    
    if (gamesCategory && Array.isArray(gamesCategory)) {
      const invalidCategories = gamesCategory.filter(cat => !validGameCategories.includes(cat));
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid game categories: ${invalidCategories.join(', ')}. Valid categories are: ${validGameCategories.join(', ')}`
        });
      }
      
      // If 'all' is included with other categories, remove other categories and keep only 'all'
      if (gamesCategory.includes('all') && gamesCategory.length > 1) {
        return res.status(400).json({
          success: false,
          error: "Cannot select 'all' with other specific categories. Please select either 'all' or specific categories only."
        });
      }
    }

    // For private bonuses, bonus code is required
    if (distributionType === 'private' && (!bonusCode || bonusCode.trim() === '')) {
      return res.status(400).json({
        success: false,
        error: "Bonus code is required for private bonuses"
      });
    }

    // Check if bonus code already exists (for public/private bonuses)
    if (bonusCode && distributionType !== 'single_user') {
      const existingBonus = await Bonus.findOne({ 
        bonusCode: bonusCode.toUpperCase(),
        _id: { $ne: bonusId },
        distributionType: { $in: ['public', 'private'] }
      });
      if (existingBonus) {
        return res.status(400).json({
          success: false,
          error: "Bonus code already exists"
        });
      }
    }

    // Update bonus fields
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (bonusCode !== undefined) updateData.bonusCode = bonusCode ? bonusCode.toUpperCase() : '';
    if (bonusType !== undefined) updateData.bonusType = bonusType;
    if (balanceType !== undefined) updateData.balanceType = balanceType;
    if (amount !== undefined) updateData.amount = amount;
    if (percentage !== undefined) updateData.percentage = percentage;
    if (minDeposit !== undefined) updateData.minDeposit = minDeposit;
    if (maxBonus !== undefined) updateData.maxBonus = maxBonus === '' ? null : maxBonus;
    if (wageringRequirement !== undefined) updateData.wageringRequirement = wageringRequirement;
    
    // UPDATED: Handle validity fields
    if (validityType !== undefined) updateData.validityType = validityType;
    if (validityValue !== undefined) updateData.validityValue = validityValue;
    if (validityDays !== undefined) {
      updateData.validityDays = validityDays;
      // If validityDays is set and validityType is not explicitly changing, update validityValue for days type
      if (validityType === undefined && (bonus.validityType === 'days' || validityDays)) {
        updateData.validityValue = validityDays;
      }
    }
    
    if (gamesCategory !== undefined) updateData.gamesCategory = gamesCategory && Array.isArray(gamesCategory) && gamesCategory.length > 0 ? gamesCategory : ['all'];
    if (status !== undefined) updateData.status = status;
    if (distributionType !== undefined) updateData.distributionType = distributionType;
    if (maxClaims !== undefined) updateData.maxClaims = maxClaims === '' ? null : maxClaims;
    if (reusable !== undefined) updateData.reusable = reusable;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate === '' ? null : endDate;
    if (req.user?._id) updateData.updatedBy = req.user._id;

    // Update bonus
    const updatedBonus = await Bonus.findByIdAndUpdate(
      bonusId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate("createdBy", "username")
    .populate("assignedUsers.userId", "username email")
    .populate("updatedBy", "username");

    res.json({
      success: true,
      message: "Bonus updated successfully",
      bonus: updatedBonus
    });
  } catch (error) {
    console.error("Error updating bonus:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Bonus code already exists"
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update bonus"
    });
  }
});

// UPDATED: Claim bonus with new validity types
admin_route.post("/bonuses/claim", async (req, res) => {
  try {
    const { bonusCode, userId, depositAmount = 0, gameCategory } = req.body;

    if (!bonusCode || !userId) {
      return res.status(400).json({
        success: false,
        error: "Bonus code and user ID are required"
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get bonus
    const bonus = await Bonus.findOne({ 
      bonusCode: bonusCode.toUpperCase() 
    });

    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Invalid bonus code"
      });
    }

    // Check deposit requirement
    if (depositAmount < bonus.minDeposit) {
      return res.status(400).json({
        success: false,
        error: `Minimum deposit of ${bonus.minDeposit} required for this bonus`
      });
    }

    // Check if game category is valid for this bonus
    if (gameCategory && bonus.gamesCategory && !bonus.gamesCategory.includes('all')) {
      if (!bonus.gamesCategory.includes(gameCategory)) {
        return res.status(400).json({
          success: false,
          error: `This bonus cannot be used for ${gameCategory} games. Valid categories: ${bonus.gamesCategory.join(', ')}`
        });
      }
    }

    // Calculate bonus amount
    let bonusAmount = bonus.amount;
    if (bonus.percentage > 0) {
      bonusAmount = depositAmount * (bonus.percentage / 100);
      if (bonus.maxBonus && bonusAmount > bonus.maxBonus) {
        bonusAmount = bonus.maxBonus;
      }
    }

    // UPDATED: Calculate expiry date based on validity type
    const expiresAt = bonus.calculateExpiry();

    // Update bonus claim status if it's a private bonus
    if (bonus.distributionType === 'private') {
      const assignedUser = bonus.assignedUsers.find(
        au => au.userId.toString() === userId
      );
      
      if (assignedUser) {
        assignedUser.status = 'claimed';
        assignedUser.claimedAt = new Date();
        assignedUser.expiresAt = expiresAt;
      }
    }

    // Update bonus claim count for public bonuses
    if (bonus.distributionType === 'public') {
      bonus.claimCount += 1;
    }

    await bonus.save();

    // Add bonus to appropriate balance based on balanceType
    if (bonus.balanceType === 'cash_balance') {
      user.cashBalance += bonusAmount;
    } else {
      // Default to bonus_balance
      user.bonusBalance += bonusAmount;
    }

    // UPDATED: Add to user's bonus info with new expiry calculation
    user.bonusInfo.activeBonuses.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusCode: bonus.bonusCode,
      amount: bonusAmount,
      originalAmount: bonusAmount,
      balanceType: bonus.balanceType,
      wageringRequirement: bonus.wageringRequirement,
      gamesCategory: bonus.gamesCategory,
      validityType: bonus.validityType, // NEW: Store validity type
      validityValue: bonus.validityValue, // NEW: Store validity value
      createdAt: new Date(),
      expiresAt: expiresAt // UPDATED: Use calculated expiry
    });

    // Log the bonus activity
    user.bonusActivityLogs.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusAmount: bonusAmount,
      balanceType: bonus.balanceType,
      validityType: bonus.validityType, // NEW: Log validity type
      validityValue: bonus.validityValue, // NEW: Log validity value
      activatedAt: new Date(),
      status: "active",
      source: "code_claim",
      bonusCode: bonus.bonusCode,
      distributionType: bonus.distributionType,
      gamesCategory: gameCategory || bonus.gamesCategory,
      expiresAt: expiresAt // UPDATED: Log expiry
    });

    // Determine which balance was affected for transaction description
    const affectedBalance = bonus.balanceType === 'cash_balance' ? 'cash' : 'bonus';
    const balanceBefore = bonus.balanceType === 'cash_balance' 
      ? user.cashBalance - bonusAmount 
      : user.bonusBalance - bonusAmount;
    const balanceAfter = bonus.balanceType === 'cash_balance' 
      ? user.cashBalance 
      : user.bonusBalance;

    // Add transaction history
    user.transactionHistory.push({
      type: "bonus",
      amount: bonusAmount,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      description: `Bonus claimed: ${bonus.name} (${affectedBalance} balance) - Valid for: ${bonus.validityType === 'infinite' ? 'Unlimited' : `${bonus.validityValue} ${bonus.validityType}`}`,
      referenceId: `BONUS-${Date.now()}`,
      metadata: {
        bonusId: bonus._id,
        bonusCode: bonus.bonusCode,
        distributionType: bonus.distributionType,
        gamesCategory: gameCategory || bonus.gamesCategory,
        balanceType: bonus.balanceType,
        validityType: bonus.validityType,
        validityValue: bonus.validityValue,
        expiresAt: expiresAt
      }
    });

    await user.save();

    // Prepare response based on balance type
    const responseData = {
      success: true,
      message: "Bonus claimed successfully",
      bonusAmount,
      bonusDetails: {
        name: bonus.name,
        bonusCode: bonus.bonusCode,
        type: bonus.bonusType,
        balanceType: bonus.balanceType,
        wageringRequirement: bonus.wageringRequirement,
        // UPDATED: Return new validity info
        validityType: bonus.validityType,
        validityValue: bonus.validityValue,
        validityDescription: bonus.validityType === 'infinite' ? 'Never expires' : `Valid for ${bonus.validityValue} ${bonus.validityType}`,
        expiresAt: expiresAt,
        gamesCategory: bonus.gamesCategory
      }
    };

    // Add appropriate balance to response
    if (bonus.balanceType === 'cash_balance') {
      responseData.newCashBalance = user.cashBalance;
    } else {
      responseData.newBonusBalance = user.bonusBalance;
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error claiming bonus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to claim bonus"
    });
  }
});

// UPDATED: Auto-assign single-user bonus with validity types
admin_route.post("/bonuses/:id/auto-claim", async (req, res) => {
  try {
    const { userId } = req.body;
    const bonusId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required"
      });
    }

    // Get bonus
    const bonus = await Bonus.findById(bonusId);
    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Bonus not found"
      });
    }

    // Check if bonus is single-user type
    if (bonus.distributionType !== 'single_user') {
      return res.status(400).json({
        success: false,
        error: "This is not a single-user bonus"
      });
    }

    // Check if user is assigned
    const assignedUser = bonus.assignedUsers.find(
      au => au.userId.toString() === userId
    );

    if (!assignedUser) {
      return res.status(403).json({
        success: false,
        error: "You are not assigned to this bonus"
      });
    }

    if (assignedUser.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Bonus already ${assignedUser.status}`
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Calculate bonus amount
    let bonusAmount = bonus.amount;

    // UPDATED: Calculate expiry date based on validity type
    const expiresAt = bonus.calculateExpiry();

    // Update assigned user status
    assignedUser.status = 'claimed';
    assignedUser.claimedAt = new Date();
    assignedUser.expiresAt = expiresAt;

    await bonus.save();

    // Add bonus to appropriate balance based on balanceType
    if (bonus.balanceType === 'cash_balance') {
      user.cashBalance += bonusAmount;
    } else {
      user.bonusBalance += bonusAmount;
    }

    // UPDATED: Add to user's bonus info with new expiry calculation
    user.bonusInfo.activeBonuses.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusCode: bonus.bonusCode || 'SINGLE_USER',
      amount: bonusAmount,
      originalAmount: bonusAmount,
      balanceType: bonus.balanceType,
      wageringRequirement: bonus.wageringRequirement,
      gamesCategory: bonus.gamesCategory,
      validityType: bonus.validityType, // NEW: Store validity type
      validityValue: bonus.validityValue, // NEW: Store validity value
      createdAt: new Date(),
      expiresAt: expiresAt // UPDATED: Use calculated expiry
    });

    // Log the bonus activity
    user.bonusActivityLogs.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusAmount: bonusAmount,
      balanceType: bonus.balanceType,
      validityType: bonus.validityType, // NEW: Log validity type
      validityValue: bonus.validityValue, // NEW: Log validity value
      activatedAt: new Date(),
      status: "active",
      source: "auto_assigned",
      distributionType: bonus.distributionType,
      gamesCategory: bonus.gamesCategory,
      expiresAt: expiresAt // UPDATED: Log expiry
    });

    // Determine which balance was affected for transaction description
    const affectedBalance = bonus.balanceType === 'cash_balance' ? 'cash' : 'bonus';
    const balanceBefore = bonus.balanceType === 'cash_balance' 
      ? user.cashBalance - bonusAmount 
      : user.bonusBalance - bonusAmount;
    const balanceAfter = bonus.balanceType === 'cash_balance' 
      ? user.cashBalance 
      : user.bonusBalance;

    // Add transaction history
    user.transactionHistory.push({
      type: "bonus",
      amount: bonusAmount,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      description: `Single-user bonus: ${bonus.name} (${affectedBalance} balance) - Valid for: ${bonus.validityType === 'infinite' ? 'Unlimited' : `${bonus.validityValue} ${bonus.validityType}`}`,
      referenceId: `BONUS-${Date.now()}`,
      metadata: {
        bonusId: bonus._id,
        distributionType: bonus.distributionType,
        gamesCategory: bonus.gamesCategory,
        balanceType: bonus.balanceType,
        validityType: bonus.validityType,
        validityValue: bonus.validityValue,
        expiresAt: expiresAt
      }
    });

    await user.save();

    // Prepare response data
    const responseData = {
      success: true,
      message: "Single-user bonus claimed successfully",
      bonusAmount,
      bonusDetails: {
        name: bonus.name,
        type: bonus.bonusType,
        balanceType: bonus.balanceType,
        wageringRequirement: bonus.wageringRequirement,
        // UPDATED: Return new validity info
        validityType: bonus.validityType,
        validityValue: bonus.validityValue,
        validityDescription: bonus.validityType === 'infinite' ? 'Never expires' : `Valid for ${bonus.validityValue} ${bonus.validityType}`,
        expiresAt: expiresAt,
        gamesCategory: bonus.gamesCategory
      }
    };

    // Add appropriate balance to response
    if (bonus.balanceType === 'cash_balance') {
      responseData.newCashBalance = user.cashBalance;
    } else {
      responseData.newBonusBalance = user.bonusBalance;
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error auto-claiming bonus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to claim bonus"
    });
  }
});

// UPDATED: Validate bonus code with validity types
admin_route.post("/bonuses/validate-code", async (req, res) => {
  try {
    const { bonusCode, userId, gameCategory } = req.body;

    if (!bonusCode || !userId) {
      return res.status(400).json({
        success: false,
        error: "Bonus code and user ID are required"
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get bonus
    const bonus = await Bonus.findOne({ 
      bonusCode: bonusCode.toUpperCase() 
    });

    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Invalid bonus code"
      });
    }

    // Common validations
    if (bonus.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: "Bonus is not active"
      });
    }

    if (bonus.endDate && new Date(bonus.endDate) < new Date()) {
      return res.status(400).json({
        success: false,
        error: "Bonus has expired"
      });
    }

    if (bonus.startDate && new Date(bonus.startDate) > new Date()) {
      return res.status(400).json({
        success: false,
        error: "Bonus is not yet available"
      });
    }

    // Check if game category is valid for this bonus
    if (gameCategory && bonus.gamesCategory && !bonus.gamesCategory.includes('all')) {
      if (!bonus.gamesCategory.includes(gameCategory)) {
        return res.status(400).json({
          success: false,
          error: `This bonus cannot be used for ${gameCategory} games. Valid categories: ${bonus.gamesCategory.join(', ')}`
        });
      }
    }

    // Check distribution type specific rules
    switch (bonus.distributionType) {
      case 'private':
        // Check if user is assigned to this bonus
        const isAssigned = bonus.assignedUsers.some(
          au => au.userId.toString() === userId && au.status === 'pending'
        );
        
        if (!isAssigned) {
          return res.status(403).json({
            success: false,
            error: "You are not authorized to claim this bonus"
          });
        }
        break;

      case 'single_user':
        return res.status(400).json({
          success: false,
          error: "This bonus is assigned to a specific user and cannot be claimed via code"
        });

      case 'public':
        if (bonus.maxClaims && bonus.claimCount >= bonus.maxClaims) {
          return res.status(400).json({
            success: false,
            error: "Bonus claim limit reached"
          });
        }
        
        if (!bonus.reusable) {
          const alreadyClaimed = user.bonusActivityLogs.some(
            log => log.bonusId && log.bonusId.toString() === bonus._id.toString()
          );
          
          if (alreadyClaimed) {
            return res.status(400).json({
              success: false,
              error: "You have already claimed this bonus"
            });
          }
        }
        break;
    }

    // Check applicableTo
    if (bonus.applicableTo === 'new' && user.bonusActivityLogs.length > 0) {
      return res.status(400).json({
        success: false,
        error: "This bonus is for new users only"
      });
    }

    if (bonus.applicableTo === 'existing' && user.bonusActivityLogs.length === 0) {
      return res.status(400).json({
        success: false,
        error: "This bonus is for existing users only"
      });
    }

    // UPDATED: Calculate expiry for response
    const expiresAt = bonus.calculateExpiry();

    res.json({
      success: true,
      bonus: {
        id: bonus._id,
        name: bonus.name,
        bonusType: bonus.bonusType,
        balanceType: bonus.balanceType,
        amount: bonus.amount,
        percentage: bonus.percentage,
        maxBonus: bonus.maxBonus,
        wageringRequirement: bonus.wageringRequirement,
        // UPDATED: Return new validity info
        validityType: bonus.validityType,
        validityValue: bonus.validityValue,
        validityDescription: bonus.validityType === 'infinite' ? 'Never expires' : `Valid for ${bonus.validityValue} ${bonus.validityType}`,
        expiresAt: expiresAt,
        distributionType: bonus.distributionType,
        gamesCategory: bonus.gamesCategory
      },
      isValid: true,
      message: "Bonus code is valid"
    });
  } catch (error) {
    console.error("Error validating bonus code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate bonus code"
    });
  }
});

// NEW: GET single bonus by ID with all details
admin_route.get("/bonuses/:id", async (req, res) => {
  try {
    const bonusId = req.params.id;
    
    const bonus = await Bonus.findById(bonusId)
      .populate("createdBy", "username")
      .populate("assignedUsers.userId", "username email")
      .populate("assignedUsers.assignedBy", "username")
      .populate("updatedBy", "username");
    
    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Bonus not found"
      });
    }
    
    // UPDATED: Add expiry calculation to response
    const expiresAt = bonus.calculateExpiry();
    const bonusWithExpiry = bonus.toObject();
    bonusWithExpiry.expiresAt = expiresAt;
    bonusWithExpiry.validityDescription = bonus.validityType === 'infinite' 
      ? 'Never expires' 
      : `Valid for ${bonus.validityValue} ${bonus.validityType}`;
    
    res.json({
      success: true,
      bonus: bonusWithExpiry
    });
  } catch (error) {
    console.error("Error fetching bonus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bonus"
    });
  }
});
// POST create new bonus (updated for distribution types and gamesCategory)
// UPDATED: Create bonus route with balanceType
admin_route.post("/bonuses", async (req, res) => {
  try {
    const {
      name,
      bonusCode,
      bonusType,
      balanceType, // NEW: Added balanceType
      amount,
      percentage,
      minDeposit,
      maxBonus,
      wageringRequirement,
      validityDays,
      gamesCategory,
      status,
      applicableTo,
      distributionType,
      maxClaims,
      reusable,
      startDate,
      endDate,
      assignedUserId
    } = req.body;

    // Validation
    if (!name || (!amount && amount !== 0 && (!percentage || percentage === 0))) {
      return res.status(400).json({
        success: false,
        error: "Name and either amount or percentage are required"
      });
    }

    // Validate balanceType if provided
    if (balanceType && !['bonus_balance', 'cash_balance'].includes(balanceType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid balance type. Must be either 'bonus_balance' or 'cash_balance'"
      });
    }

    // Validate gamesCategory with your specific Bengali categories
    const validGameCategories = [
      'গরম খেলা',
      'স্লট গেম',
      'টেবিল',
      'ক্যাসিনো',
      'রুলেট',
      'ইনস্ট্যান্ট',
      'স্ক্র্যাচ কার্ড',
      'ফিশিং',
      'পোকার',
      'ভিডিও পোকার',
      'ক্রাশ',
      'লাইভ ডিলার',
      'লটারি',
      'ভি-স্পোর্টস',
      'জনপ্রিয়',
      'আমেরিকান রুলেট',
      'কার্ড',
      'ব্ল্যাকজ্যাক',
      'all' // Keep 'all' for backward compatibility
    ];
    
    if (gamesCategory && Array.isArray(gamesCategory)) {
      const invalidCategories = gamesCategory.filter(cat => !validGameCategories.includes(cat));
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid game categories: ${invalidCategories.join(', ')}. Valid categories are: ${validGameCategories.join(', ')}`
        });
      }
      
      // If 'all' is included with other categories, remove other categories and keep only 'all'
      if (gamesCategory.includes('all') && gamesCategory.length > 1) {
        return res.status(400).json({
          success: false,
          error: "Cannot select 'all' with other specific categories. Please select either 'all' or specific categories only."
        });
      }
    }

    // For single_user bonuses, validate assigned user
    if (distributionType === 'single_user') {
      if (!assignedUserId) {
        return res.status(400).json({
          success: false,
          error: "Assigned user ID is required for single-user bonuses"
        });
      }
      
      const userExists = await User.findById(assignedUserId);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          error: "Assigned user not found"
        });
      }
    }

    // For private bonuses, bonus code is required
    if (distributionType === 'private' && !bonusCode) {
      return res.status(400).json({
        success: false,
        error: "Bonus code is required for private bonuses"
      });
    }

    // Check if bonus code already exists for public/private bonuses
    if (bonusCode && distributionType !== 'single_user') {
      const existingBonus = await Bonus.findOne({ 
        bonusCode: bonusCode.toUpperCase(),
        distributionType: { $in: ['public', 'private'] }
      });
      if (existingBonus) {
        return res.status(400).json({
          success: false,
          error: "Bonus code already exists"
        });
      }
    }

    const bonusData = {
      name,
      bonusCode: bonusCode ? bonusCode.toUpperCase() : undefined,
      bonusType: bonusType || 'deposit',
      balanceType: balanceType || 'bonus_balance', // NEW: Default to bonus_balance
      amount: amount || 0,
      percentage: percentage || 0,
      minDeposit: minDeposit || 0,
      maxBonus: maxBonus || null,
      wageringRequirement: wageringRequirement || 0,
      validityDays: validityDays || 30,
      gamesCategory: gamesCategory && Array.isArray(gamesCategory) && gamesCategory.length > 0 
        ? gamesCategory 
        : ['all'],
      status: status || 'active',
      distributionType: distributionType || 'public',
      maxClaims: maxClaims || null,
      reusable: reusable || false,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      createdBy: req.user?._id
    };

    // Add assigned user for single-user bonus
    if (distributionType === 'single_user' && assignedUserId) {
      bonusData.assignedUsers = [{
        userId: assignedUserId,
        assignedBy: req.user?._id,
        status: 'pending'
      }];
    }

    const newBonus = new Bonus(bonusData);
    const savedBonus = await newBonus.save();

    // Populate createdBy for response
    await savedBonus.populate("createdBy", "username");
    if (savedBonus.assignedUsers && savedBonus.assignedUsers.length > 0) {
      await savedBonus.populate("assignedUsers.userId", "username email");
      await savedBonus.populate("assignedUsers.assignedBy", "username");
    }

    res.status(201).json({
      success: true,
      message: "Bonus created successfully",
      bonus: savedBonus
    });
  } catch (error) {
    console.error("Error creating bonus:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Bonus code already exists"
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to create bonus"
    });
  }
});
// PUT: Update bonus
admin_route.put("/bonuses/:id", async (req, res) => {
  try {
    const bonusId = req.params.id;
    const {
      name,
      bonusCode,
      bonusType,
      balanceType,
      amount,
      percentage,
      minDeposit,
      maxBonus,
      wageringRequirement,
      validityDays,
      gamesCategory,
      status,
      distributionType,
      maxClaims,
      reusable,
      startDate,
      endDate
    } = req.body;

    // Find bonus
    const bonus = await Bonus.findById(bonusId);
    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Bonus not found"
      });
    }

    // Validate balanceType if provided
    if (balanceType && !['bonus_balance', 'cash_balance'].includes(balanceType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid balance type. Must be either 'bonus_balance' or 'cash_balance'"
      });
    }

    // Validate gamesCategory if provided
    const validGameCategories = [
      'গরম খেলা',
      'স্লট গেম',
      'টেবিল',
      'ক্যাসিনো',
      'রুলেট',
      'ইনস্ট্যান্ট',
      'স্ক্র্যাচ কার্ড',
      'ফিশিং',
      'পোকার',
      'ভিডিও পোকার',
      'ক্রাশ',
      'লাইভ ডিলার',
      'লটারি',
      'ভি-স্পোর্টস',
      'জনপ্রিয়',
      'আমেরিকান রুলেট',
      'কার্ড',
      'ব্ল্যাকজ্যাক',
      'all'
    ];
    
    if (gamesCategory && Array.isArray(gamesCategory)) {
      const invalidCategories = gamesCategory.filter(cat => !validGameCategories.includes(cat));
      if (invalidCategories.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Invalid game categories: ${invalidCategories.join(', ')}. Valid categories are: ${validGameCategories.join(', ')}`
        });
      }
      
      // If 'all' is included with other categories, remove other categories and keep only 'all'
      if (gamesCategory.includes('all') && gamesCategory.length > 1) {
        return res.status(400).json({
          success: false,
          error: "Cannot select 'all' with other specific categories. Please select either 'all' or specific categories only."
        });
      }
    }

    // For private bonuses, bonus code is required
    if (distributionType === 'private' && (!bonusCode || bonusCode.trim() === '')) {
      return res.status(400).json({
        success: false,
        error: "Bonus code is required for private bonuses"
      });
    }

    // Check if bonus code already exists (for public/private bonuses)
    if (bonusCode && distributionType !== 'single_user') {
      const existingBonus = await Bonus.findOne({ 
        bonusCode: bonusCode.toUpperCase(),
        _id: { $ne: bonusId }, // Exclude current bonus
        distributionType: { $in: ['public', 'private'] }
      });
      if (existingBonus) {
        return res.status(400).json({
          success: false,
          error: "Bonus code already exists"
        });
      }
    }

    // Update bonus fields
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (bonusCode !== undefined) updateData.bonusCode = bonusCode ? bonusCode.toUpperCase() : '';
    if (bonusType !== undefined) updateData.bonusType = bonusType;
    if (balanceType !== undefined) updateData.balanceType = balanceType;
    if (amount !== undefined) updateData.amount = amount;
    if (percentage !== undefined) updateData.percentage = percentage;
    if (minDeposit !== undefined) updateData.minDeposit = minDeposit;
    if (maxBonus !== undefined) updateData.maxBonus = maxBonus === '' ? null : maxBonus;
    if (wageringRequirement !== undefined) updateData.wageringRequirement = wageringRequirement;
    if (validityDays !== undefined) updateData.validityDays = validityDays;
    if (gamesCategory !== undefined) updateData.gamesCategory = gamesCategory && Array.isArray(gamesCategory) && gamesCategory.length > 0 ? gamesCategory : ['all'];
    if (status !== undefined) updateData.status = status;
    if (distributionType !== undefined) updateData.distributionType = distributionType;
    if (maxClaims !== undefined) updateData.maxClaims = maxClaims === '' ? null : maxClaims;
    if (reusable !== undefined) updateData.reusable = reusable;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate === '' ? null : endDate;
    if (req.user?._id) updateData.updatedBy = req.user._id;

    // Update bonus
    const updatedBonus = await Bonus.findByIdAndUpdate(
      bonusId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate("createdBy", "username")
    .populate("assignedUsers.userId", "username email")
    .populate("updatedBy", "username");

    res.json({
      success: true,
      message: "Bonus updated successfully",
      bonus: updatedBonus
    });
  } catch (error) {
    console.error("Error updating bonus:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Bonus code already exists"
      });
    }
    res.status(500).json({
      success: false,
      error: "Failed to update bonus"
    });
  }
});
// DELETE: Delete bonus
admin_route.delete("/bonuses/:id", async (req, res) => {
  try {
    const bonusId = req.params.id;

    // Find bonus
    const bonus = await Bonus.findById(bonusId);
    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Bonus not found"
      });
    }

    // Check if bonus has been claimed (optional restriction)
    if (bonus.claimCount > 0) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete bonus that has been claimed by users"
      });
    }

    // Check if there are active users with this bonus (additional check)
    const usersWithActiveBonus = await User.findOne({
      'bonusInfo.activeBonuses.bonusId': bonusId
    });

    if (usersWithActiveBonus) {
      return res.status(400).json({
        success: false,
        error: "Cannot delete bonus that is currently active for some users"
      });
    }

    // Delete the bonus
    await Bonus.findByIdAndDelete(bonusId);

    res.json({
      success: true,
      message: "Bonus deleted successfully",
      deletedBonus: {
        id: bonus._id,
        name: bonus.name,
        bonusCode: bonus.bonusCode
      }
    });
  } catch (error) {
    console.error("Error deleting bonus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete bonus"
    });
  }
});
// UPDATED: Claim bonus (now handles balanceType)
admin_route.post("/bonuses/claim", async (req, res) => {
  try {
    const { bonusCode, userId, depositAmount = 0, gameCategory } = req.body;

    if (!bonusCode || !userId) {
      return res.status(400).json({
        success: false,
        error: "Bonus code and user ID are required"
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get bonus
    const bonus = await Bonus.findOne({ 
      bonusCode: bonusCode.toUpperCase() 
    });

    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Invalid bonus code"
      });
    }

    // Check deposit requirement
    if (depositAmount < bonus.minDeposit) {
      return res.status(400).json({
        success: false,
        error: `Minimum deposit of ${bonus.minDeposit} required for this bonus`
      });
    }

    // Check if game category is valid for this bonus
    if (gameCategory && bonus.gamesCategory && !bonus.gamesCategory.includes('all')) {
      if (!bonus.gamesCategory.includes(gameCategory)) {
        return res.status(400).json({
          success: false,
          error: `This bonus cannot be used for ${gameCategory} games. Valid categories: ${bonus.gamesCategory.join(', ')}`
        });
      }
    }

    // Calculate bonus amount
    let bonusAmount = bonus.amount;
    if (bonus.percentage > 0) {
      bonusAmount = depositAmount * (bonus.percentage / 100);
      if (bonus.maxBonus && bonusAmount > bonus.maxBonus) {
        bonusAmount = bonus.maxBonus;
      }
    }

    // Update bonus claim status if it's a private bonus
    if (bonus.distributionType === 'private') {
      const assignedUser = bonus.assignedUsers.find(
        au => au.userId.toString() === userId
      );
      
      if (assignedUser) {
        assignedUser.status = 'claimed';
        assignedUser.claimedAt = new Date();
      }
    }

    // Update bonus claim count for public bonuses
    if (bonus.distributionType === 'public') {
      bonus.claimCount += 1;
    }

    await bonus.save();

    // NEW: Add bonus to appropriate balance based on balanceType
    if (bonus.balanceType === 'cash_balance') {
      user.cashBalance += bonusAmount;
    } else {
      // Default to bonus_balance
      user.bonusBalance += bonusAmount;
    }

    // Add to user's bonus info
    user.bonusInfo.activeBonuses.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusCode: bonus.bonusCode,
      amount: bonusAmount,
      originalAmount: bonusAmount,
      balanceType: bonus.balanceType, // NEW: Store balance type
      wageringRequirement: bonus.wageringRequirement,
      gamesCategory: bonus.gamesCategory,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + bonus.validityDays * 24 * 60 * 60 * 1000)
    });

    // Log the bonus activity
    user.bonusActivityLogs.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusAmount: bonusAmount,
      balanceType: bonus.balanceType, // NEW: Log balance type
      activatedAt: new Date(),
      status: "active",
      source: "code_claim",
      bonusCode: bonus.bonusCode,
      distributionType: bonus.distributionType,
      gamesCategory: gameCategory || bonus.gamesCategory
    });

    // Determine which balance was affected for transaction description
    const affectedBalance = bonus.balanceType === 'cash_balance' ? 'cash' : 'bonus';
    const balanceBefore = bonus.balanceType === 'cash_balance' 
      ? user.cashBalance - bonusAmount 
      : user.bonusBalance - bonusAmount;
    const balanceAfter = bonus.balanceType === 'cash_balance' 
      ? user.cashBalance 
      : user.bonusBalance;

    // Add transaction history
    user.transactionHistory.push({
      type: "bonus",
      amount: bonusAmount,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      description: `Bonus claimed: ${bonus.name} (${affectedBalance} balance)`,
      referenceId: `BONUS-${Date.now()}`,
      metadata: {
        bonusId: bonus._id,
        bonusCode: bonus.bonusCode,
        distributionType: bonus.distributionType,
        gamesCategory: gameCategory || bonus.gamesCategory,
        balanceType: bonus.balanceType // NEW: Include balance type in metadata
      }
    });

    await user.save();

    // Prepare response based on balance type
    const responseData = {
      success: true,
      message: "Bonus claimed successfully",
      bonusAmount,
      bonusDetails: {
        name: bonus.name,
        bonusCode: bonus.bonusCode,
        type: bonus.bonusType,
        balanceType: bonus.balanceType,
        wageringRequirement: bonus.wageringRequirement,
        validityDays: bonus.validityDays,
        gamesCategory: bonus.gamesCategory
      }
    };

    // Add appropriate balance to response
    if (bonus.balanceType === 'cash_balance') {
      responseData.newCashBalance = user.cashBalance;
    } else {
      responseData.newBonusBalance = user.bonusBalance;
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error claiming bonus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to claim bonus"
    });
  }
});

// UPDATED: Auto-assign single-user bonus to user (with balanceType)
admin_route.post("/bonuses/:id/auto-claim", async (req, res) => {
  try {
    const { userId } = req.body;
    const bonusId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required"
      });
    }

    // Get bonus
    const bonus = await Bonus.findById(bonusId);
    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Bonus not found"
      });
    }

    // Check if bonus is single-user type
    if (bonus.distributionType !== 'single_user') {
      return res.status(400).json({
        success: false,
        error: "This is not a single-user bonus"
      });
    }

    // Check if user is assigned
    const assignedUser = bonus.assignedUsers.find(
      au => au.userId.toString() === userId
    );

    if (!assignedUser) {
      return res.status(403).json({
        success: false,
        error: "You are not assigned to this bonus"
      });
    }

    if (assignedUser.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: `Bonus already ${assignedUser.status}`
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Calculate bonus amount
    let bonusAmount = bonus.amount;

    // Update assigned user status
    assignedUser.status = 'claimed';
    assignedUser.claimedAt = new Date();

    await bonus.save();

    // NEW: Add bonus to appropriate balance based on balanceType
    if (bonus.balanceType === 'cash_balance') {
      user.cashBalance += bonusAmount;
    } else {
      user.bonusBalance += bonusAmount;
    }

    // Add to user's bonus info
    user.bonusInfo.activeBonuses.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusCode: bonus.bonusCode || 'SINGLE_USER',
      amount: bonusAmount,
      originalAmount: bonusAmount,
      balanceType: bonus.balanceType, // NEW: Store balance type
      wageringRequirement: bonus.wageringRequirement,
      gamesCategory: bonus.gamesCategory,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + bonus.validityDays * 24 * 60 * 60 * 1000)
    });

    // Log the bonus activity
    user.bonusActivityLogs.push({
      bonusType: bonus.bonusType,
      bonusId: bonus._id,
      bonusAmount: bonusAmount,
      balanceType: bonus.balanceType, // NEW: Log balance type
      activatedAt: new Date(),
      status: "active",
      source: "auto_assigned",
      distributionType: bonus.distributionType,
      gamesCategory: bonus.gamesCategory
    });

    // Determine which balance was affected for transaction description
    const affectedBalance = bonus.balanceType === 'cash_balance' ? 'cash' : 'bonus';
    const balanceBefore = bonus.balanceType === 'cash_balance' 
      ? user.cashBalance - bonusAmount 
      : user.bonusBalance - bonusAmount;
    const balanceAfter = bonus.balanceType === 'cash_balance' 
      ? user.cashBalance 
      : user.bonusBalance;

    // Add transaction history
    user.transactionHistory.push({
      type: "bonus",
      amount: bonusAmount,
      balanceBefore: balanceBefore,
      balanceAfter: balanceAfter,
      description: `Single-user bonus: ${bonus.name} (${affectedBalance} balance)`,
      referenceId: `BONUS-${Date.now()}`,
      metadata: {
        bonusId: bonus._id,
        distributionType: bonus.distributionType,
        gamesCategory: bonus.gamesCategory,
        balanceType: bonus.balanceType
      }
    });

    await user.save();

    // Prepare response data
    const responseData = {
      success: true,
      message: "Single-user bonus claimed successfully",
      bonusAmount,
      bonusDetails: {
        name: bonus.name,
        type: bonus.bonusType,
        balanceType: bonus.balanceType,
        wageringRequirement: bonus.wageringRequirement,
        validityDays: bonus.validityDays,
        gamesCategory: bonus.gamesCategory
      }
    };

    // Add appropriate balance to response
    if (bonus.balanceType === 'cash_balance') {
      responseData.newCashBalance = user.cashBalance;
    } else {
      responseData.newBonusBalance = user.bonusBalance;
    }

    res.json(responseData);
  } catch (error) {
    console.error("Error auto-claiming bonus:", error);
    res.status(500).json({
      success: false,
      error: "Failed to claim bonus"
    });
  }
});

// UPDATED: Validate bonus code (includes balanceType in response)
admin_route.post("/bonuses/validate-code", async (req, res) => {
  try {
    const { bonusCode, userId, gameCategory } = req.body;

    if (!bonusCode || !userId) {
      return res.status(400).json({
        success: false,
        error: "Bonus code and user ID are required"
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    // Get bonus
    const bonus = await Bonus.findOne({ 
      bonusCode: bonusCode.toUpperCase() 
    });

    if (!bonus) {
      return res.status(404).json({
        success: false,
        error: "Invalid bonus code"
      });
    }

    // Common validations
    if (bonus.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: "Bonus is not active"
      });
    }

    if (bonus.endDate && new Date(bonus.endDate) < new Date()) {
      return res.status(400).json({
        success: false,
        error: "Bonus has expired"
      });
    }

    if (bonus.startDate && new Date(bonus.startDate) > new Date()) {
      return res.status(400).json({
        success: false,
        error: "Bonus is not yet available"
      });
    }

    // Check if game category is valid for this bonus
    if (gameCategory && bonus.gamesCategory && !bonus.gamesCategory.includes('all')) {
      if (!bonus.gamesCategory.includes(gameCategory)) {
        return res.status(400).json({
          success: false,
          error: `This bonus cannot be used for ${gameCategory} games. Valid categories: ${bonus.gamesCategory.join(', ')}`
        });
      }
    }

    // Check distribution type specific rules
    switch (bonus.distributionType) {
      case 'private':
        // Check if user is assigned to this bonus
        const isAssigned = bonus.assignedUsers.some(
          au => au.userId.toString() === userId && au.status === 'pending'
        );
        
        if (!isAssigned) {
          return res.status(403).json({
            success: false,
            error: "You are not authorized to claim this bonus"
          });
        }
        break;

      case 'single_user':
        // Single-user bonuses are claimed automatically upon assignment
        return res.status(400).json({
          success: false,
          error: "This bonus is assigned to a specific user and cannot be claimed via code"
        });

      case 'public':
        // Public bonuses have additional checks
        if (bonus.maxClaims && bonus.claimCount >= bonus.maxClaims) {
          return res.status(400).json({
            success: false,
            error: "Bonus claim limit reached"
          });
        }
        
        if (!bonus.reusable) {
          // Check if user has already claimed this bonus
          const alreadyClaimed = user.bonusActivityLogs.some(
            log => log.bonusId && log.bonusId.toString() === bonus._id.toString()
          );
          
          if (alreadyClaimed) {
            return res.status(400).json({
              success: false,
              error: "You have already claimed this bonus"
            });
          }
        }
        break;
    }

    // Check applicableTo
    if (bonus.applicableTo === 'new' && user.bonusActivityLogs.length > 0) {
      return res.status(400).json({
        success: false,
        error: "This bonus is for new users only"
      });
    }

    if (bonus.applicableTo === 'existing' && user.bonusActivityLogs.length === 0) {
      return res.status(400).json({
        success: false,
        error: "This bonus is for existing users only"
      });
    }

    res.json({
      success: true,
      bonus: {
        id: bonus._id,
        name: bonus.name,
        bonusType: bonus.bonusType,
        balanceType: bonus.balanceType, // NEW: Include balance type
        amount: bonus.amount,
        percentage: bonus.percentage,
        maxBonus: bonus.maxBonus,
        wageringRequirement: bonus.wageringRequirement,
        validityDays: bonus.validityDays,
        distributionType: bonus.distributionType,
        gamesCategory: bonus.gamesCategory
      },
      isValid: true,
      message: "Bonus code is valid"
    });
  } catch (error) {
    console.error("Error validating bonus code:", error);
    res.status(500).json({
      success: false,
      error: "Failed to validate bonus code"
    });
  }
});

// UPDATED: Bonus statistics (include balanceType stats)
admin_route.get("/bonuses-stats", async (req, res) => {
  try {
    // Total bonuses count
    const totalBonuses = await Bonus.countDocuments();
    
    // Active bonuses count
    const activeBonuses = await Bonus.countDocuments({ 
      status: 'active',
      endDate: { $gte: new Date() } 
    });
    
    // Bonuses by type
    const bonusesByType = await Bonus.aggregate([
      {
        $group: {
          _id: "$bonusType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);
    
    // NEW: Bonuses by balance type
    const bonusesByBalanceType = await Bonus.aggregate([
      {
        $group: {
          _id: "$balanceType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" }
        }
      }
    ]);
    
    // Bonuses by distribution type
    const bonusesByDistribution = await Bonus.aggregate([
      {
        $group: {
          _id: "$distributionType",
          count: { $sum: 1 },
          totalClaims: { $sum: "$claimCount" }
        }
      }
    ]);
    
    // Bonuses by games category
    const bonusesByGamesCategory = await Bonus.aggregate([
      { $unwind: "$gamesCategory" },
      {
        $group: {
          _id: "$gamesCategory",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Recent bonuses (now includes balanceType)
    const recentBonuses = await Bonus.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name bonusType balanceType distributionType amount gamesCategory status claimCount');

    res.json({
      success: true,
      stats: {
        totalBonuses,
        activeBonuses,
        bonusesByType,
        bonusesByBalanceType, // NEW: Include balance type stats
        bonusesByDistribution,
        bonusesByGamesCategory,
        recentBonuses
      }
    });
  } catch (error) {
    console.error("Error fetching bonus stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch bonus statistics"
    });
  }
});

// UPDATED: GET bonuses with balanceType filtering
admin_route.get("/bonuses", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      bonusType,
      balanceType, // NEW: Added balanceType filter
      distributionType,
      gamesCategory,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (bonusType && bonusType !== "all") {
      filter.bonusType = bonusType;
    }

    // NEW: Add balanceType filter
    if (balanceType && balanceType !== "all") {
      filter.balanceType = balanceType;
    }

    if (distributionType && distributionType !== "all") {
      filter.distributionType = distributionType;
    }

    if (gamesCategory && gamesCategory !== "all") {
      filter.gamesCategory = gamesCategory;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { bonusCode: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get bonuses with pagination
    const bonuses = await Bonus.find(filter)
      .populate("createdBy", "username")
      .populate("assignedUsers.userId", "username email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await Bonus.countDocuments(filter);

    res.json({
      success: true,
      bonuses,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total,
    });
  } catch (error) {
    console.error("Error fetching bonuses:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch bonuses" 
    });
  }
});

admin_route.post("/bonuses/:id/assign-users", async (req, res) => {
    try {
        const bonusId = req.params.id;
        const { userIds, assignAll = false, filterCriteria = {} } = req.body;

        // Find the bonus
        const bonus = await Bonus.findById(bonusId);
        if (!bonus) {
            return res.status(404).json({
                success: false,
                error: "Bonus not found"
            });
        }

        // Check if bonus supports user assignment
        if (!['private', 'single_user'].includes(bonus.distributionType)) {
            return res.status(400).json({
                success: false,
                error: "This bonus type does not support user assignment"
            });
        }

        let assignedUsers = [];
        let assignedCount = 0;

        // Handle bulk assignment
        if (assignAll) {
            // Get all users based on filter criteria
            const userQuery = {};
            
            // Apply filters
            if (filterCriteria.status) {
                userQuery.status = filterCriteria.status;
            }
            if (filterCriteria.minBalance !== undefined) {
                userQuery.balance = { $gte: filterCriteria.minBalance };
            }
            if (filterCriteria.maxBalance !== undefined) {
                userQuery.balance = userQuery.balance || {};
                userQuery.balance.$lte = filterCriteria.maxBalance;
            }
            if (filterCriteria.minDeposit !== undefined) {
                userQuery.totalDeposit = { $gte: filterCriteria.minDeposit };
            }
            if (filterCriteria.registrationDateFrom) {
                userQuery.createdAt = { $gte: new Date(filterCriteria.registrationDateFrom) };
            }
            if (filterCriteria.registrationDateTo) {
                userQuery.createdAt = userQuery.createdAt || {};
                userQuery.createdAt.$lte = new Date(filterCriteria.registrationDateTo);
            }

            const users = await User.find(userQuery).select('_id username email');
            
            assignedUsers = users.map(user => ({
                userId: user._id,
                username: user.username,
                email: user.email,
                assignedAt: new Date(),
                status: 'pending'
            }));

            assignedCount = users.length;
        } else if (userIds && Array.isArray(userIds)) {
            // Assign specific users
            const users = await User.find({ _id: { $in: userIds } }).select('_id username email');
            
            assignedUsers = users.map(user => ({
                userId: user._id,
                username: user.username,
                email: user.email,
                assignedAt: new Date(),
                status: 'pending'
            }));

            assignedCount = users.length;
        } else {
            return res.status(400).json({
                success: false,
                error: "Either userIds array or assignAll flag must be provided"
            });
        }

        // Add users to bonus
        bonus.assignedUsers = bonus.assignedUsers || [];
        
        // Remove duplicates (users already assigned)
        const existingUserIds = new Set(bonus.assignedUsers.map(au => au.userId.toString()));
        const newUsers = assignedUsers.filter(user => !existingUserIds.has(user.userId.toString()));
        
        bonus.assignedUsers.push(...newUsers);
        bonus.updatedAt = new Date();
        
        await bonus.save();

        // Populate response data
        await bonus.populate("assignedUsers.userId", "username email");

        res.status(200).json({
            success: true,
            message: `Successfully assigned ${newUsers.length} users to bonus "${bonus.name}"`,
            data: {
                bonus: {
                    id: bonus._id,
                    name: bonus.name,
                    bonusCode: bonus.bonusCode,
                    distributionType: bonus.distributionType
                },
                assignedUsers: newUsers.map(user => ({
                    userId: user.userId,
                    username: user.username,
                    email: user.email,
                    assignedAt: user.assignedAt
                })),
                stats: {
                    totalAssigned: bonus.assignedUsers.length,
                    newlyAssigned: newUsers.length,
                    alreadyAssigned: assignedCount - newUsers.length
                }
            }
        });

    } catch (error) {
        console.error("Error assigning users to bonus:", error);
        
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                error: "Invalid bonus ID or user ID format"
            });
        }
        
        res.status(500).json({
            success: false,
            error: "Failed to assign users to bonus"
        });
    }
});

// @route   DELETE /api/admin/bonuses/:bonusId/assigned-users/:userId
// @desc    Remove a user from bonus assignment
admin_route.delete("/bonuses/:bonusId/assigned-users/:userId", async (req, res) => {
    try {
        const { bonusId, userId } = req.params;

        const bonus = await Bonus.findById(bonusId);
        if (!bonus) {
            return res.status(404).json({
                success: false,
                error: "Bonus not found"
            });
        }

        // Check if user is assigned
        const userIndex = bonus.assignedUsers.findIndex(
            au => au.userId.toString() === userId
        );

        if (userIndex === -1) {
            return res.status(404).json({
                success: false,
                error: "User is not assigned to this bonus"
            });
        }

        const removedUser = bonus.assignedUsers[userIndex];
        
        // Remove user from assigned list
        bonus.assignedUsers.splice(userIndex, 1);
        bonus.updatedAt = new Date();
        
        await bonus.save();

        res.status(200).json({
            success: true,
            message: "User removed from bonus assignment",
            data: {
                bonusId: bonus._id,
                bonusName: bonus.name,
                removedUser: {
                    userId: removedUser.userId,
                    status: removedUser.status
                },
                remainingAssignedUsers: bonus.assignedUsers.length
            }
        });

    } catch (error) {
        console.error("Error removing user from bonus:", error);
        res.status(500).json({
            success: false,
            error: "Failed to remove user from bonus assignment"
        });
    }
});

// @route   GET /api/admin/bonuses/:id/assigned-users
// @desc    Get all users assigned to a bonus
admin_route.get("/bonuses/:id/assigned-users", async (req, res) => {
    try {
        const bonusId = req.params.id;
        const { 
            page = 1, 
            limit = 20, 
            status,
            search 
        } = req.query;

        const bonus = await Bonus.findById(bonusId)
            .populate({
                path: "assignedUsers.userId",
                select: "username email player_id status balance bonusBalance createdAt",
                match: search ? {
                    $or: [
                        { username: { $regex: search, $options: "i" } },
                        { email: { $regex: search, $options: "i" } },
                        { player_id: { $regex: search, $options: "i" } }
                    ]
                } : {}
            });

        if (!bonus) {
            return res.status(404).json({
                success: false,
                error: "Bonus not found"
            });
        }

        // Filter assigned users by status if provided
        let assignedUsers = bonus.assignedUsers || [];
        
        if (status && status !== "all") {
            assignedUsers = assignedUsers.filter(au => au.status === status);
        }

        // Remove users where userId is null (from search filter)
        assignedUsers = assignedUsers.filter(au => au.userId !== null);

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const paginatedUsers = assignedUsers.slice(skip, skip + parseInt(limit));

        // Format response
        const formattedUsers = paginatedUsers.map(au => ({
            assignmentId: au._id,
            userId: au.userId._id,
            username: au.userId.username,
            email: au.userId.email,
            player_id: au.userId.player_id,
            status: au.userId.status,
            balance: au.userId.balance,
            bonusBalance: au.userId.bonusBalance,
            accountCreated: au.userId.createdAt,
            assignmentStatus: au.status,
            assignedAt: au.assignedAt,
            claimedAt: au.claimedAt,
            expiresAt: au.expiresAt
        }));

        res.status(200).json({
            success: true,
            data: {
                bonus: {
                    id: bonus._id,
                    name: bonus.name,
                    bonusCode: bonus.bonusCode,
                    distributionType: bonus.distributionType,
                    totalAssignedUsers: assignedUsers.length
                },
                assignedUsers: formattedUsers,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: assignedUsers.length,
                    pages: Math.ceil(assignedUsers.length / parseInt(limit))
                },
                stats: {
                    pending: assignedUsers.filter(au => au.status === 'pending').length,
                    claimed: assignedUsers.filter(au => au.status === 'claimed').length,
                    expired: assignedUsers.filter(au => au.status === 'expired').length
                }
            }
        });

    } catch (error) {
        console.error("Error fetching assigned users:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch assigned users"
        });
    }
});

// ==================== USER MANAGEMENT ROUTES ====================

// GET users with pagination and search
admin_route.get("/users", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = req.query;

    let filter = {};

    // Search filter
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    // Status filter
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get users with pagination
    const users = await User.find(filter)
      .select('_id username email firstName lastName phone status balance bonusBalance createdAt lastLogin')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination info
    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users"
    });
  }
});

// GET user details by ID
admin_route.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch user"
    });
  }
});

// GET users by multiple IDs (for bulk operations)
admin_route.post("/users/by-ids", async (req, res) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        error: "User IDs array is required"
      });
    }

    const users = await User.find({
      _id: { $in: userIds }
    }).select('_id username email firstName lastName');

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error("Error fetching users by IDs:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users"
    });
  }
});
// ======================== ADMIN KYC MANAGEMENT ROUTES ========================

// @route   GET /api/admin/kyc/pending
// @desc    Get all pending KYC submissions

admin_route.get("/kyc", ensureadminAuthenticated, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            sortBy = "submittedAt", 
            sortOrder = "desc",
            status // New parameter to filter by KYC status
        } = req.query;

        // Build query for KYC submissions
        const query = { 
            'kycInfo.fullLegalName': { $exists: true, $ne: null }
        };

        // Add status filter if provided
        if (status && status !== 'all') {
            query.kycStatus = status;
        }

        // Add search filter
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { player_id: { $regex: search, $options: 'i' } },
                { 'kycInfo.fullLegalName': { $regex: search, $options: 'i' } },
                { 'kycInfo.voterIdNumber': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = {};
        
        // Handle sorting for both kycInfo fields and regular fields
        if (sortBy.includes('kycInfo.')) {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else if (sortBy === 'username' || sortBy === 'email' || sortBy === 'player_id') {
            sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
        } else {
            // Default to kycInfo.submittedAt
            sort['kycInfo.submittedAt'] = sortOrder === 'desc' ? -1 : 1;
        }

        // Fetch KYC submissions with pagination
        const kycSubmissions = await UserModel.find(query)
            .select('username email player_id kycInfo kycDocuments createdAt status kycStatus')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await UserModel.countDocuments(query);

        // Get counts for each status
        const statusCounts = {
            all: await UserModel.countDocuments({ 'kycInfo.fullLegalName': { $exists: true, $ne: null } }),
            pending: await UserModel.countDocuments({ 
                kycStatus: 'pending',
                'kycInfo.fullLegalName': { $exists: true, $ne: null }
            }),
            approved: await UserModel.countDocuments({ 
                kycStatus: 'approved',
                'kycInfo.fullLegalName': { $exists: true, $ne: null }
            }),
            rejected: await UserModel.countDocuments({ 
                kycStatus: 'rejected',
                'kycInfo.fullLegalName': { $exists: true, $ne: null }
            })
        };

        res.status(200).json({
            success: true,
            data: kycSubmissions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            statusCounts
        });

    } catch (error) {
        console.error("Error fetching KYC submissions:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch KYC submissions"
        });
    }
});

admin_route.get("/kyc/pending", ensureadminAuthenticated, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search, 
            sortBy = "submittedAt", 
            sortOrder = "desc" 
        } = req.query;

        // Build query for pending KYC
        const query = { 
            kycStatus: 'pending',
            'kycInfo.fullLegalName': { $exists: true, $ne: null }
        };

        // Add search filter
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { player_id: { $regex: search, $options: 'i' } },
                { 'kycInfo.fullLegalName': { $regex: search, $options: 'i' } },
                { 'kycInfo.voterIdNumber': { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = {};
        sort[`kycInfo.${sortBy}`] = sortOrder === 'desc' ? -1 : 1;

        // Fetch pending KYC submissions with pagination
        const pendingKYC = await UserModel.find(query)
            .select('username email player_id kycInfo kycDocuments createdAt status')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await UserModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: pendingKYC,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching pending KYC:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch pending KYC submissions"
        });
    }
});

// @route   GET /api/admin/kyc/verified
// @desc    Get all verified KYC submissions
admin_route.get("/kyc/verified", ensureadminAuthenticated, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search,
            startDate,
            endDate
        } = req.query;

        // Build query for verified KYC
        const query = { 
            kycStatus: 'verified'
        };

        // Add search filter
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { player_id: { $regex: search, $options: 'i' } },
                { 'kycInfo.fullLegalName': { $regex: search, $options: 'i' } }
            ];
        }

        // Date range filter for verification date
        if (startDate || endDate) {
            query['kycInfo.verifiedAt'] = {};
            if (startDate) query['kycInfo.verifiedAt'].$gte = new Date(startDate);
            if (endDate) query['kycInfo.verifiedAt'].$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const verifiedKYC = await UserModel.find(query)
            .select('username email player_id kycInfo kycDocuments createdAt')
            .sort({ 'kycInfo.verifiedAt': -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await UserModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: verifiedKYC,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching verified KYC:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch verified KYC submissions"
        });
    }
});

// @route   GET /api/admin/kyc/rejected
// @desc    Get all rejected KYC submissions
admin_route.get("/kyc/rejected", ensureadminAuthenticated, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            search,
            startDate,
            endDate
        } = req.query;

        const query = { 
            kycStatus: 'rejected'
        };

        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { player_id: { $regex: search, $options: 'i' } },
                { 'kycInfo.fullLegalName': { $regex: search, $options: 'i' } },
                { 'kycInfo.rejectionReason': { $regex: search, $options: 'i' } }
            ];
        }

        if (startDate || endDate) {
            query['kycInfo.submittedAt'] = {};
            if (startDate) query['kycInfo.submittedAt'].$gte = new Date(startDate);
            if (endDate) query['kycInfo.submittedAt'].$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const rejectedKYC = await UserModel.find(query)
            .select('username email player_id kycInfo kycDocuments createdAt')
            .sort({ 'kycInfo.submittedAt': -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await UserModel.countDocuments(query);

        res.status(200).json({
            success: true,
            data: rejectedKYC,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching rejected KYC:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch rejected KYC submissions"
        });
    }
});

// @route   GET /api/admin/kyc/:userId
// @desc    Get KYC details for a specific user
admin_route.get("/kyc/:userId", ensureadminAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await UserModel.findById(userId)
            .select('username email player_id kycStatus kycInfo kycDocuments createdAt isEmailVerified phone');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Calculate age from date of birth
        let age = null;
        if (user.kycInfo?.dateOfBirth) {
            const birthDate = new Date(user.kycInfo.dateOfBirth);
            const today = new Date();
            age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
        }

        res.status(200).json({
            success: true,
            data: {
                userInfo: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    player_id: user.player_id,
                    phone: user.phone,
                    emailVerified: user.isEmailVerified,
                    accountCreated: user.createdAt
                },
                kycInfo: user.kycInfo,
                kycStatus: user.kycStatus,
                kycDocuments: user.kycDocuments,
                calculatedAge: age,
                verificationProgress: {
                    email: user.isEmailVerified,
                    phone: !!user.phone,
                    kycSubmitted: user.kycStatus !== 'unverified',
                    documentsUploaded: user.kycDocuments && user.kycDocuments.length > 0
                }
            }
        });

    } catch (error) {
        console.error("Error fetching user KYC details:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch KYC details"
        });
    }
});

// @route   PUT /api/admin/kyc/:userId/verify
// @desc    Verify/Approve KYC submission
admin_route.put("/kyc/:userId/verify", ensureadminAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            adminId, 
            adminUsername, 
            notes = "KYC verified by admin",
            verificationDate = new Date().toISOString()
        } = req.body;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check current KYC status
        if (user.kycStatus === 'verified') {
            return res.status(400).json({
                success: false,
                message: "KYC is already verified"
            });
        }

        if (user.kycStatus === 'unverified') {
            return res.status(400).json({
                success: false,
                message: "User has not submitted KYC information"
            });
        }

        // Store previous KYC status and info for history
        const previousKycStatus = user.kycStatus;
        const previousKycInfo = { ...user.kycInfo };
        
        // Create KYC history entry
        const kycHistoryEntry = {
            action: 'verification',
            previousStatus: previousKycStatus,
            newStatus: 'verified',
            notes: notes,
            verifiedAt: new Date(verificationDate),
            kycInfoSnapshot: {
                firstName: user.kycInfo.firstName,
                lastName: user.kycInfo.lastName,
                dateOfBirth: user.kycInfo.dateOfBirth,
                idType: user.kycInfo.idType,
                idNumber: user.kycInfo.idNumber,
                address: user.kycInfo.address,
                city: user.kycInfo.city,
                country: user.kycInfo.country,
                postalCode: user.kycInfo.postalCode
            },
            documentsSnapshot: user.kycDocuments ? user.kycDocuments.map(doc => ({
                documentType: doc.documentType,
                documentUrl: doc.documentUrl,
                status: doc.status,
                uploadedAt: doc.uploadedAt
            })) : [],
            timestamp: new Date(),
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };

        // Add to KYC history
        if (!user.kycHistory) {
            user.kycHistory = [];
        }
        user.kycHistory.push(kycHistoryEntry);

        // Verify KYC
        user.kycStatus = 'verified';
        user.kycCompleted = true;
        user.kycInfo.verifiedAt = new Date(verificationDate);
        user.kycInfo.verifiedBy = adminId;
        user.kycInfo.adminNotes = notes;
        user.kycInfo.lastUpdated = new Date();

        // Update all KYC documents to verified status
        if (user.kycDocuments && user.kycDocuments.length > 0) {
            user.kycDocuments = user.kycDocuments.map(doc => ({
                ...doc.toObject(),
                status: 'verified',
                verifiedAt: new Date(verificationDate),
                verifiedBy: adminUsername,
                lastUpdated: new Date()
            }));
        }

        // Add admin note about verification
        user.notes.push({
            note: `KYC verified by admin ${adminUsername}. ${notes}`,
            createdBy: adminUsername,
            createdAt: new Date(),
            type: 'kyc_verification'
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "KYC verified successfully",
            data: {
                userId: user._id,
                username: user.username,
                kycStatus: user.kycStatus,
                verifiedAt: user.kycInfo.verifiedAt,
                verifiedBy: adminUsername,
                notes: notes,
                historyId: kycHistoryEntry._id
            }
        });

    } catch (error) {
        console.error("Error verifying KYC:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify KYC",
            error: error.message
        });
    }
});

// @route   PUT /api/admin/kyc/:userId/reject
// @desc    Reject KYC submission
admin_route.put("/kyc/:userId/reject", ensureadminAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            adminId, 
            adminUsername, 
            rejectionReason, 
            notes = "KYC rejected by admin",
            allowResubmission = true
        } = req.body;

        if (!rejectionReason || rejectionReason.trim() === '') {
            return res.status(400).json({
                success: false,
                message: "Rejection reason is required"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check current KYC status
        if (user.kycStatus === 'rejected') {
            return res.status(400).json({
                success: false,
                message: "KYC is already rejected"
            });
        }

        if (user.kycStatus === 'unverified') {
            return res.status(400).json({
                success: false,
                message: "User has not submitted KYC information"
            });
        }

        // Store previous KYC status and info for history
        const previousKycStatus = user.kycStatus;
        const previousKycInfo = { ...user.kycInfo };
        
        // Create KYC history entry
        const kycHistoryEntry = {
            action: 'rejection',
            previousStatus: previousKycStatus,
            newStatus: 'rejected',
            adminId: adminId,
            adminUsername: adminUsername,
            rejectionReason: rejectionReason,
            notes: notes,
            allowResubmission: allowResubmission,
            rejectedAt: new Date(),
            kycInfoSnapshot: {
                fullLegalName: user.kycInfo?.fullLegalName,
                dateOfBirth: user.kycInfo?.dateOfBirth,
                voterIdNumber: user.kycInfo?.voterIdNumber,
                nationality: user.kycInfo?.nationality,
                permanentAddress: user.kycInfo?.permanentAddress,
                presentAddress: user.kycInfo?.presentAddress
            },
            documentsSnapshot: user.kycDocuments ? user.kycDocuments.map(doc => ({
                documentType: doc.documentType,
                frontImage: doc.frontImage,
                backImage: doc.backImage,
                status: doc.status,
                submittedAt: doc.submittedAt
            })) : [],
            timestamp: new Date(),
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };

        // Add to KYC history
        if (!user.kycHistory) {
            user.kycHistory = [];
        }
        user.kycHistory.push(kycHistoryEntry);

        // ========== UPDATE KYC REJECTION COUNT ==========
        // Increment the rejected count
        if (!user.kycRejectedCount) {
            user.kycRejectedCount = 0;
        }
        user.kycRejectedCount += 1;

        // Add rejection to the rejections array
        const rejectionEntry = {
            rejectedAt: new Date(),
            rejectedBy: adminId,
            reason: rejectionReason,
            previousStatus: previousKycStatus,
            adminUsername: adminUsername,
            notes: notes
        };

        if (!user.kycRejections) {
            user.kycRejections = [];
        }
        user.kycRejections.push(rejectionEntry);
        // ========== END KYC REJECTION COUNT UPDATE ==========

        // Reject KYC
        user.kycStatus = 'rejected';
        user.kycInfo.rejectionReason = rejectionReason;
        user.kycInfo.rejectedAt = new Date();
        user.kycInfo.rejectedBy = adminId;
        user.kycInfo.adminNotes = notes;
        user.kycInfo.canResubmit = allowResubmission;
        user.kycInfo.lastUpdated = new Date();

        // Update all KYC documents to rejected status
        if (user.kycDocuments && user.kycDocuments.length > 0) {
            user.kycDocuments = user.kycDocuments.map(doc => ({
                ...doc.toObject(),
                status: 'rejected',
                rejectionReason: rejectionReason,
                lastUpdated: new Date()
            }));
        }

        // Add admin note about rejection
        user.notes.push({
            note: `KYC rejected by admin ${adminUsername}. Reason: ${rejectionReason}. Rejection count: ${user.kycRejectedCount}. ${notes}`,
            createdBy: adminUsername,
            createdAt: new Date(),
            type: 'kyc_rejection'
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "KYC rejected successfully",
            data: {
                userId: user._id,
                username: user.username,
                kycStatus: user.kycStatus,
                kycRejectedCount: user.kycRejectedCount,
                rejectionReason: rejectionReason,
                rejectedAt: user.kycInfo.rejectedAt,
                rejectedBy: adminUsername,
                notes: notes,
                canResubmit: allowResubmission,
                historyId: kycHistoryEntry._id,
                totalRejections: user.kycRejections?.length || 0
            }
        });

    } catch (error) {
        console.error("Error rejecting KYC:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject KYC",
            error: error.message
        });
    }
});

// @route   PUT /api/admin/kyc/:userId/request-resubmission
// @desc    Request KYC resubmission
admin_route.put("/kyc/:userId/request-resubmission", ensureadminAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { 
            adminId, 
            adminUsername, 
            reason, 
            requiredDocuments = [],
            deadlineDays = 7
        } = req.body;

        if (!adminId || !adminUsername || !reason) {
            return res.status(400).json({
                success: false,
                message: "Admin ID, username, and reason are required"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.kycStatus !== 'rejected') {
            return res.status(400).json({
                success: false,
                message: "Only rejected KYC can be requested for resubmission"
            });
        }

        // Calculate deadline date
        const deadlineDate = new Date();
        deadlineDate.setDate(deadlineDate.getDate() + deadlineDays);

        // Update KYC status to pending for resubmission
        user.kycStatus = 'pending';
        user.kycInfo.resubmissionRequested = true;
        user.kycInfo.resubmissionReason = reason;
        user.kycInfo.resubmissionRequestedBy = adminId;
        user.kycInfo.resubmissionRequestedAt = new Date();
        user.kycInfo.resubmissionDeadline = deadlineDate;
        user.kycInfo.requiredDocuments = requiredDocuments;

        // Add admin note
        user.notes.push({
            note: `KYC resubmission requested by admin ${adminUsername}. Reason: ${reason}. Required documents: ${requiredDocuments.join(', ')}. Deadline: ${deadlineDate.toDateString()}`,
            createdBy: adminUsername,
            createdAt: new Date()
        });

        // Add activity log
        user.transactionHistory.push({
            type: 'kyc_resubmission_request',
            amount: 0,
            balanceBefore: user.balance,
            balanceAfter: user.balance,
            description: `KYC resubmission requested by admin ${adminUsername}`,
            referenceId: `KYC-RESUBMIT-${Date.now()}`,
            createdAt: new Date(),
            details: {
                adminId,
                adminUsername,
                reason,
                requiredDocuments,
                deadlineDays,
                deadlineDate
            }
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "KYC resubmission requested successfully",
            data: {
                userId: user._id,
                username: user.username,
                kycStatus: user.kycStatus,
                reason: reason,
                requestedBy: adminUsername,
                requestedAt: user.kycInfo.resubmissionRequestedAt,
                deadline: deadlineDate,
                requiredDocuments: requiredDocuments
            }
        });

    } catch (error) {
        console.error("Error requesting KYC resubmission:", error);
        res.status(500).json({
            success: false,
            message: "Failed to request KYC resubmission"
        });
    }
});

// @route   DELETE /api/admin/kyc/:userId/documents/:docIndex
// @desc    Delete a specific KYC document (admin only)
admin_route.delete("/kyc/:userId/documents/:docIndex", ensureadminAuthenticated, async (req, res) => {
    try {
        const { userId, docIndex } = req.params;
        const { adminId, adminUsername, reason } = req.body;

        if (!adminId || !adminUsername || !reason) {
            return res.status(400).json({
                success: false,
                message: "Admin ID, username, and deletion reason are required"
            });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const index = parseInt(docIndex);
        if (isNaN(index) || index < 0 || index >= user.kycDocuments.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid document index"
            });
        }

        const document = user.kycDocuments[index];

        // Delete the file from server
        if (document.frontImage) {
            const frontImagePath = path.join(__dirname, '..', 'uploads', 'kyc-documents', document.frontImage.split('/').pop());
            if (fs.existsSync(frontImagePath)) {
                fs.unlinkSync(frontImagePath);
            }
        }

        if (document.backImage) {
            const backImagePath = path.join(__dirname, '..', 'uploads', 'kyc-documents', document.backImage.split('/').pop());
            if (fs.existsSync(backImagePath)) {
                fs.unlinkSync(backImagePath);
            }
        }

        // Remove document from array
        user.kycDocuments.splice(index, 1);

        // Add admin note
        user.notes.push({
            note: `KYC document deleted by admin ${adminUsername}. Document type: ${document.documentType}. Reason: ${reason}`,
            createdBy: adminUsername,
            createdAt: new Date()
        });

        // Add activity log
        user.transactionHistory.push({
            type: 'kyc_document_deleted',
            amount: 0,
            balanceBefore: user.balance,
            balanceAfter: user.balance,
            description: `KYC document deleted by admin ${adminUsername}`,
            referenceId: `KYC-DOC-DELETE-${Date.now()}`,
            createdAt: new Date(),
            details: {
                adminId,
                adminUsername,
                documentType: document.documentType,
                reason
            }
        });

        await user.save();

        res.status(200).json({
            success: true,
            message: "KYC document deleted successfully",
            data: {
                deletedDocument: document.documentType,
                remainingDocuments: user.kycDocuments.length
            }
        });

    } catch (error) {
        console.error("Error deleting KYC document:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete KYC document"
        });
    }
});
// ======================== SIMPLE KYC SUBMISSION STATUS ROUTE ========================

// @route   PUT /api/admin/kyc/:userId/submit-status
// @desc    Change KYC submission status (true/false)
admin_route.put("/kyc/:userId/submit-status", ensureadminAuthenticated, async (req, res) => {
    try {
        const { userId } = req.params;
        const { kycSubmitted } = req.body;

        // Validate input
        if (kycSubmitted === undefined || typeof kycSubmitted !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "kycSubmitted field is required and must be a boolean (true/false)"
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

        // Update KYC submission status
        user.kycSubmitted = kycSubmitted;
        
        // If setting to false, also set kycCompleted to false
        if (!kycSubmitted) {
            user.kycCompleted = false;
        }
        
        // Save changes
        await user.save();

        res.status(200).json({
            success: true,
            message: `KYC submission status updated to ${kycSubmitted} for user ${user.username}`,
            data: {
                userId: user._id,
                username: user.username,
                kycSubmitted: user.kycSubmitted,
                kycCompleted: user.kycCompleted,
                updatedAt: new Date()
            }
        });

    } catch (error) {
        console.error("Error updating KYC submission status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update KYC submission status",
            error: error.message
        });
    }
});
// @route   GET /api/admin/kyc/stats
// @desc    Get KYC statistics
admin_route.get("/kyc/stats", ensureadminAuthenticated, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        // Get counts for each status
        const [totalPending, totalVerified, totalRejected, totalUnverified] = await Promise.all([
            UserModel.countDocuments({ kycStatus: 'pending' }),
            UserModel.countDocuments({ kycStatus: 'verified' }),
            UserModel.countDocuments({ kycStatus: 'rejected' }),
            UserModel.countDocuments({ kycStatus: 'unverified' })
        ]);

        // Recent submissions (last 7 days)
        const recentSubmissions = await UserModel.countDocuments({
            kycStatus: { $in: ['pending', 'verified', 'rejected'] },
            'kycInfo.submittedAt': { $gte: weekAgo }
        });

        // Average verification time (for verified KYC)
        const verifiedKYC = await UserModel.aggregate([
            { $match: { kycStatus: 'verified', 'kycInfo.submittedAt': { $exists: true }, 'kycInfo.verifiedAt': { $exists: true } } },
            {
                $project: {
                    verificationTime: {
                        $divide: [
                            { $subtract: ['$kycInfo.verifiedAt', '$kycInfo.submittedAt'] },
                            1000 * 60 * 60 // Convert to hours
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    averageVerificationTime: { $avg: '$verificationTime' },
                    minVerificationTime: { $min: '$verificationTime' },
                    maxVerificationTime: { $max: '$verificationTime' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // KYC completion rate (users with submitted KYC vs total users)
        const totalUsers = await UserModel.countDocuments({});
        const kycSubmitted = totalVerified + totalPending + totalRejected;
        const completionRate = totalUsers > 0 ? (kycSubmitted / totalUsers) * 100 : 0;

        // Daily verification stats
        const dailyStats = await UserModel.aggregate([
            {
                $match: {
                    kycStatus: 'verified',
                    'kycInfo.verifiedAt': { $gte: weekAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$kycInfo.verifiedAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totals: {
                    pending: totalPending,
                    verified: totalVerified,
                    rejected: totalRejected,
                    unverified: totalUnverified,
                    totalUsers: totalUsers,
                    kycSubmitted: kycSubmitted
                },
                percentages: {
                    completionRate: Math.round(completionRate * 100) / 100,
                    verificationRate: kycSubmitted > 0 ? Math.round((totalVerified / kycSubmitted) * 10000) / 100 : 0,
                    rejectionRate: kycSubmitted > 0 ? Math.round((totalRejected / kycSubmitted) * 10000) / 100 : 0
                },
                recentActivity: {
                    submissionsLast7Days: recentSubmissions,
                    dailyVerifications: dailyStats
                },
                verificationPerformance: verifiedKYC[0] || {
                    averageVerificationTime: 0,
                    minVerificationTime: 0,
                    maxVerificationTime: 0,
                    count: 0
                }
            }
        });

    } catch (error) {
        console.error("Error fetching KYC statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch KYC statistics"
        });
    }
});

// @route   GET /api/admin/kyc/expiring
// @desc    Get KYC submissions that are about to expire (for resubmission requests)
admin_route.get("/kyc/expiring", ensureadminAuthenticated, async (req, res) => {
    try {
        const { daysThreshold = 3 } = req.query;
        
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + parseInt(daysThreshold));

        // Find KYC submissions with resubmission deadlines approaching
        const expiringKYC = await UserModel.find({
            kycStatus: 'pending',
            'kycInfo.resubmissionDeadline': {
                $lte: thresholdDate,
                $gte: new Date() // Not expired yet
            }
        })
        .select('username email player_id kycInfo kycDocuments')
        .sort({ 'kycInfo.resubmissionDeadline': 1 });

        res.status(200).json({
            success: true,
            data: {
                expiringCount: expiringKYC.length,
                thresholdDays: parseInt(daysThreshold),
                thresholdDate: thresholdDate,
                submissions: expiringKYC.map(user => ({
                    userId: user._id,
                    username: user.username,
                    email: user.email,
                    deadline: user.kycInfo.resubmissionDeadline,
                    daysRemaining: Math.ceil((user.kycInfo.resubmissionDeadline - new Date()) / (1000 * 60 * 60 * 24)),
                    requiredDocuments: user.kycInfo.requiredDocuments || [],
                    resubmissionReason: user.kycInfo.resubmissionReason
                }))
            }
        });

    } catch (error) {
        console.error("Error fetching expiring KYC:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch expiring KYC submissions"
        });
    }
});

admin_route.post("/kyc/bulk-verify", ensureadminAuthenticated, async (req, res) => {
    try {
        const { 
            userIds, 
            adminId, 
            adminUsername, 
            notes = "Bulk KYC verification by admin"
        } = req.body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User IDs array is required"
            });
        }

        if (!adminId || !adminUsername) {
            return res.status(400).json({
                success: false,
                message: "Admin ID and username are required"
            });
        }

        const results = {
            total: userIds.length,
            verified: 0,
            failed: 0,
            skipped: 0,
            details: []
        };

        const verificationDate = new Date();

        for (const userId of userIds) {
            try {
                const user = await UserModel.findById(userId);
                
                if (!user) {
                    results.failed++;
                    results.details.push({
                        userId,
                        status: 'failed',
                        reason: 'User not found'
                    });
                    continue;
                }

                if (user.kycStatus === 'verified') {
                    results.skipped++;
                    results.details.push({
                        userId,
                        status: 'skipped',
                        reason: 'Already verified'
                    });
                    continue;
                }

                if (user.kycStatus === 'unverified') {
                    results.failed++;
                    results.details.push({
                        userId,
                        status: 'failed',
                        reason: 'No KYC submitted'
                    });
                    continue;
                }

                // Verify the user
                user.kycStatus = 'verified';
                user.kycInfo.verifiedAt = verificationDate;
                user.kycInfo.verifiedBy = adminId;
                user.kycInfo.adminNotes = notes;

                // Update documents
                if (user.kycDocuments && user.kycDocuments.length > 0) {
                    user.kycDocuments = user.kycDocuments.map(doc => ({
                        ...doc.toObject(),
                        status: 'verified',
                        verifiedAt: verificationDate
                    }));
                }

                // Add note
                user.notes.push({
                    note: `KYC bulk verified by admin ${adminUsername}. ${notes}`,
                    createdBy: adminUsername,
                    createdAt: verificationDate
                });

                await user.save();
                
                results.verified++;
                results.details.push({
                    userId,
                    status: 'verified',
                    username: user.username
                });

            } catch (error) {
                results.failed++;
                results.details.push({
                    userId,
                    status: 'failed',
                    reason: error.message
                });
                console.error(`Error verifying user ${userId}:`, error);
            }
        }

        res.status(200).json({
            success: true,
            message: `Bulk KYC verification completed: ${results.verified} verified, ${results.skipped} skipped, ${results.failed} failed`,
            data: results
        });

    } catch (error) {
        console.error("Error in bulk KYC verification:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process bulk KYC verification"
        });
    }
});

// ------------------------weeklyand-monthly-bonus-calculation-route-------------------------------
// ======================== WEEKLY BONUS ROUTE ========================
// ======================== WEEKLY BONUS ROUTE ========================

admin_route.post("/bonus/weekly", ensureadminAuthenticated, async (req, res) => {
    try {
        const { 
            adminId, 
            adminUsername, 
            notes = "Weekly bonus distribution",
            date = new Date().toISOString().split('T')[0]
        } = req.body;

        // Validate admin info
        if (!adminId || !adminUsername) {
            return res.status(400).json({
                success: false,
                message: "Admin ID and username are required"
            });
        }

        // Find all users with weeklybetamount > 0
        const users = await UserModel.find({
            weeklybetamount: { $gt: 0 }
        }).select('_id username email player_id balance weeklybetamount transactionHistory bonusHistory');

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found with weekly bet amounts"
            });
        }

        const results = {
            totalUsers: users.length,
            totalBonusAmount: 0,
            creditedUsers: 0,
            failedUsers: 0,
            details: []
        };

        // Process each user
        for (const user of users) {
            try {
                // Calculate bonus amount: weeklybetamount * 0.008 (0.8%)
                const bonusAmount = parseFloat((user.weeklybetamount * 0.008).toFixed(2));
                
                if (bonusAmount <= 0) {
                    results.failedUsers++;
                    results.details.push({
                        userId: user._id,
                        username: user.username,
                        status: 'failed',
                        reason: 'Bonus amount is zero or negative',
                        betAmount: user.weeklybetamount,
                        bonusAmount: 0
                    });
                    continue;
                }

                // Store original weekly bet amount before resetting
                const originalBetAmount = user.weeklybetamount;
                
                // Reset weeklybetamount to 0 (user gets bonus based on their bet amount)
                user.weeklybetamount = 0;

                // Initialize transactionHistory if undefined
                if (!user.transactionHistory) {
                    user.transactionHistory = [];
                }

                // Add pending transaction history (not added to balance yet)
                user.transactionHistory.push({
                    type: 'bonus_pending',
                    amount: bonusAmount,
                    description: `Weekly bonus pending - Based on weekly bet amount (0.8%) - ${notes}`,
                    referenceId: `WEEKLY-BONUS-PENDING-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    createdAt: new Date(),
                    status: 'pending',
                    details: {
                        bonusType: 'weekly',
                        weeklyBetAmount: originalBetAmount,
                        bonusRate: 0.008,
                        bonusPercentage: '0.8%',
                        processedBy: adminUsername,
                        date: date,
                        status: 'unclaimed'
                    }
                });

                // Initialize bonusHistory if undefined
                if (!user.bonusHistory) {
                    user.bonusHistory = [];
                }

                // Add to bonus history with unclaimed status
                user.bonusHistory.push({
                    type: 'weekly',
                    amount: bonusAmount,
                    totalBet: originalBetAmount,
                    createdAt: new Date(),
                    status: 'unclaimed',
                    claimedAt: null,
                    bonusRate: 0.008,
                    bonusPercentage: '0.8%',
                    processedBy: adminUsername
                });

                // Save user changes (only resets weeklybetamount, doesn't add to balance)
                await user.save();

                // Create bonus history record with unclaimed status
                const bonusHistory = new BonusHistory({
                    userId: user._id,
                    username: user.username,
                    bonusType: 'weekly',
                    betAmount: originalBetAmount,
                    bonusAmount: bonusAmount,
                    bonusRate: 0.008,
                    bonusPercentage: '0.8%',
                    status: 'unclaimed',
                    creditedAt: new Date(),
                    claimedAt: null,
                    notes: `${notes} - Processed by ${adminUsername}. User needs to claim this bonus.`,
                    adminInfo: {
                        adminId: adminId,
                        adminUsername: adminUsername
                    },
                    distributionDate: date
                });

                await bonusHistory.save();

                results.totalBonusAmount += bonusAmount;
                results.creditedUsers++;
                results.details.push({
                    userId: user._id,
                    username: user.username,
                    status: 'unclaimed',
                    betAmount: originalBetAmount,
                    bonusAmount: bonusAmount,
                    historyId: bonusHistory._id
                });

            } catch (userError) {
                console.error(`Error processing user ${user.username}:`, userError);
                results.failedUsers++;
                results.details.push({
                    userId: user._id,
                    username: user.username,
                    status: 'failed',
                    reason: userError.message,
                    betAmount: user.weeklybetamount,
                    bonusAmount: 0
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Weekly bonus distribution completed successfully. All bonuses are in unclaimed status.`,
            summary: {
                date: date,
                totalUsersProcessed: results.totalUsers,
                creditedUsers: results.creditedUsers,
                failedUsers: results.failedUsers,
                totalBonusAmount: results.totalBonusAmount.toFixed(2),
                averageBonus: (results.totalBonusAmount / (results.creditedUsers || 1)).toFixed(2),
                bonusRate: '0.8% (0.008)',
                status: 'unclaimed'
            },
            results: results.details,
        });

    } catch (error) {
        console.error("Error in weekly bonus distribution:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process weekly bonus distribution",
            error: error.message
        });
    }
});

// ======================== MONTHLY BONUS ROUTE ========================

admin_route.post("/bonus/monthly", ensureadminAuthenticated, async (req, res) => {
    try {
        const { 
            adminId, 
            adminUsername, 
            notes = "Monthly bonus distribution",
            date = new Date().toISOString().split('T')[0],
            month = new Date().getMonth() + 1,
            year = new Date().getFullYear()
        } = req.body;

        // Validate admin info
        if (!adminId || !adminUsername) {
            return res.status(400).json({
                success: false,
                message: "Admin ID and username are required"
            });
        }

        // Find all users with monthlybetamount > 0
        const users = await UserModel.find({
            monthlybetamount: { $gt: 0 }
        }).select('_id username email player_id balance monthlybetamount transactionHistory bonusHistory');

        if (!users || users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found with monthly bet amounts"
            });
        }

        const results = {
            totalUsers: users.length,
            totalBonusAmount: 0,
            creditedUsers: 0,
            failedUsers: 0,
            details: []
        };

        // Process each user
        for (const user of users) {
            try {
                // Calculate bonus amount: monthlybetamount * 0.005 (0.5%)
                const bonusAmount = parseFloat((user.monthlybetamount * 0.005).toFixed(2));
                
                if (bonusAmount <= 0) {
                    results.failedUsers++;
                    results.details.push({
                        userId: user._id,
                        username: user.username,
                        status: 'failed',
                        reason: 'Bonus amount is zero or negative',
                        betAmount: user.monthlybetamount,
                        bonusAmount: 0
                    });
                    continue;
                }

                // Store original monthly bet amount before resetting
                const originalBetAmount = user.monthlybetamount;
                
                // Reset monthlybetamount to 0 (user gets bonus based on their bet amount)
                user.monthlybetamount = 0;

                // Initialize transactionHistory if undefined
                if (!user.transactionHistory) {
                    user.transactionHistory = [];
                }

                // Add pending transaction history (not added to balance yet)
                user.transactionHistory.push({
                    type: 'bonus_pending',
                    amount: bonusAmount,
                    description: `Monthly bonus pending - Based on monthly bet amount (0.5%) - ${notes}`,
                    referenceId: `MONTHLY-BONUS-PENDING-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    createdAt: new Date(),
                    status: 'pending',
                    details: {
                        bonusType: 'monthly',
                        monthlyBetAmount: originalBetAmount,
                        bonusRate: 0.005,
                        bonusPercentage: '0.5%',
                        processedBy: adminUsername,
                        date: date,
                        month: month,
                        year: year,
                        status: 'unclaimed'
                    }
                });

                // Initialize bonusHistory if undefined
                if (!user.bonusHistory) {
                    user.bonusHistory = [];
                }

                // Add to bonus history with unclaimed status
                user.bonusHistory.push({
                    type: 'monthly',
                    amount: bonusAmount,
                    totalBet: originalBetAmount,
                    createdAt: new Date(),
                    status: 'unclaimed',
                    claimedAt: null,
                    bonusRate: 0.005,
                    bonusPercentage: '0.5%',
                    processedBy: adminUsername,
                    month: month,
                    year: year
                });

                // Save user changes (only resets monthlybetamount, doesn't add to balance)
                await user.save();

                // Create bonus history record with unclaimed status
                const bonusHistory = new BonusHistory({
                    userId: user._id,
                    username: user.username,
                    bonusType: 'monthly',
                    betAmount: originalBetAmount,
                    bonusAmount: bonusAmount,
                    bonusRate: 0.005,
                    bonusPercentage: '0.5%',
                    status: 'unclaimed',
                    creditedAt: new Date(),
                    claimedAt: null,
                    notes: `${notes} - ${month}/${year} - Processed by ${adminUsername}. User needs to claim this bonus.`,
                    adminInfo: {
                        adminId: adminId,
                        adminUsername: adminUsername
                    },
                    distributionDate: date,
                    month: month,
                    year: year
                });

                await bonusHistory.save();

                results.totalBonusAmount += bonusAmount;
                results.creditedUsers++;
                results.details.push({
                    userId: user._id,
                    username: user.username,
                    status: 'unclaimed',
                    betAmount: originalBetAmount,
                    bonusAmount: bonusAmount,
                    historyId: bonusHistory._id
                });

            } catch (userError) {
                console.error(`Error processing user ${user.username}:`, userError);
                results.failedUsers++;
                results.details.push({
                    userId: user._id,
                    username: user.username,
                    status: 'failed',
                    reason: userError.message,
                    betAmount: user.monthlybetamount,
                    bonusAmount: 0
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `Monthly bonus distribution for ${month}/${year} completed successfully. All bonuses are in unclaimed status.`,
            summary: {
                date: date,
                month: month,
                year: year,
                totalUsersProcessed: results.totalUsers,
                creditedUsers: results.creditedUsers,
                failedUsers: results.failedUsers,
                totalBonusAmount: results.totalBonusAmount.toFixed(2),
                averageBonus: (results.totalBonusAmount / (results.creditedUsers || 1)).toFixed(2),
                bonusRate: '0.5% (0.005)',
                status: 'unclaimed'
            },
            results: results.details,
        });

    } catch (error) {
        console.error("Error in monthly bonus distribution:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process monthly bonus distribution",
            error: error.message
        });
    }
});

// ======================== BONUS HISTORY ROUTES ========================

admin_route.get("/bonus/history", ensureadminAuthenticated, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            bonusType,
            status,
            startDate,
            endDate,
            search,
            sortBy = "creditedAt",
            sortOrder = "desc"
        } = req.query;

        // Build query
        const query = {};

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

        // Search filter
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Sort configuration
        const sort = {};
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get bonus history with pagination
        const history = await BonusHistory.find(query)
            .populate('userId', 'username email player_id')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await BonusHistory.countDocuments(query);

        // Calculate summary statistics
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

        res.status(200).json({
            success: true,
            data: history,
            summary: summary,
            statusSummary: statusSummary,
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
            message: "Failed to fetch bonus history"
        });
    }
});

admin_route.get("/bonus/history/:userId", ensureadminAuthenticated, async (req, res) => {
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
        const query = { userId };

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

        // Get user's bonus history
        const history = await BonusHistory.find(query)
            .sort({ creditedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await BonusHistory.countDocuments(query);

        // Calculate user summary
        const userSummary = await BonusHistory.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$bonusType',
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    totalBetAmount: { $sum: '$betAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate user status summary
        const userStatusSummary = await BonusHistory.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: '$status',
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Calculate total unclaimed amount for this user
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

        // Get user info
        const user = await UserModel.findById(userId)
            .select('username email player_id balance weeklybetamount monthlybetamount');

        res.status(200).json({
            success: true,
            user: user,
            data: history,
            summary: userSummary,
            statusSummary: userStatusSummary,
            unclaimedSummary: unclaimedSummary[0] || { totalUnclaimedAmount: 0, count: 0 },
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching user bonus history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user bonus history"
        });
    }
});

admin_route.get("/bonus/stats", ensureadminAuthenticated, async (req, res) => {
    try {
        const { 
            startDate = new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
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
                    creditedAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$bonusType',
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    totalBetAmount: { $sum: '$betAmount' },
                    count: { $sum: 1 },
                    averageBonus: { $avg: '$bonusAmount' }
                }
            }
        ]);

        // Statistics by status
        const statsByStatus = await BonusHistory.aggregate([
            {
                $match: {
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
                    creditedAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$creditedAt" } },
                        bonusType: "$bonusType"
                    },
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.date": 1 }
            }
        ]);

        // Top 10 users by bonus received
        const topUsers = await BonusHistory.aggregate([
            {
                $match: {
                    creditedAt: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: '$userId',
                    username: { $first: '$username' },
                    totalBonusAmount: { $sum: '$bonusAmount' },
                    transactionCount: { $sum: 1 }
                }
            },
            {
                $sort: { totalBonusAmount: -1 }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userInfo'
                }
            },
            {
                $unwind: '$userInfo'
            },
            {
                $project: {
                    userId: '$_id',
                    username: '$username',
                    email: '$userInfo.email',
                    player_id: '$userInfo.player_id',
                    totalBonusAmount: 1,
                    transactionCount: 1
                }
            }
        ]);

        res.status(200).json({
            success: true,
            stats: {
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
                daily: dailyStats,
                topUsers: topUsers
            }
        });

    } catch (error) {
        console.error("Error fetching bonus statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bonus statistics"
        });
    }
});

admin_route.get("/bonus/eligible-users", ensureadminAuthenticated, async (req, res) => {
    try {
        const { bonusType = 'weekly' } = req.query;
        
        // Determine which field to check based on bonus type
        const betField = bonusType === 'weekly' ? 'weeklybetamount' : 'monthlybetamount';
        const bonusRate = bonusType === 'weekly' ? 0.008 : 0.005; // 0.8% and 0.5%
        
        // Find users with bet amount > 0
        const users = await UserModel.find({
            [betField]: { $gt: 0 }
        })
        .select(`_id username email player_id balance ${betField}`)
        .sort({ [betField]: -1 })
        .limit(100);

        // Calculate potential bonus for each user
        const eligibleUsers = users.map(user => ({
            userId: user._id,
            username: user.username,
            email: user.email,
            player_id: user.player_id,
            currentBalance: user.balance,
            betAmount: user[betField],
            potentialBonus: parseFloat((user[betField] * bonusRate).toFixed(2)),
            newBalance: parseFloat((user.balance + (user[betField] * bonusRate)).toFixed(2)),
            bonusPercentage: bonusType === 'weekly' ? '0.8%' : '0.5%'
        }));

        // Calculate totals
        const totals = {
            totalUsers: eligibleUsers.length,
            totalBetAmount: eligibleUsers.reduce((sum, user) => sum + user.betAmount, 0),
            totalPotentialBonus: eligibleUsers.reduce((sum, user) => sum + user.potentialBonus, 0),
            bonusPercentage: bonusType === 'weekly' ? '0.8%' : '0.5%'
        };

        res.status(200).json({
            success: true,
            bonusType: bonusType,
            bonusRate: bonusRate,
            bonusPercentage: bonusType === 'weekly' ? '0.8%' : '0.5%',
            totals: totals,
            users: eligibleUsers
        });

    } catch (error) {
        console.error("Error fetching eligible users:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch eligible users"
        });
    }
});

admin_route.post("/bonus/single-user", ensureadminAuthenticated, async (req, res) => {
    try {
        const {
            userId,
            adminId,
            adminUsername,
            bonusType,
            betAmount,
            bonusAmount,
            notes = "Manual bonus addition",
            status = "unclaimed"  // Default to unclaimed
        } = req.body;

        // Validate required fields
        if (!userId || !adminId || !adminUsername || !bonusType || !bonusAmount) {
            return res.status(400).json({
                success: false,
                message: "User ID, admin ID, admin username, bonus type, and bonus amount are required"
            });
        }

        // Validate bonus type
        if (!['weekly', 'monthly'].includes(bonusType)) {
            return res.status(400).json({
                success: false,
                message: "Bonus type must be either 'weekly' or 'monthly'"
            });
        }

        // Validate status
        if (!['unclaimed', 'claimed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be either 'unclaimed' or 'claimed'"
            });
        }

        // Find user
        const user = await UserModel.findById(userId).select('_id username email player_id balance weeklybetamount monthlybetamount transactionHistory bonusHistory');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        let responseData = {
            userId: user._id,
            username: user.username,
            bonusType: bonusType,
            bonusAmount: parseFloat(bonusAmount),
            betAmount: betAmount || 0,
            status: status,
            timestamp: new Date()
        };

        if (status === 'claimed') {
            // If claimed, add directly to balance
            const balanceBefore = user.balance;
            user.balance += parseFloat(bonusAmount);

            // Initialize transactionHistory if undefined
            if (!user.transactionHistory) {
                user.transactionHistory = [];
            }

            // Add transaction history for claimed bonus
            user.transactionHistory.push({
                type: 'bonus_claimed',
                amount: parseFloat(bonusAmount),
                balanceBefore: balanceBefore,
                balanceAfter: user.balance,
                description: `Manual ${bonusType} bonus claimed - Added by admin - ${notes}`,
                referenceId: `MANUAL-CLAIMED-${bonusType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                createdAt: new Date(),
                status: 'completed',
                details: {
                    bonusType: bonusType,
                    processedBy: adminUsername,
                    notes: notes,
                    originalBetAmount: betAmount || 0
                }
            });

            // Initialize bonusHistory if undefined
            if (!user.bonusHistory) {
                user.bonusHistory = [];
            }

            // Add to bonus history as claimed
            user.bonusHistory.push({
                type: bonusType,
                amount: parseFloat(bonusAmount),
                totalBet: betAmount || 0,
                createdAt: new Date(),
                claimedAt: new Date(),
                status: 'claimed',
                processedBy: adminUsername
            });

            responseData.balanceBefore = balanceBefore;
            responseData.balanceAfter = user.balance;

        } else {
            // If unclaimed, only add to pending history
            // Initialize transactionHistory if undefined
            if (!user.transactionHistory) {
                user.transactionHistory = [];
            }

            // Add pending transaction history
            user.transactionHistory.push({
                type: 'bonus_pending',
                amount: parseFloat(bonusAmount),
                description: `Manual ${bonusType} bonus pending - Added by admin - ${notes}`,
                referenceId: `MANUAL-PENDING-${bonusType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                createdAt: new Date(),
                status: 'pending',
                details: {
                    bonusType: bonusType,
                    processedBy: adminUsername,
                    notes: notes,
                    originalBetAmount: betAmount || 0,
                    status: 'unclaimed'
                }
            });

            // Initialize bonusHistory if undefined
            if (!user.bonusHistory) {
                user.bonusHistory = [];
            }

            // Add to bonus history as unclaimed
            user.bonusHistory.push({
                type: bonusType,
                amount: parseFloat(bonusAmount),
                totalBet: betAmount || 0,
                createdAt: new Date(),
                claimedAt: null,
                status: 'unclaimed',
                processedBy: adminUsername
            });
        }

        // Save user changes
        await user.save();

        // Create bonus history record
        const bonusHistory = new BonusHistory({
            userId: user._id,
            username: user.username,
            bonusType: bonusType,
            betAmount: betAmount || 0,
            bonusAmount: parseFloat(bonusAmount),
            bonusRate: betAmount ? (parseFloat(bonusAmount) / betAmount).toFixed(2) : 0,
            bonusPercentage: betAmount ? `${((parseFloat(bonusAmount) / betAmount) * 100).toFixed(2)}%` : '0%',
            status: status,
            creditedAt: new Date(),
            claimedAt: status === 'claimed' ? new Date() : null,
            notes: `${notes} - Manual addition by ${adminUsername}`,
            adminInfo: {
                adminId: adminId,
                adminUsername: adminUsername
            }
        });

        await bonusHistory.save();

        responseData.historyId = bonusHistory._id;

        res.status(200).json({
            success: true,
            message: `${bonusType} bonus added successfully to ${user.username} (${status})`,
            data: responseData
        });

    } catch (error) {
        console.error("Error adding manual bonus:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add manual bonus",
            error: error.message
        });
    }
});

// ======================== CLAIM BONUS ROUTE (ADMIN) ========================

// @route   POST /api/admin/bonus/claim/:bonusId
// @desc    Admin claims bonus for a user
// @access  Private (Admin only)
admin_route.post("/bonus/claim/:bonusId", ensureadminAuthenticated, async (req, res) => {
    try {
        const { bonusId } = req.params;
        const { adminId, adminUsername } = req.body;

        // Validate admin info
        if (!adminId || !adminUsername) {
            return res.status(400).json({
                success: false,
                message: "Admin ID and username are required"
            });
        }

        // Find the bonus record
        const bonusRecord = await BonusHistory.findOne({
            _id: bonusId,
            status: 'unclaimed'
        });

        if (!bonusRecord) {
            return res.status(404).json({
                success: false,
                message: "Bonus not found or already claimed"
            });
        }

        // Find user
        const user = await UserModel.findById(bonusRecord.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Add bonus to user's balance
        const balanceBefore = user.balance;
        user.balance += bonusRecord.bonusAmount;

        // Initialize transactionHistory if undefined
        if (!user.transactionHistory) {
            user.transactionHistory = [];
        }

        // Add transaction history for claimed bonus
        user.transactionHistory.push({
            type: 'bonus_claimed',
            amount: bonusRecord.bonusAmount,
            balanceBefore: balanceBefore,
            balanceAfter: user.balance,
            description: `${bonusRecord.bonusType} bonus claimed by admin - ${bonusRecord.notes}`,
            referenceId: `ADMIN-CLAIMED-${bonusRecord.bonusType.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            createdAt: new Date(),
            status: 'completed',
            details: {
                bonusId: bonusRecord._id,
                bonusType: bonusRecord.bonusType,
                bonusRate: bonusRecord.bonusRate,
                originalBetAmount: bonusRecord.betAmount,
                claimedByAdmin: adminUsername
            }
        });

        // Update user's bonus history to claimed
        if (!user.bonusHistory) {
            user.bonusHistory = [];
        }

        const userBonusIndex = user.bonusHistory.findIndex(b => 
            b.type === bonusRecord.bonusType && 
            b.amount === bonusRecord.bonusAmount && 
            b.status === 'unclaimed'
        );

        if (userBonusIndex !== -1) {
            user.bonusHistory[userBonusIndex].status = 'claimed';
            user.bonusHistory[userBonusIndex].claimedAt = new Date();
            user.bonusHistory[userBonusIndex].claimedByAdmin = adminUsername;
        }

        // Save user changes
        await user.save();

        // Update bonus record to claimed
        bonusRecord.status = 'claimed';
        bonusRecord.claimedAt = new Date();
        bonusRecord.claimedByAdmin = adminUsername;
        bonusRecord.notes = `${bonusRecord.notes} - Claimed by admin ${adminUsername} on ${new Date().toISOString()}`;
        
        await bonusRecord.save();

        res.status(200).json({
            success: true,
            message: `${bonusRecord.bonusType} bonus claimed successfully for ${user.username}`,
            data: {
                bonusId: bonusRecord._id,
                bonusType: bonusRecord.bonusType,
                bonusAmount: bonusRecord.bonusAmount,
                userId: user._id,
                username: user.username,
                balanceBefore: balanceBefore,
                balanceAfter: user.balance,
                claimedAt: new Date(),
                claimedByAdmin: adminUsername
            }
        });

    } catch (error) {
        console.error("Error claiming bonus:", error);
        res.status(500).json({
            success: false,
            message: "Failed to claim bonus",
            error: error.message
        });
    }
});

// ======================== GET UNCLAIMED BONUSES ========================

// @route   GET /api/admin/bonus/unclaimed
// @desc    Get all unclaimed bonuses
// @access  Private (Admin only)
admin_route.get("/bonus/unclaimed",async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            bonusType,
            startDate,
            endDate,
            search
        } = req.query;

        // Build query
        const query = { status: 'unclaimed' };

        if (bonusType && bonusType !== 'all') {
            query.bonusType = bonusType;
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

        // Search filter
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get unclaimed bonuses with pagination
        const unclaimedBonuses = await BonusHistory.find(query)
            .populate('userId', 'username email player_id')
            .sort({ creditedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Get total count
        const total = await BonusHistory.countDocuments(query);

        // Calculate total unclaimed amount
        const totalUnclaimed = await BonusHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$bonusAmount' },
                    count: { $sum: 1 }
                }
            }
        ]);

        // Group by user
        const byUser = await BonusHistory.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$userId',
                    username: { $first: '$username' },
                    totalUnclaimedAmount: { $sum: '$bonusAmount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalUnclaimedAmount: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: unclaimedBonuses,
            summary: {
                totalUnclaimedAmount: totalUnclaimed[0]?.totalAmount || 0,
                totalCount: totalUnclaimed[0]?.count || 0
            },
            byUser: byUser,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });

    } catch (error) {
        console.error("Error fetching unclaimed bonuses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch unclaimed bonuses"
        });
    }
});


admin_route.get("/auto-payment-method/status",async (req, res) => {
    try {
        const autoPaymentMethod = await AutoPaymentMethod.getInstance();
        await autoPaymentMethod.populate('updatedBy', 'username email');

        res.status(200).json({
            success: true,
            data: {
                status: autoPaymentMethod.status,
                updatedAt: autoPaymentMethod.updatedAt,
                updatedBy: autoPaymentMethod.updatedBy
            }
        });

    } catch (error) {
        console.error("Error fetching auto payment method status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch auto payment method status",
            error: error.message
        });
    }
});

// @route   PUT /api/auto-payment-method/status
// @desc    Update auto payment method status (true/false)
// @access  Private (Admin only)
admin_route.put("/auto-payment-method/status",async (req, res) => {
    try {
        const { status } = req.body;

        // Validate input
        if (status === undefined || typeof status !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "Status field is required and must be a boolean (true/false)"
            });
        }

        let autoPaymentMethod = await AutoPaymentMethod.getInstance();
        
        autoPaymentMethod.status = status;
        autoPaymentMethod.updatedAt = new Date();
        autoPaymentMethod.updatedBy = req.user?._id;

        await autoPaymentMethod.save();
        await autoPaymentMethod.populate('updatedBy', 'username email');

        res.status(200).json({
            success: true,
            message: `Auto payment method ${status ? 'enabled' : 'disabled'} successfully`,
            data: {
                status: autoPaymentMethod.status,
                updatedAt: autoPaymentMethod.updatedAt,
                updatedBy: autoPaymentMethod.updatedBy
            }
        });

    } catch (error) {
        console.error("Error updating auto payment method status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update auto payment method status",
            error: error.message
        });
    }
});

// @route   POST /api/auto-payment-method/toggle
// @desc    Toggle auto payment method status
// @access  Private (Admin only)
admin_route.post("/auto-payment-method/toggle",async (req, res) => {
    try {
        let autoPaymentMethod = await AutoPaymentMethod.getInstance();
        
        autoPaymentMethod.status = !autoPaymentMethod.status;
        autoPaymentMethod.updatedAt = new Date();
        autoPaymentMethod.updatedBy = req.user?._id;

        await autoPaymentMethod.save();
        await autoPaymentMethod.populate('updatedBy', 'username email');

        res.status(200).json({
            success: true,
            message: `Auto payment method ${autoPaymentMethod.status ? 'enabled' : 'disabled'} successfully`,
            data: {
                status: autoPaymentMethod.status,
                updatedAt: autoPaymentMethod.updatedAt,
                updatedBy: autoPaymentMethod.updatedBy
            }
        });

    } catch (error) {
        console.error("Error toggling auto payment method status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to toggle auto payment method status",
            error: error.message
        });
    }
});


// ======================== HIGHLIGHT GAMES ROUTES ========================

// Import the HighlightGames model at the top with your other imports
const HighlightGames = require("../Models/HighlightGamesModel");

// @route   POST /api/admin/highlight-games
// @desc    Create a new highlight game
admin_route.post("/highlight-games", ensureadminAuthenticated, async (req, res) => {
  try {
    const { name, provider, gameId, status, imageUrl, categories, isFeatured, displayOrder } = req.body;

    // Validate required fields
    if (!name || !provider || !gameId || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Name, provider, gameId, and imageUrl are required",
      });
    }

    // Check if game with this gameId already exists
    const existingGame = await HighlightGames.findOne({ gameId });
    if (existingGame) {
      return res.status(409).json({
        success: false,
        message: "Game with this ID already exists in highlights",
      });
    }

    // Create new highlight game
    const newHighlightGame = new HighlightGames({
      name,
      provider,
      gameId,
      status: status || "active",
      imageUrl,
      categories: categories || [],
      isFeatured: isFeatured || false,
      displayOrder: displayOrder || 0,
    });

    await newHighlightGame.save();

    res.status(201).json({
      success: true,
      message: "Highlight game created successfully",
      data: newHighlightGame,
    });
  } catch (error) {
    console.error("Error creating highlight game:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Game with this ID already exists in highlights",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create highlight game",
      error: error.message,
    });
  }
});

// @route   GET /api/admin/highlight-games
// @desc    Get all highlight games with filtering and pagination
admin_route.get("/highlight-games", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      provider,
      search,
      isFeatured,
      sortBy = "displayOrder",
      sortOrder = "asc",
    } = req.query;

    // Build filter query
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (provider && provider !== "all") {
      filter.provider = provider;
    }

    if (isFeatured !== undefined && isFeatured !== "all") {
      filter.isFeatured = isFeatured === "true";
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { provider: { $regex: search, $options: "i" } },
        { gameId: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort configuration
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Get highlight games with pagination
    const highlightGames = await HighlightGames.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await HighlightGames.countDocuments(filter);

    // Get unique providers for filter options
    const providers = await HighlightGames.distinct("provider");

    res.status(200).json({
      success: true,
      data: highlightGames,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      filters: {
        providers: providers.sort(),
      },
    });
  } catch (error) {
    console.error("Error fetching highlight games:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch highlight games",
      error: error.message,
    });
  }
});

// @route   GET /api/admin/highlight-games/:id
// @desc    Get a single highlight game by ID
admin_route.get("/highlight-games/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const highlightGame = await HighlightGames.findById(id);

    if (!highlightGame) {
      return res.status(404).json({
        success: false,
        message: "Highlight game not found",
      });
    }

    res.status(200).json({
      success: true,
      data: highlightGame,
    });
  } catch (error) {
    console.error("Error fetching highlight game:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid game ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to fetch highlight game",
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/highlight-games/:id
// @desc    Update a highlight game
admin_route.put("/highlight-games/:id", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, provider, gameId, status, imageUrl, categories, isFeatured, displayOrder } = req.body;

    // Find the existing game
    const highlightGame = await HighlightGames.findById(id);

    if (!highlightGame) {
      return res.status(404).json({
        success: false,
        message: "Highlight game not found",
      });
    }

    // Check if gameId is being updated and if it conflicts with another game
    if (gameId && gameId !== highlightGame.gameId) {
      const existingGame = await HighlightGames.findOne({ gameId });
      if (existingGame) {
        return res.status(409).json({
          success: false,
          message: "Another game already uses this Game ID in highlights",
        });
      }
    }

    // Update fields
    if (name !== undefined) highlightGame.name = name;
    if (provider !== undefined) highlightGame.provider = provider;
    if (gameId !== undefined) highlightGame.gameId = gameId;
    if (status !== undefined) highlightGame.status = status;
    if (imageUrl !== undefined) highlightGame.imageUrl = imageUrl;
    if (categories !== undefined) highlightGame.categories = categories;
    if (isFeatured !== undefined) highlightGame.isFeatured = isFeatured;
    if (displayOrder !== undefined) highlightGame.displayOrder = displayOrder;

    highlightGame.updatedAt = Date.now();

    await highlightGame.save();

    res.status(200).json({
      success: true,
      message: "Highlight game updated successfully",
      data: highlightGame,
    });
  } catch (error) {
    console.error("Error updating highlight game:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another game already uses this Game ID in highlights",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid game ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update highlight game",
      error: error.message,
    });
  }
});

// @route   DELETE /api/admin/highlight-games/:id
// @desc    Delete a highlight game
admin_route.delete("/highlight-games/:id", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedGame = await HighlightGames.findByIdAndDelete(id);

    if (!deletedGame) {
      return res.status(404).json({
        success: false,
        message: "Highlight game not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Highlight game deleted successfully",
      data: {
        id: deletedGame._id,
        name: deletedGame.name,
        gameId: deletedGame.gameId,
      },
    });
  } catch (error) {
    console.error("Error deleting highlight game:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid game ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete highlight game",
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/highlight-games/:id/status
// @desc    Toggle highlight game active status
admin_route.put("/highlight-games/:id/status", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'active' or 'inactive'",
      });
    }

    const highlightGame = await HighlightGames.findByIdAndUpdate(
      id,
      {
        status,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!highlightGame) {
      return res.status(404).json({
        success: false,
        message: "Highlight game not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Game ${status === "active" ? "activated" : "deactivated"} successfully`,
      data: highlightGame,
    });
  } catch (error) {
    console.error("Error updating highlight game status:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid game ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update game status",
      error: error.message,
    });
  }
});

// @route   PUT /api/admin/highlight-games/:id/feature
// @desc    Toggle highlight game featured status
admin_route.put("/highlight-games/:id/feature", ensureadminAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (typeof isFeatured !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isFeatured must be a boolean",
      });
    }

    const highlightGame = await HighlightGames.findByIdAndUpdate(
      id,
      {
        isFeatured,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!highlightGame) {
      return res.status(404).json({
        success: false,
        message: "Highlight game not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Game ${isFeatured ? "marked as featured" : "removed from featured"} successfully`,
      data: highlightGame,
    });
  } catch (error) {
    console.error("Error updating highlight game featured status:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid game ID format",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to update featured status",
      error: error.message,
    });
  }
});

// @route   POST /api/admin/highlight-games/bulk-upload
// @desc    Bulk upload highlight games from array
admin_route.post("/highlight-games/bulk-upload", ensureadminAuthenticated, async (req, res) => {
  try {
    const { games } = req.body;

    if (!games || !Array.isArray(games) || games.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Games array is required",
      });
    }

    const results = {
      total: games.length,
      added: 0,
      skipped: 0,
      errors: 0,
      details: [],
    };

    // Get existing gameIds
    const gameIds = games.map((g) => g.gameId).filter((id) => id);
    const existingGames = await HighlightGames.find({
      gameId: { $in: gameIds },
    }).select("gameId");

    const existingGameIdSet = new Set(existingGames.map((g) => g.gameId));

    // Process games in batches
    const batchSize = 10;
    const validGames = [];

    for (const [index, game] of games.entries()) {
      const gameId = game.gameId ? game.gameId.trim() : "";

      // Validate required fields
      if (!gameId || !game.name || !game.provider || !game.imageUrl) {
        results.errors++;
        results.details.push({
          gameId: gameId || "unknown",
          status: "error",
          reason: "Missing required fields (name, provider, gameId, imageUrl are required)",
          row: index + 2,
        });
        continue;
      }

      // Check if game already exists
      if (existingGameIdSet.has(gameId)) {
        results.skipped++;
        results.details.push({
          gameId: gameId,
          status: "skipped",
          reason: "Game ID already exists in highlight games",
          row: index + 2,
        });
        continue;
      }

      validGames.push({
        originalIndex: index,
        game: {
          name: game.name.trim(),
          provider: game.provider.trim(),
          gameId: gameId,
          imageUrl: game.imageUrl.trim(),
          status: game.status || "active",
          categories: game.categories || [],
          isFeatured: game.isFeatured || false,
          displayOrder: game.displayOrder || 0,
        },
      });
    }

    // Insert valid games in batches
    for (let i = 0; i < validGames.length; i += batchSize) {
      const batch = validGames.slice(i, i + batchSize);

      const batchPromises = batch.map(async ({ originalIndex, game }) => {
        try {
          const newGame = new HighlightGames(game);
          await newGame.save();

          return {
            success: true,
            gameId: game.gameId,
            message: "Game added successfully",
            row: originalIndex + 2,
          };
        } catch (error) {
          console.error(`Error adding game ${game.gameId}:`, error);

          if (error.code === 11000) {
            return {
              success: false,
              gameId: game.gameId,
              message: "Duplicate game ID",
              row: originalIndex + 2,
            };
          }

          return {
            success: false,
            gameId: game.gameId,
            message: `Database error: ${error.message}`,
            row: originalIndex + 2,
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach((result) => {
        if (result.success) {
          results.added++;
          results.details.push({
            gameId: result.gameId,
            status: "added",
            row: result.row,
          });
        } else {
          results.errors++;
          results.details.push({
            gameId: result.gameId,
            status: "error",
            reason: result.message,
            row: result.row,
          });
        }
      });
    }

    res.status(200).json({
      success: true,
      message: "Bulk upload completed",
      results,
    });
  } catch (error) {
    console.error("Error in bulk upload:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk upload",
      error: error.message,
    });
  }
});

// @route   POST /api/admin/highlight-games/reorder
// @desc    Reorder highlight games (update displayOrder in batch)
admin_route.post("/highlight-games/reorder", ensureadminAuthenticated, async (req, res) => {
  try {
    const { games } = req.body;

    if (!games || !Array.isArray(games)) {
      return res.status(400).json({
        success: false,
        message: "Games array is required",
      });
    }

    const updatePromises = games.map(({ id, displayOrder }) =>
      HighlightGames.findByIdAndUpdate(
        id,
        { displayOrder, updatedAt: Date.now() },
        { new: true }
      )
    );

    const updatedGames = await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: "Highlight games reordered successfully",
      data: updatedGames.filter((g) => g !== null),
    });
  } catch (error) {
    console.error("Error reordering highlight games:", error);
    res.status(500).json({
      success: false,
      message: "Failed to reorder highlight games",
      error: error.message,
    });
  }
});

// @route   GET /api/admin/highlight-games/stats
// @desc    Get statistics about highlight games
admin_route.get("/highlight-games/stats", ensureadminAuthenticated, async (req, res) => {
  try {
    const [totalGames, activeGames, featuredGames, providers] = await Promise.all([
      HighlightGames.countDocuments(),
      HighlightGames.countDocuments({ status: "active" }),
      HighlightGames.countDocuments({ isFeatured: true }),
      HighlightGames.distinct("provider"),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalGames,
        activeGames,
        inactiveGames: totalGames - activeGames,
        featuredGames,
        nonFeaturedGames: totalGames - featuredGames,
        uniqueProviders: providers.length,
        providers: providers.sort(),
      },
    });
  } catch (error) {
    console.error("Error fetching highlight games stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
});

// @route   DELETE /api/admin/highlight-games
// @desc    Delete all highlight games (use with caution)
admin_route.delete("/highlight-games", ensureadminAuthenticated, async (req, res) => {
  try {
    const { confirm } = req.query;

    if (confirm !== "true") {
      return res.status(400).json({
        success: false,
        message: "Please confirm with ?confirm=true to delete all highlight games",
      });
    }

    const result = await HighlightGames.deleteMany({});

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} highlight games`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting all highlight games:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete all highlight games",
      error: error.message,
    });
  }
});
module.exports=admin_route;
// ==================== ENHANCED BONUS MANAGEMENT ROUTES ====================
