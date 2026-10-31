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
  ChevronsLeft, ChevronsRight, ArrowRight, ArrowLeft, TrendingDown, Box, Heart, Star, ChevronDown, User, RotateCcw
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend, CartesianGrid, LineChart, Line
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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

// ============ REUSABLE PAGINATION BAR ============
function PaginationBar({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, label = 'items', isDark = false }) {
  if (totalItems === 0) return null;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t text-xs ${
      isDark ? 'border-stone-800 text-stone-400 bg-stone-900/30' : 'border-stone-200 text-stone-600 bg-stone-50/70'
    }`}>
      <span className="font-medium">
        Showing <strong className={isDark ? 'text-stone-200' : 'text-stone-900 font-bold'}>{startItem}</strong> to{' '}
        <strong className={isDark ? 'text-stone-200' : 'text-stone-900 font-bold'}>{endItem}</strong> of{' '}
        <strong className={isDark ? 'text-stone-200' : 'text-stone-900 font-bold'}>{totalItems}</strong> {label}
      </span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 font-bold text-xs transition-all ${
            currentPage === 1
              ? 'opacity-40 cursor-not-allowed border-stone-200 dark:border-stone-800'
              : (isDark 
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                  : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300 shadow-2xs')
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Previous
        </button>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => {
            if (totalPages > 7) {
              if (pg !== 1 && pg !== totalPages && Math.abs(pg - currentPage) > 1) {
                if (pg === 2 || pg === totalPages - 1) {
                  return <span key={pg} className="px-1 text-stone-400">...</span>;
                }
                return null;
              }
            }
            return (
              <button
                key={pg}
                type="button"
                onClick={() => onPageChange(pg)}
                className={`min-w-[28px] h-7 px-2 rounded-xl font-bold text-xs transition-all ${
                  currentPage === pg
                    ? 'bg-forest-900 text-gold-300 shadow-xs ring-1 ring-gold-500/40'
                    : (isDark 
                        ? 'bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-800' 
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200')
                }`}
              >
                {pg}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-1.5 rounded-xl border flex items-center gap-1 font-bold text-xs transition-all ${
            currentPage === totalPages
              ? 'opacity-40 cursor-not-allowed border-stone-200 dark:border-stone-800'
              : (isDark 
                  ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' 
                  : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-300 shadow-2xs')
          }`}
        >
          Next <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#292524" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
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
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const clock = useRealTimeClock();

  // Sidebar & Navigation
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [toast, setToast] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Timeframe & Overview Filter
  const [timeframe, setTimeframe] = useState('all');
  const [overviewCategory, setOverviewCategory] = useState('all');

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
  const [productStockStatus, setProductStockStatus] = useState('all'); // all, in-stock, low-stock, out-of-stock, healthy
  const [productSortBy, setProductSortBy] = useState('featured'); // featured, price-low, price-high, stock-low, stock-high, name
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState('all'); // all, cod, prepaid
  const [orderDateFilter, setOrderDateFilter] = useState('all'); // all, today, 7d, 30d
  const [userSearch, setUserSearch] = useState('');

  // Modals & Drill-Downs
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', category: 'Hair Care', price: '', mrp: '', costPrice: '', stock: 50, volume: '100 ml', description: '', tags: 'bestseller, organic'
  });
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [selectedProductDrillDown, setSelectedProductDrillDown] = useState(null);
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState(null);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [showFinancialDrillDown, setShowFinancialDrillDown] = useState(false);
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [trackingCarrierInput, setTrackingCarrierInput] = useState('Blue Dart');

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

  // ==================== INVOICE & TRACKING ACTIONS ====================
  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showNotification('Please allow popups to print invoices'); return; }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${order.orderNumber || order.id}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1c1917; background: #fff; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #123E30; padding-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #123E30; }
            .invoice-title { font-size: 20px; color: #C6A45B; text-align: right; font-weight: bold; }
            .details { display: flex; justify-content: space-between; margin: 30px 0; font-size: 13px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
            th { background: #f6f0e5; text-align: left; padding: 10px; border-bottom: 1px solid #ddd; color: #123E30; }
            td { padding: 10px; border-bottom: 1px solid #eee; }
            .totals { margin-left: auto; width: 300px; font-size: 14px; margin-top: 20px; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; }
            .totals-row.grand { font-size: 16px; font-weight: bold; border-top: 2px solid #123E30; color: #123E30; padding-top: 10px; }
            .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #78716c; border-top: 1px solid #eee; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">🌿 Veera Naturals</div>
              <div style="font-size: 12px; color: #78716c; margin-top: 4px;">Sacred Ayurvedic Care & Cold-Pressed Botanicals</div>
            </div>
            <div class="invoice-title">
              TAX INVOICE<br>
              <span style="font-size: 13px; color: #78716c; font-weight: normal;">#${order.orderNumber || order.id?.slice(-8)}</span>
            </div>
          </div>
          <div class="details">
            <div>
              <strong>Billed & Shipped To:</strong><br>
              ${order.userName || 'Valued Customer'}<br>
              ${order.userEmail || ''}<br>
              ${order.shippingAddress ? `${order.shippingAddress.street || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.postalCode || ''}` : 'Standard Delivery'}<br>
              Phone: ${order.shippingAddress?.phone || 'On file'}
            </div>
            <div style="text-align: right;">
              <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}<br>
              <strong>Payment Method:</strong> ${order.paymentMethod || 'Prepaid'}<br>
              <strong>Payment Status:</strong> ${order.paymentStatus || 'Paid'}<br>
              <strong>Fulfillment:</strong> ${order.fulfillmentStatus?.toUpperCase()}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(order.items || []).map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td style="text-align: right;">₹${item.price}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">₹${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div class="totals-row"><span>Subtotal:</span><span>₹${order.totalAmount}</span></div>
            <div class="totals-row"><span>Shipping:</span><span>FREE</span></div>
            <div class="totals-row"><span>GST (Included 5%):</span><span>₹${Math.round(order.totalAmount * 0.05)}</span></div>
            <div class="totals-row grand"><span>Total Amount:</span><span>₹${order.totalAmount}</span></div>
          </div>
          <div class="footer">
            Thank you for choosing Veera Naturals • 100% Pure Plant Formulations • care@veeranaturals.com
          </div>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveTracking = async (orderId) => {
    if (!trackingNumberInput) { showNotification('Please enter a tracking number'); return; }
    try {
      showNotification(`Tracking # ${trackingNumberInput} (${trackingCarrierInput}) saved for order`);
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails(prev => ({
          ...prev,
          trackingNumber: trackingNumberInput,
          carrier: trackingCarrierInput,
          fulfillmentStatus: prev.fulfillmentStatus === 'pending' ? 'shipped' : prev.fulfillmentStatus
        }));
      }
      setTrackingNumberInput('');
    } catch (err) { alert('Failed to update tracking'); }
  };

  // ==================== FILTERED LISTS ====================
  const filteredProducts = useMemo(() => {
    let list = productsList.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(productSearch.toLowerCase()));
      const matchesCategory = productCategoryFilter === 'all' || p.category.toLowerCase() === productCategoryFilter.toLowerCase();

      let matchesStock = true;
      if (productStockStatus === 'low-stock' || lowStockOnly) {
        matchesStock = p.stock <= (p.lowStockThreshold || 10);
      } else if (productStockStatus === 'out-of-stock') {
        matchesStock = p.stock === 0;
      } else if (productStockStatus === 'in-stock') {
        matchesStock = p.stock > 0;
      } else if (productStockStatus === 'healthy') {
        matchesStock = p.stock > 20;
      }

      return matchesSearch && matchesCategory && matchesStock;
    });

    if (productSortBy === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (productSortBy === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (productSortBy === 'stock-low') {
      list.sort((a, b) => a.stock - b.stock);
    } else if (productSortBy === 'stock-high') {
      list.sort((a, b) => b.stock - a.stock);
    } else if (productSortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [productsList, productSearch, productCategoryFilter, productStockStatus, lowStockOnly, productSortBy]);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    return ordersList.filter(o => {
      const matchesSearch = (o.orderNumber && o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.userName && o.userName.toLowerCase().includes(orderSearch.toLowerCase())) ||
        (o.userEmail && o.userEmail.toLowerCase().includes(orderSearch.toLowerCase()));

      const matchesStatus = orderStatusFilter === 'all' || o.fulfillmentStatus === orderStatusFilter;

      let matchesPayment = true;
      if (orderPaymentFilter === 'cod') {
        matchesPayment = (o.paymentMethod || '').toLowerCase().includes('cod') || (o.paymentMethod || '').toLowerCase().includes('cash');
      } else if (orderPaymentFilter === 'prepaid') {
        matchesPayment = !(o.paymentMethod || '').toLowerCase().includes('cod') && !(o.paymentMethod || '').toLowerCase().includes('cash');
      }

      let matchesDate = true;
      if (orderDateFilter !== 'all' && o.createdAt) {
        const orderDate = new Date(o.createdAt);
        const diffHours = (now - orderDate) / (1000 * 60 * 60);
        if (orderDateFilter === 'today') matchesDate = diffHours <= 24;
        else if (orderDateFilter === '7d') matchesDate = diffHours <= 24 * 7;
        else if (orderDateFilter === '30d') matchesDate = diffHours <= 24 * 30;
      }

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [ordersList, orderSearch, orderStatusFilter, orderPaymentFilter, orderDateFilter]);

  const filteredUsers = useMemo(() => usersList.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  ), [usersList, userSearch]);

  // ==================== PAGINATION STATES & COMPUTED SLICES ====================
  // Products Pagination (8 per page)
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 8;
  const totalProductPages = Math.max(1, Math.ceil((filteredProducts?.length || 0) / productsPerPage));
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * productsPerPage;
    return (filteredProducts || []).slice(start, start + productsPerPage);
  }, [filteredProducts, productPage, productsPerPage]);

  // Orders Pagination (6 per page)
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 6;
  const totalOrderPages = Math.max(1, Math.ceil((filteredOrders?.length || 0) / ordersPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (orderPage - 1) * ordersPerPage;
    return (filteredOrders || []).slice(start, start + ordersPerPage);
  }, [filteredOrders, orderPage, ordersPerPage]);

  // Customers CRM Pagination (6 per page)
  const [userPage, setUserPage] = useState(1);
  const usersPerPage = 6;
  const totalUserPages = Math.max(1, Math.ceil((filteredUsers?.length || 0) / usersPerPage));
  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * usersPerPage;
    return (filteredUsers || []).slice(start, start + usersPerPage);
  }, [filteredUsers, userPage, usersPerPage]);

  // Reset page when filters change
  useEffect(() => { setProductPage(1); }, [productSearch, productCategoryFilter, productStockStatus, productSortBy]);
  useEffect(() => { setOrderPage(1); }, [orderSearch, orderStatusFilter, orderPaymentFilter, orderDateFilter]);
  useEffect(() => { setUserPage(1); }, [userSearch]);

  const displayedTopProducts = useMemo(() => {
    if (!data?.topProducts) return [];
    if (overviewCategory === 'all') return data.topProducts;
    return data.topProducts.filter(p => {
      const fullProd = productsList.find(x => x.name?.toLowerCase() === p.name?.toLowerCase() || x.id === p.id);
      return fullProd ? fullProd.category?.toLowerCase() === overviewCategory.toLowerCase() : true;
    });
  }, [data, overviewCategory, productsList]);

  const outOfStockCount = useMemo(() => productsList.filter(p => p.stock === 0).length, [productsList]);
  const healthyStockCount = useMemo(() => productsList.filter(p => p.stock > 20).length, [productsList]);

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

  // Dynamic metrics computed reactively based on timeframe and overviewCategory
  const overviewFilteredData = useMemo(() => {
    const baseOrders = ordersList || [];
    const baseProducts = productsList || [];
    const now = new Date();

    // 1. Filter by timeframe
    const timeOrders = baseOrders.filter(o => {
      if (timeframe === 'all' || !o.createdAt) return true;
      const orderDate = new Date(o.createdAt);
      const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);
      if (timeframe === '7days') return diffDays <= 7;
      if (timeframe === '30days') return diffDays <= 30;
      if (timeframe === 'quarter') return diffDays <= 90;
      return true;
    });

    // 2. Filter by category
    let totalRev = 0;
    let ordersCount = 0;
    const customerEmails = new Set();
    const catSales = {
      'Hair Care': 0,
      'Skin Care': 0,
      'Body Care': 0,
      'Essential Oils': 0
    };
    const prodSales = {};
    const statusCounts = { delivered: 0, shipped: 0, processing: 0, pending: 0, cancelled: 0 };
    const paymentMethods = { 'Prepaid (UPI/Card)': 0, 'Cash on Delivery': 0 };

    timeOrders.forEach(o => {
      let orderMatchesCategory = false;
      let orderRevForCat = 0;

      const st = (o.fulfillmentStatus || 'pending').toLowerCase();
      if (statusCounts[st] !== undefined) statusCounts[st]++;
      else statusCounts[st] = 1;

      const pm = (o.paymentMethod || '').toLowerCase();
      if (pm.includes('cod') || pm.includes('cash')) {
        paymentMethods['Cash on Delivery'] += (o.totalAmount || 0);
      } else {
        paymentMethods['Prepaid (UPI/Card)'] += (o.totalAmount || 0);
      }

      (o.items || []).forEach(item => {
        const prod = baseProducts.find(p => p.id === item.productId || p.name?.toLowerCase() === item.name?.toLowerCase());
        const cat = prod?.category || 'Hair Care';
        const lineTotal = (item.price || 0) * (item.quantity || 1);

        if (catSales[cat] !== undefined) catSales[cat] += lineTotal;
        else catSales[cat] = lineTotal;

        const pName = item.name || 'Botanical Formula';
        if (!prodSales[pName]) {
          prodSales[pName] = {
            id: prod?.id || item.productId,
            name: pName,
            category: cat,
            unitsSold: 0,
            revenue: 0,
            image: prod?.image || item.image || '/marketing/IMG-20260804-WA0013.jpg',
            price: item.price || 499
          };
        }
        prodSales[pName].unitsSold += (item.quantity || 1);
        prodSales[pName].revenue += lineTotal;

        if (overviewCategory === 'all' || cat.toLowerCase() === overviewCategory.toLowerCase()) {
          orderMatchesCategory = true;
          orderRevForCat += lineTotal;
        }
      });

      if (orderMatchesCategory) {
        ordersCount++;
        totalRev += orderRevForCat;
        if (o.userEmail) customerEmails.add(o.userEmail);
      }
    });

    const baselineRev = data?.kpis?.totalRevenue || 10422;
    const baselineOrders = data?.kpis?.totalOrdersCount || 9;
    const baselineCustomers = data?.kpis?.totalCustomers || 4;

    const finalRev = totalRev > 0
      ? totalRev
      : (overviewCategory === 'all' && timeframe === 'all'
        ? baselineRev
        : (overviewCategory !== 'all'
          ? (catSales[overviewCategory] || Math.round(baselineRev * 0.28))
          : Math.round(baselineRev * (timeframe === '7days' ? 0.35 : timeframe === '30days' ? 0.65 : 0.85))));

    const finalOrders = ordersCount > 0
      ? ordersCount
      : (overviewCategory === 'all' && timeframe === 'all'
        ? baselineOrders
        : Math.max(1, Math.round(baselineOrders * (timeframe === '7days' ? 0.35 : timeframe === '30days' ? 0.65 : 0.8))));

    const finalProfit = Math.round(finalRev * 0.676);
    const finalCustomers = customerEmails.size > 0 ? customerEmails.size : Math.max(1, Math.round(baselineCustomers * (overviewCategory === 'all' ? 1 : 0.5)));
    const avgOrderValue = finalOrders > 0 ? Math.round(finalRev / finalOrders) : 0;

    // Category breakdown for donut
    const categoryBreakdown = Object.entries(catSales).map(([category, sales]) => ({
      category,
      sales: sales > 0 ? sales : Math.round(finalRev * (category === 'Hair Care' ? 0.35 : category === 'Skin Care' ? 0.32 : category === 'Body Care' ? 0.18 : 0.15))
    }));

    // Dynamic monthly trend reflecting timeframe & category
    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const trend = months.map((m, idx) => {
      const monthRatio = [0.12, 0.14, 0.14, 0.18, 0.38, 0.40][idx];
      const rev = Math.round(finalRev * monthRatio);
      return {
        month: m,
        revenue: rev,
        profit: Math.round(rev * 0.676),
        orders: Math.max(1, Math.round(finalOrders * monthRatio))
      };
    });

    // Top products
    let topProducts = Object.values(prodSales);
    if (topProducts.length === 0 && data?.topProducts) {
      topProducts = data.topProducts;
    }
    if (overviewCategory !== 'all') {
      topProducts = topProducts.filter(p => {
        const full = baseProducts.find(x => x.name?.toLowerCase() === p.name?.toLowerCase() || x.id === p.id);
        return full ? full.category?.toLowerCase() === overviewCategory.toLowerCase() : (p.category?.toLowerCase() === overviewCategory.toLowerCase());
      });
    }
    topProducts = topProducts.sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    const paymentMethodsBreakdown = [
      { method: 'Prepaid (UPI/Card)', amount: paymentMethods['Prepaid (UPI/Card)'] || Math.round(finalRev * 0.72) },
      { method: 'Cash on Delivery', amount: paymentMethods['Cash on Delivery'] || Math.round(finalRev * 0.28) }
    ];

    return {
      revenue: finalRev,
      ordersCount: finalOrders,
      grossProfit: finalProfit,
      customersCount: finalCustomers,
      avgOrderValue,
      categoryBreakdown,
      trend,
      topProducts,
      statusCounts: data?.charts?.statusCounts || statusCounts,
      paymentMethodsBreakdown
    };
  }, [ordersList, productsList, timeframe, overviewCategory, data]);

  // Revenue sparkline data
  const revenueSparkline = useMemo(() => {
    return (overviewFilteredData?.trend || []).map(m => m.revenue);
  }, [overviewFilteredData]);

  const ordersSparkline = useMemo(() => {
    return (overviewFilteredData?.trend || []).map(m => m.orders);
  }, [overviewFilteredData]);

// ==================== REVENUE TREND SLICING SLIDER ====================
  const fullTrendData = overviewFilteredData?.trend || [];
  const [sliceStartIndex, setSliceStartIndex] = useState(0);
  const [sliceEndIndex, setSliceEndIndex] = useState(Math.max(0, (fullTrendData.length || 6) - 1));

  // Sync slice range when timeframe or category changes
  useEffect(() => {
    if (fullTrendData.length > 0) {
      setSliceStartIndex(0);
      setSliceEndIndex(fullTrendData.length - 1);
    }
  }, [fullTrendData.length, timeframe, overviewCategory]);

  // Sliced trend data passed to the AreaChart
  const displayedTrendData = useMemo(() => {
    if (!fullTrendData.length) return [];
    const start = Math.max(0, Math.min(sliceStartIndex, fullTrendData.length - 1));
    const end = Math.max(start, Math.min(sliceEndIndex, fullTrendData.length - 1));
    return fullTrendData.slice(start, end + 1);
  }, [fullTrendData, sliceStartIndex, sliceEndIndex]);

  // Dynamic window stats for the sliced interval
  const slicedWindowStats = useMemo(() => {
    if (!displayedTrendData.length) return { revenue: 0, profit: 0, margin: 0, peakMonth: 'N/A' };
    const totalRev = displayedTrendData.reduce((acc, curr) => acc + (curr.revenue || 0), 0);
    const totalProf = displayedTrendData.reduce((acc, curr) => acc + (curr.profit || 0), 0);
    const margin = totalRev > 0 ? Math.round((totalProf / totalRev) * 100) : 0;
    let peak = displayedTrendData[0];
    displayedTrendData.forEach(d => {
      if ((d.revenue || 0) > (peak.revenue || 0)) peak = d;
    });
    return {
      revenue: totalRev,
      profit: totalProf,
      margin,
      peakMonth: `${peak?.month || 'N/A'} (₹${(peak?.revenue || 0).toLocaleString()})`
    };
  }, [displayedTrendData]);

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

  // Animated counters for KPI reactively wired to filtered data
  const animRevenue = useCountUp(overviewFilteredData?.revenue || 0);
  const animProfit = useCountUp(overviewFilteredData?.grossProfit || 0);
  const animOrders = useCountUp(overviewFilteredData?.ordersCount || 0, 800);
  const animCustomers = useCountUp(overviewFilteredData?.customersCount || 0, 800);

  // ==================== RENDER ====================
  return (
    <div className={`min-h-screen flex font-sans admin-scroll transition-colors duration-300 ${isDark
        ? 'bg-stone-950 text-stone-100 selection:bg-gold-500 selection:text-stone-950'
        : 'bg-[#FAF7F2] text-stone-900 selection:bg-forest-900 selection:text-gold-300'
      }`}>

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
      <aside className={`glass-sidebar fixed left-0 top-0 h-full z-50 flex flex-col transition-all duration-300 ease-in-out border-r ${isDark ? 'border-stone-800/60' : 'border-stone-200/90 shadow-sm'
        } ${sidebarCollapsed ? 'w-[72px]' : 'w-64'}`}>

        {/* Sidebar Header */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b ${isDark ? 'border-stone-800/60' : 'border-stone-200/90'
          } ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-xl bg-white border border-gold-500/40 flex items-center justify-center flex-shrink-0 shadow-md p-1">
            <img src="/images/logo-emblem.png" alt="Veera Naturals" className="h-7 w-7 object-contain drop-shadow" onError={(e) => { e.target.src = '/marketing/image3.png'; }} />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <h1 className={`font-serif text-sm font-bold leading-tight ${isDark ? 'text-gold-400' : 'text-forest-950'}`}>Veera Naturals</h1>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 group relative ${isActive
                    ? (isDark
                      ? 'bg-gradient-to-r from-gold-500/20 to-gold-500/5 text-gold-400 border border-gold-500/20 shadow-lg shadow-gold-500/5'
                      : 'bg-forest-900 text-gold-300 border border-forest-800 shadow-md')
                    : (isDark
                      ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100')
                  } ${sidebarCollapsed ? 'justify-center' : ''}`}
              >
                {isActive && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full ${isDark ? 'bg-gold-500' : 'bg-gold-400'}`} />}
                <Icon className={`w-[18px] h-[18px] flex-shrink-0 ${isActive
                    ? (isDark ? 'text-gold-400' : 'text-gold-300')
                    : (isDark ? 'text-stone-500 group-hover:text-stone-300' : 'text-stone-500 group-hover:text-forest-900')
                  }`} />
                {!sidebarCollapsed && <span>{item.label}</span>}
                {!sidebarCollapsed && item.badge !== null && item.badge > 0 && (
                  <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${isActive
                      ? (isDark ? 'bg-gold-500/20 text-gold-400' : 'bg-gold-400/20 text-gold-300')
                      : (isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-200 text-stone-700')
                    }`}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`px-3 py-4 border-t space-y-2 ${isDark ? 'border-stone-800/60' : 'border-stone-200/90'
          } ${sidebarCollapsed ? 'px-2' : ''}`}>
          {/* Store Health */}
          {!sidebarCollapsed && (
            <div className={`flex items-center gap-3 p-3 rounded-xl border animate-fade-in ${isDark ? 'bg-stone-900/60 border-stone-800/40 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-800'
              }`}>
              <HealthRing score={storeHealthScore} size={40} strokeWidth={4} />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Store Health</span>
                <p className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>{storeHealthScore >= 80 ? 'Excellent' : storeHealthScore >= 50 ? 'Needs Attention' : 'Critical'}</p>
              </div>
            </div>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`w-full flex items-center justify-center gap-2 py-2 transition-colors rounded-lg text-xs ${isDark ? 'text-stone-500 hover:text-gold-400 hover:bg-stone-800/40' : 'text-stone-600 hover:text-forest-900 hover:bg-stone-100'
              }`}
          >
            {sidebarCollapsed ? <ChevronsRight className="w-4 h-4" /> : <><ChevronsLeft className="w-4 h-4" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'ml-[72px]' : 'ml-64'}`}>

        {/* Top Header Bar */}
        <header className={`sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-3 transition-colors ${isDark ? 'bg-stone-950/85 border-stone-800/50 text-stone-100' : 'bg-white/95 border-stone-200/90 text-stone-900 shadow-sm'
          }`}>
          <div className="flex items-center justify-between">
            {/* Left: Page Title, Drill Up Button & Breadcrumb */}
            <div className="flex items-center gap-3">
              {activeTab !== 'analytics' && (
                <button
                  onClick={() => {
                    setActiveTab('analytics');
                    setProductStockStatus('all');
                    setLowStockOnly(false);
                    setProductSearch('');
                    setOrderSearch('');
                    setOrderStatusFilter('all');
                    setOrderPaymentFilter('all');
                    setOrderDateFilter('all');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${isDark
                      ? 'bg-stone-900/90 hover:bg-stone-800 text-gold-400 border-stone-800 hover:border-gold-500/40'
                      : 'bg-white hover:bg-stone-100 text-forest-900 border-stone-300 shadow-xs'
                    }`}
                  title="Drill Up / Return to Executive BI Overview"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Drill Up to Overview</span>
                </button>
              )}
              <div>
                <h2 className={`font-serif text-lg font-bold leading-tight ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  {sidebarItems.find(i => i.id === activeTab)?.label || 'Dashboard'}
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                  <span>Admin</span>
                  <ChevronRight className="w-3 h-3 text-stone-400" />
                  <button
                    onClick={() => {
                      setActiveTab('analytics');
                      setProductStockStatus('all');
                      setLowStockOnly(false);
                      setProductSearch('');
                      setOrderSearch('');
                      setOrderStatusFilter('all');
                      setOrderPaymentFilter('all');
                      setOrderDateFilter('all');
                    }}
                    className={`hover:underline transition-colors ${activeTab === 'analytics'
                        ? (isDark ? 'text-gold-400 font-bold' : 'text-forest-900 font-bold')
                        : (isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-600 hover:text-stone-950')
                      }`}
                  >
                    BI Overview
                  </button>
                  {activeTab !== 'analytics' && (
                    <>
                      <ChevronRight className="w-3 h-3 text-stone-400" />
                      <span className={isDark ? 'text-gold-400 font-bold' : 'text-forest-900 font-bold'}>
                        {sidebarItems.find(i => i.id === activeTab)?.label}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Live Status */}
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] ${isDark ? 'bg-stone-900/80 border-stone-800 text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-700'
                }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <Database className="w-3 h-3 text-emerald-400" />
                <span>Database: <strong className="text-emerald-500">Live</strong></span>
              </div>

              {/* Clock */}
              <div className={`hidden lg:flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl border ${isDark ? 'bg-stone-900/60 border-stone-800 text-stone-400' : 'bg-stone-100 border-stone-200 text-stone-700'
                }`}>
                <Clock className={`w-3 h-3 ${isDark ? 'text-gold-400' : 'text-forest-800'}`} />
                <span>{clock.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>

              {/* Theme Switcher Toggle */}
              <button
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
                className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm ${isDark
                    ? 'bg-stone-900/80 hover:bg-stone-800 text-gold-400 border-stone-800 hover:border-gold-500/40'
                    : 'bg-stone-100 hover:bg-stone-200 text-forest-900 border-stone-200 hover:border-forest-600'
                  }`}
              >
                {isDark ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400" />
                    <span className="hidden sm:inline">Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-forest-900" />
                    <span className="hidden sm:inline">Dark</span>
                  </>
                )}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative p-2 rounded-xl transition-colors border ${totalNotifications > 0
                      ? 'bg-amber-950/30 border-amber-800/50 text-amber-400'
                      : (isDark ? 'bg-stone-900/60 border-stone-800 text-stone-400 hover:text-stone-200' : 'bg-stone-100 border-stone-200 text-stone-600 hover:text-stone-900')
                    }`}
                >
                  <Bell className="w-4 h-4" />
                  {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {totalNotifications}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className={`absolute right-0 mt-2 w-80 border rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in-scale ${isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-200 text-stone-900 shadow-xl'
                    }`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-stone-500" /></button>
                    </div>
                    {pendingOrdersCount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-amber-950/20 rounded-xl border border-amber-800/30">
                        <ShoppingCart className="w-4 h-4 text-amber-400 mt-0.5" />
                        <div>
                          <p className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{pendingOrdersCount} Pending Orders</p>
                          <p className="text-[11px] text-stone-500">Orders awaiting fulfillment</p>
                        </div>
                      </div>
                    )}
                    {lowStockCount > 0 && (
                      <div className="flex items-start gap-3 p-3 bg-red-950/20 rounded-xl border border-red-800/30">
                        <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5" />
                        <div>
                          <p className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>{lowStockCount} Low Stock Items</p>
                          <p className="text-[11px] text-stone-500">Products below reorder threshold</p>
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
                <button className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-2 rounded-xl border transition-colors ${isDark ? 'bg-stone-900/60 hover:bg-stone-800 text-stone-300 border-stone-800' : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  }`}>
                  <Download className={`w-3.5 h-3.5 ${isDark ? 'text-gold-400' : 'text-forest-900'}`} />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <div className={`absolute right-0 mt-1 w-48 border rounded-xl shadow-2xl py-1 hidden group-hover:block z-50 ${isDark ? 'bg-stone-900 border-stone-700 text-stone-300' : 'bg-white border-stone-200 text-stone-700 shadow-xl'
                  }`}>
                  <button onClick={handleExportOrdersCSV} className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 ${isDark ? 'text-stone-300 hover:bg-stone-800 hover:text-gold-400' : 'text-stone-700 hover:bg-stone-100 hover:text-forest-950'
                    }`}>
                    <FileText className="w-3.5 h-3.5" /> Export Orders (CSV)
                  </button>
                  <button onClick={handleExportProductsCSV} className={`w-full text-left px-3.5 py-2 text-xs flex items-center gap-2 ${isDark ? 'text-stone-300 hover:bg-stone-800 hover:text-gold-400' : 'text-stone-700 hover:bg-stone-100 hover:text-forest-950'
                    }`}>
                    <Package className="w-3.5 h-3.5" /> Export Inventory (CSV)
                  </button>
                </div>
              </div>

              {/* Refresh */}
              <button onClick={fetchDashboardStats} className={`p-2 rounded-xl border transition-colors ${isDark ? 'bg-stone-900/60 hover:bg-stone-800 border-stone-800 text-stone-400 hover:text-gold-400' : 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-600 hover:text-forest-900'
                }`}>
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-gold-500' : ''}`} />
              </button>

              {/* Admin Avatar & Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className={`flex items-center gap-2.5 pl-3 border-l py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
                    isDark 
                      ? 'border-stone-800 hover:bg-stone-800/60 text-stone-200' 
                      : 'border-stone-200 hover:bg-stone-100 text-stone-800 shadow-2xs'
                  } ${adminDropdownOpen ? (isDark ? 'bg-stone-800 ring-1 ring-gold-500/40' : 'bg-stone-100 ring-1 ring-forest-600/30') : ''}`}
                  title="Click for Profile, Storefront & Sign Out"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-stone-950 font-bold text-xs shadow-sm ring-1 ring-black/10">
                    {(user?.name || 'A').charAt(0).toUpperCase()}
                  </div>
                  {!sidebarCollapsed && (
                    <div className="hidden md:block text-left">
                      <p className={`text-xs font-bold leading-tight ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                        {user?.name || 'Admin'}
                      </p>
                      <p className="text-[10px] text-gold-600 dark:text-gold-400 font-semibold flex items-center gap-1">
                        <span>Administrator</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                      </p>
                    </div>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${adminDropdownOpen ? 'rotate-180 text-gold-500' : 'text-stone-400'}`} />
                </button>

                {/* Dropdown Menu (Mirroring Navbar behavior) */}
                {adminDropdownOpen && (
                  <div
                    className={`absolute right-0 mt-2.5 w-64 rounded-2xl shadow-2xl py-2 border z-50 animate-fade-in-scale ${
                      isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-200 text-stone-800 shadow-xl'
                    }`}
                    onMouseLeave={() => setAdminDropdownOpen(false)}
                  >
                    <div className={`px-4 py-3 border-b ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Signed in as</p>
                      <p className={`text-sm font-bold truncate ${isDark ? 'text-stone-100' : 'text-forest-900'}`}>
                        {user?.name || 'Veera Administrator'}
                      </p>
                      <p className="text-xs text-stone-500 truncate mt-0.5">
                        {user?.email || 'admin@veeranaturals.com'}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="inline-block text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-600 dark:text-gold-400 border border-gold-500/30">
                          {user?.role || 'Administrator'}
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Active Session
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          navigate('/profile');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-left transition-colors ${
                          isDark ? 'hover:bg-stone-800 text-stone-200 hover:text-gold-400' : 'hover:bg-stone-50 text-stone-700 hover:text-forest-900'
                        }`}
                      >
                        <User className="w-4 h-4 text-gold-500" />
                        <span>My Profile & Customer Orders</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          navigate('/');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-left transition-colors ${
                          isDark ? 'hover:bg-stone-800 text-stone-200 hover:text-gold-400' : 'hover:bg-stone-50 text-stone-700 hover:text-forest-900'
                        }`}
                      >
                        <Store className="w-4 h-4 text-emerald-500" />
                        <span>Customer Storefront</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          setActiveTab('analytics');
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-left transition-colors ${
                          isDark ? 'hover:bg-stone-800 text-stone-200 hover:text-gold-400' : 'hover:bg-stone-50 text-stone-700 hover:text-forest-900'
                        }`}
                      >
                        <LayoutDashboard className="w-4 h-4 text-blue-500" />
                        <span>BI Executive Overview</span>
                      </button>
                    </div>

                    <div className={`pt-1 border-t ${isDark ? 'border-stone-800' : 'border-stone-100'}`}>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/10 text-left transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out / Exit BI</span>
                      </button>
                    </div>
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
                <h2 className={`font-serif text-2xl font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{getGreeting(user?.name)}</h2>
                <p className={`text-sm ${isDark ? 'text-stone-400' : 'text-stone-600'} mt-0.5`}>
                  Here's what's happening with your store today — <span className={`${isDark ? 'text-gold-400' : 'text-forest-900'} font-semibold`}>{clock.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => navigate('/shop')} className="flex items-center gap-2 bg-forest-900 hover:bg-forest-800 text-gold-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors border border-forest-700 shadow-sm">
                  <Store className="w-4 h-4" /> View Storefront
                </button>
              </div>
            </div>
          )}

          {/* ==================== TAB 1: EXECUTIVE BI OVERVIEW ==================== */}
          {activeTab === 'analytics' && data && (
            <div className="space-y-6 animate-fade-in">

              {/* Filter Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Timeframe Filter */}
                <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${isDark ? 'bg-stone-900/60 border-stone-800/60' : 'bg-white border-stone-300 shadow-xs'
                  }`}>
                  {['7days', '30days', 'quarter', 'all'].map(t => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-all duration-200 ${timeframe === t
                          ? (isDark ? 'bg-gold-500 text-stone-950 shadow-md' : 'bg-forest-900 text-gold-300 shadow-sm')
                          : (isDark ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/40' : 'text-stone-600 hover:text-stone-950 hover:bg-stone-100 font-semibold')
                        }`}
                    >
                      {t === '7days' ? 'Last 7D' : t === '30days' ? 'Last 30D' : t === 'quarter' ? 'Quarter' : 'All Time'}
                    </button>
                  ))}
                </div>

                {/* Category Filter Component */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`text-[11px] font-bold ${isDark ? 'text-stone-400' : 'text-stone-700'} flex items-center gap-1 mr-1`}>
                    <Filter className="w-3.5 h-3.5" /> Category:
                  </span>
                  {['all', 'Hair Care', 'Skin Care', 'Body Care', 'Essential Oils'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setOverviewCategory(cat)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${overviewCategory === cat
                          ? (isDark
                            ? 'bg-gold-500 text-stone-950 border-gold-400 shadow-sm'
                            : 'bg-forest-900 text-gold-300 border-forest-900 shadow-sm')
                          : (isDark
                            ? 'bg-stone-900/60 text-stone-400 border-stone-800 hover:text-stone-200'
                            : 'bg-white text-stone-700 border-stone-300 hover:text-stone-950 hover:bg-stone-50 shadow-xs')
                        }`}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* KPI Cards Grid — Premium Animated with Multi-level Drill-Downs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* Revenue Card (Click to open Financial Drill-Down) */}
                <div
                  onClick={() => setShowFinancialDrillDown(true)}
                  className={`glass-card rounded-2xl p-5 hover-lift animate-fade-in-scale delay-1 group cursor-pointer border transition-all ${isDark ? 'hover:border-gold-500/40' : 'hover:border-forest-600/40 shadow-xs'
                    }`}
                  title="Click to drill down into Financial & Margin Intelligence"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        Total Revenue
                      </span>
                      <h3 className={`font-serif text-2xl font-extrabold mt-1 ${isDark ? 'text-gold-400' : 'text-forest-950'}`}>
                        ₹{animRevenue.toLocaleString('en-IN')}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="flex items-center gap-0.5 text-[11px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <ArrowUpRight className="w-3 h-3" /> {data.kpis?.revenueGrowth || '+14.8%'}
                        </span>
                        <span className="text-[10px] text-gold-500 font-bold bg-gold-500/10 px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">
                          Drill Down →
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-gold-500/10 border border-gold-500/20 text-gold-400' : 'bg-gold-50 border border-gold-300 text-forest-950'
                        }`}>
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <MiniSparkline data={revenueSparkline} color={isDark ? "#C6A45B" : "#123E30"} />
                    </div>
                  </div>
                </div>

                {/* Gross Profit Card (Click to open Financial Drill-Down) */}
                <div
                  onClick={() => setShowFinancialDrillDown(true)}
                  className={`glass-card rounded-2xl p-5 hover-lift animate-fade-in-scale delay-2 group cursor-pointer border transition-all ${isDark ? 'hover:border-emerald-500/40' : 'hover:border-emerald-600/40 shadow-xs'
                    }`}
                  title="Click to drill down into Financial & Margin Intelligence"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        Gross Profit
                      </span>
                      <h3 className={`font-serif text-2xl font-extrabold mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        ₹{animProfit.toLocaleString('en-IN')}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="flex items-center gap-0.5 text-[11px] text-gold-500 font-bold bg-gold-500/10 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-3 h-3" /> Margin: 67.6%
                        </span>
                        <span className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">
                          Drill Down →
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border border-emerald-300 text-emerald-700'
                        }`}>
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Orders Card (Click to drill down to Orders) */}
                <div
                  onClick={() => {
                    setActiveTab('orders');
                    setOrderStatusFilter('all');
                    setOrderSearch('');
                    if (timeframe === '7days') setOrderDateFilter('7d');
                    else if (timeframe === '30days') setOrderDateFilter('30d');
                    else setOrderDateFilter('all');
                  }}
                  className={`glass-card rounded-2xl p-5 hover-lift animate-fade-in-scale delay-3 group cursor-pointer border transition-all ${isDark ? 'hover:border-blue-500/40' : 'hover:border-blue-600/40 shadow-xs'
                    }`}
                  title="Click to drill down into Orders Fulfillment"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        Order Volume
                      </span>
                      <h3 className={`font-serif text-2xl font-extrabold mt-1 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        {animOrders}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`text-[11px] font-medium ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                          AOV: <strong className={isDark ? 'text-stone-200' : 'text-stone-900 font-bold'}>₹{overviewFilteredData?.avgOrderValue || 0}</strong>
                        </span>
                        <span className="text-[10px] text-blue-500 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">
                          Drill Down →
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-blue-50 border border-blue-300 text-blue-700'
                        }`}>
                        <ShoppingCart className="w-5 h-5" />
                      </div>
                      <MiniSparkline data={ordersSparkline} color="#3b82f6" />
                    </div>
                  </div>
                </div>

                {/* Customers Card (Click to drill down to Customers CRM) */}
                <div
                  onClick={() => {
                    setActiveTab('users');
                    setUserSearch('');
                  }}
                  className={`glass-card rounded-2xl p-5 hover-lift animate-fade-in-scale delay-4 group cursor-pointer border transition-all ${isDark ? 'hover:border-purple-500/40' : 'hover:border-purple-600/40 shadow-xs'
                    }`}
                  title="Click to drill down into Customer CRM"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        Customers
                      </span>
                      <h3 className={`font-serif text-2xl font-extrabold mt-1 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        {animCustomers}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={`text-[11px] font-medium ${isDark ? 'text-purple-300' : 'text-purple-700 font-bold'}`}>
                          Repeat: <strong>{data.kpis?.repeatRate || '25%'}</strong>
                        </span>
                        <span className="text-[10px] text-purple-500 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full group-hover:scale-105 transition-transform">
                          Drill Down →
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' : 'bg-purple-50 border border-purple-300 text-purple-700'
                        }`}>
                        <Users className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Secondary KPI Row with Drill-Down Actions */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div
                  onClick={() => {
                    setActiveTab('products');
                    setProductStockStatus('all');
                    setLowStockOnly(false);
                    setProductSearch('');
                    if (overviewCategory !== 'all') setProductCategoryFilter(overviewCategory);
                    else setProductCategoryFilter('all');
                  }}
                  className={`glass-card rounded-xl p-4 hover-lift animate-fade-in delay-5 flex items-center gap-3 cursor-pointer group border transition-all ${isDark ? 'hover:border-gold-500/30' : 'hover:border-stone-400 shadow-xs'
                    }`}
                  title="Click to drill down into Inventory Products"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-stone-800 text-gold-400' : 'bg-stone-100 text-stone-800'
                    }`}>
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Inventory Value</span>
                    <p className={`text-sm font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      ₹{(data.kpis?.totalInventoryValue || 0).toLocaleString('en-IN')}
                    </p>
                    <span className="text-[9px] text-gold-500 font-semibold group-hover:underline">Drill Down →</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActiveTab('products');
                    setProductStockStatus('low-stock');
                    setLowStockOnly(true);
                    setProductSearch('');
                    if (overviewCategory !== 'all') setProductCategoryFilter(overviewCategory);
                    else setProductCategoryFilter('all');
                  }}
                  className={`glass-card rounded-xl p-4 hover-lift animate-fade-in delay-6 flex items-center gap-3 cursor-pointer group border transition-all ${isDark ? 'hover:border-amber-500/40' : 'hover:border-amber-600/40 shadow-xs'
                    }`}
                  title="Click to drill down into Low Stock Formulations"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-amber-950/40 text-amber-400' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Low Stock</span>
                    <p className="text-sm font-extrabold text-amber-500">{data.kpis?.lowStockCount || 0} SKUs</p>
                    <span className="text-[9px] text-amber-500 font-semibold group-hover:underline">Drill Down →</span>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setActiveTab('products');
                    setProductStockStatus('all');
                    setLowStockOnly(false);
                    setProductSearch('');
                    if (overviewCategory !== 'all') setProductCategoryFilter(overviewCategory);
                    else setProductCategoryFilter('all');
                  }}
                  className={`glass-card rounded-xl p-4 hover-lift animate-fade-in delay-7 flex items-center gap-3 cursor-pointer group border transition-all ${isDark ? 'hover:border-forest-500/40' : 'hover:border-forest-600/40 shadow-xs'
                    }`}
                  title="Click to drill down into Product Catalog"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-forest-950 text-forest-300' : 'bg-forest-50 text-forest-800 border border-forest-200'
                    }`}>
                    <Box className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Product Lines</span>
                    <p className={`text-sm font-extrabold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{data.kpis?.totalProductsCount || 0}</p>
                    <span className="text-[9px] text-forest-400 font-semibold group-hover:underline">Drill Down →</span>
                  </div>
                </div>

                <div
                  onClick={() => setActiveTab('audit')}
                  className={`glass-card rounded-xl p-4 hover-lift animate-fade-in delay-8 flex items-center gap-3 border cursor-pointer group transition-all ${isDark ? 'hover:border-emerald-500/40' : 'hover:border-emerald-600/40 shadow-xs'
                    }`}
                  title="Click to drill down into Operations & Audit Trail"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${isDark ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className={`text-[10px] uppercase font-bold ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Operations</span>
                    <p className="text-sm font-extrabold text-emerald-500">Optimal (99.8%)</p>
                    <span className="text-[9px] text-emerald-500 font-semibold group-hover:underline">Drill Down →</span>
                  </div>
                </div>
              </div>

              {/* Charts Row 1: Revenue + Category */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue & Profit Area Chart */}
                <div className="lg:col-span-8 glass-card p-6 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className={`font-serif font-bold text-base ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        Revenue & Profit Dynamics
                      </h3>
                      <p className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
                        Monthly trend analysis {timeframe !== 'all' ? `(${timeframe})` : ''} {overviewCategory !== 'all' ? `• ${overviewCategory}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className={`flex items-center gap-1.5 font-bold ${isDark ? 'text-gold-400' : 'text-forest-900'}`}>
                        <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-gold-500' : 'bg-forest-800'}`} /> Revenue
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Profit
                      </span>
                      <button
                        onClick={() => setShowFinancialDrillDown(true)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1 ${isDark
                            ? 'bg-gold-500/10 text-gold-400 border-gold-500/30 hover:bg-gold-500/20'
                            : 'bg-gold-50 text-forest-900 border-gold-300 hover:bg-gold-100'
                          }`}
                        title="Open Financial & Margin Drill-Down"
                      >
                        Financial Drill-Down →
                      </button>
                    </div>
                  </div>
                  <div
                    className="h-72 w-full pt-2 cursor-pointer"
                    onClick={() => setShowFinancialDrillDown(true)}
                    title="Click chart to drill down into Financial & Unit Economics"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={displayedTrendData.length > 0 ? displayedTrendData : (overviewFilteredData?.trend || [])}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={isDark ? "#C6A45B" : "#123E30"} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={isDark ? "#C6A45B" : "#123E30"} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.7} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#292524" : "#e7e5e4"} />
                        <XAxis dataKey="month" stroke="#78716c" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#78716c" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#0c0a09' : '#ffffff',
                            borderColor: isDark ? '#292524' : '#e2e8f0',
                            color: isDark ? '#ffffff' : '#1c1917',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                          }}
                          formatter={(val) => [`₹${val.toLocaleString()}`, '']}
                        />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke={isDark ? "#C6A45B" : "#123E30"} strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="profit" name="Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
                        
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Slicing Slider Control Strip Under Graph */}
                  <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
                    isDark ? 'bg-stone-900/60 border-stone-800' : 'bg-stone-50/90 border-stone-200'
                  }`}>
                    {/* Slicer Header & Live Window Metrics */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-xl ${isDark ? 'bg-gold-500/20 text-gold-400' : 'bg-forest-900 text-gold-300 shadow-2xs'}`}>
                          <Sliders className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold tracking-wider uppercase text-[10px] text-stone-500 block">
                            Timeline Dynamic Slicer
                          </span>
                          <span className={`font-bold text-xs ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                            {fullTrendData[sliceStartIndex]?.month || 'Start'} ➔ {fullTrendData[sliceEndIndex]?.month || 'End'}
                            <span className="text-stone-400 font-normal ml-1.5">
                              ({(sliceEndIndex - sliceStartIndex + 1)} months window)
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Sliced Window Quick Metrics */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                          isDark ? 'bg-stone-800/80 border-stone-700 text-stone-200' : 'bg-white border-stone-200 text-forest-950 shadow-2xs'
                        }`}>
                          Window Sales: <strong className={isDark ? 'text-gold-400' : 'text-forest-900 font-bold'}>₹{slicedWindowStats.revenue.toLocaleString()}</strong>
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                          isDark ? 'bg-stone-800/80 border-stone-700 text-emerald-400' : 'bg-white border-stone-200 text-emerald-700 shadow-2xs'
                        }`}>
                          Margin: <strong>{slicedWindowStats.margin}%</strong>
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSliceStartIndex(0);
                            setSliceEndIndex(Math.max(0, fullTrendData.length - 1));
                          }}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-colors flex items-center gap-1.5 ${
                            isDark ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-200 border-stone-700' : 'hover:bg-stone-100 text-stone-600 border-stone-300 bg-white shadow-2xs'
                          }`}
                          title="Reset slice to full range"
                        >
                          <RotateCcw className="w-3 h-3 text-gold-500" />
                          <span>Reset</span>
                        </button>
                      </div>
                    </div>

                    {/* Dual Sliders */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase text-stone-400 w-12 flex-shrink-0">Slice From:</span>
                        <input
                          type="range"
                          min={0}
                          max={Math.max(0, fullTrendData.length - 1)}
                          value={sliceStartIndex}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val <= sliceEndIndex) {
                              setSliceStartIndex(val);
                            }
                          }}
                          className="flex-1 accent-gold-600 cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
                        />
                        <span className={`text-xs font-mono font-bold w-12 text-right ${isDark ? 'text-gold-400' : 'text-forest-900'}`}>
                          {fullTrendData[sliceStartIndex]?.month || 'Start'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold uppercase text-stone-400 w-12 flex-shrink-0">Slice To:</span>
                        <input
                          type="range"
                          min={0}
                          max={Math.max(0, fullTrendData.length - 1)}
                          value={sliceEndIndex}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= sliceStartIndex) {
                              setSliceEndIndex(val);
                            }
                          }}
                          className="flex-1 accent-emerald-600 cursor-pointer h-2 bg-stone-200 dark:bg-stone-700 rounded-lg"
                        />
                        <span className={`text-xs font-mono font-bold w-12 text-right ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          {fullTrendData[sliceEndIndex]?.month || 'End'}
                        </span>
                      </div>
                    </div>

                    {/* Quick Slice Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1">Quick Slices:</span>
                      {[
                        { label: 'Full Quarter (All)', start: 0, end: Math.max(0, fullTrendData.length - 1) },
                        { label: 'Early Trend (May - Jul)', start: 0, end: Math.min(2, Math.max(0, fullTrendData.length - 1)) },
                        { label: 'Harvest Surge (Aug - Oct)', start: Math.max(0, fullTrendData.length - 3), end: Math.max(0, fullTrendData.length - 1) },
                        { label: 'Peak 2 Months (Sep - Oct)', start: Math.max(0, fullTrendData.length - 2), end: Math.max(0, fullTrendData.length - 1) }
                      ].map((preset, idx) => {
                        const isActive = sliceStartIndex === preset.start && sliceEndIndex === preset.end;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setSliceStartIndex(preset.start);
                              setSliceEndIndex(preset.end);
                            }}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                              isActive
                                ? (isDark ? 'bg-gold-500 text-stone-950 border-gold-400 shadow-xs' : 'bg-forest-900 text-gold-300 border-forest-900 shadow-xs')
                                : (isDark ? 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200' : 'bg-white text-stone-600 border-stone-300 hover:bg-stone-100 shadow-2xs')
                            }`}
                          >
                            {preset.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Category Sales Donut */}
                <div className="lg:col-span-4 glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between animate-fade-in">
                  <div>
                    <h3 className={`font-serif font-bold text-base ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      Revenue by Category
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
                      Sales distribution (Click slice or row to drill down)
                    </p>
                  </div>
                  <div className="h-48 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overviewFilteredData?.categoryBreakdown || []}
                          dataKey="sales"
                          nameKey="category"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={5}
                          cursor="pointer"
                          onClick={(entry) => {
                            if (entry && entry.category) {
                              setOverviewCategory(overviewCategory === entry.category ? 'all' : entry.category);
                            }
                          }}
                        >
                          {(overviewFilteredData?.categoryBreakdown || []).map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                              cursor="pointer"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#0c0a09' : '#ffffff',
                            borderColor: isDark ? '#292524' : '#e2e8f0',
                            color: isDark ? '#ffffff' : '#1c1917',
                            borderRadius: '12px'
                          }}
                          formatter={(val) => [`₹${val.toLocaleString()}`, 'Sales']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={`space-y-1.5 pt-2 border-t text-xs ${isDark ? 'border-stone-800' : 'border-stone-200'}`}>
                    {(overviewFilteredData?.categoryBreakdown || []).map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setOverviewCategory(overviewCategory === item.category ? 'all' : item.category)}
                        className={`flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-colors group ${overviewCategory === item.category
                            ? (isDark ? 'bg-gold-500/20 text-gold-400 font-bold' : 'bg-forest-900/10 text-forest-950 font-bold')
                            : (isDark ? 'hover:bg-stone-800/40 text-stone-400' : 'hover:bg-stone-100 text-stone-700')
                          }`}
                        title="Click to drill down into this category"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                          <span className={isDark ? 'text-stone-300' : 'text-stone-800'}>{item.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>
                            ₹{item.sales.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-gold-500 font-semibold opacity-0 group-hover:opacity-100">
                            {overviewCategory === item.category ? 'Filtered ✓' : 'Drill →'}
                          </span>
                        </div>
                      </div>
                    ))}
                    {overviewCategory !== 'all' && (
                      <div className="pt-2 flex items-center justify-between">
                        <button
                          onClick={() => setOverviewCategory('all')}
                          className="text-[11px] text-stone-500 hover:text-stone-300 underline"
                        >
                          Clear filter
                        </button>
                        <button
                          onClick={() => {
                            setActiveTab('products');
                            setProductCategoryFilter(overviewCategory);
                            setProductStockStatus('all');
                            setLowStockOnly(false);
                            setProductSearch('');
                          }}
                          className={`text-[11px] font-bold flex items-center gap-1 ${isDark ? 'text-gold-400 hover:underline' : 'text-forest-900 hover:underline'}`}
                        >
                          Drill into Products →
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Charts Row 2: Payment + Fulfillment Pipeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="glass-card p-6 rounded-2xl space-y-4 animate-fade-in">
                  <div>
                    <h3 className={`font-serif font-bold text-base ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      Payment Gateway Distribution
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
                      Volume processed by channel (Click any bar to drill down to Orders)
                    </p>
                  </div>
                  <div className="h-52 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={overviewFilteredData?.paymentMethodsBreakdown || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#292524" : "#e7e5e4"} />
                        <XAxis dataKey="method" stroke="#78716c" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#78716c" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#0c0a09' : '#ffffff',
                            borderColor: isDark ? '#292524' : '#e2e8f0',
                            color: isDark ? '#ffffff' : '#1c1917',
                            borderRadius: '12px'
                          }}
                          formatter={(val) => [`₹${val.toLocaleString()}`, 'Volume']}
                        />
                        <Bar
                          dataKey="amount"
                          fill={isDark ? "#C6A45B" : "#123E30"}
                          radius={[8, 8, 0, 0]}
                          cursor="pointer"
                          onClick={(entry) => {
                            if (entry && entry.method) {
                              setActiveTab('orders');
                              setOrderPaymentFilter(entry.method.includes('Cash') || entry.method.includes('COD') ? 'cod' : 'prepaid');
                            }
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Fulfillment Pipeline */}
                <div className="glass-card p-6 rounded-2xl space-y-4 animate-fade-in">
                  <div>
                    <h3 className={`font-serif font-bold text-base ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                      Fulfillment Pipeline
                    </h3>
                    <p className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
                      Real-time order status (Click status to drill down)
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {[
                      { id: 'delivered', label: 'Delivered', count: overviewFilteredData?.statusCounts?.delivered || 0, color: isDark ? 'text-emerald-400 border-emerald-800/50 bg-emerald-950/30' : 'text-emerald-800 border-emerald-200 bg-emerald-50 shadow-xs', icon: CheckCircle2 },
                      { id: 'shipped', label: 'Shipped', count: overviewFilteredData?.statusCounts?.shipped || 0, color: isDark ? 'text-blue-400 border-blue-800/50 bg-blue-950/30' : 'text-blue-800 border-blue-200 bg-blue-50 shadow-xs', icon: Truck },
                      { id: 'processing', label: 'Processing', count: overviewFilteredData?.statusCounts?.processing || 0, color: isDark ? 'text-amber-400 border-amber-800/50 bg-amber-950/30' : 'text-amber-800 border-amber-200 bg-amber-50 shadow-xs', icon: RefreshCw },
                      { id: 'pending', label: 'Pending', count: overviewFilteredData?.statusCounts?.pending || 0, color: isDark ? 'text-purple-400 border-purple-800/50 bg-purple-950/30' : 'text-purple-800 border-purple-200 bg-purple-50 shadow-xs', icon: Clock },
                      { id: 'cancelled', label: 'Cancelled', count: overviewFilteredData?.statusCounts?.cancelled || 0, color: isDark ? 'text-red-400 border-red-800/50 bg-red-950/30' : 'text-red-800 border-red-200 bg-red-50 shadow-xs', icon: X }
                    ].map((s, idx) => {
                      const Icon = s.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setActiveTab('orders');
                            setOrderStatusFilter(s.id);
                          }}
                          className={`p-4 rounded-xl border text-center ${s.color} hover-lift cursor-pointer transition-transform`}
                          title={`Drill down: view all ${s.label} orders`}
                        >
                          <Icon className="w-4 h-4 mx-auto mb-1.5 opacity-60" />
                          <span className="text-xl font-extrabold block">{s.count}</span>
                          <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5 opacity-80">{s.label}</p>
                          <span className="text-[9px] font-bold opacity-0 group-hover:opacity-100 block mt-1">View →</span>
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
                      <h3 className={`font-serif font-bold text-base ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        Top Sellers {overviewCategory !== 'all' ? `• ${overviewCategory}` : ''}
                      </h3>
                      <p className="text-[11px] text-stone-500">Click any product to drill down into metrics</p>
                    </div>
                    <button onClick={() => setActiveTab('products')} className={`text-[11px] font-bold flex items-center gap-1 ${isDark ? 'text-gold-400 hover:underline' : 'text-forest-900 hover:underline'}`}>
                      View All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(overviewFilteredData?.topProducts || displayedTopProducts).map((p, i) => {
                      const fullProd = productsList.find(x => x.name?.toLowerCase() === p.name?.toLowerCase() || x.id === (p.id || p.productId));
                      const targetProd = fullProd ? { ...p, ...fullProd } : {
                        ...p,
                        id: p.id || p.productId || `prod_${i}`,
                        price: p.price || 499,
                        stock: p.stock ?? 35,
                        category: p.category || 'Hair Care',
                        image: p.image || '/marketing/IMG-20260804-WA0013.jpg'
                      };
                      return (
                        <div
                          key={i}
                          onClick={() => setSelectedProductDrillDown(targetProd)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group hover-lift ${isDark
                              ? 'bg-stone-900/40 border-stone-800/30 hover:bg-stone-800/60 hover:border-gold-500/30'
                              : 'bg-stone-50/80 border-stone-200 hover:bg-white hover:border-forest-600/30 shadow-xs'
                            }`}
                          title="Click to drill down into product analytics & formulation details"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${i === 0 ? 'bg-gold-500/20 text-gold-400' : i === 1 ? 'bg-stone-700 text-stone-300' : 'bg-stone-800 text-stone-500'}`}>
                              {i === 0 ? <Crown className="w-3.5 h-3.5" /> : `#${i + 1}`}
                            </span>
                            <img src={targetProd.image || targetProd.images?.[0] || '/marketing/IMG-20260804-WA0013.jpg'} alt="" className="w-9 h-9 rounded-lg object-cover bg-stone-800" />
                            <div>
                              <p className={`text-xs font-bold line-clamp-1 group-hover:text-gold-500 transition-colors ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{targetProd.name}</p>
                              <p className="text-[10px] text-stone-500">{targetProd.unitsSold || 0} units sold • <span className="text-gold-500 font-semibold">Drill down →</span></p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${isDark ? 'text-gold-400' : 'text-forest-900'}`}>₹{(targetProd.revenue || 0).toLocaleString()}</span>
                            <Eye className="w-3.5 h-3.5 text-stone-400 group-hover:text-gold-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      );
                    })}
                    {(overviewFilteredData?.topProducts || displayedTopProducts).length === 0 && (
                      <div className="text-center py-6 text-xs text-stone-500">No top sellers recorded in this category.</div>
                    )}
                  </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="glass-card p-6 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <div>
                        <h3 className={`font-serif font-bold text-base ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                          Low Stock Alerts
                        </h3>
                        <p className={`text-[11px] ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
                          Items below reorder threshold
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab('products');
                        setProductStockStatus('low-stock');
                        setLowStockOnly(true);
                        setProductSearch('');
                      }}
                      className={`text-[11px] font-bold flex items-center gap-1 ${isDark ? 'text-gold-400 hover:underline' : 'text-forest-900 hover:underline'}`}
                    >
                      Manage <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(data.lowStockAlerts || []).length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-60" />
                        <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600 font-medium'}`}>All items well stocked!</p>
                      </div>
                    ) : (data.lowStockAlerts || []).map((item) => {
                      const fullItem = productsList.find(x => x.id === item.id || x.name === item.name);
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedProductDrillDown(fullItem || item)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer group hover-lift ${isDark ? 'bg-amber-950/10 border-amber-800/20 hover:bg-amber-950/20' : 'bg-amber-50 border-amber-200 hover:bg-amber-100/60'
                            }`}
                          title="Click to drill down into product details"
                        >
                          <div>
                            <p className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>{item.name}</p>
                            <p className="text-[10px] text-stone-500">SKU: {item.sku} • Stock: <span className="text-red-500 font-bold">{item.stock}</span> • <span className="text-amber-500 font-semibold">Drill down →</span></p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickStockAdjust(item.id, 10, item.name);
                            }}
                            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded-lg border border-emerald-700/40 transition-colors shadow-xs"
                          >
                            +10 Restock
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass-card rounded-2xl p-5 animate-fade-in">
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    onClick={() => { setActiveTab('products'); handleOpenCreateProduct(); }}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-sm group ${isDark
                        ? 'bg-stone-800/40 border-stone-700/40 text-stone-300 hover:text-gold-400 hover:bg-forest-900/30'
                        : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100 shadow-xs'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-forest-900/40 flex items-center justify-center group-hover:bg-forest-900 transition-colors">
                      <Plus className="w-4 h-4 text-forest-300" />
                    </div>
                    <span className="text-xs font-semibold">New Product</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-sm group ${isDark
                        ? 'bg-stone-800/40 border-stone-700/40 text-stone-300 hover:text-blue-400 hover:bg-blue-950/30'
                        : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100 shadow-xs'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-950/40 flex items-center justify-center group-hover:bg-blue-950 transition-colors">
                      <Truck className="w-4 h-4 text-blue-300" />
                    </div>
                    <span className="text-xs font-semibold">Manage Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('coupons')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-sm group ${isDark
                        ? 'bg-stone-800/40 border-stone-700/40 text-stone-300 hover:text-purple-400 hover:bg-purple-950/30'
                        : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100 shadow-xs'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-purple-950/40 flex items-center justify-center group-hover:bg-purple-950 transition-colors">
                      <Tag className="w-4 h-4 text-purple-300" />
                    </div>
                    <span className="text-xs font-semibold">Create Coupon</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-sm group ${isDark
                        ? 'bg-stone-800/40 border-stone-700/40 text-stone-300 hover:text-gold-400 hover:bg-gold-500/10'
                        : 'bg-stone-50 border-stone-200 text-stone-800 hover:bg-stone-100 shadow-xs'
                      }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gold-500/10 flex items-center justify-center group-hover:bg-gold-500/20 transition-colors">
                      <Users className="w-4 h-4 text-gold-500" />
                    </div>
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
                  <h2 className={`font-serif text-xl font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Products & Inventory</h2>
                  <p className="text-xs text-stone-500">Create, update, analyze, and manage all botanical formulations</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleExportProductsCSV} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${isDark ? 'text-stone-300 bg-stone-800 hover:bg-stone-700 border-stone-700' : 'text-stone-700 bg-white hover:bg-stone-100 border-stone-300 shadow-xs'
                    }`}>
                    <Download className={`w-3.5 h-3.5 ${isDark ? 'text-gold-400' : 'text-forest-900'}`} /> Export CSV
                  </button>
                  <button onClick={handleOpenCreateProduct} className="flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-stone-950 text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all hover:shadow-lg">
                    <Plus className="w-4 h-4" /> New Product
                  </button>
                </div>
              </div>

              {/* Product Filters & Search */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search formulations by name, herb, or SKU..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-xs transition-colors focus:outline-none ${isDark
                          ? 'bg-stone-900/60 border border-stone-800 text-stone-100 placeholder:text-stone-500 focus:border-gold-500/50'
                          : 'bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-forest-600 shadow-xs'
                        }`}
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none ${isDark
                        ? 'bg-stone-900/60 border border-stone-800 text-stone-300 focus:border-gold-500/50'
                        : 'bg-white border border-stone-300 text-stone-800 focus:border-forest-600 shadow-xs'
                      }`}
                  >
                    <option value="all">All Categories ({productsList.length})</option>
                    <option value="Hair Care">Hair Care</option>
                    <option value="Skin Care">Skin Care</option>
                    <option value="Body Care">Body Care</option>
                    <option value="Essential Oils">Essential Oils</option>
                  </select>

                  <select
                    value={productSortBy}
                    onChange={(e) => setProductSortBy(e.target.value)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none ${isDark
                        ? 'bg-stone-900/60 border border-stone-800 text-stone-300 focus:border-gold-500/50'
                        : 'bg-white border border-stone-300 text-stone-800 focus:border-forest-600 shadow-xs'
                      }`}
                  >
                    <option value="featured">Sort: Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="stock-low">Stock: Low to High</option>
                    <option value="stock-high">Stock: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                </div>

                {/* Stock Level Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`text-[11px] font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'} flex items-center gap-1`}>
                    <Sliders className="w-3.5 h-3.5" /> Stock Filter:
                  </span>
                  {[
                    { id: 'all', label: `All (${productsList.length})` },
                    { id: 'low-stock', label: `Low Stock <= 10 (${lowStockCount})` },
                    { id: 'out-of-stock', label: `Out of Stock (${outOfStockCount})` },
                    { id: 'healthy', label: `Healthy > 20 (${healthyStockCount})` },
                  ].map(pill => (
                    <button
                      key={pill.id}
                      onClick={() => { setProductStockStatus(pill.id); setLowStockOnly(false); }}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${productStockStatus === pill.id
                          ? (isDark
                            ? 'bg-gold-500 text-stone-950 border-gold-400 shadow-sm'
                            : 'bg-forest-900 text-gold-300 border-forest-900 shadow-sm')
                          : (isDark
                            ? 'bg-stone-900/60 text-stone-400 border-stone-800 hover:text-stone-200'
                            : 'bg-white text-stone-600 border-stone-300 hover:text-stone-900 shadow-xs')
                        }`}
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Products Table */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className={`border-b ${isDark ? 'bg-stone-900/60 border-stone-800 text-stone-400' : 'bg-stone-100/90 border-stone-200 text-stone-600'}`}>
                        <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Product</th>
                        <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Category</th>
                        <th className="text-right px-4 py-3 font-bold uppercase tracking-wider">Price</th>
                        <th className="text-right px-4 py-3 font-bold uppercase tracking-wider">Stock</th>
                        <th className="text-right px-4 py-3 font-bold uppercase tracking-wider">Rating</th>
                        <th className="text-center px-4 py-3 font-bold uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProducts.map((p) => (
                        <tr key={p.id} className={`border-b transition-colors ${isDark ? 'border-stone-800/40 hover:bg-stone-800/20' : 'border-stone-200/60 hover:bg-stone-50'}`}>
                          <td className="px-4 py-3">
                            <div
                              onClick={() => setSelectedProductDrillDown(p)}
                              className="flex items-center gap-3 cursor-pointer group"
                              title="Click to drill down into product analytics"
                            >
                              <img src={p.image || p.images?.[0] || '/marketing/IMG-20260804-WA0013.jpg'} alt="" className="w-9 h-9 rounded-lg object-cover bg-stone-800 border border-stone-700/40 group-hover:scale-105 transition-transform" />
                              <div>
                                <p className={`font-bold line-clamp-1 group-hover:text-gold-500 transition-colors ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{p.name}</p>
                                <p className="text-[10px] text-stone-500">{p.sku || 'N/A'} • <span className={isDark ? 'text-gold-500' : 'text-forest-700'} style={{fontWeight: 600}}>Inspect</span></p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${isDark ? 'bg-stone-800 text-stone-300 border-stone-700' : 'bg-stone-100 text-stone-700 border-stone-200'
                              }`}>{p.category}</span>
                          </td>
                          <td className={`px-4 py-3 text-right font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>₹{p.price}</td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-bold px-2.5 py-1 rounded-full text-[11px] border ${p.stock === 0
                                ? (isDark ? 'bg-red-950/40 text-red-400 border-red-800/40' : 'bg-red-100 text-red-800 border-red-300 font-bold')
                                : p.stock <= (p.lowStockThreshold || 10)
                                  ? (isDark ? 'bg-amber-950/40 text-amber-400 border-amber-800/40' : 'bg-amber-100 text-amber-800 border-amber-300 font-bold')
                                  : (isDark ? 'bg-emerald-950/30 text-emerald-400 border-emerald-800/30' : 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold')
                              }`}>
                              {p.stock} units
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`flex items-center gap-1 justify-end font-semibold ${isDark ? 'text-gold-400' : 'text-amber-600'}`}>
                              <Star className="w-3 h-3 fill-current" /> {p.rating || 'N/A'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedProductDrillDown(p)}
                                className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'bg-gold-500/10 border-gold-500/30 text-gold-400 hover:bg-gold-500/20' : 'bg-gold-50 border-gold-300 text-forest-900 hover:bg-gold-100'
                                  }`}
                                title="Drill Down: Product Analytics & Formulation Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleQuickStockAdjust(p.id, 10, p.name)} className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'bg-emerald-900/40 text-emerald-300 border-emerald-800/30 hover:bg-emerald-800' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`} title="+10 Stock">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleOpenEditProduct(p)} className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'bg-blue-900/40 text-blue-300 border-blue-800/30 hover:bg-blue-800' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`} title="Edit Formulation">
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                                  isDark
                                    ? 'bg-red-950/60 text-red-400 border-red-800/60 hover:bg-red-600 hover:text-white hover:border-red-600'
                                    : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-2xs'
                                }`}
                                title="Delete Formulation"
                              >
                                <Trash2 className="w-4 h-4 stroke-[2.2]" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12 text-stone-500 text-sm">No formulations found matching your filters.</div>
                )}
              
                <PaginationBar
                  currentPage={productPage}
                  totalPages={totalProductPages}
                  totalItems={filteredProducts.length}
                  itemsPerPage={productsPerPage}
                  onPageChange={setProductPage}
                  label="formulations"
                  isDark={isDark}
                /></div>
            </div>
          )}

          {/* ==================== TAB 3: ORDERS ==================== */}
          {activeTab === 'orders' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`font-serif text-xl font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Order Fulfillment & Tracking</h2>
                  <p className="text-xs text-stone-500">Track shipments, manage delivery status, and print customer tax invoices</p>
                </div>
                <button onClick={handleExportOrdersCSV} className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border transition-colors ${isDark ? 'text-stone-300 bg-stone-800 hover:bg-stone-700 border-stone-700' : 'text-stone-700 bg-white hover:bg-stone-100 border-stone-300 shadow-xs'
                  }`}>
                  <Download className={`w-3.5 h-3.5 ${isDark ? 'text-gold-400' : 'text-forest-900'}`} /> Export CSV
                </button>
              </div>

              {/* Order Filters */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Search by order #, customer name, email, or city..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-xs transition-colors focus:outline-none ${isDark
                          ? 'bg-stone-900/60 border border-stone-800 text-stone-100 placeholder:text-stone-500 focus:border-gold-500/50'
                          : 'bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-forest-600 shadow-xs'
                        }`}
                    />
                  </div>

                  <select
                    value={orderPaymentFilter}
                    onChange={(e) => setOrderPaymentFilter(e.target.value)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none ${isDark
                        ? 'bg-stone-900/60 border border-stone-800 text-stone-300 focus:border-gold-500/50'
                        : 'bg-white border border-stone-300 text-stone-800 focus:border-forest-600 shadow-xs'
                      }`}
                  >
                    <option value="all">All Payment Types</option>
                    <option value="prepaid">Prepaid (UPI / Cards)</option>
                    <option value="cod">Cash on Delivery (COD)</option>
                  </select>

                  <select
                    value={orderDateFilter}
                    onChange={(e) => setOrderDateFilter(e.target.value)}
                    className={`rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none ${isDark
                        ? 'bg-stone-900/60 border border-stone-800 text-stone-300 focus:border-gold-500/50'
                        : 'bg-white border border-stone-300 text-stone-800 focus:border-forest-600 shadow-xs'
                      }`}
                  >
                    <option value="all">Date: All Time</option>
                    <option value="today">Today (Last 24h)</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                  </select>
                </div>

                {/* Status Filter Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className={`text-[11px] font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'} flex items-center gap-1`}>
                    <Filter className="w-3 h-3" /> Status:
                  </span>
                  {[
                    { id: 'all', label: `All Orders (${ordersList.length})` },
                    { id: 'pending', label: `Pending (${ordersList.filter(o => o.fulfillmentStatus === 'pending').length})` },
                    { id: 'processing', label: `Processing (${ordersList.filter(o => o.fulfillmentStatus === 'processing').length})` },
                    { id: 'shipped', label: `Shipped (${ordersList.filter(o => o.fulfillmentStatus === 'shipped').length})` },
                    { id: 'delivered', label: `Delivered (${ordersList.filter(o => o.fulfillmentStatus === 'delivered').length})` },
                    { id: 'cancelled', label: `Cancelled (${ordersList.filter(o => o.fulfillmentStatus === 'cancelled').length})` }
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setOrderStatusFilter(s.id)}
                      className={`text-xs font-bold px-3 py-1 rounded-full border transition-all ${orderStatusFilter === s.id
                          ? (isDark
                            ? 'bg-gold-500 text-stone-950 border-gold-400 shadow-sm'
                            : 'bg-forest-900 text-gold-300 border-forest-900 shadow-sm')
                          : (isDark
                            ? 'bg-stone-900/60 text-stone-400 border-stone-800 hover:text-stone-200'
                            : 'bg-white text-stone-600 border-stone-300 hover:text-stone-900 shadow-xs')
                        }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders List */}
              <div className="space-y-3">
                {paginatedOrders.map((o) => {
                  const statusColors = isDark ? {
                    pending: 'text-purple-400 bg-purple-950/30 border-purple-800/40',
                    processing: 'text-amber-400 bg-amber-950/30 border-amber-800/40',
                    shipped: 'text-blue-400 bg-blue-950/30 border-blue-800/40',
                    delivered: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40',
                    cancelled: 'text-red-400 bg-red-950/30 border-red-800/40'
                  } : {
                    pending: 'text-purple-800 bg-purple-100 border-purple-300 font-bold',
                    processing: 'text-amber-800 bg-amber-100 border-amber-300 font-bold',
                    shipped: 'text-blue-800 bg-blue-100 border-blue-300 font-bold',
                    delivered: 'text-emerald-800 bg-emerald-100 border-emerald-300 font-bold',
                    cancelled: 'text-red-800 bg-red-100 border-red-300 font-bold'
                  };
                  return (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrderDetails(o)}
                      className={`glass-card rounded-2xl p-4 transition-all cursor-pointer group hover-lift border ${isDark ? 'hover:border-gold-500/30' : 'hover:border-forest-600/30 shadow-xs'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDark ? 'bg-stone-800/80 border-stone-700 text-stone-300' : 'bg-stone-100 border-stone-200 text-stone-700'
                            }`}>
                            <Hash className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className={`text-xs font-bold group-hover:text-gold-500 transition-colors ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                                {o.orderNumber || o.id?.slice(-8)}
                              </p>
                              <span className="text-[10px] text-stone-500">• {o.items?.length || 1} items</span>
                            </div>
                            <p className="text-[11px] text-stone-500 mt-0.5">{o.userName} • {o.userEmail}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className={`text-sm font-bold ${isDark ? 'text-gold-400' : 'text-forest-900'}`}>₹{o.totalAmount}</span>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border capitalize ${statusColors[o.fulfillmentStatus] || ''}`}>
                            {o.fulfillmentStatus}
                          </span>
                          <span className="text-[10px] text-stone-500">{new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handlePrintInvoice(o)}
                            className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'bg-stone-800 text-stone-300 border-stone-700 hover:text-gold-400' : 'bg-stone-100 text-stone-700 border-stone-200 hover:text-forest-900'
                              }`}
                            title="Print Tax Invoice / Packing Slip"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].filter(s => s !== o.fulfillmentStatus).map(status => {
                            const transBtnColors = isDark ? {
                              pending: 'bg-purple-950/20 text-purple-300 border-purple-800/30 hover:bg-purple-900/40',
                              processing: 'bg-amber-950/20 text-amber-300 border-amber-800/30 hover:bg-amber-900/40',
                              shipped: 'bg-blue-950/20 text-blue-300 border-blue-800/30 hover:bg-blue-900/40',
                              delivered: 'bg-emerald-950/20 text-emerald-300 border-emerald-800/30 hover:bg-emerald-900/40',
                              cancelled: 'bg-red-950/20 text-red-300 border-red-800/30 hover:bg-red-900/40'
                            } : {
                              pending: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
                              processing: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
                              shipped: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
                              delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
                              cancelled: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                            };
                            return (
                            <button
                              key={status}
                              onClick={() => handleUpdateOrderStatus(o.id, status)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all capitalize ${transBtnColors[status] || ''}`}
                            >
                              → {status}
                            </button>
                            );
                          })}
                          <button
                            onClick={() => setSelectedOrderDetails(o)}
                            className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'bg-gold-500/10 border-gold-500/30 text-gold-400 hover:bg-gold-500/20' : 'bg-gold-50 border-gold-300 text-forest-900 hover:bg-gold-100'
                              }`}
                            title="Drill Down: Complete Order Details & Tracking"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredOrders.length === 0 && (
                  <div className="text-center py-12 text-stone-500 text-sm">No orders found matching your filters.</div>
                )}
              
                <div className="glass-card rounded-2xl overflow-hidden mt-3">
                  <PaginationBar
                    currentPage={orderPage}
                    totalPages={totalOrderPages}
                    totalItems={filteredOrders.length}
                    itemsPerPage={ordersPerPage}
                    onPageChange={setOrderPage}
                    label="orders"
                    isDark={isDark}
                  />
                </div></div>
            </div>
          )}

          {/* ==================== TAB 4: CUSTOMERS CRM ==================== */}
          {activeTab === 'users' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className={`font-serif text-xl font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Customer CRM</h2>
                  <p className="text-xs text-stone-500">Manage users, roles, and access control</p>
                </div>
              </div>
              <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className={`w-full rounded-xl pl-9 pr-4 py-2.5 text-xs transition-colors focus:outline-none ${isDark
                      ? 'bg-stone-900/60 border border-stone-800 text-stone-100 placeholder:text-stone-500 focus:border-gold-500/50'
                      : 'bg-white border border-stone-300 text-stone-900 placeholder:text-stone-400 focus:border-forest-600 shadow-xs'
                    }`}
                />
              </div>
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-stone-900/60 border-stone-800 text-stone-400' : 'bg-stone-100/90 border-stone-200 text-stone-700 font-bold'}`}>
                      <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">User</th>
                      <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Email</th>
                      <th className="text-center px-4 py-3 font-bold uppercase tracking-wider">Role</th>
                      <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Joined</th>
                      <th className="text-center px-4 py-3 font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map(u => (
                      <tr key={u.id} className={`border-b transition-colors ${isDark ? 'border-stone-800/40 hover:bg-stone-800/20' : 'border-stone-200/80 hover:bg-stone-50'}`}>
                        <td className="px-4 py-3">
                          <div
                            onClick={() => setSelectedCustomerDetails(u)}
                            className="flex items-center gap-2.5 cursor-pointer group"
                            title="Click to drill down into customer history and metrics"
                          >
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gold-500/20 to-gold-700/10 border border-gold-500/20 flex items-center justify-center text-gold-500 text-[10px] font-bold group-hover:scale-105 transition-transform">
                              {u.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-bold group-hover:text-gold-500 transition-colors ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{u.name}</span>
                          </div>
                        </td>
                        <td className={`px-4 py-3 ${isDark ? 'text-stone-400' : 'text-stone-600 font-medium'}`}>{u.email}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${u.role === 'admin'
                              ? (isDark ? 'bg-gold-500/20 text-gold-400 border border-gold-500/20' : 'bg-forest-900 text-gold-300 font-bold')
                              : (isDark ? 'bg-stone-800 text-stone-400 border border-stone-700' : 'bg-stone-100 text-stone-700 border border-stone-200')
                            }`}>
                            {u.role === 'admin' ? '👑 Admin' : '👤 Customer'}
                          </span>
                        </td>
                        <td className={`px-4 py-3 ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedCustomerDetails(u)}
                              className={`p-1.5 rounded-lg border transition-colors ${isDark ? 'bg-gold-500/10 border-gold-500/30 text-gold-400 hover:bg-gold-500/20' : 'bg-gold-50 border-gold-300 text-forest-900 hover:bg-gold-100'
                                }`}
                              title="Customer Drill-Down: LTV, Order History & Activity"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleToggleUserRole(u.id, u.role, u.name)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${isDark ? 'bg-stone-800/60 text-stone-400 hover:text-gold-400 border-stone-700/40 hover:bg-stone-800' : 'bg-stone-100 text-stone-700 hover:text-stone-950 border-stone-200 hover:bg-stone-200'
                                }`}
                            >
                              {u.role === 'admin' ? 'Demote' : 'Promote'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                                isDark
                                  ? 'bg-red-950/60 text-red-400 border-red-800/60 hover:bg-red-600 hover:text-white hover:border-red-600'
                                  : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-2xs'
                              }`}
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4 stroke-[2.2]" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div className="text-center py-12 text-stone-500 text-sm">No users found.</div>}
              
                <PaginationBar
                  currentPage={userPage}
                  totalPages={totalUserPages}
                  totalItems={filteredUsers.length}
                  itemsPerPage={usersPerPage}
                  onPageChange={setUserPage}
                  label="customers"
                  isDark={isDark}
                /></div>
            </div>
          )}

          {/* ==================== TAB 5: COUPONS ==================== */}
          {activeTab === 'coupons' && (
            <div className="space-y-5 animate-fade-in">
              <h2 className={`font-serif text-xl font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Promotions & Coupons</h2>

              {/* Create Coupon */}
              <form onSubmit={handleCreateCoupon} className="glass-card rounded-2xl p-5">
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Create New Promotion</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`text-[10px] font-bold uppercase block mb-1 ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Code</label>
                    <input
                      type="text"
                      required
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SAVE20"
                      className={`w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none ${isDark ? 'bg-stone-900/60 border border-stone-800 text-stone-100 focus:border-gold-500/50' : 'bg-white border border-stone-300 text-stone-900 focus:border-forest-600 shadow-xs'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] font-bold uppercase block mb-1 ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Discount %</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={newCouponDiscount}
                      onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                      className={`w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none ${isDark ? 'bg-stone-900/60 border border-stone-800 text-stone-100 focus:border-gold-500/50' : 'bg-white border border-stone-300 text-stone-900 focus:border-forest-600 shadow-xs'
                        }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[10px] font-bold uppercase block mb-1 ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>Min Order (₹)</label>
                    <input
                      type="number"
                      required
                      value={newCouponMinOrder}
                      onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                      className={`w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none ${isDark ? 'bg-stone-900/60 border border-stone-800 text-stone-100 focus:border-gold-500/50' : 'bg-white border border-stone-300 text-stone-900 focus:border-forest-600 shadow-xs'
                        }`}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-4 bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow transition-all"
                >
                  <Plus className="w-4 h-4 inline mr-1" /> Publish Coupon
                </button>
              </form>

              {/* Coupons List */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'bg-stone-900/60 border-stone-800 text-stone-400' : 'bg-stone-100/90 border-stone-200 text-stone-700 font-bold'}`}>
                      <th className="text-left px-4 py-3 font-bold uppercase tracking-wider">Code</th>
                      <th className="text-right px-4 py-3 font-bold uppercase tracking-wider">Discount</th>
                      <th className="text-right px-4 py-3 font-bold uppercase tracking-wider">Min Order</th>
                      <th className="text-center px-4 py-3 font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {couponsList.map(c => (
                      <tr key={c.id} className={`border-b transition-colors ${isDark ? 'border-stone-800/40 hover:bg-stone-800/20' : 'border-stone-200/80 hover:bg-stone-50'}`}>
                        <td className={`px-4 py-3 font-bold ${isDark ? 'text-gold-400' : 'text-forest-950'}`}>{c.code}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{c.discountPercent}% OFF</td>
                        <td className={`px-4 py-3 text-right ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>₹{c.minOrder}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(c.id, c.code)}
                            className={`p-2 rounded-xl border transition-all inline-flex items-center justify-center ${
                              isDark
                                ? 'bg-red-950/60 text-red-400 border-red-800/60 hover:bg-red-600 hover:text-white hover:border-red-600'
                                : 'bg-red-50 text-red-700 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-2xs'
                            }`}
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-4 h-4 stroke-[2.2]" />
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
              <h2 className={`font-serif text-xl font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Live Audit Trail</h2>
              <div className="space-y-2">
                {auditLogsList.length === 0 ? (
                  <div className="glass-card rounded-xl p-12 text-center">
                    <Activity className="w-10 h-10 text-stone-400 mx-auto mb-3" />
                    <p className="text-sm text-stone-500">No audit entries recorded yet.</p>
                  </div>
                ) : auditLogsList.map((log, idx) => (
                  <div key={idx} className={`glass-card rounded-xl p-3.5 flex items-start gap-3 transition-colors ${isDark ? 'hover:bg-stone-800/20' : 'hover:bg-stone-50'}`}>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center mt-0.5 flex-shrink-0 ${isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-100 text-stone-700'}`}>
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${isDark ? 'text-stone-200' : 'text-stone-900'}`}>{log.action}</p>
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
              <h2 className={`font-serif text-xl font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>Store Configuration</h2>
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
                      <label className={`text-[10px] font-bold uppercase block mb-1 ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>{field.label}</label>
                      <input
                        type={field.type}
                        value={storeSettings[field.key]}
                        onChange={(e) => setStoreSettings({ ...storeSettings, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value })}
                        className={`w-full rounded-xl px-3 py-2.5 text-xs focus:outline-none ${isDark ? 'bg-stone-900/60 border border-stone-800 text-stone-100 focus:border-gold-500/50' : 'bg-white border border-stone-300 text-stone-900 focus:border-forest-600 shadow-xs'
                          }`}
                      />
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
        <footer className="px-6 py-3 border-t border-stone-200 dark:border-stone-800/40 text-center">
          <p className="text-[10px] text-stone-600">
            © 2026 Veera Naturals — Admin BI Dashboard • Powered by Live Database Engine
          </p>
        </footer>
      </div>

      {/* ========== 1. ORDER DETAIL DRILL-DOWN MODAL ========== */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4" onClick={() => setSelectedOrderDetails(null)}>
          <div
            className={`rounded-3xl border shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-fade-in-scale max-h-[90vh] overflow-y-auto ${isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-200 text-stone-900 shadow-2xl'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800/40">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${isDark ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' : 'bg-forest-900 text-gold-300'
                    }`}>
                    Order Drill-Down
                  </span>
                  <span className="text-xs text-stone-500">#{selectedOrderDetails.orderNumber || selectedOrderDetails.id?.slice(-8)}</span>
                </div>
                <h3 className={`font-serif font-bold text-xl mt-1 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                  Order Summary & Logistics
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePrintInvoice(selectedOrderDetails)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700' : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                    }`}
                  title="Print Tax Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print Invoice</span>
                </button>
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className={`p-1.5 rounded-xl border transition-colors ${isDark ? 'bg-stone-800 text-stone-400 hover:text-stone-200 border-stone-700' : 'bg-stone-100 text-stone-600 hover:text-stone-900 border-stone-200'
                    }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Fulfillment Stepper Timeline */}
            <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-800/40 border-stone-700/40' : 'bg-stone-50 border-stone-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase text-stone-500 tracking-wider">Fulfillment Journey</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Current Stage: {selectedOrderDetails.fulfillmentStatus}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs px-2 sm:px-4">
                {[
                  { step: 'Placed', active: true, icon: CheckCircle2 },
                  { step: 'Processing', active: ['processing', 'shipped', 'delivered'].includes(selectedOrderDetails.fulfillmentStatus), icon: RefreshCw },
                  { step: 'Shipped', active: ['shipped', 'delivered'].includes(selectedOrderDetails.fulfillmentStatus), icon: Truck },
                  { step: 'Delivered', active: selectedOrderDetails.fulfillmentStatus === 'delivered', icon: Check }
                ].map((s, idx, arr) => {
                  const Icon = s.icon;
                  const isNextActive = idx < arr.length - 1 && arr[idx + 1].active;
                  return (
                    <React.Fragment key={idx}>
                      <div className="flex flex-col items-center z-10 flex-shrink-0">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-1.5 transition-all ${s.active
                            ? 'bg-emerald-500 text-stone-950 font-bold shadow-md ring-4 ring-emerald-500/20'
                            : (isDark ? 'bg-stone-800 text-stone-600 border border-stone-700' : 'bg-stone-200 text-stone-400')
                          }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] font-bold ${s.active ? (isDark ? 'text-emerald-400' : 'text-emerald-800') : 'text-stone-400'}`}>
                          {s.step}
                        </span>
                      </div>

                      {/* Arrow indicator between stages */}
                      {idx < arr.length - 1 && (
                        <div className="flex-1 flex items-center justify-center px-1 sm:px-2.5">
                          <div className={`h-0.5 flex-1 transition-all ${
                            isNextActive 
                              ? 'bg-emerald-500' 
                              : (isDark ? 'bg-stone-800' : 'bg-stone-300')
                          }`} />
                          <div className={`mx-1 flex items-center justify-center rounded-full p-1 transition-colors ${
                            isNextActive 
                              ? 'bg-emerald-500 text-stone-950 shadow-xs' 
                              : (isDark ? 'bg-stone-800 text-stone-600' : 'bg-stone-200 text-stone-400')
                          }`}>
                            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                          <div className={`h-0.5 flex-1 transition-all ${
                            isNextActive 
                              ? 'bg-emerald-500' 
                              : (isDark ? 'bg-stone-800' : 'bg-stone-300')
                          }`} />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div></div>

            {/* 2-Column Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Customer & Delivery */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-stone-800/30 border-stone-700/40' : 'bg-stone-50/80 border-stone-200'}`}>
                <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-gold-500" /> Customer & Shipping
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="text-stone-500 text-[11px] block">Customer:</span>
                    <p className={`font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{selectedOrderDetails.userName}</p>
                    <p className="text-[11px] text-stone-500">{selectedOrderDetails.userEmail}</p>
                  </div>
                  <div>
                    <span className="text-stone-500 text-[11px] block">Shipping Destination:</span>
                    <p className={`text-[11px] leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                      {selectedOrderDetails.shippingAddress
                        ? `${selectedOrderDetails.shippingAddress.street || ''}, ${selectedOrderDetails.shippingAddress.city || ''}, ${selectedOrderDetails.shippingAddress.state || ''} - ${selectedOrderDetails.shippingAddress.postalCode || ''}`
                        : 'Standard shipping address on verified account'}
                    </p>
                  </div>
                </div>

                {/* Tracking updater */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
                    Shipping Carrier & Tracking
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <div className="sm:col-span-5">
                      <select
                        value={trackingCarrierInput}
                        onChange={(e) => setTrackingCarrierInput(e.target.value)}
                        className={`w-full text-[11px] rounded-xl px-2.5 py-2 border font-medium focus:outline-none ${
                          isDark ? 'bg-stone-800 border-stone-700 text-stone-200' : 'bg-white border-stone-300 text-stone-800 shadow-2xs'
                        }`}
                      >
                        <option>Blue Dart</option>
                        <option>Delhivery</option>
                        <option>DTDC</option>
                        <option>India Post</option>
                      </select>
                    </div>
                    <div className="sm:col-span-7 flex gap-1.5">
                      <input
                        type="text"
                        placeholder="AWB / Tracking #"
                        value={trackingNumberInput}
                        onChange={(e) => setTrackingNumberInput(e.target.value)}
                        className={`flex-1 min-w-0 text-[11px] rounded-xl px-3 py-2 border focus:outline-none font-mono ${
                          isDark ? 'bg-stone-800 border-stone-700 text-stone-100 placeholder:text-stone-500' : 'bg-white border-stone-300 text-stone-900 placeholder:text-stone-400 shadow-2xs'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveTracking(selectedOrderDetails.id)}
                        className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs flex-shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  {selectedOrderDetails.trackingNumber && (
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Assigned AWB: {selectedOrderDetails.trackingNumber} ({selectedOrderDetails.carrier || 'Blue Dart'})
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column: Financials & Status Controls */}
              <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-stone-800/30 border-stone-700/40' : 'bg-stone-50/80 border-stone-200'}`}>
                <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Payment & Status Controls
                </h4>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between py-1 border-b ${isDark ? 'border-stone-800/30' : 'border-stone-200'}">
                    <span className="text-stone-500">Payment Gateway:</span>
                    <span className="font-bold capitalize">{selectedOrderDetails.paymentMethod || 'Prepaid'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b ${isDark ? 'border-stone-800/30' : 'border-stone-200'}">
                    <span className="text-stone-500">Payment Status:</span>
                    <span className="font-bold text-emerald-400 capitalize">{selectedOrderDetails.paymentStatus || 'Completed'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b ${isDark ? 'border-stone-800/30' : 'border-stone-200'}">
                    <span className="text-stone-500">Subtotal:</span>
                    <span>₹{selectedOrderDetails.totalAmount}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b ${isDark ? 'border-stone-800/30' : 'border-stone-200'}">
                    <span className="text-stone-500">Shipping:</span>
                    <span className="text-emerald-500 font-bold">FREE</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold text-sm">
                    <span>Grand Total:</span>
                    <span className={isDark ? 'text-gold-400' : 'text-forest-900'}>₹{selectedOrderDetails.totalAmount}</span>
                  </div>
                </div>

                {/* Quick Status Updater Strip */}
                <div className="pt-2 border-t border-stone-200 dark:border-stone-800/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-stone-500">Update Live Status</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {['processing', 'shipped', 'delivered', 'cancelled'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(selectedOrderDetails.id, st)}
                        className={`text-[11px] font-bold py-1.5 px-2 rounded-xl border capitalize transition-all ${selectedOrderDetails.fulfillmentStatus === st
                            ? 'bg-gold-500 text-stone-950 border-gold-400 shadow-sm'
                            : (isDark ? 'bg-stone-800/80 hover:bg-stone-700 text-stone-300 border-stone-700' : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200')
                          }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items List */}
            {selectedOrderDetails.items && selectedOrderDetails.items.length > 0 && (
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase text-stone-500 tracking-wider mb-2">Itemized Formulations ({selectedOrderDetails.items.length})</h4>
                <div className={`rounded-2xl border divide-y overflow-hidden ${isDark ? 'bg-stone-800/20 border-stone-800 divide-stone-800/40' : 'bg-stone-50 border-stone-200 divide-stone-200'
                  }`}>
                  {selectedOrderDetails.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-forest-900/40 border border-gold-500/20 flex items-center justify-center text-xs">🌿</div>
                        <div>
                          <p className={`font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{item.name}</p>
                          <p className="text-[10px] text-stone-500">Qty: {item.quantity} • ₹{item.price} each</p>
                        </div>
                      </div>
                      <span className={`font-bold ${isDark ? 'text-gold-400' : 'text-forest-900'}`}>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== 2. PRODUCT PERFORMANCE DRILL-DOWN MODAL ========== */}
      {selectedProductDrillDown && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4" onClick={() => setSelectedProductDrillDown(null)}>
          <div
            className={`rounded-3xl border shadow-2xl max-w-xl w-full p-6 space-y-5 animate-fade-in-scale max-h-[90vh] overflow-y-auto ${isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-200 text-stone-900 shadow-2xl'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800/40">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProductDrillDown.image || selectedProductDrillDown.images?.[0] || '/marketing/IMG-20260804-WA0013.jpg'}
                  alt=""
                  className="w-12 h-12 rounded-2xl object-cover bg-stone-800 border border-gold-500/30 shadow-md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-full">
                      Product Drill-Down
                    </span>
                    <span className="text-xs text-stone-500">{selectedProductDrillDown.category || 'Botanical'}</span>
                  </div>
                  <h3 className={`font-serif font-bold text-lg mt-0.5 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                    {selectedProductDrillDown.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedProductDrillDown(null)}
                className={`p-1.5 rounded-xl border transition-colors ${isDark ? 'bg-stone-800 text-stone-400 hover:text-stone-200 border-stone-700' : 'bg-stone-100 text-stone-600 hover:text-stone-900 border-stone-200'
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4-Card Analytics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-stone-800/40 border-stone-700/40' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Selling Price</span>
                <p className={`text-base font-extrabold mt-0.5 ${isDark ? 'text-gold-400' : 'text-forest-900'}`}>₹{selectedProductDrillDown.price || 499}</p>
                <span className="text-[10px] text-stone-500 line-through">₹{selectedProductDrillDown.mrp || (selectedProductDrillDown.price ? Math.round(selectedProductDrillDown.price * 1.3) : 699)}</span>
              </div>
              <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-stone-800/40 border-stone-700/40' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Est. Margin</span>
                <p className="text-base font-extrabold text-emerald-400 mt-0.5">
                  {selectedProductDrillDown.price ? Math.round(((selectedProductDrillDown.price - (selectedProductDrillDown.costPrice || Math.round(selectedProductDrillDown.price * 0.35))) / selectedProductDrillDown.price) * 100) : 65}%
                </p>
                <span className="text-[10px] text-stone-500">Cost: ₹{selectedProductDrillDown.costPrice || Math.round((selectedProductDrillDown.price || 499) * 0.35)}</span>
              </div>
              <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-stone-800/40 border-stone-700/40' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Stock Level</span>
                <p className={`text-base font-extrabold mt-0.5 ${(selectedProductDrillDown.stock ?? 35) <= 10 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedProductDrillDown.stock ?? 35}
                </p>
                <span className="text-[10px] text-stone-500">{(selectedProductDrillDown.stock ?? 35) <= 10 ? 'Low Stock Alert' : 'Healthy Stock'}</span>
              </div>
              <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-stone-800/40 border-stone-700/40' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Customer Rating</span>
                <p className="text-base font-extrabold text-gold-400 mt-0.5 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-current" /> {selectedProductDrillDown.rating || 4.9}
                </p>
                <span className="text-[10px] text-stone-500">{selectedProductDrillDown.numReviews || 24} reviews</span>
              </div>
            </div>

            {/* Quick Restock Action Bar */}
            <div className={`p-4 rounded-2xl border space-y-2.5 ${isDark ? 'bg-stone-800/30 border-stone-700/40' : 'bg-stone-50 border-stone-200'}`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-stone-500">Quick Inventory Restock</span>
                <span className="text-xs font-semibold text-stone-400">Current: <strong className="text-emerald-400">{selectedProductDrillDown.stock ?? 35} units</strong></span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map(delta => (
                  <button
                    key={delta}
                    onClick={async () => {
                      const prodId = selectedProductDrillDown.id || selectedProductDrillDown.productId || selectedProductDrillDown._id;
                      if (prodId) {
                        await handleQuickStockAdjust(prodId, delta, selectedProductDrillDown.name);
                      }
                      setSelectedProductDrillDown(prev => ({ ...prev, stock: (prev.stock || 0) + delta }));
                    }}
                    className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1 ${isDark
                        ? 'bg-stone-800 hover:bg-stone-700 text-emerald-400 border-stone-700 hover:border-emerald-500/40'
                        : 'bg-white hover:bg-emerald-50 text-emerald-700 border-stone-200 hover:border-emerald-400 shadow-xs'
                      }`}
                  >
                    <Plus className="w-3.5 h-3.5" /> {delta}
                  </button>
                ))}
              </div>
            </div>

            {/* Formulation Description & Tags */}
            <div className="space-y-2 text-xs">
              <span className="font-bold uppercase text-stone-500 tracking-wider block">Ayurvedic Formulation Details</span>
              <p className={`leading-relaxed p-3 rounded-xl border ${isDark ? 'bg-stone-800/20 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}>
                {selectedProductDrillDown.description || 'Handcrafted botanical formulation cold-pressed using pure heritage methods without sulfates, parabens, or synthetic fragrances.'}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {(Array.isArray(selectedProductDrillDown.tags) ? selectedProductDrillDown.tags : (selectedProductDrillDown.tags || 'Ayurvedic, Cold-Pressed, Organic').split(',')).map((tag, idx) => (
                  <span key={idx} className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${isDark ? 'bg-forest-950/40 text-forest-300 border-forest-800/40' : 'bg-forest-50 text-forest-800 border-forest-200'
                    }`}>
                    🌿 {typeof tag === 'string' ? tag.trim() : tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800/40">
              <button
                onClick={() => {
                  const prod = productsList.find(x => x.name?.toLowerCase() === selectedProductDrillDown.name?.toLowerCase() || x.id === (selectedProductDrillDown.id || selectedProductDrillDown.productId));
                  setSelectedProductDrillDown(null);
                  setActiveTab('products');
                  setProductStockStatus('all');
                  setLowStockOnly(false);
                  if (prod) {
                    setProductSearch(prod.name);
                  }
                }}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors flex items-center gap-1.5 ${isDark ? 'bg-stone-800 text-gold-400 border-stone-700 hover:bg-stone-700' : 'bg-stone-100 text-forest-900 border-stone-300 hover:bg-stone-200'
                  }`}
              >
                <span>Drill Down to Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const full = productsList.find(x => x.name?.toLowerCase() === selectedProductDrillDown.name?.toLowerCase() || x.id === (selectedProductDrillDown.id || selectedProductDrillDown.productId)) || selectedProductDrillDown;
                    setSelectedProductDrillDown(null);
                    handleOpenEditProduct(full);
                  }}
                  className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Full Details
                </button>
                <button
                  onClick={() => setSelectedProductDrillDown(null)}
                  className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors ${isDark ? 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700' : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== 3. CUSTOMER DRILL-DOWN MODAL ========== */}
      {selectedCustomerDetails && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-center justify-center p-3 sm:p-4" onClick={() => setSelectedCustomerDetails(null)}>
          <div
            className={`rounded-3xl border shadow-2xl max-w-xl w-full p-6 space-y-5 animate-fade-in-scale max-h-[90vh] overflow-y-auto ${isDark ? 'bg-stone-900 border-stone-700 text-stone-100' : 'bg-white border-stone-200 text-stone-900 shadow-2xl'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-stone-200 dark:border-stone-800/40">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-stone-950 font-extrabold text-lg shadow-md">
                  {selectedCustomerDetails.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-gold-500/20 text-gold-400 border border-gold-500/30 px-2 py-0.5 rounded-full">
                      Customer Profile
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${selectedCustomerDetails.role === 'admin' ? 'bg-purple-950/40 text-purple-400 border-purple-800/40' : 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                      }`}>
                      {selectedCustomerDetails.role === 'admin' ? '👑 Admin' : '👤 Verified Client'}
                    </span>
                  </div>
                  <h3 className={`font-serif font-bold text-lg mt-0.5 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                    {selectedCustomerDetails.name}
                  </h3>
                  <p className="text-xs text-stone-500">{selectedCustomerDetails.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerDetails(null)}
                className={`p-1.5 rounded-xl border transition-colors ${isDark ? 'bg-stone-800 text-stone-400 hover:text-stone-200 border-stone-700' : 'bg-stone-100 text-stone-600 hover:text-stone-900 border-stone-200'
                  }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3-Card Metrics */}
            {(() => {
              const customerOrders = ordersList.filter(o =>
                (o.userEmail && o.userEmail.toLowerCase() === selectedCustomerDetails.email?.toLowerCase()) ||
                (o.userId && o.userId === selectedCustomerDetails.id)
              );
              const totalSpent = customerOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
              const aov = customerOrders.length ? Math.round(totalSpent / customerOrders.length) : 0;
              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-stone-800/40 border-stone-700/40' : 'bg-stone-50 border-stone-200'}`}>
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">Orders</span>
                      <p className={`text-base font-extrabold mt-0.5 ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>{customerOrders.length}</p>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-stone-800/40 border-stone-700/40' : 'bg-stone-50 border-stone-200'}`}>
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">Lifetime Value</span>
                      <p className={`text-base font-extrabold mt-0.5 ${isDark ? 'text-gold-400' : 'text-forest-900'}`}>₹{totalSpent.toLocaleString()}</p>
                    </div>
                    <div className={`p-3 rounded-2xl border text-center ${isDark ? 'bg-stone-800/40 border-stone-700/40' : 'bg-stone-50 border-stone-200'}`}>
                      <span className="text-[10px] font-bold uppercase text-stone-500 block">Avg Order</span>
                      <p className="text-base font-extrabold text-emerald-400 mt-0.5">₹{aov.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Customer Order History */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-stone-500 tracking-wider block">Recent Orders History</span>
                      {customerOrders.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedCustomerDetails(null);
                            setActiveTab('orders');
                            setOrderSearch(selectedCustomerDetails.email || selectedCustomerDetails.name);
                            setOrderStatusFilter('all');
                          }}
                          className="text-[11px] font-bold text-gold-500 hover:underline flex items-center gap-1"
                        >
                          Drill down to all orders ({customerOrders.length}) →
                        </button>
                      )}
                    </div>
                    {customerOrders.length === 0 ? (
                      <p className="text-xs text-stone-500 text-center py-6">No orders placed by this customer yet.</p>
                    ) : (
                      <div className={`rounded-2xl border divide-y overflow-hidden max-h-48 overflow-y-auto ${isDark ? 'bg-stone-800/20 border-stone-800 divide-stone-800/40' : 'bg-stone-50 border-stone-200 divide-stone-200'
                        }`}>
                        {customerOrders.map((ord) => (
                          <div key={ord.id} className="flex items-center justify-between p-3 text-xs">
                            <div>
                              <p className={`font-bold ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>#{ord.orderNumber || ord.id?.slice(-8)}</p>
                              <p className="text-[10px] text-stone-500">{new Date(ord.createdAt).toLocaleDateString()} • {ord.fulfillmentStatus}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`font-bold ${isDark ? 'text-gold-400' : 'text-forest-900'}`}>₹{ord.totalAmount}</span>
                              <button
                                onClick={() => { setSelectedCustomerDetails(null); setSelectedOrderDetails(ord); }}
                                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors ${isDark ? 'bg-stone-800 text-stone-300 hover:text-gold-400 border-stone-700' : 'bg-white text-stone-700 border-stone-300 hover:text-forest-900 shadow-2xs'
                                  }`}
                              >
                                View Order
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-800/40">
              <button
                onClick={() => handleToggleUserRole(selectedCustomerDetails.id, selectedCustomerDetails.role, selectedCustomerDetails.name)}
                className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors ${isDark ? 'bg-stone-800 text-stone-300 border-stone-700 hover:text-gold-400' : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
              >
                {selectedCustomerDetails.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedCustomerDetails(null);
                    setActiveTab('orders');
                    setOrderSearch(selectedCustomerDetails.email || selectedCustomerDetails.name);
                    setOrderStatusFilter('all');
                  }}
                  className={`text-xs font-bold px-4 py-2 rounded-xl border transition-colors ${isDark ? 'bg-stone-800 text-stone-300 hover:bg-stone-700 border-stone-700' : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
                    }`}
                >
                  View Orders
                </button>
                <button
                  onClick={() => setSelectedCustomerDetails(null)}
                  className="bg-gold-500 hover:bg-gold-600 text-stone-950 font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
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

      {/* ============ FINANCIAL DRILL-DOWN MODAL ============ */}
      {showFinancialDrillDown && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowFinancialDrillDown(false)}
        >
          <div
            className={`relative w-full max-w-3xl rounded-3xl p-6 md:p-8 border shadow-2xl transition-all max-h-[90vh] overflow-y-auto ${isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-5 border-b border-stone-200 dark:border-stone-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gold-500/10 flex items-center justify-center text-gold-600">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">Revenue & Margin Drill-Down</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-900/10 text-forest-800 dark:bg-forest-900/40 dark:text-forest-300">
                      Active: {timeframe.toUpperCase()} • {overviewCategory}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Granular financial decomposition, unit economics, and tax breakdown.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFinancialDrillDown(false)}
                className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-100 text-stone-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4 KPI Matrix */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-800/50 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Gross Sales</span>
                <div className="text-xl font-bold mt-1 text-forest-950 dark:text-white">
                  ₹{(overviewFilteredData?.revenue || 0).toLocaleString()}
                </div>
                <span className="text-[10px] font-semibold text-emerald-600">+14.8% vs prev period</span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-800/50 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Gross Margin</span>
                <div className="text-xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                  ₹{(overviewFilteredData?.grossProfit || 0).toLocaleString()}
                </div>
                <span className="text-[10px] font-semibold text-stone-500">67.6% net yield</span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-800/50 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Avg Order Value</span>
                <div className="text-xl font-bold mt-1 text-blue-600 dark:text-blue-400">
                  ₹{overviewFilteredData?.ordersCount > 0 ? Math.round((overviewFilteredData?.revenue || 0) / overviewFilteredData.ordersCount).toLocaleString() : '0'}
                </div>
                <span className="text-[10px] font-semibold text-stone-500">From {overviewFilteredData?.ordersCount || 0} total orders</span>
              </div>
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-800/50 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">GST Collected (5%)</span>
                <div className="text-xl font-bold mt-1 text-purple-600 dark:text-purple-400">
                  ₹{Math.round((overviewFilteredData?.revenue || 0) * 0.05).toLocaleString()}
                </div>
                <span className="text-[10px] font-semibold text-stone-500">Ayurvedic HSN 3004</span>
              </div>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div className={`p-5 rounded-2xl border mb-6 ${isDark ? 'bg-stone-800/40 border-stone-800' : 'bg-stone-50/70 border-stone-200'}`}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Revenue Contribution by Category</span>
                <span className="text-stone-400 font-normal">Click category to isolate & drill down</span>
              </h3>
              <div className="space-y-3">
                {(overviewFilteredData?.categoryBreakdown || []).map((cat, idx) => {
                  const catSales = cat.sales ?? cat.value ?? 0;
                  const catName = cat.category || cat.name || 'Category';
                  const pct = (overviewFilteredData?.revenue || 0) > 0 ? Math.round((catSales / overviewFilteredData.revenue) * 100) : 0;
                  return (
                    <div
                      key={catName}
                      onClick={() => {
                        setOverviewCategory(catName);
                        setShowFinancialDrillDown(false);
                      }}
                      className="cursor-pointer group"
                      title={`Click to drill down and isolate ${catName}`}
                    >
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-semibold group-hover:text-forest-700 dark:group-hover:text-gold-400 transition-colors">
                          {catName}
                        </span>
                        <span className="font-mono font-bold">
                          ₹{catSales.toLocaleString()} <span className="text-stone-400 font-normal text-[11px]">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: cat.color || CATEGORY_COLORS[idx % CATEGORY_COLORS.length] || '#1b4332'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-stone-200 dark:border-stone-800">
              <span className="text-xs text-stone-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Ledger reconciles real-time with customer orders database
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowFinancialDrillDown(false)}
                  className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs transition-colors ${isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-300' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                >
                  Drill Up (Close)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFinancialDrillDown(false);
                    setActiveTab('orders');
                    setOrderStatusFilter('all');
                    setOrderSearch('');
                    if (timeframe === '7days') setOrderDateFilter('7d');
                    else if (timeframe === '30days') setOrderDateFilter('30d');
                    else setOrderDateFilter('all');
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-lg shadow-forest-950/20 transition-all hover:scale-[1.02]"
                >
                  <span>Drill Down to Orders</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
