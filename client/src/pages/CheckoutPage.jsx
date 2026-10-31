import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle2, ShieldCheck, ArrowLeft, CreditCard, Wallet, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { cartItems, subtotal, discount, shipping, tax, totalAmount, coupon, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    street: user?.addresses?.[0]?.street || '12, Orchid Garden Avenue',
    city: user?.addresses?.[0]?.city || 'Coimbatore',
    state: user?.addresses?.[0]?.state || 'Tamil Nadu',
    pincode: user?.addresses?.[0]?.pincode || '641006',
    country: 'India',
    phone: user?.phone || '+91 98765 43210'
  });

  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cartItems.length) return;

    setLoading(true);
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category,
          image: item.image
        })),
        shippingAddress: address,
        paymentMethod,
        couponCode: coupon?.code || null
      };

      const res = await axios.post('/api/orders', orderPayload);
      if (res.data.success) {
        setOrderSuccess(res.data.order);
        clearCart();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-ivory-100 py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-stone-200 shadow-xl text-center space-y-5 animate-scale-up">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest text-gold-600">Order Confirmed</span>
          <h2 className="font-serif text-2xl font-bold text-forest-950">Thank you, {user?.name}!</h2>
          <p className="text-xs text-stone-500">
            Your sacred botanical formulation is being hand-packed. We've assigned tracking reference:
          </p>
          <div className="bg-forest-50 p-3 rounded-xl border border-forest-200 text-sm font-mono font-bold text-forest-900">
            {orderSuccess.orderNumber}
          </div>
          <p className="text-xs text-stone-600">
            A confirmation has been sent to <strong>{user?.email}</strong>.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              to="/profile"
              className="w-full bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold py-3 rounded-xl text-xs transition-colors shadow-md text-center block"
            >
              View Order in Profile
            </Link>
            <Link
              to="/shop"
              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 rounded-xl text-xs transition-colors"
            >
              Continue Exploring
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-forest-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Cart</span>
        </Link>

        <h1 className="font-serif text-3xl font-extrabold text-forest-950">
          Checkout & Shipping
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Address & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif font-bold text-lg text-forest-900 pb-2 border-b border-stone-100">
                1. Delivery Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={address.pincode}
                    onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <h2 className="font-serif font-bold text-lg text-forest-900 pb-2 border-b border-stone-100">
                2. Select Payment Method
              </h2>

              <div className="space-y-3">
                <label
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'razorpay'
                      ? 'border-gold-500 bg-gold-50/50 shadow-sm'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="accent-forest-900"
                    />
                    <div>
                      <p className="text-xs font-bold text-forest-900">Razorpay / UPI / Cards (Simulated)</p>
                      <p className="text-[11px] text-stone-500">Instant approval in test environment</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-forest-800" />
                </label>

                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-gold-500 bg-gold-50/50 shadow-sm'
                      : 'border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="accent-forest-900"
                    />
                    <div>
                      <p className="text-xs font-bold text-forest-900">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-stone-500">Pay cash upon package handover</p>
                    </div>
                  </div>
                  <Truck className="w-5 h-5 text-forest-800" />
                </label>
              </div>
            </div>

          </div>

          {/* Right Summary */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-lg text-forest-900 pb-2 border-b border-stone-100">
              Order Review
            </h2>

            {/* Items Mini List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={item.image || '/marketing/IMG-20260804-WA0013.jpg'}
                      alt=""
                      className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                    />
                    <div>
                      <p className="font-bold text-stone-900 line-clamp-1">{item.name}</p>
                      <p className="text-stone-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-forest-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Calculation */}
            <div className="space-y-2.5 text-xs text-stone-600 border-t border-stone-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-900">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-stone-900">
                  {shipping === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-semibold text-stone-900">₹{tax}</span>
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline text-base font-bold text-forest-950">
                <span>Total Payable</span>
                <span className="text-2xl text-forest-900">₹{totalAmount}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.02] text-sm disabled:opacity-50"
            >
              {loading ? 'Processing Order...' : `Pay ₹${totalAmount} & Confirm`}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-400">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>SSL 256-bit encrypted botanical checkout</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
