const express = require('express');
const router = express.Router();
const { getRoles, getRoleById, createRole, updateRole, deleteRole } = require('../controllers/roleController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getRoles);
router.get('/:id', protect, getRoleById);
router.post('/', protect, authorize('admin'), createRole);
router.put('/:id', protect, authorize('admin'), updateRole);
router.delete('/:id', protect, authorize('admin'), deleteRole);

module.exports = router;
