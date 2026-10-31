const { getStore, saveStore } = require('../data/store');

// @desc    Get current user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const store = getStore();
    const userCart = (store.carts && store.carts[req.user.id]) || [];

    // Hydrate with latest product info and check stock availability
    const items = [];
    for (const item of userCart) {
      const product = store.products.find(p => p.id === item.productId);
      if (product) {
        items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          image: product.images && product.images[0] ? product.images[0] : '',
          category: product.category,
          stock: product.stock,
          quantity: Math.min(item.quantity, Math.max(1, product.stock))
        });
      }
    }

    res.status(200).json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Sync / save user cart
// @route   POST /api/cart/sync
// @access  Private
exports.syncCart = async (req, res) => {
  try {
    const { items } = req.body;
    const store = getStore();
    if (!store.carts) store.carts = {};

    store.carts[req.user.id] = (items || []).map(i => ({
      productId: i.productId || i.id,
      quantity: Number(i.quantity) || 1
    }));

    saveStore();
    res.status(200).json({ success: true, message: 'Cart synced' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
