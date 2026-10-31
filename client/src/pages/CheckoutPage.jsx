import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  CheckCircle2, ShieldCheck, ArrowLeft, CreditCard, Wallet, Truck, 
  Sparkles, MapPin, Check, Plus, Home, Briefcase, ExternalLink 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CheckoutPage() {
  const { cartItems, subtotal, discount, shipping, tax, totalAmount, coupon, clearCart } = useCart();
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const savedAddresses = user?.addresses || [];
  const defaultSaved = savedAddresses.find(a => a.isDefault) || savedAddresses[0];

  const [selectedSavedId, setSelectedSavedId] = useState(
    defaultSaved ? (defaultSaved.id || defaultSaved._id) : 'custom'
  );

  const [address, setAddress] = useState({
    street: defaultSaved?.street || '12, Orchid Garden Avenue',
    city: defaultSaved?.city || 'Coimbatore',
    state: defaultSaved?.state || 'Tamil Nadu',
    pincode: defaultSaved?.pincode || '641006',
    country: 'India',
    phone: defaultSaved?.phone || user?.phone || '+91 98765 43210'
  });

  const [saveToProfile, setSaveToProfile] = useState(false);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    if (defaultSaved && selectedSavedId !== 'custom') {
      setAddress({
        street: defaultSaved.street || '',
        city: defaultSaved.city || '',
        state: defaultSaved.state || 'Tamil Nadu',
        pincode: defaultSaved.pincode || '',
        country: 'India',
        phone: defaultSaved.phone || user?.phone || ''
      });
    }
  }, [user]);

  const handleSelectSavedAddress = (addr) => {
    const id = addr.id || addr._id;
    setSelectedSavedId(id);
    setAddress({
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode || '',
      country: 'India',
      phone: addr.phone || user?.phone || ''
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cartItems.length) return;

    setLoading(true);
    try {
      // If user chose to save this address to profile, save it
      if (saveToProfile && selectedSavedId === 'custom') {
        const newAddr = {
          id: 'addr_' + Date.now(),
          label: addressLabel,
          ...address,
          isDefault: savedAddresses.length === 0
        };
        const updatedList = [...savedAddresses, newAddr];
        try {
          const profRes = await axios.put('/api/auth/profile', { addresses: updatedList });
          if (profRes.data.success) {
            updateUser(profRes.data.user);
          }
        } catch (addrErr) {
          console.warn('Could not auto-save address to profile:', addrErr);
        }
      }

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
            {orderSuccess.orderNumber || 'VN-HERBAL-8492'}
          </div>
          <p className="text-[11px] text-stone-400">
            Delivering to: <strong className="text-stone-700">{orderSuccess.shippingAddress?.street}, {orderSuccess.shippingAddress?.city}</strong>
          </p>

          <div className="pt-4 flex flex-col gap-2">
            <Link
              to="/profile"
              className="bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold py-3 rounded-xl text-xs transition-colors shadow-md"
            >
              Track Order Status in Profile
            </Link>
            <Link
              to="/shop"
              className="text-xs font-semibold text-stone-500 hover:text-stone-800 py-2"
            >
              Continue Exploring Remedies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-ivory-100 py-20 px-4 text-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="font-serif text-2xl font-bold text-forest-950">Your Cart is Empty</h2>
          <p className="text-xs text-stone-500">Add authentic formulations to your basket before proceeding to checkout.</p>
          <Link
            to="/shop"
            className="inline-block bg-forest-900 hover:bg-forest-950 text-gold-300 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow"
          >
            Explore Herbal Dispensary
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link to="/cart" className="flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-forest-900">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>
          <span className="text-xs text-stone-400 font-medium">Step 2 of 2: Shipping & Payment</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Form: Address & Payment */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Delivery Address Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-forest-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <h2 className="font-serif font-bold text-lg text-forest-900">
                    Delivery Address
                  </h2>
                </div>
                <Link
                  to="/profile"
                  className="flex items-center gap-1 text-[11px] font-bold text-forest-900 hover:text-gold-600 transition-colors"
                  title="Manage addresses in your profile"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Manage in Profile</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </Link>
              </div>

              {/* Saved Addresses Picker (if user has saved addresses) */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-stone-600 block">
                    Choose from Saved Delivery Addresses:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr, idx) => {
                      const addrId = addr.id || addr._id || `addr-${idx}`;
                      const isSelected = selectedSavedId === addrId;
                      return (
                        <div
                          key={addrId}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                            isSelected
                              ? 'border-forest-900 bg-forest-50/60 ring-2 ring-forest-900/10 shadow-xs'
                              : 'border-stone-200 hover:border-stone-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-forest-950 flex items-center gap-1.5">
                              {addr.label?.toLowerCase() === 'work' ? <Briefcase className="w-3 h-3 text-stone-500" /> : <Home className="w-3 h-3 text-stone-500" />}
                              {addr.label || 'Saved Address'}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-forest-900 text-gold-300 flex items-center justify-center">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 line-clamp-1 font-medium">{addr.street}</p>
                          <p className="text-[11px] text-stone-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                        </div>
                      );
                    })}

                    <div
                      onClick={() => {
                        setSelectedSavedId('custom');
                        setAddress({
                          street: '',
                          city: '',
                          state: 'Tamil Nadu',
                          pincode: '',
                          country: 'India',
                          phone: user?.phone || ''
                        });
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-center gap-2 border-dashed ${
                        selectedSavedId === 'custom'
                          ? 'border-forest-900 bg-forest-50/40 text-forest-900 font-bold'
                          : 'border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-xs font-bold">Use a New Address</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Street Address / House / Landmark *</label>
                  <input
                    type="text"
                    required
                    placeholder="Flat / House No., Area, Street name"
                    value={address.street}
                    onChange={(e) => {
                      setSelectedSavedId('custom');
                      setAddress({ ...address, street: e.target.value });
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore"
                    value={address.city}
                    onChange={(e) => {
                      setSelectedSavedId('custom');
                      setAddress({ ...address, city: e.target.value });
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">State *</label>
                  <select
                    value={address.state}
                    onChange={(e) => {
                      setSelectedSavedId('custom');
                      setAddress({ ...address, state: e.target.value });
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500 font-medium"
                  >
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                    <option value="Telangana">Telangana</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Other">Other State</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6 digits (e.g. 641006)"
                    value={address.pincode}
                    onChange={(e) => {
                      setSelectedSavedId('custom');
                      setAddress({ ...address, pincode: e.target.value });
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-stone-600 block mb-1">Delivery Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={address.phone}
                    onChange={(e) => {
                      setSelectedSavedId('custom');
                      setAddress({ ...address, phone: e.target.value });
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Save to Profile Option */}
              {selectedSavedId === 'custom' && (
                <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="saveAddressCheckbox"
                      checked={saveToProfile}
                      onChange={(e) => setSaveToProfile(e.target.checked)}
                      className="rounded border-stone-300 text-forest-900 focus:ring-gold-500 h-4 w-4"
                    />
                    <label htmlFor="saveAddressCheckbox" className="text-xs font-semibold text-stone-700 cursor-pointer">
                      Save this delivery address to my profile
                    </label>
                  </div>
                  {saveToProfile && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Label:</span>
                      {['Home', 'Office', 'Other'].map(lbl => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setAddressLabel(lbl)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                            addressLabel === lbl
                              ? 'bg-forest-900 text-gold-300 border-forest-900'
                              : 'bg-stone-50 text-stone-600 border-stone-200'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
                <div className="w-7 h-7 rounded-lg bg-forest-900 text-gold-300 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="font-serif font-bold text-lg text-forest-900">
                  Select Payment Method
                </h2>
              </div>

              <div className="space-y-3">
                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-forest-900 bg-forest-50/50 ring-1 ring-forest-900/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === 'razorpay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-forest-900 focus:ring-gold-500"
                    />
                    <div>
                      <p className="font-bold text-xs text-stone-900">Prepaid: UPI, Credit/Debit Cards, NetBanking</p>
                      <p className="text-[11px] text-stone-500">Instant verification via Razorpay / PhonePe / GPay</p>
                    </div>
                  </div>
                  <CreditCard className="w-5 h-5 text-gold-600" />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-forest-900 bg-forest-50/50 ring-1 ring-forest-900/20'
                    : 'border-stone-200 hover:border-stone-300'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-forest-900 focus:ring-gold-500"
                    />
                    <div>
                      <p className="font-bold text-xs text-stone-900">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-stone-500">Pay cash or UPI upon delivery to courier executive</p>
                    </div>
                  </div>
                  <Truck className="w-5 h-5 text-forest-800" />
                </label>
              </div>
            </div>

          </div>

          {/* Right Summary: Order Details */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h2 className="font-serif font-bold text-lg text-forest-900 pb-3 border-b border-stone-100">
              Order Summary ({cartItems.length} items)
            </h2>

            {/* Line Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || '/marketing/IMG-20260804-WA0013.jpg'}
                      alt=""
                      className="w-12 h-12 rounded-xl object-cover bg-stone-100 border border-stone-200"
                    />
                    <div>
                      <p className="font-bold text-stone-900 line-clamp-1">{item.name}</p>
                      <p className="text-stone-400 text-[11px]">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                  </div>
                  <span className="font-bold text-forest-900">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-stone-100 space-y-2 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gold-600 font-semibold">
                  <span>Coupon Discount ({coupon?.code})</span>
                  <span>- ₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                {shipping === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shipping}`}
              </div>
              <div className="flex justify-between text-stone-600">
                <span>GST (5% Ayurvedic)</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-base pt-3 border-t border-stone-200">
                <span>Total Amount</span>
                <span className="text-forest-950 font-serif font-bold text-lg">₹{totalAmount}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold py-3.5 rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
            >
              {loading ? (
                <span>Securing your order...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  <span>Place Order • ₹{totalAmount}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Authentic Heritage Formulations • Verified Secure Gateway</span>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
