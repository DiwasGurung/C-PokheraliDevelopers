import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';

interface CartItem {
    id: number;
    bookId: number;
    title: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface CartContextType {
    items: CartItem[];
    loading: boolean;
    error: string | null;
    addToCart: (bookId: number, quantity: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeFromCart: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setItems([]);
            setLoading(false);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const cartData = await cartApi.getCart();
            setItems(cartData.items);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to fetch cart');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (bookId: number, quantity: number) => {
        try {
            setError(null);
            await cartApi.addToCart(bookId, quantity);
            await fetchCart();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to add item to cart');
            throw error;
        }
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
        try {
            setError(null);
            await cartApi.updateCartItem(itemId, quantity);
            await fetchCart();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to update cart item');
            throw error;
        }
    };

    const removeFromCart = async (itemId: number) => {
        try {
            setError(null);
            await cartApi.removeFromCart(itemId);
            await fetchCart();
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to remove item from cart');
            throw error;
        }
    };

    const clearCart = async () => {
        try {
            setError(null);
            await cartApi.clearCart();
            setItems([]);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Failed to clear cart');
            throw error;
        }
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const value = {
        items,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotalItems,
        getTotalPrice,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}; 