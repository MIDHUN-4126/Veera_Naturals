import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, ShieldCheck, Truck, RefreshCw, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <footer className="bg-forest-950 dark:bg-[#07110c] text-ivory-200 border-t border-forest-800 dark:border-forest-900 transition-colors">
      {/* Ethos Trust Badges — Rendered ONLY on Home Page */}
      {isHome && (
        <div className="border-b border-forest-800 dark:border-forest-900/80 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-forest-900 border border-gold-600/30 flex items-center justify-center text-gold-500">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ivory-100 font-serif">100% Botanical</h4>
              <p className="text-xs text-stone-400">Pure cold-pressed extracts</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-forest-900 border border-gold-600/30 flex items-center justify-center text-gold-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ivory-100 font-serif">Toxin Free</h4>
              <p className="text-xs text-stone-400">Zero parabens or sulphates</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-forest-900 border border-gold-600/30 flex items-center justify-center text-gold-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ivory-100 font-serif">Free Shipping</h4>
              <p className="text-xs text-stone-400">On all orders above ₹499</p>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-full bg-forest-900 border border-gold-600/30 flex items-center justify-center text-gold-500">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ivory-100 font-serif">Cruelty Free</h4>
              <p className="text-xs text-stone-400">Never tested on animals</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-14 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-10">
        
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shadow-md border border-gold-400/40 flex-shrink-0"><img src="/images/logo-emblem.png" alt="Veera Naturals" className="h-full w-full object-contain" onError={(e) => { e.target.src = '/images/logo-white-card.jpg'; }} /></div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-gold-400">Veera Naturals</span>
              <span className="text-[9px] tracking-[0.25em] text-ivory-300 uppercase font-sans font-semibold">Pure Botanical Wellness</span>
            </div>
          </div>
          <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
            Handcrafted with reverence for traditional Ayurvedic formulations and wild-harvested botanicals. Nourish your skin, hair, and spirit the way nature intended.
          </p>
          <div className="text-xs text-stone-400 space-y-2 pt-2">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gold-500 flex-shrink-0" />
              <span>Western Ghats Estate, Coimbatore, Tamil Nadu - 641006</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gold-500 flex-shrink-0" />
              <span>care@veeranaturals.com</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gold-500 flex-shrink-0" />
              <span>+91 98765 43210 (Mon-Sat, 9am - 6pm)</span>
            </p>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold-500 font-sans mb-4">
            Categories
          </h3>
          <ul className="space-y-2.5 text-sm text-stone-300">
            <li><Link to="/shop?category=hair-care" className="hover:text-gold-400 transition-colors">Hair Oils & Serums</Link></li>
            <li><Link to="/shop?category=hair-care" className="hover:text-gold-400 transition-colors">Solid Shampoo Bars</Link></li>
            <li><Link to="/shop?category=skin-care" className="hover:text-gold-400 transition-colors">Kumkumadi Glow Serums</Link></li>
            <li><Link to="/shop?category=skin-care" className="hover:text-gold-400 transition-colors">Rose Water Hydrosols</Link></li>
            <li><Link to="/shop?category=body-care" className="hover:text-gold-400 transition-colors">Shea Butter Body Care</Link></li>
            <li><Link to="/shop?category=essential-oils" className="hover:text-gold-400 transition-colors">Therapeutic Essential Oils</Link></li>
          </ul>
        </div>

        {/* Discovery & Explore */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold-500 font-sans mb-4">
            Discover
          </h3>
          <ul className="space-y-2.5 text-sm text-stone-300">
            <li><Link to="/explore" className="hover:text-gold-400 transition-colors font-semibold text-gold-300">🌿 Our Brand Philosophy</Link></li>
            <li><Link to="/explore#sourcing" className="hover:text-gold-400 transition-colors">Sourcing & Sustainability</Link></li>
            <li><Link to="/shop" className="hover:text-gold-400 transition-colors">All Products</Link></li>
            <li><Link to="/login" className="hover:text-gold-400 transition-colors">Customer Login</Link></li>
            <li><Link to="/signup" className="hover:text-gold-400 transition-colors">Create Account</Link></li>
            <li><Link to="/admin" className="hover:text-gold-400 transition-colors text-gold-400">Admin Portal</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-gold-500 font-sans mb-4">
            Join the Botanical Club
          </h3>
          <p className="text-xs text-stone-400 mb-3">
            Subscribe for exclusive wellness rituals, seasonal harvests, and early access discounts.
          </p>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Your email address"
              className="w-full bg-forest-900 border border-forest-700 text-ivory-100 text-xs px-3 py-2.5 rounded-lg focus:outline-none focus:border-gold-500"
            />
            <button className="w-full bg-gold-500 hover:bg-gold-600 text-forest-950 font-bold text-xs py-2.5 rounded-lg transition-colors">
              Subscribe
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-forest-900 py-6 text-center text-xs text-stone-400 px-4">
        <p className="flex items-center justify-center gap-1">
          © {new Date().getFullYear()} Veera Naturals. Crafted with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for Pure Botanical Wellness. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
