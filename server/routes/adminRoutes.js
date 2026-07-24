const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  blockUser,
  deleteUser,
  getAnalytics,
  getReports,
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/analytics', getAnalytics);
router.get('/reports', getReports);

router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);

module.exports = router;

