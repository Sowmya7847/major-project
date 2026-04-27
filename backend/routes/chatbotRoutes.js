const express = require('express');
const router = express.Router();
const { processChat, getSuggestions } = require('../controllers/chatbotController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, processChat);
router.get('/suggestions', protect, getSuggestions);

module.exports = router;
