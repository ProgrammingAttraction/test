const mongoose = require("mongoose");

const WithdrawalSchema = new mongoose.Schema(
  {
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    name: { 
      type: String, 
      required: true 
    },
    email: { 
      type: String, 
      required: true 
    },
    playerId: { 
      type: String, 
      required: true 
    },
    reason: String,
    type: {
      type: String,
      default: "withdraw"
    },
    provider: { 
      type: String, 
      required: true 
    },
    amount: { 
      type: Number, 
      required: true 
    },
    orderId: { 
      type: String, 
      required: true, 
      unique: true 
    },
    payeeAccount: { 
      type: String, 
    },
    post_balance: {
      type: Number,
      required: true
    },
    tax_amount: {
      type: Number,
      required: true
    },
    recieved_amount: {
      type: Number,
      required: true
    },
    updated_by: {
      type: String,
      default: ""
    },
    // Wagering related fields
    wagering_status: {
      type: String,
    },
    wagering_required: {
      type: Number,
    },
    wagering_completed: {
      type: Number,
    },
    wagering_remaining: {
      type: Number,
    },
    // Bonus related fields
    had_active_bonus: {
      type: Boolean,
      default: false
    },
    bonus_amount: {
      type: Number,
      default: 0
    },
    bonus_cancelled: {
      type: Boolean,
      default: false
    },
    status: { 
      type: String,
      enum: ["pending", "in review", "approved", "assigned", "success", "rejected", "failed"], 
      default: "in review" 
    },
  },
  { timestamps: true }
);

// Add index for faster queries
WithdrawalSchema.index({ userId: 1 });
WithdrawalSchema.index({ status: 1 });
WithdrawalSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Withdrawal", WithdrawalSchema);