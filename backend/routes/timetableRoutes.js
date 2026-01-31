const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const auth = require('../middleware/authMiddleware');

// Public/Protected: Get Timetable
router.get('/', auth, timetableController.getTimetable);

// Admin Only: Manage Timetable (Simplified auth check for prototype)
router.post('/entry', auth, timetableController.upsertTimetableEntry);
router.delete('/entry/:id', auth, timetableController.deleteTimetableEntry);

module.exports = router;
