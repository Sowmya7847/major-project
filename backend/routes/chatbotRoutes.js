const express = require('express');
const router = express.Router();
const { processChat, getSuggestions, streamChat } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, processChat);
router.get('/suggestions', protect, getSuggestions);
router.post('/stream', protect, streamChat);

module.exports = router;
