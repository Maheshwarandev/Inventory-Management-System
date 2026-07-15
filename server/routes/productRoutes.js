const express = require('express');
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productsController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');
const upload = require('../middleware/upload');

router.route('/')
    .get(protect, getProducts)
    .post(protect, authorize('admin'), upload.single('image'), createProduct);

router.route('/:id')
    .get(protect, getProduct)
    .put(protect, authorize('admin'), upload.single('image'), updateProduct)
    .delete(protect, authorize('admin'), deleteProduct);

module.exports = router;
