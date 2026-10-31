const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, 'store.json');

// Default initial state
const getInitialState = () => ({
  users: [],
  products: [],
  categories: [
    { id: 'cat-1', name: 'Hair Care', slug: 'hair-care', description: 'Nourishing herbal hair oils, cleansers and serums', icon: '💆' },
    { id: 'cat-2', name: 'Skin Care', slug: 'skin-care', description: 'Pure botanical creams, face packs and natural toners', icon: '✨' },
    { id: 'cat-3', name: 'Body Care', slug: 'body-care', description: 'Organic scrubs, soaps and herbal body lotions', icon: '🧴' },
    { id: 'cat-4', name: 'Essential Oils', slug: 'essential-oils', description: 'Steam-distilled 100% pure therapeutic oils', icon: '🫧' }
  ],
  orders: [],
  coupons: [
    { id: 'cpn-1', code: 'VEERA10', discountPercent: 10, minOrder: 500, active: true },
    { id: 'cpn-2', code: 'WELCOME20', discountPercent: 20, minOrder: 1000, active: true }
  ],
  carts: {}, // { userId: [ { productId, quantity } ] }
  auditLogs: [],
  settings: {
    storeName: 'Veera Naturals',
    taxRatePercent: 5,
    freeShippingThreshold: 499,
    standardShippingFee: 50,
    supportEmail: 'care@veeranaturals.com',
    currency: 'INR',
    currencySymbol: '₹'
  }
});

let cache = null;

const loadStore = () => {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = fs.readFileSync(STORE_PATH, 'utf-8');
      cache = JSON.parse(data);
    } else {
      cache = getInitialState();
      saveStore();
    }
  } catch (err) {
    console.error('Error reading store.json, resetting to initial state:', err.message);
    cache = getInitialState();
  }
  return cache;
};

const saveStore = () => {
  try {
    if (!cache) cache = getInitialState();
    fs.writeFileSync(STORE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store.json:', err.message);
  }
};

const addAuditLog = (action, details, actor = 'Administrator') => {
  const store = loadStore();
  if (!store.auditLogs) store.auditLogs = [];
  const logEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    action,
    details,
    actor,
    timestamp: new Date().toISOString()
  };
  store.auditLogs.unshift(logEntry);
  // Keep last 150 audit records
  if (store.auditLogs.length > 150) store.auditLogs = store.auditLogs.slice(0, 150);
  saveStore();
  return logEntry;
};

module.exports = {
  getStore: loadStore,
  saveStore,
  addAuditLog,
  resetStore: () => {
    cache = getInitialState();
    saveStore();
    return cache;
  }
};
