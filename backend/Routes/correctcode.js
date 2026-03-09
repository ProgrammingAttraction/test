const express = require('express');
const Gamesroute = express.Router();
const axios = require('axios');
const UserModel = require("../Models/User");
const crypto = require('crypto');
const GameHistory = require('../Models/Gameslogs');

// ========================================= GAMING PART 
// Currency conversion rates
const CURRENCY_RATES = {
  BDT_TO_EUR: 0.0085,
  EUR_TO_BDT: 117.65
};

// Currency conversion functions - improved precision
// Currency conversion functions - improved precision
function convertBDTtoEUR(bdtAmount) {
  const amount = parseFloat(bdtAmount) || 0;
  const result = amount * CURRENCY_RATES.BDT_TO_EUR;
  return parseFloat(result.toFixed(4)); // Use 4 decimal places for EUR
}

function convertEURtoBDT(eurAmount) {
  const amount = parseFloat(eurAmount) || 0;
  const result = amount * CURRENCY_RATES.EUR_TO_BDT;
  return parseFloat(result.toFixed(2)); // Use 2 decimal places for BDT
}

// FIXED: Improved processGameAmount function
function processGameAmount(amount, currency, action) {
  const amountValue = parseFloat(amount) || 0;
  
  // If amount is zero, return zero immediately
  if (amountValue === 0) {
    return 0;
  }
  
  if (currency.toUpperCase() === 'EUR') {
    // For wins, we need to convert EUR to BDT
    if (action === 'win') {
      return convertEURtoBDT(amountValue);
    }
    // For bets, we also need to convert EUR to BDT
    if (action === 'bet') {
      return convertEURtoBDT(amountValue);
    }
    // For refunds, convert EUR to BDT
    if (action === 'refund') {
      return convertEURtoBDT(amountValue);
    }
  }
  return amountValue;
}

// Game Aggregator Configuration
const GAME_AGGREGATOR_CONFIG = {
  MERCHANT_ID: '152b223c2d757c1803f7c67229a505f7',
  MERCHANT_KEY: 'a54987730bd43743a9f2bda32d6b97c32ab22254',
  BASE_API_URL: 'https://staging.slotegrator.com/api/index.php/v1'
};

// Signature calculation
function calculateXSign(params, merchantKey) {
  const cleanedParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) return;
    
    if (typeof value === 'boolean') {
      cleanedParams[key] = value ? '1' : '0';
    } else if (typeof value === 'number') {
      cleanedParams[key] = value.toString();
    } else if (Array.isArray(value)) {
      cleanedParams[key] = JSON.stringify(value);
    } else if (typeof value === 'object') {
      cleanedParams[key] = JSON.stringify(value).replace(/"/g, '');
    } else {
      cleanedParams[key] = value.toString();
    }
  });

  const sortedKeys = Object.keys(cleanedParams).sort();
  const queryString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(cleanedParams[key])}`)
    .join('&');

  return crypto.createHmac('sha1', merchantKey).update(queryString).digest('hex');
}

// Transaction tracking to prevent duplicates
const processedTransactions = new Map();
const TRANSACTION_CLEANUP_TIME = 5 * 60 * 1000;

// Clean up old transactions periodically
setInterval(() => {
  const now = Date.now();
  for (const [transactionId, timestamp] of processedTransactions.entries()) {
    if (now - timestamp > TRANSACTION_CLEANUP_TIME) {
      processedTransactions.delete(transactionId);
    }
  }
}, TRANSACTION_CLEANUP_TIME);

// Session tracking to prevent game UUID changes mid-session
const activeSessions = new Map();
const SESSION_CLEANUP_TIME = 60 * 60 * 1000; // 1 hour

// Clean up old sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, sessionData] of activeSessions.entries()) {
    if (now - sessionData.createdAt > SESSION_CLEANUP_TIME) {
      activeSessions.delete(sessionId);
    }
  }
}, SESSION_CLEANUP_TIME);

// Validate callback signature
function validateCallbackSignature(req, merchantKey) {
  try {
    const headers = {
      'X-Merchant-Id': req.headers['x-merchant-id'] || req.headers['X-Merchant-Id'],
      'X-Timestamp': req.headers['x-timestamp'] || req.headers['X-Timestamp'],
      'X-Nonce': req.headers['x-nonce'] || req.headers['X-Nonce'],
      'X-Sign': req.headers['x-sign'] || req.headers['X-Sign']
    };

    if (!headers['X-Merchant-Id'] || !headers['X-Timestamp'] ||
      !headers['X-Nonce'] || !headers['X-Sign']) {
      throw new Error('Missing required authentication headers');
    }

    const allParams = {
      ...req.body,
      'X-Merchant-Id': headers['X-Merchant-Id'],
      'X-Timestamp': headers['X-Timestamp'],
      'X-Nonce': headers['X-Nonce']
    };

    const expectedSign = calculateXSign(allParams, merchantKey);

    console.log("Signature validation:", {
      received: headers['X-Sign'],
      expected: expectedSign,
      params: allParams
    });

    if (headers['X-Sign'] !== expectedSign) {
      throw new Error('Invalid signature');
    }

    return headers;
  } catch (error) {
    throw error;
  }
}

// ----------------- Game Endpoints -----------------
// 1. Get Games List
Gamesroute.get("/games", async (req, res) => {
  try {
    const { expand } = req.query;
    const headers = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': Math.floor(Date.now() / 1000),
      'X-Nonce': crypto.randomBytes(16).toString('hex')
    };

    const params = expand ? { expand } : {};
    const xSign = calculateXSign({ ...params, ...headers }, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const response = await axios.get(`${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games`, {
      params,
      headers: { ...headers, 'X-Sign': xSign }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch games list",
      error: error.response?.data || error.message
    });
  }
});

// 2. Get Game Lobby
Gamesroute.get("/games/lobby", async (req, res) => {
  try {
    const { game_uuid, currency, technology } = req.query;

    if (!game_uuid || !currency) {
      return res.status(400).json({
        success: false,
        message: "game_uuid and currency are required"
      });
    }

    const headers = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': Math.floor(Date.now() / 1000),
      'X-Nonce': crypto.randomBytes(16).toString('hex')
    };

    const params = { game_uuid, currency, technology };
    const xSign = calculateXSign({ ...params, ...headers }, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const response = await axios.get(`${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games/lobby`, {
      params,
      headers: { ...headers, 'X-Sign': xSign }
    });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch game lobby",
      error: error.response?.data || error.message
    });
  }
});


// ----------------- Callback Endpoints -----------------
function validateSessionConsistency(session_id, game_uuid, player_id, action = 'unknown') {
  if (!session_id) return true; // No session, no validation needed
  
  const sessionData = activeSessions.get(session_id);
  
  if (!sessionData) {
    // Session doesn't exist, create it
    activeSessions.set(session_id, {
      game_uuid,
      player_id,
      createdAt: Date.now(),
      createdFrom: action === 'callback' ? 'callback' : 'init'
    });
    return true;
  }
  
  // Check if game UUID matches
  if (sessionData.game_uuid !== game_uuid) {
    console.error("Game UUID change detected:", {
      session_id,
      expected_game_uuid: sessionData.game_uuid,
      received_game_uuid: game_uuid,
      player_id,
      action
    });
    return false;
  }
  
  // Check if player ID matches
  if (sessionData.player_id !== player_id) {
    console.error("Player ID change detected in session:", {
      session_id,
      expected_player_id: sessionData.player_id,
      received_player_id: player_id,
      game_uuid,
      action
    });
    return false;
  }
  
  return true;
}
// 3. Initialize Game Session
Gamesroute.post("/games/init", async (req, res) => {
  try {
    const {
      game_uuid,
      player_id,
      player_name,
      currency,
      session_id,
      device = "desktop",
      return_url,
      language,
      email,
    } = req.body;

    console.log("Game init request received:", {
      game_uuid,
      player_id,
      player_name,
      currency,
      session_id,
      device,
      return_url,
      language,
      email
    });

    if (!game_uuid || !player_id || !player_name || !currency || !session_id) {
      return res.status(400).json({
        success: false,
        message: "Required fields: game_uuid, player_id, player_name, currency, session_id"
      });
    }

    // Check if user exists and has balance
    const user = await UserModel.findOne({ player_id });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    console.log("User balance:", {
      player_id,
      balance_bdt: user.balance,
      balance_eur: convertBDTtoEUR(user.balance)
    });

    // Validate session consistency - CRITICAL FIX
    const existingSession = activeSessions.get(session_id);
    if (existingSession) {
      if (existingSession.game_uuid !== game_uuid) {
        console.error("Session violation detected:", {
          session_id,
          existing_game_uuid: existingSession.game_uuid,
          requested_game_uuid: game_uuid,
          player_id
        });
        
        return res.status(400).json({
          success: false,
          message: "Game UUID cannot be changed within the same session",
          error_code: "SESSION_VIOLATION"
        });
      }
      
      if (existingSession.player_id !== player_id) {
        console.error("Player ID change detected in session:", {
          session_id,
          existing_player_id: existingSession.player_id,
          requested_player_id: player_id,
          game_uuid
        });
        
        return res.status(400).json({
          success: false,
          message: "Player ID cannot be changed within the same session",
          error_code: "SESSION_VIOLATION"
        });
      }
      
      // Update session timestamp if it already exists
      existingSession.createdAt = Date.now();
    } else {
      // Create new session
      activeSessions.set(session_id, {
        game_uuid,
        player_id,
        createdAt: Date.now(),
        initial_balance: user.balance
      });
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(16).toString('hex');

    const headers = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce
    };

    const signatureParams = {
      game_uuid,
      player_id,
      player_name,
      currency: "EUR",
      session_id,
      device,
      return_url,
      language,
      email,
      'X-Merchant-Id': headers['X-Merchant-Id'],
      'X-Timestamp': headers['X-Timestamp'],
      'X-Nonce': headers['X-Nonce']
    };

    const xSign = calculateXSign(signatureParams, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const formData = new URLSearchParams();
    const bodyParams = { 
      game_uuid, 
      player_id, 
      player_name, 
      currency: "EUR",
      session_id, 
      device, 
      return_url, 
      language, 
      email 
    };
    
    Object.keys(bodyParams).forEach(key => {
      if (bodyParams[key] !== undefined && bodyParams[key] !== null) {
        formData.append(key, bodyParams[key]);
      }
    });

    console.log("Sending game init request to aggregator:", {
      url: `${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games/init`,
      headers: {
        ...headers,
        'X-Sign': xSign,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: Object.fromEntries(formData)
    });

    const response = await axios.post(
      `${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/games/init`,
      formData.toString(),
      {
        headers: {
          ...headers,
          'X-Sign': xSign,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      }
    );
    
    console.log("Game init response received:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Game init error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      res.status(500).json({
        success: false,
        message: "No response from game server",
        error: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to setup request",
        error: error.message
      });
    }
  }
});
// ----------------- Callback Handler -----------------
async function handleGameCallback(req, res, expectedAction) {
  // Transaction locking to prevent race conditions
  let transactionLockKey = null;
  let refundLockKey = null;
  
  try {
    console.log(`${expectedAction.toUpperCase()} callback received:`, {
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    // Validate signature first
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    // Handle balance requests that are incorrectly sent to other endpoints
    if (req.body.action === "balance") {
      console.log("Balance request routed to wrong endpoint, redirecting to balance handler");
      return await handleBalanceCallback(req, res);
    }

    // Check if this is actually the correct action type for this endpoint
    const supportedActions = ['bet', 'win', 'refund', 'rollback', 'balance'];
    if (!supportedActions.includes(req.body.action)) {
      console.log(`Unsupported action type received: ${req.body.action}`);
      return res.status(200).json({
        error_code: "INVALID_ACTION",
        error_description: `Unsupported action: ${req.body.action}`
      });
    }

    const {
      action,
      amount,
      currency = 'EUR',
      game_uuid,
      player_id,
      transaction_id,
      session_id,
      round_id,
      finished,
      bet_transaction_id
    } = req.body;

    // Validate required parameters
    if (!player_id || !transaction_id) {
      return res.status(200).json({
        error_code: "INVALID_PARAMETERS",
        error_description: "player_id and transaction_id are required"
      });
    }

    // Set up transaction lock
    transactionLockKey = `lock_${player_id}_${transaction_id}_${action}`;
    
    // ADDED: Special refund lock to prevent concurrent refund processing
    if (action === 'refund') {
      refundLockKey = `refund_${transaction_id}_${player_id}`;
      
      // Check if refund is already being processed
      if (processedTransactions.has(refundLockKey)) {
        console.log("Refund already being processed, returning current balance:", refundLockKey);
        
        const currentUser = await UserModel.findOne({ player_id });
        if (currentUser) {
          return res.json({
            balance: convertBDTtoEUR(currentUser.balance),
            transaction_id: transaction_id
          });
        }
      }
      
      // Set refund processing lock
      processedTransactions.set(refundLockKey, Date.now());
    }
    
    const hasLock = processedTransactions.has(transactionLockKey);

    if (hasLock) {
      console.log(`Transaction ${transactionLockKey} is already being processed`);
      return res.status(200).json({
        error_code: "PROCESSING",
        error_description: "Transaction is being processed, please try again"
      });
    }

    // Set lock
    processedTransactions.set(transactionLockKey, Date.now());

    // Handle zero amount transactions FIRST - they should not affect balance
    const amountValue = parseFloat(amount) || 0;
    if (amountValue === 0) {
      console.log(`Zero amount ${action} request received:`, {
        transaction_id,
        player_id,
        currency,
        session_id
      });

      const user = await UserModel.findOne({ player_id });
      if (!user) {
        console.log(`Player not found for zero amount ${action}:`, player_id);
        // Release locks
        processedTransactions.delete(transactionLockKey);
        if (refundLockKey) processedTransactions.delete(refundLockKey);
        return res.json({
          error_code: "PLAYER_NOT_FOUND",
          error_description: "Player not found"
        });
      }
      
      // Log the balance before returning
      console.log(`Zero amount ${action} - returning current balance:`, {
        transaction_id,
        balance_bdt: user.balance,
        balance_eur: convertBDTtoEUR(user.balance)
      });
      
      // Zero amount transactions should return current balance without changes
      // Release locks
      processedTransactions.delete(transactionLockKey);
      if (refundLockKey) processedTransactions.delete(refundLockKey);
      return res.json({
        balance: convertBDTtoEUR(user.balance),
        transaction_id: transaction_id
      });
    }

    // ENHANCED: Session validation with better error handling
    if (session_id) {
      const sessionData = activeSessions.get(session_id);
      
      if (sessionData) {
        // Check if game UUID matches
        if (sessionData.game_uuid !== game_uuid) {
          console.error("Game UUID change detected in session:", {
            session_id,
            expected_game_uuid: sessionData.game_uuid,
            received_game_uuid: game_uuid,
            player_id: sessionData.player_id,
            received_player_id: player_id,
            action: action
          });
          
          // Release locks
          processedTransactions.delete(transactionLockKey);
          if (refundLockKey) processedTransactions.delete(refundLockKey);
          return res.status(200).json({
            error_code: "SESSION_VIOLATION",
            error_description: "Game UUID cannot be changed within the same session",
            details: {
              expected_game_uuid: sessionData.game_uuid,
              received_game_uuid: game_uuid,
              session_id: session_id
            }
          });
        }
        
        // Check if player ID matches
        if (sessionData.player_id !== player_id) {
          console.error("Player ID change detected in session:", {
            session_id,
            expected_player_id: sessionData.player_id,
            received_player_id: player_id,
            game_uuid: game_uuid,
            action: action
          });
          
          // Release locks
          processedTransactions.delete(transactionLockKey);
          if (refundLockKey) processedTransactions.delete(refundLockKey);
          return res.status(200).json({
            error_code: "SESSION_VIOLATION",
            error_description: "Player ID cannot be changed within the same session",
            details: {
              expected_player_id: sessionData.player_id,
              received_player_id: player_id,
              session_id: session_id
            }
          });
        }
        
        // Update session timestamp
        sessionData.lastActivity = Date.now();
      } else {
        // Session doesn't exist, create it for future validation
        console.log("Creating new session from callback:", {
          session_id,
          game_uuid,
          player_id,
          action: action
        });
        
        activeSessions.set(session_id, {
          game_uuid,
          player_id,
          createdAt: Date.now(),
          lastActivity: Date.now(),
          created_from: 'callback',
          action: action
        });
      }
    }

    // ENHANCED: More robust duplicate detection
    const transactionKey = `${transaction_id}_${action}`;
    const isDuplicate = processedTransactions.has(transactionKey);

    // Check for duplicate transaction in memory
    if (isDuplicate) {
      console.log(`Duplicate transaction detected in memory: ${transactionKey}`);
      
      const user = await UserModel.findOne({ player_id });
      if (!user) {
        // Release locks
        processedTransactions.delete(transactionLockKey);
        if (refundLockKey) processedTransactions.delete(refundLockKey);
        return res.json({
          error_code: "PLAYER_NOT_FOUND",
          error_description: "Player not found"
        });
      }
      
      // CRITICAL: For refunds specifically, check if it was already processed in DB
      if (action === 'refund') {
        const existingRefundInDB = user.transactionHistory.find(
          t => t.referenceId === transaction_id && t.type === 'refund'
        );
        
        if (existingRefundInDB) {
          console.log(`Refund ${transaction_id} already processed in database`);
          // Release locks
          processedTransactions.delete(transactionLockKey);
          if (refundLockKey) processedTransactions.delete(refundLockKey);
          return res.json({
            balance: convertBDTtoEUR(user.balance),
            transaction_id: transaction_id
          });
        }
      }
      
      // For other duplicate transactions, return current balance
      // Release locks
      processedTransactions.delete(transactionLockKey);
      if (refundLockKey) processedTransactions.delete(refundLockKey);
      return res.json({
        balance: convertBDTtoEUR(user.balance),
        transaction_id: transaction_id
      });
    }

    // FIXED: Pass the action parameter to processGameAmount for proper currency conversion
    const amountInBDT = processGameAmount(amountValue, currency, action);

    // Log the transaction
    const gameHistory = new GameHistory({
      transaction_id,
      action,
      type: expectedAction,
      amount: amountInBDT,
      currency: 'BDT',
      game_uuid,
      round_id: round_id || (expectedAction === 'refund' ? 'refund_no_round_id' : 'unknown'),
      finished: finished === '1' || finished === true,
      player_id,
      session_id,
      merchant_id: req.headers['x-merchant-id'],
      provider_timestamp: new Date(parseInt(req.headers['x-timestamp']) * 1000),
      signature: req.headers['x-sign'],
      nonce: req.headers['x-nonce'],
      status: 'pending'
    });

    await gameHistory.save();

    const user = await UserModel.findOne({ player_id });
    if (!user) {
      await GameHistory.findOneAndUpdate(
        { transaction_id },
        {
          status: 'failed',
          error_message: 'Player not found'
        }
      );

      // Release locks
      processedTransactions.delete(transactionLockKey);
      if (refundLockKey) processedTransactions.delete(refundLockKey);
      return res.json({
        error_code: "PLAYER_NOT_FOUND",
        error_description: "Player not found"
      });
    }

    // Check for existing transaction in user history - THIS IS THE CRITICAL CHECK
    const existingTransaction = user.transactionHistory.find(
      t => t.referenceId === transaction_id && t.type === action
    );

    if (existingTransaction) {
      await GameHistory.findOneAndUpdate(
        { transaction_id },
        {
          status: 'processed',
          error_message: 'Duplicate transaction'
        }
      );

      // For duplicate transactions, return the current balance without processing
      // Release locks
      processedTransactions.delete(transactionLockKey);
      if (refundLockKey) processedTransactions.delete(refundLockKey);
      return res.json({
        balance: convertBDTtoEUR(user.balance),
        transaction_id: transaction_id
      });
    }

    // NOW add to processedTransactions - only after we've confirmed it's not a duplicate
    processedTransactions.set(transactionKey, Date.now());

    let balanceChange = 0;
    let transactionDescription = '';
    let shouldProcess = true;
    let winAmountInBDT = 0; // Store win amount for validation
    let refundAmountInBDT = 0; // Store refund amount for validation

    // ADDED: Debug logging for balance tracking
    console.log("=== BALANCE TRACKING ===");
    console.log("Before processing:", {
      player_id: player_id,
      action: action,
      amount: amountValue,
      currency: currency,
      balance_before_bdt: user.balance,
      balance_before_eur: convertBDTtoEUR(user.balance)
    });

    switch (action) {
      case 'bet':
        // Use the already converted amountInBDT
        const betAmountInBDT = amountInBDT;
        
        // DEBUG: Log the bet conversion details
        console.log("Bet processing details:", {
          original_amount_eur: amountValue,
          converted_amount_bdt: betAmountInBDT,
          player_balance_before_bdt: user.balance,
          player_balance_before_eur: convertBDTtoEUR(user.balance),
          conversion_rate: CURRENCY_RATES.EUR_TO_BDT
        });
        
        // Check if user has sufficient balance
        if (user.balance < betAmountInBDT) {
          await GameHistory.findOneAndUpdate(
            { transaction_id },
            {
              status: 'failed',
              error_message: 'Insufficient funds'
            }
          );

          // Remove from processed transactions to allow retry
          processedTransactions.delete(transactionKey);
          // Release locks
          processedTransactions.delete(transactionLockKey);
          if (refundLockKey) processedTransactions.delete(refundLockKey);

          return res.json({
            error_code: "INSUFFICIENT_FUNDS",
            error_description: "Not enough money to place bet",
            balance: convertBDTtoEUR(user.balance) // Return current balance in EUR
          });
        }
        
        balanceChange = -betAmountInBDT;
        transactionDescription = `Game bet for ${amountValue} EUR (${betAmountInBDT} BDT)`;
        user.total_bet += betAmountInBDT;
        break;

      case 'win':
        // FIXED: Use the already converted amountInBDT
        winAmountInBDT = amountInBDT;
        
        // Log the conversion for debugging
        console.log("Win processing:", {
          original_amount_eur: amountValue,
          converted_amount_bdt: winAmountInBDT,
          player_balance_before_bdt: user.balance,
          player_balance_before_eur: convertBDTtoEUR(user.balance),
          conversion_rate: CURRENCY_RATES.EUR_TO_BDT
        });
        
        balanceChange = winAmountInBDT;
        transactionDescription = `Game win for ${amountValue} EUR (${winAmountInBDT} BDT)`;
        user.total_wins += winAmountInBDT;
        
        // ADDED: Special validation for win transactions
        const expectedBalanceBDT = user.balance + winAmountInBDT;
        const expectedBalanceEUR = convertBDTtoEUR(expectedBalanceBDT);
        
        console.log("Win validation:", {
          transaction_id,
          expected_balance_bdt: expectedBalanceBDT,
          expected_balance_eur: expectedBalanceEUR
        });
        break;

      case 'refund':
        // FIXED: Convert refund amount from EUR to BDT using the correct conversion
        refundAmountInBDT = processGameAmount(amountValue, currency, 'refund');
        
        // CRITICAL: Add detailed refund logging
        console.log("=== REFUND PROCESSING DETAILS ===");
        console.log("Refund request details:", {
          transaction_id,
          player_id,
          refund_amount_eur: amountValue,
          converted_refund_bdt: refundAmountInBDT,
          bet_transaction_id,
          balance_before_refund: user.balance,
          expected_balance_after: user.balance + refundAmountInBDT,
          conversion_rate: CURRENCY_RATES.EUR_TO_BDT
        });
        
        // Allow refunds without round_id but log a warning
        let refundRoundId = round_id;
        if (!refundRoundId) {
          console.warn(`Refund requested without round_id for transaction: ${transaction_id}`);
          // Continue processing but use a fallback value
          refundRoundId = `refund_no_round_id_${Date.now()}`;
        }

        if (!bet_transaction_id) {
          console.error("Refund requested without bet_transaction_id:", {
            transaction_id,
            player_id,
            amount: amountValue
          });
          
          await GameHistory.findOneAndUpdate(
            { transaction_id },
            {
              status: 'failed',
              error_message: 'bet_transaction_id is required for refund'
            }
          );

          // Remove from processed transactions
          processedTransactions.delete(transactionKey);
          // Release locks
          processedTransactions.delete(transactionLockKey);
          if (refundLockKey) processedTransactions.delete(refundLockKey);

          return res.json({
            error_code: "INVALID_PARAMETERS",
            error_description: "bet_transaction_id is required for refund processing",
            // Return current balance to prevent incorrect balance changes
            balance: convertBDTtoEUR(user.balance)
          });
        }

        // Find the original bet transaction - with enhanced logging
        const originalBet = user.transactionHistory.find(
          t => t.referenceId === bet_transaction_id && t.type === 'bet'
        );

        // DEBUG: Log all transactions to help identify the issue
        console.log("Searching for original bet transaction:", {
          bet_transaction_id,
          player_id,
          all_transactions: user.transactionHistory.map(t => ({
            type: t.type,
            referenceId: t.referenceId,
            amount: t.amount,
            timestamp: t.timestamp
          }))
        });

        if (!originalBet) {
          console.error("Original bet transaction not found for refund:", {
            transaction_id,
            bet_transaction_id,
            player_id,
            user_has_transactions: user.transactionHistory.length > 0
          });
          
          // Additional check: maybe the bet is in the GameHistory collection
          const betInGameHistory = await GameHistory.findOne({
            transaction_id: bet_transaction_id,
            player_id: player_id,
            action: 'bet'
          });
          
          console.log("Alternative search in GameHistory:", {
            found: !!betInGameHistory,
            bet_details: betInGameHistory
          });
          
          await GameHistory.findOneAndUpdate(
            { transaction_id },
            {
              status: 'failed',
              error_message: 'Original bet transaction not found'
            }
          );

          // Remove from processed transactions
          processedTransactions.delete(transactionKey);
          // Release locks
          processedTransactions.delete(transactionLockKey);
          if (refundLockKey) processedTransactions.delete(refundLockKey);

          return res.json({
            error_code: "TRANSACTION_NOT_FOUND",
            error_description: "Original bet transaction not found for refund",
            // Return current balance to prevent incorrect balance changes
            balance: convertBDTtoEUR(user.balance)
          });
        }

        // Check if this refund has already been processed
        const existingRefund = user.transactionHistory.find(
          t => t.referenceId === transaction_id && t.type === 'refund'
        );

        if (existingRefund) {
          console.log("Refund already processed:", {
            transaction_id,
            player_id
          });
          
          await GameHistory.findOneAndUpdate(
            { transaction_id },
            {
              status: 'duplicate',
              error_message: 'Refund already processed'
            }
          );

          // Remove from processed transactions
          processedTransactions.delete(transactionKey);
          // Release locks
          processedTransactions.delete(transactionLockKey);
          if (refundLockKey) processedTransactions.delete(refundLockKey);

          // For duplicate refunds, return the current balance without processing
          return res.json({
            balance: convertBDTtoEUR(user.balance),
            transaction_id: transaction_id
          });
        }

        // FIXED: Verify refund amount doesn't exceed original bet (in BDT)
        const originalBetAmountInBDT = Math.abs(originalBet.amount); // Use absolute value
        if (refundAmountInBDT > originalBetAmountInBDT) {
          console.error("Refund amount exceeds original bet:", {
            transaction_id,
            refund_amount_bdt: refundAmountInBDT,
            original_bet_amount_bdt: originalBetAmountInBDT,
            refund_amount_eur: amountValue,
            currency: currency
          });
          
          await GameHistory.findOneAndUpdate(
            { transaction_id },
            {
              status: 'failed',
              error_message: 'Refund amount exceeds original bet'
            }
          );

          // Remove from processed transactions
          processedTransactions.delete(transactionKey);
          // Release locks
          processedTransactions.delete(transactionLockKey);
          if (refundLockKey) processedTransactions.delete(refundLockKey);

          return res.json({
            error_code: "INVALID_AMOUNT",
            error_description: "Refund amount cannot exceed original bet amount",
            // Return current balance to prevent incorrect balance changes
            balance: convertBDTtoEUR(user.balance)
          });
        }

        // CRITICAL FIX: Remove the incorrect balance check for refunds
        // Refunds should ALWAYS increase the balance, so this check was wrong
        console.log("Processing refund - balance will increase:", {
          transaction_id,
          balance_before: user.balance,
          refund_amount: refundAmountInBDT,
          will_result_in: user.balance + refundAmountInBDT
        });
        
        balanceChange = refundAmountInBDT;
        transactionDescription = `Game refund for ${amountValue} EUR (${refundAmountInBDT} BDT) (original bet: ${bet_transaction_id})`;
        break;

      default:
        shouldProcess = false;
        console.error(`Unknown action type: ${action}`);
        
        // Remove from processed transactions for unknown actions
        processedTransactions.delete(transactionKey);
        // Release locks
        processedTransactions.delete(transactionLockKey);
        if (refundLockKey) processedTransactions.delete(refundLockKey);
    }

    if (shouldProcess) {
      const balanceBefore = user.balance;
      user.balance += balanceChange;

      // CRITICAL FIX: Prevent negative balance with proper validation
      if (user.balance < 0) {
        // Revert the balance change
        user.balance = balanceBefore;
        
        await GameHistory.findOneAndUpdate(
          { transaction_id },
          {
            status: 'failed',
            error_message: 'Negative balance prevented'
          }
        );

        // Remove from processed transactions
        processedTransactions.delete(transactionKey);
        // Release locks
        processedTransactions.delete(transactionLockKey);
        if (refundLockKey) processedTransactions.delete(refundLockKey);

        return res.json({
          error_code: "INSUFFICIENT_FUNDS",
          error_description: "Transaction would result in negative balance"
        });
      }

      user.transactionHistory.push({
        type: action,
        amount: Math.abs(amountInBDT),
        balanceBefore: balanceBefore,
        balanceAfter: user.balance,
        description: transactionDescription,
        referenceId: transaction_id,
        originalTransactionId: action === 'refund' ? bet_transaction_id : undefined,
        roundId: round_id,
        timestamp: new Date()
      });

      await GameHistory.findOneAndUpdate(
        { transaction_id },
        {
          status: 'processed',
          processed_at: new Date(),
          bet_transaction_id: action === 'refund' ? bet_transaction_id : undefined
        }
      );

      await user.save();

      // ENHANCED: Detailed refund validation logging
      if (action === 'refund') {
        console.log("=== REFUND VALIDATION ===");
        console.log("Refund processing details:", {
          transaction_id,
          player_id,
          refund_amount_eur: amountValue,
          converted_refund_bdt: refundAmountInBDT,
          original_bet_id: bet_transaction_id,
          original_bet_amount_bdt: originalBetAmountInBDT,
          balance_before: balanceBefore,
          balance_after: user.balance,
          expected_balance_after: balanceBefore + refundAmountInBDT,
          balance_difference: user.balance - (balanceBefore + refundAmountInBDT),
          conversion_rate: CURRENCY_RATES.EUR_TO_BDT
        });
        
        // Validate the refund was processed correctly
        const expectedBalance = balanceBefore + refundAmountInBDT;
        if (Math.abs(user.balance - expectedBalance) > 0.01) {
          console.error("CRITICAL: Refund balance discrepancy detected!", {
            transaction_id,
            expected_balance: expectedBalance,
            actual_balance: user.balance,
            difference: user.balance - expectedBalance
          });
          
          // Correct the balance
          user.balance = expectedBalance;
          await user.save();
          console.log("Balance corrected after refund discrepancy");
        }
      }

      // Add validation for win transactions to ensure proper processing
      if (action === 'win') {
        const expectedBalanceEUR = convertBDTtoEUR(balanceBefore + winAmountInBDT);
        const actualBalanceEUR = convertBDTtoEUR(user.balance);
        
        if (Math.abs(expectedBalanceEUR - actualBalanceEUR) > 0.01) {
          console.error("CRITICAL: Win amount not properly processed!", {
            transaction_id,
            expected_balance_eur: expectedBalanceEUR,
            actual_balance_eur: actualBalanceEUR,
            difference: Math.abs(expectedBalanceEUR - actualBalanceEUR),
            win_amount_eur: amountValue,
            win_amount_bdt: winAmountInBDT
          });
          
          // ADDED: Attempt to correct the balance if there's a discrepancy
          const expectedBalanceBDT = balanceBefore + winAmountInBDT;
          if (Math.abs(user.balance - expectedBalanceBDT) > 0.01) {
            console.log("Correcting balance discrepancy for win transaction");
            user.balance = expectedBalanceBDT;
            await user.save();
          }
        }
      }

      // ADDED: Debug logging after processing
      console.log("After processing:", {
        balance_after_bdt: user.balance,
        balance_after_eur: convertBDTtoEUR(user.balance),
        balance_change: user.balance - balanceBefore
      });

      console.log(`Successfully processed ${action}:`, {
        transaction_id,
        player_id,
        balance_before_bdt: balanceBefore,
        balance_after_bdt: user.balance,
        balance_before_eur: convertBDTtoEUR(balanceBefore),
        balance_after_eur: convertBDTtoEUR(user.balance),
        amount: amountInBDT,
        callback_type: action,
        bet_transaction_id: action === 'refund' ? bet_transaction_id : 'N/A'
      });
    }

    // Release locks
    processedTransactions.delete(transactionLockKey);
    if (refundLockKey) processedTransactions.delete(refundLockKey);
    
    res.json({
      balance: convertBDTtoEUR(user.balance),
      transaction_id: transaction_id
    });

  } catch (error) {
    console.error(`${expectedAction} callback error:`, error.message);

    // Remove from processed transactions on error
    if (req.body.transaction_id && req.body.action) {
      const transactionKey = `${req.body.transaction_id}_${req.body.action}`;
      processedTransactions.delete(transactionKey);
      
      await GameHistory.findOneAndUpdate(
        { transaction_id: req.body.transaction_id },
        {
          status: 'failed',
          error_message: error.message.substring(0, 200)
        }
      ).catch(e => console.error("Failed to update game history:", e));
    }

    // Release locks if they were set
    if (transactionLockKey) processedTransactions.delete(transactionLockKey);
    if (refundLockKey) processedTransactions.delete(refundLockKey);

    if (error.message === 'Invalid signature' || error.message === 'Missing required authentication headers') {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Internal server error"
      });
    }

    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
}
async function handleBalanceCallback(req, res) {
  try {
    console.log("Balance callback received from Game Aggregator:", {
      body: req.body,
      headers: {
        'X-Merchant-Id': req.headers['x-merchant-id'],
        'X-Timestamp': req.headers['x-timestamp'],
        'X-Nonce': req.headers['x-nonce'],
        'X-Sign': req.headers['x-sign']
      }
    });

    const { action, player_id, currency, session_id } = req.body;

    if (!player_id || !currency) {
      return res.json({
        error_code: "INVALID_PARAMETERS",
        error_description: "player_id and currency are required"
      });
    }

    const user = await UserModel.findOne({ player_id });

    if (!user) {
      console.log("Player not found:", player_id);
      return res.json({
        error_code: "PLAYER_NOT_FOUND",
        error_description: "Player not found"
      });
    }

    let balanceToReturn;

    if (currency.toUpperCase() === 'EUR') {
      balanceToReturn = convertBDTtoEUR(user.balance);
      console.log(`Converted balance: ${user.balance} BDT → ${balanceToReturn} EUR`);
    } else {
      console.warn(`Unsupported currency requested: ${currency}. Returning 0.`);
      balanceToReturn = 0;
    }

    console.log("Returning balance for player:", {
      player_id,
      original_balance_bdt: user.balance,
      converted_balance_eur: balanceToReturn,
      requested_currency: currency
    });

    res.json({
      balance: balanceToReturn
    });

  } catch (error) {
    console.error("Balance callback error:", error);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
}

// Unified callback handler that accepts all action types
Gamesroute.post("/callback/game", async (req, res) => {
  try {
    console.log("Game callback received:", {
      body: req.body,
      headers: req.headers,
      timestamp: new Date().toISOString()
    });

    // Validate signature first
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const { action } = req.body;

    // Route to appropriate handler based on action
    switch (action) {
      case 'bet':
        return await handleGameCallback(req, res, 'bet');
      case 'win':
        return await handleGameCallback(req, res, 'win');
      case 'refund':
        return await handleGameCallback(req, res, 'refund');
      case 'balance':
        return await handleBalanceCallback(req, res);
      case 'rollback':
        return await handleRollbackCallback(req, res);
      default:
        console.log(`Unknown action received: ${action}`);
        return res.status(200).json({
          error_code: "INVALID_ACTION",
          error_description: `Unknown action: ${action}`
        });
    }
  } catch (error) {
    console.error("Game callback error:", error.message);
    
    if (error.message === 'Invalid signature' || error.message.includes('Missing required authentication headers')) {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Internal server error"
      });
    }

    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

// Keep legacy endpoints for backward compatibility
Gamesroute.post("/callback/bet", async (req, res) => {
  console.log("Legacy bet callback received:", req.body);
  try {
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);
    await handleGameCallback(req, res, req.body.action || 'bet');
  } catch (error) {
    console.error("Bet callback error:", error.message);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

Gamesroute.post("/callback/win", async (req, res) => {
  console.log("Legacy win callback received:", req.body);
  try {
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);
    await handleGameCallback(req, res, req.body.action || 'win');
  } catch (error) {
    console.error("Win callback error:", error.message);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

Gamesroute.post("/callback/refund", async (req, res) => {
  console.log("Legacy refund callback received:", req.body);
  try {
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);
    await handleGameCallback(req, res, req.body.action || 'refund');
  } catch (error) {
    console.error("Refund callback error:", error.message);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

// Dedicated balance callback endpoint
Gamesroute.post("/callback/balance", async (req, res) => {
  console.log("Balance callback received at dedicated endpoint:", req.body);
  await handleBalanceCallback(req, res);
});

// Rollback callback handler
async function handleRollbackCallback(req, res) {
  try {
    console.log("Rollback callback received:", {
      body: req.body,
      headers: req.headers
    });

    const headers = validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const {
      action,
      currency,
      game_uuid,
      player_id,
      transaction_id,
      rollback_transactions,
      session_id,
      provider_round_id,
      round_id,
      transaction_datetime,
      casino_request_retry_count
    } = req.body;

    const user = await UserModel.findOne({ player_id });
    if (!user) {
      return res.json({
        error_code: "PLAYER_NOT_FOUND",
        error_description: "Player not found"
      });
    }

    const existingRollback = user.transactionHistory.find(
      t => t.referenceId === transaction_id && t.type === 'rollback'
    );

    if (existingRollback) {
      return res.json({
        balance: convertBDTtoEUR(user.balance),
        transaction_id: existingRollback._id.toString(),
        rollback_transactions: rollback_transactions.map(t => t.transaction_id)
      });
    }

    const processedTransactions = [];
    let balanceChange = 0;

    for (const tx of rollback_transactions) {
      const existingTx = user.transactionHistory.find(
        t => t.referenceId === tx.transaction_id && t.type === tx.action
      );

      if (existingTx) {
        const txAmount = processGameAmount(parseFloat(tx.amount) || 0, tx.currency || 'EUR');

        if (tx.action === 'bet') {
          balanceChange += txAmount;
        } else if (tx.action === 'win') {
          balanceChange -= txAmount;
        } else if (tx.action === 'refund') {
          balanceChange -= txAmount;
        }
        processedTransactions.push(tx.transaction_id);
      }
    }

    const balanceBefore = user.balance;
    user.balance += balanceChange;

    // CRITICAL FIX: Prevent negative balance in rollback
    if (user.balance < 0) {
      user.balance = balanceBefore;
      return res.json({
        error_code: "INSUFFICIENT_FUNDS",
        error_description: "Rollback would result in negative balance"
      });
    }

    user.transactionHistory.push({
      type: 'rollback',
      amount: Math.abs(balanceChange),
      balanceBefore: balanceBefore,
      balanceAfter: user.balance,
      description: `Game rollback for transactions: ${processedTransactions.join(', ')}`,
      referenceId: transaction_id,
      timestamp: new Date()
    });

    await user.save();

    res.json({
      balance: convertBDTtoEUR(user.balance),
      transaction_id: transaction_id,
      rollback_transactions: processedTransactions
    });

  } catch (error) {
    console.error("Rollback callback error:", error);

    if (error.message === 'Invalid signature' || error.message === 'Missing required authentication headers') {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Internal server error"
      });
    }

    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
}

// Rollback Callback
Gamesroute.post("/callback/rollback", async (req, res) => {
  console.log("Rollback callback received:", req.body);
  try {
    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);
    await handleRollbackCallback(req, res);
  } catch (error) {
    console.error("Rollback callback error:", error.message);
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error"
    });
  }
});

// Self Validation
Gamesroute.post("/self-validate", async (req, res) => {
  try {
    const { session_id } = req.body;

    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: "Session ID (session_id) is required. Obtain it from a /games/init call."
      });
    }

    if (!GAME_AGGREGATOR_CONFIG.MERCHANT_ID || !GAME_AGGREGATOR_CONFIG.MERCHANT_KEY || !GAME_AGGREGATOR_CONFIG.BASE_API_URL) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error: Missing game aggregator credentials"
      });
    }

    const requestParams = { session_id };
    const headers = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': Math.floor(Date.now() / 1000),
      'X-Nonce': crypto.randomBytes(16).toString('hex')
    };

    const allParams = { ...requestParams, ...headers };
    const xSign = calculateXSign(allParams, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    const apiUrl = `${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/self-validate`;

    const response = await axios.post(
      apiUrl,
      new URLSearchParams(requestParams).toString(),
      {
        headers: {
          ...headers,
          'X-Sign': xSign,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 60000
      }
    );
   
    console.log("Self validation response:", response.data);
    res.json(response.data);

  } catch (error) {
    let errorMessage = "Failed to perform self-validation";
    let statusCode = 500;
    if (error.code === 'ECONNREFUSED') {
      errorMessage = "Cannot connect to Game Aggregator API - server may be down";
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = "Connection to Game Aggregator API timed out after 1 minute - please try again";
    } else if (error.message.includes('socket hang up')) {
      errorMessage = "Network connection failed - check firewall and SSL configuration";
    } else if (axios.isAxiosError(error) && error.response) {
      statusCode = error.response.status;
      errorMessage = `Game Aggregator API returned error: ${error.response.status} ${error.response.statusText}`;
    }

    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: error.response?.data || error.message
    });
  }
});

module.exports = Gamesroute;