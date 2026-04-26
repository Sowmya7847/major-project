const VirtualNode = require('../models/VirtualNode');
const FileRecord = require('../models/FileRecord');

// @desc    Get status of all distributed nodes
// @route   GET /api/nodes
// @access  Private
const getNodesStatus = async (req, res) => {
    try {
        const nodes = await VirtualNode.find();

        // Calculate total system storage used (sum of all nodes)
        const totalStorageBytes = nodes.reduce((acc, node) => acc + (node.storageUsed || 0), 0);
        const totalStorageGB = (totalStorageBytes / (1024 * 1024 * 1024)).toFixed(2);

        // Get count of online nodes
        const onlineCount = nodes.filter(n => n.status === 'active').length;

        // Calculate average latency
        const avgLatency = nodes.length > 0
            ? Math.round(nodes.reduce((acc, n) => acc + (n.latencyMs || 0), 0) / nodes.length)
            : 0;

        res.status(200).json({
            nodes,
            stats: {
                totalStorageGB,
                activeNodes: onlineCount,
                totalNodes: nodes.length,
                avgLatency
            }
        });

    } catch (error) {
        console.error('Node Status Error:', error);
        res.status(500).json({ message: 'Failed to fetch node status' });
    }
};

const isolateNode = async (req, res) => {
    try {
        const { nodeId } = req.body;
        if (!nodeId) return res.status(400).json({ message: 'Node ID is required' });
        
        const node = await VirtualNode.findOne({ nodeId });
        if (!node) return res.status(404).json({ message: 'Node not found' });
        
        node.status = 'inactive';
        await node.save();
        
        res.status(200).json({ message: `Node ${nodeId} isolated successfully`, node });
    } catch (error) {
        console.error('Isolate Node Error:', error);
        res.status(500).json({ message: 'Failed to isolate node' });
    }
};

module.exports = {
    getNodesStatus,
    isolateNode
};
