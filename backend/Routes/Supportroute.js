const express = require("express");
const User = require("../Models/User");
const supportrouter = express.Router();
const jwt = require("jsonwebtoken");
const GameSession = require("../Models/GameSession");
const Withdrawmodel = require("../Models/Withdrawmodel");
const transaction_model = require("../Models/Transactionmodel");

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is required"
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token"
      });
    }
    req.user = user;
    next();
  });
};

// Apply authentication middleware to all routes
supportrouter.use(authenticateToken);

// --------------all-user-----------------
supportrouter.get("/all-users", async(req, res) => {
    try {
        const allusers = await User.find({});
        if (!allusers) {
           return res.send({success: false, message: "No user found"});
        }
        res.send({success: true, data: allusers})
    } catch (error) {
        console.log(error);
        res.status(500).json({success: false, message: "Server error"});
    }
});
// Find single user by email, player_id, or phone
supportrouter.get("/find-user", async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        // Find single user by email, player_id, or phone
        const user = await User.findOne({
            $or: [
                { email: query },
                { player_id: query },
                { phone: query }
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error("Error searching user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to search user"
        });
    }
});
supportrouter.get("/game-history/:player_id", async (req, res) => {
    try {
        const { player_id } = req.params;
        const { 
            page = 1, 
            limit = 50, 
            type, 
            startDate, 
            endDate,
            game_uuid,
            session_id
        } = req.query;

        // Validate player exists
        const user = await User.findOne({ player_id: player_id });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Player not found"
            });
        }

        // Build query
        const query = { player_id: player_id };
        
        // Add filters if provided
        if (game_uuid) {
            query.game_uuid = game_uuid;
        }
        
        if (session_id) {
            query.session_id = session_id;
        }
        
        if (startDate || endDate) {
            query.started_at = {};
            if (startDate) query.started_at.$gte = new Date(startDate);
            if (endDate) query.started_at.$lte = new Date(endDate);
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
                
                // Also update session totals based on filtered transactions
                if (filteredTransactions.length > 0) {
                    const sessionCopy = {...session};
                    sessionCopy.transactions = filteredTransactions;
                    
                    // Recalculate session totals for filtered transactions
                    sessionCopy.total_bet = filteredTransactions
                        .filter(t => t.type === 'bet')
                        .reduce((sum, t) => sum + t.amount, 0);
                    
                    sessionCopy.total_win = filteredTransactions
                        .filter(t => t.type === 'win')
                        .reduce((sum, t) => sum + t.amount, 0);
                        
                    sessionCopy.total_refund = filteredTransactions
                        .filter(t => t.type === 'refund')
                        .reduce((sum, t) => sum + t.amount, 0);
                        
                    sessionCopy.net_result = sessionCopy.total_win + 
                                           sessionCopy.total_refund - 
                                           sessionCopy.total_bet;
                    
                    return sessionCopy;
                }
                
                return null;
            }).filter(session => session !== null);
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

// 3. Get Deposit History by player_id
supportrouter.get("/deposit-history/:player_id", async (req, res) => {
    try {
        // First find the user to get their customer_id
        const user = await User.findOne({ player_id: req.params.player_id });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Player not found" 
            });
        }

        const deposits = await transaction_model.find({ 
            customer_id: user._id, // Use appropriate field
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

// 4. Get Withdrawal History by player_id
supportrouter.get("/withdrawal-history/:player_id", async (req, res) => {
    try {
        // First find the user to get their _id (userId)
        const user = await User.findOne({ player_id: req.params.player_id });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "Player not found" 
            });
        }

        const withdrawals = await Withdrawmodel.find({ 
            userId: user._id // Use the user's ObjectId
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
module.exports = supportrouter;