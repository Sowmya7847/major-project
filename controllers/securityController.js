const SecurityConfig = require('../models/SecurityConfig');
const AuditLog = require('../models/AuditLog');

// @desc    Get current security configuration
// @route   GET /api/security/config
// @access  Private (Admin)
const getConfig = async (req, res) => {
    try {
        const config = await SecurityConfig.getConfig();
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update security configuration
// @route   PUT /api/security/config
// @access  Private (Admin)
const updateConfig = async (req, res) => {
    try {
        const { endToEndEncryption, hmacVerification, autoKeyRotation, defaultAlgorithm } = req.body;

        let config = await SecurityConfig.findOne();
        if (!config) {
            config = new SecurityConfig();
        }

        config.endToEndEncryption = endToEndEncryption !== undefined ? endToEndEncryption : config.endToEndEncryption;
        config.hmacVerification = hmacVerification !== undefined ? hmacVerification : config.hmacVerification;
        config.autoKeyRotation = autoKeyRotation !== undefined ? autoKeyRotation : config.autoKeyRotation;
        config.defaultAlgorithm = defaultAlgorithm || config.defaultAlgorithm;
        config.updatedBy = req.user._id;
        config.lastUpdated = Date.now();

        await config.save();

        // Log this action
        await AuditLog.create({
            severity: 'warning',
            eventType: 'Config_Update',
            user: req.user._id,
            message: `Security configuration updated by ${req.user.name}`,
            metadata: req.body
        });

        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get audit logs
// @route   GET /api/security/logs
// @access  Private (Admin/User)
const getLogs = async (req, res) => {
    try {
        const { limit = 50, severity, type } = req.query;
        const query = {};

        if (severity) query.severity = severity;
        if (type) query.eventType = type;

        const logs = await AuditLog.find(query)
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .populate('user', 'name email');

        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper to create a log entry internally
const createLog = async (entry) => {
    try {
        await AuditLog.create(entry);
    } catch (error) {
        console.error('Logging failed:', error);
    }
};

module.exports = {
    getConfig,
    updateConfig,
    getLogs,
    createLog
};
