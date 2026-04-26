const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { uploadFile, downloadFile, getUserFiles, getMetrics } = require('../controllers/fileController');
const { audit } = require('../middleware/auditMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'temp_uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.use(protect);

router.post('/upload', upload.single('file'), audit('UPLOAD_FILE'), uploadFile);
router.get('/:id/download', audit('DOWNLOAD_FILE'), downloadFile);
router.get('/', getUserFiles);
router.get('/metrics', getMetrics);

module.exports = router;
