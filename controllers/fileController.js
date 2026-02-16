const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const { performance } = require('perf_hooks');
const FileRecord = require('../models/FileRecord');
const SystemMetric = require('../models/SystemMetric');
const Key = require('../models/Key');
const VirtualNode = require('../models/VirtualNode');
const { encryptLightweight, encryptHeavy, decryptLightweight, decryptHeavy, generateKey } = require('../services/encryptionService');
const { storeChunk, retrieveChunk } = require('../services/nodeService');
const { analyzeFileRisk } = require('../services/geminiService');
const ABEService = require('../services/ABEService');

// @desc    Upload text/binary file
// @route   POST /api/files/upload
// @access  Private
const uploadFile = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const startTotal = performance.now();
    const { algorithm, scheme, policy } = req.body; // scheme: 'aes' or 'cp-abe'
    const user = req.user;
    const fileBuffer = req.file.buffer;

    // 1. Gemini Risk Analysis
    const geminiAnalysis = await analyzeFileRisk(req.file.originalname, req.file.mimetype, fileBuffer);

    if (geminiAnalysis.isFlagged) {
        // Option: Block upload if risk is high. For demo, we just flag it.
        // console.warn("High risk file detected");
    }

    let fileRecordData = {
        user: user.id,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        geminiAnalysis
    };

    let bucketNodes = await VirtualNode.find({ status: 'active' }).limit(3);
    if (bucketNodes.length === 0) throw new Error('No active storage nodes available');

    // --- BRANCH: CP-ABE (Parallel Split-then-Encrypt) ---
    if (scheme === 'cp-abe') {
        const accessPolicy = policy || `Role:${user.role}`; // Default policy
        const totalSize = fileBuffer.length;
        const chunkSize = Math.ceil(totalSize / bucketNodes.length);

        // A. Parallel Split & Encrypt
        // We map the nodes to chunks. specific 1-to-1 mapping for demo simulation
        const encryptPromises = bucketNodes.map(async (node, index) => {
            const start = index * chunkSize;
            const end = Math.min(start + chunkSize, totalSize);
            // Handle edge case where file is smaller than node count
            if (start >= totalSize) return null;

            const chunkBuffer = fileBuffer.slice(start, end);

            // Encrypt Chunk with ABE
            return ABEService.encrypt(chunkBuffer, accessPolicy);
        });

        const startEncrypt = performance.now();
        const encryptedChunksResults = await Promise.all(encryptPromises);
        const endEncrypt = performance.now();

        // B. Parallel Store
        const storagePromises = encryptedChunksResults.map(async (encResult, index) => {
            if (!encResult) return null; // Skip empty chunks

            const node = bucketNodes[index];
            const chunkName = `${req.file.originalname}_${Date.now()}.abe.part${index}`;
            // Store the full ABE ciphertext object as JSON in the node (simulating file content)
            const dataToStore = JSON.stringify(encResult);

            await storeChunk(node.nodeId, dataToStore, chunkName);

            return {
                nodeId: node.nodeId,
                chunkOrder: index,
                chunkPath: chunkName,
                status: 'stored'
            };
        });

        const startTransfer = performance.now();
        const storedChunksRaw = await Promise.all(storagePromises);
        const storedChunks = storedChunksRaw.filter(c => c !== null); // Filter out empty
        const endTransfer = performance.now();
        const endTotal = performance.now();

        fileRecordData = {
            ...fileRecordData,
            encryptionAlgorithm: 'aes-256-gcm', // Underlying algo
            encryptionScheme: 'cp-abe',
            accessPolicy: accessPolicy,
            chunks: storedChunks,
            performanceMetrics: {
                encryptionTimeMs: endEncrypt - startEncrypt, // Parallel time
                totalProcessingTimeMs: endTotal - startTotal,
                uploadThroughputMbps: (req.file.size * 8) / ((endTotal - startTotal) * 1000)
            }
        };
    }
    // --- BRANCH: Standard AES (Sequential Encrypt-then-Split) ---
    else {
        // 2. Key Management
        let key = await Key.findOne({ user: user.id, isActive: true });
        if (!key) {
            const keyMaterial = generateKey();
            key = await Key.create({ user: user.id, keyMaterial, algorithm: 'aes-256-gcm' });
        }

        // 3. Encryption
        let encryptionResult;
        const algoType = algorithm === 'heavy' ? 'heavy' : 'lightweight';

        if (algoType === 'heavy') {
            encryptionResult = encryptHeavy(fileBuffer, key.keyMaterial);
        } else {
            encryptionResult = encryptLightweight(fileBuffer, key.keyMaterial);
        }

        // 4. Split and Store
        const encryptedBuffer = Buffer.from(encryptionResult.encryptedData, 'hex');
        const totalSize = encryptedBuffer.length;
        const chunkSize = Math.ceil(totalSize / bucketNodes.length);

        const chunkPromises = bucketNodes.map(async (node, index) => {
            const start = index * chunkSize;
            const end = Math.min(start + chunkSize, totalSize);
            if (start >= totalSize) return null;

            const chunkData = encryptedBuffer.slice(start, end);
            const chunkName = `${req.file.originalname}_${Date.now()}.part${index}`;

            await storeChunk(node.nodeId, chunkData, chunkName);

            return {
                nodeId: node.nodeId,
                chunkOrder: index,
                chunkPath: chunkName,
                status: 'stored'
            };
        });

        const startTransfer = performance.now();
        const storedChunksRaw = await Promise.all(chunkPromises);
        const storedChunks = storedChunksRaw.filter(c => c !== null);
        const endTransfer = performance.now();
        const endTotal = performance.now();

        fileRecordData = {
            ...fileRecordData,
            encryptionAlgorithm: encryptionResult.algorithm,
            encryptionScheme: 'aes',
            keyId: key.id,
            iv: encryptionResult.iv,
            authTag: encryptionResult.authTag,
            chunks: storedChunks,
            performanceMetrics: {
                encryptionTimeMs: encryptionResult.executionTimeMs,
                totalProcessingTimeMs: endTotal - startTotal,
                uploadThroughputMbps: (req.file.size * 8) / ((endTotal - startTotal) * 1000)
            }
        };
    }

    // 5. Save Record
    const fileRecord = await FileRecord.create(fileRecordData);

    // 6. Log System Metric
    await SystemMetric.create({
        operation: 'upload',
        algorithm: fileRecord.encryptionScheme === 'cp-abe' ? 'CP-ABE (Parallel)' : fileRecord.encryptionAlgorithm,
        fileSize: req.file.size,
        encryptionTimeMs: fileRecord.performanceMetrics.encryptionTimeMs,
        nodeTransferTimeMs: fileRecord.performanceMetrics.totalProcessingTimeMs - fileRecord.performanceMetrics.encryptionTimeMs, // Approx
        totalTimeMs: fileRecord.performanceMetrics.totalProcessingTimeMs,
        nodeLatency: bucketNodes.reduce((acc, curr) => acc + curr.latencyMs, 0) / bucketNodes.length
    });

    res.status(201).json(fileRecord);
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

        let decryptedBuffer;
        if (fileRecord.encryptionAlgorithm === 'aes-256-gcm') {
            decryptedBuffer = decryptLightweight(fullEncryptedHex, key.keyMaterial, fileRecord.iv, fileRecord.authTag);
        } else {
            decryptedBuffer = decryptHeavy(fullEncryptedHex, key.keyMaterial, fileRecord.iv);
        }

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
