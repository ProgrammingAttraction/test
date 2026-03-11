const mongoose = require("mongoose");

const HighlightGamesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Game name is required"],
      trim: true,
    },
    provider: {
      type: String,
      required: [true, "Provider name is required"],
      trim: true,
    },
    gameId: {
      type: String,
      required: [true, "Game ID is required"],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    imageUrl: {
      type: String,
      required: [true, "Game image URL is required"],
    },
    categories: {
      type: [String],
      default: [],
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field on save
HighlightGamesSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("HighlightGames", HighlightGamesSchema);