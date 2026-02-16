const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile, downloadFile, getUserFiles, getMetrics } = require('../controllers/fileController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.use(protect);

router.post('/upload', upload.single('file'), uploadFile);
router.get('/:id/download', downloadFile);
router.get('/', getUserFiles);
router.get('/metrics', getMetrics);

module.exports = router;
