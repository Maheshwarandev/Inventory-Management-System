const express = require('express');
const router = express.Router();
const { getPurchases, getPurchase, createPurchase, addPayment, getPayments, approvePurchase } = require('../controllers/purchasesController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
    .get(protect, getPurchases)
    .post(protect, authorize('admin', 'employee'), createPurchase);

router.route('/:id')
    .get(protect, getPurchase);

router.route('/:id/approve')
    .put(protect, authorize('admin'), approvePurchase);

router.route('/:id/payments')
    .get(protect, getPayments)
    .post(protect, authorize('admin', 'employee'), addPayment);

module.exports = router;
