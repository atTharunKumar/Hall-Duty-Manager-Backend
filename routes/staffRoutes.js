// const express = require('express');
// const router = express.Router();
// const staffController = require('../controllers/staffController');

// router.get('/', staffController.getStaff);
// router.post('/', staffController.addStaff);
// router.put('/:id', staffController.updateStaff);

// module.exports = router;
const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.getAllStaff);
router.post('/', staffController.addStaff);
router.put('/:id', staffController.updateStaff);

module.exports = router;
