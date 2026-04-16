const Session = require('../models/Session');
const MentorProfile = require('../models/MentorProfile');

// @desc    Book a session
// @route   POST /api/sessions
// @access  Private (mentee)
const bookSession = async (req, res, next) => {
  try {
    const { mentor, title, description, scheduledAt, duration } = req.body;

    const session = await Session.create({
      mentor,
      mentee: req.user._id,
      title,
      description,
      scheduledAt,
      duration,
    });

    await session.populate('mentor', 'name email avatar');
    await session.populate('mentee', 'name email avatar');

    res.status(201).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get sessions for logged-in user
// @route   GET /api/sessions
// @access  Private
const getMySessions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter =
      req.user.role === 'mentor'
        ? { mentor: req.user._id }
        : { mentee: req.user._id };

    if (status) filter.status = status;

    const sessions = await Session.find(filter)
      .populate('mentor', 'name email avatar')
      .populate('mentee', 'name email avatar')
      .sort({ scheduledAt: -1 });

    res.json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};

// @desc    Update session status (mentor accepts/rejects)
// @route   PUT /api/sessions/:id/status
// @access  Private (mentor)
const updateSessionStatus = async (req, res, next) => {
  try {
    const { status, meetingLink, notes } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    // Only mentor can accept/reject
    if (session.mentor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    session.status = status;
    if (meetingLink) session.meetingLink = meetingLink;
    if (notes) session.notes = notes;

    await session.save();
    await session.populate('mentor', 'name email avatar');
    await session.populate('mentee', 'name email avatar');

    // If completed, increment mentor's total sessions
    if (status === 'completed') {
      await MentorProfile.findOneAndUpdate(
        { user: session.mentor },
        { $inc: { totalSessions: 1 } }
      );
    }

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel session (mentee or mentor)
// @route   PUT /api/sessions/:id/cancel
// @access  Private
const cancelSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const isOwner =
      session.mentor.toString() === req.user._id.toString() ||
      session.mentee.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    session.status = 'cancelled';
    await session.save();

    res.json({ success: true, message: 'Session cancelled', session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single session
// @route   GET /api/sessions/:id
// @access  Private
const getSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('mentor', 'name email avatar')
      .populate('mentee', 'name email avatar');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

module.exports = { bookSession, getMySessions, updateSessionStatus, cancelSession, getSession };
