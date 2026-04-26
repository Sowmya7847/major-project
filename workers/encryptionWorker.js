const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { performance } = require('perf_hooks');
const dotenv = require('dotenv');
const axios = require('axios');

// Models & Services
const FileRecord = require('../backend/models/FileRecord');
const VirtualNode = require('../backend/models/VirtualNode');
const SystemMetric = require('../backend/models/SystemMetric');
const Key = require('../backend/models/Key');
const { encryptBuffer, generateKey } = require('../backend/services/encryptionService');
const { storeChunk } = require('../backend/services/nodeService');
const { analyzeFileRisk } = require('../backend/services/geminiService');
const ABEService = require('../backend/services/ABEService');
const queueService = require('../backend/services/queueService');

// Load env
dotenv.config({ path: '../.env' });

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:4000';
const NODE_ID = `worker-${Math.random().toString(36).substr(2, 8)}`;

let activeTasks = 0;

const processQueue = async () => {
    if (mongoose.connection.readyState !== 1) return;
    if (activeTasks >= 5) return;

    try {
        const file = await queueService.getNextTask(NODE_ID);

        if (file) {
            activeTasks++;
            console.log(`[WORKER] Processing file: ${file.originalName} (${file._id})`);

            try {
                const startTotal = performance.now();
                if (!fs.existsSync(file.tempPath)) {
                    throw new Error(`Temp file not found at ${file.tempPath}`);
                }
                const fileBuffer = fs.readFileSync(file.tempPath);

                // 1. Gemini Risk Analysis
                const geminiAnalysis = await analyzeFileRisk(file.originalName, file.mimeType, fileBuffer);

                // 2. Encryption & Distribution
                let bucketNodes = await VirtualNode.find({ status: 'active' }).limit(3);
                if (bucketNodes.length === 0) throw new Error('No active storage nodes');

                let encryptionResult, storedChunks;

                if (file.encryptionScheme === 'cp-abe') {
                    const totalSize = fileBuffer.length;
                    const chunkSize = Math.ceil(totalSize / bucketNodes.length);

                    const encryptPromises = bucketNodes.map(async (node, index) => {
                        const start = index * chunkSize;
                        const end = Math.min(start + chunkSize, totalSize);
                        if (start >= totalSize) return null;
                        return ABEService.encrypt(fileBuffer.slice(start, end), file.accessPolicy);
                    });

                    const startEncrypt = performance.now();
                    const encryptedChunksResults = await Promise.all(encryptPromises);
                    const endEncrypt = performance.now();

                    const storagePromises = encryptedChunksResults.map(async (encResult, index) => {
                        if (!encResult) return null;
                        const node = bucketNodes[index];
                        const chunkName = `${file.originalName}_${Date.now()}.abe.part${index}`;
                        await storeChunk(node.nodeId, JSON.stringify(encResult), chunkName);
                        return { nodeId: node.nodeId, chunkOrder: index, chunkPath: chunkName, status: 'stored' };
                    });

                    storedChunks = (await Promise.all(storagePromises)).filter(c => c !== null);

                    file.performanceMetrics = {
                        encryptionTimeMs: endEncrypt - startEncrypt,
                        totalProcessingTimeMs: performance.now() - startTotal,
                        uploadThroughputMbps: (file.size * 8) / ((performance.now() - startTotal) * 1000)
                    };
                } else {
                    // AES
                    let key = await Key.findOne({ user: file.user, isActive: true });
                    if (!key) {
                        key = await Key.create({ user: file.user, keyMaterial: generateKey(), algorithm: 'AES-256-GCM' });
                    }

                    encryptionResult = await encryptBuffer(fileBuffer, key.keyMaterial, { algorithm: file.encryptionAlgorithm });

                    const encryptedBuffer = Buffer.from(encryptionResult.encryptedData, 'hex');
                    const totalSize = encryptedBuffer.length;
                    const chunkSize = Math.ceil(totalSize / bucketNodes.length);

                    const chunkPromises = bucketNodes.map(async (node, index) => {
                        const start = index * chunkSize;
                        const end = Math.min(start + chunkSize, totalSize);
                        if (start >= totalSize) return null;
                        const chunkName = `${file.originalName}_${Date.now()}.part${index}`;
                        await storeChunk(node.nodeId, encryptedBuffer.slice(start, end), chunkName);
                        return { nodeId: node.nodeId, chunkOrder: index, chunkPath: chunkName, status: 'stored' };
                    });

                    storedChunks = (await Promise.all(chunkPromises)).filter(c => c !== null);

                    file.keyId = key._id;
                    file.iv = encryptionResult.iv;
                    file.authTag = encryptionResult.authTag;
                    file.performanceMetrics = {
                        encryptionTimeMs: encryptionResult.executionTimeMs,
                        totalProcessingTimeMs: performance.now() - startTotal,
                        uploadThroughputMbps: (file.size * 8) / ((performance.now() - startTotal) * 1000)
                    };
                }

                // 3. Finalize
                file.chunks = storedChunks;
                file.geminiAnalysis = geminiAnalysis;
                file.status = 'stored';
                await file.save();

                // 4. Cleanup temp file
                if (fs.existsSync(file.tempPath)) fs.unlinkSync(file.tempPath);

                // 5. System Metric
                await SystemMetric.create({
                    operation: 'upload_distributed_async',
                    algorithm: file.encryptionScheme === 'cp-abe' ? 'CP-ABE' : file.encryptionAlgorithm,
                    fileSize: file.size,
                    encryptionTimeMs: file.performanceMetrics.encryptionTimeMs,
                    totalTimeMs: file.performanceMetrics.totalProcessingTimeMs
                });

                console.log(`[WORKER] Successfully processed: ${file.originalName}`);
            } catch (err) {
                console.error(`[WORKER] Error processing ${file._id}:`, err.message);
                file.status = 'failed';
                await file.save();
            } finally {
                activeTasks--;
            }
        }
    } catch (error) {
        console.error('[WORKER] Queue error:', error.message);
    }
};

const registerWithGateway = async () => {
    try {
        await axios.post(`${GATEWAY_URL}/register-worker`, {
            nodeId: NODE_ID,
            url: `http://localhost:${process.env.PORT || 4001}`,
            load: activeTasks * 20
        });
        console.log(`[WORKER] Registered with Gateway as ${NODE_ID}`);
    } catch (err) {
        console.error('[WORKER] Registration failed:', err.message);
    }
};

const sendHeartbeat = async () => {
    try {
        await axios.post(`${GATEWAY_URL}/worker-heartbeat`, {
            nodeId: NODE_ID,
            load: activeTasks * 20
        });
    } catch (err) {
        // Silent fail
    }
};

const connectWorkerDB = async () => {
    try {
        console.log('[WORKER] Connecting to MongoDB Atlas...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 5000
        });
        console.log('[WORKER] Connected to MongoDB Atlas');

        registerWithGateway();
        setInterval(sendHeartbeat, 5000);
        setInterval(processQueue, 3000);
    } catch (err) {
        console.log('[WORKER] Atlas connect failed, using In-Memory MongoDB...');
        try {
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const mongod = await MongoMemoryServer.create();
            const uri = mongod.getUri();
            await mongoose.connect(uri);
            console.log('[WORKER] In-Memory DB Ready');

            registerWithGateway();
            setInterval(sendHeartbeat, 5000);
            setInterval(processQueue, 3000);
        } catch (fallbackError) {
            console.error('[WORKER] Critical Fallback Error:', fallbackError.message);
            setTimeout(connectWorkerDB, 10000);
        }
    }
};

connectWorkerDB();
