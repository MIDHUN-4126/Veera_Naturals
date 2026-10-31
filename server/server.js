const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { connectDB, getDBStatus } = require('./config/db');
const { getStore } = require('./data/store');
const { seedDatabase } = require('./seed/seedData');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Serve uploaded or marketing static files
app.use('/marketing', express.static(path.join(__dirname, '../client/public/marketing')));
app.use('/products', express.static(path.join(__dirname, '../client/public/products')));
app.use('/images', express.static(path.join(__dirname, '../client/public/images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check & DB Status
app.get('/api/health', (req, res) => {
  const store = getStore();
  res.status(200).json({
    status: 'online',
    appName: 'Veera Naturals Full-Stack Platform',
    version: '1.0.0',
    db: getDBStatus(),
    metrics: {
      users: (store.users || []).length,
      products: (store.products || []).length,
      orders: (store.orders || []).length
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);

// Serve Client Static Build if available
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  // If request is for API that wasn't matched, return 404 json
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, message: 'API Route Not Found' });
  }
  // Otherwise serve client SPA index.html
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Check if store needs initial seed
  const store = getStore();
  if (!store.users || store.users.length === 0 || !store.products || store.products.length === 0) {
    console.log('🌱 No data detected in store. Auto-seeding initial database...');
    await seedDatabase();
  }

  // Start HTTP server immediately so browser connects instantly
  app.listen(PORT, () => {
    console.log(`🌿 [Veera Naturals API Server] running on http://localhost:${PORT}`);
    console.log(`👑 Admin Login: admin@veeranaturals.com (Password: Admin@Veera2026)`);
    console.log(`👤 Customer Login: customer@veeranaturals.com (Password: Customer@123)`);
  });

  // Attempt MongoDB connection in background
  connectDB().catch(() => {});
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
