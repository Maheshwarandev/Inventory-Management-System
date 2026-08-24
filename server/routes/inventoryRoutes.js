const express = require('express');
const router = express.Router();
const { 
    getInventory, 
    getLowStock, 
    getOutofStock, 
    adjustStock, 
    getInventoryLogs 
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/', protect, getInventory);
router.get('/low-stock', protect, getLowStock);
router.get('/out-of-stock', protect, getOutofStock);
router.get('/logs', protect, getInventoryLogs);
router.post('/adjust', protect, authorize('admin'), adjustStock);

module.exports = router;
