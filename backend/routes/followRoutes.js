const express = require('express');
const router = express.Router();
const { followMentor, unfollowMentor, getFollowing, getFollowers, checkFollow } = require('../controllers/followController');
const { protect } = require('../middleware/authMiddleware');

router.get('/following', protect, getFollowing);
router.get('/check/:mentorId', protect, checkFollow);
router.get('/followers/:mentorId', protect, getFollowers);
router.post('/:mentorId', protect, followMentor);
router.delete('/:mentorId', protect, unfollowMentor);

module.exports = router;
