const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  sku: { type: String, unique: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, min: 0 },
  costPrice: { type: Number, default: 0 }, // For admin BI margin analysis
  stock: { type: Number, required: true, default: 0 },
  lowStockThreshold: { type: Number, default: 10 },
  images: [{ type: String }],
  ingredients: [{ type: String }],
  benefits: [{ type: String }],
  volume: { type: String }, // e.g. "100 ml", "50 g"
  rating: { type: Number, default: 4.8 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  tags: [{ type: String }], // 'bestseller', 'new', 'organic'
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
