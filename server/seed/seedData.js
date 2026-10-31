const bcrypt = require('bcryptjs');
const { getStore, saveStore } = require('../data/store');

const seedDatabase = async () => {
  console.log('🌿 [Veera Naturals Seeder] Initializing seed data...');
  const store = getStore();

  // Reset collections
  store.users = [];
  store.products = [];
  store.orders = [];

  // 1. Create Administrator
  const adminPasswordHash = await bcrypt.hash('Admin@Veera2026', 10);
  const adminUser = {
    id: 'usr_admin_001',
    name: 'Veera Administrator',
    email: 'admin@veeranaturals.com',
    password: adminPasswordHash,
    role: 'admin',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    addresses: [{
      street: 'Veera Naturals HQ, 42 Botanical Gardens Road',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      pincode: '641006',
      country: 'India',
      isDefault: true
    }],
    createdAt: '2026-01-10T10:00:00.000Z'
  };
  store.users.push(adminUser);

  // 2. Create Sample Customers
  const customerPasswordHash = await bcrypt.hash('Customer@123', 10);
  const customers = [
    {
      id: 'usr_cust_001',
      name: 'Priya Sundaram',
      email: 'customer@veeranaturals.com',
      password: customerPasswordHash,
      role: 'user',
      phone: '+91 98401 23456',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      addresses: [{
        street: 'Flat 4B, Green Meadows, Indira Nagar',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        country: 'India',
        isDefault: true
      }],
      createdAt: '2026-03-15T08:30:00.000Z'
    },
    {
      id: 'usr_cust_002',
      name: 'Rahul Varma',
      email: 'rahul.v@gmail.com',
      password: customerPasswordHash,
      role: 'user',
      phone: '+91 97123 45678',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      addresses: [{
        street: '15/2 Lotus Enclave, Anna Nagar',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600040',
        country: 'India',
        isDefault: true
      }],
      createdAt: '2026-04-02T11:15:00.000Z'
    },
    {
      id: 'usr_cust_003',
      name: 'Ananya Sharma',
      email: 'ananya.s@outlook.com',
      password: customerPasswordHash,
      role: 'user',
      phone: '+91 98234 56789',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      addresses: [{
        street: 'C-302 Palm Heights, Viman Nagar',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411014',
        country: 'India',
        isDefault: true
      }],
      createdAt: '2026-05-18T14:20:00.000Z'
    },
    {
      id: 'usr_cust_004',
      name: 'Vikramaditya Roy',
      email: 'vikram.roy@yahoo.com',
      password: customerPasswordHash,
      role: 'user',
      phone: '+91 99345 67890',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      addresses: [{
        street: '88 Salt Lake City, Sector 2',
        city: 'Kolkata',
        state: 'West Bengal',
        pincode: '700091',
        country: 'India',
        isDefault: true
      }],
      createdAt: '2026-06-25T16:45:00.000Z'
    }
  ];
  customers.forEach(c => store.users.push(c));

  // 3. Populate Botanical Products
  const sampleProducts = [
    {
      id: 'prd_001',
      name: 'Veera Signature Herbal Hair Oil',
      slug: 'veera-signature-herbal-hair-oil',
      sku: 'VN-HR-001',
      category: 'Hair Care',
      categorySlug: 'hair-care',
      price: 349,
      mrp: 499,
      costPrice: 120,
      stock: 45,
      lowStockThreshold: 10,
      description: 'Handcrafted cold-pressed hair oil infused with 18 sacred Ayurvedic botanicals including Bhringraj, Amla, Brahmi, and Rosemary. Deeply nourishes the scalp and halts hair thinning.',
      ingredients: ['Cold Pressed Sesame Oil', 'Bhringraj', 'Amla', 'Rosemary Essential Oil', 'Hibiscus Petals', 'Fenugreek Seeds'],
      benefits: ['Accelerates hair growth', 'Controls premature greying', 'Cools and revitalizes scalp'],
      volume: '100 ml',
      images: [
        '/marketing/IMG-20260804-WA0013.jpg',
        'https://images.unsplash.com/photo-1608248597359-005696120366?w=600&auto=format&fit=crop&q=80'
      ],
      rating: 4.9,
      numReviews: 148,
      salesCount: 382,
      tags: ['Bestseller', '100% Organic', 'Cold-Pressed'],
      isActive: true,
      createdAt: '2026-01-15T00:00:00.000Z'
    },
    {
      id: 'prd_002',
      name: 'Veera Golden Kumkumadi Glow Serum',
      slug: 'veera-golden-kumkumadi-glow-serum',
      sku: 'VN-SK-002',
      category: 'Skin Care',
      categorySlug: 'skin-care',
      price: 699,
      mrp: 999,
      costPrice: 240,
      stock: 32,
      lowStockThreshold: 10,
      description: 'Pure authentic Kumkumadi Tailam enriched with hand-harvested Kashmiri Saffron, Indian Madder, and Blue Lotus. Restores radiant luminous complexion overnight.',
      ingredients: ['Kashmiri Kesar (Saffron)', 'Sandalwood', 'Manjistha', 'Goat Milk', 'Vetiver', 'Sesame Oil Base'],
      benefits: ['Visibly reduces dark spots', 'Restores natural golden radiance', 'Hydrates deeply without greasiness'],
      volume: '30 ml',
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1608248597359-005696120366?w=600&auto=format&fit=crop&q=80'
      ],
      rating: 4.8,
      numReviews: 96,
      salesCount: 264,
      tags: ['Bestseller', 'Ayurvedic', 'Cruelty-Free'],
      isActive: true,
      createdAt: '2026-02-01T00:00:00.000Z'
    },
    {
      id: 'prd_003',
      name: 'Veera Wild Hibiscus & Shikakai Shampoo Bar',
      slug: 'veera-wild-hibiscus-shikakai-shampoo-bar',
      sku: 'VN-HR-003',
      category: 'Hair Care',
      categorySlug: 'hair-care',
      price: 249,
      mrp: 329,
      costPrice: 65,
      stock: 58,
      lowStockThreshold: 15,
      description: 'Zero-waste concentrated solid botanical shampoo formulated with organic wild hibiscus and hand-crushed shikakai. Creates lush natural foam without synthetic SLS/SLES.',
      ingredients: ['Shikakai Pods', 'Reetha', 'Wild Hibiscus Extract', 'Cocoa Butter', 'Peppermint Oil'],
      benefits: ['Gentle pH balanced cleansing', 'Sulphate & plastic free', 'Lasts up to 60 washes'],
      volume: '85 g',
      images: [
        'https://images.unsplash.com/photo-1607006314144-a698947b1981?w=600&auto=format&fit=crop&q=80'
      ],
      rating: 4.7,
      numReviews: 74,
      salesCount: 195,
      tags: ['Zero Waste', 'Sulphate Free'],
      isActive: true,
      createdAt: '2026-02-15T00:00:00.000Z'
    },
    {
      id: 'prd_004',
      name: 'Veera Pure Steam-Distilled Rose Water',
      slug: 'veera-pure-steam-distilled-rose-water',
      sku: 'VN-SK-004',
      category: 'Skin Care',
      categorySlug: 'skin-care',
      price: 299,
      mrp: 399,
      costPrice: 90,
      stock: 40,
      lowStockThreshold: 10,
      description: 'Single-distilled hydrosol made exclusively from Rosa damascena petals harvested at dawn in Kannauj. Tightens pores and revitalizes tired skin.',
      ingredients: ['100% Pure Steam Distilled Rose Water (No alcohol, no artificial fragrance)'],
      benefits: ['Natural pH balancer', 'Soothes inflammation', 'Instant refreshing glow'],
      volume: '200 ml',
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
      ],
      rating: 4.9,
      numReviews: 112,
      salesCount: 310,
      tags: ['Bestseller', 'Pure Hydrosol'],
      isActive: true,
      createdAt: '2026-02-20T00:00:00.000Z'
    },
    {
      id: 'prd_005',
      name: 'Veera Shea & Cocoa Deep Nourish Body Butter',
      slug: 'veera-shea-cocoa-deep-nourish-body-butter',
      sku: 'VN-BD-005',
      category: 'Body Care',
      categorySlug: 'body-care',
      price: 449,
      mrp: 599,
      costPrice: 150,
      stock: 22,
      lowStockThreshold: 8,
      description: 'Rich whipped unrefined African shea butter blended with cold-pressed sweet almond oil and therapeutic sweet orange. Delivers 48-hour moisture barrier lock.',
      ingredients: ['Raw Shea Butter', 'Organic Cocoa Butter', 'Sweet Almond Oil', 'Vitamin E', 'Sweet Orange Oil'],
      benefits: ['Eliminates dry flakes', 'Deep 48h hydration', 'Decadent natural chocolate aroma'],
      volume: '150 g',
      images: [
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80'
      ],
      rating: 4.8,
      numReviews: 83,
      salesCount: 172,
      tags: ['Winter Essential', 'Deep Nourish'],
      isActive: true,
      createdAt: '2026-03-01T00:00:00.000Z'
    },
    {
      id: 'prd_006',
      name: 'Veera Arabica Espresso & Coconut Exfoliating Scrub',
      slug: 'veera-arabica-espresso-coconut-exfoliating-scrub',
      sku: 'VN-BD-006',
      category: 'Body Care',
      categorySlug: 'body-care',
      price: 379,
      mrp: 499,
      costPrice: 110,
      stock: 8, // Low stock on purpose for dashboard alert demonstration
      lowStockThreshold: 10,
      description: 'Freshly roasted Coorg Arabica coffee grounds blended with raw brown sugar and organic cold-pressed virgin coconut oil for smooth, cellulite-resistant skin.',
      ingredients: ['Coorg Arabica Coffee', 'Raw Cane Sugar', 'Virgin Coconut Oil', 'Cinnamon Bark'],
      benefits: ['Buffs away dead skin cells', 'Improves blood circulation', 'Silky soft post-shower feel'],
      volume: '120 g',
      images: [
        'https://images.unsplash.com/photo-1567928815104-b637d457635c?w=600&auto=format&fit=crop&q=80'
      ],
      rating: 4.7,
      numReviews: 61,
      salesCount: 145,
      tags: ['Low Stock', 'Organic Coffee'],
      isActive: true,
      createdAt: '2026-03-10T00:00:00.000Z'
    },
    {
      id: 'prd_007',
      name: 'Veera Pure Himalayan Lavender Essential Oil',
      slug: 'veera-pure-himalayan-lavender-essential-oil',
      sku: 'VN-EO-007',
      category: 'Essential Oils',
      categorySlug: 'essential-oils',
      price: 499,
      mrp: 649,
      costPrice: 160,
      stock: 28,
      lowStockThreshold: 10,
      description: '100% pure therapeutic grade Lavandula angustifolia harvested from high altitude Himalayan slopes. Promotes deep restful sleep and eases tension.',
      ingredients: ['100% Steam Distilled Himalayan Lavender Essential Oil'],
      benefits: ['Aromatherapy for stress relief', 'Promotes sound sleep', 'Calms minor skin irritations'],
      volume: '15 ml',
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80'
      ],
      rating: 4.9,
      numReviews: 95,
      salesCount: 210,
      tags: ['Aromatherapy', '100% Pure'],
      isActive: true,
      createdAt: '2026-03-20T00:00:00.000Z'
    },
    {
      id: 'prd_008',
      name: 'Veera Sweet Orange Mood Booster Essential Oil',
      slug: 'veera-sweet-orange-mood-booster-essential-oil',
      sku: 'VN-EO-008',
      category: 'Essential Oils',
      categorySlug: 'essential-oils',
      price: 389,
      mrp: 499,
      costPrice: 110,
      stock: 35,
      lowStockThreshold: 10,
      description: 'Cold-pressed from sunny citrus rinds. Refreshing uplifting aroma that purifies ambient air and infuses invigorating cheer into any room.',
      ingredients: ['100% Cold Pressed Citrus Sinensis (Orange) Peel Oil'],
      benefits: ['Energizing mood enhancer', 'Natural home air freshener', 'Rich in d-limonene'],
      volume: '15 ml',
      images: [
        'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80'
      ],
      rating: 4.8,
      numReviews: 44,
      salesCount: 118,
      tags: ['Energizing', 'Cold-Pressed'],
      isActive: true,
      createdAt: '2026-04-05T00:00:00.000Z'
    },
    {
      id: 'prd_009',
      name: 'Veera Neem & Tea Tree Purifying Face Cleanser',
      slug: 'veera-neem-tea-tree-purifying-face-cleanser',
      sku: 'VN-SK-009',
      category: 'Skin Care',
      categorySlug: 'skin-care',
      price: 279,
      mrp: 349,
      costPrice: 85,
      stock: 5, // Low stock alert
      lowStockThreshold: 10,
      description: 'Gentle clarifying botanical wash with freshly pressed neem leaves, Australian tea tree oil, and pure aloe vera gel. Clear blemishes without stripping moisture.',
      ingredients: ['Neem Leaf Extract', 'Tea Tree Oil', 'Aloe Vera Juice', 'Basil (Tulsi) Extract'],
      benefits: ['Controls excess oil & breakouts', 'Unclogs congested pores', 'Gentle non-drying formula'],
      volume: '100 ml',
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80'
      ],
      rating: 4.6,
      numReviews: 53,
      salesCount: 162,
      tags: ['Acne Defense', 'Low Stock'],
      isActive: true,
      createdAt: '2026-04-12T00:00:00.000Z'
    }
  ];
  sampleProducts.forEach(p => store.products.push(p));

  // 4. Generate Realistic Historical & Current Orders for Admin BI Analytics
  const sampleOrders = [
    {
      id: 'ord_101',
      orderNumber: 'VN-842910',
      userId: 'usr_cust_001',
      userName: 'Priya Sundaram',
      userEmail: 'customer@veeranaturals.com',
      items: [
        { productId: 'prd_001', name: 'Veera Signature Herbal Hair Oil', price: 349, quantity: 2, image: '/marketing/IMG-20260804-WA0013.jpg', category: 'Hair Care' },
        { productId: 'prd_002', name: 'Veera Golden Kumkumadi Glow Serum', price: 699, quantity: 1, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80', category: 'Skin Care' }
      ],
      shippingAddress: { street: 'Flat 4B, Green Meadows', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', country: 'India' },
      subtotal: 1397,
      discount: 139,
      shipping: 0,
      tax: 62,
      totalAmount: 1320,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      fulfillmentStatus: 'delivered',
      couponCode: 'VEERA10',
      createdAt: '2026-10-25T14:20:00.000Z',
      updatedAt: '2026-10-27T10:00:00.000Z'
    },
    {
      id: 'ord_102',
      orderNumber: 'VN-842911',
      userId: 'usr_cust_002',
      userName: 'Rahul Varma',
      userEmail: 'rahul.v@gmail.com',
      items: [
        { productId: 'prd_003', name: 'Veera Wild Hibiscus & Shikakai Shampoo Bar', price: 249, quantity: 2, image: 'https://images.unsplash.com/photo-1607006314144-a698947b1981?w=600&auto=format&fit=crop&q=80', category: 'Hair Care' },
        { productId: 'prd_007', name: 'Veera Pure Himalayan Lavender Essential Oil', price: 499, quantity: 1, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&auto=format&fit=crop&q=80', category: 'Essential Oils' }
      ],
      shippingAddress: { street: '15/2 Lotus Enclave', city: 'Chennai', state: 'Tamil Nadu', pincode: '600040', country: 'India' },
      subtotal: 997,
      discount: 0,
      shipping: 0,
      tax: 49,
      totalAmount: 1046,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      fulfillmentStatus: 'shipped',
      createdAt: '2026-10-27T11:10:00.000Z',
      updatedAt: '2026-10-28T09:30:00.000Z'
    },
    {
      id: 'ord_103',
      orderNumber: 'VN-842912',
      userId: 'usr_cust_003',
      userName: 'Ananya Sharma',
      userEmail: 'ananya.s@outlook.com',
      items: [
        { productId: 'prd_004', name: 'Veera Pure Steam-Distilled Rose Water', price: 299, quantity: 1, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80', category: 'Skin Care' },
        { productId: 'prd_005', name: 'Veera Shea & Cocoa Deep Nourish Body Butter', price: 449, quantity: 1, image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&auto=format&fit=crop&q=80', category: 'Body Care' }
      ],
      shippingAddress: { street: 'C-302 Palm Heights', city: 'Pune', state: 'Maharashtra', pincode: '411014', country: 'India' },
      subtotal: 748,
      discount: 0,
      shipping: 0,
      tax: 37,
      totalAmount: 785,
      paymentMethod: 'card',
      paymentStatus: 'paid',
      fulfillmentStatus: 'processing',
      createdAt: '2026-10-28T16:40:00.000Z',
      updatedAt: '2026-10-28T16:40:00.000Z'
    },
    {
      id: 'ord_104',
      orderNumber: 'VN-842913',
      userId: 'usr_cust_004',
      userName: 'Vikramaditya Roy',
      userEmail: 'vikram.roy@yahoo.com',
      items: [
        { productId: 'prd_001', name: 'Veera Signature Herbal Hair Oil', price: 349, quantity: 3, image: '/marketing/IMG-20260804-WA0013.jpg', category: 'Hair Care' }
      ],
      shippingAddress: { street: '88 Salt Lake City', city: 'Kolkata', state: 'West Bengal', pincode: '700091', country: 'India' },
      subtotal: 1047,
      discount: 104,
      shipping: 0,
      tax: 47,
      totalAmount: 990,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      fulfillmentStatus: 'pending',
      couponCode: 'VEERA10',
      createdAt: '2026-10-29T10:15:00.000Z',
      updatedAt: '2026-10-29T10:15:00.000Z'
    },
    // Past months orders for revenue trends in BI
    {
      id: 'ord_095',
      orderNumber: 'VN-821044',
      userId: 'usr_cust_001',
      userName: 'Priya Sundaram',
      userEmail: 'customer@veeranaturals.com',
      items: [{ productId: 'prd_002', name: 'Veera Golden Kumkumadi Glow Serum', price: 699, quantity: 2, category: 'Skin Care' }],
      subtotal: 1398, discount: 0, shipping: 0, tax: 69, totalAmount: 1467,
      paymentMethod: 'razorpay', paymentStatus: 'paid', fulfillmentStatus: 'delivered',
      createdAt: '2026-09-14T11:00:00.000Z'
    },
    {
      id: 'ord_090',
      orderNumber: 'VN-810452',
      userId: 'usr_cust_002',
      userName: 'Rahul Varma',
      userEmail: 'rahul.v@gmail.com',
      items: [{ productId: 'prd_001', name: 'Veera Signature Herbal Hair Oil', price: 349, quantity: 4, category: 'Hair Care' }],
      subtotal: 1396, discount: 100, shipping: 0, tax: 64, totalAmount: 1360,
      paymentMethod: 'razorpay', paymentStatus: 'paid', fulfillmentStatus: 'delivered',
      createdAt: '2026-08-20T15:30:00.000Z'
    },
    {
      id: 'ord_085',
      orderNumber: 'VN-799214',
      userId: 'usr_cust_003',
      userName: 'Ananya Sharma',
      userEmail: 'ananya.s@outlook.com',
      items: [{ productId: 'prd_007', name: 'Veera Pure Himalayan Lavender Essential Oil', price: 499, quantity: 3, category: 'Essential Oils' }],
      subtotal: 1497, discount: 0, shipping: 0, tax: 74, totalAmount: 1571,
      paymentMethod: 'card', paymentStatus: 'paid', fulfillmentStatus: 'delivered',
      createdAt: '2026-07-18T10:20:00.000Z'
    },
    {
      id: 'ord_080',
      orderNumber: 'VN-782101',
      userId: 'usr_cust_004',
      userName: 'Vikramaditya Roy',
      userEmail: 'vikram.roy@yahoo.com',
      items: [{ productId: 'prd_005', name: 'Veera Shea & Cocoa Deep Nourish Body Butter', price: 449, quantity: 2, category: 'Body Care' }],
      subtotal: 898, discount: 0, shipping: 0, tax: 44, totalAmount: 942,
      paymentMethod: 'upi', paymentStatus: 'paid', fulfillmentStatus: 'delivered',
      createdAt: '2026-06-11T13:40:00.000Z'
    },
    {
      id: 'ord_075',
      orderNumber: 'VN-770412',
      userId: 'usr_cust_001',
      userName: 'Priya Sundaram',
      userEmail: 'customer@veeranaturals.com',
      items: [{ productId: 'prd_004', name: 'Veera Pure Steam-Distilled Rose Water', price: 299, quantity: 3, category: 'Skin Care' }],
      subtotal: 897, discount: 0, shipping: 0, tax: 44, totalAmount: 941,
      paymentMethod: 'razorpay', paymentStatus: 'paid', fulfillmentStatus: 'delivered',
      createdAt: '2026-05-22T09:15:00.000Z'
    }
  ];
  sampleOrders.forEach(o => store.orders.push(o));

  saveStore();
  console.log('✅ [Veera Naturals Seeder] Seeding finished successfully!');
  console.log('👑 Admin: admin@veeranaturals.com / Admin@Veera2026');
  console.log('👤 Customer: customer@veeranaturals.com / Customer@123');
};

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = { seedDatabase };
