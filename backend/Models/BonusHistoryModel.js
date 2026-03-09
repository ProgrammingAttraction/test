const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BonusHistorySchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    bonusType: {
        type: String,
        enum: ['weekly', 'monthly'],
        required: true
    },
    betAmount: {
        type: Number,
        required: true,
        default: 0
    },
    bonusAmount: {
        type: Number,
        required: true,
        default: 0
    },
    bonusRate: {
        type: Number,
        required: true,
        default: 0.8 // 0.8 for weekly, 0.5 for monthly
    },
    status: {
        type: String,
        default: 'credited'
    },
    creditedAt: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for better query performance
BonusHistorySchema.index({ userId: 1, bonusType: 1, creditedAt: -1 });
BonusHistorySchema.index({ bonusType: 1, status: 1 });
BonusHistorySchema.index({ creditedAt: -1 });

const BonusHistory = mongoose.model('BonusHistory', BonusHistorySchema);
module.exports = BonusHistory;