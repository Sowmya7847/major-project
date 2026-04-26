const fs = require('fs');
const path = require('path');
const VirtualNode = require('../models/VirtualNode');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

// Base directory for simulated nodes
const NODES_BASE_DIR = path.join(__dirname, '../storage_nodes');

// Initialize Node Directories (Ensure base dir exists)
const initNodes = async () => {
    if (!fs.existsSync(NODES_BASE_DIR)) {
        fs.mkdirSync(NODES_BASE_DIR);
        console.log('[NODES] Storage base directory created');
    }

    // Seed default nodes if none exist (essential for in-memory DB)
    const count = await VirtualNode.countDocuments();
    if (count === 0) {
        console.log('[NODES] Seeding default virtual nodes...');
        const defaultNodes = [
            { nodeId: 'node-01', name: 'US-East Storage', url: 'localhost:5000/storage/1', region: 'US-East', status: 'active', load: 15, latencyMs: 45 },
            { nodeId: 'node-02', name: 'EU-West Storage', url: 'localhost:5000/storage/2', region: 'EU-West', status: 'active', load: 22, latencyMs: 120 },
            { nodeId: 'node-03', name: 'Asia-South Storage', url: 'localhost:5000/storage/3', region: 'Asia-South', status: 'inactive', load: 0, latencyMs: 300 }
        ];
        await VirtualNode.insertMany(defaultNodes);
    }
};

/**
 * Register or update a node dynamically
 */
const registerNode = async (nodeData) => {
    const { nodeId } = nodeData;

    // Ensure node storage directory exists
    const nodePath = path.join(NODES_BASE_DIR, nodeId);
    if (!fs.existsSync(nodePath)) {
        fs.mkdirSync(nodePath);
    }

    return await VirtualNode.findOneAndUpdate(
        { nodeId },
        { ...nodeData, lastHeartbeat: Date.now(), status: 'active' },
        { upsert: true, returnDocument: 'after' }
    );
};

/**
 * Get the best node for a task based on Least Load and Latency
 */
const getBestNode = async () => {
    // Basic Load Balancing: Find active node with least load and latency < 200ms
    const nodes = await VirtualNode.find({ status: 'active' }).sort({ load: 1, latencyMs: 1 });

    if (nodes.length === 0) {
        throw new Error('No active storage nodes available');
    }

    return nodes[0];
};

/**
 * Update node metrics after a task
 */
const updateNodeMetrics = async (nodeId, responseTime, success = true) => {
    const node = await VirtualNode.findOne({ nodeId });
    if (!node) return;

    const total = node.totalRequests + 1;
    const successCount = success ? (node.successRate / 100 * node.totalRequests) + 1 : (node.successRate / 100 * node.totalRequests);

    await VirtualNode.findOneAndUpdate(
        { nodeId },
        {
            totalRequests: total,
            successRate: (successCount / total) * 100,
            lastResponseTime: responseTime,
            lastHeartbeat: Date.now()
        }
    );
};

// Simulate storing a chunk with latency
const storeChunk = async (nodeId, chunkData, filename) => {
    const start = performance.now();
    const node = await VirtualNode.findOne({ nodeId });

    if (!node || node.status !== 'active') {
        throw new Error(`Node ${nodeId} is down or does not exist`);
    }

    const nodePath = path.join(NODES_BASE_DIR, nodeId, filename);

    try {
        // Simulate Network Latency
        await new Promise(resolve => setTimeout(resolve, node.latencyMs));

        // Write file
        await writeFileAsync(nodePath, chunkData);

        const end = performance.now();
        await updateNodeMetrics(nodeId, end - start, true);

        return {
            nodeId,
            path: filename,
            status: 'stored'
        };
    } catch (err) {
        await updateNodeMetrics(nodeId, 0, false);
        throw err;
    }
};

const retrieveChunk = async (nodeId, filename) => {
    const start = performance.now();
    const node = await VirtualNode.findOne({ nodeId });
    if (!node || node.status !== 'active') {
        throw new Error(`Node ${nodeId} failure during retrieval`);
    }

    const nodePath = path.join(NODES_BASE_DIR, nodeId, filename);

    try {
        // Simulate Latency
        await new Promise(resolve => setTimeout(resolve, node.latencyMs));

        if (fs.existsSync(nodePath)) {
            const data = await readFileAsync(nodePath, 'hex');
            const end = performance.now();
            await updateNodeMetrics(nodeId, end - start, true);
            return data;
        } else {
            throw new Error('Chunk not found');
        }
    } catch (err) {
        await updateNodeMetrics(nodeId, 0, false);
        throw err;
    }
};

module.exports = {
    initNodes,
    registerNode,
    getBestNode,
    storeChunk,
    retrieveChunk
};
