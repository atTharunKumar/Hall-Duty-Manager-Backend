const express = require('express');
const router = express.Router();
const sessionStrengthController = require('../controllers/sessionStrengthController');

router.get('/', sessionStrengthController.getAllSessionStrengths);
router.post('/', sessionStrengthController.updateSessionStrengths);

module.exports = router;