const { getStore, saveStore } = require('../data/store');

// @desc    Get all products with filters, search, sort
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const store = getStore();
    let products = [...store.products];

    // Filter by category
    const { category, search, minPrice, maxPrice, sort, inStock } = req.query;
    const requestedPage = Number.parseInt(req.query.page, 10) || 1;
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 6, 1), 50);

    if (category && category !== 'all') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase() || p.categorySlug === category.toLowerCase());
    }

    // Search keyword
    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.ingredients && p.ingredients.some(ing => ing.toLowerCase().includes(q)))
      );
    }

    // Price range
    if (minPrice) {
      products = products.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    // Stock
    if (inStock === 'true') {
      products = products.filter(p => p.stock > 0);
    }

    // Sorting
    if (sort === 'price-low') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Default: bestsellers / featured
      products.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
    }

    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.min(Math.max(requestedPage, 1), totalPages);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);

    res.status(200).json({
      success: true,
      count: total,
      products: paginatedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:idOrSlug
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const store = getStore();
    const idOrSlug = req.params.idOrSlug;
    const product = store.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Related products in the same category
    const related = store.products
      .filter(p => p.id !== product.id && p.category === product.category)
      .slice(0, 4);

    res.status(200).json({
      success: true,
      product,
      related
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all product categories
// @route   GET /api/products/meta/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const store = getStore();
    // Count products per category
    const categoriesWithCounts = store.categories.map(cat => {
      const count = store.products.filter(p => p.category.toLowerCase() === cat.name.toLowerCase() || p.categorySlug === cat.slug).length;
      return { ...cat, productCount: count };
    });

    res.status(200).json({
      success: true,
      categories: categoriesWithCounts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add review to product
// @route   POST /api/products/:id/reviews
// @access  Private (User)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const store = getStore();
    const product = store.products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!product.reviews) product.reviews = [];

    const newReview = {
      id: 'rev_' + Date.now(),
      userId: req.user.id,
      userName: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };

    product.reviews.push(newReview);
    product.numReviews = product.reviews.length;
    const totalRating = product.reviews.reduce((acc, r) => acc + r.rating, 0);
    product.rating = Number((totalRating / product.numReviews).toFixed(1));

    saveStore();

    res.status(201).json({ success: true, message: 'Review added', reviews: product.reviews, rating: product.rating });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
