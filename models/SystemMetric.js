const mongoose = require('mongoose');

const systemMetricSchema = mongoose.Schema({
    operation: {
        type: String, // 'upload', 'download'
        required: true
    },
    algorithm: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    encryptionTimeMs: {
        type: Number
    },
    nodeTransferTimeMs: {
        type: Number
    },
    totalTimeMs: {
        type: Number
    },
    nodeLatency: {
        type: Number
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('SystemMetric', systemMetricSchema);
