const mongoose = require('mongoose');

const virtualNodeSchema = mongoose.Schema({
    nodeId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    url: {
        type: String, // Can be localhost:port or folder path for simulation
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'failed'],
        default: 'active'
    },
    latencyMs: {
        type: Number,
        default: 50 // Simulated latency in ms
    },
    storageUsed: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('VirtualNode', virtualNodeSchema);
