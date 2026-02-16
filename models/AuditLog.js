const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true // Prevent modification
    },
    severity: {
        type: String,
        enum: ['info', 'success', 'warning', 'critical'],
        required: true
    },
    eventType: {
        type: String,
        required: true,
        index: true
    },
    node: {
        type: String,
        default: 'System_Global'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ipAddress: {
        type: String
    },
    message: {
        type: String,
        required: true
    },
    metadata: {
        type: Object // Optional extra details
    }
});

// TTL Index: Automatically expire logs after 1 year (compliance)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
