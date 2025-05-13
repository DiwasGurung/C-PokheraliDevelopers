import React, { createContext, useState, useContext, useEffect } from 'react';
import { cartService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated()) {
      loadCart();
    } else {
      setCart([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCart();
      setCart(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (bookId, quantity = 1) => {
    try {
      setError(null);
      await cartService.addToCart(bookId, quantity);
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item to cart');
      throw err;
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setError(null);
      await cartService.updateCartItem(itemId, quantity);
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update cart item');
      throw err;
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setError(null);
      await cartService.removeFromCart(itemId);
      await loadCart();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove item from cart');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      setError(null);
      await cartService.clearCart();
      setCart([]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to clear cart');
      throw err;
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    error,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal,
    getCartItemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
