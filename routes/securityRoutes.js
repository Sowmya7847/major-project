const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, getLogs } = require('../controllers/securityController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/config', protect, getConfig);
router.put('/config', protect, authorize('admin'), updateConfig);
router.get('/logs', protect, getLogs);

module.exports = router;
