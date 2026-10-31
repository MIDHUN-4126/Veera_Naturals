import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, LogOut, LayoutDashboard, Search, Menu, X, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Shop All', path: '/shop' },
    { name: 'Hair Care', path: '/shop?category=hair-care' },
    { name: 'Skin Care', path: '/shop?category=skin-care' },
    { name: 'Essential Oils', path: '/shop?category=essential-oils' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-forest-900/95 backdrop-blur-md text-white border-b border-forest-800 shadow-md transition-all">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 text-gold-300 text-xs py-1.5 px-4 text-center border-b border-forest-800 font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-gold-500 animate-pulse" />
        <span>Use code <strong>VEERA10</strong> for 10% OFF on all handcrafted botanical formulations | Free shipping above ₹499</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3.5 group py-1">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-md group-hover:bg-gold-500/35 transition-all"></div>
              <img 
                src="/images/logo-emblem.png" 
                alt="Veera Naturals" 
                className="h-11 w-auto object-contain relative z-10 drop-shadow-md group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.src = '/marketing/image3.png';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold tracking-tight text-gold-400 group-hover:text-gold-200 transition-colors leading-tight">
                Veera Naturals
              </span>
              <span className="text-[9px] tracking-[0.28em] text-ivory-200 uppercase font-sans font-semibold">
                Pure Botanical Wellness
              </span>
            </div>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search herbal hair oil, kumkumadi, rose water..."
              className="w-full bg-forest-950/70 text-ivory-100 placeholder-stone-400 text-sm rounded-full pl-11 pr-4 py-2.5 border border-forest-700 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 transition-all"
            />
            <Search className="w-4 h-4 text-gold-500 absolute left-4 pointer-events-none" />
          </form>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname + location.search === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-gold-400 relative py-1 ${
                    isActive ? 'text-gold-400 font-semibold' : 'text-ivory-200'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4">
            
            {/* Admin BI Dashboard Quick Button */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1.5 bg-gold-500 hover:bg-gold-600 text-forest-950 text-xs font-bold px-3 py-2 rounded-lg shadow transition-all hover:scale-105"
                title="Open Admin BI Dashboard"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>BI Dashboard</span>
              </Link>
            )}

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="relative p-2 text-ivory-100 hover:text-gold-400 transition-colors"
              title="View Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-terracotta-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth Actions */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-forest-700 hover:border-gold-500 transition-colors"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover bg-forest-800"
                  />
                  <span className="hidden xl:inline text-xs font-medium text-ivory-200 max-w-[100px] truncate">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-3 w-56 bg-white text-stone-800 rounded-xl shadow-xl py-2 border border-stone-200 z-50 animate-in fade-in"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs text-stone-500">Signed in as</p>
                      <p className="text-sm font-bold text-forest-900 truncate">{user.name}</p>
                      <span className={`inline-block text-[10px] uppercase font-bold px-2 py-0.5 mt-1 rounded-full ${
                        isAdmin ? 'bg-gold-100 text-gold-700' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {user.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-forest-900 hover:bg-forest-50 font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gold-600" />
                        Admin BI Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                    >
                      <User className="w-4 h-4 text-stone-500" />
                      My Profile & Orders
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left border-t border-stone-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-ivory-200 hover:text-gold-400 px-3 py-2 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-gold-500 hover:bg-gold-600 text-forest-950 text-xs sm:text-sm font-bold px-4 py-2 rounded-full transition-all hover:shadow-md"
                >
                  Join Us
                </Link>
              </div>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-ivory-100 hover:text-gold-400"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-forest-950 border-t border-forest-800 px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search botanical remedies..."
              className="w-full bg-forest-900 text-ivory-100 placeholder-stone-400 text-sm rounded-lg px-4 py-2 border border-forest-700"
            />
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-ivory-200 hover:text-gold-400 py-1.5"
            >
              {link.name}
            </Link>
          ))}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-gold-400 font-bold text-sm py-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin BI Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
