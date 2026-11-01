import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Filter, Search, ShoppingBag, Star, SlidersHorizontal, CheckCircle2, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [toastMessage, setToastMessage] = useState(null);

  // Filters state
  const selectedCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortBy, setSortBy] = useState('bestseller');
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchParams, sortBy, inStockOnly]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/products/meta/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (minPrice > 0) params.append('minPrice', minPrice);
      if (maxPrice < 1000) params.append('maxPrice', maxPrice);
      if (sortBy) params.append('sort', sortBy);
      if (inStockOnly) params.append('inStock', 'true');

      const res = await axios.get(`/api/products?${params.toString()}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug === 'all') {
      newParams.delete('category');
    } else {
      newParams.set('category', slug);
    }
    setSearchParams(newParams);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setToastMessage(`Added "${product.name}" to cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const resetFilters = () => {
    setSearchParams({});
    setMinPrice(0);
    setMaxPrice(1000);
    setSortBy('bestseller');
    setInStockOnly(false);
  };

  return (
    <div className="min-h-screen bg-ivory-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-900 text-gold-300 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gold-500/40 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-gold-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">The Apothecary</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-forest-950 mt-1">
            Botanical Formulations
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Handcrafted with 100% natural cold-pressed extracts, herbal tonics, and therapeutic oils.
          </p>
        </div>

        {/* Main Grid: Filters + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Filters */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="font-serif font-bold text-forest-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-gold-600" />
                  Filters
                </span>
                <button
                  onClick={resetFilters}
                  className="text-xs text-stone-400 hover:text-forest-900 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>

              {/* Search in Catalogue */}
              <div>
                <label className="text-xs font-bold uppercase text-stone-500 tracking-wider block mb-2">
                  Search
                </label>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      const newParams = new URLSearchParams(searchParams);
                      if (e.target.value) {
                        newParams.set('search', e.target.value);
                      } else {
                        newParams.delete('search');
                      }
                      setSearchParams(newParams);
                    }}
                    placeholder="Search by ingredient..."
                    className="w-full text-xs bg-stone-50 border border-stone-200 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:border-gold-500"
                  />
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                </form>
              </div>

              {/* Categories */}
              <div>
                <label className="text-xs font-bold uppercase text-stone-500 tracking-wider block mb-2.5">
                  Categories
                </label>
                <div className="space-y-1.5">
                  <button
                    onClick={() => handleCategoryChange('all')}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === 'all'
                        ? 'bg-forest-900 text-gold-300 font-bold shadow-sm ring-1 ring-gold-500/20'
                        : 'text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-[10px] opacity-70">({products.length})</span>
                  </button>

                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryChange(cat.slug)}
                      className={`w-full text-left text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === cat.slug
                          ? 'bg-forest-900 text-gold-300 font-bold shadow-sm ring-1 ring-gold-500/20'
                          : 'text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span>{cat.icon} {cat.name}</span>
                      <span className="text-[10px] opacity-70">({cat.productCount})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold uppercase text-stone-500 tracking-wider">
                    Max Price
                  </label>
                  <span className="text-xs font-bold text-forest-900">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  onMouseUp={fetchProducts}
                  onTouchEnd={fetchProducts}
                  className="w-full accent-forest-900 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                  <span>₹100</span>
                  <span>₹1000</span>
                </div>
              </div>

              {/* Availability */}
              <div className="pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700 font-medium">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-forest-900 w-4 h-4 rounded"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

            </div>
          </aside>

          {/* Product Listing Area */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Sort & Count Bar */}
            <div className="bg-white px-5 py-3.5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-stone-500 font-medium">
                Showing <strong className="text-stone-900">{products.length}</strong> natural formulations
              </span>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-500">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-stone-50 border border-stone-200 rounded-lg px-3 py-1.5 font-medium text-stone-800 focus:outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="bestseller">Bestsellers</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">New Arrivals</option>
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-stone-200 animate-pulse space-y-3">
                    <div className="aspect-square bg-stone-200 rounded-xl" />
                    <div className="h-4 bg-stone-200 rounded w-2/3" />
                    <div className="h-3 bg-stone-100 rounded w-full" />
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-stone-200 shadow-sm">
                <span className="text-4xl">🌿</span>
                <h3 className="font-serif text-xl font-bold text-forest-900 mt-3">No Formulations Found</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  We couldn't find any remedies matching your criteria. Try resetting your search or category filter.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-gold-500/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Top Section with Image */}
                    <div>
                      <div className="relative aspect-square overflow-hidden bg-stone-100">
                        <Link to={`/products/${product.slug || product.id}`}>
                          <img
                            src={product.images?.[0] || '/marketing/IMG-20260804-WA0013.jpg'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1608248597359-005696120366?w=600&auto=format&fit=crop&q=80';
                            }}
                          />
                        </Link>
                        {product.tags && product.tags[0] && (
                          <span className="absolute top-3 left-3 bg-forest-900 text-gold-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                            {product.tags[0]}
                          </span>
                        )}
                        {product.stock <= 10 && product.stock > 0 && (
                          <span className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Only {product.stock} Left
                          </span>
                        )}
                        {product.stock === 0 && (
                          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center">
                            <span className="bg-white text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-gold-700 uppercase tracking-wider">
                            {product.category}
                          </span>
                          <span className="text-stone-400 font-light">{product.volume}</span>
                        </div>

                        <Link
                          to={`/products/${product.slug || product.id}`}
                          className="block font-serif text-base font-bold text-forest-950 hover:text-gold-700 transition-colors"
                        >
                          {product.name}
                        </Link>

                        <p className="text-xs text-stone-500 line-clamp-2 font-light leading-relaxed">
                          {product.description}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Pricing & Cart */}
                    <div className="p-4 pt-0">
                      {/* Rating */}
                      <div className="flex items-center gap-1 text-amber-500 text-xs mb-3">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span className="font-bold text-stone-800">{product.rating || 4.8}</span>
                        <span className="text-stone-400 text-[11px]">({product.numReviews || 12})</span>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                        <div>
                          <span className="text-lg font-bold text-forest-900">₹{product.price}</span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="text-xs text-stone-400 line-through ml-2">₹{product.mrp}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(product, e)}
                          disabled={product.stock === 0}
                          className={`p-2.5 rounded-xl transition-all shadow ${
                            product.stock === 0
                              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                              : 'bg-forest-900 hover:bg-gold-500 text-white hover:text-forest-950 hover:shadow-md'
                          }`}
                          title="Add to Cart"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  );
}
