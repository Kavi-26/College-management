const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const auth = require('../middleware/authMiddleware');

// Mark Attendance (Faculty only) - We can check role in middleware if needed, but for now assuming auth is enough
router.post('/mark', auth, attendanceController.markAttendance);

// Get Students List (to populate the marking form)
router.get('/students', auth, attendanceController.getStudentsForMarking);

// Get Daily Report (Grid View)
router.get('/daily-report', auth, attendanceController.getDailyReport);

module.exports = router;
