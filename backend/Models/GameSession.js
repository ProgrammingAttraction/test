const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  transaction_id: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['bet', 'win', 'refund', 'rollback'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  round_id: String,
  bet_transaction_id: String, // For refunds, reference to original bet
  status: {
    type: String,
    enum: ['completed', 'rolledback', 'rejected'],
    default: 'completed'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const GameSessionSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  game_name:{
    type: String,
  },
  player_id: {
    type: String,
    required: true,
    index: true
  },
  game_uuid: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  initial_balance: {
    type: Number,
    required: true,
    default: 0
  },
  current_balance: {
    type: Number,
    required: true,
    default: 0
  },
  total_bet: {
    type: Number,
    default: 0
  },
  total_win: {
    type: Number,
    default: 0
  },
  total_refund: {
    type: Number,
    default: 0
  },
  net_result: {
    type: Number,
    default: 0
  },
  transactions: [TransactionSchema],
  started_at: {
    type: Date,
    default: Date.now
  },
  last_activity: {
    type: Date,
    default: Date.now
  },
  is_active: {
    type: Boolean,
    default: true
  },
  validated: {
    type: Boolean,
    default: false
  },
  merchant_id: String,
  device: {
    type: String,
    default: 'desktop'
  }
}, {
  timestamps: true
});

// Index for efficient querying
GameSessionSchema.index({ player_id: 1, session_id: 1 });
GameSessionSchema.index({ session_id: 1, 'transactions.transaction_id': 1 });
GameSessionSchema.index({ started_at: -1 });

// Method to add a transaction to the session
GameSessionSchema.methods.addTransaction = function(transactionData) {
  const {
    transaction_id,
    type,
    amount,
    currency,
    round_id,
    bet_transaction_id,
    status = 'completed'
  } = transactionData;

  // Check if transaction already exists
  const existingTransaction = this.transactions.find(
    t => t.transaction_id === transaction_id && t.type === type
  );

  if (existingTransaction) {
    return existingTransaction;
  }

  // Add new transaction
  const newTransaction = {
    transaction_id,
    type,
    amount,
    currency,
    round_id,
    bet_transaction_id,
    status,
    timestamp: new Date()
  };

  this.transactions.push(newTransaction);

  // Update session totals
  if (type === 'bet') {
    this.total_bet += amount;
    this.net_result -= amount;
    this.current_balance -= amount;
  } else if (type === 'win') {
    this.total_win += amount;
    this.net_result += amount;
    this.current_balance += amount;
  } else if (type === 'refund') {
    this.total_refund += amount;
    this.net_result += amount;
    this.current_balance += amount;
  }

  this.last_activity = new Date();

  return newTransaction;
};

// Method to get transaction by ID
GameSessionSchema.methods.getTransaction = function(transactionId, type) {
  return this.transactions.find(
    t => t.transaction_id === transactionId && (!type || t.type === type)
  );
};

// Method to check if transaction exists
GameSessionSchema.methods.hasTransaction = function(transactionId, type) {
  return this.transactions.some(
    t => t.transaction_id === transactionId && (!type || t.type === type)
  );
};

// Static method to find active session by session_id
GameSessionSchema.statics.findActiveSession = function(sessionId) {
  return this.findOne({ session_id: sessionId, is_active: true });
};

// Static method to find sessions by player
GameSessionSchema.statics.findByPlayer = function(playerId, limit = 10) {
  return this.find({ player_id: playerId })
    .sort({ started_at: -1 })
    .limit(limit);
};

// Static method to close a session
GameSessionSchema.statics.closeSession = function(sessionId) {
  return this.findOneAndUpdate(
    { session_id: sessionId },
    { is_active: false, last_activity: new Date() },
    { new: true }
  );
};

// Pre-save middleware to ensure data consistency
GameSessionSchema.pre('save', function(next) {
  // Ensure current_balance doesn't go negative
  if (this.current_balance < 0) {
    return next(new Error('Session balance cannot be negative'));
  }
  
  // Update net result
  this.net_result = this.total_win + this.total_refund - this.total_bet;
  
  next();
});

module.exports = mongoose.model('GameSession', GameSessionSchema);