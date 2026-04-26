const mongoose = require('mongoose');

// Disable buffering to avoid hangs
mongoose.set('bufferCommands', false);

const fileRecordSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    originalName: {
        type: String,
        required: true
    },
    mimeType: {
        type: String
    },
    size: {
        type: Number,
        required: true
    },
    tempPath: String,
    encryptionAlgorithm: {
        type: String
    },
    encryptionScheme: {
        type: String,
        enum: ['aes', 'cp-abe'],
        default: 'aes'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'stored', 'failed'],
        default: 'pending'
    },
    processedBy: String,
    accessPolicy: {
        type: String, // e.g. "Dept:IT OR Role:Admin"
        default: null
    },
    keyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Key'
        // required: false for CP-ABE as key is derived from attributes
    },
    iv: {
        type: String
    },
    authTag: {
        type: String // Only for AES-GCM
    },
    chunks: [{
        nodeId: { type: String, required: true },
        chunkOrder: { type: Number, required: true },
        chunkPath: { type: String, required: true }, // Path relative to node storage root
        encryptionMeta: {
            algorithm: String,
            keyId: String,
            iv: String,
            authTag: String,
            chunkCount: Number
        },
        status: { type: String, default: 'stored' }
    }],
    geminiAnalysis: {
        riskScore: { type: Number, default: 0 },
        summary: { type: String },
        threats: [String],
        isFlagged: { type: Boolean, default: false }
    },
    performanceMetrics: {
        encryptionTimeMs: { type: Number },
        totalProcessingTimeMs: { type: Number },
        uploadThroughputMbps: { type: Number }
    }
}, {
    timestamps: true,
    autoIndex: false
});

fileRecordSchema.index({ user: 1 });

module.exports = mongoose.model('FileRecord', fileRecordSchema);
