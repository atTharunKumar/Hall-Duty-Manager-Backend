// const express = require('express');
// const router = express.Router();
// const hallController = require('../controllers/hallController');
// const multer = require('multer');
// const upload = multer({ storage: multer.memoryStorage() });

// router.get('/', hallController.getHalls);
// router.post('/', hallController.addHall);
// router.put('/:id', hallController.updateHall);
// router.post('/upload', upload.single('file'), hallController.uploadHalls);

// module.exports = router;

const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const multer = require('multer');

// Multer setup for file uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', hallController.getAllHalls);
router.post('/', hallController.addHall);
router.put('/:id', hallController.updateHall);
router.post('/upload', upload.single('file'), hallController.uploadHallsFromFile);

module.exports = router;