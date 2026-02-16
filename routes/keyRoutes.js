const express = require('express');
const router = express.Router();
const {
    generateNewKey,
    getActiveKey,
    rotateKey
} = require('../controllers/keyController');
const { protect } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');

router.use(protect); // All key routes are protected

router.post('/generate', audit('GENERATE_KEY', 'critical'), generateNewKey);
router.get('/active', getActiveKey);
router.post('/rotate', audit('ROTATE_KEY', 'critical'), rotateKey);

module.exports = router;
