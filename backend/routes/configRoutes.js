const express = require('express');
const router = express.Router();
const SecurityConfig = require('../models/SecurityConfig');
const { protect, authorize } = require('../middleware/authMiddleware');

const configService = require('../services/configService');

// @desc    Get current system configuration
// @route   GET /api/config
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const config = await configService.getConfig();
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching config', error: error.message });
    }
});

// @desc    Update system configuration
// @route   PUT /api/config
// @access  Private/Admin
router.put('/', protect, authorize('admin'), async (req, res) => {
    try {
        const config = await configService.updateConfig(req.body, req.user._id);
        res.json(config);
    } catch (error) {
        res.status(500).json({ message: 'Error updating config', error: error.message });
    }
});

module.exports = router;
