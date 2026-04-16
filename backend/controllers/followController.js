const Follow = require('../models/Follow');
const MentorProfile = require('../models/MentorProfile');
const User = require('../models/User');

// @desc    Follow a mentor
// @route   POST /api/follow/:mentorId
// @access  Private
const followMentor = async (req, res, next) => {
  try {
    const mentor = await User.findById(req.params.mentorId);
    if (!mentor || mentor.role !== 'mentor') {
      return res.status(404).json({ success: false, message: 'Mentor not found' });
    }

    if (req.params.mentorId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.mentorId,
    });

    if (existingFollow) {
      return res.status(400).json({ success: false, message: 'Already following this mentor' });
    }

    await Follow.create({ follower: req.user._id, following: req.params.mentorId });

    // Increment followers count
    await MentorProfile.findOneAndUpdate(
      { user: req.params.mentorId },
      { $inc: { followers: 1 } }
    );

    res.status(201).json({ success: true, message: 'Successfully followed mentor' });
  } catch (error) {
    next(error);
  }
};

// @desc    Unfollow a mentor
// @route   DELETE /api/follow/:mentorId
// @access  Private
const unfollowMentor = async (req, res, next) => {
  try {
    const follow = await Follow.findOneAndDelete({
      follower: req.user._id,
      following: req.params.mentorId,
    });

    if (!follow) {
      return res.status(404).json({ success: false, message: 'You are not following this mentor' });
    }

    await MentorProfile.findOneAndUpdate(
      { user: req.params.mentorId },
      { $inc: { followers: -1 } }
    );

    res.json({ success: true, message: 'Successfully unfollowed mentor' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of mentors the user follows
// @route   GET /api/follow/following
// @access  Private
const getFollowing = async (req, res, next) => {
  try {
    const follows = await Follow.find({ follower: req.user._id }).populate(
      'following',
      'name email avatar bio role'
    );

    res.json({ success: true, count: follows.length, following: follows.map((f) => f.following) });
  } catch (error) {
    next(error);
  }
};

// @desc    Get followers of a mentor
// @route   GET /api/follow/followers/:mentorId
// @access  Private
const getFollowers = async (req, res, next) => {
  try {
    const followers = await Follow.find({ following: req.params.mentorId }).populate(
      'follower',
      'name email avatar role'
    );

    res.json({ success: true, count: followers.length, followers: followers.map((f) => f.follower) });
  } catch (error) {
    next(error);
  }
};

// @desc    Check if following a mentor
// @route   GET /api/follow/check/:mentorId
// @access  Private
const checkFollow = async (req, res, next) => {
  try {
    const follow = await Follow.findOne({
      follower: req.user._id,
      following: req.params.mentorId,
    });
    res.json({ success: true, isFollowing: !!follow });
  } catch (error) {
    next(error);
  }
};

module.exports = { followMentor, unfollowMentor, getFollowing, getFollowers, checkFollow };
