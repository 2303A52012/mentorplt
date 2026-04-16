const express = require('express');
const router = express.Router();
const { bookSession, getMySessions, updateSessionStatus, cancelSession, getSession } = require('../controllers/sessionController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, bookSession);
router.get('/', protect, getMySessions);
router.get('/:id', protect, getSession);
router.put('/:id/status', protect, updateSessionStatus);
router.put('/:id/cancel', protect, cancelSession);

module.exports = router;
