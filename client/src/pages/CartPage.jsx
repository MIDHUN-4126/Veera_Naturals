import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discount,
    shipping,
    tax,
    totalAmount,
    coupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const { isAuthenticated } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [couponSuccess, setCouponSuccess] = useState(null);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);
    if (!couponInput.trim()) return;

    const res = await applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] bg-ivory-100 flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 bg-forest-100 rounded-full flex items-center justify-center text-forest-900 mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-forest-950">Your Botanical Cart is Empty</h2>
        <p className="text-xs text-stone-500 mt-2 max-w-sm text-center">
          Experience the pure rejuvenating power of cold-pressed botanicals and sacred herbs.
        </p>
        <Link
          to="/shop"
          className="mt-6 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-6 py-3 rounded-full text-xs transition-all shadow-md"
        >
          Explore Handcrafted Formulations
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h1 className="font-serif text-3xl font-extrabold text-forest-950">
              Shopping Cart
            </h1>
            <p className="text-xs text-stone-500 mt-1">
              You have {cartItems.reduce((acc, i) => acc + i.quantity, 0)} items ready for checkout
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-stone-500 hover:text-red-600 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center gap-5 justify-between"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img
                    src={item.image || '/marketing/IMG-20260804-WA0013.jpg'}
                    alt={item.name}
                    className="w-20 h-20 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1608248597359-005696120366?w=200&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div>
                    <span className="text-[10px] font-bold text-gold-700 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="font-serif font-bold text-base text-forest-950">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-forest-900">₹{item.price}</span>
                      {item.mrp && item.mrp > item.price && (
                        <span className="text-xs text-stone-400 line-through">₹{item.mrp}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  {/* Quantity */}
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-stone-600 hover:text-stone-900"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= (item.stock || 99)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 disabled:opacity-30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal for Item */}
                  <div className="text-right min-w-[70px]">
                    <span className="text-base font-bold text-forest-900">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>

                  {/* Remove Item */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-2xs flex items-center justify-center"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary & Checkout Card */}
          <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-6 sticky top-24">
            
            <h2 className="font-serif font-bold text-xl text-forest-950 pb-3 border-b border-stone-100">
              Order Summary
            </h2>

            {/* Calculations */}
            <div className="space-y-3 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-stone-900">₹{subtotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>- ₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-stone-900">
                  {shipping === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shipping}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Applicable GST (5%)</span>
                <span className="font-semibold text-stone-900">₹{tax}</span>
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-base font-bold text-forest-950">
                <span>Total Amount</span>
                <span className="text-2xl text-forest-900">₹{totalAmount}</span>
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 border-t border-stone-100 space-y-2">
              <label className="text-xs font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gold-600" />
                <span>Promo Coupon</span>
              </label>

              {coupon ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{coupon.code} applied ({coupon.discountPercent}% OFF)</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-stone-400 hover:text-red-600 text-xs font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    placeholder="e.g. VEERA10"
                    className="flex-1 text-xs bg-stone-50 border border-stone-300 rounded-xl px-3 py-2.5 uppercase font-semibold focus:outline-none focus:border-gold-500"
                  />
                  <button
                    type="submit"
                    className="bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{couponSuccess}</span>
                </p>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-sm"
            >
              <span>{isAuthenticated ? 'Proceed to Checkout' : 'Login & Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-stone-400 text-center font-light">
              🔒 Safe & encrypted payment powered by Razorpay simulator.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}
