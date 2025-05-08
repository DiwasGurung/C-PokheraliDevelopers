import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create Context
export const CartContext = createContext();

// Provide context to children
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setCartItems([]);
        setIsLoading(false);
        return;
      }
  
      // Call the correct endpoint as defined in your CartController
      const response = await axios.get('https://localhost:7126/api/Cart');
      
      setCartItems(response.data.items || []);
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching cart items');
      setIsLoading(false);
    }
  };

  const addToCart = async ({bookId, quantity}) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User is not logged in');
      }
      
      const data = {
        bookId: bookId,
        quantity: quantity,
      };
      
      const response = await axios.post(
        'https://localhost:7126/api/Cart/add',
        data
  
      );
      
      // Update local cart state
      fetchCartItems();
      return response.data;
    } catch (err) {
      setError(err.message || 'Error adding item to cart');
      throw err;
    }
  };

  // Update cart item quantity
  const updateCartItemQuantity = async (cartItemId, quantity) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User is not logged in');
      }

      // Handle removing item if quantity is 0 or less
      if (quantity <= 0) {
        return removeItem(cartItemId);
      }
      
      // Use the update endpoint from your controller
      await axios.put(
        'https://localhost:7126/api/Cart/update',
        {
          cartItemId: cartItemId,
          quantity: quantity
        },
      
      );
      
      // Refresh cart after successful update
      fetchCartItems();
    } catch (err) {
      setError(err.message || 'Error updating item quantity');
      throw err;
    }
  };
  

  const removeItem = async (cartItemId) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User is not logged in');
      }
  
      // Per your API, the endpoint should be api/Cart/{cartItemId}
      await axios.delete(
        `https://localhost:7126/api/Cart/${cartItemId}`
      );
  
      // Refresh cart after successful removal
      fetchCartItems();
    } catch (err) {
      setError(err.message || 'Error removing item from cart');
    }
  };
  // Update your CartContext.js file with the following clearCart function

const clearCart = async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      throw new Error('User is not logged in');
    }

    // Call the clear cart endpoint
    await axios.delete('https://localhost:7126/api/Cart/clear', {
      withCredentials: true
    });

    // Update local state
    setCartItems([]);
  } catch (err) {
    setError(err.message || 'Error clearing cart');
    throw err;
  }
};
useEffect(() => {
  fetchCartItems();
}, []);

// Then make sure to include clearCart in your context value
return (
  <CartContext.Provider value={{ 
    cartItems, 
    isLoading, 
    error, 
    addToCart, 
    removeItem,
    updateCartItemQuantity,
    clearCart // Add this
  }}>
    {children}
  </CartContext.Provider>
);

}
// Custom hook to use Cart Context
export const useCart = () => {
  return useContext(CartContext);
};
