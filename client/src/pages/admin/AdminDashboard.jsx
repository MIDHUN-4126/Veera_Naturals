import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  TrendingUp, Users, Package, ShoppingCart, AlertTriangle, DollarSign,
  Plus, Edit, Trash2, CheckCircle2, RefreshCw, Search, Shield, ArrowUpRight,
  Database, Filter, Download, Eye, X, FileText, Check, Clock, ChevronRight,
  AlertCircle, Sliders, ArrowDownRight, Printer, Sparkles, Building2, Lock,
  LayoutDashboard, Settings, Tag, Activity, Bell, ChevronLeft, LogOut,
  BarChart3, PieChart as PieChartIcon, Layers, Wallet, Store, Truck,
  UserCheck, Crown, Calendar, Hash, Zap, Globe, Sun, Moon, Menu,
  ChevronsLeft, ChevronsRight, ArrowRight, TrendingDown, Box, Heart, Star
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend, CartesianGrid, LineChart, Line
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

// ============ UTILITY: Animated Counter Hook ============
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ============ UTILITY: Real-time Clock ============
function useRealTimeClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

// ============ UTILITY: Greeting ============
function getGreeting(name) {
  const hour = new Date().getHours();
  const firstName = (name || 'Admin').split(' ')[0];
  if (hour < 12) return `Good Morning, ${firstName}`;
  if (hour < 17) return `Good Afternoon, ${firstName}`;
  return `Good Evening, ${firstName}`;
}

// ============ MINI SPARKLINE COMPONENT ============
function MiniSparkline({ data = [], color = '#C6A45B', height = 32 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 80;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={w} height={height} className="opacity-60">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ============ STORE HEALTH RING ============
function HealthRing({ score = 92, size = 64, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#292524" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-extrabold" style={{ color }}>{score}</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const clock = useRealTimeClock();

  // Sidebar & Navigation
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Timeframe
  const [timeframe, setTimeframe] = useState('all');

  // Management data
  const [productsList, setProductsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [auditLogsList, setAuditLogsList] = useState([]);
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'Veera Naturals',
    taxRatePercent: 5,
    freeShippingThreshold: 499,
    standardShippingFee: 50,
    supportEmail: 'care@veeranaturals.com',
    currency: 'INR',
    currencySymbol: '₹'
  });

  // Filters & search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  // Modals
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'Hair Care', price: '', mrp: '', costPrice: '', stock: 50, volume: '100 ml', description: '', tags: 'bestseller, organic'
  });
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // New coupon form
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(15);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState(500);

  const showNotification = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (!isAdmin) { navigate('/login'); return; }
    fetchDashboardStats();
  }, [isAdmin]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, ordRes, usrRes, cpnRes, auditRes, setRes] = await Promise.all([
        axios.get('/api/admin/bi-dashboard'),
        axios.get('/api/products?limit=100'),
        axios.get('/api/admin/orders'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/coupons'),
        axios.get('/api/admin/audit-logs').catch(() => ({ data: { logs: [] } })),
        axios.get('/api/admin/settings').catch(() => ({ data: { settings: {} } }))
      ]);
      if (dashRes.data.success) setData(dashRes.data);
      if (prodRes.data.success) setProductsList(prodRes.data.products);
      if (ordRes.data.success) setOrdersList(ordRes.data.orders);
      if (usrRes.data.success) setUsersList(usrRes.data.users);
      if (cpnRes.data.success) setCouponsList(cpnRes.data.coupons);
      if (auditRes.data.logs) setAuditLogsList(auditRes.data.logs);
      if (setRes.data.settings) setStoreSettings(prev => ({ ...prev, ...setRes.data.settings }));
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showNotification('Error fetching live data from database');
    } finally {
      setLoading(false);
    }
  };

  // ==================== CSV EXPORT ====================
  const exportToCSV = (filename, rows) => {
    if (!rows || !rows.length) { showNotification('No data available to export'); return; }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent = keys.join(separator) + '\n' +
      rows.map(row => keys.map(k => {
        let cell = row[k] === null || row[k] === undefined ? '' : row[k];
        cell = cell instanceof Date ? cell.toLocaleString() : cell.toString().replace(/"/g, '""');
        if (cell.search(/("|,|\n)/g) >= 0) cell = `"${cell}"`;
        return cell;
      }).join(separator)).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification(`Exported ${filename}.csv successfully`);
  };

  const handleExportOrdersCSV = () => {
    exportToCSV('Veera_Naturals_Orders', ordersList.map(o => ({
      OrderNumber: o.orderNumber, Date: new Date(o.createdAt).toLocaleDateString(),
      Customer: o.userName, Email: o.userEmail, TotalAmount: o.totalAmount,
      FulfillmentStatus: o.fulfillmentStatus, PaymentMethod: o.paymentMethod,
      PaymentStatus: o.paymentStatus, ItemsCount: (o.items || []).reduce((acc, i) => acc + i.quantity, 0)
    })));
  };

  const handleExportProductsCSV = () => {
    exportToCSV('Veera_Naturals_Inventory', productsList.map(p => ({
      SKU: p.sku || '', Title: p.name, Category: p.category,
      PriceINR: p.price, MRPINR: p.mrp || p.price,
      EstimatedCostINR: p.costPrice || Math.round(p.price * 0.35),
      StockUnits: p.stock, Rating: p.rating, ReviewsCount: p.numReviews || 0
    })));
  };

  // ==================== PRODUCT ACTIONS ====================
  const handleOpenCreateProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', category: 'Hair Care', price: '', mrp: '', costPrice: '', stock: 50, volume: '100 ml', description: 'Handcrafted botanical formula enriched with sacred Ayurvedic herbs.', tags: 'organic, handcrafted' });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name, category: prod.category, price: prod.price,
      mrp: prod.mrp || prod.price, costPrice: prod.costPrice || Math.round(prod.price * 0.35),
      stock: prod.stock, volume: prod.volume || '100 ml', description: prod.description,
      tags: Array.isArray(prod.tags) ? prod.tags.join(', ') : (prod.tags || '')
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...productForm, tags: productForm.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editingProduct) {
        const res = await axios.put(`/api/admin/products/${editingProduct.id}`, payload);
        if (res.data.success) showNotification(`Updated product "${res.data.product.name}"`);
      } else {
        const res = await axios.post('/api/admin/products', payload);
        if (res.data.success) showNotification(`Created new product "${res.data.product.name}"`);
      }
      setShowProductModal(false);
      fetchDashboardStats();
    } catch (err) { alert(err.response?.data?.message || 'Failed to save product'); }
  };

  const handleQuickStockAdjust = async (productId, delta, productName) => {
    try {
      const res = await axios.put(`/api/admin/products/${productId}/stock`, { delta, reason: 'Dashboard Quick Restock' });
      if (res.data.success) { showNotification(`Stock adjusted for "${productName}" (${delta > 0 ? `+${delta}` : delta})`); fetchDashboardStats(); }
    } catch (err) { alert('Failed to update stock'); }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the database?`)) return;
    try {
      const res = await axios.delete(`/api/admin/products/${id}`);
      if (res.data.success) { showNotification(`Deleted product "${name}"`); fetchDashboardStats(); }
    } catch (err) { alert('Failed to delete product'); }
  };

  // ==================== ORDER ACTIONS ====================
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(`/api/admin/orders/${orderId}/status`, { fulfillmentStatus: newStatus });
      if (res.data.success) {
        showNotification(`Order status updated to "${newStatus}"`);
        fetchDashboardStats();
        if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
          setSelectedOrderDetails(prev => ({ ...prev, fulfillmentStatus: newStatus }));
        }
      }
    } catch (err) { alert('Failed to update order status'); }
  };

  // ==================== USER ACTIONS ====================
  const handleToggleUserRole = async (userId, currentRole, userName) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role of "${userName}" from ${currentRole} to ${nextRole}?`)) return;
    try {
      const res = await axios.put(`/api/admin/users/${userId}/role`, { role: nextRole });
      if (res.data.success) { showNotification(`User role updated to ${nextRole}`); fetchDashboardStats(); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to update user role'); }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Permanently delete user "${userName}" from the database?`)) return;
    try {
      const res = await axios.delete(`/api/admin/users/${userId}`);
      if (res.data.success) { showNotification(`User "${userName}" deleted`); fetchDashboardStats(); }
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete user'); }
  };

  // ==================== COUPON ACTIONS ====================
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode) return;
    try {
      const res = await axios.post('/api/admin/coupons', { code: newCouponCode, discountPercent: newCouponDiscount, minOrder: newCouponMinOrder });
      if (res.data.success) { showNotification(`Created coupon code "${newCouponCode}"`); setNewCouponCode(''); fetchDashboardStats(); }
    } catch (err) { alert('Failed to create coupon'); }
  };

  const handleDeleteCoupon = async (id, code) => {
    try {
      const res = await axios.delete(`/api/admin/coupons/${id}`);
      if (res.data.success) { showNotification(`Deleted coupon "${code}"`); fetchDashboardStats(); }
    } catch (err) { alert('Failed to delete coupon'); }
  };

  // ==================== SETTINGS ====================
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put('/api/admin/settings', storeSettings);
      if (res.data.success) showNotification('Store configuration saved successfully');
    } catch (err) { alert('Failed to save settings'); }
  };

  // ==================== FILTERED LISTS ====================
  const filteredProducts = useMemo(() => productsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
    const matchesCategory = productCategoryFilter === 'all' || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    const matchesLowStock = !lowStockOnly || p.stock <= (p.lowStockThreshold || 10);
    return matchesSearch && matchesCategory && matchesLowStock;
  }), [productsList, productSearch, productCategoryFilter, lowStockOnly]);

  const filteredOrders = useMemo(() => ordersList.filter(o => {
    const matchesSearch = (o.orderNumber && o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.userName && o.userName.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(orderSearch.toLowerCase()));
    const matchesStatus = orderStatusFilter === 'all' || o.fulfillmentStatus === orderStatusFilter;
    return matchesSearch && matchesStatus;
  }), [ordersList, orderSearch, orderStatusFilter]);

  const filteredUsers = useMemo(() => usersList.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  ), [usersList, userSearch]);

  // ==================== COMPUTED METRICS ====================
  const pendingOrdersCount = ordersList.filter(o => o.fulfillmentStatus === 'pending').length;
  const lowStockCount = productsList.filter(p => p.stock <= (p.lowStockThreshold || 10)).length;
  const totalNotifications = pendingOrdersCount + lowStockCount;

  const storeHealthScore = useMemo(() => {
    let score = 100;
    if (lowStockCount > 3) score -= 15;
    else if (lowStockCount > 0) score -= 5;
    if (pendingOrdersCount > 5) score -= 10;
    else if (pendingOrdersCount > 0) score -= 3;
    const cancelledCount = ordersList.filter(o => o.fulfillmentStatus === 'cancelled').length;
    if (cancelledCount > 2) score -= 10;
    return Math.max(0, Math.min(100, score));
  }, [lowStockCount, pendingOrdersCount, ordersList]);

  // Revenue sparkline data
  const revenueSparkline = useMemo(() => {
    return (data?.charts?.revenueTrend || []).map(m => m.revenue);
  }, [data]);

  const ordersSparkline = useMemo(() => {
    return (data?.charts?.revenueTrend || []).map(m => m.orders);
  }, [data]);

  const CATEGORY_COLORS = ['#123E30', '#C6A45B', '#C4713B', '#3b82f6', '#8b5cf6', '#10b981'];

  // ==================== SIDEBAR NAV CONFIG ====================
  const sidebarItems = [
    { id: 'analytics', label: 'BI Overview', icon: LayoutDashboard, badge: null },
    { id: 'products', label: 'Products', icon: Package, badge: productsList.length },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: ordersList.length },
    { id: 'users', label: 'Customers', icon: Users, badge: usersList.length },
    { id: 'coupons', label: 'Promotions', icon: Tag, badge: couponsList.length },
    { id: 'audit', label: 'Audit Trail', icon: Activity, badge: auditLogsList.length },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null },
  ];

  // Animated counters for KPI
  const animRevenue = useCountUp(data?.kpis?.totalRevenue || 0);
  const animProfit = useCountUp(data?.kpis?.grossProfit || 0);
  const animOrders = useCountUp(data?.kpis?.totalOrdersCount || 0, 800);
  const animCustomers = useCountUp(data?.kpis?.totalCustomers || 0, 800);

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex font-sans selection:bg-gold-500 selection:text-stone-950 admin-scroll">

      {/* ========== TOAST NOTIFICATION ========== */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
          <div className="bg-gradient-to-r from-gold-500 to-gold-600 text-stone-950 font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-gold-300">
            <CheckCircle2 className="w-5 h-5 text-forest-900" />
            <span className="text-sm">{toast}</span>
          </div>
        </div>
      )}

      {/* ========== SIDEBAR ========== */}
      <aside className={`glass-sidebar fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out border-r border-stone-800/60 ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}`}>
        
        {/* Sidebar Header */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-stone-800/60 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-950 to-forest-900 border border-gold-500/40 flex items-center justify-center flex-shrink-0 shadow-md p-1">
            <img src="/images/logo-emblem.png" alt="Veera Naturals" className="h-7 w-7 object-contain drop-shadow" onError={(e) => { e.target.src = '/marketing/image3.png'; }} />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <h1 className="font-serif text-sm font-bold text-gold-400 leading-tight">Veera Naturals</h1>
              <span className="text-[10px] text-stone-500 uppercase tracking-widest font-semibold">Admin Console</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-500/20 to-gold-500/5 text-gold-400 border border-gold-500/20 shadow-lg shadow-gold-500/5'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-gold-500 rounded-r-full" />}
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive ? 'text-gold-400' : 'text-stone-500 group-hover:text-stone-300'}`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== null && item.badge > 0 && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-gold-500/20 text-gold-400' : 'bg-stone-800 text-stone-400'
                  }`}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`px-3 py-4 border-t border-stone-800/60 space-y-2 ${sidebarCollapsed ? 'px-2' : ''}`}>
          {/* Store Health */}
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3 p-3 bg-stone-900/60 rounded-xl border border-stone-800/40 animate-fade-in">
              <HealthRing score={storeHealthScore} size={40} strokeWidth={4} />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Store Health</span>
                <p className="text-xs font-bold text-stone-200">{storeHealthScore >= 80 ? 'Excellent' : storeHealthScore >= 50 ? 'Needs Attention' : 'Critical'}</p>
              </div>
            </div>
          )}
          
          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 py-2 text-stone-500 hover:text-gold-400 transition-colors rounded-lg hover:bg-stone-800/40 text-xs"
          >
            {sidebarCollapsed ? <ChevronsRight className="w-4 h-4" /> : <><ChevronsLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-64'}`}>
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800/50 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Page Title & Breadcrumb */}
            <div className="flex items-center gap-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-100">
                  {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-stone-500">
                  <span>Admin</span>
                  <ChevronRight className="w-3 h-3" />
                  <span className="text-gold-400">{sidebarItems.find(i => i.id === activeTab)?.label}</span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Live Status */}
              <div className="hidden md:flex items-center gap-2 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Database className="w-3 h-3 text-emerald-400" />
                <span className="text-stone-400">Database: <strong className="text-emerald-400">Live</strong></span>
              </div>

              {/* Clock */}
              <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-900/60 px-3 py-1.5 rounded-xl border border-stone-800">
                <Clock className="w-3 h-3 text-gold-400" />
                <span>{clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-xl transition-colors border ${totalNotifications > 0 ? 'bg-amber-950/30 border-amber-800/50 text-amber-400' : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200'}`}
                >
                  <Bell className="w-4 h-4" />
                  {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {totalNotifications}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in-scale">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-stone-100">Notifications</h4>
                      <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-stone-500" /></button>
                    </div>
                    {pendingOrdersCount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-amber-950/20 rounded-xl border border-amber-800/30">
                        <ShoppingCart className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-stone-200">{pendingOrdersCount} Pending Orders</p>
                          <p className="text-[11px] text-stone-400">Orders awaiting fulfillment</p>
                        </div>
                      </div>
                    )}
                    {lowStockCount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-red-950/20 rounded-xl border border-red-800/30">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-stone-200">{lowStockCount} Low Stock Items</p>
                          <p className="text-[11px] text-stone-400">Products below reorder threshold</p>
                        </div>
                      </div>
                    )}
                    {totalNotifications === 0 && (
                      <p className="text-xs text-stone-500 text-center py-4">All clear! No pending alerts.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Export Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-1.5 bg-stone-900/60 hover:bg-stone-800 text-stone-300 text-[11px] font-semibold px-3 py-2 rounded-xl border border-stone-800 transition-colors">
                  <Download className="w-3.5 h-3.5 text-gold-400" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl py-1 hidden group-hover:block z-50">
                  <button onClick={handleExportOrdersCSV} className="w-full text-left px-3.5 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-gold-400 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Export Orders (CSV)
                  </button>
                  <button onClick={handleExportProductsCSV} className="w-full text-left px-3.5 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-gold-400 flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" /> Export Inventory (CSV)
                  </button>
                </div>
              </div>

              {/* Refresh */}
              <button onClick={fetchDashboardStats} className="p-2 bg-stone-900/60 hover:bg-stone-800 rounded-xl border border-stone-800 text-stone-400 hover:text-gold-400 transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-400' : ''}`} />
              </button>

              {/* Admin Avatar */}
              <div className="flex items-center gap-2 pl-3 border-l border-stone-800">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-stone-950 font-bold text-xs">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                {!sidebarCollapsed && (
                  <div className="hidden md:block">
                    <p className="text-xs font-bold text-stone-200 leading-tight">{user?.name || 'Admin'}</p>
                    <p className="text-[10px] text-gold-500 font-semibold">Administrator</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ========== MAIN CONTENT AREA ========== */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">

          {/* Greeting Bar (only on analytics) */}
          {activeTab === 'analytics' && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
              <div>
                <h2 className="font-serif text-2xl font-bold text-stone-100">{getGreeting(user?.name)}</h2>
                <p className="text-sm text-stone-400 mt-0.5">
                  Here's what's happening with your store today — <span className="text-gold-400 font-semibold">{clock.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/shop')} className="flex items-center gap-2 bg-forest-900 hover:bg-forest-800 text-gold-400 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors border border-forest-700 shadow-sm">
                  <Store className="w-4 h-4" /> View Storefront
                </button>
              </div>
            </div>
          )}

          {/* ==================== TAB 1: EXECUTIVE BI OVERVIEW ==================== */}
          {activeTab === 'analytics' && data && (
            <div className="space-y-6 animate-fade-in">

              {/* Timeframe Filter */}
              <div className="flex items-center gap-2 bg-stone-900/40 p-1 rounded-xl border border-stone-800/60 text-xs w-fit">
                {['7days', '30days', 'quarter', 'all'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-3.5 py-1.5 rounded-lg font-bold capitalize transition-all duration-200 ${
                      timeframe === t ? 'bg-gold-500 text-stone-950 shadow-md' : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40'
                    }`}
                  >
                    {t === '7days' ? 'Last 7D' : t === '30days' ? 'Last 30D' : t === 'quarter' ? 'Quarter' : 'All Time'}
                  </button>
                ))}
              </div>

              {/* KPI Cards Grid — Premium Animated */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Revenue */}
                <div className="glass-card rounded-2xl p-5 hover-lift animate-fade-in-scale delay-1 group">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Total Revenue</span>
                      <h3 className="font-serif text-2xl font-extrabold text-gold-400 mt-1">
                        ₹{animRevenue.toLocaleString('en-IN')}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="flex items-center gap-0.5 text-[11px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3" /> {data.kpis?.revenueGrowth || '+14.8%'}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-500/5 border border-gold-500/20 flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <MiniSparkline data={revenueSparkline} color="#C6A45B" />
                    </div>
                  </div>
                </div>

                {/* Gross Profit */}
                <div className="glass-card rounded-2xl p-5 hover-lift animate-fade-in-scale delay-2 group">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Gross Profit</span>
                      <h3 className="font-serif text-2xl font-extrabold text-emerald-400 mt-1">
                        ₹{animProfit.toLocaleString('en-IN')}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="flex items-center gap-0.5 text-[11px] text-gold-300 font-bold bg-gold-500/10 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> Margin: {data.kpis?.profitMarginPercent || 65}%
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="glass-card rounded-2xl p-5 hover-lift animate-fade-in-scale delay-3 group">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Order Volume</span>
                      <h3 className="font-serif text-2xl font-extrabold text-stone-100 mt-1">
                        {animOrders}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-stone-400 font-medium">
                          AOV: <strong className="text-stone-200">₹{data.kpis?.avgOrderValue || 0}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <MiniSparkline data={ordersSparkline} color="#3b82f6" />
                    </div>
                  </div>
                </div>

                {/* Customers */}
                <div className="glass-card rounded-2xl p-5 hover-lift animate-fade-in-scale delay-4 group">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] text-stone-400 font-medium uppercase tracking-wider">Customers</span>
                      <h3 className="font-serif text-2xl font-extrabold text-stone-100 mt-1">
                        {animCustomers}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-purple-300 font-medium">
                          Repeat: <strong>{data.kpis?.repeatRate || '25%'}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary KPI Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-4 hover-lift animate-fade-in delay-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center text-gold-400"><Wallet className="w-4 h-4" /></div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold">Inventory Value</span>
                    <p className="text-sm font-extrabold text-stone-100">₹{(data.kpis?.totalInventoryValue || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4 hover-lift animate-fade-in delay-6 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-950/40 flex items-center justify-center text-amber-400"><AlertTriangle className="w-4 h-4" /></div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold">Low Stock</span>
                    <p className="text-sm font-extrabold text-amber-400">{data.kpis?.lowStockCount || 0} SKUs</p>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4 hover-lift animate-fade-in delay-7 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-forest-950 flex items-center justify-center text-forest-300"><Box className="w-4 h-4" /></div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold">Product Lines</span>
                    <p className="text-sm font-extrabold text-stone-100">{data.kpis?.totalProductsCount || 0}</p>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4 hover-lift animate-fade-in delay-8 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-950/40 flex items-center justify-center text-emerald-400"><CheckCircle2 className="w-4 h-4" /></div>
                  <div>
                    <span className="text-[10px] text-stone-500 uppercase font-bold">Operations</span>
                    <p className="text-sm font-extrabold text-emerald-400">Optimal</p>
                  </div>
                </div>
              </div>

              {/* Charts Row 1: Revenue + Category */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue & Profit Area Chart */}
                <div className="lg:col-span-8 glass-card p-6 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-100">Revenue & Profit Dynamics</h3>
                      <p className="text-[11px] text-stone-500">Monthly trend analysis</p>
                    </div>
                    <div className="flex items-center gap-4 text-[11px]">
                      <span className="flex items-center gap-1.5 text-gold-400 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-gold-500" /> Revenue</span>
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Profit</span>
                    </div>
                  </div>
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.charts?.revenueTrend || []}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C6A45B" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#C6A45B" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.7}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                        <XAxis dataKey="month" stroke="#78716c" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#78716c" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0c0a09', borderColor: '#292524', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }} formatter={(val) => [`₹${val.toLocaleString()}`, '']} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#C6A45B" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Category Sales Donut */}
                <div className="lg:col-span-4 glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between animate-fade-in">
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-100">Revenue by Category</h3>
                    <p className="text-[11px] text-stone-500">Sales distribution</p>
                  </div>
                  <div className="h-48 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.charts?.categoryBreakdown || []} dataKey="sales" nameKey="category" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5}>
                          {(data.charts?.categoryBreakdown || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#0c0a09', borderColor: '#292524', borderRadius: '12px' }} formatter={(val) => [`₹${val.toLocaleString()}`, 'Sales']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-stone-800 text-xs">
                    {(data.charts?.categoryBreakdown || []).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                          <span className="text-stone-400">{item.category}</span>
                        </div>
                        <span className="font-bold text-stone-200">₹{item.sales.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Charts Row 2: Payment + Fulfillment Pipeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="glass-card p-6 rounded-2xl space-y-4 animate-fade-in">
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-100">Payment Gateway Distribution</h3>
                    <p className="text-[11px] text-stone-500">Volume processed by channel</p>
                  </div>
                  <div className="h-52 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.charts?.paymentMethodsBreakdown || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                        <XAxis dataKey="method" stroke="#78716c" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#78716c" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#0c0a09', borderColor: '#292524', borderRadius: '12px' }} formatter={(val) => [`₹${val}`, 'Volume']} />
                        <Bar dataKey="amount" fill="#C6A45B" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Fulfillment Pipeline */}
                <div className="glass-card p-6 rounded-2xl space-y-4 animate-fade-in">
                  <div>
                    <h3 className="font-serif font-bold text-base text-stone-100">Fulfillment Pipeline</h3>
                    <p className="text-[11px] text-stone-500">Real-time order status breakdown</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      { label: 'Delivered', count: data.charts?.statusCounts?.delivered || 0, color: 'text-emerald-400 border-emerald-800/50 bg-emerald-950/30', icon: CheckCircle2 },
                      { label: 'Shipped', count: data.charts?.statusCounts?.shipped || 0, color: 'text-blue-400 border-blue-800/50 bg-blue-950/30', icon: Truck },
                      { label: 'Processing', count: data.charts?.statusCounts?.processing || 0, color: 'text-amber-400 border-amber-800/50 bg-amber-950/30', icon: RefreshCw },
                      { label: 'Pending', count: data.charts?.statusCounts?.pending || 0, color: 'text-purple-400 border-purple-800/50 bg-purple-950/30', icon: Clock },
                      { label: 'Cancelled', count: data.charts?.statusCounts?.cancelled || 0, color: 'text-red-400 border-red-800/50 bg-red-950/30', icon: X }
                    ].map((s, idx) => {
                      const Icon = s.icon;
                      return (
                        <div key={idx} className={`p-4 rounded-xl border text-center ${s.color} hover-lift`}>
                          <Icon className="w-4 h-4 mx-auto mb-1.5 opacity-60" />
                          <span className="text-xl font-extrabold block">{s.count}</span>
                          <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-70">{s.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Top Products & Low Stock */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products Leaderboard */}
                <div className="glass-card p-6 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-base text-stone-100">Top Sellers</h3>
                      <p className="text-[11px] text-stone-500">Best performing formulations</p>
                    </div>
                    <button onClick={() => setActiveTab('products')} className="text-[11px] font-bold text-gold-400 hover:underline flex items-center gap-1">
                      View All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(data.topProducts || []).map((p, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-stone-900/40 border border-stone-800/30 hover:bg-stone-900/60 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${i === 0 ? 'bg-gold-500/20 text-gold-400' : i === 1 ? 'bg-stone-700 text-stone-300' : 'bg-stone-800 text-stone-500'}`}>
                            {i === 0 ? <Crown className="w-3.5 h-3.5" /> : `#${i + 1}`}
                          </span>
                          <img src={p.image || '/marketing/IMG-20260804-WA0013.jpg'} alt="" className="w-9 h-9 rounded-lg object-cover bg-stone-800" />
                          <div>
                            <p className="text-xs font-bold text-stone-100 line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-stone-500">{p.unitsSold} units sold</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gold-400">₹{p.revenue?.toLocaleString?.() || p.revenue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="glass-card p-6 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <div>
                        <h3 className="font-serif font-bold text-base text-stone-100">Low Stock Alerts</h3>
                        <p className="text-[11px] text-stone-500">Items below reorder threshold</p>
                      </div>
                    </div>
                    <button onClick={() => { setActiveTab('products'); setLowStockOnly(true); }} className="text-[11px] font-bold text-gold-400 hover:underline flex items-center gap-1">
                      Manage <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(data.lowStockAlerts || []).length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-60" />
                        <p className="text-xs text-stone-400">All items well stocked!</p>
                      </div>
                    ) : (data.lowStockAlerts || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-950/10 border border-amber-800/20 hover:bg-amber-950/20 transition-colors">
                        <div>
                          <p className="text-xs font-bold text-stone-200">{item.name}</p>
                          <p className="text-[10px] text-stone-500">SKU: {item.sku} • Stock: <span className="text-red-400 font-bold">{item.stock}</span></p>
                        </div>
                        <button
                          onClick={() => handleQuickStockAdjust(item.id, 10, item.name)}
                          className="text-[10px] bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 font-bold px-2.5 py-1.5 rounded-lg border border-emerald-700/40 transition-colors"
                        >
                          +10 Restock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card rounded-2xl p-5 animate-fade-in">
                <h3 className="text-xs font-bold uppercase text-stone-500 tracking-wider mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button onClick={() => { setActiveTab('products'); handleOpenCreateProduct(); }} className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-800/40 border border-stone-700/40 hover:bg-forest-900/30 hover:border-forest-700/40 transition-all text-sm text-stone-300 hover:text-gold-400 group">
                    <div className="w-8 h-8 rounded-lg bg-forest-900/40 flex items-center justify-center group-hover:bg-forest-900"><Plus className="w-4 h-4 text-forest-300" /></div>
                    <span className="text-xs font-semibold">New Product</span>
                  </button>
                  <button onClick={() => setActiveTab('orders')} className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-800/40 border border-stone-700/40 hover:bg-blue-950/30 hover:border-blue-800/40 transition-all text-sm text-stone-300 hover:text-blue-400 group">
                    <div className="w-8 h-8 rounded-lg bg-blue-950/40 flex items-center justify-center group-hover:bg-blue-950"><Truck className="w-4 h-4 text-blue-300" /></div>
                    <span className="text-xs font-semibold">Manage Orders</span>
                  </button>
                  <button onClick={() => setActiveTab('coupons')} className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-800/40 border border-stone-700/40 hover:bg-purple-950/30 hover:border-purple-800/40 transition-all text-sm text-stone-300 hover:text-purple-400 group">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/40 flex items-center justify-center group-hover:bg-purple-950"><Tag className="w-4 h-4 text-purple-300" /></div>
                    <span className="text-xs font-semibold">Create Coupon</span>
                  </button>
                  <button onClick={() => setActiveTab('users')} className="flex items-center gap-2.5 p-3 rounded-xl bg-stone-800/40 border border-stone-700/40 hover:bg-gold-500/5 hover:border-gold-500/20 transition-all text-sm text-stone-300 hover:text-gold-400 group">
                    <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20"><Users className="w-4 h-4 text-gold-400" /></div>
                    <span className="text-xs font-semibold">View Customers</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ==================== TAB 2: PRODUCTS ==================== */}
          {activeTab === 'products' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-100">Products & Inventory</h2>
                  <p className="text-xs text-stone-500">Create, update, and manage all botanical formulations</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportProductsCSV} className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 bg-stone-800 hover:bg-stone-700 px-3 py-2 rounded-xl border border-stone-700 transition-colors">
                    <Download className="w-3.5 h-3.5 text-gold-400" /> Export CSV
                  </button>
                  <button onClick={handleOpenCreateProduct} className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-stone-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all hover:shadow-lg">
                    <Plus className="w-4 h-4" /> New Product
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input type="text" placeholder="Search products by name or SKU..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-stone-900/60 border border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <select value={productCategoryFilter} onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="bg-stone-900/60 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none focus:border-gold-500/50">
                  <option value="all">All Categories</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Body Care">Body Care</option>
                  <option value="Essential Oils">Essential Oils</option>
                </select>
                <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer bg-stone-900/40 px-3 py-2.5 rounded-xl border border-stone-800">
                  <input type="checkbox" checked={lowStockOnly} onChange={() => setLowStockOnly(!lowStockOnly)} className="accent-amber-500" />
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Low Stock Only
                </label>
              </div>

              {/* Products Table */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-900/60 border-b border-stone-800">
                        <th className="text-left px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Product</th>
                        <th className="text-left px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Category</th>
                        <th className="text-right px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Price</th>
                        <th className="text-right px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Stock</th>
                        <th className="text-right px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Rating</th>
                        <th className="text-center px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img src={p.image || '/marketing/IMG-20260804-WA0013.jpg'} alt="" className="w-8 h-8 rounded-lg object-cover bg-stone-800" />
                              <div>
                                <p className="font-bold text-stone-100 line-clamp-1">{p.name}</p>
                                <p className="text-[10px] text-stone-500">{p.sku || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-stone-800 text-stone-300 text-[10px] font-bold px-2 py-1 rounded-lg">{p.category}</span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-stone-100">₹{p.price}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold ${p.stock <= (p.lowStockThreshold || 10) ? 'text-red-400' : p.stock <= 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {p.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="flex items-center gap-1 justify-end text-gold-400">
                              <Star className="w-3 h-3 fill-current" /> {p.rating || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button onClick={() => handleQuickStockAdjust(p.id, 10, p.name)} className="p-1.5 rounded-lg bg-emerald-900/40 text-emerald-300 hover:bg-emerald-800 transition-colors" title="+10 Stock">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleOpenEditProduct(p)} className="p-1.5 rounded-lg bg-blue-900/40 text-blue-300 hover:bg-blue-800 transition-colors" title="Edit">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDeleteProduct(p.id, p.name)} className="p-1.5 rounded-lg bg-red-900/40 text-red-300 hover:bg-red-800 transition-colors" title="Delete">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 text-stone-500 text-sm">No products found matching your filters.</div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 3: ORDERS ==================== */}
          {activeTab === 'orders' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-100">Order Fulfillment</h2>
                  <p className="text-xs text-stone-500">Track and manage all customer orders</p>
                </div>
                <button onClick={handleExportOrdersCSV} className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 bg-stone-800 hover:bg-stone-700 px-3 py-2 rounded-xl border border-stone-700 transition-colors">
                  <Download className="w-3.5 h-3.5 text-gold-400" /> Export CSV
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                  <input type="text" placeholder="Search by order #, customer name or email..." value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-stone-900/60 border border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-gold-500/50 transition-colors" />
                </div>
                <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-stone-900/60 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-300 focus:outline-none focus:border-gold-500/50">
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {filteredOrders.map((o) => {
                  const statusColors = {
                    pending: 'text-purple-400 bg-purple-950/30 border-purple-800/30',
                    processing: 'text-amber-400 bg-amber-950/30 border-amber-800/30',
                    shipped: 'text-blue-400 bg-blue-950/30 border-blue-800/30',
                    delivered: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/30',
                    cancelled: 'text-red-400 bg-red-950/30 border-red-800/30'
                  };
                  return (
                    <div key={o.id} className="glass-card rounded-xl p-4 hover:bg-stone-800/20 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-stone-800 flex items-center justify-center text-stone-400">
                            <Hash className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-stone-100">{o.orderNumber || o.id?.slice(-8)}</p>
                            <p className="text-[10px] text-stone-500">{o.userName} • {o.userEmail}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-gold-400">₹{o.totalAmount}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusColors[o.fulfillmentStatus] || ''}`}>
                            {o.fulfillmentStatus?.charAt(0).toUpperCase() + o.fulfillmentStatus?.slice(1)}
                          </span>
                          <span className="text-[10px] text-stone-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].filter(s => s !== o.fulfillmentStatus).map(status => (
                            <button key={status} onClick={() => handleUpdateOrderStatus(o.id, status)}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-stone-800/60 text-stone-400 hover:text-stone-200 border border-stone-700/40 hover:bg-stone-800 transition-colors capitalize">
                              → {status}
                            </button>
                          ))}
                          <button onClick={() => setSelectedOrderDetails(o)} className="p-1.5 rounded-lg bg-stone-800/60 text-stone-400 hover:text-gold-400 border border-stone-700/40 hover:bg-stone-800 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-12 text-stone-500 text-sm">No orders found.</div>
                )}
              </div>
            </div>
          )}

          {/* ==================== TAB 4: CUSTOMERS CRM ==================== */}
          {activeTab === 'users' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-stone-100">Customer CRM</h2>
                  <p className="text-xs text-stone-500">Manage users, roles, and access control</p>
                </div>
              </div>
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
                <input type="text" placeholder="Search by name or email..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-stone-900/60 border border-stone-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-gold-500/50 transition-colors" />
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-stone-900/60 border-b border-stone-800">
                      <th className="text-left px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Email</th>
                      <th className="text-center px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Role</th>
                      <th className="text-left px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Joined</th>
                      <th className="text-center px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/20 flex items-center justify-center text-gold-400 text-[10px] font-bold">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-stone-100">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-stone-400">{u.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.role === 'admin' ? 'bg-gold-500/20 text-gold-400 border border-gold-500/20' : 'bg-stone-800 text-stone-400 border border-stone-700'}`}>
                            {u.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-stone-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button onClick={() => handleToggleUserRole(u.id, u.role, u.name)}
                              className="text-[10px] font-bold px-2 py-1 rounded-lg bg-stone-800/60 text-stone-400 hover:text-gold-400 border border-stone-700/40 hover:bg-stone-800 transition-colors">
                              {u.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                            <button onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 rounded-lg bg-red-900/40 text-red-300 hover:bg-red-800 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div className="text-center py-12 text-stone-500 text-sm">No users found.</div>}
              </div>
            </div>
          )}

          {/* ==================== TAB 5: COUPONS ==================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-serif text-xl font-bold text-stone-100">Promotions & Coupons</h2>

              {/* Create Coupon */}
              <form onSubmit={handleCreateCoupon} className="glass-card rounded-2xl p-5">
                <h3 className="text-xs font-bold uppercase text-stone-500 tracking-wider mb-4">Create New Promotion</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Code</label>
                    <input type="text" required value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE20"
                      className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Discount %</label>
                    <input type="number" required min="1" max="100" value={newCouponDiscount} onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                      className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Min Order (₹)</label>
                    <input type="number" required value={newCouponMinOrder} onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                      className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
                  </div>
                </div>
                <button type="submit" className="mt-4 bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all">
                  <Plus className="w-4 h-4 inline mr-1" /> Publish Coupon
                </button>
              </form>

              {/* Coupons List */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-stone-900/60 border-b border-stone-800">
                      <th className="text-left px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Code</th>
                      <th className="text-right px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Discount</th>
                      <th className="text-right px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Min Order</th>
                      <th className="text-center px-4 py-3 text-stone-500 font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponsList.map(c => (
                      <tr key={c.id} className="border-b border-stone-800/40 hover:bg-stone-800/20 transition-colors">
                        <td className="px-4 py-3 font-bold text-gold-400">{c.code}</td>
                        <td className="px-4 py-3 text-right text-stone-100">{c.discountPercent}% OFF</td>
                        <td className="px-4 py-3 text-right text-stone-400">₹{c.minOrder}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => handleDeleteCoupon(c.id, c.code)} className="p-1.5 rounded-lg bg-red-900/40 text-red-300 hover:bg-red-800 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {couponsList.length === 0 && <div className="text-center py-12 text-stone-500 text-sm">No coupons created yet.</div>}
              </div>
            </div>
          )}

          {/* ==================== TAB 6: AUDIT TRAIL ==================== */}
          {activeTab === 'audit' && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-serif text-xl font-bold text-stone-100">Live Audit Trail</h2>
              <div className="space-y-2">
                {auditLogsList.length === 0 ? (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <Activity className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                    <p className="text-sm text-stone-500">No audit entries recorded yet.</p>
                  </div>
                ) : auditLogsList.map((log, idx) => (
                  <div key={idx} className="glass-card rounded-xl p-3.5 flex items-start gap-3 hover:bg-stone-800/20 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center text-stone-400 mt-0.5 flex-shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-200">{log.action}</p>
                      <p className="text-[10px] text-stone-500 mt-0.5">
                        {log.adminName || 'System'} • {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================== TAB 7: SETTINGS ==================== */}
          {activeTab === 'settings' && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="font-serif text-xl font-bold text-stone-100">Store Configuration</h2>
              <form onSubmit={handleSaveSettings} className="glass-card rounded-2xl p-6 space-y-5 max-w-2xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Store Name', key: 'storeName', type: 'text' },
                    { label: 'Support Email', key: 'supportEmail', type: 'email' },
                    { label: 'Tax Rate (%)', key: 'taxRatePercent', type: 'number' },
                    { label: 'Free Shipping Threshold (₹)', key: 'freeShippingThreshold', type: 'number' },
                    { label: 'Standard Shipping Fee (₹)', key: 'standardShippingFee', type: 'number' },
                    { label: 'Currency Symbol', key: 'currencySymbol', type: 'text' }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">{field.label}</label>
                      <input type={field.type} value={storeSettings[field.key]}
                        onChange={(e) => setStoreSettings({ ...storeSettings, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                        className="w-full bg-stone-900/60 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
                    </div>
                  ))}
                </div>
                <button type="submit" className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all">
                  <Check className="w-4 h-4 inline mr-1" /> Save Configuration
                </button>
              </form>
            </div>
          )}

        </main>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-stone-800/40 text-center">
          <p className="text-[10px] text-stone-600">
            © 2026 Veera Naturals — Admin BI Dashboard • Powered by Live Database Engine
          </p>
        </footer>
      </div>

      {/* ========== ORDER DETAIL MODAL ========== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedOrderDetails(null)}>
          <div className="bg-stone-900 rounded-2xl border border-stone-700 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-fade-in-scale max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-stone-100">Order Details</h3>
              <button onClick={() => setSelectedOrderDetails(null)} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-stone-500">Order #</span><span className="font-bold text-stone-100">{selectedOrderDetails.orderNumber}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Customer</span><span className="text-stone-200">{selectedOrderDetails.userName}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Email</span><span className="text-stone-200">{selectedOrderDetails.userEmail}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Total</span><span className="font-bold text-gold-400">₹{selectedOrderDetails.totalAmount}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Payment</span><span className="text-stone-200">{selectedOrderDetails.paymentMethod}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Status</span><span className="font-bold capitalize text-stone-200">{selectedOrderDetails.fulfillmentStatus}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Date</span><span className="text-stone-200">{new Date(selectedOrderDetails.createdAt).toLocaleString()}</span></div>
            </div>
            {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 && (
              <div className="pt-3 border-t border-stone-800">
                <h4 className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider">Items</h4>
                {selectedOrderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-800/30 last:border-0">
                    <div className="text-xs text-stone-200">{item.name} × {item.quantity}</div>
                    <div className="text-xs font-bold text-stone-100">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== PRODUCT MODAL ========== */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4" onClick={() => setShowProductModal(false)}>
          <div className="bg-stone-900 rounded-2xl border border-stone-700 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-fade-in-scale max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-stone-100">{editingProduct ? 'Edit Product' : 'Create New Product'}</h3>
              <button onClick={() => setShowProductModal(false)} className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Product Name</label>
                <input type="text" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Bhringraj Hair Elixir" className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Category</label>
                  <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50">
                    <option>Hair Care</option><option>Skin Care</option><option>Body Care</option><option>Essential Oils</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Volume</label>
                  <input type="text" value={productForm.volume} onChange={(e) => setProductForm({ ...productForm, volume: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Selling Price (₹)</label>
                  <input type="number" required value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">MRP (₹)</label>
                  <input type="number" value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Stock</label>
                  <input type="number" required value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Cost Price (₹)</label>
                <input type="number" value={productForm.costPrice} onChange={(e) => setProductForm({ ...productForm, costPrice: e.target.value })}
                  placeholder="For margin analysis" className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Tags</label>
                <input type="text" value={productForm.tags} onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                  placeholder="bestseller, organic, 100% natural" className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Description</label>
                <textarea rows={3} value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-stone-800 border border-stone-700 rounded-xl p-3 text-xs text-stone-100 focus:outline-none focus:border-gold-500/50" />
              </div>
              <div className="flex justify-end gap-3 pt-2 border-t border-stone-800">
                <button type="button" onClick={() => setShowProductModal(false)} className="bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all">{editingProduct ? 'Save Updates' : 'Publish Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
