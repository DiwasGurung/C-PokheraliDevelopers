import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from './UserContext';

// Create the CartContext
export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  
  // Get user from context for authentication
  const { user } = useContext(UserContext);

  // Create an axios instance with auth cookies
  const api = axios.create({
    baseURL: 'https://localhost:7126/api',
    withCredentials: true // Important for sending cookies
  });

  // Add auth token to requests if available
  api.interceptors.request.use(config => {
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  });

  const fetchCartItems = async () => {
    // Don't try to fetch cart if user is not logged in
    if (!user) {
      setCart([]);
      setCartTotal(0);
      setItemCount(0);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Log for debugging
      console.log("Fetching cart with user:", user);
      
      const response = await api.get('/Cart');
      
      if (response.data) {
        setCart(response.data.items || []);
        calculateCartTotal(response.data.items || []);
      }
      
      setError(null);
    } catch (err) {
      console.error("Error fetching cart:", err);
      
      // Don't show errors to user on initial load, just set empty cart
      setCart([]);
      setCartTotal(0);
      setItemCount(0);
      
      // Log detailed error information for debugging
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateCartTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    setCartTotal(total);
    setItemCount(count);
  };

  const addToCart = async (bookId, quantity = 1) => {
    if (!user) {
      setError("Please log in to add items to your cart");
      return false;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post('/Cart/add', {
        bookId,
        quantity
      });
      
      if (response.data) {
        await fetchCartItems(); // Refresh cart after adding item
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error adding to cart:", err);
      
      if (err.response) {
        setError(err.response.data || "Failed to add item to cart");
      } else {
        setError("Failed to add item to cart. Please try again.");
      }
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (cartItemId, quantity) => {
    if (!user) {
      setError("Please log in to update your cart");
      return false;
    }
    
    try {
      setLoading(true);
      
      const response = await api.put(`/Cart/update`, {
        cartItemId,
        quantity
      });
      
      if (response.data) {
        await fetchCartItems(); // Refresh cart after updating
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error updating cart item:", err);
      setError("Failed to update cart. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!user) {
      setError("Please log in to remove items from your cart");
      return false;
    }
    
    try {
      setLoading(true);
      
      const response = await api.delete(`/Cart/remove/${cartItemId}`);
      
      if (response.status === 200) {
        await fetchCartItems(); // Refresh cart after removing item
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError("Failed to remove item from cart. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) {
      setError("Please log in to clear your cart");
      return false;
    }
    
    try {
      setLoading(true);
      
      const response = await api.delete('/Cart/clear');
      
      if (response.status === 200) {
        setCart([]);
        setCartTotal(0);
        setItemCount(0);
        return true;
      }
      
      return false;
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Failed to clear cart. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart when user changes
  useEffect(() => {
    fetchCartItems();
  }, [user]);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        cartTotal,
        itemCount,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        refreshCart: fetchCartItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook for using cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};