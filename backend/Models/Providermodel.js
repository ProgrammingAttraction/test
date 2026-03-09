const mongoose = require("mongoose");

const providerSchema = new mongoose.Schema(
  {
    providerName: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Providermodel = mongoose.model("Provider", providerSchema);

module.exports = Providermodel;
