const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  filenames: { type: [String], default: [] }, // Initialize the array to be empty
  paths: { type: [String], default: [] },     // Initialize the array to be empty
  uploadedAt: { type: Date, default: Date.now }
});

const Bannermodel = mongoose.model("Image", ImageSchema);
module.exports = Bannermodel;
