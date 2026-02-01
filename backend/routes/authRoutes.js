const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword, getUser, getFacultyList } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register); // Ideally protect this for Admin
router.post('/login', login);
// @route   GET api/auth/user
// @desc    Get user data
router.get('/user', auth, getUser);

// @route   GET api/auth/faculty-list
// @desc    Get all faculty for dropdowns
router.get('/faculty-list', auth, getFacultyList);

// @route   POST api/auth/change-password
// @desc    Change password
router.post('/change-password', auth, changePassword);

module.exports = router;
