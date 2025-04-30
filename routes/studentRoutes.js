const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const multer = require('multer');

// Multer setup for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', studentController.getAllStudents);
router.post('/upload', studentController.uploadStudentData);
router.post('/upload-xlsx', upload.single('file'), studentController.uploadStudentDataFromFile);

module.exports = router;