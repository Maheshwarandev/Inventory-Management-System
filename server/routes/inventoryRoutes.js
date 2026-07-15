const express = require('express');
const router = express.Router();
const { getInventory, getLowStock, getOutofStock } = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getInventory);
router.get('/low-stock', protect, getLowStock);
router.get('/out-of-stock', protect, getOutofStock);

module.exports = router;
