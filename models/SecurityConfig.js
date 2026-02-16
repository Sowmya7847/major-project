const mongoose = require('mongoose');

const securityConfigSchema = new mongoose.Schema({
    endToEndEncryption: {
        type: Boolean,
        default: true
    },
    hmacVerification: {
        type: Boolean,
        default: true
    },
    autoKeyRotation: {
        type: Boolean,
        default: false
    },
    rotationIntervalDays: {
        type: Number,
        default: 90
    },
    defaultAlgorithm: {
        type: String,
        enum: ['AES-256-GCM', 'ChaCha20-Poly1305', 'AES-256-CBC'],
        default: 'AES-256-GCM'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure only one config document exists
securityConfigSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

module.exports = mongoose.model('SecurityConfig', securityConfigSchema);
