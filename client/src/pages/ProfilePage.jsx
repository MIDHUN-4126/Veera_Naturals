import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  User, Package, MapPin, Settings, CheckCircle2, LogOut, Clock, Truck, 
  ShieldCheck, ChevronRight, Plus, Trash2, Edit2, Home, Briefcase, Check, X, AlertCircle 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Profile Information Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saveNotice, setSaveNotice] = useState(null);

  // Address Management states
  const [addresses, setAddresses] = useState(user?.addresses || [
    {
      id: 'addr-1',
      label: 'Home',
      street: '12, Orchid Garden Avenue, Race Course',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641006',
      phone: user?.phone || '+91 98765 43210',
      isDefault: true
    }
  ]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    street: '',
    city: '',
    state: 'Tamil Nadu',
    pincode: '',
    phone: user?.phone || '',
    isDefault: false
  });
  const [addressSaving, setAddressSaving] = useState(false);

  useEffect(() => {
    fetchMyOrders();
    if (user?.addresses && user.addresses.length > 0) {
      setAddresses(user.addresses);
    }
  }, [user]);

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
      console.error(err);
      setSaveNotice('Failed to update profile. Please try again.');
      setTimeout(() => setSaveNotice(null), 3000);
    }
  };

  // ============ ADDRESS MANAGEMENT HANDLERS ============
  const openNewAddressModal = () => {
    setEditingAddressId(null);
    setAddressForm({
      label: 'Home',
      street: '',
      city: '',
      state: 'Tamil Nadu',
      pincode: '',
      phone: user?.phone || phone || '',
      isDefault: addresses.length === 0
    });
    setShowAddressModal(true);
  };

  const openEditAddressModal = (addr) => {
    setEditingAddressId(addr.id || addr._id);
    setAddressForm({
      label: addr.label || 'Home',
      street: addr.street || '',
      city: addr.city || '',
      state: addr.state || 'Tamil Nadu',
      pincode: addr.pincode || '',
      phone: addr.phone || '',
      isDefault: !!addr.isDefault
    });
    setShowAddressModal(true);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    try {
      let updatedList = [...addresses];

      if (editingAddressId) {
        // Edit existing
        updatedList = updatedList.map(a => {
          if ((a.id || a._id) === editingAddressId) {
            return {
              ...a,
              ...addressForm,
              isDefault: addressForm.isDefault
            };
          }
          // If the edited one is marked default, unset default on others
          return addressForm.isDefault ? { ...a, isDefault: false } : a;
        });
      } else {
        // Add new
        const newAddr = {
          id: 'addr_' + Date.now(),
          ...addressForm
        };
        if (addressForm.isDefault) {
          updatedList = updatedList.map(a => ({ ...a, isDefault: false }));
        }
        updatedList.push(newAddr);
      }

      // If only one address exists, ensure it is default
      if (updatedList.length === 1) {
        updatedList[0].isDefault = true;
      }

      const res = await axios.put('/api/auth/profile', { addresses: updatedList });
      if (res.data.success) {
        setAddresses(res.data.user.addresses || updatedList);
        updateUser(res.data.user);
        setShowAddressModal(false);
        setSaveNotice(editingAddressId ? 'Delivery address updated!' : 'New delivery address added!');
        setTimeout(() => setSaveNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
      // Fallback local update
      let updatedList = [...addresses];
      if (editingAddressId) {
        updatedList = updatedList.map(a => (a.id === editingAddressId ? { ...a, ...addressForm } : a));
      } else {
        updatedList.push({ id: 'addr_' + Date.now(), ...addressForm });
      }
      setAddresses(updatedList);
      setShowAddressModal(false);
      setSaveNotice('Address saved locally!');
      setTimeout(() => setSaveNotice(null), 3000);
    } finally {
      setAddressSaving(false);
    }
  };

  const handleSetDefaultAddress = async (addrId) => {
    try {
      const updatedList = addresses.map(a => ({
        ...a,
        isDefault: (a.id || a._id) === addrId
      }));
      setAddresses(updatedList);
      const res = await axios.put('/api/auth/profile', { addresses: updatedList });
      if (res.data.success) {
        updateUser(res.data.user);
        setSaveNotice('Default delivery address updated!');
        setTimeout(() => setSaveNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      const updatedList = addresses.filter(a => (a.id || a._id) !== addrId);
      if (updatedList.length > 0 && !updatedList.some(a => a.isDefault)) {
        updatedList[0].isDefault = true;
      }
      setAddresses(updatedList);
      const res = await axios.put('/api/auth/profile', { addresses: updatedList });
      if (res.data.success) {
        updateUser(res.data.user);
        setSaveNotice('Delivery address deleted.');
        setTimeout(() => setSaveNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
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
                Go to Admin BI Dashboard
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
          <div className="lg:col-span-3 bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-1.5">
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'orders'
                  ? 'bg-forest-900 text-gold-300 shadow-md ring-1 ring-gold-500/30'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-gold-300' : 'text-forest-800'}`} />
              <span>My Orders ({orders.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'addresses'
                  ? 'bg-forest-900 text-gold-300 shadow-md ring-1 ring-gold-500/30'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <MapPin className={`w-4 h-4 ${activeTab === 'addresses' ? 'text-gold-300' : 'text-forest-800'}`} />
              <span>Delivery Addresses ({addresses.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-forest-900 text-gold-300 shadow-md ring-1 ring-gold-500/30'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-gold-300' : 'text-forest-800'}`} />
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

            {/* ==================== ADDRESSES TAB ==================== */}
            {activeTab === 'addresses' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                  <div>
                    <h2 className="font-serif font-bold text-lg text-forest-900">
                      Saved Delivery Addresses
                    </h2>
                    <p className="text-xs text-stone-500">Manage shipping addresses for faster 1-click checkout</p>
                  </div>
                  <button
                    onClick={openNewAddressModal}
                    className="flex items-center gap-1.5 bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Address</span>
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 space-y-4 border-2 border-dashed border-stone-200 rounded-3xl p-6">
                    <div className="w-12 h-12 rounded-2xl bg-forest-50 text-forest-900 flex items-center justify-center mx-auto">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-800">No delivery address saved yet</h3>
                      <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                        Add your home or office address to have your authentic herbal formulations delivered without re-typing.
                      </p>
                    </div>
                    <button
                      onClick={openNewAddressModal}
                      className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add Delivery Address
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => {
                      const isDefault = addr.isDefault;
                      const addrId = addr.id || addr._id || `addr-${idx}`;
                      return (
                        <div
                          key={addrId}
                          className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between ${
                            isDefault
                              ? 'border-forest-900/30 bg-forest-50/40 shadow-xs ring-1 ring-forest-900/10'
                              : 'border-stone-200 bg-white hover:border-stone-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
                                  {addr.label?.toLowerCase() === 'work' ? <Briefcase className="w-3.5 h-3.5" /> : <Home className="w-3.5 h-3.5" />}
                                </span>
                                <h3 className="font-bold text-sm text-forest-950">{addr.label || 'Home'}</h3>
                              </div>

                              {isDefault ? (
                                <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                  <Check className="w-3 h-3" /> Default
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleSetDefaultAddress(addrId)}
                                  className="text-[10px] font-semibold text-stone-500 hover:text-forest-900 underline"
                                >
                                  Set as default
                                </button>
                              )}
                            </div>

                            <p className="text-xs text-stone-700 leading-relaxed font-medium mt-2">
                              {addr.street}
                            </p>
                            <p className="text-xs text-stone-600 mt-0.5">
                              {addr.city}, {addr.state} - <strong className="font-mono text-stone-800">{addr.pincode}</strong>
                            </p>
                            {addr.phone && (
                              <p className="text-[11px] text-stone-500 mt-2 flex items-center gap-1">
                                📞 Phone: <span className="font-semibold text-stone-700">{addr.phone}</span>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-stone-200/60">
                            <button
                              type="button"
                              onClick={() => openEditAddressModal(addr)}
                              className="flex items-center gap-1 text-xs font-bold text-forest-900 hover:bg-forest-50 px-3 py-1.5 rounded-lg border border-stone-200 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteAddress(addrId)}
                              className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-600 hover:text-white px-3 py-1.5 rounded-xl border border-red-300 hover:border-red-600 transition-all shadow-2xs"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
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

      {/* ============ ADD / EDIT ADDRESS MODAL ============ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-200 shadow-2xl space-y-5 animate-fade-in-scale">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-forest-900 text-gold-300 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-forest-950">
                    {editingAddressId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                  </h3>
                  <p className="text-[11px] text-stone-500">Formulation shipments will be routed to this location</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddressModal(false)}
                className="p-1.5 rounded-xl border border-stone-200 text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Address Label</label>
                <div className="flex gap-2">
                  {['Home', 'Office', 'Farmhouse', 'Other'].map(lbl => (
                    <button
                      key={lbl}
                      type="button"
                      onClick={() => setAddressForm({ ...addressForm, label: lbl })}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                        addressForm.label === lbl
                          ? 'bg-forest-900 text-gold-300 border-forest-900 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-600 block mb-1">Street / House / Area *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Door No, Building Name, Street, Landmark"
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coimbatore"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">State *</label>
                  <select
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">Postal PIN Code *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="6 digits (e.g. 641006)"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-600 block mb-1">Delivery Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 bg-stone-50 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isDefaultCheckbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded border-stone-300 text-forest-900 focus:ring-gold-500 h-4 w-4"
                />
                <label htmlFor="isDefaultCheckbox" className="text-xs font-semibold text-stone-700 cursor-pointer">
                  Make this my default shipping address
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-bold text-xs hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressSaving}
                  className="bg-forest-900 hover:bg-forest-950 text-gold-300 font-bold px-6 py-2.5 rounded-xl text-xs transition-colors shadow-md disabled:opacity-50"
                >
                  {addressSaving ? 'Saving...' : (editingAddressId ? 'Save Changes' : 'Save Delivery Address')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
