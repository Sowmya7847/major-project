const fs = require('fs');
const path = require('path');
const VirtualNode = require('../models/VirtualNode');
const { promisify } = require('util');
const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

// Base directory for simulated nodes
const NODES_BASE_DIR = path.join(__dirname, '../storage_nodes');

// Initialize Node Directories
const initNodes = async () => {
    if (!fs.existsSync(NODES_BASE_DIR)) {
        fs.mkdirSync(NODES_BASE_DIR);
    }

    const startNodes = [
        { nodeId: 'node_1', name: 'Alpha Node', url: 'local/node_1', latencyMs: 50 },
        { nodeId: 'node_2', name: 'Beta Node', url: 'local/node_2', latencyMs: 120 }, // Slower node
        { nodeId: 'node_3', name: 'Gamma Node', url: 'local/node_3', latencyMs: 30 }
    ];

    for (const node of startNodes) {
        const nodePath = path.join(NODES_BASE_DIR, node.nodeId);
        if (!fs.existsSync(nodePath)) {
            fs.mkdirSync(nodePath);
            console.log(`Created storage for ${node.name}`);
        }

        // Upsert node in DB
        await VirtualNode.findOneAndUpdate(
            { nodeId: node.nodeId },
            node,
            { upsert: true, new: true }
        );
    }
};

// Simulate storing a chunk with latency
const storeChunk = async (nodeId, chunkData, filename) => {
    const node = await VirtualNode.findOne({ nodeId });

    if (!node || node.status !== 'active') {
        throw new Error(`Node ${nodeId} is down or does not exist`);
    }

    const nodePath = path.join(NODES_BASE_DIR, nodeId, filename);

    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, node.latencyMs));

    // Write file
    await writeFileAsync(nodePath, chunkData);

    return {
        nodeId,
        path: filename,
        status: 'stored'
    };
};

const retrieveChunk = async (nodeId, filename) => {
    const node = await VirtualNode.findOne({ nodeId });
    if (!node || node.status !== 'active') { // Simple failure simulation
        // In real distributed system we would try another replica
        throw new Error(`Node ${nodeId} failure during retrieval`);
    }

    const nodePath = path.join(NODES_BASE_DIR, nodeId, filename);

    // Simulate Latency
    await new Promise(resolve => setTimeout(resolve, node.latencyMs));

    if (fs.existsSync(nodePath)) {
        return await readFileAsync(nodePath, 'hex'); // Return as hex string for reassembly
    } else {
        throw new Error('Chunk not found');
    }
};

module.exports = {
    initNodes,
    storeChunk,
    retrieveChunk
};
