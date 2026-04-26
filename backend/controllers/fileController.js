const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { performance } = require('perf_hooks');
const FileRecord = require('../models/FileRecord');
const SystemMetric = require('../models/SystemMetric');
const Key = require('../models/Key');
const VirtualNode = require('../models/VirtualNode');
const { encryptBuffer, decryptBuffer, generateKey } = require('../services/encryptionService');
const { storeChunk, retrieveChunk, getBestNode } = require('../services/nodeService');
const { analyzeFileRisk } = require('../services/geminiService');
const ABEService = require('../services/ABEService');
const queueService = require('../services/queueService');
const monitoringService = require('../services/monitoringService');

// @desc    Upload text/binary file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const { algorithm, scheme, policy } = req.body;
    const user = req.user;

    // 1. Queue for Gemini Risk Analysis & Processing
    // In a real high-perf system, we'd read the file stream. Here we use the temp path.
    const fileRecordData = {
        user: user.id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        tempPath: req.file.path,
        encryptionScheme: scheme || 'aes',
        encryptionAlgorithm: algorithm || 'AES-256-GCM',
        accessPolicy: scheme === 'cp-abe' ? (policy || `Role:${user.role}`) : null,
        status: 'pending'
    };

    const task = await queueService.addTask(fileRecordData);

    res.status(202).json({
        message: 'File upload successful. Processing started in background.',
        fileId: task._id,
        status: 'pending'
    });
});

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
const downloadFile = asyncHandler(async (req, res) => {
    const fileRecord = await FileRecord.findById(req.params.id);

    if (!fileRecord) {
        res.status(404);
        throw new Error('File not found');
    }

    // 1. Retrieve Chunks
    fileRecord.chunks.sort((a, b) => a.chunkOrder - b.chunkOrder);

    // --- BRANCH: CP-ABE (Parallel Decrypt) ---
    if (fileRecord.encryptionScheme === 'cp-abe') {
        const userAttributes = [`Role:${req.user.role}`]; // Derive atts from role
        // Generate User Secret Key
        const userKey = ABEService.keygen(userAttributes);

        // Retrieve and Decrypt in Parallel
        const chunkPromises = fileRecord.chunks.map(async (chunk) => {
            // Retrieve (Data is JSON string of ABE ciphertext)
            const chunkDataString = await retrieveChunk(chunk.nodeId, chunk.chunkPath);
            const abeCiphertext = JSON.parse(chunkDataString);

            // Decrypt
            return ABEService.decrypt(abeCiphertext, userKey);
        });

        try {
            const decryptedChunks = await Promise.all(chunkPromises);
            const fullBuffer = Buffer.concat(decryptedChunks);

            res.setHeader('Content-Disposition', `attachment; filename=${fileRecord.originalName}`);
            res.setHeader('Content-Type', fileRecord.mimeType);
            res.send(fullBuffer);
        } catch (error) {
            console.error(error);
            res.status(403);
            throw new Error(`Decryption Failed: ${error.message}`);
        }
    }
    // --- BRANCH: Standard AES ---
    else {
        if (fileRecord.user.toString() !== req.user.id && req.user.role !== 'admin') {
            res.status(401);
            throw new Error('Not authorized');
        }

        const key = await Key.findById(fileRecord.keyId);
        if (!key) throw new Error('Encryption key not found');

        const chunkBuffers = [];
        for (const chunk of fileRecord.chunks) {
            const hexData = await retrieveChunk(chunk.nodeId, chunk.chunkPath);
            chunkBuffers.push(Buffer.from(hexData, 'hex'));
        }

        const fullEncryptedBuffer = Buffer.concat(chunkBuffers);
        const fullEncryptedHex = fullEncryptedBuffer.toString('hex');

        // Use enhanced decryptBuffer
        const decryptedBuffer = decryptBuffer(fullEncryptedHex, key.keyMaterial, {
            algorithm: fileRecord.encryptionAlgorithm,
            iv: fileRecord.iv,
            authTag: fileRecord.authTag
        });

        res.setHeader('Content-Disposition', `attachment; filename=${fileRecord.originalName}`);
        res.setHeader('Content-Type', fileRecord.mimeType);
        res.send(decryptedBuffer);
    }
});

// @desc    Get user files
// @route   GET /api/files
// @access  Private
const getUserFiles = asyncHandler(async (req, res) => {
    const files = await FileRecord.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(files);
});

// @desc    Get system metrics (Admin/Dashboard)
// @route   GET /api/files/metrics
// @access  Private
const getMetrics = asyncHandler(async (req, res) => {
    const metrics = await SystemMetric.find().sort({ timestamp: -1 }).limit(100);
    res.json(metrics);
});

module.exports = {
    uploadFile,
    downloadFile,
    getUserFiles,
    getMetrics
};
