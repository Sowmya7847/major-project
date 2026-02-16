const mongoose = require('mongoose');

const keySchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    keyMaterial: {
        type: String, // In a real app, this should be encrypted with a master key. Storing as hex/base64 for simulation.
        required: true
    },
    algorithm: {
        type: String,
        default: 'aes-256-gcm'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Key', keySchema);
