const mongoose = require('mongoose');

// Disable buffering
mongoose.set('bufferCommands', false);

const virtualNodeSchema = new mongoose.Schema({
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
    load: {
        type: Number,
        default: 0 // 0-100%
    },
    totalRequests: {
        type: Number,
        default: 0
    },
    successRate: {
        type: Number,
        default: 100 // 0-100%
    },
    lastResponseTime: {
        type: Number,
        default: 0 // ms
    },
    lastHeartbeat: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    autoIndex: false
});

module.exports = mongoose.model('VirtualNode', virtualNodeSchema);
