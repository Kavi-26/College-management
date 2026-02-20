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

// Get Student Stats (Own)
router.get('/my-stats', auth, attendanceController.getStudentStats);

// Get Student Monthly Breakdown
router.get('/my-monthly', auth, attendanceController.getStudentMonthlyStats);

// Get Student Daily Log
router.get('/my-daily', auth, attendanceController.getStudentDailyLog);


// Get Faculty Today Stats
router.get('/faculty-stats', auth, attendanceController.getFacultyTodayStats);

// Class Reports (Faculty/Admin)
router.get('/monthly-class-report', auth, attendanceController.getMonthlyClassReport);
router.get('/yearly-class-report', auth, attendanceController.getYearlyClassReport);

module.exports = router;
