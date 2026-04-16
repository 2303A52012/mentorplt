const express = require('express');
const router = express.Router();
const { getUsers, getUser, toggleUserStatus, deleteUser, getAnalytics } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect, authorize('admin'));
router.get('/analytics', getAnalytics);
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id/toggle', toggleUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
