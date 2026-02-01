const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const auth = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, 'resource-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post('/upload', auth, upload.single('file'), resourceController.uploadResource);
router.get('/', auth, resourceController.getResources);
router.delete('/:id', auth, resourceController.deleteResource);

module.exports = router;
