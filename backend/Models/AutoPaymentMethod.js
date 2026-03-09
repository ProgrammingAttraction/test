const mongoose = require('mongoose');

const autoPaymentMethodSchema = new mongoose.Schema({
    status: {
        type: Boolean,
        required: true,
        default: false
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
});

// Ensure only one document exists (singleton pattern)
autoPaymentMethodSchema.statics.getInstance = async function() {
    let instance = await this.findOne();
    if (!instance) {
        instance = new this({ status: false });
        await instance.save();
    }
    return instance;
};

const AutoPaymentMethod = mongoose.model('AutoPaymentMethod', autoPaymentMethodSchema);

module.exports = AutoPaymentMethod;