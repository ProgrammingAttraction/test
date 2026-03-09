const mongoose = require('mongoose');

const GameHistorySchema = new mongoose.Schema({
    // Transaction details
    transaction_id: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        enum: ['bet', 'win', 'balance', 'refund', 'rollback',"completed"],
        required: true
    },
    type: {
        type: String,
        enum: ['bet', 'win', 'balance','refund','rollback'], // Added 'balance'
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    currency: {
        type: String,
        required: true,
        default: 'EUR'
    },
    
    // Game details
    game_uuid: {
        type: String,
        required: true,
        index: true
    },
    round_id: {
        type: String,
        required: true
    },
    finished: {
        type: Boolean,
        required: true,
        default: false
    },
    
    // Player details
    player_id: {
        type: String,
        required: true,
        index: true
    },
    session_id: {
        type: String,
        required: true,
        index: true
    },
    
    // Provider details
    merchant_id: {
        type: String,
        required: true
    },
    
    // Timestamps
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    provider_timestamp: {
        type: Date,
        required: true
    },
    
    // Signature verification
    signature: {
        type: String,
        required: true
    },
    nonce: {
        type: String,
        required: true
    },
    
    // Status
    status: {
        type: String,
        enum: ['pending', 'processed', 'failed', 'reconciled',"completed"],
        default: 'pending'
    },
    error_message: {
        type: String,
        default: null
    },
    
    // Additional metadata
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for better query performance
GameHistorySchema.index({ player_id: 1, createdAt: -1 });
GameHistorySchema.index({ session_id: 1, round_id: 1 });
GameHistorySchema.index({ transaction_id: 1 }, { unique: true });
GameHistorySchema.index({ createdAt: 1, status: 1 });

// Static method to create from callback data
GameHistorySchema.statics.createFromCallback = function(callbackData, headers) {
    const {
        action,
        amount,
        currency,
        game_uuid,
        player_id,
        transaction_id,
        session_id,
        type,
        round_id,
        finished
    } = callbackData.body || callbackData;
    
    // Validate required fields
    if (!session_id) {
        throw new Error('session_id is required');
    }
    
    if (!transaction_id) {
        throw new Error('transaction_id is required');
    }
    
    // Validate and set type - use action as fallback if type is invalid
    const validTypes = ['bet', 'win', 'balance'];
    const finalType = validTypes.includes(type) ? type : 
                     validTypes.includes(action) ? action : 'balance';
    
    return this.create({
        transaction_id,
        action: action || finalType,
        type: finalType,
        amount: parseFloat(amount) || 0,
        currency: currency || 'EUR',
        game_uuid,
        round_id: round_id || transaction_id,
        finished: finished === '1' || finished === true || finished === 'true',
        player_id,
        session_id,
        merchant_id: headers['x-merchant-id'] || headers['X-Merchant-Id'] || 'unknown',
        provider_timestamp: headers['x-timestamp'] ? 
            new Date(parseInt(headers['x-timestamp']) * 1000) : new Date(),
        signature: headers['x-sign'] || headers['X-Sign'],
        nonce: headers['x-nonce'] || headers['X-Nonce']
    });
};

// Method to check if a transaction already exists
GameHistorySchema.statics.transactionExists = function(transactionId) {
    return this.findOne({ transaction_id: transactionId }).then(doc => !!doc);
};

// Method to update status
GameHistorySchema.statics.updateStatus = function(transactionId, status, errorMessage = null) {
    return this.findOneAndUpdate(
        { transaction_id: transactionId },
        { 
            status,
            error_message: errorMessage,
            updatedAt: new Date()
        },
        { new: true }
    );
};

const GameHistory = mongoose.model('GameHistory', GameHistorySchema);

module.exports = GameHistory;