// const express = require('express');
// const router = express.Router();
// const slotController = require('../controllers/slotController');

// router.get('/', slotController.getSlots);
// router.post('/', slotController.addSlot);

// module.exports = router;

const express = require('express');
const router = express.Router();
const slotController = require('../controllers/slotController');

router.get('/', slotController.getAllSlots);
router.post('/', slotController.addSlot);

module.exports = router;
