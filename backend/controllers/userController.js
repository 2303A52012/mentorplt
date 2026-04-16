const User = require('../models/User');
const MentorProfile = require('../models/MentorProfile');
const Follow = require('../models/Follow');
const Session = require('../models/Session');
const Feedback = require('../models/Feedback');

// @desc    Get all users (admin)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const skip = (page - 1) * limit;
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, total, users });
  } catch (error) { next(error); }
};

// @desc    Get single user
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

// @desc    Toggle user active status (admin)
const toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, message: `User ${user.isActive ? 'activated' : 'deactivated'}`, user });
  } catch (error) { next(error); }
};

// @desc    Delete user (admin)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await MentorProfile.findOneAndDelete({ user: req.params.id });
    await Follow.deleteMany({ $or: [{ follower: req.params.id }, { following: req.params.id }] });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) { next(error); }
};

// @desc    Admin analytics
const getAnalytics = async (req, res, next) => {
  try {
    const [totalUsers, totalMentors, totalMentees, totalSessions, pendingSessions, completedSessions, totalFeedback, totalFollows] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'mentee' }),
      Session.countDocuments(),
      Session.countDocuments({ status: 'pending' }),
      Session.countDocuments({ status: 'completed' }),
      Feedback.countDocuments(),
      Follow.countDocuments(),
    ]);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    res.json({ success: true, analytics: { totalUsers, totalMentors, totalMentees, totalSessions, pendingSessions, completedSessions, totalFeedback, totalFollows, recentUsers } });
  } catch (error) { next(error); }
};

module.exports = { getUsers, getUser, toggleUserStatus, deleteUser, getAnalytics };
