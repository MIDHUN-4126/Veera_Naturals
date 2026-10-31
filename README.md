# 🌿 Veera Naturals — Full-Stack MERN E-Commerce & Interactive BI Dashboard

> **Pure Nature, Pure Care.**
> A modern, premium botanical e-commerce platform and real-time Business Intelligence (BI) administrator portal built with the MERN stack.

---

## ✨ Features at a Glance

### 🛍️ Customer Storefront & Exploration
- **Hero & Discovery**: Botanical visual hero, category collections, trust badges, seasonal promotions.
- **Brand Explore Page (`/explore`)**: Deep-dive into Veera Naturals' heritage, ethical Western Ghats wildcrafting, wood-churned cold-pressing, interactive remedy selector, and direct member login integration.
- **Product Catalog & Filters (`/shop`)**: Filter by category (Hair Care, Skin Care, Body Care, Essential Oils), price range slider, real-time search, availability toggles, and sorting options (Bestseller, Price, Rating, Newest).
- **Product Detail View (`/products/:id`)**: Rich photo gallery, botanical ingredient breakdowns, Ayurvedic therapeutic action, verified customer reviews, quantity selectors, and instant Add-to-Cart / Buy-Now workflows.
- **Cart & Promo Engine (`/cart`)**: Real-time quantity adjustments, free shipping threshold calculations (₹499+), coupon validation (`VEERA10` for 10% OFF, `WELCOME20` for 20% OFF), and GST calculations.
- **Checkout & Simulation (`/checkout`)**: Multi-address management, simulated Razorpay / UPI / Card / COD payment flows with instant order generation.
- **Customer Account & Orders (`/profile`)**: Live tracking of orders (Pending ➔ Processing ➔ Shipped ➔ Delivered), profile editing, and order summaries.

### 👑 Interactive Admin BI Dashboard (`/admin`)
- **Direct Database Integration**: Directly aggregated from MongoDB / server store without hardcoded statistics.
- **Executive KPI Cards**: Total Paid Revenue (with % month-over-month trend), Total Order Volume, Registered Customers Count, Low-Stock Inventory Alerts, Total Inventory Value.
- **Interactive Visualizations (Recharts)**:
  - **Revenue Trajectory Area Chart**: Monthly sales trend.
  - **Category Sales Donut Chart**: Proportional revenue across botanical lines.
  - **Top Formulations Leaderboard**: Best-selling remedies ranked by units sold and revenue.
  - **Low Stock Reorder Alerts**: Real-time inventory threshold detection.
- **Full Operational Modification Capabilities ("Admin can modify anything")**:
  - **📦 Product Management**: Create new remedies, update prices, MRP, inventory stock, categories, descriptions, or delete products.
  - **🛒 Order Fulfillment**: Inspect all customer orders, switch statuses (Pending, Processing, Shipped, Delivered, Cancelled) with a single click.
  - **👥 Users Database & RBAC**: View all registered users, promote customers to Admin or demote, delete accounts.
  - **🏷️ Promotions & Coupons**: Create custom promotional discount codes with minimum order values, view and delete existing coupons.

---

## 🔐 Demo Credentials

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@veeranaturals.com` | `Admin@Veera2026` | Full Access + BI Dashboard (`/admin`) |
| **Customer** | `customer@veeranaturals.com` | `Customer@123` | Storefront, Cart, Checkout, Profile |

*(Convenient 1-click test login buttons are also provided directly on the Login page).*

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Recharts, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), bcryptjs, Morgan, CORS, Multer
- **Database**: MongoDB (via Mongoose) with an automatic resilient local embedded JSON engine fallback (`server/data/store.json`) for seamless offline execution.

---

## 🚀 Quick Start Guide

### 1. Unified Full-Stack Server (Production Build)
```bash
# Start backend server on port 5000 (serves both API & Frontend SPA)
npm start
```
Open **[http://localhost:5000](http://localhost:5000)** in your browser!

### 2. Development Mode
To run client with Vite Hot-Module-Replacement (HMR):
```bash
# Terminal 1: Backend Server
npm run server

# Terminal 2: Vite Dev Server
npm run client
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

### 3. Re-seeding Initial Data
```bash
npm run seed
```

---

## 📁 Repository Structure

```
Veera Naturals/
├── client/                     # React Frontend
│   ├── public/
│   │   └── marketing/          # Botanical logos, banners & product imagery
│   ├── src/
│   │   ├── components/         # Navbar, Footer
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── ProductsPage.jsx
│   │   │   ├── ProductDetailPage.jsx
│   │   │   ├── CartPage.jsx
│   │   │   ├── CheckoutPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── admin/
│   │   │       └── AdminDashboard.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── server/                     # Express.js Backend
│   ├── config/                 # Database connection (MongoDB + fallback)
│   ├── controllers/            # Auth, Products, Orders, Cart, Admin BI
│   ├── middleware/             # JWT Protect & AdminOnly RBAC
│   ├── models/                 # Mongoose Schemas (User, Product, Order)
│   ├── routes/                 # Express API Endpoints
│   ├── seed/                   # Database Seeder
│   ├── data/                   # Embedded Data Store (store.json)
│   ├── server.js               # Express entrypoint
│   └── package.json
│
└── package.json                # Root automation scripts
```
>>>>>>> 817649b (feat: complete Veera Naturals full-stack platform with executive BI admin dashboard, brand logo integration, and Keshroot marketing campaign)
