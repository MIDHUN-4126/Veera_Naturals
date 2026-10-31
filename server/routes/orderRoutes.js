const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, validateCoupon } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/coupon/validate', validateCoupon);

module.exports = router;
