const express = require('express');
const router = express.Router();
const { getMentors, getMentor, updateMentorProfile, getMyProfile } = require('../controllers/mentorController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getMentors);
router.get('/profile/me', protect, authorize('mentor'), getMyProfile);
router.put('/profile', protect, authorize('mentor'), updateMentorProfile);
router.get('/:id', getMentor);

module.exports = router;
