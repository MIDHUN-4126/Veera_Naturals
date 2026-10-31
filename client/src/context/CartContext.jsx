import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('veera_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('veera_cart', JSON.stringify(cartItems));
    if (isAuthenticated && cartItems.length > 0) {
      axios.post('/api/cart/sync', { items: cartItems }).catch(() => {});
    }
  }, [cartItems, isAuthenticated]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock || 99) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          image: product.images?.[0] || '/marketing/IMG-20260804-WA0013.jpg',
          category: product.category,
          stock: product.stock,
          quantity: Math.min(quantity, product.stock || 99)
        }
      ];
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === productId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    localStorage.removeItem('veera_cart');
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const discount = coupon ? Math.round((subtotal * coupon.discountPercent) / 100) : 0;
  const shipping = subtotal > 499 || subtotal === 0 ? 0 : 50;
  const tax = Math.round((subtotal - discount) * 0.05);
  const totalAmount = Math.max(0, subtotal - discount + shipping + tax);

  const applyCoupon = async (code) => {
    try {
      const res = await axios.post('/api/orders/coupon/validate', { code, cartTotal: subtotal });
      if (res.data.success) {
        setCoupon(res.data.coupon);
        return { success: true, message: `Applied ${res.data.coupon.discountPercent}% OFF!` };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Invalid coupon code'
      };
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItemsCount,
    subtotal,
    discount,
    shipping,
    tax,
    totalAmount,
    coupon,
    applyCoupon,
    removeCoupon
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);
