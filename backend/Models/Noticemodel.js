// models/Notice.js
const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  content: {
    type: String,
    default: "",
    trim: true,
  },
}, { timestamps: true });

const Noticemodel = mongoose.model('Notice', noticeSchema);

module.exports = Noticemodel;
