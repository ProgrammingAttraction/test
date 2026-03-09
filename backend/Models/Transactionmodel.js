const mongoose = require("mongoose");

const transaction_schema = new mongoose.Schema({
    transaction_id: {
        type: String,
        required: true,
        unique: true
    },
    customer_id: {
        type: String,
        required: true
    },
    customer_name: {
        type: String,
        required: true
    },
    customer_email: {
        type: String,
        required: true
    },
    customer_phone: {
        type: String,
        required: true
    },
    payment_type: {
        type: String,
        required: true,
        enum: ['deposit', 'withdrawal', 'transfer', 'bonus'],
        default: 'deposit'
    },
    payment_method: {
        type: String,
        required: true,
        enum: ['bkash', 'nagad', 'rocket', 'bank', 'wallet', "manual","bkash_fast"],
        default: 'bkash'
    },
    amount: {
        type: Number,
        required: true,
    },
    bonus_amount: {
        type: Number,
        default: 0
    },
    bonus_type: {
        type: String,
        default: 'none'
    },
    post_balance: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'cancelled', "success"],
        default: 'pending'
    },
    transaction_note: {
        type: String,
        default: ""
    },
    gateway_response: {
        type: Object,
        default: {}
    },
    updated_by: {
        type: String,
        default: "system"
    },
    reason: {
        type: String,
        default: ""
    },
    // New fields added
    bonusType: {
        type: String,
        default: 'none'
    },
    bonusAmount: {
        type: Number,
        default: 0
    },
    wageringRequirement: {
        type: Number,
        default: 0
    },
    playerbalance: {
        type: Number
    },
    // Payment ID
    paymentId: {
        type: String
    }
}, { timestamps: true });

const transaction_model = mongoose.model("Transaction", transaction_schema);

module.exports = transaction_model;