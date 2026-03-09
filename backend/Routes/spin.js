const express = require('express');
const Gamesroute = express.Router();
const axios = require('axios');
const UserModel = require("../Models/User");
const crypto = require('crypto');
const GameHistory = require('../Models/Gameslogs');
const GameSession = require('../Models/GameSession');

// ========================================= GAMING PART 
// Game Aggregator Configuration
// Game Aggregator Configuration
const GAME_AGGREGATOR_CONFIG = {
  MERCHANT_ID: '152b223c2d757c1803f7c67229a505f7',
  MERCHANT_KEY: 'a54987730bd43743a9f2bda32d6b97c32ab22254',
  BASE_API_URL: 'https://staging.slotegrator.com/api/index.php/v1'
};
// const GAME_AGGREGATOR_CONFIG = {
//   MERCHANT_ID: '5287a260dbfabb71d053ef30920494d3',
//   MERCHANT_KEY: 'a5db176e5f441676a0beed6424a0460746ea70f9',
//   BASE_API_URL: 'https://gis.slotegrator.com/api/index.php/v1'
// };

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
      value.forEach((item, index) => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(subKey => {
            const subValue = item[subKey];
            if (subValue !== undefined && subValue !== null) {
              cleanedParams[`${key}[${index}][${subKey}]`] = subValue.toString();
            }
          });
        } else {
          cleanedParams[`${key}[${index}]`] = item.toString();
        }
      });
    } else if (typeof value === 'object') {
      cleanedParams[key] = JSON.stringify(value).replace(/"/g, '');
    } else {
      cleanedParams[key] = value.toString();
    }
  });

  let sortedKeys = null;
  let queryString = null;

  if (cleanedParams.action === "rollback") {
    const customOrder = [
      "X-Merchant-Id",
      "X-Nonce",
      "X-Timestamp",
      "action",
      "currency",
      "game_uuid",
      "player_id",
      "rollback_transactions",
      "session_id",
      "transaction_id",
      "type"
    ];

    sortedKeys = Object.keys(cleanedParams).sort((a, b) => {
      const indexA = customOrder.findIndex(prefix => a.startsWith(prefix));
      const indexB = customOrder.findIndex(prefix => b.startsWith(prefix));
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;

      if (indexA === indexB) {
        return a.localeCompare(b);
      }

      return indexA - indexB;
    });
  } else {
    sortedKeys = Object.keys(cleanedParams).sort();
  }

  queryString = sortedKeys
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(cleanedParams[key])}`)
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
// function validateCallbackSignature(req, merchantKey) {
//   try {
//     const headers = {
//       'X-Merchant-Id': req.headers['x-merchant-id'] || req.headers['X-Merchant-Id'],
//       'X-Timestamp': req.headers['x-timestamp'] || req.headers['X-Timestamp'],
//       'X-Nonce': req.headers['x-nonce'] || req.headers['X-Nonce'],
//       'X-Sign': req.headers['x-sign'] || req.headers['X-Sign']
//     };

//     if (!headers['X-Merchant-Id'] || !headers['X-Timestamp'] ||
//       !headers['X-Nonce'] || !headers['X-Sign']) {
//       throw new Error('Missing required authentication headers');
//     }

//     const normalizedBody = { ...req.body };

//     if (normalizedBody.rollback_transactions && Array.isArray(normalizedBody.rollback_transactions)) {
//       normalizedBody.rollback_transactions = JSON.stringify(normalizedBody.rollback_transactions);
//     }

//     const allParams = {
//       ...normalizedBody,
//       'X-Merchant-Id': headers['X-Merchant-Id'],
//       'X-Timestamp': headers['X-Timestamp'],
//       'X-Nonce': headers['X-Nonce'],
//     };

//     const expectedSign = calculateXSign(allParams, merchantKey);

//     console.log("Signature validation:", {
//       received: headers['X-Sign'],
//       expected: expectedSign,
//       params: allParams
//     });

//     console.log(headers['X-Sign'])

//     if (headers['X-Sign'] !== expectedSign) {
//       throw new Error('Invalid signature');
//     }

//     return headers;
//   } catch (error) {
//     throw error;
//   }
// }

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
      balance: user.balance
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
        initial_balance: user.balance,
        validated: false,
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
      currency,
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
      currency,
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
// async function handleGameCallback(req, res, expectedAction) {
//   let transactionLockKey = null;
//   let user = null;
//   let balanceBefore = 0;

//   try {
//     // Validate signature first
//     validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

//     // Handle balance requests that are incorrectly sent to other endpoints
//     if (req.body.action === "balance") {
//       console.log("Balance request routed to wrong endpoint, redirecting to balance handler");
//       return await handleBalanceCallback(req, res);
//     }

//     const {
//       action,
//       amount,
//       currency = 'EUR',
//       game_uuid,
//       player_id,
//       transaction_id,
//       session_id,
//       round_id,
//       finished,
//       bet_transaction_id,
//       type,
//       freespin_id,
//       quantity,
//       transaction_datetime,
//       casino_request_retry_count,
//       is_finished
//     } = req.body;

//     console.log(`${action.toUpperCase()} callback received:`, {
//       transaction_id,
//       player_id,
//       amount,
//       currency,
//       game_uuid,
//       session_id,
//       round_id,
//       bet_transaction_id
//     });

//     // ============ SESSION VALIDATION ============
//     if (session_id) {
//       const sessionData = activeSessions.get(session_id);
//       if (sessionData && sessionData.game_uuid !== game_uuid) {
//         console.error("Game UUID mismatch in callback:", {
//           session_id,
//           expected_game_uuid: sessionData.game_uuid,
//           received_game_uuid: game_uuid,
//           player_id,
//           action
//         });

//         return res.status(200).json({
//           error_code: "SESSION_VALIDATION_FAILED",
//           error_description: "Session validation failed - callback does not match active session"
//         });
//       }
//     }

//     // ============ ZERO AMOUNT PREVENTION ============
//     // if (action !== 'balance' && (amount === 0 || amount === '0' || parseFloat(amount) === 0)) {
//     //     console.log("Zero amount attempt prevented:", {
//     //         transaction_id,
//     //         player_id,
//     //         game_uuid,
//     //         session_id,
//     //         amount,
//     //         action
//     //     });

//     //     try {
//     //         await GameHistory.create({
//     //             player_id: player_id,
//     //             transaction_id: transaction_id,
//     //             type: action,
//     //             action: action,
//     //             amount: 0,
//     //             currency: currency,
//     //             game_uuid: game_uuid,
//     //             session_id: session_id,
//     //             round_id: round_id || `zero_${action}_${Date.now()}`,
//     //             status: 'rejected',
//     //             balance_before: 0,
//     //             balance_after: 0,
//     //             error_code: "ZERO_AMOUNT_ATTEMPT",
//     //             error_description: `${action} amount cannot be zero`,
//     //             merchant_id: GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
//     //             nonce: req.headers['x-nonce'] || req.headers['X-Nonce'],
//     //             signature: req.headers['x-sign'] || req.headers['X-Sign'],
//     //             provider_timestamp: req.headers['x-timestamp'] || req.headers['X-Timestamp'],
//     //             created_at: new Date()
//     //         });
//     //     } catch (historyError) {
//     //         console.error("Failed to save zero amount attempt history:", historyError);
//     //     }

//     //     return res.status(200).json({
//     //         error_code: "INVALID_AMOUNT",
//     //         error_description: `${action} amount cannot be zero`
//     //     });
//     // }

//     // Validate required parameters
//     if (!player_id || !transaction_id) {
//       return res.status(200).json({
//         error_code: "INVALID_PARAMETERS",
//         error_description: "player_id and transaction_id are required"
//       });
//     }

//     if (action !== 'balance' && !amount) {
//       return res.status(200).json({
//         error_code: "INVALID_PARAMETERS",
//         error_description: "amount is required for this action"
//       });
//     }

//     // Set up transaction lock to prevent duplicate processing
//     transactionLockKey = `${player_id}_${transaction_id}_${action}`;

//     // Check for duplicate transactions
//     // if (processedTransactions.has(transactionLockKey)) {
//     //     const timestamp = processedTransactions.get(transactionLockKey);
//     //     if (Date.now() - timestamp > TRANSACTION_CLEANUP_TIME) {
//     //         processedTransactions.delete(transactionLockKey);
//     //     } else {
//     //         console.log(`Transaction already processed: ${transactionLockKey}`);
//     //         user = await UserModel.findOne({ player_id });
//     //         if (!user) {
//     //             return res.status(200).json({
//     //                 error_code: "PLAYER_NOT_FOUND",
//     //                 error_description: "Player not found"
//     //             });
//     //         }

//     //         return res.status(200).json({
//     //             balance: user.balance,
//     //             transaction_id: transaction_id,
//     //             already_processed: true
//     //         });
//     //     }
//     // }
//     user = await UserModel.findOne({ player_id });

//     // if (processedTransactions.has(transactionLockKey)) {
//     //   let existingTransaction = null;

//     //   if (action == "refund") {
//     //     existingTransaction = await GameHistory.findOne({
//     //       transaction_id: bet_transaction_id,
//     //       type: "bet"
//     //     });
//     //   } else {
//     //     existingTransaction = await GameHistory.findOne({
//     //       transaction_id: bet_transaction_id,
//     //       type: action
//     //     });
//     //   }

//     //   if (existingTransaction) {
//     //     return res.status(200).json({
//     //       balance: user.balance,
//     //       transaction_id: existingTransaction.transaction_id,
//     //     });
//     //   }
//     // }

//     processedTransactions.set(transactionLockKey, Date.now());

//     // Find user
//     if (!user) {
//       processedTransactions.delete(transactionLockKey);
//       return res.status(200).json({
//         error_code: "PLAYER_NOT_FOUND",
//         error_description: "Player not found"
//       });
//     }


//     // Enhanced transaction existence check
//     const existingTransaction = user.transactionHistory.find(
//       t => t.referenceId === transaction_id && t.type === action
//     );


//     if (existingTransaction) {
//       console.log(`Transaction ${transaction_id} (${action}) already exists in history`);
//       processedTransactions.delete(transactionLockKey);
//       return res.status(200).json({
//         balance: user.balance,
//         transaction_id: existingTransaction._id.toString(),
//         already_processed: true
//       });
//     }

//     balanceBefore = user.balance;
//     let transactionDescription = '';
//     let amountValue = parseFloat(amount) || 0;

//     // Handle different action types with enhanced validation
//     switch (action) {
//       case 'bet':
//         // if (amountValue <= 0) {
//         //   // processedTransactions.delete(transactionLockKey);)

//         //   await GameHistory.create({
//         //     player_id: player_id,
//         //     transaction_id: transaction_id,
//         //     type: action,
//         //     action: action,
//         //     amount: amountValue,
//         //     currency: currency,
//         //     game_uuid: game_uuid,
//         //     session_id: session_id,
//         //     round_id: round_id || `system_${Date.now()}_${transaction_id.substr(0, 8)}`,
//         //     status: 'completed',
//         //     balance_before: balanceBefore,
//         //     balance_after: user.balance,
//         //     merchant_id: GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
//         //     nonce: req.headers['x-nonce'] || req.headers['X-Nonce'],
//         //     signature: req.headers['x-sign'] || req.headers['X-Sign'],
//         //     provider_timestamp: req.headers['x-timestamp'] || req.headers['X-Timestamp'],
//         //     created_at: new Date()
//         //   });

//         //   return res.status(200).json({
//         //     balance: balanceBefore,
//         //     transaction_id: transaction_id
//         //   });
//         // }
//         if (user.balance < amountValue) {
//           processedTransactions.delete(transactionLockKey);
//           return res.status(200).json({
//             error_code: "INSUFFICIENT_FUNDS",
//             error_description: "Insufficient balance for this bet"
//           });
//         }

//         transactionDescription = `Bet placed on game ${game_uuid}`;
//         user.balance -= amountValue;
//         break;

//       case 'win':
//         // Optional: Validate that win has corresponding bet
//         if (round_id) {
//           const relatedBet = user.transactionHistory.find(
//             t => t.round_id === round_id && t.type === 'bet' && t.game_uuid === game_uuid
//           );

//           if (!relatedBet) {
//             console.warn("Win without corresponding bet detected:", {
//               round_id,
//               game_uuid,
//               player_id,
//               transaction_id
//             });
//             // Allow but log for investigation
//           }
//         }

//         if (amountValue < 0) {
//           processedTransactions.delete(transactionLockKey);
//           return res.status(200).json({
//             error_code: "INVALID_WIN_AMOUNT",
//             error_description: "Win amount cannot be negative"
//           });
//         }

//         transactionDescription = `Win from game ${game_uuid}`;
//         user.balance += amountValue;
//         break;

//       case 'refund':
//         // CRITICAL: Must have a valid bet_transaction_id for refunds
//         if (!bet_transaction_id) {
//           processedTransactions.delete(transactionLockKey);
//           return res.status(200).json({
//             error_code: "INVALID_REFUND_REQUEST",
//             error_description: "bet_transaction_id is required for refunds"
//           });
//         }

//         let existingTransaction = null;

//         if (action == "refund") {
//           existingTransaction = await GameHistory.findOne({
//             transaction_id: bet_transaction_id,
//             type: "bet"
//           });
//         } else {
//           existingTransaction = await GameHistory.findOne({
//             transaction_id: bet_transaction_id,
//             type: action
//           });
//         }

//         if (!existingTransaction) {
//           console.log(`Original bet ${bet_transaction_id} not found for refund`);
//           processedTransactions.delete(transactionLockKey);
//           return res.status(200).json({
//             error_code: "INTERNAL_ERROR",
//             error_description: `Original bet transaction ${bet_transaction_id} not found`
//           });
//         }

//         // Validate refund amount doesn't exceed original bet
//         const originalBetAmount = parseFloat(existingTransaction.amount);
//         if (amountValue > originalBetAmount) {
//           processedTransactions.delete(transactionLockKey);
//           return res.status(200).json({
//             error_code: "INVALID_REFUND_AMOUNT",
//             error_description: `Refund amount ${amountValue} exceeds original bet ${originalBetAmount}`
//           });
//         }

//         transactionDescription = `Refund for bet ${bet_transaction_id}`;
//         user.balance += amountValue;
//         break;

//       default:
//         processedTransactions.delete(transactionLockKey);
//         return res.status(200).json({
//           error_code: "INVALID_ACTION",
//           error_description: `Unsupported action: ${action}`
//         });
//     }

//     // Safety check to prevent negative balance
//     if (user.balance < 0) {
//       user.balance = balanceBefore;
//       processedTransactions.delete(transactionLockKey);
//       return res.status(200).json({
//         error_code: "INSUFFICIENT_FUNDS",
//         error_description: "Transaction would result in negative balance"
//       });
//     }

//     // Add transaction to history
//     user.transactionHistory.push({
//       type: action,
//       amount: Math.abs(amountValue),
//       balanceBefore: balanceBefore,
//       balanceAfter: user.balance,
//       description: transactionDescription,
//       referenceId: transaction_id,
//       game_uuid: game_uuid,
//       round_id: round_id,
//       session_id: session_id,
//       bet_reference_id: bet_transaction_id,
//       timestamp: new Date(),
//       status: 'completed'
//     });

//     // Save user changes
//     await user.save();

//     // Log to GameHistory
//     try {
//       await GameHistory.create({
//         player_id: player_id,
//         transaction_id: transaction_id,
//         type: action,
//         action: action,
//         amount: amountValue,
//         currency: currency,
//         game_uuid: game_uuid,
//         session_id: session_id,
//         round_id: round_id || `system_${Date.now()}_${transaction_id.substr(0, 8)}`,
//         status: 'completed',
//         balance_before: balanceBefore,
//         balance_after: user.balance,
//         merchant_id: GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
//         nonce: req.headers['x-nonce'] || req.headers['X-Nonce'],
//         signature: req.headers['x-sign'] || req.headers['X-Sign'],
//         provider_timestamp: req.headers['x-timestamp'] || req.headers['X-Timestamp'],
//         created_at: new Date()
//       });
//     } catch (historyError) {
//       console.error("Failed to save game history:", historyError);
//     }

//     console.log(`Successfully processed ${action} transaction ${transaction_id}. Balance: ${balanceBefore} -> ${user.balance}`);

//     // Return success response
//     res.status(200).json({
//       balance: user.balance,
//       transaction_id: transaction_id
//     });

//   } catch (error) {
//     console.error(`${expectedAction} callback error:`, error.message);

//     // Remove from processed transactions on error
//     if (transactionLockKey) {
//       processedTransactions.delete(transactionLockKey);
//     }

//     // If user was modified, revert changes
//     if (user && user.isModified()) {
//       try {
//         await user.save();
//       } catch (saveError) {
//         console.error("Failed to revert user changes:", saveError);
//       }
//     }

//     res.status(200).json({
//       error_code: "INTERNAL_ERROR",
//       error_description: "Internal server error"
//     });
//   }
// }


/**
 * Helper function to round a number to a specified number of decimal places.
 * This is crucial for handling floating-point arithmetic with monetary values
 * to avoid precision issues.
 * @param {number} num The number to round.
 * @param {number} places The number of decimal places to round to.
 * @returns {number} The rounded number.
 */
const roundToDecimals = (num, places) => {
  if (typeof num !== 'number') return 0;
  const multiplier = Math.pow(10, places);
  return Math.round(num * multiplier) / multiplier;
};

// A Map to store locks for each player to prevent concurrent balance updates.
const playerLocks = new Map();

Gamesroute.post("/self-validate", async (req, res) => {
  let user = null;

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

    // --- Start: Capture and store the user's original balance ---
    const sessionData = activeSessions.get(session_id);
    if (!sessionData || !sessionData.player_id) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired session ID."
      });
    }
    const playerId = sessionData.player_id;
    user = await UserModel.findOne({ player_id: playerId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Player not found."
      });
    }
    const originalBalance = user.balance;
    // --- End: Capture and store the user's original balance ---

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

    if (sessionData) {
      sessionData.validated = true;
      sessionData.originalBalance = originalBalance;
      sessionData.updateBalanceYet = false;
    }

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

async function handleGameCallback(req, res, expectedAction) {
  let transactionLockKey = null;
  let user = null;
  // ------------------my-change-------------------
  let gameSession = null;
  // ------------------my-change-------------------
  let balanceBefore = 0;
  let player_id = null;

  try {
    const {
      action,
      amount,
      currency = "EUR",
      game_uuid,
      player_id: body_player_id,
      transaction_id,
      session_id,
      round_id,
      bet_transaction_id,
      rollback_transactions
    } = req.body;

    player_id = body_player_id;

    while (playerLocks.has(player_id)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    playerLocks.set(player_id, true);

    validateCallbackSignature(req, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    if (req.body.action === "balance") {
      console.log("Balance request routed to wrong endpoint, redirecting to balance handler");
      return await handleBalanceCallback(req, res);
    }

    console.log(`${action.toUpperCase()} callback received:`, {
      transaction_id,
      player_id,
      amount,
      currency,
      game_uuid,
      session_id,
      round_id,
      bet_transaction_id,
      rollback_transactions,
    });

    if (session_id) {
      const sessionData = activeSessions.get(session_id);
      console.log(sessionData, game_uuid)
      if (!sessionData) {
        return res.status(200).json({
          error_code: "INTERNAL_ERROR",
          error_description: "Session validation failed - callback does not match active session",
        });
      }
    }

    if (!player_id || !transaction_id) {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "player_id and transaction_id are required",
      });
    }

    const ACTIONS_WITHOUT_AMOUNT = ["rollback", "balance"];

    if (!ACTIONS_WITHOUT_AMOUNT.includes(action) && amount === undefined) {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "amount is required for this action",
      });
    }

    transactionLockKey = `${player_id}_${transaction_id}_${action}`;

    if (processedTransactions.has(transactionLockKey)) {
      user = await UserModel.findOne({ player_id });
      if (!user) {
        return res.status(200).json({
          error_code: "INTERNAL_ERROR",
          error_description: "Player not found",
        });
      }
      return res.status(200).json({
        balance: roundToDecimals(user.balance, 4),
        transaction_id: transactionLockKey,
      });
    }

    user = await UserModel.findOne({ player_id });
    if (!user) {
      return res.status(200).json({
        error_code: "INTERNAL_ERROR",
        error_description: "Player not found",
      });
    }

    const existingTransaction = user.transactionHistory.find(
      (t) => t.referenceId === transaction_id && t.type === action
    );
    if (existingTransaction) {
      transactionLockKey = `${player_id}_${transaction_id}_${action}`;
      return res.status(200).json({
        balance: roundToDecimals(user.balance, 4),
        transaction_id: transactionLockKey,
      });
    }

    processedTransactions.set(transactionLockKey, Date.now());

    balanceBefore = roundToDecimals(user.balance, 4);
    let transactionDescription = "";
    const amountValue = roundToDecimals(parseFloat(amount) || 0, 4);

    switch (action) {
      case "bet":
        if (user.balance < amountValue) {
          console.log("INSUFFICIENT_FUNDS INSUFFICIENT_FUNDS INSUFFICIENT_FUNDS", user.balance, amountValue)
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INSUFFICIENT_FUNDS",
            error_description: "Insufficient balance for this bet",
          });
        }
        user.balance = roundToDecimals(user.balance - amountValue, 4);
        // ------------------my-change-------------------
    // ========== UPDATE WEEKLY AND MONTHLY BET TOTALS ==========
        // Update total bet amounts for weekly and monthly bonus calculations
        user.total_bet += amountValue;
        user.lifetime_bet += amountValue;
        
        // Update weekly bet total
        const now = new Date();
        const lastSunday = new Date(now);
        lastSunday.setDate(now.getDate() - now.getDay()); // Set to last Sunday
        lastSunday.setHours(0, 0, 0, 0);
        
        // Check if we're in a new week and reset if needed
        if (!user.weeklyBonus.lastClaimed || user.weeklyBonus.lastClaimed < lastSunday) {
          user.weeklyBonus.totalBet = 0;
          user.weeklyBonus.bonusAmount = 0;
          user.weeklyBonus.status = 'expired';
        }
        
        // Add to weekly bet total
        user.weeklyBonus.totalBet += amountValue;
        
        // Update monthly bet total
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Check if we're in a new month and reset if needed
        if (!user.monthlyBonus.lastClaimed || user.monthlyBonus.lastClaimed < firstDayOfMonth) {
          user.monthlyBonus.totalBet = 0;
          user.monthlyBonus.bonusAmount = 0;
          user.monthlyBonus.status = 'expired';
        }
        
        // Add to monthly bet total
        user.monthlyBonus.totalBet += amountValue;
        // ========== END WEEKLY/MONTHLY BET UPDATES ==========
        // ------------------my-change-------------------
        transactionDescription = `Bet placed on game ${game_uuid}`;
        break;

      case "win":
        if (amountValue < 0) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INTERNAL_ERROR",
            error_description: "Win amount cannot be negative",
          });
        }
        user.balance = roundToDecimals(user.balance + amountValue, 4);
        transactionDescription = `Win from game ${game_uuid}`;
        break;

      case "refund":
        if (!bet_transaction_id) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INTERNAL_ERROR",
            error_description: "bet_transaction_id is required for refunds",
          });
        }

        const originalBet = await GameHistory.findOne({
          transaction_id: bet_transaction_id,
          type: "bet",
        });

        if (!originalBet) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            transaction_id: transaction_id,
            balance: roundToDecimals(balanceBefore, 4),
          });
        }

        const existingRefund = await GameHistory.findOne({
          round_id: round_id,
          type: action,
          game_uuid: game_uuid
        });

        if (existingRefund) {
          transactionLockKey = `${player_id}_${existingRefund.transaction_id}_${action}`;
          return res.status(200).json({
            balance: roundToDecimals(user.balance, 4),
            transaction_id: transactionLockKey,
          });
        }

        const originalBetAmount = roundToDecimals(parseFloat(originalBet.amount), 4);
        if (amountValue > originalBetAmount) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INTERNAL_ERROR",
            error_description: `Refund amount ${amountValue} exceeds original bet ${originalBetAmount}`,
          });
        }

        user.balance = roundToDecimals(user.balance + amountValue, 4);
        transactionDescription = `Refund for bet ${bet_transaction_id}`;
        break;

      case "rollback":
        if (!rollback_transactions || !Array.isArray(rollback_transactions)) {
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INTERNAL_ERROR",
            error_description: "rollback_transactions is required and must be an array"
          });
        }

        let rollbackDesc = [];

        for (const tx of rollback_transactions) {
          const { action, transaction_id, amount } = tx;

          let gameHistory = await GameHistory.findOne({
            transaction_id: transaction_id,
            type: action,
          });

          if (!gameHistory) {
            console.warn(`Rollback target not found: ${transaction_id} (${action})`);
            continue;
          }

          switch (action) {
            case "bet":
              if (gameHistory.status === "completed") {
                user.balance = roundToDecimals(user.balance + parseFloat(amount), 4);
                gameHistory.status = "rolledback";
                rollbackDesc.push(transaction_id);
              } else if (gameHistory.status === "rolledback") {
                gameHistory.status = "completed";
                rollbackDesc.push(transaction_id);
              }
              await gameHistory.save();
              break;

            case "win":
              if (gameHistory.status === "completed") {
                user.balance = roundToDecimals(user.balance - parseFloat(amount), 4);
                gameHistory.status = "rolledback";
                rollbackDesc.push(transaction_id);
              } else if (gameHistory.status === "rolledback") {
                gameHistory.status = "completed";
                rollbackDesc.push(transaction_id);
              }
              await gameHistory.save();
              break;

            default:
              console.warn(`Unsupported rollback action: ${action}`);
              rollbackDesc.push(
                `Skipped unsupported rollback action: ${action} (${transaction_id})`
              );
              break;
          }
        }

        transactionDescription = `Rollback round ${round_id}: ${rollbackDesc.join("; ")}`;

        if (user.balance < 0) {
          user.balance = roundToDecimals(balanceBefore, 4);
          processedTransactions.delete(transactionLockKey);
          return res.status(200).json({
            error_code: "INSUFFICIENT_FUNDS",
            error_description: "Transaction would result in negative balance",
          });
        }

        await user.save();

        console.log(`Successfully processed ${action} transaction ${transaction_id}. Balance: ${balanceBefore} -> ${roundToDecimals(user.balance, 4)}`);

        res.status(200).json({
          balance: roundToDecimals(user.balance, 4),
          transaction_id: transactionLockKey,
          rollback_transactions: rollbackDesc,
        });

        break;

      default:
        processedTransactions.delete(transactionLockKey);
        return res.status(200).json({
          error_code: "INTERNAL_ERROR",
          error_description: `Unsupported action: ${action}`,
        });
    }

    if (user.balance < 0) {
      user.balance = roundToDecimals(balanceBefore, 4);
      processedTransactions.delete(transactionLockKey);
      return res.status(200).json({
        error_code: "INSUFFICIENT_FUNDS",
        error_description: "Transaction would result in negative balance",
      });
    }
   // Find or create game session
    gameSession = await GameSession.findOne({ session_id, is_active: true });
    
    if (!gameSession) {
      // Create new session if it doesn't exist
      const user = await UserModel.findOne({ player_id });
      if (!user) {
        return res.status(200).json({
          error_code: "INTERNAL_ERROR",
          error_description: "Player not found",
        });
      }

      gameSession = new GameSession({
        session_id,
        player_id,
        game_uuid,
        currency,
        initial_balance: user.balance,
        current_balance: user.balance,
        transactions: []
      });
    }

     // Add transaction to session
    gameSession.addTransaction({
      transaction_id,
      type: action,
      amount: amountValue,
      currency,
      round_id,
      bet_transaction_id,
      status: 'completed'
    }); 
    user.transactionHistory.push({
      type: action,
      amount: roundToDecimals(Math.abs(amountValue), 4),
      balanceBefore,
      balanceAfter: roundToDecimals(user.balance, 4),
      description: transactionDescription,
      referenceId: transaction_id,
      game_uuid,
      round_id,
      session_id,
      bet_reference_id: bet_transaction_id,
      timestamp: new Date(),
      status: "completed",
    });
    await user.save();
    gameSession.save()
    await GameHistory.create({
      player_id,
      transaction_id,
      type: action,
      action,
      amount: amountValue,
      currency,
      game_uuid,
      session_id,
      round_id: round_id || `system_${Date.now()}_${transaction_id.substr(0, 8)}`,
      status: "completed",
      balance_before: balanceBefore,
      balance_after: roundToDecimals(user.balance, 4),
      merchant_id: GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      nonce: req.headers["x-nonce"] || req.headers["X-Nonce"],
      signature: req.headers["x-sign"] || req.headers["X-Sign"],
      provider_timestamp: req.headers["x-timestamp"] || req.headers["X-Timestamp"],
      created_at: new Date(),
    });

    console.log(`Successfully processed ${action} transaction ${transaction_id}. Balance: ${balanceBefore} -> ${roundToDecimals(user.balance, 4)}`);

    res.status(200).json({
      balance: roundToDecimals(user.balance, 4),
      transaction_id: transactionLockKey
    });
  } catch (error) {
    console.error(`${expectedAction} callback error:`, error);
    if (player_id) {
      playerLocks.delete(player_id);
    }

    if (transactionLockKey) {
      processedTransactions.delete(transactionLockKey);
    }
    res.status(200).json({
      error_code: "INTERNAL_ERROR",
      error_description: "Internal server error",
    });
  } finally {
    if (player_id) {
      playerLocks.delete(player_id);
    }
  }
}
// Route for posting balance to Game API
Gamesroute.post("/notify/balance-to-agg", async (req, res) => {
  try {
    const { balance, session_id } = req.body;
    console.log("Balance notification request:", req.body);
    
    if (!balance || !session_id) {
      return res.status(400).json({
        success: false,
        message: "balance and session_id are required"
      });
    }

    // Prepare headers for signature calculation
    const headers = {
      'X-Merchant-Id': GAME_AGGREGATOR_CONFIG.MERCHANT_ID,
      'X-Timestamp': Math.floor(Date.now() / 1000),
      'X-Nonce': crypto.randomBytes(16).toString('hex')
    };

    // Prepare parameters EXACTLY as required by Slotegrator API
    const params = { 
      balance: parseFloat(balance), // Ensure it's a number
      session_id: session_id.toString() // Ensure it's a string
    };
    
    console.log("Params for signature:", params);
    console.log("Headers for signature:", headers);

    // Calculate the X-Sign - include BOTH params and headers
    const signatureData = { ...params, ...headers };
    const xSign = calculateXSign(signatureData, GAME_AGGREGATOR_CONFIG.MERCHANT_KEY);

    console.log("Generated X-Sign:", xSign);

    // Send the balance notification to Game Aggregator API
    const response = await axios.post(
      `${GAME_AGGREGATOR_CONFIG.BASE_API_URL}/balance/notify`, 
      params, // Send only the balance and session_id parameters
      { 
        headers: { 
          ...headers, 
          'X-Sign': xSign,
          'Content-Type': 'application/x-www-form-urlencoded' // IMPORTANT: Add this header
        },
        timeout: 5000
      }
    );

    console.log("Balance notification sent successfully:", response);
    res.json({
      success: true,
      data: response.data
    });
    
  } catch (error) {
    console.error("Error sending balance notification:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    res.json({ 
      success: false, 
      message: "Failed to send balance notification",
      error: error.response?.data || error.message 
    });
  }
});

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
        error_code: "INTERNAL_ERROR",
        error_description: "player_id and currency are required"
      });
    }

    const user = await UserModel.findOne({ player_id });

    if (!user) {
      console.log("Player not found:", player_id);
      return res.json({
        error_code: "INTERNAL_ERROR",
        error_description: "Player not found"
      });
    }

    console.log(activeSessions)

    const sessionData = activeSessions.get(session_id);

    if (sessionData.updateBalanceYet == false) {
      sessionData.updateBalanceYet = true;
      user.balance = sessionData.initial_balance;
      await user.save();
    }

    console.log("Returning balance for player:", {
      player_id,
      balance: user.balance,
      requested_currency: currency
    });

    console.log("user user user", user.balance)

    res.json({
      balance: user.balance
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
        error_code: "INTERNAL_ERROR",
        error_description: "Player not found"
      });
    }

    const existingRollback = user.transactionHistory.find(
      t => t.referenceId === transaction_id && t.type === 'rollback'
    );

    if (existingRollback) {
      return res.json({
        balance: user.balance,
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
        const txAmount = parseFloat(tx.amount) || 0;

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

    // user.transactionHistory.push({
    //   type: 'rollback',
    //   amount: Math.abs(balanceChange),
    //   balanceBefore: balanceBefore,
    //   balanceAfter: user.balance,
    //   description: `Game rollback for transactions: ${processedTransactions.join(', ')}`,
    //   referenceId: transaction_id,
    //   timestamp: new Date()
    // });

    await user.save();

    res.json({
      balance: user.balance,
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
