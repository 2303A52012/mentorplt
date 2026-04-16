const express = require('express');
const router = express.Router();
const { submitFeedback, getMentorFeedback, deleteFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, submitFeedback);
router.get('/:mentorId', getMentorFeedback);
router.delete('/:id', protect, deleteFeedback);

module.exports = router;
