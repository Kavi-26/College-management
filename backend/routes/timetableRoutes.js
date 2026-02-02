const express = require('express');
const router = express.Router();
const timetableController = require('../controllers/timetableController');
const auth = require('../middleware/authMiddleware');

// Public/Protected: Get Timetable (Class View)
router.get('/', auth, timetableController.getTimetable);
router.get('/get-subject', auth, timetableController.getSubjectForPeriod);

// Faculty: Get Personal Timetable
router.get('/my-timetable', auth, timetableController.getMyTimetable);

// Admin Only: Manage Timetable (Simplified auth check for prototype)
router.post('/entry', auth, timetableController.upsertTimetableEntry);
router.delete('/entry/:id', auth, timetableController.deleteTimetableEntry);

module.exports = router;
