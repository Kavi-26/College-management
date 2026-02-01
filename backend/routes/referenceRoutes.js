const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/referenceController');
const auth = require('../middleware/authMiddleware');

// All routes are protected
router.get('/departments', auth, referenceController.getDepartments);
router.get('/years', auth, referenceController.getYears);
router.get('/sections', auth, referenceController.getSections);
router.get('/subjects', auth, referenceController.getSubjects);
router.get('/rooms', auth, referenceController.getRooms);

module.exports = router;
