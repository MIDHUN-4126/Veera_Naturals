const express = require('express');
const router = express.Router();
const {
  getBIDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
  createProduct,
  updateProduct,
  quickStockAdjust,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getCoupons,
  createCoupon,
  deleteCoupon,
  getAuditLogs,
  getStoreSettings,
  updateStoreSettings
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// All admin routes require both Authentication and Admin role
router.use(protect);
router.use(adminOnly);

// BI Dashboard
router.get('/bi-dashboard', getBIDashboardStats);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Product Management
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.put('/products/:id/stock', quickStockAdjust);
router.delete('/products/:id', deleteProduct);

// Order Management
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Coupon Management
router.get('/coupons', getCoupons);
router.post('/coupons', createCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Audit & Settings
router.get('/audit-logs', getAuditLogs);
router.get('/settings', getStoreSettings);
router.put('/settings', updateStoreSettings);

module.exports = router;
