const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

const systemMetricSchema = new mongoose.Schema({
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
}, {
    timestamps: true,
    autoIndex: false
});

module.exports = mongoose.model('SystemMetric', systemMetricSchema);
