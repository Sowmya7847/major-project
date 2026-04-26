const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');
const SecurityConfig = require('../models/SecurityConfig');

// @desc    Analyze file features for threats
// @route   POST /api/security/analyze
// @access  Private
router.post('/analyze', protect, async (req, res) => {
    try {
        const { features } = req.body;

        // Get Config for logging/threshold checks if needed here, 
        // though ML service has its own config.
        const config = await SecurityConfig.findOne();

        // Call ML Service (via simple internal URL or Gateway)
        // Since we are inside the network, we can call ML directly or via Gateway.
        // Let's call ML service directly for internal traffic to avoid loop, 
        // OR call via Gateway if we want to test that path.
        // For distinct separation, let's assume ML service is at http://localhost:5001

        const mlUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';

        const response = await axios.post(`${mlUrl}/analyze`, {
            features,
            threshold: config?.mlThreshold || 0.8
        });

        // Log if threat detected
        if (response.data.threat) {
            // Log to Audit
            // await AuditLog.create(...)
        }

        res.json(response.data);

    } catch (error) {
        console.error('ML Analysis Error:', error.message);
        res.status(500).json({
            threat: false,
            confidence: 0,
            message: "ML Service Unavailable - Fail Safe Protocol"
        });
    }
});

module.exports = router;
