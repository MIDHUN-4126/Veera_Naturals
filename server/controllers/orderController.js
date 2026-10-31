const { getStore, saveStore } = require('../data/store');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.pincode) {
      return res.status(400).json({ success: false, message: 'Complete delivery address is required' });
    }

    const store = getStore();

    // Verify each item and calculate server-side subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = store.products.find(p => p.id === item.productId || p.id === item.id);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product not found: ${item.name || item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}`
        });
      }

      // Deduct stock and increment sales count
      product.stock -= item.quantity;
      product.salesCount = (product.salesCount || 0) + item.quantity;

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images && product.images[0] ? product.images[0] : '',
        category: product.category
      });
    }

    // Apply Coupon if any
    let discount = 0;
    if (couponCode) {
      const coupon = store.coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.active);
      if (coupon && subtotal >= (coupon.minOrder || 0)) {
        discount = Math.round((subtotal * coupon.discountPercent) / 100);
      }
    }

    // Taxes and Shipping
    const shipping = subtotal > 499 ? 0 : 50; // Free shipping above ₹499
    const tax = Math.round((subtotal - discount) * 0.05); // 5% GST on wellness items
    const totalAmount = Math.max(0, subtotal - discount + tax + shipping);

    const orderNumber = 'VN-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      id: 'ord_' + Date.now(),
      orderNumber,
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      items: validatedItems,
      shippingAddress,
      subtotal,
      discount,
      shipping,
      tax,
      totalAmount,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: 'paid', // Auto-cleared in test/simulation mode
      fulfillmentStatus: 'processing',
      couponCode: couponCode || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    store.orders.unshift(newOrder);

    // Clear user cart if exists
    if (store.carts && store.carts[req.user.id]) {
      store.carts[req.user.id] = [];
    }

    saveStore();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      order: newOrder
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const store = getStore();
    const orders = store.orders.filter(o => o.userId === req.user.id);
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const store = getStore();
    const order = store.orders.find(o => o.id === req.params.id || o.orderNumber === req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only allow customer who placed it or an admin
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Validate coupon
// @route   POST /api/orders/coupon/validate
// @access  Public
exports.validateCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const store = getStore();
    const coupon = store.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.active);

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon code' });
    }

    if (cartTotal && cartTotal < (coupon.minOrder || 0)) {
      return res.status(400).json({
        success: false,
        message: `This coupon requires a minimum cart value of ₹${coupon.minOrder}`
      });
    }

    const discount = cartTotal ? Math.round((cartTotal * coupon.discountPercent) / 100) : 0;

    res.status(200).json({
      success: true,
      coupon: {
        code: coupon.code,
        discountPercent: coupon.discountPercent,
        discountAmount: discount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
