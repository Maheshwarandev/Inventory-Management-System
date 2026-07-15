const express = require('express');
const router = express.Router();
const { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } = require('../controllers/customersController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
    .get(protect, getCustomers)
    .post(protect, authorize('admin', 'employee'), createCustomer);

router.route('/:id')
    .get(protect, getCustomer)
    .put(protect, authorize('admin'), updateCustomer)
    .delete(protect, authorize('admin'), deleteCustomer);

module.exports = router;
