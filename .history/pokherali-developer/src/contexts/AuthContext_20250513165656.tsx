import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
    logout: () => Promise<void>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const userData = await authApi.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const response = await authApi.login({ email, password });
            localStorage.setItem('token', response.token);
            setUser(response.user);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const register = async (email: string, password: string, firstName: string, lastName: string) => {
        try {
            setError(null);
            const response = await authApi.register({ email, password, firstName, lastName });
            localStorage.setItem('token', response.token);
            setUser(response.user);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Registration failed');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    const clearError = () => setError(null);

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 