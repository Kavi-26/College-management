const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const auth = require('../middleware/authMiddleware');

// Student Route
router.get('/my-results', auth, resultController.getMyResults);

// Faculty/Admin Routes
router.post('/', auth, resultController.addResult);
router.post('/bulk', auth, resultController.bulkAddResults);
router.get('/class', auth, resultController.getClassResults);

module.exports = router;
