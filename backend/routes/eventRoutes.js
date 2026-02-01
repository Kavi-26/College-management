const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware');

// Public/Shared
router.get('/', auth, eventController.getAllEvents);

// Student
router.post('/:id/register', auth, eventController.registerForEvent);

// Admin
router.post('/', auth, eventController.createEvent);
router.delete('/:id', auth, eventController.deleteEvent);
router.get('/:id/registrations', auth, eventController.getEventRegistrations);

module.exports = router;
