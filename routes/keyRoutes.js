const express = require('express');
const router = express.Router();
const {
    generateNewKey,
    getActiveKey,
    rotateKey
} = require('../controllers/keyController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All key routes are protected

router.post('/generate', generateNewKey);
router.get('/active', getActiveKey);
router.post('/rotate', rotateKey);

module.exports = router;
