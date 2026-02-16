const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, getLogs } = require('../controllers/securityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { audit } = require('../middleware/auditMiddleware');

router.get('/config', protect, getConfig);
router.put('/config', protect, authorize('admin'), audit('UPDATE_SECURITY_CONFIG', 'high'), updateConfig);
router.get('/logs', protect, getLogs);

module.exports = router;
