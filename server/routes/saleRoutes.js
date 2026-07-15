const express = require('express');
const router = express.Router();
const { getSales, getSale, createSale, addPayment, getPayments } = require('../controllers/salesController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
    .get(protect, getSales)
    .post(protect, authorize('admin', 'employee'), createSale);

router.route('/:id')
    .get(protect, getSale);

router.route('/:id/payments')
    .get(protect, getPayments)
    .post(protect, authorize('admin', 'employee'), addPayment);

module.exports = router;
