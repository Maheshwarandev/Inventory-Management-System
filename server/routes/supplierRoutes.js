const express = require('express');
const router = express.Router();
const { getSuppliers, getSupplier, createSupplier, updateSupplier, deleteSupplier } = require('../controllers/suppliersController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
    .get(protect, getSuppliers)
    .post(protect, authorize('admin'), createSupplier);

router.route('/:id')
    .get(protect, getSupplier)
    .put(protect, authorize('admin'), updateSupplier)
    .delete(protect, authorize('admin'), deleteSupplier);

module.exports = router;
