const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, notificationController.getMyNotifications);
router.put('/:id/read', auth, notificationController.markAsRead);

module.exports = router;
