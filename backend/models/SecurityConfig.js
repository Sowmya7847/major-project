const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const securityConfigSchema = new mongoose.Schema({
    // ML Configuration
    mlThreshold: { type: Number, default: 0.8 }, // Confidence threshold for blocking
    featureCount: { type: Number, default: 10 }, // Number of features to use

    // Encryption Configuration
    encryptionMode: {
        type: String,
        enum: ['AES-256-GCM', 'ChaCha20-Poly1305', 'AES-256-CBC'],
        default: 'AES-256-GCM'
    },
    chunkSize: { type: Number, default: 1024 * 1024 }, // 1MB chunk size
    parallelismLevel: { type: Number, default: 4 }, // Number of concurrent chunks

    // Infrastructure
    workerCount: { type: Number, default: 2 }, // Target number of workers
    keyRotationInterval: { type: Number, default: 90 }, // Days
    sessionTimeout: { type: Number, default: 60 }, // Minutes

    // Active Nodes Registry (Dynamic Discovery)
    activeNodes: [{
        nodeId: String,
        url: String,
        lastHeartbeat: Date,
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        load: { type: Number, default: 0 } // CPU Load %
    }],

    lastUpdated: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    autoIndex: false
});

// Ensure only one config document exists
securityConfigSchema.statics.getConfig = async function () {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

module.exports = mongoose.model('SecurityConfig', securityConfigSchema);
