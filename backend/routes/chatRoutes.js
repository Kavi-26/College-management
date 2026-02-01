const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/authMiddleware');

// Get history for a specific room
router.get('/history/:room', auth, chatController.getHistory);

module.exports = router;
