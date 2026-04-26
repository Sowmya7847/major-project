const asyncHandler = require('express-async-handler');
const Key = require('../models/Key');
const { generateKey } = require('../services/encryptionService');

// @desc    Generate a new encryption key
// @route   POST /api/keys/generate
// @access  Private
const generateNewKey = asyncHandler(async (req, res) => {
    const keyMaterial = generateKey();

    const key = await Key.create({
        user: req.user.id,
        keyMaterial,
        algorithm: 'aes-256-gcm'
    });

    res.status(201).json({
        id: key.id,
        algorithm: key.algorithm,
        createdAt: key.createdAt,
        message: 'Key generated successfully. In production, this would be returned only once or stored internally.'
    });
});

// @desc    Get user's active key
// @route   GET /api/keys/active
// @access  Private
const getActiveKey = asyncHandler(async (req, res) => {
    const key = await Key.findOne({ user: req.user.id, isActive: true }).sort({ createdAt: -1 });

    if (key) {
        res.json(key);
    } else {
        res.status(404);
        throw new Error('No active key found');
    }
});

// @desc    Rotate Key (Deactivate old, create new)
// @route   POST /api/keys/rotate
// @access  Private
const getAllKeys = asyncHandler(async (req, res) => {
    const keys = await Key.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(20);
    res.json(keys);
});

const getKeyStats = asyncHandler(async (req, res) => {
    const activeCount = await Key.countDocuments({ user: req.user.id, isActive: true });
    const rotatedCount = await Key.countDocuments({ user: req.user.id, status: 'rotated' });
    const now = new Date();
    const soon = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
    const expiringCount = await Key.countDocuments({ user: req.user.id, isActive: true, expiryDate: { $lte: soon, $gte: now } });
    res.json({ activeCount, rotatedCount, expiringCount });
});

const rotateKey = asyncHandler(async (req, res) => {
    // Finds all active keys and deactivates them
    await Key.updateMany(
        { user: req.user.id, isActive: true },
        { isActive: false }
    );

    // Create new key
    const keyMaterial = generateKey();
    const newKey = await Key.create({
        user: req.user.id,
        keyMaterial,
        algorithm: 'aes-256-gcm'
    });

    res.json({
        message: 'Key rotated successfully',
        newKeyId: newKey.id
    });
});

module.exports = {
    generateNewKey,
    getActiveKey,
    rotateKey,
    getAllKeys,
    getKeyStats
};
