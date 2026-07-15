const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser } = require('../controllers/usersController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.route('/')
    .get(protect, authorize('admin'), getUsers)
    .post(protect, authorize('admin'), createUser);

router.route('/:id')
    .put(protect, authorize('admin'), updateUser);

module.exports = router;
