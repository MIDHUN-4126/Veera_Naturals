import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Star, ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCw, CheckCircle2, Heart, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('ingredients');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProductDetails();
    window.scrollTo(0, 0);
  }, [idOrSlug]);

  const fetchProductDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/products/${idOrSlug}`);
      if (res.data.success) {
        setProduct(res.data.product);
        setRelated(res.data.related || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setToastMessage(`Added ${quantity} × "${product.name}" to cart!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingReview(true);
    try {
      const res = await axios.post(`/api/products/${product.id}/reviews`, {
        rating: newRating,
        comment: newComment
      });
      if (res.data.success) {
        setProduct(prev => ({
          ...prev,
          reviews: res.data.reviews,
          rating: res.data.rating,
          numReviews: res.data.reviews.length
        }));
        setNewComment('');
        setToastMessage('Review submitted! Thank you.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-100">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-forest-900 border-t-gold-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500 font-medium">Preparing Botanical Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ivory-100 p-4">
        <h2 className="font-serif text-2xl font-bold text-forest-950">Formulation Not Found</h2>
        <Link to="/shop" className="mt-4 text-xs font-bold bg-forest-900 hover:bg-forest-950 text-gold-300 px-5 py-2.5 rounded-lg shadow-sm transition-colors">
          Back to Catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-900 text-gold-300 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gold-500/40 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-gold-400" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Back Link */}
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-forest-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Products</span>
        </Link>

        {/* Product Hero Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-stone-200 shadow-sm">
          
          {/* Gallery Side */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
              <img
                src={product.images?.[0] || '/marketing/IMG-20260804-WA0013.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1608248597359-005696120366?w=800&auto=format&fit=crop&q=80';
                }}
              />
            </div>
            
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gold-500 cursor-pointer">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Side */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-700 bg-gold-50 px-3 py-1 rounded-full">
                  {product.category}
                </span>
                <span className="text-xs font-semibold text-stone-500">
                  SKU: {product.sku || 'VN-BOT-01'}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-forest-950">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 text-amber-500 text-sm">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(product.rating || 5) ? 'fill-amber-500' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-stone-800">{product.rating || 4.9}</span>
                <span className="text-stone-400 text-xs">({product.numReviews || 0} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 pt-2">
                <span className="text-3xl font-extrabold text-forest-900">₹{product.price}</span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-base text-stone-400 line-through">₹{product.mrp}</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                    </span>
                  </>
                )}
                {product.volume && (
                  <span className="text-xs text-stone-500 ml-auto font-medium">
                    Net: {product.volume}
                  </span>
                )}
              </div>

              <p className="text-stone-600 text-sm font-light leading-relaxed">
                {product.description}
              </p>

              {/* Stock Status */}
              <div>
                {product.stock > 0 ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-3 py-1 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    In Stock ({product.stock} units available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Actions: Quantity + Add to Cart + Buy Now */}
            <div className="space-y-4 pt-6 border-t border-stone-200">
              
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-700">Quantity:</span>
                <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || product.stock === 0}
                    className="p-2.5 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="p-2.5 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-forest-900 hover:bg-forest-950 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4 text-gold-400" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold py-3.5 px-6 rounded-xl transition-all shadow-md text-sm disabled:opacity-50"
                >
                  Buy Now
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-stone-100 text-[11px] text-stone-500 text-center">
                <div className="flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-gold-600" />
                  <span>100% Ayurvedic</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <Truck className="w-4 h-4 text-gold-600" />
                  <span>Free Ship &gt; ₹499</span>
                </div>
                <div className="flex items-center justify-center gap-1">
                  <RefreshCw className="w-4 h-4 text-gold-600" />
                  <span>Secure Checkout</span>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Detailed Tabs: Ingredients, Benefits, Ritual, Reviews */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-stone-200 overflow-x-auto bg-stone-50">
            {[
              { id: 'ingredients', label: '🌿 Ingredients' },
              { id: 'benefits', label: '✨ Benefits' },
              { id: 'reviews', label: `⭐ Reviews (${product.reviews?.length || 0})` }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-forest-900 text-forest-950 bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-forest-900">
                  Key Active Botanicals
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(product.ingredients || ['Cold Pressed Sesame Oil', 'Bhringraj', 'Amla', 'Pure Saffron']).map((ing, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 rounded-xl bg-ivory-50 border border-stone-200 text-xs font-semibold text-stone-800">
                      <span className="w-2 h-2 rounded-full bg-gold-600" />
                      <span>{ing}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-stone-500 italic mt-3">
                  * All ingredients are 100% naturally derived without chemical fragrances, phthalates, parabens, or sulphates.
                </p>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-forest-900">
                  Targeted Therapeutic Action
                </h3>
                <ul className="space-y-2.5">
                  {(product.benefits || ['Accelerates natural follicle growth', 'Balances sebum and cools scalp', 'Rich in natural bio-active antioxidants']).map((ben, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                
                {/* Submit New Review (if logged in) */}
                {isAuthenticated ? (
                  <form onSubmit={handleReviewSubmit} className="bg-stone-50 p-6 rounded-2xl border border-stone-200 space-y-4">
                    <h4 className="font-serif font-bold text-base text-forest-900">
                      Share Your Experience with {product.name}
                    </h4>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-600">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="text-amber-500"
                          >
                            <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-500' : 'text-stone-300'}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="How has this botanical formulation benefited your wellness routine?"
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-gold-500"
                      required
                    />

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-bold px-5 py-2.5 rounded-lg transition-colors"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Verified Review'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-forest-50 p-4 rounded-xl text-center text-xs text-forest-900">
                    <span>Have you used this product? </span>
                    <Link to="/login" className="font-bold underline text-forest-950">
                      Login to post a review
                    </Link>
                  </div>
                )}

                {/* Existing Reviews List */}
                <div className="space-y-4">
                  {!product.reviews || product.reviews.length === 0 ? (
                    <p className="text-stone-500 text-xs text-center py-6">
                      No reviews yet. Be the first to share your botanical experience!
                    </p>
                  ) : (
                    product.reviews.map((rev) => (
                      <div key={rev.id || Math.random()} className="border-b border-stone-100 pb-4 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-forest-900">{rev.userName}</span>
                          <span className="text-[11px] text-stone-400">
                            {new Date(rev.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-500' : 'text-stone-300'}`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-stone-700 font-light">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
