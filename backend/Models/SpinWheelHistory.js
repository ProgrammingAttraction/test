// ==================== SPIN WHEEL ROUTES ====================

// Spin wheel model (add this to your Models folder)
// Create a new file: Models/SpinWheelHistory.js
const mongoose = require('mongoose');

const SpinWheelHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    player_id: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    result: {
        type: String,
        required: true
    },
    spinDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['won', 'lost'],
        default: 'won'
    },
    transactionId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const SpinWheelHistory = mongoose.model('SpinWheelHistory', SpinWheelHistorySchema);
module.exports = SpinWheelHistory;