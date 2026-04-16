const Feedback = require('../models/Feedback');
const MentorProfile = require('../models/MentorProfile');

// @desc    Submit feedback/rating
// @route   POST /api/feedback
// @access  Private (mentee)
const submitFeedback = async (req, res, next) => {
  try {
    const { mentor, rating, review, session } = req.body;

    const existingFeedback = await Feedback.findOne({ mentor, mentee: req.user._id });
    if (existingFeedback) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this mentor' });
    }

    const feedback = await Feedback.create({
      mentor,
      mentee: req.user._id,
      rating,
      review,
      session,
    });

    // Recalculate mentor's average rating
    const allFeedback = await Feedback.find({ mentor });
    const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;

    await MentorProfile.findOneAndUpdate(
      { user: mentor },
      { rating: Math.round(avgRating * 10) / 10, totalReviews: allFeedback.length }
    );

    await feedback.populate('mentee', 'name avatar');

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for a mentor
// @route   GET /api/feedback/:mentorId
// @access  Public
const getMentorFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.find({ mentor: req.params.mentorId })
      .populate('mentee', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedback.length, feedback });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private (mentee who wrote it or admin)
const deleteFeedback = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    if (feedback.mentee.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await feedback.deleteOne();

    // Recalculate rating
    const allFeedback = await Feedback.find({ mentor: feedback.mentor });
    const avgRating = allFeedback.length
      ? allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length
      : 0;

    await MentorProfile.findOneAndUpdate(
      { user: feedback.mentor },
      { rating: Math.round(avgRating * 10) / 10, totalReviews: allFeedback.length }
    );

    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { submitFeedback, getMentorFeedback, deleteFeedback };
