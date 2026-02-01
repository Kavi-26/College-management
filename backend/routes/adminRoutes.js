const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

// Middleware to ensure user is admin
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
};

router.get('/stats', auth, verifyAdmin, adminController.getSystemStats);
router.post('/backup', auth, verifyAdmin, adminController.triggerBackup);
router.get('/subjects', auth, verifyAdmin, adminController.getAllSubjects);
router.post('/subjects', auth, verifyAdmin, adminController.addSubject);
router.delete('/subjects/:code', auth, verifyAdmin, adminController.deleteSubject);

module.exports = router;
