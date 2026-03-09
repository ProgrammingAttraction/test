const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const supportSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    is_admin: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['active', 'inacive'],
        default: 'active',
    },
}, { timestamps: true });

const Support = mongoose.model('Support', supportSchema);
module.exports = Support;
