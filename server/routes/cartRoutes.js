const express = require('express');
const router = express.Router();
const { getCart, syncCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getCart);
router.post('/sync', protect, syncCart);

module.exports = router;
