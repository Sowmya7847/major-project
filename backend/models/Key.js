const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const keySchema = new mongoose.Schema({
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
    status: {
        type: String,
        enum: ['active', 'rotated', 'revoked'],
        default: 'active'
    },
    expiryDate: {
        type: Date
    }
}, {
    timestamps: true,
    autoIndex: false
});

module.exports = mongoose.model('Key', keySchema);
