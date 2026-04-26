const mongoose = require('mongoose');
mongoose.set('bufferCommands', false);

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
        details: mongoose.Schema.Types.Mixed
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

// Indices for performance
auditLogSchema.index({ eventType: 1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
