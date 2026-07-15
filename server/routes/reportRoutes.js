const express = require('express');
const router = express.Router();
const { getSalesReport, getPurchaseReport, getProfitReport, getInventoryValuation } = require('../controllers/reportsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.get('/sales', protect, authorize('admin', 'employee'), getSalesReport);
router.get('/purchases', protect, authorize('admin'), getPurchaseReport);
router.get('/profit', protect, authorize('admin'), getProfitReport);
router.get('/inventory-valuation', protect, authorize('admin'), getInventoryValuation);

module.exports = router;
