const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

const { protect } = require('../middleware/auth');

router.use(protect);

router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);

router.route('/')
  .get(getNotifications);

router.route('/:id')
  .delete(deleteNotification);

module.exports = router;

