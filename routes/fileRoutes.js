const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile, downloadFile, getUserFiles, getMetrics } = require('../controllers/fileController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { audit } = require('../middleware/auditMiddleware');

router.use(protect);

router.post('/upload', upload.single('file'), audit('UPLOAD_FILE'), uploadFile);
router.get('/:id/download', audit('DOWNLOAD_FILE'), downloadFile);
router.get('/', getUserFiles);
router.get('/metrics', getMetrics);

module.exports = router;
