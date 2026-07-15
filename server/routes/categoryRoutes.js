const express = require('express');
const router = express.Router();
const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoriesController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
    .get(protect, getCategories)
    .post(protect, authorize('admin'), createCategory);

router.route('/:id')
    .get(protect, getCategory)
    .put(protect, authorize('admin'), updateCategory)
    .delete(protect, authorize('admin'), deleteCategory);

module.exports = router;
