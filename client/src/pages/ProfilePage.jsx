import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Package, MapPin, Settings, CheckCircle2, LogOut, Clock, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saveNotice, setSaveNotice] = useState(null);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const res = await axios.get('/api/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/auth/profile', { name, phone });
      if (res.data.success) {
        updateUser(res.data.user);
        setSaveNotice('Profile updated successfully!');
        setTimeout(() => setSaveNotice(null), 3000);
      }
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Delivered</span>;
      case 'shipped':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Shipped</span>;
      case 'processing':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Processing</span>;
      default:
        return <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="min-h-screen bg-ivory-100 py-10 px-4 sm:px-6 lg:px-8">
      {saveNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-forest-900 text-gold-300 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-gold-500/40 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-gold-400" />
          <span className="text-sm font-semibold">{saveNotice}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* User Greeting Bar */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
              alt=""
              className="w-16 h-16 rounded-full border-2 border-gold-500 bg-forest-900 p-0.5"
            />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gold-700">
                Customer Account
              </span>
              <h1 className="font-serif text-2xl font-bold text-forest-950">
                {user?.name}
              </h1>
              <p className="text-xs text-stone-500">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <button
                onClick={() => navigate('/admin')}
                className="bg-gold-500 hover:bg-gold-600 text-forest-950 text-xs font-bold px-4 py-2 rounded-xl transition-all shadow"
              >
                Go to Admin Dashboard
              </button>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-red-600 px-3 py-2 rounded-xl border border-stone-200 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Tabs Menu */}
          <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-forest-900 text-gold-300 shadow-md ring-1 ring-gold-500/30'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850'
              }`}
            >
              <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-gold-300' : 'text-forest-800 dark:text-gold-400'}`} />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-forest-900 text-gold-300 shadow-md ring-1 ring-gold-500/30'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-850'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-gold-300' : 'text-forest-800 dark:text-gold-400'}`} />
              <span>Personal Information</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm">
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <h2 className="font-serif font-bold text-lg text-forest-900">
                    Order History
                  </h2>
                  <span className="text-xs text-stone-400">Total orders: {orders.length}</span>
                </div>

                {loadingOrders ? (
                  <p className="text-xs text-stone-500 py-6 text-center">Loading orders...</p>
                ) : orders.length === 0 ? (
                  <div className="text-center py-10 space-y-3">
                    <Package className="w-10 h-10 text-stone-300 mx-auto" />
                    <p className="text-sm font-semibold text-stone-700">No orders placed yet</p>
                    <p className="text-xs text-stone-400">Explore our handcrafted formulas and place your first order.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl border border-stone-200 hover:border-gold-500/50 transition-colors space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100 text-xs">
                          <div>
                            <span className="text-stone-400">Order Ref: </span>
                            <span className="font-mono font-bold text-forest-900">{ord.orderNumber}</span>
                            <span className="text-stone-400 ml-3">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>{getStatusBadge(ord.fulfillmentStatus)}</div>
                        </div>

                        {/* Items */}
                        <div className="space-y-2">
                          {(ord.items || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.image || '/marketing/IMG-20260804-WA0013.jpg'}
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                                />
                                <div>
                                  <p className="font-bold text-stone-900">{item.name}</p>
                                  <p className="text-stone-400 text-[11px]">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                              </div>
                              <span className="font-bold text-forest-900">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Bottom Total */}
                        <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs">
                          <span className="text-stone-500">
                            Payment: <strong className="uppercase">{ord.paymentMethod}</strong> ({ord.paymentStatus})
                          </span>
                          <span className="text-sm font-bold text-forest-900">
                            Total: ₹{ord.totalAmount}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <h2 className="font-serif font-bold text-lg text-forest-900 pb-3 border-b border-stone-100">
                  Update Account Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1">Email (Read Only)</label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-600 block mb-1">Account Role</label>
                    <input
                      type="text"
                      disabled
                      value={user?.role || 'user'}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 uppercase font-bold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-6 py-3 rounded-xl text-xs transition-colors shadow-md"
                >
                  Save Profile Changes
                </button>
              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
