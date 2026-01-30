const express = require('express');
const router = express.Router();
const { register, login, getMe, changePassword } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/register', register); // Ideally protect this for Admin
router.post('/login', login);
router.get('/me', auth, getMe);
router.post('/change-password', auth, changePassword);

module.exports = router;
