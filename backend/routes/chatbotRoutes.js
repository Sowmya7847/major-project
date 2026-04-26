const express = require('express');
const router = express.Router();
const { processChat } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, processChat);

module.exports = router;
