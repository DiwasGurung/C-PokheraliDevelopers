import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create Context
export const CartContext = createContext();

// Provide context to children
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart items from API
  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setCartItems([]);
        setIsLoading(false);
        return;
      }

      const response = await axios.get('https://localhost:7126/api/Cart');
      
      setCartItems(response.data.items || []);
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Error fetching cart items');
      setIsLoading(false);
    }
  };

  // Add item to cart
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

      const response = await axios.post('https://localhost:7126/api/Cart/add', data);
      
      // Update local cart state
      fetchCartItems();
      return response.data;
    } catch (err) {
      setError(err.message || 'Error adding item to cart');
      throw err;
    }
  };

  const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    // Ensure `quantity` is a valid positive number and `cartItemId` is provided
    if (quantity <= 0) {
      alert("Quantity must be a positive number.");
      return;
    }

    // Sending the correct data format to backend
    const response = await axios.put(
      `https://localhost:7126/api/Cart/update/${cartItemId}`,
      { quantity: quantity }
    );
    console.log("Cart item updated:", response.data);
  } catch (err) {
    console.error("Error updating cart item:", err);
    alert("Failed to update cart item.");
  }
};



  // Remove item from cart
  const removeItem = async (cartItemId) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User is not logged in');
      }

      await axios.delete(`https://localhost:7126/api/Cart/remove/${cartItemId}`);

      // Refresh cart after successful removal
      fetchCartItems();
    } catch (err) {
      setError(err.message || 'Error removing item from cart');
    }
  };

  // Clear the cart
  const clearCart = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        throw new Error('User is not logged in');
      }

      await axios.delete('https://localhost:7126/api/Cart/clear');
      
      // Update local state
      setCartItems([]);
    } catch (err) {
      setError(err.message || 'Error clearing cart');
      throw err;
    }
  };

  // Fetch cart items when the component is mounted
  useEffect(() => {
    fetchCartItems();
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      isLoading,
      error,
      addToCart,
      removeItem,
      updateCartItemQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use Cart Context
export const useCart = () => {
  return useContext(CartContext);
};
