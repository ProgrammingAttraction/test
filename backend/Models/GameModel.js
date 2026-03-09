const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  gameName: {
    type: String,
    required: [true, "Game name is required"],
    trim: true
  },
  providerName: {
    type: String,
    required: [true, "Provider name is required"],
    trim: true
  },
  gameId: {
    type: String,
    required: [true, "Game ID is required"],
    unique: true,
    trim: true
  },
  categories: {
    type: [String],
    required: [true, "At least one category is required"],
    validate: {
      validator: function(categories) {
        return categories && categories.length > 0;
      },
      message: "At least one category is required"
    }
  },
  // Keep category field for backward compatibility during migration
  category: {
    type: String,
    required: false
  },
  imageUrl: {
    type: String,
    required: [true, "Game image is required"]
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
gameSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // During migration, if category exists but categories is empty, copy category to categories
  if (this.category && (!this.categories || this.categories.length === 0)) {
    this.categories = [this.category];
  }
  
  next();
});

const GameModel = mongoose.model("Game", gameSchema);

module.exports = GameModel;