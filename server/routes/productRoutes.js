const express = require('express');
const router = express.Router();
const { getProducts, getProductById, getCategories, addReview } = require('../controllers/productController');
const { protect } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/meta/categories', getCategories);
router.get('/:idOrSlug', getProductById);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
