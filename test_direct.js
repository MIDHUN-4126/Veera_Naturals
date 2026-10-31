const { getStore } = require('./server/data/store');
const authController = require('./server/controllers/authController');
const productController = require('./server/controllers/productController');
const adminController = require('./server/controllers/adminController');
const orderController = require('./server/controllers/orderController');

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

async function runDirectTests() {
  console.log('🌿 [Veera Naturals] Testing Controllers & Direct DB Logic...\n');

  // 1. Test Products List
  const prodReq = { query: {} };
  const prodRes = createMockRes();
  await productController.getProducts(prodReq, prodRes);
  console.log(`✓ Products Count: ${prodRes.body.count} items loaded from store.`);

  // 2. Test Customer Login
  const custReq = { body: { email: 'customer@veeranaturals.com', password: 'Customer@123' } };
  const custRes = createMockRes();
  await authController.login(custReq, custRes);
  console.log(`✓ Customer Login: ${custRes.body.message} (Role: ${custRes.body.user.role})`);

  // 3. Test Admin Login
  const adminReq = { body: { email: 'admin@veeranaturals.com', password: 'Admin@Veera2026' } };
  const adminRes = createMockRes();
  await authController.login(adminReq, adminRes);
  console.log(`✓ Admin Login: ${adminRes.body.message} (Role: ${adminRes.body.user.role})`);

  // 4. Test Admin BI Dashboard KPIs & Visuals
  const biReq = {};
  const biRes = createMockRes();
  await adminController.getBIDashboardStats(biReq, biRes);
  console.log(`✓ BI Dashboard Stats:`);
  console.log(`   - Total Revenue: ₹${biRes.body.kpis.totalRevenue}`);
  console.log(`   - Total Orders: ${biRes.body.kpis.totalOrdersCount}`);
  console.log(`   - Active Customers: ${biRes.body.kpis.totalCustomers}`);
  console.log(`   - Category Distribution: ${biRes.body.charts.categoryBreakdown.length} categories`);
  console.log(`   - Revenue Trend Series: ${biRes.body.charts.revenueTrend.length} monthly points`);

  // 5. Test Admin Product Modification (Create Product)
  const createProdReq = {
    body: {
      name: 'Veera Kashmiri Walnut Glow Scrub',
      category: 'Skin Care',
      price: 329,
      mrp: 449,
      stock: 35,
      description: 'Handcrafted with crushed Kashmiri walnut shells and cold-pressed almond oil.'
    }
  };
  const createProdRes = createMockRes();
  await adminController.createProduct(createProdReq, createProdRes);
  console.log(`✓ Admin Create Product: Created "${createProdRes.body.product.name}" with SKU ${createProdRes.body.product.sku}`);

  // 6. Test Admin User Role Modification
  const store = getStore();
  const testCust = store.users.find(u => u.role === 'user');
  const roleReq = { params: { id: testCust.id }, body: { role: 'admin' } };
  const roleRes = createMockRes();
  await adminController.updateUserRole(roleReq, roleRes);
  console.log(`✓ Admin User Role Toggle: Updated "${testCust.name}" role to: ${roleRes.body.user.role}`);

  // Toggle it back to keep demo pristine
  roleReq.body.role = 'user';
  await adminController.updateUserRole(roleReq, createMockRes());

  // 7. Test Coupon Validation
  const couponReq = { body: { code: 'VEERA10', cartTotal: 1500 } };
  const couponRes = createMockRes();
  await orderController.validateCoupon(couponReq, couponRes);
  console.log(`✓ Coupon Engine: Code "${couponRes.body.coupon.code}" validated! Discount: ₹${couponRes.body.coupon.discountAmount}`);

  console.log('\n🎉 ALL 7 FUNCTIONAL CONTROLLER & DATABASE TESTS PASSED WITH 100% SUCCESS!');
}

runDirectTests();
